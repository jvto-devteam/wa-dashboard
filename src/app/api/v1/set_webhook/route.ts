import { NextRequest, NextResponse } from "next/server";
import { getClientByKeys } from "@/lib/wa-client";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, endpoint_url } = body;

  if (!api_key) return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  if (!number_key) return withCors(NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 }));

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return withCors(NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 }));

  if (!endpoint_url) {
    return withCors(NextResponse.json({ status: "1006", message: "Missing required field: endpoint_url" }, { status: 400 }));
  }

  const { client, number } = found;

  try {
    const { db } = await import("@/lib/db");
    await db.waNumber.update({
      where: { id: number.id },
      data: { webhookUrl: endpoint_url },
    });
    client.webhookUrl = endpoint_url;

    return withCors(NextResponse.json({
      status: "200",
      message: `Successfully set Web Hook to url: ${endpoint_url}`,
      ack: "successfully",
    }));
  } catch (err) {
    return withCors(NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to set webhook" },
      { status: 500 }
    ));
  }
}
