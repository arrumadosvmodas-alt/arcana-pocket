import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, profileId: LOCAL_PROFILE_ID },
    include: { deckCards: { include: { cardDefinition: true } } },
  });
  if (!deck) return NextResponse.json({ error: "Deck não encontrado." }, { status: 404 });
  return NextResponse.json(deck);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = await prisma.deck.findFirst({ where: { id, profileId: LOCAL_PROFILE_ID } });
  if (!deck) return NextResponse.json({ error: "Deck não encontrado." }, { status: 404 });
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
