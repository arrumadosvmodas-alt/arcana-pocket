import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const match = await prisma.battleMatch.findUnique({
      where: { id: matchId },
      include: {
        battleResults: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Batalha não encontrada" },
        { status: 404 }
      );
    }

    // Verify user is part of this battle
    if (match.player1Id !== user.id && match.player2Id !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: match.id,
      status: match.status,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      winner: match.winner,
      battleState: match.battleState ? JSON.parse(match.battleState) : null,
      result: match.battleResults[0] || null,
      createdAt: match.createdAt,
      startedAt: match.startedAt,
      finishedAt: match.finishedAt,
    });
  } catch (error: any) {
    console.error("Get battle error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao obter batalha" },
      { status: 500 }
    );
  }
}
