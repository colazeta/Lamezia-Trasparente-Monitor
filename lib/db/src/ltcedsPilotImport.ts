import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { inArray } from "drizzle-orm";

import {
  buildPilotImportPlan,
  classifyPublicProjectionOperation,
  type LtcedsPilotImportPlan,
  type LtcedsPilotPublicEvent,
  type PublicProjectionOperation,
} from "./ltcedsPilotImportCore";
import * as crimeSchema from "./schema/crimeEvents";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PILOT_DIR = path.join(REPO_ROOT, "data", "legalita", "ltceds", "pilot", "2026-09-05");

export type LtcedsPilotDatabase = typeof import("./client").db;

export interface ImportReport {
  mode: "dry-run" | "execute";
  databaseState: "unchecked" | "checked";
  eventCount: number;
  sourceCount: number;
  offenceCount: number;
  locationCount: number;
  publicProjectionCount: number;
  operations: {
    upsertCandidates: number;
    insert: number | null;
    update: number | null;
    noop: number | null;
  };
  events: Array<{
    eventId: string;
    fileName: string;
    payloadSha256: string;
    operation: "upsert_candidate" | PublicProjectionOperation;
  }>;
}

export function runLtcedsMachineGate(): void {
  const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(
    executable,
    ["--filter", "@workspace/scripts", "run", "check:ltceds"],
    { cwd: REPO_ROOT, stdio: "inherit", env: process.env },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`LTCEDS machine gate failed with exit status ${result.status ?? "unknown"}`);
  }
}

export async function loadLtcedsPilotFiles(): Promise<
  Array<{ fileName: string; payload: LtcedsPilotPublicEvent }>
> {
  const names = (await readdir(PILOT_DIR))
    .filter((name) => name.startsWith("event-") && name.endsWith(".json"))
    .sort();
  if (!names.length) throw new Error(`No LTCEDS pilot fixtures found in ${PILOT_DIR}`);
  return Promise.all(
    names.map(async (fileName) => ({
      fileName,
      payload: JSON.parse(await readFile(path.join(PILOT_DIR, fileName), "utf8")) as LtcedsPilotPublicEvent,
    })),
  );
}

export function buildLtcedsPilotDryRunReport(plan: LtcedsPilotImportPlan): ImportReport {
  return {
    mode: "dry-run",
    databaseState: "unchecked",
    eventCount: plan.eventCount,
    sourceCount: plan.sourceCount,
    offenceCount: plan.offenceCount,
    locationCount: plan.locationCount,
    publicProjectionCount: plan.publicProjectionCount,
    operations: {
      upsertCandidates: plan.eventCount,
      insert: null,
      update: null,
      noop: null,
    },
    events: plan.events.map((event) => ({
      eventId: event.event.eventId,
      fileName: event.fileName,
      payloadSha256: event.payloadSha256,
      operation: "upsert_candidate",
    })),
  };
}

