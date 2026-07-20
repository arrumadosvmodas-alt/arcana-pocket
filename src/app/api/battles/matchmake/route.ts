import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { deckId } = await req.json();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (!deck || deck.profileId !== user.id) {
      return NextResponse.json(
        { error: "Deck não encontrado" },
        { status: 404 }
      );
    }

    // Check if already in queue
    const existingMatch = await prisma.battleMatch.findFirst({
      where: {
        player1Id: user.id,
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
          not: user.id,
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
          player2Id: user.id,
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
        player1Id: user.id,
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
