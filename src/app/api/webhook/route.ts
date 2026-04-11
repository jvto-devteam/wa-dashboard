import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ error: "Deprecated. Use /api/numbers/[id]/webhook" }, { status: 410 }); }
export async function POST() { return NextResponse.json({ error: "Deprecated. Use /api/numbers/[id]/webhook" }, { status: 410 }); }
