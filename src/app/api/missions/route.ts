import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromRequest } from "@/lib/auth";
import type { PlayerMission, Mission } from "@prisma/client";

export async function GET(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  const today = new Date().toISOString().split("T")[0];

  const playerMissions = await prisma.playerMission.findMany({
    where: { profileId, date: today },
    include: { mission: true },
    orderBy: { mission: { createdAt: "asc" } },
  });

  return NextResponse.json(
    playerMissions.map((pm: PlayerMission & { mission: Mission }) => ({
      id: pm.id,
      missionId: pm.mission.id,
      title: pm.mission.title,
      description: pm.mission.description,
      target: pm.mission.target,
      progress: pm.progress,
      completed: pm.completed,
      coinsReward: pm.mission.coinsReward,
      gemsReward: pm.mission.gemsReward,
      claimedAt: pm.claimedAt,
    }))
  );
}
