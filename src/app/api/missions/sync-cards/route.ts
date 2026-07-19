import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Count distinct cards owned
    const distinctCards = await prisma.playerCard.count({
      where: { profileId: LOCAL_PROFILE_ID, quantity: { gt: 0 } },
    });

    // Find the "Colecionador" mission
    const playerMission = await prisma.playerMission.findFirst({
      where: {
        profileId: LOCAL_PROFILE_ID,
        date: today,
        mission: { title: "Colecionador" },
      },
    });

    if (playerMission) {
      await prisma.playerMission.update({
        where: { id: playerMission.id },
        data: {
          progress: distinctCards,
          completed: distinctCards >= 50,
        },
      });
    }

    return NextResponse.json({ progress: distinctCards });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao sincronizar." }, { status: 500 });
  }
}
