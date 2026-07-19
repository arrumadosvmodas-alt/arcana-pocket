import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const missions = await prisma.mission.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(missions);
}
