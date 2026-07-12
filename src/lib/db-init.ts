import { readFileSync } from "fs";
import { join } from "path";
import type { Pool } from "pg";
import { getRawClient } from "@/lib/db";

let initialized = false;
let initPromise: Promise<void> | null = null;

const MIGRATIONS = [
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS nutritionist_plan TEXT",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0",
];

async function runSchema() {
  const schema = readFileSync(join(process.cwd(), "db/schema.sql"), "utf8");
  const { Pool } = await import("pg");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString });
  await pool.query(schema);
  await pool.end();
}

async function runMigrations() {
  const client = await getRawClient();
  for (const sql of MIGRATIONS) {
    try {
      await (client as Pool).query(sql);
    } catch {
      // Column may already exist on older Postgres without IF NOT EXISTS.
    }
  }
}

async function rawQuery(sql: string) {
  const client = await getRawClient();
  return (client as Pool).query(sql);
}

export async function ensureDb() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await rawQuery("SELECT 1 FROM users LIMIT 1");
      await runMigrations();
      initialized = true;
      return;
    } catch {
      // Table missing — apply schema.
    }

    await runSchema();
    initialized = true;
  })();

  return initPromise;
}
