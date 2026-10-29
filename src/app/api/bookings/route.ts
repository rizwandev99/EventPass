import { NextRequest, NextResponse } from "next/server";
import { handleCreateOrder } from "@/lib/domain/booking";
import { prisma } from "@/server/db";
import { getGuestIdFromRequest } from "@/lib/session/guest";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleCreateOrder(request);
}

export async function GET(request: NextRequest) {
  try {
    const guestId = getGuestIdFromRequest(request);
    if (!guestId) {
      return NextResponse.json({ bookings: [] });
    }
    const tickets = await prisma.ticket
      .findMany({
        where: { guestId },
        include: { event: true },
      })
      .catch(() => []);
    return NextResponse.json({ bookings: tickets });
  } catch (e: any) {
    return NextResponse.json({ bookings: [] });
  }
}
