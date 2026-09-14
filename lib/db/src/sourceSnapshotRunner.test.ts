import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";
import type { Pool } from "pg";
import {
  prepareSourceSnapshotImport,
  executeSourceSnapshotImport,
  publicSnapshotImportReport,
  type SnapshotImportReport,
} from "./sourceSnapshotRunner";

const root = fileURLToPath(new URL("../../../", import.meta.url));

test("planning validates committed inputs without requiring any database configuration", async () => {
  const prepared = await prepareSourceSnapshotImport(root);
  assert.equal(prepared.report.mode, "plan");
  assert.equal(prepared.report.status, "planned");
  assert.equal(prepared.sources.length, sourceSnapshotManifest.length);
  assert.equal(
    prepared.sources.filter((source) =>
      source.source.key.startsWith("lamezia.demographics."),
    ).length,
    3,
  );
  assert.deepEqual(prepared.report.results, []);
  assert.match(prepared.report.repositoryCommit, /^[a-f0-9]{40}$/);
});

test("connection and missing-schema failures do not start source writes or expose connection details", async () => {
  const prepared = await prepareSourceSnapshotImport(root);
  const unavailable = {
    connect: async () => {
      throw new Error("postgresql://sensitive-connection");
    },
  } as unknown as Pick<Pool, "connect">;
  const failed = await executeSourceSnapshotImport(unavailable, prepared);
  assert.equal(failed.status, "failed");
  assert.equal(
    failed.connectionOrMigrationError,
    "DATABASE_CONNECTION_OR_SCHEMA_UNAVAILABLE",
  );
  assert.deepEqual(failed.results, []);
  const queries: string[] = [];
  let released = false;
  const absent = {
    connect: async () => ({
      query: async (sql: string) => {
        queries.push(sql);
        return { rows: [{ name: null }] };
      },
      release: () => {
        released = true;
      },
    }),
  } as unknown as Pick<Pool, "connect">;
  const missing = await executeSourceSnapshotImport(absent, prepared);
  assert.equal(
    missing.connectionOrMigrationError,
    "SOURCE_REGISTRY_MIGRATION_REQUIRED",
  );
  assert.equal(missing.status, "failed");
  assert.equal(queries.length, 1);
  assert.ok(queries[0].startsWith("SELECT"));
  assert.ok(released);
});

test("public report omits original bytes, private paths, IDs and unexpected nested fields", () => {
  const privateMarker = "must-never-be-public";
  const report = {
    schemaVersion: "lt-source-import-report.v1",
    importerVersion: "test",
    repositoryCommit: "a".repeat(40),
    mode: "execute",
    generatedAt: "2026-09-07T12:00:00Z",
    completedAt: "2026-09-07T12:01:00Z",
    status: "verified",
    pnrrExpected: 1,
    raw: privateMarker,
    sources: [
      {
        source: "example",
        path: privateMarker,
        byteHash: "b".repeat(64),
        bytes: 10,
        collections: { projects: 1 },
        records: 1,
        sourceStatus: null,
        sourceTimestampRaw: null,
        content: privateMarker,
      },
    ],
    results: [
      {
        source: "example",
        status: "succeeded",
        byteHash: "b".repeat(64),
        records: 1,
        verified: 1,
        inserted: 0,
        legacy: { inserted: 0, matched: 1, secret: privateMarker },
        runId: privateMarker,
        releaseId: privateMarker,
        sourceStatus: null,
      },
    ],
  } as unknown as SnapshotImportReport;
  const projected = publicSnapshotImportReport(report);
  assert.ok(!JSON.stringify(projected).includes(privateMarker));
  assert.equal(projected.results[0].status, "succeeded");
});
