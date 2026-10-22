import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native addon and must not be bundled by webpack/turbopack.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-libsql",
    "@libsql/client",
    "better-sqlite3",
  ],
};

export default nextConfig;
