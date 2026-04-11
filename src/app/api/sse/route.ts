export async function GET() {
  return new Response("Deprecated. Use /api/numbers/[id]/sse", { status: 410 });
}
