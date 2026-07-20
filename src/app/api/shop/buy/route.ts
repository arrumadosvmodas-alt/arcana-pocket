import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { drawPack } from "@/lib/engine/packs";
import { incrementMissionProgress } from "@/lib/missions";
import { getProfileIdFromRequest } from "@/lib/auth";
import { z } from "zod";
import type { CardDefinition, PlayerCard } from "@prisma/client";

const buySchema = z.object({ shopPackageId: z.string() });

export async function POST(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  try {
    const { shopPackageId } = buySchema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const pkg = await tx.shopPackage.findUnique({ where: { id: shopPackageId } });
      if (!pkg) throw new Error("PACKAGE_NOT_FOUND");

      const wallet = await tx.wallet.findUnique({ where: { profileId } });
      if (!wallet) throw new Error("NO_PROFILE");
      if (wallet.gems < pkg.gemPrice) throw new Error("INSUFFICIENT_GEMS");

      const catalog = await tx.cardDefinition.findMany({ select: { id: true, rarity: true } });
      const seed = randomUUID();

      // Draw cards based on package size (default 5 per pack, scale up)
      const numPacks = Math.max(1, Math.ceil(pkg.cardsCount / 5));
      const drawnIds: string[] = [];
      for (let i = 0; i < numPacks; i++) {
        drawnIds.push(
          ...drawPack(
            catalog.map((c) => ({ id: c.id, rarity: c.rarity as "COMMON" | "RARE" | "EPIC" })),
            `${seed}-${i}`
          )
        );
      }
      const uniqueDrawn = drawnIds.slice(0, pkg.cardsCount);

      const counts = new Map<string, number>();
      for (const id of uniqueDrawn) counts.set(id, (counts.get(id) ?? 0) + 1);

      for (const [cardDefinitionId, quantity] of counts) {
        await tx.playerCard.upsert({
          where: { profileId_cardDefinitionId: { profileId, cardDefinitionId } },
          update: { quantity: { increment: quantity } },
          create: { profileId, cardDefinitionId, quantity },
        });
      }

      await tx.wallet.update({
        where: { profileId },
        data: { gems: wallet.gems - pkg.gemPrice },
      });

      await tx.purchaseHistory.create({
        data: {
          profileId,
          shopPackageId,
          gemsSpent: pkg.gemPrice,
          cardIds: JSON.stringify(uniqueDrawn),
        },
      });

      const cards = await tx.cardDefinition.findMany({ where: { id: { in: uniqueDrawn } } });
      
      // Load user upgrades to display correct stats on new cards
      const playerCards = await tx.playerCard.findMany({ where: { profileId, cardDefinitionId: { in: uniqueDrawn } } });
      const pcMap = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc]));

      const cardsById = new Map(cards.map((c: CardDefinition) => [c.id, c]));
      const orderedCards = uniqueDrawn.map((id) => {
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

      return { cards: orderedCards, gemsRemaining: wallet.gems - pkg.gemPrice, gemsSpent: pkg.gemPrice };
    });

    // Track mission progress
    await incrementMissionProgress(profileId, "SPEND_GEMS", result.gemsSpent);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PACKAGE_NOT_FOUND")
        return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });
      if (err.message === "NO_PROFILE")
        return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
      if (err.message === "INSUFFICIENT_GEMS")
        return NextResponse.json({ error: "Gemas insuficientes." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao comprar pacote." }, { status: 500 });
  }
}
