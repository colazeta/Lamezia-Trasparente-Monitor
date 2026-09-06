import crypto from "node:crypto";
import path from "node:path";
import { createRequire } from "node:module";

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client, Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { pushSchema } from "drizzle-kit/api";
import * as schema from "@workspace/db/schema";
import {
  isMigrationTrackingPresent,
  runMigrations,
  SchemaCompatibilityError,
} from "@workspace/db";

import { resolveTestDatabaseConfig } from "./testDatabase";

type ScratchDb = NodePgDatabase<Record<string, never>>;
const require = createRequire(import.meta.url);
const dbEntry = require.resolve("@workspace/db");
const migrationsFolder = path.resolve(path.dirname(dbEntry), "../migrations");
const { adminDatabaseUrl } = resolveTestDatabaseConfig();

let adminBaseUrl: URL;
const createdDatabases: string[] = [];

async function withAdmin<T>(fn: (admin: Client) => Promise<T>): Promise<T> {
  const admin = new Client({ connectionString: adminDatabaseUrl });
  await admin.connect();
  try {
    return await fn(admin);
  } finally {
    await admin.end();
  }
}

async function createScratchDatabase(): Promise<{ pool: Pool; db: ScratchDb }> {
  const name = `archboot_${crypto.randomBytes(6).toString("hex")}`;
  await withAdmin((admin) => admin.query(`CREATE DATABASE "${name}"`));
  createdDatabases.push(name);
  const url = new URL(adminBaseUrl.toString());
  url.pathname = `/${name}`;
  const pool = new Pool({ connectionString: url.toString() });
  return { pool, db: drizzle(pool) };
}

async function pushBootstrap(db: ScratchDb): Promise<void> {
  const { apply } = await pushSchema(schema as Record<string, unknown>, db);
  await apply();
}

beforeAll(() => {
  adminBaseUrl = new URL(adminDatabaseUrl);
});

afterEach(async () => {
  const names = createdDatabases.splice(0, createdDatabases.length);
  await withAdmin(async (admin) => {
    for (const name of names) {
      await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    }
  });
});

describe("architecture bootstrap hardening", () => {
  it("still accepts a current push-bootstrapped schema after compatibility proof", async () => {
    const scratch = await createScratchDatabase();
    try {
      await pushBootstrap(scratch.db);
      const status = await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });
      expect(status.pendingTags).toHaveLength(0);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(true);
    } finally {
      await scratch.pool.end();
    }
  });

  it("rejects an older or partial push schema before writing a migration baseline", async () => {
    const scratch = await createScratchDatabase();
    try {
      await pushBootstrap(scratch.db);
      await scratch.pool.query('DROP TABLE "italiadomani_projects"');

      await expect(runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      })).rejects.toMatchObject({
        name: "SchemaCompatibilityError",
        stage: "pre-baseline",
      });
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(false);
    } finally {
      await scratch.pool.end();
    }
  });

  it("rejects a structurally incompatible legacy conversation table before baselining", async () => {
    const scratch = await createScratchDatabase();
    try {
      await pushBootstrap(scratch.db);
      await scratch.pool.query('ALTER TABLE "messages" DROP COLUMN "content"');

      let caught: unknown;
      try {
        await runMigrations({
          client: scratch.pool,
          database: scratch.db,
          migrationsFolder,
        });
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(SchemaCompatibilityError);
      expect((caught as SchemaCompatibilityError).stage).toBe("pre-baseline");
      expect(String((caught as SchemaCompatibilityError).cause)).toContain("missing column messages.content");
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(false);
    } finally {
      await scratch.pool.end();
    }
  });
});
