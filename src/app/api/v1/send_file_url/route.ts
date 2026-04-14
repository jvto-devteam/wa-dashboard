import { NextRequest, NextResponse } from "next/server";
import { getClientByKeys, waitForConnected } from "@/lib/wa-client";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, phone_no, url, filename } = body;

  if (!api_key) return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  if (!number_key) return withCors(NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 }));

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return withCors(NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 }));

  if (!phone_no || !url) {
    return withCors(NextResponse.json({ status: "1006", message: "Missing required fields: phone_no, url" }, { status: 400 }));
  }

  const { client } = found;

  try {
    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) return withCors(NextResponse.json({ status: "1004", message: "WhatsApp is not connected" }, { status: 400 }));
    }

    const lower = url.toLowerCase();
    const type = lower.match(/\.(mp4|mkv|avi|mov|webm)$/) ? "video" : "document";
    await client.sendMedia(phone_no, url, type, undefined, filename ?? undefined);

    return withCors(NextResponse.json({ status: "200", message: "Successfully", ack: "successfully" }));
  } catch (err) {
    return withCors(NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to send file" },
      { status: 500 }
    ));
  }
}
