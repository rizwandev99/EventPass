import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { parseGuestCookie } from "../../../../tests/integration/f2-guest-session.test";

export async function GET(request: NextRequest) {
  try {
    const guestId = parseGuestCookie(request.headers.get("cookie"));

    if (!guestId) {
      return NextResponse.json({ tickets: [] });
    }

    let tickets: any[] = [];
    try {
      tickets = await prisma.ticket.findMany({
        where: { guestId },
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              title: true,
              startsAt: true,
              endsAt: true,
              venueName: true,
              city: true,
              status: true,
              coverSeed: true,
              category: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
              totalPaise: true,
            },
          },
        },
        orderBy: {
          event: {
            startsAt: "asc",
          },
        },
      });
    } catch (e) {
      tickets = [];
    }

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to fetch tickets",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
