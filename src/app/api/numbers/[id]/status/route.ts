import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient } from "@/lib/wa-client";

export async function GET(
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

  const client = await getOrCreateWaClient(id);
  return NextResponse.json({ ...client.getStatus(), label: number.label, apiKey: number.apiKey });
}