export async function executeLtcedsPilotPlan(
  plan: LtcedsPilotImportPlan,
  db: LtcedsPilotDatabase,
): Promise<ImportReport> {
  return db.transaction(async (tx) => {
    const eventIds = plan.events.map((item) => item.event.eventId);
    const existing = eventIds.length
      ? await tx
          .select({
            eventId: crimeSchema.crimePublicEventsTable.eventId,
            payloadSha256: crimeSchema.crimePublicEventsTable.payloadSha256,
          })
          .from(crimeSchema.crimePublicEventsTable)
          .where(inArray(crimeSchema.crimePublicEventsTable.eventId, eventIds))
      : [];
    const existingHashes = new Map(existing.map((row) => [row.eventId, row.payloadSha256]));
    const operations = new Map<string, PublicProjectionOperation>();
    const totals = { insert: 0, update: 0, noop: 0 };

    for (const item of plan.events) {
      const eventId = item.event.eventId;
      const operation = classifyPublicProjectionOperation(
        existingHashes.get(eventId),
        item.payloadSha256,
      );
      operations.set(eventId, operation);
      totals[operation] += 1;

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
              canonicalSourceKey: source.canonicalSourceKey,
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

      for (const offence of item.offences) {
        await tx
          .insert(crimeSchema.crimeEventOffencesTable)
          .values(offence)
          .onConflictDoUpdate({
            target: crimeSchema.crimeEventOffencesTable.offenceInstanceId,
            set: {
              eventId: offence.eventId,
              classificationSourceId: offence.classificationSourceId,
              classificationBasis: offence.classificationBasis,
              iccsCode: offence.iccsCode,
              istatCatalogueId: offence.istatCatalogueId,
              istatSyntheticCode: offence.istatSyntheticCode,
              istatAnalyticalCode: offence.istatAnalyticalCode,
              legalReference: offence.legalReference,
              attemptStatus: offence.attemptStatus,
              situationalContext: offence.situationalContext,
              cyberRelated: offence.cyberRelated,
              affectedObjectCount: offence.affectedObjectCount,
              updatedAt: offence.updatedAt,
            },
          });
      }

      for (const location of item.locations) {
        await tx
          .insert(crimeSchema.crimeEventLocationsTable)
          .values(location)
          .onConflictDoUpdate({
            target: crimeSchema.crimeEventLocationsTable.locationId,
            set: {
              eventId: location.eventId,
              basisSourceId: location.basisSourceId,
              role: location.role,
              municipality: location.municipality,
              evidenceBasis: location.evidenceBasis,
              evidencePrecision: location.evidencePrecision,
              resolvedPrecision: location.resolvedPrecision,
              sensitivity: location.sensitivity,
              publicationRisk: location.publicationRisk,
              longitude: location.longitude,
              latitude: location.latitude,
              placeName: location.placeName,
              neighbourhood: location.neighbourhood,
              iccsLocationType: location.iccsLocationType,
              streetScopeKey: location.streetScopeKey,
              neighbourhoodScopeKey: location.neighbourhoodScopeKey,
              localityScopeKey: location.localityScopeKey,
              updatedAt: location.updatedAt,
            },
          });
      }

      for (const link of item.eventSources) {
        await tx
          .insert(crimeSchema.crimeEventSourcesTable)
          .values(link)
          .onConflictDoNothing();
      }

      if (operation !== "noop") {
        const projection = item.publicEvent;
        await tx
          .insert(crimeSchema.crimePublicEventsTable)
          .values(projection)
          .onConflictDoUpdate({
            target: crimeSchema.crimePublicEventsTable.eventId,
            set: {
              schemaVersion: projection.schemaVersion,
              payload: projection.payload,
              payloadSha256: projection.payloadSha256,
              publicationGateVersion: projection.publicationGateVersion,
              updatedAt: projection.updatedAt,
            },
          });
      }
    }

    return {
      mode: "execute",
      databaseState: "checked",
      eventCount: plan.eventCount,
      sourceCount: plan.sourceCount,
      offenceCount: plan.offenceCount,
      locationCount: plan.locationCount,
      publicProjectionCount: plan.publicProjectionCount,
      operations: {
        upsertCandidates: plan.eventCount,
        insert: totals.insert,
        update: totals.update,
        noop: totals.noop,
      },
      events: plan.events.map((event) => ({
        eventId: event.event.eventId,
        fileName: event.fileName,
        payloadSha256: event.payloadSha256,
        operation: operations.get(event.event.eventId)!,
      })),
    };
  });
}

export async function executeLtcedsPilotImport(
  db: LtcedsPilotDatabase,
  options: { runMachineGate?: boolean } = {},
): Promise<ImportReport> {
  if (options.runMachineGate !== false) runLtcedsMachineGate();
  const files = await loadLtcedsPilotFiles();
  const plan = buildPilotImportPlan({
    files,
    mode: "execute",
    databaseState: "checked",
  });
  return executeLtcedsPilotPlan(plan, db);
}

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--execute");
  if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(", ")}`);

  runLtcedsMachineGate();
  const files = await loadLtcedsPilotFiles();
  const plan = buildPilotImportPlan({
    files,
    mode: execute ? "execute" : "dry-run",
    databaseState: execute ? "checked" : "unchecked",
  });

  if (!execute) {
    process.stdout.write(`${JSON.stringify(buildLtcedsPilotDryRunReport(plan), null, 2)}\n`);
    return;
  }

  const { db, pool } = await import("./client");
  try {
    const report = await executeLtcedsPilotPlan(plan, db);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`);
    process.exitCode = 1;
  });
}
