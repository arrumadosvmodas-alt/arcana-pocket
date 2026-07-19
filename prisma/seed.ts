import { PrismaClient } from "@prisma/client";
import {
  ELEMENTS,
  Element,
  Rarity,
  STARTER_COINS,
  MAX_STAMINA,
} from "../src/lib/engine/cards";

const prisma = new PrismaClient();

const LOCAL_PROFILE_ID = "local-player";

// Original creature names per element, ordered roughly weakest to strongest.
// No names, creatures, or terms are drawn from any existing media property.
const NAMES: Record<Element, string[]> = {
  FIRE: [
    "Ember Sprite", "Cinder Pup", "Flarehare", "Torch Beetle", "Kiln Boar",
    "Magma Newt", "Blazing Jackal", "Pyre Falcon", "Ashen Ram", "Cinderwolf",
    "Molten Serpent", "Solar Drake", "Infernal Phoenix", "Flame Wisp", "Scorch Bat",
    "Lava Turtle", "Furnace Golem", "Volcano Drake", "Inferno Titan", "Sunfire Guardian",
    "Hellhound Warlord", "Eternal Flame",
  ],
  WATER: [
    "Tide Minnow", "Brookling", "Ripple Otter", "Kelp Crab", "Misty Frog",
    "Coral Turtle", "Whirlpool Eel", "Storm Ray", "Glacier Seal", "Riptide Shark",
    "Abyssal Kraken", "Tsunami Whale", "Leviathan Wyrm", "Wave Sprite", "Aqua Bat",
    "Pearl Serpent", "Frost Drake", "Tidal Colossus", "Maelstrom Guardian", "Leviathan King",
    "Tempest Hydra", "Abyss Sovereign",
  ],
  EARTH: [
    "Pebble Mole", "Root Vole", "Clay Badger", "Sandshell Crab", "Boulder Armadillo",
    "Thornback Boar", "Granite Rhino", "Quartz Golem", "Terra Mammoth", "Canyon Bison",
    "Obsidian Titan", "Mountain Wurm", "Ancient Colossus", "Stone Sprite", "Dirt Badger",
    "Iron Tortoise", "Crystal Elemental", "Stone Giant", "Bedrock Guardian", "Earthshaker Titan",
    "Granite Warlord", "Core Sentinel",
  ],
  AIR: [
    "Breeze Wren", "Gale Moth", "Zephyr Hawk", "Cloud Rabbit", "Windsprite",
    "Skimmer Bat", "Thunder Swift", "Cyclone Owl", "Squall Griffin", "Stormcaller Roc",
    "Tempest Harpy", "Jetstream Wyvern", "Skybreaker Aeon", "Wind Wisp", "Storm Eagle",
    "Lightning Serpent", "Gale Drake", "Tornado Elemental", "Tempest Guardian", "Sky Titan",
    "Hurricane Warlord", "Eternal Storm",
  ],
  LIGHT: [
    "Glow Firefly", "Sunling", "Prism Dove", "Radiant Fox", "Halo Deer",
    "Dawn Unicorn", "Luster Peacock", "Beacon Lion", "Aurora Stag", "Solstice Seraph",
    "Judgment Angel", "Celestial Guardian", "Zenith Sovereign", "Shimmer Sprite", "Light Bat",
    "Radiance Turtle", "Holy Drake", "Luminous Colossus", "Radiant Titan", "Star Guardian",
    "Divine Warlord", "Eternal Light",
  ],
  SHADOW: [
    "Murk Rat", "Gloomling", "Shade Raven", "Whisper Cat", "Umbral Fox",
    "Nightcrawler", "Void Wisp", "Dread Hound", "Wraithling", "Eclipse Panther",
    "Nether Reaper", "Abyss Revenant", "Oblivion Wyrm", "Shadow Sprite", "Darkness Bat",
    "Void Serpent", "Night Drake", "Shadow Colossus", "Abyssal Titan", "Dark Guardian",
    "Shadow Warlord", "Eternal Darkness",
  ],
};

