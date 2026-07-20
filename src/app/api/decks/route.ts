import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getProfileIdFromRequest } from "@/lib/auth";
import { validateDeckStructure } from "@/lib/engine/rules";
import { incrementMissionProgress } from "@/lib/missions";
import type { PlayerCard } from "@prisma/client";

const deckInputSchema = z.object({
  name: z.string().min(1).max(60),
  cards: z.array(z.object({ cardDefinitionId: z.string(), quantity: z.number().int().positive() })),
});

export async function GET(req: Request) {
  const profileId = await getProfileIdFromRequest(req);

  const [decks, playerCards] = await Promise.all([
    prisma.deck.findMany({
      where: { profileId },
      include: { deckCards: { include: { cardDefinition: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.playerCard.findMany({ where: { profileId } }),
  ]);

  const pcMap = new Map(playerCards.map((pc: PlayerCard) => [pc.cardDefinitionId, pc]));

  const mappedDecks = decks.map((deck) => ({
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
  }));

  return NextResponse.json(mappedDecks);
}

export async function POST(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  const body = deckInputSchema.parse(await req.json());

  const structure = validateDeckStructure(body.cards);
  if (!structure.valid) {
    return NextResponse.json({ error: structure.errors.join(" ") }, { status: 400 });
  }

  const ownership = await prisma.playerCard.findMany({
    where: { profileId, cardDefinitionId: { in: body.cards.map((c) => c.cardDefinitionId) } },
  });
  const ownedById = new Map(ownership.map((o: PlayerCard) => [o.cardDefinitionId, o.quantity]));

  for (const c of body.cards) {
    const owned = ownedById.get(c.cardDefinitionId) ?? 0;
    if (c.quantity > owned) {
      return NextResponse.json(
        { error: `Você não possui cópias suficientes de uma das cartas selecionadas.` },
        { status: 400 }
      );
    }
  }

  const deck = await prisma.deck.create({
    data: {
      profileId,
      name: body.name,
      deckCards: { create: body.cards.map((c) => ({ cardDefinitionId: c.cardDefinitionId, quantity: c.quantity })) },
    },
    include: { deckCards: { include: { cardDefinition: true } } },
  });

  // Track mission progress
  await incrementMissionProgress(profileId, "CREATE_DECKS", 1);

  const elements = new Set(deck.deckCards.map((dc) => dc.cardDefinition.element));
  if (elements.size === 1) {
    await incrementMissionProgress(profileId, "MONO_DECK", 1);
  }

  // Get upgrades for response mapping
  const playerCards = await prisma.playerCard.findMany({ where: { profileId } });
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

  return NextResponse.json(mappedDeck, { status: 201 });
}
