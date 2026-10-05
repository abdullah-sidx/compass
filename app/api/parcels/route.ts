import { NextResponse } from "next/server";
import { getParcels } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || undefined;
  const project = searchParams.get("project") || undefined;
  const status = searchParams.get("status") || undefined;

  const parcels = getParcels({ state, project, status });
  return NextResponse.json(parcels);
}
