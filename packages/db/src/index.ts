import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export * from "./schema";
// Re-exported so the API uses the exact same drizzle-orm instance as the schema.
export * from "drizzle-orm";
export type Db = ReturnType<typeof createDb>;

export function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

let cached: Db | undefined;
/** Lazy singleton so importing this package never throws when env is missing. */
export function getDb(): Db {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    cached = createDb(url);
  }
  return cached;
}
