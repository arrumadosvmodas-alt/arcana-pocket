import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Elo rating calculation
function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  kFactor: number = 32
): number {
  const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return Math.round(kFactor * (1 - expectedWinnerScore));
}

export async function POST(req: Request) {
  try {
    const { matchId, winnerId } = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const match = await prisma.battleMatch.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Batalha não encontrada" },
        { status: 404 }
      );
    }

    // Verify user is part of this match
    if (match.player1Id !== user.id && match.player2Id !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Verify both players exist
    if (!match.player2Id) {
      return NextResponse.json(
        { error: "Batalhaainda aguardando outro jogador" },
        { status: 400 }
      );
    }

    const isValidWinner =
      winnerId === match.player1Id || winnerId === match.player2Id;
    if (!isValidWinner) {
      return NextResponse.json({ error: "Vencedor inválido" }, { status: 400 });
    }

    // Get current ratings
    const [winnerRating, loserRating] = await Promise.all([
      prisma.playerRating.findUnique({
        where: { profileId: winnerId },
      }),
      prisma.playerRating.findUnique({
        where: { profileId: winnerId === match.player1Id ? match.player2Id! : match.player1Id },
      }),
    ]);

    const winnerElo = winnerRating?.rating ?? 1200;
    const loserElo = loserRating?.rating ?? 1200;
    const eloChange = calculateEloChange(winnerElo, loserElo);

    // Update battle match
    const updatedMatch = await prisma.battleMatch.update({
      where: { id: matchId },
      data: {
        status: "finished",
        winner: winnerId,
        finishedAt: new Date(),
      },
    });

    // Create battle result
    const result = await prisma.battleResult.create({
      data: {
        battleId: matchId,
        winnerId: winnerId,
        loserId:
          winnerId === match.player1Id ? match.player2Id! : match.player1Id,
        player1Elo: winnerElo,
        player2Elo: loserElo,
        eloChange,
        duration: Math.floor(
          (new Date().getTime() - (match.startedAt?.getTime() || 0)) / 1000
        ),
      },
    });

    // Update ratings
    const loserId =
      winnerId === match.player1Id ? match.player2Id! : match.player1Id;

    await Promise.all([
      // Update winner rating
      prisma.playerRating.upsert({
        where: { profileId: winnerId },
        create: {
          profileId: winnerId,
          rating: 1200 + eloChange,
          wins: 1,
        },
        update: {
          rating: { increment: eloChange },
          wins: { increment: 1 },
        },
      }),
      // Update loser rating
      prisma.playerRating.upsert({
        where: { profileId: loserId },
        create: {
          profileId: loserId,
          rating: 1200 - eloChange,
          losses: 1,
        },
        update: {
          rating: { decrement: eloChange },
          losses: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      battleId: updatedMatch.id,
      winner: winnerId,
      eloChange,
      newRating: (winnerRating?.rating ?? 1200) + eloChange,
      result,
    });
  } catch (error: any) {
    console.error("Finish battle error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao finalizar batalha" },
      { status: 500 }
    );
  }
}
