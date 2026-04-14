import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

function generateApiKey(): string {
  return Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  ).join("-");
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { waNumbers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password, name, role } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password, and name are required" },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      apiKey: generateApiKey(),
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, apiKey: true },
  });

  return NextResponse.json(user, { status: 201 });
}
