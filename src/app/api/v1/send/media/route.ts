import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey, waitForConnected } from "@/lib/wa-client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization header. Use: Authorization: Bearer <api_key>" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const found = await getClientByApiKey(apiKey);
  if (!found) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  const { client, number } = found;

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
        { error: "type must be one of: image, video, document" },
        { status: 400 }
      );
    }

    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) return NextResponse.json({ error: "WhatsApp is not connected" }, { status: 400 });
    }
    const result = await client.sendMedia(to, url, type, caption, filename);
    return NextResponse.json({ ...result, numberId: number.id, label: number.label });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send media" },
      { status: 500 }
    );
  }
}
