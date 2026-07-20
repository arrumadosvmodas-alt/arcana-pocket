import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromRequest } from "@/lib/auth";
import type { CardDefinition, PlayerCard } from "@prisma/client";

export async function GET(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  
  const [cards, playerCards] = await Promise.all([
    prisma.cardDefinition.findMany({ orderBy: [{ element: "asc" }, { cost: "asc" }] }),
    prisma.playerCard.findMany({ where: { profileId } }),
  ]) as [CardDefinition[], PlayerCard[]];

  const pcMap = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc]));

  return NextResponse.json(
    cards.map((card) => {
      const pc = pcMap.get(card.id);
      const owned = pc?.quantity ?? 0;
      const upgradeAttack = pc?.upgradeAttack ?? 0;
      const upgradeHealth = pc?.upgradeHealth ?? 0;
      return {
        ...card,
        attack: card.attack + upgradeAttack,
        health: card.health + upgradeHealth,
        upgradeAttack,
        upgradeHealth,
        owned,
      };
    })
  );
}
