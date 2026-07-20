"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedPage } from "@/components/ProtectedPage";
import Link from "next/link";

type Deck = { id: string; name: string };
type MatchStatus = "selecting" | "waiting" | "matched" | "finished";

export default function PvPPage() {
  return (
    <ProtectedPage>
      <PvPContent />
    </ProtectedPage>
  );
}

function PvPContent() {
  const { session } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [status, setStatus] = useState<MatchStatus>("selecting");
  const [matchId, setMatchId] = useState<string>("");
  const [opponent, setOpponent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDecks();
  }, []);

  async function loadDecks() {
    try {
      const res = await fetch("/api/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      }
    } catch (err) {
      console.error("Error loading decks:", err);
    }
  }

  async function handleMatchmake() {
    if (!selectedDeck) {
      setError("Selecione um deck");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/battles/matchmake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: selectedDeck }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setMatchId(data.matchId);

      if (data.status === "matched") {
        setOpponent(data.opponent);
        setStatus("matched");
      } else {
        setStatus("waiting");
        // Poll for match
        pollForMatch(data.matchId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function pollForMatch(id: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/battles/get?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "active") {
            setOpponent(data.player2Id || data.player1Id);
            setStatus("matched");
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Poll error:", err);
        clearInterval(interval);
      }
    }, 1000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Batalha PvP</h1>

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 text-red-400">
          {error}
        </div>
      )}

      {status === "selecting" && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 text-xl font-bold">Selecione seu deck</h2>

          {decks.length === 0 ? (
            <div className="text-center text-[var(--muted)]">
              <p>Você não tem decks criados</p>
              <Link href="/decks" className="text-[var(--accent)] hover:underline">
                Criar deck
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-2">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      selectedDeck === deck.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--border)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <div className="font-semibold">{deck.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleMatchmake}
                disabled={loading || !selectedDeck}
                className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Procurando adversário..." : "Encontrar Adversário"}
              </button>
            </>
          )}
        </div>
      )}

      {status === "waiting" && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <div className="mb-4 text-2xl">⏳</div>
          <h2 className="mb-2 text-xl font-bold">Procurando adversário...</h2>
          <p className="text-[var(--muted)]">Aguarde enquanto buscamos um oponente</p>
        </div>
      )}

      {status === "matched" && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <div className="mb-4 text-4xl">⚔️</div>
          <h2 className="mb-2 text-xl font-bold">Adversário encontrado!</h2>
          <p className="mb-4 text-[var(--muted)]">vs {opponent}</p>
          <Link
            href={`/battle?matchId=${matchId}`}
            className="inline-block rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-3 font-semibold text-white"
          >
            Começar Batalha
          </Link>
        </div>
      )}

      {status === "finished" && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <h2 className="mb-4 text-xl font-bold">Batalha Finalizada</h2>
          <Link href="/ranking" className="text-[var(--accent)] hover:underline">
            Ver Ranking
          </Link>
        </div>
      )}
    </div>
  );
}
