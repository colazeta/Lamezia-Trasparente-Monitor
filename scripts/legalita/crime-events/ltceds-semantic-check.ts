import { readFile } from "node:fs/promises";
import process from "node:process";

import {
  LTCEDS_SCHEMA_VERSION,
  validatePublicEventSemantics,
  type LtcedsPublicEvent,
} from "@workspace/publication-standardisation/ltceds";

import { generateUuidV7 } from "./ltceds-identity";

function syntheticEvent(): LtcedsPublicEvent {
  return {
    event_id: generateUuidV7(1_725_000_000_000),
    schema_version: LTCEDS_SCHEMA_VERSION,
    record_status: "published",
    event_form: "discrete",
    title: "Synthetic documented event",
    temporal: { start: "2026-01-02", precision: "exact_date" },
    privacy_tier: "open",
    locations: [
      {
        role: "occurrence",
        municipality: "Example Municipality",
        precision: "exact_public_site",
        sensitivity: "public_place",
        privacy_transform: "none",
        geometry: { type: "Point", coordinates: [16.25, 38.95] },
      },
    ],
    offences: [
      {
        offence_instance_id: generateUuidV7(1_725_000_000_001),
        classification_basis: "provisional",
      },
    ],
    sources: [
      {
        source_id: generateUuidV7(1_725_000_000_002),
        source_type: "public_authority_primary",
      },
    ],
    updated_at: "2026-01-03T12:00:00Z",
  };
}

function validateEvent(event: LtcedsPublicEvent, label: string): boolean {
  const issues = validatePublicEventSemantics(event);
  process.stdout.write(`${JSON.stringify({ label, valid: issues.length === 0, issues })}\n`);
  return issues.length === 0;
}

async function selfTest(): Promise<boolean> {
  const valid = syntheticEvent();
  if (!validateEvent(valid, "self-test-valid")) return false;

  const wrongVersion = { ...valid, event_id: "550e8400-e29b-41d4-a716-446655440000" };
  if (validatePublicEventSemantics(wrongVersion).every((issue) => issue.code !== "EVENT_ID_NOT_UUIDV7")) {
    throw new Error("semantic self-test failed: UUIDv4 was not rejected");
  }

  const privateExact: LtcedsPublicEvent = {
    ...valid,
    privacy_tier: "generalised",
    locations: [
      {
        role: "occurrence",
        municipality: "Example Municipality",
        precision: "exact_address",
        sensitivity: "private_or_sensitive",
        privacy_transform: "none",
        geometry: { type: "Point", coordinates: [16.25, 38.95] },
      },
    ],
  };
  if (
    validatePublicEventSemantics(privateExact).every(
      (issue) => issue.code !== "PRIVATE_EXACT_LOCATION_NOT_GENERALISED",
    )
  ) {
    throw new Error("semantic self-test failed: private exact geometry was not rejected");
  }

  const arrestOnly: LtcedsPublicEvent = {
    ...valid,
    locations: [
      {
        role: "arrest",
        municipality: "Example Municipality",
        precision: "exact_public_site",
        sensitivity: "public_place",
        privacy_transform: "none",
        geometry: { type: "Point", coordinates: [16.25, 38.95] },
      },
    ],
  };
  const arrestIssues = validatePublicEventSemantics(arrestOnly);
  if (arrestIssues.some((issue) => issue.code === "NON_OCCURRENCE_CANNOT_BE_DEFAULT_MAP_POINT")) {
    throw new Error("semantic self-test assumption failed: non-occurrence is already excluded by map predicate");
  }

  process.stdout.write(`${JSON.stringify({ self_test: "passed" })}\n`);
  return true;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const selfTestRequested = args.includes("--self-test");
  const paths = args.filter((value) => value !== "--self-test");

  let ok = true;
  if (selfTestRequested) ok = (await selfTest()) && ok;

  for (const path of paths) {
    const event = JSON.parse(await readFile(path, "utf8")) as LtcedsPublicEvent;
    ok = validateEvent(event, path) && ok;
  }

  if (!selfTestRequested && paths.length === 0) {
    throw new Error("provide at least one JSON path or --self-test");
  }
  if (!ok) process.exitCode = 1;
}

await main();
