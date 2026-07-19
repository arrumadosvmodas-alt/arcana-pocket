import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID, computeStaminaRegen } from "@/lib/player";
import { FREE_PACK_INTERVAL_HOURS } from "@/lib/engine/cards";

export async function GET() {
  const wallet = await prisma.wallet.findUnique({ where: { profileId: LOCAL_PROFILE_ID } });
  const profile = await prisma.profile.findUnique({ where: { id: LOCAL_PROFILE_ID } });

  if (!wallet || !profile) {
    return NextResponse.json({ error: "Perfil local não encontrado. Rode o seed." }, { status: 404 });
  }

  const regen = computeStaminaRegen(wallet);
  if (regen.stamina !== wallet.stamina) {
    await prisma.wallet.update({
      where: { profileId: LOCAL_PROFILE_ID },
      data: { stamina: regen.stamina, staminaUpdatedAt: regen.staminaUpdatedAt },
    });
  }

  const nextPackAt =
    regen.stamina >= wallet.maxStamina
      ? null
      : new Date(regen.staminaUpdatedAt.getTime() + FREE_PACK_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    displayName: profile.displayName,
    coins: wallet.coins,
    gems: wallet.gems,
    stamina: regen.stamina,
    maxStamina: wallet.maxStamina,
    nextPackAt,
  });
}
