import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  defaultPublicMapLocations,
  isUuidV7,
  validatePublicEventSemantics,
  type LtcedsPublicEvent,
} from "@workspace/publication-standardisation/ltceds";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PILOT_DIR = path.join(REPO_ROOT, "data", "legalita", "ltceds", "pilot", "2026-09-05");
const SCHEMA_CHECK = path.join(REPO_ROOT, "scripts", "legalita", "crime-events", "ltceds-schema-check.py");

async function pilotFiles(): Promise<string[]> {
  return (await readdir(PILOT_DIR))
    .filter((name) => name.startsWith("event-") && name.endsWith(".json"))
    .sort()
    .map((name) => path.join(PILOT_DIR, name));
}

async function pilotEvents(): Promise<LtcedsPublicEvent[]> {
  return Promise.all((await pilotFiles()).map(async (file) => JSON.parse(await readFile(file, "utf8")) as LtcedsPublicEvent));
}

test("pilot contains four individually resolved public events", async () => {
  const events = await pilotEvents();
  assert.equal(events.length, 4);
  assert.equal(new Set(events.map((event) => event.event_id)).size, 4);
  for (const event of events) {
    assert.equal(event.record_status, "published");
    assert.ok(isUuidV7(event.event_id));
    assert.equal(validatePublicEventSemantics(event).length, 0);
    assert.ok(event.offences.length >= 1);
    assert.ok(event.sources.length >= 1);
    assert.ok(event.sources.every((source) => source.source_type === "law_enforcement_primary"));
  }
});

test("canonical JSON Schema validates every pilot public projection", async () => {
  const files = await pilotFiles();
  const result = spawnSync("python", [SCHEMA_CHECK, ...files], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `schema validation failed:\n${result.stdout}\n${result.stderr}`);
  const reports = result.stdout.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as { valid: boolean });
  assert.equal(reports.length, files.length);
  assert.ok(reports.every((report) => report.valid));
});

test("pilot publishes no invented or sensitive geometry", async () => {
  const events = await pilotEvents();
  for (const event of events) {
    for (const location of event.locations ?? []) {
      assert.equal(location.geometry, null);
      if (location.sensitivity === "private_or_sensitive") {
        assert.notEqual(location.privacy_transform, "none");
      }
    }
    assert.equal(defaultPublicMapLocations(event).length, 0);
  }
});

test("pilot public payloads contain no person identity fields or age-style labels", async () => {
  const files = await pilotFiles();
  const forbiddenKeys = /(^|_)(person|people|suspect|victim|offender|accused|indagato|arrestato|nome|cognome|initials?)($|_)/i;
  const agePattern = /\b\d{1,3}\s*-?enne\b/i;

  function walk(value: unknown, pointer = "$."): void {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${pointer}[${index}].`));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        assert.equal(forbiddenKeys.test(key), false, `forbidden identity key ${pointer}${key}`);
        walk(child, `${pointer}${key}.`);
      }
      return;
    }
    if (typeof value === "string") {
      assert.equal(agePattern.test(value), false, `age-style personal label leaked at ${pointer}`);
    }
  }

  for (const file of files) walk(JSON.parse(await readFile(file, "utf8")));
});

test("pilot preserves key event-identity edge cases", async () => {
  const events = await pilotEvents();
  const parish = events.find((event) => event.event_id === "0192a200-0000-7001-8000-000000000001");
  const aterp = events.find((event) => event.event_id === "0192a400-0000-7001-8000-000000000001");
  assert.ok(parish);
  assert.equal(parish.temporal.start, "2025-10-09");
  assert.match(parish.procedural_summary ?? "", /24 giugno 2026/i);
  assert.ok(aterp);
  assert.equal(aterp.event_form, "course_of_conduct");
  assert.equal(aterp.temporal.start ?? null, null);
  assert.equal(aterp.temporal.end, "2025-06-10");
});

test("pilot manifest records non-exhaustive scope and excluded false events", async () => {
  const manifest = JSON.parse(await readFile(path.join(PILOT_DIR, "manifest.json"), "utf8")) as {
    record_count: number;
    mappable_geometry_count: number;
    methodology: string;
    excluded: Array<{ candidate: string; reason: string }>;
  };
  assert.equal(manifest.record_count, 4);
  assert.equal(manifest.mappable_geometry_count, 0);
  assert.match(manifest.methodology, /non rappresenta la totalità/i);
  assert.ok(manifest.excluded.some((item) => /finto carabiniere/i.test(item.candidate) && /not as occurrence|occurrence/i.test(item.reason)));
  assert.ok(manifest.excluded.some((item) => /Artemis/i.test(item.candidate) && /multi-event/i.test(item.reason)));
});
