import { NextRequest, NextResponse } from "next/server";
import { getClientByKeys, waitForConnected } from "@/lib/wa-client";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, group_id, url, message, separate_caption } = body;

  if (!api_key) return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  if (!number_key) return withCors(NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 }));

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return withCors(NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 }));

  if (!group_id || !url) {
    return withCors(NextResponse.json({ status: "1006", message: "Missing required fields: group_id, url" }, { status: 400 }));
  }

  const { client } = found;

  try {
    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) return withCors(NextResponse.json({ status: "1004", message: "WhatsApp is not connected" }, { status: 400 }));
    }

    const sendCaption = separate_caption === "1" || separate_caption === 1;
    if (sendCaption && message) {
      await client.sendMedia(group_id, url, "image");
      await client.sendText(group_id, message);
    } else {
      await client.sendMedia(group_id, url, "image", message ?? undefined);
    }

    return withCors(NextResponse.json({ status: "200", message: "Successfully", ack: "successfully" }));
  } catch (err) {
    return withCors(NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to send image" },
      { status: 500 }
    ));
  }
}
