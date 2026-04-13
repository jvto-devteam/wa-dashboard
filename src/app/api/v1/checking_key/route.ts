import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWaClient } from "@/lib/wa-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { api_key } = body;

  if (!api_key) {
    return NextResponse.json(
      { status: "1002", message: "Invalid API Key" },
      { status: 401 }
    );
  }

  // api_key = WaNumber's apiKey — find the number (and its owner)
  const number = await db.waNumber.findUnique({
    where: { apiKey: api_key },
    select: {
      id: true,
      apiKey: true,
      phoneNumber: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!number) {
    return NextResponse.json(
      { status: "1002", message: "Invalid API Key" },
      { status: 403 }
    );
  }

  const client = getWaClient(number.id);
  const isConnected = client?.status === "connected";

  return NextResponse.json({
    status: true,
    message: "Successfully",
    data: {
      id: number.user.id,
      name: number.user.name,
      email: number.user.email,
      licenses_key: [
        {
          id: number.id,
          key: number.apiKey,
          wa_number: number.phoneNumber ?? null,
          is_connected: isConnected,
          active_from: number.createdAt,
        },
      ],
    },
  });
}
