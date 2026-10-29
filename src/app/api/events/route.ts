import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { resetAndSeedDatabase } from "@/server/seed-service";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().optional(),
  category: z.enum(["MUSIC", "TECH", "SPORTS", "COMEDY", "FOOD", "ART"]).optional(),
  city: z.string().optional(),
  date: z.enum(["today", "this_weekend", "next_7_days", "next_30_days", "any"]).optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(["soonest", "price_asc"]).default("soonest"),
  includePast: z.enum(["true", "false"]).default("false"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = querySchema.safeParse(searchParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters provided",
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { q, category, city, date, maxPrice, sort, includePast, cursor, limit } = parseResult.data;

    const now = new Date();
    const where: any = {};

    // Past events filter
    if (includePast !== "true") {
      where.endsAt = { gte: now };
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // City filter
    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    // Search query
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { venueName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (date && date !== "any") {
      if (date === "today") {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        where.startsAt = { gte: now, lte: endOfDay };
      } else if (date === "this_weekend") {
        const saturday = new Date();
        saturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
        saturday.setHours(0, 0, 0, 0);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        sunday.setHours(23, 59, 59, 999);
        where.startsAt = { gte: saturday, lte: sunday };
      } else if (date === "next_7_days") {
        const next7 = new Date(now.getTime() + 7 * 86400000);
        where.startsAt = { gte: now, lte: next7 };
      } else if (date === "next_30_days") {
        const next30 = new Date(now.getTime() + 30 * 86400000);
        where.startsAt = { gte: now, lte: next30 };
      }
    }

    let orderBy: any = { startsAt: "asc" };
    if (sort === "price_asc") {
      // Prisma relations sorting: default to startsAt asc for stable cursor
      orderBy = [{ startsAt: "asc" }, { id: "asc" }];
    }

    let events: any[] = [];
    try {
      events = await prisma.event.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy,
        include: {
          tiers: {
            select: {
              id: true,
              name: true,
              pricePaise: true,
              capacity: true,
              sold: true,
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn("Database query failed, attempting auto-seed initialization:", dbErr);
      try {
        await resetAndSeedDatabase();
        events = await prisma.event.findMany({
          where,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          skip: cursor ? 1 : 0,
          orderBy,
          include: {
            tiers: {
              select: {
                id: true,
                name: true,
                pricePaise: true,
                capacity: true,
                sold: true,
              },
            },
          },
        });
      } catch (seedErr) {
        console.error("Auto-seed failed:", seedErr);
        events = [];
      }
    }

    // If initial default view has 0 events and no search filters, check if DB is empty and auto-seed
    if (
      events.length === 0 &&
      !q &&
      !category &&
      !city &&
      (!date || date === "any") &&
      maxPrice === undefined &&
      !cursor
    ) {
      try {
        const total = await prisma.event.count();
        if (total === 0) {
          await resetAndSeedDatabase();
          events = await prisma.event.findMany({
            where,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy,
            include: {
              tiers: {
                select: {
                  id: true,
                  name: true,
                  pricePaise: true,
                  capacity: true,
                  sold: true,
                },
              },
            },
          });
        }
      } catch (checkErr) {
        console.warn("Initial empty seed check warning:", checkErr);
      }
    }

    // Filter by maxPrice in memory if requested
    if (maxPrice !== undefined) {
      events = events.filter((e) => {
        if (!e.tiers || e.tiers.length === 0) return false;
        const lowestPaise = Math.min(...e.tiers.map((t: any) => t.pricePaise));
        return lowestPaise <= maxPrice;
      });
    }

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      items,
      nextCursor,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: error.message || "Failed to fetch events",
          details: {},
        },
      },
      { status: 500 }
    );
  }
}
