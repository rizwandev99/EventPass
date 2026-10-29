import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getGuestIdFromRequest } from "@/lib/session/guest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guestId = getGuestIdFromRequest(request);

    if (!guestId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Ticket not found or unauthorized",
            details: {},
          },
        },
        { status: 404 }
      );
    }

    let ticket: any = null;
    try {
      ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          event: true,
          order: true,
        },
      });
    } catch (e) {
      ticket = null;
    }

    // Ownership isolation check (AC-F2-2 & AC-F6-1)
    if (!ticket || ticket.guestId !== guestId) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Ticket not found",
            details: {},
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to fetch ticket",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
