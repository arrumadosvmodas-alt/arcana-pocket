"use client";

import { useState } from "react";
import { BattleCard, BattleState, botChooseAction, endRound, passRound, playCard } from "@/lib/engine/battle";
import { ELEMENT_THEME, RARITY_THEME } from "@/lib/engine/cards";
import { authFetch } from "@/lib/api";

function MiniCard({ card }: { card: BattleCard }) {
  const elementTheme = ELEMENT_THEME[card.element];
  const rarityTheme = RARITY_THEME[card.rarity];
  return (
    <div
      className="flex w-full flex-col items-center rounded-xl border-[2.5px] border-white p-2 text-[10px] shadow-sm transition-all"
      style={{ 
        borderColor: '#ffffff',
        background: `linear-gradient(135deg, ${elementTheme.color}35 0%, var(--surface-2) 100%)`,
        boxShadow: '0 3px 0 var(--border-dark)'
      }}
    >
      <span className="font-extrabold text-white leading-tight text-center drop-shadow-sm truncate w-full">
        {card.name}
      </span>
      <div className="mt-1 flex gap-2 font-black">
        <span className="text-amber-400">⚔{card.attack}</span>
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
  const [reward, setReward] = useState<any>(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  async function notifyBattleEnd(status: BattleState["status"]) {
    if (status !== "ongoing") {
      try {
        const res = await authFetch("/api/battle/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reward) {
            setReward(data.reward);
            setShowRewardModal(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handlePlay(lane: number) {
    if (!selectedCardId || state.playerPlayedThisRound) return;
    
    // 1. Play card for player
    let next = playCard(state, "player", selectedCardId, lane);
    setSelectedCardId(null);

    // 2. Play card for bot immediately and end round
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

  function handlePass() {
    // 1. Pass player turn
    let next = passRound(state, "player");

    // 2. Play card for bot immediately and end round
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

  const selectedPlayerCard = selectedCardId ? state.playerHand.find((c) => c.id === selectedCardId) : null;
  const isAffordable = selectedPlayerCard ? selectedPlayerCard.cost <= state.energy : false;

  return (
    <div className="flex flex-col gap-5 p-4 rounded-2xl border-3 border-black bg-[var(--surface)] shadow-lg">
      
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-black bg-black/20 p-2.5 rounded-xl border border-white/10">
        <span className="text-white">
          🔮 MANA: <span className="text-cyan-400 text-sm">{state.energy}/{state.maxEnergy}</span>
        </span>
        <span className="text-[var(--muted)]">
          RODADA: <span className="text-white text-sm">{state.round}/{state.maxRounds}</span>
        </span>
      </div>

      {/* Opponent Section */}
      <div className="flex items-center justify-between gap-2">
        <LifeBar label="🤖 OPONENTE" value={state.botLife} max={state.startingLife} color="#ff477e" />
      </div>

      {/* Lanes Board */}
      <div className="grid grid-cols-3 gap-3">
        {state.lanes.map((lane, i) => (
          <div 
            key={i} 
            className="flex h-24 items-center justify-center rounded-xl border-[2.5px] border-black bg-[var(--surface-2)] p-1.5 shadow-inner"
            style={{ boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.3)' }}
          >
            {lane.bot ? (
              <MiniCard card={lane.bot} />
            ) : (
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">LIVRE</span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t-2 border-dashed border-black/30 my-1" />

      {/* Player Lanes Board */}
      <div className="grid grid-cols-3 gap-3">
        {state.lanes.map((lane, i) => (
          <button
            key={i}
            onClick={() => handlePlay(i)}
            disabled={!selectedCardId || lane.player !== null || state.playerPlayedThisRound || !isAffordable}
            className="flex h-24 items-center justify-center rounded-xl border-3 border-dashed border-[var(--border)] bg-[var(--surface-2)] p-1.5 transition-all enabled:hover:border-[var(--accent)] enabled:hover:scale-102 enabled:active:scale-98 disabled:opacity-90 cursor-pointer"
          >
            {lane.player ? (
              <MiniCard card={lane.player} />
            ) : (
              <span className="text-[10px] font-black text-pink-400 uppercase tracking-wider animate-pulse">
                {selectedCardId ? (isAffordable ? "Jogar Aqui" : "Sem Mana") : "Vazio"}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Player Health */}
      <LifeBar label="⭐ VOCÊ" value={state.playerLife} max={state.startingLife} color="#2ec4b6" />

      {/* Player Hand */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border-[3px] border-black bg-black/10 p-3 shadow-inner">
        {state.playerHand.map((card) => {
          const isSelected = selectedCardId === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCardId((id) => (id === card.id ? null : card.id))}
              disabled={state.playerPlayedThisRound}
              className={`w-24 shrink-0 rounded-xl transition-all duration-150 cursor-pointer ${
                isSelected ? "-translate-y-2" : ""
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              style={{
                filter: isSelected ? 'drop-shadow(0 6px 8px rgba(255, 71, 126, 0.4))' : 'none'
              }}
            >
              <MiniCard card={card} />
              <div className="mt-1.5 text-center text-[10px] font-extrabold text-[var(--accent-2)] bg-black/35 py-0.5 rounded-md">
                MANA: {card.cost}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-1">
        <button 
          onClick={handlePass} 
          disabled={state.playerPlayedThisRound} 
          className="btn-sticker btn-sticker-sec w-full text-xs sm:text-sm py-2.5"
        >
          Passar Turno
        </button>
      </div>

      {/* Battle Log */}
      <details className="text-[11px] text-[var(--muted)] bg-black/20 p-2.5 rounded-xl border border-white/5">
        <summary className="cursor-pointer font-bold hover:text-white transition-colors select-none">HISTÓRICO DA BATALHA</summary>
        <ul className="mt-2 flex flex-col gap-1 max-h-20 overflow-y-auto scrollbar-none font-medium">
          {state.log.map((entry, i) => (
            <li key={i} className="border-b border-white/5 pb-0.5">{entry}</li>
          ))}
        </ul>
      </details>

      {/* Final Battle Status overlay */}
      {state.status !== "ongoing" && (
        <div className="rounded-2xl border-3 border-black bg-[var(--surface-2)] p-4 text-center font-black text-white text-lg shadow-lg">
          {state.status === "player_win" && "VOCÊ VENCEU! 🎉"}
          {state.status === "bot_win" && "VOCÊ PERDEU. 💀"}
          {state.status === "draw" && "EMPATE! 🤝"}
        </div>
      )}

      {/* Surprise Box Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="w-full max-w-sm sticker-container p-6 text-center shadow-2xl relative border-4 border-black rounded-3xl bg-[var(--surface)]">
            <h3 className="text-2xl font-black text-yellow-400 mb-4 uppercase tracking-wider">
              🎁 CAIXA SURPRESA! 🎁
            </h3>
            
            {!boxOpened ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <svg className="w-24 h-24 text-pink-500 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-3.18c.11-.31.18-.65.18-1a2.5 2.5 0 0 0-5-1.5c-.32 0-.62-.07-.9-.18A2.5 2.5 0 0 0 8.5 2c-.35 0-.69.07-1 .18V6H4c-1.1 0-2 .9-2 2v2c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V8c0-1.1-.9-2-2-2m-8-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .09-.07.2-.18.33A2.43 2.43 0 0 0 13.5 5h-1.5V4.5M8.5 3c.83 0 1.5.67 1.5 1.5V5H8.5c-.83 0-1.5-.67-1.5-1.5 0-.09.07-.2.18-.33A2.43 2.43 0 0 0 8.5 3M3 12v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8H3m8 8H5v-6h6v6m8 0h-6v-6h6v6z"/>
                </svg>
                <p className="text-xs font-bold text-gray-300">Você ganhou uma caixa surpresa pela sua vitória!</p>
                <button
                  onClick={() => setBoxOpened(true)}
                  className="btn-sticker btn-sticker-yellow mt-2 px-6 py-2.5 text-sm w-full"
                >
                  Abrir Caixa
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="text-6xl animate-pulse">
                  {reward?.type === "COINS" && "🪙"}
                  {reward?.type === "GEMS" && "💎"}
                  {reward?.type === "CARD" && "🃏"}
                  {reward?.type === "UPGRADE" && "🧬"}
                </div>
                <div className="text-sm font-black text-white px-4 py-3.5 bg-black/40 rounded-xl border border-white/10">
                  {reward?.label}
                </div>
                <button
                  onClick={() => {
                    setShowRewardModal(false);
                    setBoxOpened(false);
                  }}
                  className="btn-sticker mt-2 px-6 py-2.5 text-sm w-full"
                >
                  Pegar Recompensa
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LifeBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs font-black text-white mb-1">
        <span>{label}</span>
        <span>
          {value}/{max} HP
        </span>
      </div>
      <div className="h-4.5 w-full overflow-hidden rounded-full border-3 border-black bg-black/30 p-[2px]">
        <div 
          className="h-full rounded-full transition-all duration-300" 
          style={{ width: `${pct}%`, backgroundColor: color }} 
        />
      </div>
    </div>
  );
}
