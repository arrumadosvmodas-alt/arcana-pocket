import { ELEMENT_THEME, RARITY_THEME, Element, Rarity } from "@/lib/engine/cards";

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
  const padding = size === "sm" ? "p-2 text-xs" : "p-3 text-sm";
  const nameSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border ${padding} ${
        dimmed ? "opacity-40" : ""
      }`}
      style={{
        borderColor: rarityTheme.color,
        background: `linear-gradient(160deg, ${elementTheme.color}22, var(--surface) 55%)`,
        boxShadow: `0 0 0 1px ${elementTheme.color}33 inset`,
      }}
    >
      {badge && (
        <span className="absolute -right-2 -top-2 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-1">
        <span className={`font-semibold ${nameSize}`}>{card.name}</span>
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: elementTheme.color }}
        >
          {card.cost}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>{elementTheme.label}</span>
        <span style={{ color: rarityTheme.color }}>
          {"★".repeat(rarityTheme.stars)} {rarityTheme.label}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold">
        <span className="text-[var(--accent-2)]">⚔ {card.attack}</span>
        <span className="text-emerald-400">♥ {card.health}</span>
      </div>
    </div>
  );
}
