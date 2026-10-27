import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    let tickets: any[] = [];
    try {
      tickets = await prisma.ticket.findMany({
        where: { eventId },
        select: {
          code: true,
          id: true,
          tierId: true,
          attendeeName: true,
          status: true,
          usedAt: true,
        },
      });
    } catch (e) {
      tickets = [];
    }

    const pack = tickets.map((t) => ({
      code: t.code,
      ticketId: t.id,
      tierName: t.tierId,
      attendeeName: t.attendeeName,
      status: t.status,
      usedAt: t.usedAt,
    }));

    return NextResponse.json({
      eventId,
      downloadedAt: new Date().toISOString(),
      tickets: pack,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to download offline pack",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
