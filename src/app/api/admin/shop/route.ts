import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const packages = await prisma.shopPackage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(packages);
}
