import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromRequest } from "@/lib/auth";
import type { PlayerCard } from "@prisma/client";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getProfileIdFromRequest(req);

  const [deck, playerCards] = await Promise.all([
    prisma.deck.findFirst({
      where: { id, profileId },
      include: { deckCards: { include: { cardDefinition: true } } },
    }),
    prisma.playerCard.findMany({ where: { profileId } }),
  ]);

  if (!deck) return NextResponse.json({ error: "Deck não encontrado." }, { status: 404 });

  const pcMap = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc]));

  const mappedDeck = {
    ...deck,
    deckCards: deck.deckCards.map((dc) => {
      const pc = pcMap.get(dc.cardDefinitionId);
      const upgradeAttack = pc?.upgradeAttack ?? 0;
      const upgradeHealth = pc?.upgradeHealth ?? 0;
      return {
        ...dc,
        cardDefinition: {
          ...dc.cardDefinition,
          attack: dc.cardDefinition.attack + upgradeAttack,
          health: dc.cardDefinition.health + upgradeHealth,
          upgradeAttack,
          upgradeHealth,
        },
      };
    }),
  };

  return NextResponse.json(mappedDeck);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getProfileIdFromRequest(req);

  const deck = await prisma.deck.findFirst({ where: { id, profileId } });
  if (!deck) return NextResponse.json({ error: "Deck não encontrado." }, { status: 404 });

  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
