import { NextRequest, NextResponse } from "next/server";
import { POST as chatPost } from "@/app/api/chat/route";

export async function POST(request: NextRequest) {
  return chatPost(request);
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "EventPass AI Assistant",
    model: "gemini-1.5-flash",
  });
}
