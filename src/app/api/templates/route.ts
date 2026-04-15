import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.role === "ADMIN"
    ? undefined // admin sees all
    : session.userId;

  try {
    const templates = await db.template.findMany({
      where: userId ? { userId } : undefined,
      include: {
        variables: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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

  const { name, content, description, variables } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    // Extract variables from content using regex
    const extractedVariables = extractVariablesFromContent(content);

    // Validate that provided variables match extracted ones
    const providedVarNames = variables?.map((v: any) => v.name) || [];
    const missingVariables = extractedVariables.filter(v => !providedVarNames.includes(v));

    if (missingVariables.length > 0) {
      return NextResponse.json({
        error: `Missing variables in definition: ${missingVariables.join(', ')}`
      }, { status: 400 });
    }

    const template = await db.template.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        content: content.trim(),
        description: description?.trim(),
        variables: {
          create: variables?.map((variable: any) => ({
            name: variable.name,
            description: variable.description,
            example: variable.example,
            isRequired: variable.isRequired || false,
          })) || [],
        },
      },
      include: {
        variables: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("[POST /api/templates]", err);
    return NextResponse.json({ error: "Database error, please retry" }, { status: 503 });
  }
}

function extractVariablesFromContent(content: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches.map(match => match.slice(1, -1).trim()))];
}