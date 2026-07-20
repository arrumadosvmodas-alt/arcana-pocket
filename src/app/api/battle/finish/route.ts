import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { incrementMissionProgress } from "@/lib/missions";
import { getProfileIdFromRequest } from "@/lib/auth";

const resultSchema = z.object({ status: z.enum(["player_win", "bot_win", "draw"]) });

export async function POST(req: Request) {
  const profileId = await getProfileIdFromRequest(req);
  try {
    const { status } = resultSchema.parse(await req.json());
    let reward: any = null;

    if (status === "player_win") {
      await incrementMissionProgress(profileId, "FIRST_VICTORY", 1);

      // Roll surprise box reward!
      const rand = Math.random();
      const wallet = await prisma.wallet.findUnique({ where: { profileId } });
      
      if (rand < 0.35) {
        // Moedas
        const amount = Math.floor(Math.random() * 101) + 50; // 50 to 150
        if (wallet) {
          await prisma.wallet.update({
            where: { profileId },
            data: { coins: wallet.coins + amount },
          });
        }
        reward = { type: "COINS", amount, label: `${amount} Moedas 🪙` };
      } else if (rand < 0.60) {
        // Gemas
        const amount = Math.floor(Math.random() * 21) + 10; // 10 to 30
        if (wallet) {
          await prisma.wallet.update({
            where: { profileId },
            data: { gems: wallet.gems + amount },
          });
        }
        reward = { type: "GEMS", amount, label: `${amount} Gemas 💎` };
      } else if (rand < 0.80) {
        // Upgrade de Criatura
        const ownedCards = await prisma.playerCard.findMany({
          where: { profileId, quantity: { gt: 0 } },
          include: { cardDefinition: true },
        });
        
        if (ownedCards.length > 0) {
          const target = ownedCards[Math.floor(Math.random() * ownedCards.length)];
          const upgradeType = Math.random() < 0.5 ? "ATTACK" : "HEALTH";
          
          await prisma.playerCard.update({
            where: { id: target.id },
            data: {
              upgradeAttack: upgradeType === "ATTACK" ? { increment: 1 } : undefined,
              upgradeHealth: upgradeType === "HEALTH" ? { increment: 1 } : undefined,
            },
          });
          reward = {
            type: "UPGRADE",
            cardName: target.cardDefinition.name,
            upgradeType,
            label: `Upgrade de +1 ${upgradeType === "ATTACK" ? "⚔ Ataque" : "♥ HP"} em ${target.cardDefinition.name}! 🧬`,
          };
        } else {
          // Fallback to coins
          const amount = 100;
          if (wallet) {
            await prisma.wallet.update({
              where: { profileId },
              data: { coins: wallet.coins + amount },
            });
          }
          reward = { type: "COINS", amount, label: `${amount} Moedas 🪙` };
        }
      } else {
        // Carta Especial
        const allCards = await prisma.cardDefinition.findMany();
        if (allCards.length > 0) {
          const card = allCards[Math.floor(Math.random() * allCards.length)];
          await prisma.playerCard.upsert({
            where: { profileId_cardDefinitionId: { profileId, cardDefinitionId: card.id } },
            update: { quantity: { increment: 1 } },
            create: { profileId, cardDefinitionId: card.id, quantity: 1 },
          });
          reward = { type: "CARD", cardName: card.name, label: `Nova carta especial: ${card.name}! 🃏` };
        } else {
          // Fallback to coins
          const amount = 100;
          if (wallet) {
            await prisma.wallet.update({
              where: { profileId },
              data: { coins: wallet.coins + amount },
            });
          }
          reward = { type: "COINS", amount, label: `${amount} Moedas 🪙` };
        }
      }
    }

    return NextResponse.json({ ok: true, reward });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao registrar resultado." }, { status: 500 });
  }
}
