import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "pino",
    "pino-pretty",
    "@hapi/boom",
    "pg",
    "@prisma/adapter-pg",
    "bcryptjs",
  ],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
