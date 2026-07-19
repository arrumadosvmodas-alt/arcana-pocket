"use client";

import { useEffect, useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import { ELEMENTS, RARITIES, Element, Rarity } from "@/lib/engine/cards";

type CardWithOwned = {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  cost: number;
  attack: number;
  health: number;
  owned: number;
};

export default function CollectionPage() {
  const [cards, setCards] = useState<CardWithOwned[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [element, setElement] = useState<Element | "ALL">("ALL");
  const [rarity, setRarity] = useState<Rarity | "ALL">("ALL");
  const [onlyOwned, setOnlyOwned] = useState(false);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => setCards(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (element !== "ALL" && c.element !== element) return false;
      if (rarity !== "ALL" && c.rarity !== rarity) return false;
      if (onlyOwned && c.owned === 0) return false;
      return true;
    });
  }, [cards, search, element, rarity, onlyOwned]);

  const ownedCount = cards.filter((c) => c.owned > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">
        Coleção <span className="text-sm font-normal text-[var(--muted)]">({ownedCount}/{cards.length})</span>
      </h1>

      <div className="flex flex-col gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar carta..."
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={element}
            onChange={(e) => setElement(e.target.value as Element | "ALL")}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
          >
            <option value="ALL">Todos elementos</option>
            {ELEMENTS.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as Rarity | "ALL")}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
          >
            <option value="ALL">Todas raridades</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm">
            <input type="checkbox" checked={onlyOwned} onChange={(e) => setOnlyOwned(e.target.checked)} />
            Só possuídas
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {filtered.map((card) => (
            <CardView key={card.id} card={card} size="sm" badge={card.owned > 0 ? `x${card.owned}` : undefined} dimmed={card.owned === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
