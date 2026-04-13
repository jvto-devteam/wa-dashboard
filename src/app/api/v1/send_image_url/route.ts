import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey, waitForConnected } from "@/lib/wa-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, phone_no, url, message, separate_caption } = body;

  if (!api_key || !number_key) {
    return NextResponse.json(
      { status: "1002", message: "Invalid API Key" },
      { status: 401 }
    );
  }

  const found = await getClientByApiKey(number_key);
  if (!found) {
    return NextResponse.json(
      { status: "1003", message: "Invalid Number Key" },
      { status: 403 }
    );
  }

  if (!phone_no || !url) {
    return NextResponse.json(
      { status: "1006", message: "Missing required fields: phone_no, url" },
      { status: 400 }
    );
  }

  const { client } = found;

  try {
    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) {
        return NextResponse.json(
          { status: "1004", message: "WhatsApp is not connected" },
          { status: 400 }
        );
      }
    }

    // separate_caption: "1" = send image + caption as separate messages, "0" = caption on image
    const sendCaption = separate_caption === "1" || separate_caption === 1;
    if (sendCaption && message) {
      await client.sendMedia(phone_no, url, "image");
      await client.sendText(phone_no, message);
    } else {
      await client.sendMedia(phone_no, url, "image", message ?? undefined);
    }

    return NextResponse.json({
      status: "200",
      message: "Successfully",
      ack: "successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to send image" },
      { status: 500 }
    );
  }
}
