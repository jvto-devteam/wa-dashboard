import { NextRequest, NextResponse } from "next/server";
import { getClientByKeys, waitForConnected } from "@/lib/wa-client";
import { parseTemplate, validateVariables } from "@/lib/template-utils";
import { db } from "@/lib/db";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

const MEDIA_TYPE_MAP: Record<string, "image" | "video" | "document"> = {
  image: "image",
  video: "video",
  file:  "document",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key, number_key, phone_no, template_id, variables } = body;

  if (!api_key)     return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  if (!number_key)  return withCors(NextResponse.json({ status: "1003", message: "Invalid Number Key" }, { status: 401 }));
  if (!phone_no)    return withCors(NextResponse.json({ status: "1006", message: "Missing required field: phone_no" }, { status: 400 }));
  if (!template_id) return withCors(NextResponse.json({ status: "1006", message: "Missing required field: template_id" }, { status: 400 }));

  const found = await getClientByKeys(api_key, number_key);
  if (!found) return withCors(NextResponse.json({ status: "1003", message: "Invalid API Key or Number Key" }, { status: 403 }));

  const { client, number, user } = found;

  try {
    const template = await db.template.findUnique({
      where: { id: template_id },
      include: { variables: true },
    });

    if (!template)           return withCors(NextResponse.json({ status: "1008", message: "Template not found" }, { status: 404 }));
    if (template.userId !== user.id) return withCors(NextResponse.json({ status: "1009", message: "Template access denied" }, { status: 403 }));
    if (!template.isActive)  return withCors(NextResponse.json({ status: "1010", message: "Template is not active" }, { status: 400 }));

    // Validate required variables
    const validation = validateVariables(template.variables, variables ?? {});
    if (!validation.isValid) {
      return withCors(NextResponse.json({
        status: "1011",
        message: `Missing required variables: ${validation.missing.join(", ")}`,
      }, { status: 400 }));
    }

    const vars: Record<string, string> = variables ?? {};

    // Resolve content (caption) and media URL / filename by substituting variables
    const caption  = template.content  ? parseTemplate(template.content, vars)       : "";
    const mediaUrl = template.mediaUrl ? parseTemplate(template.mediaUrl, vars)       : null;
    const filename = template.mediaFilename ? parseTemplate(template.mediaFilename, vars) : undefined;

    if (client.status !== "connected") {
      const ok = await waitForConnected(client, 15_000);
      if (!ok) return withCors(NextResponse.json({ status: "1004", message: "WhatsApp is not connected" }, { status: 400 }));
    }

    // Send: media (with optional caption) OR plain text
    if (template.mediaType && mediaUrl) {
      const sendType = MEDIA_TYPE_MAP[template.mediaType] ?? "document";
      await client.sendMedia(phone_no, mediaUrl, sendType, caption || undefined, filename);
    } else if (caption) {
      await client.sendText(phone_no, caption);
    } else {
      return withCors(NextResponse.json({ status: "1012", message: "Nothing to send (empty content and no media)" }, { status: 400 }));
    }

    // Log (non-fatal)
    await db.messageLog.create({
      data: {
        numberId: number.id,
        direction: "OUT",
        toFrom: phone_no,
        content: caption || mediaUrl || "",
        mediaType: template.mediaType ?? null,
        templateId: template_id,
      },
    }).catch(() => {});

    return withCors(NextResponse.json({
      status: "200",
      message: "Message sent successfully",
      ack: "successfully",
      template_used: { id: template.id, name: template.name },
    }));
  } catch (err) {
    return withCors(NextResponse.json(
      { status: "1005", message: err instanceof Error ? err.message : "Failed to send template message" },
      { status: 500 }
    ));
  }
}
