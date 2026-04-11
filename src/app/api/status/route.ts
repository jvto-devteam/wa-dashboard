import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use /api/numbers/[id]/status" }, { status: 410 });
}
