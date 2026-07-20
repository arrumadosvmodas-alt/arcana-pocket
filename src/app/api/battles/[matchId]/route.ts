import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromAuthHeader } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const authHeader = req.headers.get("authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    if (!userId) {
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
    if (match.player1Id !== userId && match.player2Id !== userId) {
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
