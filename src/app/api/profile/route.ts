import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeStaminaRegen } from "@/lib/player";
import { FREE_PACK_INTERVAL_HOURS } from "@/lib/engine/cards";
import { getProfileIdFromRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  let profile = await prisma.profile.findUnique({ where: { id: profileId } });
  let wallet = await prisma.wallet.findUnique({ where: { profileId } });

  // Auto-create profile and wallet if not found
  if (!profile || !wallet) {
    let email = "";
    let displayName = "Treinador Arcana";
    try {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          email = user.email || "";
          displayName = user.user_metadata?.displayName || user.email?.split("@")[0] || "Treinador Arcana";
        }
      }
    } catch (err) {
      console.error("Auto-profile resolution error:", err);
    }

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: profileId,
          displayName,
          role: email === "hslspe@hotmail.com" ? "ADMIN" : "USER",
        },
      });
    }

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          profileId,
          coins: 500,
          gems: 50,
          stamina: 6,
          maxStamina: 6,
        },
      });
    }

    // Seed starter cards and deck if collection is empty
    const ownedCount = await prisma.playerCard.count({ where: { profileId } });
    if (ownedCount === 0) {
      const startingCards = await prisma.cardDefinition.findMany({
        where: { rarity: "COMMON" },
        take: 15,
      });

      if (startingCards.length > 0) {
        for (const card of startingCards) {
          await prisma.playerCard.create({
            data: {
              profileId,
              cardDefinitionId: card.id,
              quantity: 2,
            },
          });
        }

        const deck = await prisma.deck.create({
          data: {
            profileId,
            name: "Baralho Inicial 🃏",
          },
        });

        for (const card of startingCards) {
          await prisma.deckCard.create({
            data: {
              deckId: deck.id,
              cardDefinitionId: card.id,
              quantity: 1,
            },
          });
        }
      }
    }
  }

  // Detect admin promotion based on email from Supabase getUser auth JWT
  let currentRole = profile.role;
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user && user.email === "hslspe@hotmail.com" && currentRole !== "ADMIN") {
        await prisma.profile.update({
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
