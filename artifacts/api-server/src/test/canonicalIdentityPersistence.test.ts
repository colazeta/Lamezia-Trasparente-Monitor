import crypto from "node:crypto";
import path from "node:path";
import { createRequire } from "node:module";

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client, Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  ensureActiveLegacySubjectMapping,
  generateCanonicalUuidV7,
  runMigrations,
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

async function createScratchDatabase(): Promise<{
  pool: Pool;
  db: ScratchDb;
}> {
  const name = `canonical_identity_${crypto.randomBytes(6).toString("hex")}`;
  await withAdmin((admin) => admin.query(`CREATE DATABASE "${name}"`));
  createdDatabases.push(name);
  const url = new URL(adminBaseUrl.toString());
  url.pathname = `/${name}`;
  const pool = new Pool({ connectionString: url.toString() });
  return { pool, db: drizzle(pool) };
}

async function tableExists(pool: Pool, table: string): Promise<boolean> {
  const result = await pool.query<{ present: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS present",
    [`public.${table}`],
  );
  return Boolean(result.rows[0]?.present);
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

describe("canonical subject identity persistence", () => {
  it("fresh migration creates the two Phase 2 identity tables", async () => {
    const scratch = await createScratchDatabase();
    try {
      const status = await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });
      expect(status.pendingTags).toHaveLength(0);
      expect(await tableExists(scratch.pool, "canonical_subjects")).toBe(true);
      expect(await tableExists(scratch.pool, "legacy_subject_map")).toBe(true);
      expect(status.lastAppliedTag).toBe("0018_canonical_subject_identity");
    } finally {
      await scratch.pool.end();
    }
  });

  it("database enforces UUIDv7, Entity/Event kind and namespaced domain type", async () => {
    const scratch = await createScratchDatabase();
    try {
      await runMigrations({ client: scratch.pool, database: scratch.db, migrationsFolder });
      const entityId = generateCanonicalUuidV7(1_788_712_500_100);
      const eventId = generateCanonicalUuidV7(1_788_712_500_101);
      await scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'party.person'), ($2, 'event', 'crime.event')",
        [entityId, eventId],
      );

      await expect(scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'party.person')",
        ["550e8400-e29b-41d4-a716-446655440000"],
      )).rejects.toMatchObject({ code: "23514" });

      await expect(scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'document', 'document.act')",
        [generateCanonicalUuidV7(1_788_712_500_102)],
      )).rejects.toMatchObject({ code: "23514" });

      await expect(scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'person')",
        [generateCanonicalUuidV7(1_788_712_500_103)],
      )).rejects.toMatchObject({ code: "23514" });
    } finally {
      await scratch.pool.end();
    }
  });

  it("one active mapping per legacy identity is enforced and helper reuse is idempotent", async () => {
    const scratch = await createScratchDatabase();
    try {
      await runMigrations({ client: scratch.pool, database: scratch.db, migrationsFolder });
      const subjectId = generateCanonicalUuidV7(1_788_712_500_104);
      await scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'party.organization')",
        [subjectId],
      );
      const input = {
        legacyNamespace: "db.public",
        legacyType: "official",
        legacyId: "42",
        subjectId,
        resolutionMethod: "migration_backfill",
      };
      const first = await ensureActiveLegacySubjectMapping(scratch.pool, input);
      const second = await ensureActiveLegacySubjectMapping(scratch.pool, input);
      expect(first.created).toBe(true);
      expect(second.created).toBe(false);
      expect(second.mappingId).toBe(first.mappingId);

      await expect(scratch.pool.query(
        `INSERT INTO legacy_subject_map (
           legacy_namespace, legacy_type, legacy_id, subject_id, resolution_method
         ) VALUES ('db.public', 'official', '42', $1, 'manual_confirmed')`,
        [subjectId],
      )).rejects.toMatchObject({ code: "23505" });
    } finally {
      await scratch.pool.end();
    }
  });

  it("mapping corrections are historised instead of overwritten", async () => {
    const scratch = await createScratchDatabase();
    try {
      await runMigrations({ client: scratch.pool, database: scratch.db, migrationsFolder });
      const oldSubject = generateCanonicalUuidV7(1_788_712_500_105);
      const newSubject = generateCanonicalUuidV7(1_788_712_500_106);
      await scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'party.person'), ($2, 'entity', 'party.person')",
        [oldSubject, newSubject],
      );
      await scratch.pool.query(
        `INSERT INTO legacy_subject_map (
           legacy_namespace, legacy_type, legacy_id, subject_id, resolution_method
         ) VALUES ('db.public', 'official', '77', $1, 'migration_backfill')`,
        [oldSubject],
      );
      await scratch.pool.query(
        `UPDATE legacy_subject_map
         SET mapping_status = 'superseded', valid_to = now()
         WHERE legacy_namespace = 'db.public' AND legacy_type = 'official' AND legacy_id = '77' AND valid_to IS NULL`,
      );
      await scratch.pool.query(
        `INSERT INTO legacy_subject_map (
           legacy_namespace, legacy_type, legacy_id, subject_id, resolution_method
         ) VALUES ('db.public', 'official', '77', $1, 'manual_confirmed')`,
        [newSubject],
      );
      const rows = await scratch.pool.query<{ subject_id: string; mapping_status: string }>(
        `SELECT subject_id, mapping_status
         FROM legacy_subject_map
         WHERE legacy_namespace = 'db.public' AND legacy_type = 'official' AND legacy_id = '77'
         ORDER BY mapping_id`,
      );
      expect(rows.rows).toEqual([
        { subject_id: oldSubject, mapping_status: "superseded" },
        { subject_id: newSubject, mapping_status: "active" },
      ]);
    } finally {
      await scratch.pool.end();
    }
  });

  it("mapping status/time consistency and subject referential integrity fail closed", async () => {
    const scratch = await createScratchDatabase();
    try {
      await runMigrations({ client: scratch.pool, database: scratch.db, migrationsFolder });
      const subjectId = generateCanonicalUuidV7(1_788_712_500_107);
      await scratch.pool.query(
        "INSERT INTO canonical_subjects (subject_id, subject_kind, domain_type) VALUES ($1, 'entity', 'party.person')",
        [subjectId],
      );

      await expect(scratch.pool.query(
        `INSERT INTO legacy_subject_map (
           legacy_namespace, legacy_type, legacy_id, subject_id,
           resolution_method, mapping_status, valid_to
         ) VALUES ('db.public', 'official', '99', $1, 'manual_confirmed', 'active', now())`,
        [subjectId],
      )).rejects.toMatchObject({ code: "23514" });

      await scratch.pool.query(
        `INSERT INTO legacy_subject_map (
           legacy_namespace, legacy_type, legacy_id, subject_id, resolution_method
         ) VALUES ('db.public', 'official', '100', $1, 'manual_confirmed')`,
        [subjectId],
      );
      await expect(scratch.pool.query(
        "DELETE FROM canonical_subjects WHERE subject_id = $1",
        [subjectId],
      )).rejects.toMatchObject({ code: "23503" });
    } finally {
      await scratch.pool.end();
    }
  });
});
