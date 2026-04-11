import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient } from "@/lib/wa-client";

export async function POST(
  req: NextRequest,
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

  try {
    const { to, url, type, caption, filename } = await req.json();

    if (!to || !url || !type) {
      return NextResponse.json(
        { error: "Missing required fields: to, url, type" },
        { status: 400 }
      );
    }

    if (!["image", "video", "document"].includes(type)) {
      return NextResponse.json(
        { error: "type must be image, video, or document" },
        { status: 400 }
      );
    }

    const client = await getOrCreateWaClient(id);
    const result = await client.sendMedia(to, url, type, caption, filename);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 }
    );
  }
}
