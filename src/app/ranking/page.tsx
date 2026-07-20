"use client";

import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";

type Ranking = {
  position: number;
  profileId: string;
  displayName: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: string;
};

export default function RankingPage() {
  return (
    <ProtectedPage>
      <RankingContent />
    </ProtectedPage>
  );
}

function RankingContent() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  async function loadRankings() {
    try {
      const res = await fetch("/api/ranking");
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings);
      }
    } catch (err) {
      console.error("Error loading rankings:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando ranking...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">🏆 Ranking Global</h1>

      {rankings.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
          Nenhum jogador no ranking ainda
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  Posição
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  Jogador
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">
                  Rating
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">
                  V-D
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--muted)]">
                  Taxa de Vitória
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank) => (
                <tr
                  key={rank.profileId}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {rank.position === 1 && <span>🥇</span>}
                      {rank.position === 2 && <span>🥈</span>}
                      {rank.position === 3 && <span>🥉</span>}
                      {rank.position > 3 && <span>{rank.position}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {rank.displayName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-white font-semibold">
                      {rank.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-400 font-semibold">
                      {rank.wins}
                    </span>
                    <span className="text-[var(--muted)]"> - </span>
                    <span className="text-red-400 font-semibold">
                      {rank.losses}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--muted)]">
                    {rank.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
