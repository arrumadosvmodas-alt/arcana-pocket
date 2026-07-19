export const ELEMENTS = ["FIRE", "WATER", "EARTH", "AIR", "LIGHT", "SHADOW"] as const;
export type Element = (typeof ELEMENTS)[number];

export const RARITIES = ["COMMON", "RARE", "EPIC"] as const;
export type Rarity = (typeof RARITIES)[number];

export const ELEMENT_THEME: Record<Element, { label: string; color: string; glow: string }> = {
  FIRE: { label: "Fogo", color: "#f0653c", glow: "#ff8a5c" },
  WATER: { label: "Água", color: "#2f9bd6", glow: "#5fc4ff" },
  EARTH: { label: "Terra", color: "#8a6a3c", glow: "#c69a5c" },
  AIR: { label: "Ar", color: "#63c9a0", glow: "#9af0cc" },
  LIGHT: { label: "Luz", color: "#e8c545", glow: "#fff2a8" },
  SHADOW: { label: "Sombra", color: "#8657c9", glow: "#c19bff" },
};

export const RARITY_THEME: Record<Rarity, { label: string; stars: number; color: string }> = {
  COMMON: { label: "Comum", stars: 1, color: "#9aa3ad" },
  RARE: { label: "Raro", stars: 2, color: "#4f8ff0" },
  EPIC: { label: "Épico", stars: 3, color: "#c47ef0" },
};

// Drop odds for a 5-card pack. Transparent, server-defined probabilities per rarity.
// Adjusted to make épicas mais viáveis (~16% por slot, ~60% chance de ≥1 épica por pacote).
export const PACK_SLOT_ODDS: { rarity: Rarity; weight: number }[] = [
  { rarity: "COMMON", weight: 60 },
  { rarity: "RARE", weight: 24 },
  { rarity: "EPIC", weight: 16 },
];

export const PACK_SIZE = 5;
export const DECK_SIZE = 20;
export const MAX_COPIES_PER_CARD_IN_DECK = 3;
export const FREE_PACK_INTERVAL_HOURS = 12;
export const STARTER_COINS = 500;
export const MAX_STAMINA = 6;
