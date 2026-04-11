import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use /api/numbers/[id]/apikey" }, { status: 410 });
}
