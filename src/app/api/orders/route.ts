import { NextRequest } from "next/server";
import { handleCreateOrder } from "@/lib/domain/booking";

export async function POST(request: NextRequest) {
  return handleCreateOrder(request);
}
