import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import type { Pool } from "pg";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";
import {
  planSourceSnapshot,
  persistSourceSnapshot,
  SNAPSHOT_IMPORTER_VERSION,
  snapshotHash,
} from "./sourceSnapshotPersistence";
import { pnrrCompatibilityRows } from "./sourceSnapshotPnrr";
import { reconcileCanonicalPnrr } from "./canonicalPnrr";

type ImportSuccess = Awaited<ReturnType<typeof persistSourceSnapshot>> & {
  status: "succeeded";
};
type ImportFailure = {
  source: string;
  runId: string;
  status: "failed";
  code: string;
};

export type SnapshotImportReport = {
  schemaVersion: "lt-source-import-report.v1";
  importerVersion: string;
  repositoryCommit: string;
  mode: "plan" | "execute";
  generatedAt: string;
  completedAt?: string;
  sources: Array<{
    source: string;
    path: string;
    byteHash: string;
    bytes: number;
    collections: Record<string, number>;
    records: number;
    sourceStatus: string | null;
    sourceTimestampRaw: string | null;
  }>;
  pnrrExpected: number;
  results: Array<ImportSuccess | ImportFailure>;
  status: "planned" | "verified" | "failed";
  connectionOrMigrationError?: string;
  canonicalPnrr?: Awaited<ReturnType<typeof reconcileCanonicalPnrr>>;
};

export function snapshotImportError(error: unknown): string {
  return error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message)
    ? error.message
    : "DATABASE_CONNECTION_OR_SCHEMA_UNAVAILABLE";
}

/** No connection is acquired while preparing and validating the exact Git input. */
export async function prepareSourceSnapshotImport(root: string) {
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const sources = await Promise.all(
    sourceSnapshotManifest.map(async (source) => {
      const bytes = await readFile(path.join(root, source.path));
      const committed = execFileSync(
        "git",
        ["show", `${commit}:${source.path}`],
        {
          cwd: root,
          maxBuffer: 8 * 1024 * 1024,
        },
      );
      if (!bytes.equals(committed))
        throw new Error("UNCOMMITTED_SOURCE_CONTENT");
      return planSourceSnapshot(source, bytes, commit);
    }),
  );
  const report: SnapshotImportReport = {
    schemaVersion: "lt-source-import-report.v1",
    importerVersion: SNAPSHOT_IMPORTER_VERSION,
    repositoryCommit: commit,
    mode: "plan",
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
    pnrrExpected: pnrrCompatibilityRows(
      sources.find((p) => p.source.key === "lamezia.pnrr.municipal")!,
    ).length,
    results: [],
    status: "planned",
  };
  return { root, sources, report };
}

/** Pool ownership remains with the caller (CLI or long-lived API server). */
export async function executeSourceSnapshotImport(
  pool: Pick<Pool, "connect">,
  prepared: Awaited<ReturnType<typeof prepareSourceSnapshotImport>>,
): Promise<SnapshotImportReport> {
  const report: SnapshotImportReport = {
    ...prepared.report,
    mode: "execute",
    results: [],
    status: "failed",
  };
  try {
    const client = await pool.connect();
    try {
      const table = (
        await client.query(
          "SELECT to_regclass('public.source_acquisition_runs') AS name",
        )
      ).rows[0];
      if (!table?.name) throw new Error("SOURCE_REGISTRY_MIGRATION_REQUIRED");
      const directory = path.join(prepared.root, "lib/db/migrations");
      const journal = JSON.parse(
        await readFile(path.join(directory, "meta/_journal.json"), "utf8"),
      );
      const applied = (
        await client.query(
          "SELECT hash,created_at FROM drizzle.__drizzle_migrations",
        )
      ).rows;
      for (const entry of journal.entries) {
        const hash = snapshotHash(
          await readFile(path.join(directory, `${entry.tag}.sql`)),
        );
        if (
          !applied.some(
            (row) => row.hash === hash && Number(row.created_at) === entry.when,
          )
        )
          throw new Error("SOURCE_IMPORT_PENDING_MIGRATIONS");
      }
      for (const plan of prepared.sources) {
        try {
          report.results.push({
            ...(await persistSourceSnapshot(client, plan, {
              reconcilePnrr: true,
            })),
            status: "succeeded",
          });
        } catch (error) {
          report.results.push({
            source: plan.source.key,
            runId: plan.runId,
            status: "failed",
            code: snapshotImportError(error),
          });
        }
      }
      if (
        report.results.length === prepared.sources.length &&
        report.results.every((r) => r.status === "succeeded")
      )
        report.status = "verified";
    } finally {
      client.release();
    }
  } catch (error) {
    report.status = "failed";
    report.connectionOrMigrationError = snapshotImportError(error);
  }
  if (report.status === "verified") {
    try {
      report.canonicalPnrr = await reconcileCanonicalPnrr(pool);
    } catch (error) {
      report.status = "failed";
      report.connectionOrMigrationError = snapshotImportError(error);
    }
  }
  report.completedAt = new Date().toISOString();
  return report;
}

/** Explicit allowlist: the readiness checkpoint must never serialise raw plans. */
export function publicSnapshotImportReport(report: SnapshotImportReport) {
  return {
    schemaVersion: report.schemaVersion,
    importerVersion: report.importerVersion,
    repositoryCommit: report.repositoryCommit,
    mode: report.mode,
    generatedAt: report.generatedAt,
    completedAt: report.completedAt,
    status: report.status,
    sources: report.sources.map((s) => ({
      source: s.source,
      byteHash: s.byteHash,
      bytes: s.bytes,
      collections: { ...s.collections },
      records: s.records,
      sourceStatus: s.sourceStatus,
      sourceTimestampRaw: s.sourceTimestampRaw,
    })),
    pnrrExpected: report.pnrrExpected,
    results: report.results.map((r) =>
      r.status === "succeeded"
        ? {
            source: r.source,
            status: r.status,
            byteHash: r.byteHash,
            records: r.records,
            verified: r.verified,
            inserted: r.inserted,
            ...(r.demographics
              ? {
                  demographics: {
                    seriesKey: r.demographics.seriesKey,
                    observations: r.demographics.observations,
                    inserted: r.demographics.inserted,
                    verified: r.demographics.verified,
                  },
                }
              : {}),
            legacy: r.legacy
              ? { inserted: r.legacy.inserted, matched: r.legacy.matched }
              : null,
          }
        : { source: r.source, status: r.status, code: r.code },
    ),
    ...(report.connectionOrMigrationError
      ? { error: report.connectionOrMigrationError }
      : {}),
    ...(report.canonicalPnrr
      ? {
          canonicalPnrr: {
            status: report.canonicalPnrr.status,
            resolverVersion: report.canonicalPnrr.resolverVersion,
            sourceRecords: report.canonicalPnrr.sourceRecords,
            projectRecords: report.canonicalPnrr.projectRecords,
            projects: report.canonicalPnrr.projects,
            assertions: report.canonicalPnrr.assertions,
            candidates: report.canonicalPnrr.candidates,
            resolved: report.canonicalPnrr.resolved,
            unresolved: report.canonicalPnrr.unresolved,
            fields: report.canonicalPnrr.fields,
            fieldsWithAlternatives: report.canonicalPnrr.fieldsWithAlternatives,
          },
        }
      : {}),
  };
}
