import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCrimeMonitorEventPlan,
  buildCrimeMonitorImportPlan,
  deterministicEventUuidV7,
} from "./crimeMonitorIngestionCore";

function validPayload() {
  return {
    ingestion_schema: "lt-crime-monitor/1.0",
    event_key: "lamezia:2026-09-07:esempio-monitor",
    discovered_at: "2026-09-07T06:30:00+02:00",
    updated_at: "2026-09-07T06:30:00+02:00",
    record_status: "verified_source",
    event_form: "discrete",
    title: "Evento criminale di prova per il monitor",
    temporal: {
      start: "2026-09-07",
      end: "2026-09-07",
      precision: "exact_date",
    },
    sources: [
      {
        source_key: "testata-locale-articolo-1",
        source_type: "press_secondary",
        provider: "Testata locale",
        title: "Articolo di cronaca",
        url: "https://example.org/cronaca?id=1&utm_source=test",
        published_at: "2026-09-07T06:00:00+02:00",
        retrieved_at: "2026-09-07T06:30:00+02:00",
        support_roles: ["event_support", "location_support"],
      },
    ],
    offences: [
      {
        offence_key: "offence-1",
        classification_source_key: "testata-locale-articolo-1",
        classification_basis: "provisional",
        attempt_status: "unknown",
        situational_context: ["monitoring"],
      },
    ],
    locations: [
      {
        location_key: "occurrence-1",
        basis_source_key: "testata-locale-articolo-1",
        role: "occurrence",
        municipality: "Lamezia Terme",
        evidence_basis: "source_stated_named_site",
        evidence_precision: "exact_public_site",
        resolved_precision: "exact_public_site",
        sensitivity: "public_place",
        publication_risk: "low_public_site",
        geometry: {
          type: "Point",
          coordinates: [16.309, 38.963],
        },
        place_name: "Luogo pubblico di prova",
      },
    ],
  };
}

test("monitor event identity is deterministic UUIDv7", () => {
  const first = deterministicEventUuidV7(
    "2026-09-07T06:30:00+02:00",
    "lamezia:2026-09-07:esempio-monitor",
  );
  const second = deterministicEventUuidV7(
    "2026-09-07T06:30:00+02:00",
    "lamezia:2026-09-07:esempio-monitor",
  );
  assert.equal(first, second);
  assert.match(
    first,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});

test("monitor plan persists canonical rows but never creates a public projection", () => {
  const plan = buildCrimeMonitorImportPlan([
    { fileName: "monitor/2026-09-07/example.json", payload: validPayload() },
  ]);

  assert.equal(plan.eventCount, 1);
  assert.equal(plan.sourceCount, 1);
  assert.equal(plan.offenceCount, 1);
  assert.equal(plan.locationCount, 1);
  assert.equal(plan.publicProjectionCount, 0);
  assert.equal(plan.events[0]!.event.recordStatus, "verified_source");
  assert.equal(plan.events[0]!.sources[0]!.provider, "Testata locale");
  assert.equal(
    plan.events[0]!.sources[0]!.url,
    "https://example.org/cronaca?id=1",
  );
});

test("stable child keys survive later editorial corrections", () => {
  const first = buildCrimeMonitorEventPlan({ fileName: "a.json", payload: validPayload() });
  const corrected = validPayload();
  corrected.updated_at = "2026-09-07T08:00:00+02:00";
  corrected.title = "Titolo corretto dopo verifica della fonte";
  corrected.locations[0]!.place_name = "Luogo pubblico corretto";

  const second = buildCrimeMonitorEventPlan({ fileName: "a.json", payload: corrected });
  assert.equal(first.event.eventId, second.event.eventId);
  assert.equal(first.sources[0]!.sourceId, second.sources[0]!.sourceId);
  assert.equal(
    first.offences[0]!.offenceInstanceId,
    second.offences[0]!.offenceInstanceId,
  );
  assert.equal(first.locations[0]!.locationId, second.locations[0]!.locationId);
});

test("published is not an accepted monitor status", () => {
  const payload = validPayload() as Record<string, unknown>;
  payload.record_status = "published";
  assert.throws(
    () => buildCrimeMonitorEventPlan({ fileName: "a.json", payload }),
    /published|Invalid enum value/,
  );
});

test("a monitored event must actually concern Lamezia Terme", () => {
  const payload = validPayload();
  payload.locations[0]!.municipality = "Catanzaro";
  assert.throws(
    () => buildCrimeMonitorEventPlan({ fileName: "a.json", payload }),
    /Lamezia Terme/,
  );
});
