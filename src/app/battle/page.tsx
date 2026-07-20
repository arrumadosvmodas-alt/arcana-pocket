"use client";

import { useEffect, useState } from "react";
import { BattleBoard } from "@/components/BattleBoard";
import { BattleCardSource, BattleState, createBattle } from "@/lib/engine/battle";
import { DECK_SIZE } from "@/lib/engine/cards";
import { ProtectedPage } from "@/components/ProtectedPage";

type DeckCard = { quantity: number; cardDefinition: BattleCardSource };
type Deck = { id: string; name: string; deckCards: DeckCard[] };

export default function BattlePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [catalog, setCatalog] = useState<BattleCardSource[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/decks").then((r) => r.json()), fetch("/api/cards").then((r) => r.json())]).then(
      ([deckList, cards]) => {
        setDecks(deckList);
        setCatalog(cards);
        if (deckList.length > 0) setSelectedDeckId(deckList[0].id);
      }
    );
  }, []);

  function buildBotDeck(): { card: BattleCardSource; quantity: number }[] {
    const shuffled = [...catalog];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, DECK_SIZE).map((card) => ({ card, quantity: 1 }));
  }

  function startBattle() {
    const deck = decks.find((d) => d.id === selectedDeckId);
    if (!deck) return;
    const playerCards = deck.deckCards.map((dc) => ({ card: dc.cardDefinition, quantity: dc.quantity }));
    const botCards = buildBotDeck();
    const seed = `${deck.id}-${Date.now()}`;
    setBattle(createBattle(playerCards, botCards, seed));
  }

  if (battle) {
    return (
      <ProtectedPage>
        <div className="flex flex-col gap-4">
          <BattleBoard initialState={battle} onFinish={() => {}} />
          <button onClick={() => setBattle(null)} className="rounded-full bg-[var(--surface-2)] py-2 text-sm font-semibold">
            Voltar
          </button>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Batalha PvE</h1>

        {decks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Você precisa de um deck com {DECK_SIZE} cartas para batalhar. Monte um em{" "}
            <a href="/decks" className="text-[var(--accent)] underline">
              Decks
            </a>
            .
          </p>
        ) : (
          <>
            <label className="text-sm text-[var(--muted)]">Escolha seu deck</label>
            <select
              value={selectedDeckId ?? ""}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button onClick={startBattle} className="rounded-full bg-[var(--accent)] py-2 text-sm font-semibold text-white">
              Iniciar batalha
            </button>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
