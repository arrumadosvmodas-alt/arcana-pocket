import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setMissionProgress } from "@/lib/missions";
import { getProfileIdFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  try {
    // Count distinct cards owned
    const distinctCards = await prisma.playerCard.count({
      where: { profileId, quantity: { gt: 0 } },
    });

    // Count distinct rare/epic cards owned
    const distinctRareCards = await prisma.playerCard.count({
      where: {
        profileId,
        quantity: { gt: 0 },
        cardDefinition: { rarity: { in: ["RARE", "EPIC"] } },
      },
    });

    await setMissionProgress(profileId, "COLLECT_CARDS", distinctCards);
    await setMissionProgress(profileId, "COLLECT_RARE", distinctRareCards);

    return NextResponse.json({ progress: distinctCards, rareProgress: distinctRareCards });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao sincronizar." }, { status: 500 });
  }
}
