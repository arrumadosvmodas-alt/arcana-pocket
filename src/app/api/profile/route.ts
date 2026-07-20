import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeStaminaRegen } from "@/lib/player";
import { FREE_PACK_INTERVAL_HOURS } from "@/lib/engine/cards";
import { getProfileIdFromRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  const wallet = await prisma.wallet.findUnique({ where: { profileId } });
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });

  if (!wallet || !profile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  // Detect admin promotion based on email from Supabase getUser auth JWT
  let currentRole = profile.role;
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user && user.email === "hslspe@hotmail.com" && currentRole !== "ADMIN") {
        const updated = await prisma.profile.update({
          where: { id: profileId },
          data: { role: "ADMIN" },
        });
        currentRole = "ADMIN";
      }
    }
  } catch (err) {
    console.error("Admin promotion check error:", err);
  }

  const regen = computeStaminaRegen(wallet);
  if (regen.stamina !== wallet.stamina) {
    await prisma.wallet.update({
      where: { profileId },
      data: { stamina: regen.stamina, staminaUpdatedAt: regen.staminaUpdatedAt },
    });
  }

  const nextPackAt =
    regen.stamina >= wallet.maxStamina
      ? null
      : new Date(regen.staminaUpdatedAt.getTime() + FREE_PACK_INTERVAL_HOURS * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    displayName: profile.displayName,
    role: currentRole,
    coins: wallet.coins,
    gems: wallet.gems,
    stamina: regen.stamina,
    maxStamina: wallet.maxStamina,
    nextPackAt,
  });
}
