import { Element, Rarity } from "./cards";
import { mulberry32, seedFromString, shuffle } from "./rng";

export type BattleCard = {
  id: string;
  defId: string;
  name: string;
  element: Element;
  rarity: Rarity;
  cost: number;
  attack: number;
  maxHealth: number;
  health: number;
};

export type Lane = {
  player: BattleCard | null;
  bot: BattleCard | null;
};

export type Side = "player" | "bot";

export type BattleState = {
  round: number;
  maxRounds: number;
  energy: number;
  maxEnergy: number;
  playerLife: number;
  botLife: number;
  startingLife: number;
  botStartingLife?: number;
  playerDeck: BattleCard[];
  botDeck: BattleCard[];
  playerHand: BattleCard[];
  botHand: BattleCard[];
  lanes: [Lane, Lane, Lane];
  log: string[];
  status: "ongoing" | "player_win" | "bot_win" | "draw";
  playerPlayedThisRound: boolean;
  botPlayedThisRound: boolean;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
};

export type BattleCardSource = {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  cost: number;
  attack: number;
  health: number;
};

const HAND_SIZE = 3;
const LANE_COUNT = 3;
const STARTING_LIFE = 20;
const MAX_ROUNDS = 10;
const MAX_ENERGY = 6;

function toBattleCard(src: BattleCardSource, instanceId: string): BattleCard {
  return {
    id: instanceId,
    defId: src.id,
    name: src.name,
    element: src.element,
    rarity: src.rarity,
    cost: src.cost,
    attack: src.attack,
    maxHealth: src.health,
    health: src.health,
  };
}

function expandDeck(cards: { card: BattleCardSource; quantity: number }[]): BattleCardSource[] {
  return cards.flatMap(({ card, quantity }) => Array.from({ length: quantity }, () => card));
}

export function createBattle(
  playerCards: { card: BattleCardSource; quantity: number }[],
  botCards: { card: BattleCardSource; quantity: number }[],
  seed: string,
  difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM"
): BattleState {
  const rng = mulberry32(seedFromString(seed));

  const playerDeckRaw = shuffle(expandDeck(playerCards), rng);
  const botDeckRaw = shuffle(expandDeck(botCards), rng);

  const playerDeck = playerDeckRaw.map((c, i) => toBattleCard(c, `p-${i}-${c.id}`));
  const botDeck = botDeckRaw.map((c, i) => toBattleCard(c, `b-${i}-${c.id}`));

  const playerHand = playerDeck.splice(0, HAND_SIZE);
  const botHand = botDeck.splice(0, HAND_SIZE);

  const botLife = difficulty === "EASY" ? 15 : difficulty === "HARD" ? 25 : 20;

  return {
    round: 1,
    maxRounds: MAX_ROUNDS,
    energy: 1,
    maxEnergy: MAX_ENERGY,
    playerLife: STARTING_LIFE,
    botLife,
    startingLife: STARTING_LIFE,
    botStartingLife: botLife,
    playerDeck,
    botDeck,
    playerHand,
    botHand,
    lanes: [
      { player: null, bot: null },
      { player: null, bot: null },
      { player: null, bot: null },
    ],
    log: ["A batalha começou."],
    status: "ongoing",
    playerPlayedThisRound: false,
    botPlayedThisRound: false,
    difficulty,
  };
}

export function playCard(state: BattleState, side: Side, cardId: string, lane: number): BattleState {
  if (state.status !== "ongoing") return state;
  if (lane < 0 || lane >= LANE_COUNT) return state;

  const hand = side === "player" ? state.playerHand : state.botHand;
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;
  if (card.cost > state.energy) return state;
  if (state.lanes[lane][side] !== null) return state;
  if ((side === "player" && state.playerPlayedThisRound) || (side === "bot" && state.botPlayedThisRound)) {
    return state;
  }

  const lanes = state.lanes.map((l, i) => (i === lane ? { ...l, [side]: card } : l)) as [Lane, Lane, Lane];
  const newHand = hand.filter((c) => c.id !== cardId);

  return {
    ...state,
    lanes,
    energy: state.energy - card.cost,
    playerHand: side === "player" ? newHand : state.playerHand,
    botHand: side === "bot" ? newHand : state.botHand,
    playerPlayedThisRound: side === "player" ? true : state.playerPlayedThisRound,
    botPlayedThisRound: side === "bot" ? true : state.botPlayedThisRound,
    log: [...state.log, `${side === "player" ? "Você jogou" : "O oponente jogou"} ${card.name} (lane ${lane + 1}).`],
  };
}

