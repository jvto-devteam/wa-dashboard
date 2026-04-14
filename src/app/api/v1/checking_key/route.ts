import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWaClient } from "@/lib/wa-client";
import { corsOptions, withCors } from "@/lib/cors";

export function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key } = body;

  if (!api_key) {
    return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 401 }));
  }

  const user = await db.user.findUnique({
    where: { apiKey: api_key },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      waNumbers: {
        select: {
          id: true,
          apiKey: true,
          phoneNumber: true,
          label: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return withCors(NextResponse.json({ status: "1002", message: "Invalid API Key" }, { status: 403 }));
  }

  const licenses = user.waNumbers.map((n) => {
    const client = getWaClient(n.id);
    return {
      id: n.id,
      key: n.apiKey,
      label: n.label,
      wa_number: n.phoneNumber ?? null,
      is_connected: client?.status === "connected",
      active_from: n.createdAt,
    };
  });

  return withCors(NextResponse.json({
    status: true,
    message: "Successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      licenses_key: licenses,
    },
  }));
}
