import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function generateApiKey(): string {
  return Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  ).join("-");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const number = await db.waNumber.findUnique({ where: { id } });
  if (!number) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role !== "ADMIN" && number.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.waNumber.update({
    where: { id },
    data: { apiKey: generateApiKey() },
  });

  return NextResponse.json({ apiKey: updated.apiKey });
}
