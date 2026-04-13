import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey, waitForConnected } from "@/lib/wa-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, phone_no, message } = body;

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

  if (!phone_no || !message) {
    return NextResponse.json(
      { status: "1006", message: "Missing required fields: phone_no, message" },
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

    await client.sendText(phone_no, message);

    return NextResponse.json({
      status: "200",
      message: "Message sent successfully",
      ack: "successfully",
      phone_number: phone_no,
      message_sent: message,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
