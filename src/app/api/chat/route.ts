import { NextRequest } from "next/server";
import { handleChatRequest } from "@/lib/domain/assistant";

export async function POST(request: NextRequest) {
  return handleChatRequest(request);
}
