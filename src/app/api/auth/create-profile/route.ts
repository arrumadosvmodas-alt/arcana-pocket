import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, displayName, email } = await req.json();

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        id: userId,
        displayName,
        role: email === "hslspe@hotmail.com" ? "ADMIN" : "USER",
      },
    });

    // Create wallet with starting resources
    await prisma.wallet.create({
      data: {
        profileId: userId,
        coins: 500,
        gems: 50, // give 50 starting gems
        stamina: 6,
        maxStamina: 6,
      },
    });

    // Seed a starting deck of 15 COMMON cards so the user has cards immediately
    const startingCards = await prisma.cardDefinition.findMany({
      where: { rarity: "COMMON" },
      take: 15,
    });

    if (startingCards.length > 0) {
      for (const card of startingCards) {
        await prisma.playerCard.create({
          data: {
            profileId: userId,
            cardDefinitionId: card.id,
            quantity: 2, // 2 copies
          },
        });
      }

      // Create a starter deck
      const deck = await prisma.deck.create({
        data: {
          profileId: userId,
          name: "Baralho Inicial 🃏",
        },
      });

      for (const card of startingCards) {
        await prisma.deckCard.create({
          data: {
            deckId: deck.id,
            cardDefinitionId: card.id,
            quantity: 1,
          },
        });
      }
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar perfil" },
      { status: 500 }
    );
  }
}
