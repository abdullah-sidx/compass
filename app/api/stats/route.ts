import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || undefined;

  const stats = getStats(state);
  return NextResponse.json(stats);
}
