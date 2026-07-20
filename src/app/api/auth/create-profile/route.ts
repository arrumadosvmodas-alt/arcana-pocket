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
      },
    });

    // Create wallet with starting resources
    await prisma.wallet.create({
      data: {
        profileId: userId,
        coins: 500,
        gems: 0,
        stamina: 6,
        maxStamina: 6,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar perfil" },
      { status: 500 }
    );
  }
}
