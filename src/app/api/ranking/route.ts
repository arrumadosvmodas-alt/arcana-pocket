import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rankings = await prisma.playerRating.findMany({
      orderBy: { rating: "desc" },
      take: 100,
      include: {
        profile: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      rankings: rankings.map((r, index) => ({
        position: index + 1,
        profileId: r.profileId,
        displayName: r.profile.displayName,
        rating: r.rating,
        wins: r.wins,
        losses: r.losses,
        winRate: r.wins + r.losses > 0
          ? ((r.wins / (r.wins + r.losses)) * 100).toFixed(1)
          : "0",
      })),
    });
  } catch (error: any) {
    console.error("Ranking error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao obter ranking" },
      { status: 500 }
    );
  }
}
