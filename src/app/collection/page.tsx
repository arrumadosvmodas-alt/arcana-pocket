"use client";

import { useEffect, useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import { ELEMENTS, RARITIES, Element, Rarity } from "@/lib/engine/cards";
import { ProtectedPage } from "@/components/ProtectedPage";
import { authFetch } from "@/lib/api";

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
    authFetch("/api/cards")
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
    <ProtectedPage>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--border)] pb-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold">Coleção</h1>
            <p className="text-xs text-[var(--muted)]">
              {ownedCount} / {cards.length} cartas obtidas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none focus:border-[var(--accent)]"
            />
            <select
              value={element}
              onChange={(e) => setElement(e.target.value as Element | "ALL")}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none"
            >
              <option value="ALL">Todos Elementos</option>
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value as Rarity | "ALL")}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none"
            >
              <option value="ALL">Todas Raridades</option>
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
    </ProtectedPage>
  );
}
