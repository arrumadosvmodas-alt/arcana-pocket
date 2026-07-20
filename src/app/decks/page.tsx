"use client";

import { useEffect, useState } from "react";
import { DeckBuilder, OwnedCard } from "@/components/DeckBuilder";
import { CardView } from "@/components/CardView";
import { ProtectedPage } from "@/components/ProtectedPage";
import { authFetch } from "@/lib/api";

type DeckCard = { quantity: number; cardDefinition: OwnedCard };
type Deck = { id: string; name: string; deckCards: DeckCard[] };

export default function DecksPage() {
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    const [cardsRes, decksRes] = await Promise.all([authFetch("/api/cards"), authFetch("/api/decks")]);
    const cards = await cardsRes.json();
    const deckList = await decksRes.json();
    setOwnedCards(cards.filter((c: OwnedCard) => c.owned > 0));
    setDecks(deckList);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSave(name: string, entries: { cardDefinitionId: string; quantity: number }[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cards: entries }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar deck.");
        return;
      }
      setShowBuilder(false);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await authFetch(`/api/decks/${id}`, { method: "DELETE" });
    await loadAll();
  }

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Decks</h1>
          <button
            onClick={() => setShowBuilder((v) => !v)}
            className="rounded-full bg-[var(--surface-2)] px-4 py-1.5 text-sm font-semibold"
          >
            {showBuilder ? "Cancelar" : "+ Novo deck"}
          </button>
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}

        {showBuilder ? (
          ownedCards.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Você não possui nenhuma carta para construir um deck.</p>
          ) : (
            <DeckBuilder ownedCards={ownedCards} onSave={handleSave} saving={saving} />
          )
        ) : (
          <div className="flex flex-col gap-4">
            {decks.length === 0 && <p className="text-sm text-[var(--muted)]">Nenhum deck salvo ainda.</p>}
            {decks.map((deck) => (
              <div key={deck.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">{deck.name}</span>
                  <button onClick={() => handleDelete(deck.id)} className="text-xs text-red-400">
                    Excluir
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {deck.deckCards.map((dc) => (
                    <CardView key={dc.cardDefinition.id} card={dc.cardDefinition} size="sm" badge={`x${dc.quantity}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
