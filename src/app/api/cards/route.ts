import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";

export async function GET() {
  const [cards, playerCards] = await Promise.all([
    prisma.cardDefinition.findMany({ orderBy: [{ element: "asc" }, { cost: "asc" }] }),
    prisma.playerCard.findMany({ where: { profileId: LOCAL_PROFILE_ID } }),
  ]);

  const owned = new Map(playerCards.map((pc) => [pc.cardDefinitionId, pc.quantity]));

  return NextResponse.json(
    cards.map((card) => ({ ...card, owned: owned.get(card.id) ?? 0 }))
  );
}
