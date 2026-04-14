import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey, getClientByKeys } from "@/lib/wa-client";

// Legacy: GET with Authorization: Bearer header
export async function GET(req: NextRequest) {
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

  const { client } = found;

  try {
    const groups = await client.getGroups();
    return NextResponse.json(groups);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// WatZap-compatible: POST with { api_key, number_key } in body
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key } = body;

  if (!api_key) return NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 });
  if (!number_key) return NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 });

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 });

  const { client } = found;

  try {
    const groups = await client.getGroups();
    return NextResponse.json(groups);
  } catch (err) {
    return NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
