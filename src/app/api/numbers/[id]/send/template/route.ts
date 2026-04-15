import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient, waitForConnected } from "@/lib/wa-client";
import { parseTemplate, validateVariables } from "@/lib/template-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const number = await db.waNumber.findUnique({ where: { id } });
  if (!number) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role !== "ADMIN" && number.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { to, templateId, variables } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: "Missing required field: to" },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Missing required field: templateId" },
        { status: 400 }
      );
    }

    // Get template with variables
    const template = await db.template.findUnique({
      where: { id: templateId },
      include: { variables: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Check if user has access to this template
    if (template.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate required variables
    const validation = validateVariables(template.variables, variables || {});
    if (!validation.isValid) {
      return NextResponse.json({
        error: `Missing required variables: ${validation.missing.join(', ')}`
      }, { status: 400 });
    }

    // Parse template with variables
    const messageContent = parseTemplate(template.content, variables);

    const client = await getOrCreateWaClient(id);
    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) return NextResponse.json({ error: "WhatsApp is not connected" }, { status: 400 });
    }

    // Send the message
    const result = await client.sendText(to, messageContent);

    // Log the message
    await db.messageLog.create({
      data: {
        numberId: id,
        direction: "OUT",
        toFrom: to,
        content: messageContent,
        templateId: templateId,
      },
    });

    return NextResponse.json({
      ...result,
      templateUsed: {
        id: template.id,
        name: template.name,
      }
    });
  } catch (err) {
    console.error("[POST /api/numbers/[id]/send/template]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send template message" },
      { status: 500 }
    );
  }
}