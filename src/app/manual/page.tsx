"use client";

import { ProtectedPage } from "@/components/ProtectedPage";
import { CardView } from "@/components/CardView";

export default function ManualPage() {
  const exampleCard = {
    name: "Cinderwolf",
    element: "FIRE" as const,
    rarity: "RARE" as const,
    cost: 3,
    attack: 4,
    health: 6,
  };

  return (
    <ProtectedPage>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black text-white drop-shadow-sm uppercase tracking-wide border-b-4 border-black pb-2">
          Manual do Jogo: Como Jogar 📖
        </h1>

        {/* Intro */}
        <section className="sticker-container p-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-pink-400">O que é o Arcana Pocket?</h2>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            O Arcana Pocket é um jogo tático de cartas colecionáveis rápidas. Seu objetivo é invocar criaturas alienígenas fofas nas zonas de combate para derrotar a vida do bot inimigo.
          </p>
        </section>

        {/* Card explanation */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex justify-center order-last md:order-first">
            <div className="w-56">
              <CardView card={exampleCard} />
            </div>
          </div>
          <div className="sticker-container p-6 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-yellow-400">Anatomia de uma Carta</h2>
            <ul className="text-xs space-y-2.5 font-bold text-[var(--foreground)]">
              <li>
                <span className="text-amber-400 bg-black/30 px-2 py-0.5 rounded border border-white/10 mr-1.5">NOME</span>
                Cinderwolf - Identifica o monstrinho.
              </li>
              <li>
                <span className="text-amber-400 bg-black/30 px-2 py-0.5 rounded border border-white/10 mr-1.5">ENERGIA (Círculo Superior)</span>
                Custo para invocar a criatura da sua mão (consome sua energia do turno).
              </li>
              <li>
                <span className="text-yellow-500 bg-black/30 px-2 py-0.5 rounded border border-white/10 mr-1.5">ATAQUE (⚔)</span>
                A quantidade de dano que esta criatura causa à criatura inimiga da mesma lane.
              </li>
              <li>
                <span className="text-emerald-400 bg-black/30 px-2 py-0.5 rounded border border-white/10 mr-1.5">VIDA (♥)</span>
                A saúde da criatura. Se cair a 0, ela é destruída.
              </li>
            </ul>
          </div>
        </section>

        {/* Combat Board (Lanes) */}
        <section className="sticker-container p-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-cyan-400">As Três Rotas (Lanes) ⚔️</h2>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            A mesa de batalha possui 3 rotas independentes.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black my-2">
            <div className="border-2 border-dashed border-cyan-400/50 bg-cyan-950/20 p-3 rounded-xl">ROTA ESQUERDA</div>
            <div className="border-2 border-dashed border-cyan-400/50 bg-cyan-950/20 p-3 rounded-xl">ROTA CENTRAL</div>
            <div className="border-2 border-dashed border-cyan-400/50 bg-cyan-950/20 p-3 rounded-xl">ROTA DIREITA</div>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1.5 font-semibold text-[var(--muted)]">
            <li>As criaturas jogadas combatem apenas as criaturas que estão na **mesma coluna**.</li>
            <li>Se você atacar uma rota onde o oponente não tem criatura, o dano será causado **diretamente nos pontos de vida** do oponente.</li>
          </ul>
        </section>

        {/* Turn flow */}
        <section className="sticker-container p-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-emerald-400">Estrutura das Rodadas</h2>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            Cada partida tem um limite de rodadas. Em cada rodada:
          </p>
          <ol className="list-decimal list-inside text-xs space-y-2 font-bold text-[var(--muted)]">
            <li>Você ganha energia máxima equivalente ao número da rodada atual.</li>
            <li>Durante seu turno, você pode invocar quantas cartas puder pagar.</li>
            <li>Você pode clicar em **Passar Turno** se não quiser mais jogar cartas nesta rodada.</li>
            <li>Ao clicar em **Avançar Rodada**, o bot fará sua jogada, o combate das três rotas será calculado simultaneamente e uma nova rodada começará.</li>
          </ol>
        </section>
      </div>
    </ProtectedPage>
  );
}
