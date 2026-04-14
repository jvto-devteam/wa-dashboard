import { NextRequest, NextResponse } from "next/server";
import { getClientByKeys } from "@/lib/wa-client";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key } = body;

  if (!api_key) return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  if (!number_key) return withCors(NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 }));

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return withCors(NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 }));

  const { client } = found;

  return withCors(NextResponse.json({
    status: "200",
    message: client.webhookUrl ?? "",
    ack: "successfully",
  }));
}
