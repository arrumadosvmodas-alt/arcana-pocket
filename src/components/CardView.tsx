import { ELEMENT_THEME, RARITY_THEME, Element, Rarity } from "@/lib/engine/cards";
import { AlienEmblem } from "@/components/creatures/AlienEmblem";

export type CardViewData = {
  name: string;
  element: Element;
  rarity: Rarity;
  cost: number;
  attack: number;
  health: number;
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

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border-[3.5px] border-white transition-all duration-200 hover:-translate-y-1.5 hover:rotate-1 ${padding} ${glowClass} ${
        dimmed ? "opacity-45 scale-95" : ""
      }`}
      style={{
        background: `linear-gradient(145deg, ${elementTheme.color}35 0%, var(--surface) 65%)`,
        boxShadow: `0 6px 0 var(--border-dark), 0 12px 18px rgba(0,0,0,0.45)`,
        ["--rarity-glow" as string]: rarityTheme.color,
      }}
    >
      {shineClass && <div className={shineClass} aria-hidden="true" />}
      
      {badge && (
        <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-pink-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-md">
          {badge}
        </span>
      )}

      {/* Header: Name & Cost */}
      <div className="flex items-center justify-between gap-1.5 z-10">
        <span className={`font-bold tracking-tight text-white drop-shadow-sm ${nameSize}`}>{card.name}</span>
        
        {/* Cost Badge */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-sm"
          style={{ 
            background: `linear-gradient(135deg, ${elementTheme.color}, #090b14)`,
            boxShadow: '0 2px 0 var(--border-dark)'
          }}
        >
          {card.cost}
        </span>
      </div>

      {/* Creature Emblem / Illustration */}
      <div className="card-emblem-float flex items-center justify-center py-2.5 z-10">
        <AlienEmblem element={card.element} rarity={card.rarity} accent={elementTheme.color} className={emblemSize} />
      </div>

      {/* Info: Element & Stars */}
      <div className="flex items-center justify-between text-[11px] font-bold z-10">
        <span 
          className="px-2 py-0.5 rounded-full border border-white/20 text-white text-[10px] uppercase tracking-wide"
          style={{ backgroundColor: `${elementTheme.color}50` }}
        >
          {elementTheme.label}
        </span>
        <span style={{ color: rarityTheme.color }} className="drop-shadow-sm font-black text-[10px]">
          {"★".repeat(rarityTheme.stars)}
        </span>
      </div>

      {/* Stats Section: Attack & Health */}
      <div className="mt-2.5 flex items-center gap-2 z-10">
        {/* Attack Sticker */}
        <span className="flex items-center gap-1 rounded-lg border-2 border-white bg-amber-500 px-2 py-0.5 text-xs font-black text-white shadow-sm">
          ⚔ {card.attack}
        </span>
        {/* Health Sticker */}
        <span className="flex items-center gap-1 rounded-lg border-2 border-white bg-emerald-500 px-2 py-0.5 text-xs font-black text-white shadow-sm">
          ♥ {card.health}
        </span>
      </div>
    </div>
  );
}
