import { NextRequest, NextResponse } from "next/server";
import { getClientByApiKey } from "@/lib/wa-client";

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
