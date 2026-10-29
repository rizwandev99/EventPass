import { NextRequest } from "next/server";
import { POST as ordersPost } from "@/app/api/orders/route";
import { GET as ticketsGet } from "@/app/api/tickets/route";

export async function POST(request: NextRequest) {
  return ordersPost(request);
}

export async function GET(request: NextRequest) {
  return ticketsGet(request);
}
