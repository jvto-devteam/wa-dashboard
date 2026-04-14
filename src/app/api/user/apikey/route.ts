import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function generateApiKey(): string {
  return Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  ).join("-");
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const newKey = generateApiKey();
  await db.user.update({
    where: { id: session.userId },
    data: { apiKey: newKey },
  });

  return NextResponse.json({ apiKey: newKey });
}
