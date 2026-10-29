import { NextRequest, NextResponse } from "next/server";
import { handleChatRequest } from "@/lib/domain/assistant";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleChatRequest(request);
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "EventPass AI Assistant",
    model: "gemini-1.5-flash",
  });
}
