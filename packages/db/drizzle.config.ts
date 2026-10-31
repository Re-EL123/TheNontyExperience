import { defineConfig } from "drizzle-kit";

// pnpm runs this with cwd = packages/db, so the shared .env sits two levels up.
try {
  process.loadEnvFile("../../.env");
} catch {
  /* env may already be set (CI) */
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  // Migrations need a direct (non-pooled) connection on Neon.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL! },
});
