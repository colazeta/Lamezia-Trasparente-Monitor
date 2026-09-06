import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { eq, inArray } from "drizzle-orm";

import {
  buildCrimeMonitorImportPlan,
  type CrimeMonitorFile,
  type CrimeMonitorImportPlan,
} from "./crimeMonitorIngestionCore";
import * as crimeSchema from "./schema/crimeEvents";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DEFAULT_MONITOR_DIR = path.join(
  REPO_ROOT,
  "data",
  "legalita",
  "ltceds",
  "monitor",
);

export type CrimeMonitorDatabase = typeof import("./client").db;

export interface CrimeMonitorImportReport {
  mode: "dry-run" | "execute";
  databaseState: "unchecked" | "checked";
  inputPath: string;
  eventCount: number;
  sourceCount: number;
  offenceCount: number;
  locationCount: number;
  publicProjectionCount: 0;
  publicProjectionTouched: 0;
  events: Array<{
    eventId: string;
    fileName: string;
    artifactSha256: string;
    recordStatus: string;
  }>;
}

async function listJsonFiles(inputPath: string): Promise<string[]> {
  const metadata = await stat(inputPath);
  if (metadata.isFile()) {
    if (!inputPath.endsWith(".json")) {
      throw new Error(`Crime monitor input file must be JSON: ${inputPath}`);
    }
    return [inputPath];
  }
  if (!metadata.isDirectory()) {
    throw new Error(`Crime monitor input is neither file nor directory: ${inputPath}`);
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map(async (entry) => {
        const child = path.join(inputPath, entry.name);
        if (entry.isDirectory()) return listJsonFiles(child);
        return entry.isFile() && entry.name.endsWith(".json") ? [child] : [];
      }),
  );
  return nested.flat().sort();
}

export async function loadCrimeMonitorFiles(
  inputPath = DEFAULT_MONITOR_DIR,
): Promise<CrimeMonitorFile[]> {
  const paths = await listJsonFiles(inputPath);
  return Promise.all(
    paths.map(async (filePath) => ({
      fileName: path.relative(REPO_ROOT, filePath).replaceAll(path.sep, "/"),
      payload: JSON.parse(await readFile(filePath, "utf8")) as unknown,
    })),
  );
}

function reportFromPlan(
  plan: CrimeMonitorImportPlan,
  mode: CrimeMonitorImportReport["mode"],
  databaseState: CrimeMonitorImportReport["databaseState"],
  inputPath: string,
): CrimeMonitorImportReport {
  return {
    mode,
    databaseState,
    inputPath,
    eventCount: plan.eventCount,
    sourceCount: plan.sourceCount,
    offenceCount: plan.offenceCount,
    locationCount: plan.locationCount,
    publicProjectionCount: 0,
    publicProjectionTouched: 0,
    events: plan.events.map((event) => ({
      eventId: event.event.eventId,
      fileName: event.fileName,
      artifactSha256: event.artifactSha256,
      recordStatus: event.event.recordStatus,
    })),
  };
}

