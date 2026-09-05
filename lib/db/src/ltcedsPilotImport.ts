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

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PILOT_DIR = path.join(REPO_ROOT, "data", "legalita", "ltceds", "pilot", "2026-09-05");

interface ImportReport {
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

function runMachineGate(): void {
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

async function loadPilotFiles(): Promise<Array<{ fileName: string; payload: LtcedsPilotPublicEvent }>> {
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

function dryRunReport(plan: LtcedsPilotImportPlan): ImportReport {
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

async function executePlan(plan: LtcedsPilotImportPlan): Promise<ImportReport> {
  const [{ db, pool }, schema] = await Promise.all([
    import("./client"),
    import("./schema/crimeEvents"),
  ]);

  try {
    return await db.transaction(async (tx) => {
      const eventIds = plan.events.map((item) => item.event.eventId);
      const existing = eventIds.length
        ? await tx
            .select({
              eventId: schema.crimePublicEventsTable.eventId,
              payloadSha256: schema.crimePublicEventsTable.payloadSha256,
            })
            .from(schema.crimePublicEventsTable)
            .where(inArray(schema.crimePublicEventsTable.eventId, eventIds))
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
            .insert(schema.crimeSourcesTable)
            .values(source)
            .onConflictDoUpdate({
              target: schema.crimeSourcesTable.sourceId,
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
          .insert(schema.crimeEventsTable)
          .values(event)
          .onConflictDoUpdate({
            target: schema.crimeEventsTable.eventId,
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
            .insert(schema.crimeEventOffencesTable)
            .values(offence)
            .onConflictDoUpdate({
              target: schema.crimeEventOffencesTable.offenceInstanceId,
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
            .insert(schema.crimeEventLocationsTable)
            .values(location)
            .onConflictDoUpdate({
              target: schema.crimeEventLocationsTable.locationId,
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
          await tx.insert(schema.crimeEventSourcesTable).values(link).onConflictDoNothing();
        }

        if (operation !== "noop") {
          const projection = item.publicEvent;
          await tx
            .insert(schema.crimePublicEventsTable)
            .values(projection)
            .onConflictDoUpdate({
              target: schema.crimePublicEventsTable.eventId,
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
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--execute");
  if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(", ")}`);

  runMachineGate();
  const files = await loadPilotFiles();
  const plan = buildPilotImportPlan({
    files,
    mode: execute ? "execute" : "dry-run",
    databaseState: execute ? "checked" : "unchecked",
  });
  const report = execute ? await executePlan(plan) : dryRunReport(plan);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) })}\n`);
    process.exitCode = 1;
  });
}
