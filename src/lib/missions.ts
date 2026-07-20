import { prisma } from "./db";

export type MissionType =
  | "FIRST_VICTORY"
  | "OPEN_PACKS"
  | "CREATE_DECKS"
  | "COLLECT_CARDS"
  | "WIN_PVP"
  | "WIN_STREAK"
  | "SPEND_GEMS"
  | "MONO_DECK"
  | "COLLECT_RARE";

const MISSION_MAP: Record<MissionType, { title: string }> = {
  FIRST_VICTORY: { title: "Primeira Vitória" },
  OPEN_PACKS: { title: "Abra 3 Pacotes" },
  CREATE_DECKS: { title: "Construtor de Deck" },
  COLLECT_CARDS: { title: "Colecionador" },
  WIN_PVP: { title: "Vitorioso" },
  WIN_STREAK: { title: "Sequência Perfeita" },
  SPEND_GEMS: { title: "Investidor" },
  MONO_DECK: { title: "Mono Elemento" },
  COLLECT_RARE: { title: "Grande Colecionador" },
};

// Finds today's PlayerMission for this profile/title, creating it on first use
// so missions work for any profile (not just ones seeded ahead of time).
async function getOrCreatePlayerMission(profileId: string, title: string) {
  const today = new Date().toISOString().split("T")[0];

  const existing = await prisma.playerMission.findFirst({
    where: { profileId, date: today, mission: { title } },
    include: { mission: true },
  });
  if (existing) return existing;

  const mission = await prisma.mission.findFirst({ where: { title, isActive: true } });
  if (!mission) return null;

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) return null;

  return prisma.playerMission.upsert({
    where: { profileId_missionId_date: { profileId, missionId: mission.id, date: today } },
    update: {},
    create: { profileId, missionId: mission.id, date: today },
    include: { mission: true },
  });
}

// Increment mission progress server-side after player actions
export async function incrementMissionProgress(profileId: string, type: MissionType, amount: number = 1) {
  const mission = MISSION_MAP[type];
  if (!mission) return;

  const playerMission = await getOrCreatePlayerMission(profileId, mission.title);
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

// Set mission progress to an absolute value (for streaks and synced counts)
export async function setMissionProgress(profileId: string, type: MissionType, value: number) {
  const mission = MISSION_MAP[type];
  if (!mission) return;

  const playerMission = await getOrCreatePlayerMission(profileId, mission.title);
  if (!playerMission) return;

  const newProgress = Math.min(playerMission.mission.target, Math.max(0, value));

  await prisma.playerMission.update({
    where: { id: playerMission.id },
    data: {
      progress: newProgress,
      completed: newProgress >= playerMission.mission.target,
    },
  });
}
