import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Run Prisma migrations
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy", {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    return NextResponse.json({
      status: "success",
      message: "Migrations completed",
      output: stdout,
    });
  } catch (error: any) {
    // Ignore "already applied" errors
    if (error.message.includes("No pending migrations")) {
      return NextResponse.json({
        status: "success",
        message: "No pending migrations",
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
