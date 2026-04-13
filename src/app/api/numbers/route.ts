import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient, getWaClient } from "@/lib/wa-client";

const MAX_NUMBERS_PER_USER = 3;

function generateApiKey(): string {
  return Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  ).join("-");
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.role === "ADMIN"
    ? undefined // admin sees all
    : session.userId;

  try {
    const numbers = await db.waNumber.findMany({
      where: userId ? { userId } : undefined,
      select: {
        id: true,
        userId: true,
        label: true,
        apiKey: true,
        webhookUrl: true,
        phoneNumber: true,
        authDir: true,
        createdAt: true,
        updatedAt: true,
        // authState & connectionActiveAt excluded — can be hundreds of KB per row
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Enrich with live connection status
    const enriched = numbers.map((n) => {
      const client = getWaClient(n.id);
      return {
        ...n,
        status: client?.status ?? "disconnected",
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/numbers]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, userId: targetUserId } = await req.json();

  if (!label?.trim()) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  // Determine which user this number belongs to
  const ownerId = session.role === "ADMIN" && targetUserId
    ? targetUserId
    : session.userId;

  // Check max limit
  const count = await db.waNumber.count({ where: { userId: ownerId } });
  if (count >= MAX_NUMBERS_PER_USER) {
    return NextResponse.json(
      { error: `Maximum ${MAX_NUMBERS_PER_USER} WA numbers per user` },
      { status: 400 }
    );
  }

  const number = await db.waNumber.create({
    data: {
      userId: ownerId,
      label: label.trim(),
      apiKey: generateApiKey(),
      authDir: `auth_info/${ownerId}/${Date.now()}`,
    },
  });

  // Pre-create the client — fire and forget, don't block the response
  getOrCreateWaClient(number.id).catch(() => {});

  return NextResponse.json(number, { status: 201 });
}
