"use client";

import { useEffect, useState } from "react";

type Mission = {
  id: string;
  title: string;
  description: string;
  target: number;
  coinsReward: number;
  gemsReward: number;
  isActive: boolean;
};

type ShopPackage = {
  id: string;
  name: string;
  description: string;
  cardsCount: number;
  gemPrice: number;
  isActive: boolean;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"missions" | "shop">("missions");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [packages, setPackages] = useState<ShopPackage[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [missRes, shopRes] = await Promise.all([
      fetch("/api/admin/missions"),
      fetch("/api/admin/shop"),
    ]);
    if (missRes.ok) setMissions(await missRes.json());
    if (shopRes.ok) setPackages(await shopRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function toggleMissionActive(id: string, active: boolean) {
    await fetch(`/api/admin/missions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    await loadAll();
  }

  async function toggleShopActive(id: string, active: boolean) {
    await fetch(`/api/admin/shop/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    await loadAll();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">🔧 Painel Admin</h1>

      <div className="flex gap-2 border-b border-[var(--border)]">
        {(["missions", "shop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 ${tab === t ? "border-b-2 border-[var(--accent)] font-bold" : "text-[var(--muted)]"}`}
          >
            {t === "missions" ? "Missões" : "Loja"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">Carregando...</p>
      ) : (
        <>
          {tab === "missions" && (
            <div className="flex flex-col gap-3">
              {missions.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-[var(--surface)] p-3">
                  <div className="flex-1">
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-xs text-[var(--muted)]">{m.description}</div>
                    <div className="mt-1 text-xs">
                      Target: {m.target} | Reward: {m.coinsReward}🪙 {m.gemsReward}💎
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMissionActive(m.id, m.isActive)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      m.isActive ? "bg-emerald-600 text-white" : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {m.isActive ? "Ativo" : "Inativo"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "shop" && (
            <div className="flex flex-col gap-3">
              {packages.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--surface)] p-3">
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-[var(--muted)]">{p.description}</div>
                    <div className="mt-1 text-xs">
                      {p.cardsCount} cartas | {p.gemPrice}💎
                    </div>
                  </div>
                  <button
                    onClick={() => toggleShopActive(p.id, p.isActive)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      p.isActive ? "bg-emerald-600 text-white" : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {p.isActive ? "Ativo" : "Inativo"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-4 rounded-lg border border-yellow-700 bg-yellow-900/30 p-3 text-xs text-yellow-200">
        ⚠️ Painel de demo — sem autenticação, sem CRUD de criação de missões/packages novo. Apenas toggle de ativo/inativo.
      </div>
    </div>
  );
}
