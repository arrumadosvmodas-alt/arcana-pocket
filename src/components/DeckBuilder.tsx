"use client";

import { useMemo, useState } from "react";
import { CardView, CardViewData } from "@/components/CardView";
import { DECK_SIZE, MAX_COPIES_PER_CARD_IN_DECK } from "@/lib/engine/cards";

export type OwnedCard = CardViewData & { id: string; owned: number };

export function DeckBuilder({
  ownedCards,
  onSave,
  saving,
}: {
  ownedCards: OwnedCard[];
  onSave: (name: string, entries: { cardDefinitionId: string; quantity: number }[]) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("Meu Deck");
  const [selection, setSelection] = useState<Record<string, number>>({});

  const total = useMemo(() => Object.values(selection).reduce((a, b) => a + b, 0), [selection]);

  function addCopy(cardId: string, owned: number) {
    setSelection((prev) => {
      const current = prev[cardId] ?? 0;
      if (current >= MAX_COPIES_PER_CARD_IN_DECK || current >= owned) return prev;
      if (total >= DECK_SIZE) return prev;
      return { ...prev, [cardId]: current + 1 };
    });
  }

  function removeCopy(cardId: string) {
    setSelection((prev) => {
      const current = prev[cardId] ?? 0;
      if (current <= 0) return prev;
      const next = { ...prev, [cardId]: current - 1 };
      if (next[cardId] === 0) delete next[cardId];
      return next;
    });
  }

  function handleSave() {
    const entries = Object.entries(selection).map(([cardDefinitionId, quantity]) => ({
      cardDefinitionId,
      quantity,
    }));
    onSave(name, entries);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          placeholder="Nome do deck"
        />
        <span className={`text-sm font-semibold ${total === DECK_SIZE ? "text-emerald-400" : "text-[var(--muted)]"}`}>
          {total}/{DECK_SIZE}
        </span>
      </div>

      <button
        onClick={handleSave}
        disabled={total !== DECK_SIZE || saving}
        className="rounded-full bg-[var(--accent)] px-6 py-2 font-semibold text-white disabled:opacity-40"
      >
        {saving ? "Salvando..." : "Salvar deck"}
      </button>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {ownedCards.map((card) => {
          const count = selection[card.id] ?? 0;
          return (
            <div key={card.id} className="flex flex-col items-center gap-1">
              <CardView card={card} size="sm" badge={`${card.owned - count} restam`} dimmed={card.owned - count === 0 && count === 0} />
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => removeCopy(card.id)}
                  className="h-6 w-6 rounded-full bg-[var(--surface-2)] disabled:opacity-30"
                  disabled={count === 0}
                >
                  −
                </button>
                <span>{count}</span>
                <button
                  onClick={() => addCopy(card.id, card.owned)}
                  className="h-6 w-6 rounded-full bg-[var(--surface-2)] disabled:opacity-30"
                  disabled={count >= card.owned || count >= MAX_COPIES_PER_CARD_IN_DECK || total >= DECK_SIZE}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
