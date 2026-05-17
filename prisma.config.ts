// Prisma v7+ expects datasource URLs to be configured here, not in schema.prisma.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv();

const databaseUrl = process.env["DATABASE_URL"];
const databaseUrlUnpooled = process.env["DATABASE_URL_UNPOOLED"];

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
    directUrl: databaseUrlUnpooled ?? databaseUrl,
  },
});
