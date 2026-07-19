"use client";

import { useEffect, useState } from "react";

type Mission = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  coinsReward: number;
  gemsReward: number;
  claimedAt: string | null;
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  async function loadMissions() {
    // Sync card count mission
    await fetch("/api/missions/sync-cards", { method: "POST" }).catch(() => {});

    const res = await fetch("/api/missions");
    if (res.ok) setMissions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadMissions();
  }, []);

  async function claimMission(id: string) {
    setClaiming(id);
    const res = await fetch(`/api/missions/${id}/claim`, { method: "POST" });
    if (res.ok) {
      await loadMissions();
    }
    setClaiming(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Missões Diárias</h1>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
            const isClaimed = m.claimedAt !== null;
            const canClaim = m.progress >= m.target && !isClaimed;

            return (
              <div key={m.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-xs text-[var(--muted)]">{m.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    {m.coinsReward > 0 && <div className="font-bold">{m.coinsReward}🪙</div>}
                    {m.gemsReward > 0 && <div className="font-bold text-[var(--accent)]">{m.gemsReward}💎</div>}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>Progresso</span>
                    <span>
                      {m.progress}/{m.target}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isClaimed ? "bg-emerald-500" : pct === 100 ? "bg-[var(--accent)]" : "bg-[var(--muted)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => claimMission(m.id)}
                  disabled={!canClaim || claiming === m.id}
                  className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${
                    isClaimed
                      ? "bg-emerald-600 text-white"
                      : canClaim
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                  } disabled:opacity-50`}
                >
                  {isClaimed ? "✓ Reclamada" : canClaim ? claiming === m.id ? "Reclamando..." : "Reclamar" : "Incompleta"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
