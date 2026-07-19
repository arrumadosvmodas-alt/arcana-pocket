import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCAL_PROFILE_ID } from "@/lib/player";
import { incrementMissionProgress } from "@/lib/missions";

const resultSchema = z.object({ status: z.enum(["player_win", "bot_win", "draw"]) });

export async function POST(req: Request) {
  try {
    const { status } = resultSchema.parse(await req.json());

    if (status === "player_win") {
      await incrementMissionProgress(LOCAL_PROFILE_ID, "FIRST_VICTORY", 1);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao registrar resultado." }, { status: 500 });
  }
}
