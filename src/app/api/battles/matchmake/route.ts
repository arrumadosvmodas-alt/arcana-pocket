import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromAuthHeader } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { deckId, inviteMatchId } = await req.json();

    // Get current user from Authorization header
    const authHeader = req.headers.get("authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!deckId) {
      return NextResponse.json(
        { error: "deckId obrigatório" },
        { status: 400 }
      );
    }

    // Verify deck ownership
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { profileId: true },
    });

    if (!deck || deck.profileId !== userId) {
      return NextResponse.json(
        { error: "Deck não encontrado" },
        { status: 404 }
      );
    }

    // Join invite match room if inviteMatchId is present
    if (inviteMatchId) {
      const inviteMatch = await prisma.battleMatch.findUnique({
        where: { id: inviteMatchId },
      });
      if (!inviteMatch) {
        return NextResponse.json({ error: "Sala de convite não encontrada." }, { status: 404 });
      }
      if (inviteMatch.status !== "waiting") {
        return NextResponse.json({ error: "Esta partida já começou ou expirou." }, { status: 400 });
      }
      if (inviteMatch.player1Id === userId) {
        return NextResponse.json({ error: "Você não pode jogar contra você mesmo." }, { status: 400 });
      }

      const match = await prisma.battleMatch.update({
        where: { id: inviteMatchId },
        data: {
          player2Id: userId,
          player2DeckId: deckId,
          status: "active",
          startedAt: new Date(),
        },
      });
      return NextResponse.json({
        matchId: match.id,
        status: "matched",
        opponent: inviteMatch.player1Id,
        message: "Conectado ao oponente!",
      });
    }

    // Check if already in queue
    const existingMatch = await prisma.battleMatch.findFirst({
      where: {
        player1Id: userId,
        status: "waiting",
      },
    });

    if (existingMatch) {
      return NextResponse.json({
        matchId: existingMatch.id,
        status: "waiting",
        message: "Já está na fila de espera",
      });
    }

    // Try to find waiting opponent
    const opponent = await prisma.battleMatch.findFirst({
      where: {
        status: "waiting",
        player1Id: {
          not: userId,
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first (fairest)
      },
    });

    if (opponent) {
      // Match found! Update the match and start battle
      const match = await prisma.battleMatch.update({
        where: { id: opponent.id },
        data: {
          player2Id: userId,
          player2DeckId: deckId,
          status: "active",
          startedAt: new Date(),
        },
      });

      return NextResponse.json({
        matchId: match.id,
        status: "matched",
        opponent: opponent.player1Id,
        message: "Adversário encontrado!",
      });
    }

    // No opponent found, add to queue
    const newMatch = await prisma.battleMatch.create({
      data: {
        player1Id: userId,
        player1DeckId: deckId,
        status: "waiting",
      },
    });

    return NextResponse.json({
      matchId: newMatch.id,
      status: "waiting",
      message: "Aguardando adversário...",
    });
  } catch (error: any) {
    console.error("Matchmake error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao encontrar adversário" },
      { status: 500 }
    );
  }
}
