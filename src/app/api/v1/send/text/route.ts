import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey } from "@/lib/wa-client";

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
    const { to, text } = await req.json();

    if (!to || !text) {
      return NextResponse.json(
        { error: "Missing required fields: to, text" },
        { status: 400 }
      );
    }

    const result = await client.sendText(to, text);
    return NextResponse.json({ ...result, numberId: number.id, label: number.label });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
