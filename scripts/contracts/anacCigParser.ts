import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

import {
  normaliseAnacCigRecords,
  type AnacCigNormalisationOptions,
  type AnacCigNormalisationResult,
  type AnacCigSourceRecord,
} from "./normaliseContractDossier";

export interface AnacCigFixturePayload {
  fixture_label?: string;
  fixture_note?: string;
  records: AnacCigSourceRecord[];
}

export async function parseAnacCigFixtureFile(
  fixturePath: string,
  options: AnacCigNormalisationOptions,
): Promise<AnacCigNormalisationResult[]> {
  const resolvedPath = resolveLocalFixturePath(fixturePath);
  const payload = parseAnacCigFixtureJson(
    await readFile(resolvedPath, "utf8"),
    resolvedPath,
  );

  return normaliseAnacCigRecords(payload.records, options);
}

export function parseAnacCigFixtureJson(
  jsonText: string,
  sourceLabel = "inline fixture",
): AnacCigFixturePayload {
  const parsed: unknown = JSON.parse(jsonText);
  const records = Array.isArray(parsed)
    ? parsed
    : isFixturePayload(parsed)
      ? parsed.records
      : null;

  if (!records) {
    throw new Error(
      `Fixture ${sourceLabel} must be a JSON array or contain records[].`,
    );
  }

  return {
    fixture_label: isFixturePayload(parsed) ? parsed.fixture_label : undefined,
    fixture_note: isFixturePayload(parsed) ? parsed.fixture_note : undefined,
    records: records.map((record, index) =>
      coerceRecord(record, index, sourceLabel),
    ),
  };
}

function resolveLocalFixturePath(fixturePath: string): string {
  if (/^https?:\/\//i.test(fixturePath)) {
    throw new Error("ANAC CIG parser accepts local fixture files only.");
  }

  const resolvedPath = isAbsolute(fixturePath)
    ? fixturePath
    : resolve(fixturePath);

  if (!resolvedPath.toLowerCase().endsWith(".json")) {
    throw new Error("ANAC CIG parser currently supports JSON fixtures only.");
  }

  return resolvedPath;
}

function isFixturePayload(value: unknown): value is AnacCigFixturePayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "records" in value &&
    Array.isArray((value as { records?: unknown }).records)
  );
}

function coerceRecord(
  value: unknown,
  index: number,
  sourceLabel: string,
): AnacCigSourceRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `Fixture ${sourceLabel} record ${index + 1} must be an object.`,
    );
  }

  return value as AnacCigSourceRecord;
}
