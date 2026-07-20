import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";
import { setMissionProgress } from "@/lib/missions";

export async function POST() {
  try {
    // Count distinct cards owned
    const distinctCards = await prisma.playerCard.count({
      where: { profileId: LOCAL_PROFILE_ID, quantity: { gt: 0 } },
    });

    // Count distinct rare/epic cards owned
    const distinctRareCards = await prisma.playerCard.count({
      where: {
        profileId: LOCAL_PROFILE_ID,
        quantity: { gt: 0 },
        cardDefinition: { rarity: { in: ["RARE", "EPIC"] } },
      },
    });

    await setMissionProgress(LOCAL_PROFILE_ID, "COLLECT_CARDS", distinctCards);
    await setMissionProgress(LOCAL_PROFILE_ID, "COLLECT_RARE", distinctRareCards);

    return NextResponse.json({ progress: distinctCards, rareProgress: distinctRareCards });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao sincronizar." }, { status: 500 });
  }
}
