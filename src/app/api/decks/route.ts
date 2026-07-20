import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";
import { validateDeckStructure } from "@/lib/engine/rules";
import { incrementMissionProgress } from "@/lib/missions";
import type { PlayerCard } from "@prisma/client";

const deckInputSchema = z.object({
  name: z.string().min(1).max(60),
  cards: z.array(z.object({ cardDefinitionId: z.string(), quantity: z.number().int().positive() })),
});

export async function GET() {
  const decks = await prisma.deck.findMany({
    where: { profileId: LOCAL_PROFILE_ID },
    include: { deckCards: { include: { cardDefinition: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(decks);
}

export async function POST(req: Request) {
  const body = deckInputSchema.parse(await req.json());

  const structure = validateDeckStructure(body.cards);
  if (!structure.valid) {
    return NextResponse.json({ error: structure.errors.join(" ") }, { status: 400 });
  }

  const ownership = await prisma.playerCard.findMany({
    where: { profileId: LOCAL_PROFILE_ID, cardDefinitionId: { in: body.cards.map((c) => c.cardDefinitionId) } },
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
      profileId: LOCAL_PROFILE_ID,
      name: body.name,
      deckCards: { create: body.cards.map((c) => ({ cardDefinitionId: c.cardDefinitionId, quantity: c.quantity })) },
    },
    include: { deckCards: { include: { cardDefinition: true } } },
  });

  // Track mission progress
  await incrementMissionProgress(LOCAL_PROFILE_ID, "CREATE_DECKS", 1);

  const elements = new Set(deck.deckCards.map((dc) => dc.cardDefinition.element));
  if (elements.size === 1) {
    await incrementMissionProgress(LOCAL_PROFILE_ID, "MONO_DECK", 1);
  }

  return NextResponse.json(deck, { status: 201 });
}
