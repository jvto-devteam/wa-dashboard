import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient } from "@/lib/wa-client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const number = await db.waNumber.findUnique({ where: { id } });
  if (!number) return new Response("Not found", { status: 404 });
  if (session.role !== "ADMIN" && number.userId !== session.userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const client = await getOrCreateWaClient(id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      const initial = JSON.stringify(client.getStatus());
      controller.enqueue(encoder.encode(`data: ${initial}\n\n`));

      const listener = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // stream closed
        }
      };

      client.subscribe(listener);

      // Heartbeat every 15s
      const hb = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(hb);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        client.unsubscribe(listener);
        clearInterval(hb);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
