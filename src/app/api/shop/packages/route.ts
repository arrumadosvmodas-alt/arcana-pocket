import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const packages = await prisma.shopPackage.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(packages);
}
