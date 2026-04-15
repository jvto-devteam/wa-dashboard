import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const template = await db.template.findUnique({
      where: { id },
      include: {
        variables: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    if (template.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(template);
  } catch (err) {
    console.error("[GET /api/templates/[id]]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const template = await db.template.findUnique({
      where: { id },
      include: { variables: true },
    });
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    if (template.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { name, content, description, variables, isActive } = await req.json() as any;

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (content !== undefined && !content?.trim()) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    const updated = await db.template.update({
      where: { id },
      data: {
        ...(name      !== undefined && { name: name.trim() }),
        ...(content   !== undefined && { content: content.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(isActive  !== undefined && { isActive }),
        ...(variables !== undefined && {
          variables: {
            deleteMany: {},
            create: variables.map((v: { name: string; description?: string; example?: string; isRequired?: boolean }) => ({
              name: v.name,
              description: v.description ?? null,
              example: v.example ?? null,
              isRequired: v.isRequired ?? false,
            })),
          },
        }),
      },
      include: { variables: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/templates/[id]]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const template = await db.template.findUnique({ where: { id } });
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    if (template.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.template.delete({ where: { id } });
    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/templates/[id]]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}