export async function executeCrimeMonitorImportPlan(
  plan: CrimeMonitorImportPlan,
  db: CrimeMonitorDatabase,
  inputPath = DEFAULT_MONITOR_DIR,
): Promise<CrimeMonitorImportReport> {
  return db.transaction(async (tx) => {
    const eventIds = plan.events.map((event) => event.event.eventId);
    if (eventIds.length) {
      const publicRows = await tx
        .select({ eventId: crimeSchema.crimePublicEventsTable.eventId })
        .from(crimeSchema.crimePublicEventsTable)
        .where(inArray(crimeSchema.crimePublicEventsTable.eventId, eventIds));
      if (publicRows.length) {
        throw new Error(
          `Monitor ingestion refuses to mutate events already present in crime_public_events: ${publicRows
            .map((row) => row.eventId)
            .join(", ")}`,
        );
      }
    }

    for (const item of plan.events) {
      for (const source of item.sources) {
        await tx
          .insert(crimeSchema.crimeSourcesTable)
          .values(source)
          .onConflictDoUpdate({
            target: crimeSchema.crimeSourcesTable.sourceId,
            set: {
              sourceType: source.sourceType,
              provider: source.provider,
              title: source.title,
              url: source.url,
              publishedAt: source.publishedAt,
              retrievedAt: source.retrievedAt,
              canonicalSourceKey: source.canonicalSourceKey,
              contentSha256: source.contentSha256,
              updatedAt: source.updatedAt,
            },
          });
      }

      const event = item.event;
      await tx
        .insert(crimeSchema.crimeEventsTable)
        .values(event)
        .onConflictDoUpdate({
          target: crimeSchema.crimeEventsTable.eventId,
          set: {
            schemaVersion: event.schemaVersion,
            recordStatus: event.recordStatus,
            eventForm: event.eventForm,
            title: event.title,
            temporalStart: event.temporalStart,
            temporalEnd: event.temporalEnd,
            temporalEdtf: event.temporalEdtf,
            temporalPrecision: event.temporalPrecision,
            temporalStartBound: event.temporalStartBound,
            temporalEndBound: event.temporalEndBound,
            updatedAt: event.updatedAt,
          },
        });

      // Child rows are an exact projection of the current authoritative monitor
      // artifact. Replacing them avoids stale classifications/locations after a
      // reviewed correction while keeping source rows reusable/auditable.
      await tx
        .delete(crimeSchema.crimeEventSourcesTable)
        .where(eq(crimeSchema.crimeEventSourcesTable.eventId, event.eventId));
      await tx
        .delete(crimeSchema.crimeEventOffencesTable)
        .where(eq(crimeSchema.crimeEventOffencesTable.eventId, event.eventId));
      await tx
        .delete(crimeSchema.crimeEventLocationsTable)
        .where(eq(crimeSchema.crimeEventLocationsTable.eventId, event.eventId));

      if (item.offences.length) {
        await tx.insert(crimeSchema.crimeEventOffencesTable).values(item.offences);
      }
      if (item.locations.length) {
        await tx.insert(crimeSchema.crimeEventLocationsTable).values(item.locations);
      }
      if (item.eventSources.length) {
        await tx.insert(crimeSchema.crimeEventSourcesTable).values(item.eventSources);
      }
    }

    return reportFromPlan(plan, "execute", "checked", inputPath);
  });
}

export async function executeCrimeMonitorImport(
  db: CrimeMonitorDatabase,
  inputPath = DEFAULT_MONITOR_DIR,
): Promise<CrimeMonitorImportReport> {
  const files = await loadCrimeMonitorFiles(inputPath);
  const plan = buildCrimeMonitorImportPlan(files);
  return executeCrimeMonitorImportPlan(plan, db, inputPath);
}

function parseArgs(argv: string[]): { execute: boolean; inputPath: string } {
  let execute = false;
  let inputPath = DEFAULT_MONITOR_DIR;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === "--execute") {
      execute = true;
      continue;
    }
    if (arg === "--input") {
      const value = argv[index + 1];
      if (!value) throw new Error("--input requires a path");
      inputPath = path.resolve(REPO_ROOT, value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { execute, inputPath };
}

async function main(): Promise<void> {
  const { execute, inputPath } = parseArgs(process.argv.slice(2));
  const files = await loadCrimeMonitorFiles(inputPath);
  const plan = buildCrimeMonitorImportPlan(files);

  if (!execute) {
    process.stdout.write(
      `${JSON.stringify(reportFromPlan(plan, "dry-run", "unchecked", inputPath), null, 2)}\n`,
    );
    return;
  }

  const { db, pool } = await import("./client");
  try {
    const report = await executeCrimeMonitorImportPlan(plan, db, inputPath);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
    process.exitCode = 1;
  });
}
