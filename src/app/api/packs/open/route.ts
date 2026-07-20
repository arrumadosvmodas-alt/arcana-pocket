import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { computeStaminaRegen } from "@/lib/player";
import { drawPack } from "@/lib/engine/packs";
import { incrementMissionProgress } from "@/lib/missions";
import { getProfileIdFromRequest } from "@/lib/auth";
import type { CardDefinition, PlayerCard } from "@prisma/client";

export async function POST(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { profileId } });
      if (!wallet) throw new Error("NO_PROFILE");

      const regen = computeStaminaRegen(wallet);
      if (regen.stamina < 1) throw new Error("NO_STAMINA");

      const catalog = await tx.cardDefinition.findMany({ select: { id: true, rarity: true } });
      const seed = randomUUID();
      const drawnIds = drawPack(
        catalog.map((c) => ({ id: c.id, rarity: c.rarity as "COMMON" | "RARE" | "EPIC" })),
        seed
      );

      const counts = new Map<string, number>();
      for (const id of drawnIds) counts.set(id, (counts.get(id) ?? 0) + 1);

      for (const [cardDefinitionId, quantity] of counts) {
        await tx.playerCard.upsert({
          where: { profileId_cardDefinitionId: { profileId, cardDefinitionId } },
          update: { quantity: { increment: quantity } },
          create: { profileId, cardDefinitionId, quantity },
        });
      }

      await tx.wallet.update({
        where: { profileId },
        data: { stamina: regen.stamina - 1, staminaUpdatedAt: regen.staminaUpdatedAt },
      });

      await tx.packOpening.create({
        data: { profileId, seed, cardIds: JSON.stringify(drawnIds) },
      });

      const cards = await tx.cardDefinition.findMany({ where: { id: { in: drawnIds } } });
      
      // Load user upgrades to display correct stats on new cards
      const playerCards = await tx.playerCard.findMany({ where: { profileId, cardDefinitionId: { in: drawnIds } } });
      const pcMap = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc]));

      const cardsById = new Map(cards.map((c: CardDefinition) => [c.id, c]));
      const orderedCards = drawnIds.map((id) => {
        const base = cardsById.get(id)!;
        const pc = pcMap.get(id);
        const upgradeAttack = pc?.upgradeAttack ?? 0;
        const upgradeHealth = pc?.upgradeHealth ?? 0;
        return {
          ...base,
          attack: base.attack + upgradeAttack,
          health: base.health + upgradeHealth,
          upgradeAttack,
          upgradeHealth,
        };
      });

      return { cards: orderedCards, staminaRemaining: regen.stamina - 1 };
    });

    // Track mission progress
    await incrementMissionProgress(profileId, "OPEN_PACKS", 1);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "NO_STAMINA") {
      return NextResponse.json({ error: "Sem stamina suficiente para abrir um pacote." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao abrir pacote." }, { status: 500 });
  }
}
