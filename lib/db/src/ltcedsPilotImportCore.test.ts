import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildPilotEventPlan,
  buildPilotImportPlan,
  canonicalJson,
  classifyPublicProjectionOperation,
  deterministicChildUuidV7,
  evidenceBasisForPrecision,
  providerFromSourceUrl,
  publicationRiskForLocation,
  sha256CanonicalJson,
  type LtcedsPilotPublicEvent,
} from "./ltcedsPilotImportCore";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PILOT_DIR = path.join(REPO_ROOT, "data", "legalita", "ltceds", "pilot", "2026-09-05");

async function pilotFiles(): Promise<Array<{ fileName: string; payload: LtcedsPilotPublicEvent }>> {
  const names = (await readdir(PILOT_DIR))
    .filter((name) => name.startsWith("event-") && name.endsWith(".json"))
    .sort();
  return Promise.all(
    names.map(async (fileName) => ({
      fileName,
      payload: JSON.parse(await readFile(path.join(PILOT_DIR, fileName), "utf8")) as LtcedsPilotPublicEvent,
    })),
  );
}

test("canonical JSON and payload hash are independent of object key order", () => {
  const a = { z: 1, nested: { b: 2, a: 1 }, values: [{ y: 2, x: 1 }] };
  const b = { values: [{ x: 1, y: 2 }], nested: { a: 1, b: 2 }, z: 1 };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(sha256CanonicalJson(a), sha256CanonicalJson(b));
  assert.match(sha256CanonicalJson(a), /^[0-9a-f]{64}$/);
});

test("deterministic child identity is stable and UUIDv7-shaped", () => {
  const eventId = "0192a100-0000-7001-8000-000000000001";
  const first = deterministicChildUuidV7(eventId, "location:0:occurrence");
  const second = deterministicChildUuidV7(eventId, "location:0:occurrence");
  const other = deterministicChildUuidV7(eventId, "location:1:occurrence");
  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(first.replaceAll("-", "").slice(0, 12), eventId.replaceAll("-", "").slice(0, 12));
});

test("pilot provider and conservative location mappings are deterministic", () => {
  assert.equal(
    providerFromSourceUrl("https://www.carabinieri.it/in-vostro-aiuto/informazioni/comunicati-stampa/example"),
    "Arma dei Carabinieri",
  );
  assert.equal(
    providerFromSourceUrl("https://questure.poliziadistato.it/Catanzaro/articolo/example"),
    "Polizia di Stato — Questura di Catanzaro",
  );
  assert.equal(evidenceBasisForPrecision("street_segment"), "source_stated_street");
  assert.equal(evidenceBasisForPrecision("locality"), "source_stated_locality");
  assert.equal(
    publicationRiskForLocation({
      role: "occurrence",
      municipality: "Lamezia Terme",
      precision: "street_segment",
      sensitivity: "private_or_sensitive",
      privacy_transform: "street_generalisation",
      geometry: null,
    }),
    "residential",
  );
});

test("real pilot plans four events without inventing coordinates or missing dates", async () => {
  const files = await pilotFiles();
  const plan = buildPilotImportPlan({ files });
  assert.equal(plan.mode, "dry-run");
  assert.equal(plan.databaseState, "unchecked");
  assert.equal(plan.eventCount, 4);
  assert.equal(plan.publicProjectionCount, 4);
  assert.equal(plan.sourceCount, 4);
  assert.equal(plan.offenceCount, 5);
  assert.equal(plan.locationCount, 4);

  for (const event of plan.events) {
    assert.match(event.payloadSha256, /^[0-9a-f]{64}$/);
    assert.equal(event.publicEvent.payloadSha256, event.payloadSha256);
    assert.equal(event.publicEvent.payload.event_id, event.event.eventId);
    assert.ok(event.locations.every((location) => location.longitude === null && location.latitude === null));
  }

  const viaCilea = plan.events.find((item) => item.event.title.includes("via Cilea"));
  assert.ok(viaCilea);
  assert.equal(viaCilea.event.temporalStartBound, "2025-10-25");
  assert.equal(viaCilea.event.temporalEndBound, "2025-10-25");
  assert.equal(viaCilea.locations[0]?.evidenceBasis, "source_stated_street");

  const aterp = plan.events.find((item) => item.event.eventForm === "course_of_conduct");
  assert.ok(aterp);
  assert.equal(aterp.event.temporalStartBound, null);
  assert.equal(aterp.event.temporalEndBound, "2025-06-10");
});

test("public projection operation classifier is idempotent", async () => {
  const files = await pilotFiles();
  const event = buildPilotEventPlan(files[0]!);
  assert.equal(classifyPublicProjectionOperation(null, event.payloadSha256), "insert");
  assert.equal(classifyPublicProjectionOperation(event.payloadSha256, event.payloadSha256), "noop");
  assert.equal(classifyPublicProjectionOperation("0".repeat(64), event.payloadSha256), "update");
});
