import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";
import {
  planSourceSnapshot,
  persistSourceSnapshot,
  SNAPSHOT_IMPORTER_VERSION,
  snapshotHash,
} from "./sourceSnapshotPersistence";
import { pnrrCompatibilityRows } from "./sourceSnapshotPnrr";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const args = process.argv.slice(2);
const execute = args.includes("--execute");
const outputIndex = args.indexOf("--output");
const output = outputIndex === -1 ? null : args[outputIndex + 1];
const permitted = new Set(["--execute", "--output"]);
for (let i = 0; i < args.length; i++) {
  if (!permitted.has(args[i])) throw new Error("UNSUPPORTED_ARGUMENT");
  if (args[i] === "--output") {
    if (!args[++i] || args[i].startsWith("--"))
      throw new Error("OUTPUT_PATH_REQUIRED");
  }
}
const commit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();
const sources = await Promise.all(
  sourceSnapshotManifest.map(async (source) => {
    const bytes = await readFile(path.join(root, source.path));
    // A Git permalink is valid only when these exact bytes belong to this commit.
    const committed = execFileSync(
      "git",
      ["show", `${commit}:${source.path}`],
      { cwd: root, maxBuffer: 8 * 1024 * 1024 },
    );
    if (!bytes.equals(committed)) throw new Error("UNCOMMITTED_SOURCE_CONTENT");
    return planSourceSnapshot(source, bytes, commit);
  }),
);
const pnrrPlan = sources.find(
  (p) => p.source.key === "lamezia.pnrr.municipal",
)!;
const pnrrExpected = pnrrCompatibilityRows(pnrrPlan).length;
const report: Record<string, unknown> = {
  schemaVersion: "lt-source-import-report.v1",
  importerVersion: SNAPSHOT_IMPORTER_VERSION,
  repositoryCommit: commit,
  mode: execute ? "execute" : "plan",
  generatedAt: new Date().toISOString(),
  sources: sources.map((p) => ({
    source: p.source.key,
    path: p.source.path,
    byteHash: p.byteHash,
    bytes: p.byteSize,
    collections: p.collections,
    records: p.records.length,
    sourceStatus: p.sourceStatus,
    sourceTimestampRaw: p.sourceTimestampRaw,
  })),
  pnrrExpected,
  results: [],
};
let failed = false;
if (execute) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10000,
  });
  try {
    const client = await pool.connect();
    try {
      const table = (
        await client.query(
          "SELECT to_regclass('public.source_acquisition_runs') AS name",
        )
      ).rows[0];
      if (!table?.name) throw new Error("SOURCE_REGISTRY_MIGRATION_REQUIRED");
      const journal = JSON.parse(
        await readFile(
          path.join(root, "lib/db/migrations/meta/_journal.json"),
          "utf8",
        ),
      );
      const applied = (
        await client.query(
          "SELECT hash,created_at FROM drizzle.__drizzle_migrations",
        )
      ).rows;
      for (const entry of journal.entries) {
        const hash = snapshotHash(
          await readFile(
            path.join(root, "lib/db/migrations", `${entry.tag}.sql`),
          ),
        );
        if (
          !applied.some(
            (row) => row.hash === hash && Number(row.created_at) === entry.when,
          )
        )
          throw new Error("SOURCE_IMPORT_PENDING_MIGRATIONS");
      }
      for (const plan of sources) {
        try {
          (report.results as unknown[]).push(
            await persistSourceSnapshot(client, plan, { reconcilePnrr: true }),
          );
        } catch (error) {
          failed = true;
          (report.results as unknown[]).push({
            source: plan.source.key,
            runId: plan.runId,
            status: "failed",
            code:
              error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message)
                ? error.message
                : "PERSISTENCE_FAILED",
          });
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    failed = true;
    report.connectionOrMigrationError =
      error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message)
        ? error.message
        : "DATABASE_CONNECTION_OR_SCHEMA_UNAVAILABLE";
  } finally {
    await pool.end();
  }
}
report.status = failed ? "failed" : execute ? "verified" : "planned";
if (output) {
  const target = path.resolve(output);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
if (failed) process.exitCode = 1;
