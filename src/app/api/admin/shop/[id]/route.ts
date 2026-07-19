import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const updateSchema = z.object({ isActive: z.boolean() });

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isActive } = updateSchema.parse(await _req.json());

  const pkg = await prisma.shopPackage.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json(pkg);
}
