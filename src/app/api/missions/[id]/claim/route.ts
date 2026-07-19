import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID } from "@/lib/player";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const pm = await tx.playerMission.findUnique({ where: { id }, include: { mission: true } });
      if (!pm) throw new Error("NOT_FOUND");
      if (pm.profileId !== LOCAL_PROFILE_ID) throw new Error("UNAUTHORIZED");
      if (pm.claimedAt) throw new Error("ALREADY_CLAIMED");
      if (pm.progress < pm.mission.target) throw new Error("NOT_COMPLETE");

      const wallet = await tx.wallet.findUnique({ where: { profileId: LOCAL_PROFILE_ID } });
      if (!wallet) throw new Error("NO_WALLET");

      await tx.wallet.update({
        where: { profileId: LOCAL_PROFILE_ID },
        data: {
          coins: wallet.coins + pm.mission.coinsReward,
          gems: wallet.gems + pm.mission.gemsReward,
        },
      });

      const updated = await tx.playerMission.update({
        where: { id },
        data: { claimedAt: new Date() },
        include: { mission: true },
      });

      return {
        coinsReward: pm.mission.coinsReward,
        gemsReward: pm.mission.gemsReward,
        newWallet: { coins: wallet.coins + pm.mission.coinsReward, gems: wallet.gems + pm.mission.gemsReward },
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
      if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
      if (err.message === "ALREADY_CLAIMED") return NextResponse.json({ error: "Já foi reclamada." }, { status: 400 });
      if (err.message === "NOT_COMPLETE") return NextResponse.json({ error: "Missão não completa." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao reclamar." }, { status: 500 });
  }
}
