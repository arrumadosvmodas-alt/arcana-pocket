import { prisma } from "./db";

export type MissionType = "FIRST_VICTORY" | "OPEN_PACKS" | "CREATE_DECKS" | "COLLECT_CARDS";

const MISSION_MAP: Record<MissionType, { title: string }> = {
  FIRST_VICTORY: { title: "Primeira Vitória" },
  OPEN_PACKS: { title: "Abra 3 Pacotes" },
  CREATE_DECKS: { title: "Construtor de Deck" },
  COLLECT_CARDS: { title: "Colecionador" },
};

// Increment mission progress server-side after player actions
export async function incrementMissionProgress(profileId: string, type: MissionType, amount: number = 1) {
  const mission = MISSION_MAP[type];
  if (!mission) return;

  const today = new Date().toISOString().split("T")[0];

  const playerMission = await prisma.playerMission.findFirst({
    where: {
      profileId,
      date: today,
      mission: { title: mission.title },
    },
    include: { mission: true },
  });

  if (!playerMission) return;

  const newProgress = Math.min(playerMission.mission.target, playerMission.progress + amount);

  await prisma.playerMission.update({
    where: { id: playerMission.id },
    data: {
      progress: newProgress,
      completed: newProgress >= playerMission.mission.target,
    },
  });
}
