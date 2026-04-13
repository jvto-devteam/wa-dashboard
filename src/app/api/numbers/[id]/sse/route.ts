import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateWaClient, HEARTBEAT_STALE_MS } from "@/lib/wa-client";

export const dynamic = "force-dynamic";
// Allow SSE connections to stay open long enough for QR scanning and session monitoring.
// Vercel Hobby caps at 60s; Pro allows up to 300s.
export const maxDuration = 60;

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

  // Heartbeat check: is another Lambda instance actively holding this connection?
  const isActiveElsewhere =
    number.connectionActiveAt != null &&
    Date.now() - new Date(number.connectionActiveAt).getTime() < HEARTBEAT_STALE_MS;

  if (client.status === "disconnected" && !isActiveElsewhere) {
    // No other Lambda has this connection — safe to connect here.
    // On Vercel, Baileys events fire while this long-lived SSE request is active.
    client.connect().catch(console.error);
  }

  // If another Lambda is actively connected, report that status to the frontend
  // so the UI doesn't flash "Disconnected" unnecessarily.
  const initialPayload = isActiveElsewhere && client.status !== "connected"
    ? { status: "connected", hasQr: false, qr: null,
        webhookUrl: number.webhookUrl, stats: null }
    : client.getStatus();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      const initial = JSON.stringify(initialPayload);
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