export function botChooseAction(state: BattleState): { cardId: string; lane: number } | null {
  if (state.botPlayedThisRound) return null;
  const affordable = state.botHand.filter((c) => c.cost <= state.energy);
  if (affordable.length === 0) return null;

  const difficulty = state.difficulty || "MEDIUM";

  if (difficulty === "EASY") {
    // 35% chance to pass without action
    if (Math.random() < 0.35) return null;

    const emptyLanes = state.lanes
      .map((l, i) => (l.bot === null ? i : -1))
      .filter((idx) => idx !== -1);
    if (emptyLanes.length === 0) return null;

    const randomCard = affordable[Math.floor(Math.random() * affordable.length)];
    const randomLane = emptyLanes[Math.floor(Math.random() * emptyLanes.length)];
    return { cardId: randomCard.id, lane: randomLane };
  }

  if (difficulty === "MEDIUM") {
    const emptyLane = state.lanes.findIndex((l) => l.bot === null);
    if (emptyLane === -1) return null;

    const best = affordable.reduce((a, b) => (b.attack > a.attack ? b : a));
    return { cardId: best.id, lane: emptyLane };
  }

  // HARD difficulty AI
  let bestAction: { cardId: string; lane: number } | null = null;
  let bestScore = -999;

  const emptyLanes = state.lanes
    .map((l, i) => (l.bot === null ? i : -1))
    .filter((idx) => idx !== -1);

  if (emptyLanes.length === 0) return null;

  for (const card of affordable) {
    for (const laneIdx of emptyLanes) {
      const lane = state.lanes[laneIdx];
      let score = 0;

      if (lane.player) {
        const killsPlayer = card.attack >= lane.player.health;
        const survives = card.health > lane.player.attack;

        score += card.attack;
        if (killsPlayer) score += 10;
        if (survives) score += 5;
        // Element counters
        if (card.element === "WATER" && lane.player.element === "FIRE") score += 5;
        if (card.element === "FIRE" && lane.player.element === "AIR") score += 5;
        if (card.element === "AIR" && lane.player.element === "EARTH") score += 5;
        if (card.element === "EARTH" && lane.player.element === "WATER") score += 5;
      } else {
        score += card.attack * 1.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAction = { cardId: card.id, lane: laneIdx };
      }
    }
  }

  return bestAction;
}

export function passRound(state: BattleState, side: Side): BattleState {
  return {
    ...state,
    playerPlayedThisRound: side === "player" ? true : state.playerPlayedThisRound,
    botPlayedThisRound: side === "bot" ? true : state.botPlayedThisRound,
  };
}

export function endRound(state: BattleState): BattleState {
  if (state.status !== "ongoing") return state;

  const lanes: [Lane, Lane, Lane] = [
    { ...state.lanes[0] },
    { ...state.lanes[1] },
    { ...state.lanes[2] },
  ];
  const log = [...state.log];
  let playerLife = state.playerLife;
  let botLife = state.botLife;

  for (let i = 0; i < LANE_COUNT; i++) {
    const lane = lanes[i];
    const p = lane.player;
    const b = lane.bot;

    if (p && b) {
      const newBHealth = b.health - p.attack;
      const newPHealth = p.health - b.attack;
      lane.bot = newBHealth > 0 ? { ...b, health: newBHealth } : null;
      lane.player = newPHealth > 0 ? { ...p, health: newPHealth } : null;
      log.push(
        `Lane ${i + 1}: ${p.name} (${p.attack}) x ${b.name} (${b.attack}).` +
          (!lane.player ? ` ${p.name} caiu.` : "") +
          (!lane.bot ? ` ${b.name} caiu.` : "")
      );
    } else if (p && !b) {
      botLife -= p.attack;
      log.push(`Lane ${i + 1}: ${p.name} atinge o oponente por ${p.attack}.`);
    } else if (b && !p) {
      playerLife -= b.attack;
      log.push(`Lane ${i + 1}: ${b.name} atinge você por ${b.attack}.`);
    }
  }

  playerLife = Math.max(0, playerLife);
  botLife = Math.max(0, botLife);

  let status: BattleState["status"] = "ongoing";
  if (playerLife <= 0 && botLife <= 0) status = "draw";
  else if (botLife <= 0) status = "player_win";
  else if (playerLife <= 0) status = "bot_win";

  const nextRound = state.round + 1;
  if (status === "ongoing" && nextRound > state.maxRounds) {
    if (playerLife > botLife) status = "player_win";
    else if (botLife > playerLife) status = "bot_win";
    else status = "draw";
  }

  const playerDeck = [...state.playerDeck];
  const botDeck = [...state.botDeck];
  const playerHand = [...state.playerHand];
  const botHand = [...state.botHand];

  while (playerHand.length < HAND_SIZE && playerDeck.length > 0) {
    playerHand.push(playerDeck.shift()!);
  }
  while (botHand.length < HAND_SIZE && botDeck.length > 0) {
    botHand.push(botDeck.shift()!);
  }

  if (status !== "ongoing") {
    log.push(
      status === "player_win"
        ? "Você venceu a batalha!"
        : status === "bot_win"
          ? "Você perdeu a batalha."
          : "A batalha terminou em empate."
    );
  }

  return {
    ...state,
    lanes,
    playerLife,
    botLife,
    status,
    round: nextRound,
    energy: Math.min(state.maxEnergy, nextRound),
    playerDeck,
    botDeck,
    playerHand,
    botHand,
    playerPlayedThisRound: false,
    botPlayedThisRound: false,
    log,
  };
}
