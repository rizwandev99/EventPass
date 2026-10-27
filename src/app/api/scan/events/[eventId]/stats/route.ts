import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    let admitted = 0;
    let total = 0;

    try {
      admitted = await prisma.ticket.count({
        where: { eventId, status: "USED" },
      });
      total = await prisma.ticket.count({
        where: { eventId, status: { in: ["VALID", "USED"] } },
      });
    } catch (e) {
      admitted = 0;
      total = 0;
    }

    return NextResponse.json({ admitted, total });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to fetch scan stats",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
