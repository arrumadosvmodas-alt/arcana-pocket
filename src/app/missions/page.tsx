"use client";

import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { authFetch } from "@/lib/api";

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
    await authFetch("/api/missions/sync-cards", { method: "POST" }).catch(() => {});

    const res = await authFetch("/api/missions");
    if (res.ok) setMissions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadMissions();
  }, []);

  async function claimMission(id: string) {
    setClaiming(id);
    const res = await authFetch(`/api/missions/${id}/claim`, { method: "POST" });
    if (res.ok) {
      await loadMissions();
    }
    setClaiming(null);
  }

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Missões Diárias</h1>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {missions.map((m) => {
              const pct = Math.min(100, Math.floor((m.progress / m.target) * 100));
              const canClaim = m.completed && !m.claimedAt;
              const isClaimed = m.claimedAt !== null;

              return (
                <div key={m.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{m.title}</h3>
                      <p className="text-xs text-[var(--muted)]">{m.description}</p>
                    </div>
                    <div className="text-right text-xs font-semibold">
                      {m.coinsReward > 0 && <span className="text-yellow-500">+{m.coinsReward}🪙 </span>}
                      {m.gemsReward > 0 && <span className="text-pink-500">+{m.gemsReward}💎</span>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-xs text-[var(--muted)] font-semibold">
                      <span>Progresso</span>
                      <span>
                        {m.progress}/{m.target} ({pct}%)
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
    </ProtectedPage>
  );
}
