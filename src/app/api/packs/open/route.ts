import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID, computeStaminaRegen } from "@/lib/player";
import { drawPack } from "@/lib/engine/packs";
import { incrementMissionProgress } from "@/lib/missions";
import type { CardDefinition } from "@prisma/client";

export async function POST() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { profileId: LOCAL_PROFILE_ID } });
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
          where: { profileId_cardDefinitionId: { profileId: LOCAL_PROFILE_ID, cardDefinitionId } },
          update: { quantity: { increment: quantity } },
          create: { profileId: LOCAL_PROFILE_ID, cardDefinitionId, quantity },
        });
      }

      await tx.wallet.update({
        where: { profileId: LOCAL_PROFILE_ID },
        data: { stamina: regen.stamina - 1, staminaUpdatedAt: regen.staminaUpdatedAt },
      });

      await tx.packOpening.create({
        data: { profileId: LOCAL_PROFILE_ID, seed, cardIds: JSON.stringify(drawnIds) },
      });

      const cards = await tx.cardDefinition.findMany({ where: { id: { in: drawnIds } } });
      const cardsById = new Map(cards.map((c: CardDefinition) => [c.id, c]));
      const orderedCards = drawnIds.map((id) => cardsById.get(id)!);

      return { cards: orderedCards, staminaRemaining: regen.stamina - 1 };
    });

    // Track mission progress
    await incrementMissionProgress(LOCAL_PROFILE_ID, "OPEN_PACKS", 1);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "NO_STAMINA") {
      return NextResponse.json({ error: "Sem stamina suficiente para abrir um pacote." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return NextResponse.json({ error: "Perfil local não encontrado. Rode o seed." }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao abrir pacote." }, { status: 500 });
  }
}
