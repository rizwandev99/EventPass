import { NextResponse } from "next/server";
import { resetAndSeedDatabase } from "@/server/seed-service";

export async function POST() {
  try {
    const result = await resetAndSeedDatabase();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset and seed database";
    console.error("Failed to reset and seed database:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RESET_FAILED",
          message,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
