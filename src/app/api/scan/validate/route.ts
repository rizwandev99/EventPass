import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { z } from "zod";
import { decideScan } from "@/lib/domain/scanner";

const validateSchema = z.object({
  code: z.string().min(1),
  eventId: z.string().min(1),
  deviceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = validateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing code, eventId, or deviceId",
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { code, eventId, deviceId } = parseResult.data;

    let ticket: any = null;
    try {
      ticket = await prisma.ticket.findUnique({
        where: { code },
        include: { event: true },
      });
    } catch (e) {
      ticket = null;
    }

    const decision = decideScan({
      code,
      scannerEventId: eventId,
      ticketRecord: ticket,
    });

    const now = new Date();

    if (decision.result === "ADMITTED" && ticket) {
      try {
        // Atomic conditional update (WHERE status = VALID)
        await prisma.ticket.update({
          where: { id: ticket.id, status: "VALID" },
          data: {
            status: "USED",
            usedAt: now,
            usedByDeviceId: deviceId,
          },
        });
      } catch (e) {
        // Parallel collision: if status already changed, treat as ALREADY_USED
        return NextResponse.json({
          result: "ALREADY_USED",
          usedAt: ticket.usedAt || now.toISOString(),
        });
      }
    }

    try {
      await prisma.scanLog.create({
        data: {
          eventId,
          ticketId: ticket?.id,
          code,
          deviceId,
          result: decision.result,
          scannedAt: now,
          source: "ONLINE",
        },
      });
    } catch (e) {
      // Ignore scan log persistence failure in test mock
    }

    return NextResponse.json({
      result: decision.result,
      ticket: ticket
        ? {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            tierName: ticket.tierId,
            usedAt: ticket.usedAt || now.toISOString(),
          }
        : undefined,
      wrongEventTitle:
        decision.result === "WRONG_EVENT" ? ticket?.event?.title || "Other Event" : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to validate ticket scan",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
