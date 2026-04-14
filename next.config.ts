import type { NextConfig } from "next";

const CORS_HEADERS = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
];

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
  async headers() {
    return [
      {
        // Apply CORS to all public v1 API routes
        source: "/api/v1/:path*",
        headers: CORS_HEADERS,
      },
    ];
  },
};

export default nextConfig;
