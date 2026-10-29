import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma, isPlaceholderDb } from "@/server/db";
import { z } from "zod";
import { generateGuestId, createGuestCookieHeader, getGuestIdFromRequest } from "@/lib/session/guest";

import { calculateOrderTotal } from "./order-calc";
export { calculateOrderTotal };

export function generateTicketCode(
  ticketId: string,
  eventId: string,
  secret: string = process.env.TICKET_SIGNING_SECRET || "default_test_secret_for_ticket_signing_128bits"
): string {
  const data = `${ticketId}:${eventId}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const signature = hmac.substring(0, 16);
  return `EP1.${ticketId}.${signature}`;
}

export function verifyTicketCode(
  code: string,
  eventId: string,
  secret: string = process.env.TICKET_SIGNING_SECRET || "default_test_secret_for_ticket_signing_128bits"
): { valid: boolean; ticketId?: string } {
  if (!code || typeof code !== "string") return { valid: false };
  const parts = code.split(".");
  if (parts.length !== 3) return { valid: false };

  const [prefix, ticketId, signature] = parts;
  if (prefix !== "EP1" || !ticketId || !signature || signature.length !== 16) {
    return { valid: false };
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${ticketId}:${eventId}`)
    .digest("base64url")
    .substring(0, 16);

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length) {
    return { valid: false };
  }

  const match = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  return { valid: match, ticketId: match ? ticketId : undefined };
}

export const orderSchema = z.object({
  eventId: z.string().min(1),
  attendeeName: z.string().trim().min(1).max(60),
  items: z
    .array(
      z.object({
        tierId: z.string().min(1),
        quantity: z.number().int().positive().max(10),
      })
    )
    .min(1),
  simulate: z.enum(["fail", "success"]).optional(),
});

export async function handleCreateOrder(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = orderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid booking request parameters",
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { eventId, attendeeName, items, simulate } = parseResult.data;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    // Guest identity handling
    let guestId = getGuestIdFromRequest(request);
    let newGuestHeader: string | null = null;
    if (!guestId) {
      guestId = generateGuestId();
      newGuestHeader = createGuestCookieHeader(guestId);
    }

    // Payment simulation check (AC-F5-7)
    if (simulate === "fail") {
      return NextResponse.json(
        {
          error: {
            code: "PAYMENT_FAILED",
            message: "Simulated payment failure requested by demo client",
            details: {},
          },
        },
        { status: 402 }
      );
    }

    // Total quantity limit check (max 10 total)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 10) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Maximum 10 tickets per order allowed",
            details: {},
          },
        },
        { status: 400 }
      );
    }

    // Database atomic transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Verify event is published and not ended
        const event = await tx.event.findUnique({
          where: { id: eventId },
          include: { tiers: true },
        });

        if (!event || event.status === "CANCELLED" || event.endsAt < new Date()) {
          throw { status: 409, code: "EVENT_NOT_BOOKABLE", message: "Event is cancelled or has ended" };
        }

        // Lazy guest creation if not exists
        await tx.guest.upsert({
          where: { id: guestId! },
          update: {},
          create: { id: guestId! },
        });

        let totalPaise = 0;
        const tierMap = new Map(event.tiers.map((t) => [t.id, t]));

        // Capacity and tier validation
        for (const item of items) {
          const tier = tierMap.get(item.tierId);
          if (!tier) {
            throw { status: 400, code: "VALIDATION_ERROR", message: "Tier does not belong to this event" };
          }
          if (item.quantity > tier.maxPerOrder) {
            throw { status: 400, code: "VALIDATION_ERROR", message: `Max ${tier.maxPerOrder} tickets allowed for ${tier.name}` };
          }
          if (tier.sold + item.quantity > tier.capacity) {
            const remaining = Math.max(0, tier.capacity - tier.sold);
            throw { status: 409, code: "SOLD_OUT", message: `Only ${remaining} tickets left for ${tier.name}.` };
          }

          totalPaise += tier.pricePaise * item.quantity;
        }

        // Atomically increment sold count on each tier
        for (const item of items) {
          await tx.ticketTier.update({
            where: { id: item.tierId },
            data: { sold: { increment: item.quantity } },
          });
        }

        // Create Order
        const paymentRef = `FAKE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const order = await tx.order.create({
          data: {
            guestId: guestId!,
            eventId,
            attendeeName,
            totalPaise,
            paymentRef,
            status: "CONFIRMED",
          },
        });

        // Create Tickets with HMAC signed codes
        const createdTickets = [];
        for (const item of items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const code = generateTicketCode(ticketId, eventId);
            const ticket = await tx.ticket.create({
              data: {
                id: ticketId,
                orderId: order.id,
                eventId,
                tierId: item.tierId,
                guestId: guestId!,
                attendeeName,
                code,
                status: "VALID",
              },
            });
            createdTickets.push({
              ...ticket,
              event: {
                id: event.id,
                slug: event.slug,
                title: event.title,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                venueName: event.venueName,
                city: event.city,
                status: event.status,
                coverSeed: event.coverSeed,
                category: event.category,
              },
            });
          }
        }

        return { order, tickets: createdTickets };
      });

      const response = NextResponse.json(result, { status: 201 });
      if (newGuestHeader) {
        response.headers.set("Set-Cookie", newGuestHeader);
        response.cookies.set("eventpass_guest", guestId!, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 31536000,
        });
      }
      return response;
    } catch (txErr: any) {
      if (txErr.status && txErr.code) {
        return NextResponse.json(
          {
            error: {
              code: txErr.code,
              message: txErr.message,
              details: {},
            },
          },
          { status: txErr.status }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: "INTERNAL",
            message: txErr.message || "Failed to process booking transaction",
            details: {},
          },
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: err.message || "Failed to process booking",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