function rarityForIndex(i: number, total: number): Rarity {
  // ~15% épicas, ~25% raras, ~60% comuns (mais viável para construir decks)
  if (i >= total - Math.ceil(total * 0.15)) return "EPIC";
  if (i >= total - Math.ceil(total * 0.40)) return "RARE";
  return "COMMON";
}

function statsFor(i: number, total: number, rarity: Rarity) {
  // Custo: 1-6, distribuído ao longo do catálogo
  const cost = Math.min(6, Math.max(1, Math.ceil((i / total) * 6)));

  // Bonus por raridade
  const rarityBonus = rarity === "EPIC" ? 4 : rarity === "RARE" ? 2 : 0;

  // Stats escalonados: cartas de custo alto são mais fortes
  const baseAttack = cost + 1;
  const baseHealth = cost + 2;
  const attack = baseAttack + rarityBonus + (i % 3); // +0 a +2 variação
  const health = baseHealth + rarityBonus + ((i + 1) % 3); // +0 a +2 variação

  return { cost, attack, health };
}

async function main() {
  await prisma.playerMission.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.deckCard.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.playerCard.deleteMany();
  await prisma.packOpening.deleteMany();
  await prisma.purchaseHistory.deleteMany();
  await prisma.cardDefinition.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.profile.deleteMany();

  const cardData = ELEMENTS.flatMap((element) => {
    const names = NAMES[element];
    return names.map((name, i) => {
      const rarity = rarityForIndex(i, names.length);
      const { cost, attack, health } = statsFor(i, names.length, rarity);
      return {
        name,
        element,
        rarity,
        cost,
        attack,
        health,
        text: `${name} ataca por ${attack} e resiste ${health} de dano.`,
      };
    });
  });

  await prisma.cardDefinition.createMany({ data: cardData });
  console.log(`Seeded ${cardData.length} card definitions.`);

  const profile = await prisma.profile.create({
    data: {
      id: LOCAL_PROFILE_ID,
      displayName: "Treinador Local",
    },
  });

  await prisma.wallet.create({
    data: {
      profileId: profile.id,
      coins: STARTER_COINS,
      stamina: MAX_STAMINA,
      maxStamina: MAX_STAMINA,
      gems: 200, // Demo gems para testar shop
    },
  });

  await prisma.shopPackage.deleteMany();
  const shopPackages = [
    { name: "Starter Pack", description: "5 cartas para começar", cardsCount: 5, gemPrice: 50, order: 1 },
    { name: "Power Pack", description: "10 cartas raras", cardsCount: 10, gemPrice: 80, order: 2 },
    { name: "Legendary Pack", description: "15 cartas épicas", cardsCount: 15, gemPrice: 120, order: 3 },
  ];
  await prisma.shopPackage.createMany({ data: shopPackages });

  await prisma.mission.deleteMany();
  const missions = [
    { title: "Primeira Vitória", description: "Vença uma batalha PvE", target: 1, coinsReward: 150, gemsReward: 0 },
    { title: "Colecionador", description: "Tenha 50 cartas diferentes", target: 50, coinsReward: 200, gemsReward: 10 },
    { title: "Construtor de Deck", description: "Crie 2 decks", target: 2, coinsReward: 100, gemsReward: 5 },
    { title: "Abra 3 Pacotes", description: "Abra 3 pacotes grátis", target: 3, coinsReward: 100, gemsReward: 0 },
  ];
  await prisma.mission.createMany({ data: missions });

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  for (const mission of missions) {
    await prisma.playerMission.create({
      data: {
        profileId: profile.id,
        missionId: (await prisma.mission.findFirst({ where: { title: mission.title } }))!.id,
        progress: 0,
        date: today,
      },
    });
  }

  console.log(`Seeded local profile "${profile.displayName}" with wallet.`);
  console.log(`Seeded ${shopPackages.length} shop packages.`);
  console.log(`Seeded ${missions.length} missions with player progress.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
