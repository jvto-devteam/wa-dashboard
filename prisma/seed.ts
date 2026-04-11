import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const existing = await db.user.findUnique({ where: { email: "admin@admin.com" } });
  if (existing) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const hashed = await bcrypt.hash("Admin1234", 12);
  const admin = await db.user.create({
    data: {
      email: "admin@admin.com",
      password: hashed,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:");
  console.log("   Email   :", admin.email);
  console.log("   Password: Admin1234");
  console.log("   Role    :", admin.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
