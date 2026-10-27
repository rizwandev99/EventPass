import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  let dbStatus = "unconfigured";

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes("user:password") && !dbUrl.includes("sample")) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }
  } else {
    dbStatus = "mock_configured";
  }

  return NextResponse.json({
    status: "ok",
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
