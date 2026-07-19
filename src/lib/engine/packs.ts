import { PACK_SIZE, PACK_SLOT_ODDS, Rarity } from "./cards";
import { mulberry32, seedFromString } from "./rng";

export type DrawableCard = {
  id: string;
  rarity: Rarity;
};

function pickRarity(rng: () => number): Rarity {
  const total = PACK_SLOT_ODDS.reduce((sum, o) => sum + o.weight, 0);
  let roll = rng() * total;
  for (const odd of PACK_SLOT_ODDS) {
    if (roll < odd.weight) return odd.rarity;
    roll -= odd.weight;
  }
  return PACK_SLOT_ODDS[0].rarity;
}

// Pure, deterministic given the seed: draws PACK_SIZE card ids from the
// provided catalog, grouped by rarity. Guarantees at least one card even if
// a rarity bucket is momentarily empty by falling back to the full catalog.
export function drawPack(catalog: DrawableCard[], seed: string): string[] {
  const rng = mulberry32(seedFromString(seed));
  const byRarity: Record<Rarity, DrawableCard[]> = {
    COMMON: catalog.filter((c) => c.rarity === "COMMON"),
    RARE: catalog.filter((c) => c.rarity === "RARE"),
    EPIC: catalog.filter((c) => c.rarity === "EPIC"),
  };

  const drawn: string[] = [];
  for (let i = 0; i < PACK_SIZE; i++) {
    const rarity = pickRarity(rng);
    const pool = byRarity[rarity].length > 0 ? byRarity[rarity] : catalog;
    const pick = pool[Math.floor(rng() * pool.length)];
    drawn.push(pick.id);
  }
  return drawn;
}
