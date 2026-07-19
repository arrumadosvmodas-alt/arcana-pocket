import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";
import type { CardDefinition, PlayerCard } from "@prisma/client";

export async function GET() {
  const [cards, playerCards] = await Promise.all([
    prisma.cardDefinition.findMany({ orderBy: [{ element: "asc" }, { cost: "asc" }] }),
    prisma.playerCard.findMany({ where: { profileId: LOCAL_PROFILE_ID } }),
  ]) as [CardDefinition[], PlayerCard[]];

  const owned = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc.quantity]));

  return NextResponse.json(
    cards.map((card) => ({ ...card, owned: owned.get(card.id) ?? 0 }))
  );
}
