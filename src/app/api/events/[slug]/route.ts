import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let event: any = null;
    try {
      event = await prisma.event.findUnique({
        where: { slug },
        include: {
          tiers: {
            orderBy: { pricePaise: "asc" },
          },
        },
      });
    } catch (e) {
      event = null;
    }

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Event with slug '${slug}' not found`,
            details: {},
          },
        },
        { status: 404 }
      );
    }

    // Attach dynamic live remaining counts per tier
    const eventWithAvailability = {
      ...event,
      tiers: event.tiers.map((t: any) => ({
        ...t,
        remaining: Math.max(0, t.capacity - t.sold),
      })),
    };

    return NextResponse.json(eventWithAvailability);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to fetch event detail",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
