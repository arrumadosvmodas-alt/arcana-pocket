"use client";

import { useEffect, useState } from "react";
import { CardView, CardViewData } from "@/components/CardView";

type Profile = { gems: number; coins: number };
type ShopPackage = { id: string; name: string; description: string; gemPrice: number; cardsCount: number };

export default function ShopPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<ShopPackage[]>([]);
  const [revealed, setRevealed] = useState<CardViewData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    const res = await fetch("/api/profile");
    if (res.ok) setProfile(await res.json());
  }

  useEffect(() => {
    Promise.all([loadProfile(), fetch("/api/shop/packages").then((r) => r.json()).then(setPackages)]);
  }, []);

  async function buyPackage(pkg: ShopPackage) {
    setLoading(true);
    setError(null);
    setRevealed(null);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopPackageId: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao comprar pacote.");
        return;
      }
      setRevealed(data.cards);
      await loadProfile();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
        <div className="text-sm text-[var(--muted)]">Saldo</div>
        <div className="flex justify-around gap-4">
          <div>
            <div className="text-lg font-bold">{profile?.coins ?? 0}</div>
            <div className="text-xs text-[var(--muted)]">Moedas</div>
          </div>
          <div>
            <div className="text-lg font-bold">{profile?.gems ?? 0}</div>
            <div className="text-xs text-[var(--muted)]">Gemas</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-xs text-[var(--muted)]">{pkg.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--accent)]">{pkg.gemPrice}💎</div>
                <div className="text-xs text-[var(--muted)]">{pkg.cardsCount} cartas</div>
              </div>
            </div>
            <button
              onClick={() => buyPackage(pkg)}
              disabled={loading || (profile && profile.gems < pkg.gemPrice)}
              className="w-full rounded-full bg-[var(--accent)] py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {loading ? "Comprando..." : "Comprar"}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {revealed && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
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
