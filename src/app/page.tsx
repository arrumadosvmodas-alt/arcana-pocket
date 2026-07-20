import Link from "next/link";
import { prisma } from "@/lib/db";
import { LOCAL_PROFILE_ID, computeStaminaRegen } from "@/lib/player";
import { ProtectedPage } from "@/components/ProtectedPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, wallet, deckCount, cardCount] = await Promise.all([
    prisma.profile.findUnique({ where: { id: LOCAL_PROFILE_ID } }),
    prisma.wallet.findUnique({ where: { profileId: LOCAL_PROFILE_ID } }),
    prisma.deck.count({ where: { profileId: LOCAL_PROFILE_ID } }),
    prisma.playerCard.count({ where: { profileId: LOCAL_PROFILE_ID, quantity: { gt: 0 } } }),
  ]);

  const stamina = wallet ? computeStaminaRegen(wallet).stamina : 0;

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-2xl font-bold">Olá, {profile?.displayName ?? "Treinador"}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Abra pacotes, monte seu deck e enfrente o bot em duelos rápidos.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <StatBox label="Stamina" value={`${stamina}/${wallet?.maxStamina ?? 0}`} />
          <StatBox label="Moedas" value={String(wallet?.coins ?? 0)} />
          <StatBox label="Cartas" value={String(cardCount)} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <ActionCard href="/packs" title="Abrir pacote" desc="5 cartas por pacote" />
        <ActionCard href="/collection" title="Coleção" desc={`${cardCount} cartas únicas`} />
        <ActionCard href="/decks" title="Decks" desc={`${deckCount} deck(s) salvo(s)`} />
        <ActionCard href="/battle" title="Batalha" desc="PvE contra o bot" />
      </section>
    </div>
    </ProtectedPage>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]"
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{desc}</div>
    </Link>
  );
}
