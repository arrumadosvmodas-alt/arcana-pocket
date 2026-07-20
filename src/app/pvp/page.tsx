"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedPage } from "@/components/ProtectedPage";
import { authFetch } from "@/lib/api";
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
  const [inviteId, setInviteId] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
    // Check if there is an invite in the URL
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const invite = searchParams.get("invite");
      if (invite) {
        setInviteId(invite);
      }
    }
  }, []);

  async function loadDecks() {
    try {
      const res = await authFetch("/api/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
        if (data.length > 0) {
          setSelectedDeck(data[0].id);
        }
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
      const res = await authFetch("/api/battles/matchmake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: selectedDeck,
          inviteMatchId: inviteId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao conectar à partida.");
        return;
      }

      setMatchId(data.matchId);

      if (data.status === "matched") {
        setOpponent(data.opponent);
        setStatus("matched");
      } else {
        setStatus("waiting");
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
        const res = await authFetch(`/api/battles/get?id=${id}`);
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

    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }

  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/pvp?invite=${matchId}` : "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black text-white drop-shadow-sm uppercase tracking-wide border-b-4 border-black pb-2">
        Batalha PvP Online ⚔️
      </h1>

      {error && (
        <div className="rounded-xl border-2 border-red-500 bg-red-950/40 p-4 text-red-200 text-xs font-bold shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {inviteId && status === "selecting" && (
        <div className="rounded-2xl border-3 border-dashed border-pink-400 bg-pink-950/20 p-4 text-center font-bold text-white text-sm">
          👋 Você foi convidado para uma partida! Selecione seu deck abaixo para entrar na arena.
        </div>
      )}

      {status === "selecting" && (
        <div className="sticker-container p-6">
          <h2 className="mb-4 text-xl font-bold text-yellow-400">Selecione seu deck</h2>

          {decks.length === 0 ? (
            <div className="text-center text-[var(--muted)] font-bold">
              <p>Você não tem decks criados com 15 cartas.</p>
              <Link href="/decks" className="text-[var(--accent)] hover:underline block mt-2">
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
                    className={`w-full rounded-xl border-3 p-4 text-left font-black transition-all cursor-pointer ${
                      selectedDeck === deck.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 scale-102"
                        : "border-[var(--border)] hover:border-[var(--accent)] bg-black/20"
                    }`}
                  >
                    <div className="text-white text-base">🃏 {deck.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleMatchmake}
                disabled={loading || !selectedDeck}
                className="w-full btn-sticker py-3.5 text-sm"
              >
                {loading ? "Preparando arena..." : inviteId ? "Ingressar na Partida" : "Encontrar Adversário"}
              </button>
            </>
          )}
        </div>
      )}

      {status === "waiting" && (
        <div className="sticker-container p-6 text-center flex flex-col items-center gap-4">
          <div className="text-4xl animate-bounce">⏳</div>
          <h2 className="text-xl font-black text-pink-400">Aguardando oponente...</h2>
          <p className="text-sm font-semibold text-[var(--muted)]">Copie o link abaixo e envie para seu amigo entrar:</p>
          
          <div className="w-full flex gap-2 items-center bg-black/45 p-3 rounded-xl border border-white/10 mt-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="bg-transparent text-xs font-semibold text-white outline-none flex-1 truncate select-all"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                alert("Link de convite copiado!");
              }}
              className="px-3 py-1 bg-[var(--accent)] text-white font-bold text-xs rounded-lg hover:opacity-90 transition-opacity"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {status === "matched" && (
        <div className="sticker-container p-6 text-center flex flex-col items-center gap-4">
          <div className="text-5xl animate-pulse">⚔️</div>
          <h2 className="text-2xl font-black text-emerald-400">Pronto para a Batalha!</h2>
          <p className="text-sm font-bold text-white">Você está conectado contra o adversário.</p>
          <Link
            href={`/battle?matchId=${matchId}`}
            className="w-full btn-sticker btn-sticker-yellow py-3.5 text-sm block"
          >
            Começar Batalha
          </Link>
        </div>
      )}

      {status === "finished" && (
        <div className="sticker-container p-6 text-center">
          <h2 className="mb-4 text-xl font-bold">Batalha Finalizada</h2>
          <Link href="/ranking" className="text-[var(--accent)] hover:underline">
            Ver Ranking
          </Link>
        </div>
      )}
    </div>
  );
}
