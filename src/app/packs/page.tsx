"use client";

import { useEffect, useState } from "react";
import { CardView, CardViewData } from "@/components/CardView";

type Profile = { stamina: number; maxStamina: number; coins: number; nextPackAt: string | null };

export default function PacksPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [revealed, setRevealed] = useState<CardViewData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    const res = await fetch("/api/profile");
    if (res.ok) setProfile(await res.json());
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function openPack() {
    setLoading(true);
    setError(null);
    setRevealed(null);
    try {
      const res = await fetch("/api/packs/open", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao abrir pacote.");
        return;
      }
      setRevealed(data.cards);
      await loadProfile();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
        <div className="text-sm text-[var(--muted)]">Stamina</div>
        <div className="text-xl font-bold">
          {profile ? `${profile.stamina}/${profile.maxStamina}` : "…"}
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">Um pacote grátis regenera a cada 12h.</p>
      </div>

      <button
        onClick={openPack}
        disabled={loading || (profile !== null && profile.stamina < 1)}
        className="rounded-full bg-[var(--accent)] px-8 py-3 font-semibold text-white transition-opacity disabled:opacity-40"
      >
        {loading ? "Abrindo..." : "Abrir pacote (5 cartas)"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {revealed && (
        <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-5">
          {revealed.map((card, i) => (
            <div key={i} className="animate-[fadeIn_0.4s_ease]" style={{ animationDelay: `${i * 120}ms` }}>
              <CardView card={card} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
