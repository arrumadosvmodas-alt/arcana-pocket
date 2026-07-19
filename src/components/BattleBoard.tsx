"use client";

import { useState } from "react";
import { BattleCard, BattleState, botChooseAction, endRound, passRound, playCard } from "@/lib/engine/battle";
import { ELEMENT_THEME, RARITY_THEME } from "@/lib/engine/cards";

function MiniCard({ card }: { card: BattleCard }) {
  const elementTheme = ELEMENT_THEME[card.element];
  const rarityTheme = RARITY_THEME[card.rarity];
  return (
    <div
      className="flex w-full flex-col items-center rounded-lg border p-1.5 text-[10px]"
      style={{ borderColor: rarityTheme.color, background: `${elementTheme.color}22` }}
    >
      <span className="font-semibold leading-tight">{card.name}</span>
      <div className="mt-1 flex gap-2 font-bold">
        <span className="text-[var(--accent-2)]">⚔{card.attack}</span>
        <span className="text-emerald-400">
          ♥{card.health}/{card.maxHealth}
        </span>
      </div>
    </div>
  );
}

export function BattleBoard({ initialState, onFinish }: { initialState: BattleState; onFinish: (state: BattleState) => void }) {
  const [state, setState] = useState(initialState);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  async function notifyBattleEnd(status: BattleState["status"]) {
    if (status !== "ongoing") {
      await fetch("/api/battle/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    }
  }

  function handlePlay(lane: number) {
    if (!selectedCardId || state.playerPlayedThisRound) return;
    const next = playCard(state, "player", selectedCardId, lane);
    setState(next);
    setSelectedCardId(null);
  }

  function handlePass() {
    setState((s) => passRound(s, "player"));
  }

  function handleAdvance() {
    let next = state;
    const botAction = botChooseAction(next);
    if (botAction) {
      next = playCard(next, "bot", botAction.cardId, botAction.lane);
    } else {
      next = passRound(next, "bot");
    }
    next = endRound(next);
    setState(next);
    if (next.status !== "ongoing") {
      notifyBattleEnd(next.status);
      onFinish(next);
    }
  }

  const canAdvance = state.playerPlayedThisRound || state.playerHand.every((c) => c.cost > state.energy);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span>
          Rodada {state.round}/{state.maxRounds} · Energia {state.energy}/{state.maxEnergy}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <LifeBar label="Oponente" value={state.botLife} max={state.startingLife} color="#ff6b6b" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {state.lanes.map((lane, i) => (
          <div key={i} className="flex h-20 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
            {lane.bot ? <MiniCard card={lane.bot} /> : <span className="text-xs text-[var(--muted)]">vazio</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {state.lanes.map((lane, i) => (
          <button
            key={i}
            onClick={() => handlePlay(i)}
            disabled={!selectedCardId || lane.player !== null || state.playerPlayedThisRound}
            className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-1 disabled:cursor-default enabled:hover:border-[var(--accent)]"
          >
            {lane.player ? <MiniCard card={lane.player} /> : <span className="text-xs text-[var(--muted)]">jogar aqui</span>}
          </button>
        ))}
      </div>
      <LifeBar label="Você" value={state.playerLife} max={state.startingLife} color="#5cd68a" />

      <div className="flex gap-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
        {state.playerHand.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCardId((id) => (id === card.id ? null : card.id))}
            disabled={card.cost > state.energy || state.playerPlayedThisRound}
            className={`w-20 shrink-0 rounded-lg transition-transform disabled:opacity-40 ${
              selectedCardId === card.id ? "-translate-y-1 ring-2 ring-[var(--accent)]" : ""
            }`}
          >
            <MiniCard card={card} />
            <div className="mt-0.5 text-center text-[10px] text-[var(--muted)]">custo {card.cost}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handlePass} disabled={state.playerPlayedThisRound} className="flex-1 rounded-full bg-[var(--surface-2)] py-2 text-sm font-semibold disabled:opacity-40">
          Passar
        </button>
        <button onClick={handleAdvance} disabled={!canAdvance} className="flex-1 rounded-full bg-[var(--accent)] py-2 text-sm font-semibold text-white disabled:opacity-40">
          Avançar rodada
        </button>
      </div>

      <details className="text-xs text-[var(--muted)]">
        <summary className="cursor-pointer">Histórico</summary>
        <ul className="mt-1 flex flex-col gap-0.5">
          {state.log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </details>

      {state.status !== "ongoing" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center font-semibold">
          {state.status === "player_win" && "Você venceu! 🎉"}
          {state.status === "bot_win" && "Você perdeu."}
          {state.status === "draw" && "Empate."}
        </div>
      )}
    </div>
  );
}

function LifeBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
