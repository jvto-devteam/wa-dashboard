import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function extractVarsFromAll(...texts: (string | null | undefined)[]): string[] {
  const combined = texts.filter(Boolean).join("\n");
  const matches = combined.match(/\{([^}]+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1).trim()))];
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.role === "ADMIN" ? undefined : session.userId;

  try {
    const templates = await db.template.findMany({
      where: userId ? { userId } : undefined,
      include: {
        variables: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (err) {
    console.error("[GET /api/templates]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = await req.json() as any;
  const { name, content, description, variables, mediaType, mediaUrl, mediaFilename } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!content?.trim() && !mediaUrl?.trim()) {
    return NextResponse.json({ error: "Content or mediaUrl is required" }, { status: 400 });
  }

  // Validate that all {vars} in content + media fields have a matching variable definition
  const extracted = extractVarsFromAll(content, mediaUrl, mediaFilename);
  const provided: string[] = variables?.map((v: { name: string }) => v.name) ?? [];
  const missing = extracted.filter((v) => !provided.includes(v));
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing variable definition: ${missing.join(", ")}` }, { status: 400 });
  }

  try {
    const template = await db.template.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        content: content?.trim() ?? "",
        description: description?.trim() ?? null,
        mediaType: mediaType ?? null,
        mediaUrl: mediaUrl?.trim() ?? null,
        mediaFilename: mediaFilename?.trim() ?? null,
        variables: {
          create: variables?.map((v: { name: string; description?: string; example?: string; isRequired?: boolean }) => ({
            name: v.name,
            description: v.description ?? null,
            example: v.example ?? null,
            isRequired: v.isRequired ?? false,
          })) ?? [],
        },
      },
      include: { variables: true },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("[POST /api/templates]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}
