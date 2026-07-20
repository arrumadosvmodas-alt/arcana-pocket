import { ELEMENT_THEME, RARITY_THEME, Element, Rarity } from "@/lib/engine/cards";
import { AlienEmblem } from "@/components/creatures/AlienEmblem";

export type CardViewData = {
  name: string;
  element: Element;
  rarity: Rarity;
  cost: number;
  attack: number;
  health: number;
  upgradeAttack?: number;
  upgradeHealth?: number;
};

export function CardView({
  card,
  badge,
  size = "md",
  dimmed = false,
}: {
  card: CardViewData;
  badge?: string;
  size?: "sm" | "md";
  dimmed?: boolean;
}) {
  const elementTheme = ELEMENT_THEME[card.element];
  const rarityTheme = RARITY_THEME[card.rarity];
  
  const padding = size === "sm" ? "p-2.5 text-xs" : "p-4 text-sm";
  const nameSize = size === "sm" ? "text-[13px]" : "text-[16px]";
  const emblemSize = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const shineClass = card.rarity !== "COMMON" ? "card-shine" : "";
  const glowClass = card.rarity === "EPIC" ? "card-glow" : "";

  const isHighRarity = card.rarity === "EPIC";
  const neonClass = 
    card.element === "FIRE" ? "border-neon-fire" :
    card.element === "WATER" ? "border-neon-water" :
    card.element === "EARTH" ? "border-neon-earth" :
    "border-neon-air";

  return (
    <div
      className={`nft-card-container ${neonClass} ${
        dimmed ? "opacity-45 scale-95" : ""
      } ${padding}`}
    >
      {/* Holographic animated overlay for high rarity cards */}
      {isHighRarity && <div className="nft-holo-shine" aria-hidden="true" />}
      
      {badge && (
        <span className="absolute -right-1 -top-1 rounded-full border border-pink-400 bg-pink-900/90 px-2 py-0.5 text-[10px] font-black text-pink-200 shadow-[0_0_8px_rgba(236,72,153,0.5)] z-20">
          {badge}
        </span>
      )}

      {/* Header: Name & Mana Cost */}
      <div className="flex items-center justify-between gap-1.5 z-10">
        <span className={`font-bold tracking-tight text-white drop-shadow-sm ${nameSize}`}>{card.name}</span>
        
        {/* Mana Cost Badge */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400 bg-cyan-950/80 text-[11px] font-black text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          title="Mana"
        >
          {card.cost}
        </span>
      </div>

      {/* Creature Emblem / Illustration */}
      <div className="card-emblem-float flex items-center justify-center py-2.5 z-10">
        <AlienEmblem element={card.element} rarity={card.rarity} accent={elementTheme.color} className={emblemSize} />
      </div>

      {/* Info: Element & Stars */}
      <div className="flex items-center justify-between text-[10px] font-bold z-10">
        <span 
          className="px-2 py-0.5 rounded-full border border-white/10 text-white text-[9px] uppercase tracking-wide"
          style={{ backgroundColor: `${elementTheme.color}30` }}
        >
          {elementTheme.label}
        </span>
        <span style={{ color: rarityTheme.color }} className="drop-shadow-sm font-black text-[9px]">
          {"★".repeat(rarityTheme.stars)}
        </span>
      </div>

      {/* Stats Section: Attack & Defense */}
      <div className="mt-2.5 flex items-center gap-2 z-10">
        {/* Attack Icon */}
        <span className={`flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-950/50 px-2 py-0.5 text-xs font-black text-amber-400 shadow-sm ${
          card.upgradeAttack && card.upgradeAttack > 0 ? "ring-1 ring-yellow-400" : ""
        }`}>
          ⚔ {card.attack}
          {card.upgradeAttack && card.upgradeAttack > 0 && <span className="text-[10px] text-yellow-300 ml-0.5">+{card.upgradeAttack}</span>}
        </span>
        {/* Defense Icon */}
        <span className={`flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-950/50 px-2 py-0.5 text-xs font-black text-emerald-400 shadow-sm ${
          card.upgradeHealth && card.upgradeHealth > 0 ? "ring-1 ring-green-400" : ""
        }`}>
          🛡 {card.health}
          {card.upgradeHealth && card.upgradeHealth > 0 && <span className="text-[10px] text-green-300 ml-0.5">+{card.upgradeHealth}</span>}
        </span>
      </div>
    </div>
  );
}
