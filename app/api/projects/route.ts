import { NextResponse } from "next/server";
import { getProjects } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || undefined;
  const sector = searchParams.get("sector") || undefined;
  const riskLevel = searchParams.get("riskLevel") || undefined;

  const projects = getProjects({ state, sector, riskLevel });
  return NextResponse.json(projects);
}
