import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  householdCompositionSource,
  planHouseholdComposition,
  householdCompositionReleaseMetadata,
  HOUSEHOLD_COMPOSITION_SERIES,
} from "./householdCompositionPlan";
import {
  planSourceSnapshot,
  canonicalSnapshotJson,
  snapshotHash,
} from "./sourceSnapshotPersistence";
import {
  projectHouseholdComposition,
  readHouseholdComposition,
} from "./householdCompositionReadModel";
import { demographicSnapshotStatements } from "./municipalDemographicPersistence";

const bytes = readFileSync(
  new URL(
    "../../../artifacts/api-server/src/data/lameziaHouseholdComposition2023.json",
    import.meta.url,
  ),
);
const input = () => JSON.parse(bytes.toString());
const p = planSourceSnapshot(householdCompositionSource, bytes, "a".repeat(40));
function fixture() {
  const plan = planHouseholdComposition(input());
  return {
    series_id: 8,
    series_key: HOUSEHOLD_COMPOSITION_SERIES,
    source_dataset: plan.definition.datasetId,
    unit: "famiglie",
    reference_type: "stock",
    geography_level: "municipality",
    content_text: bytes.toString(),
    byte_hash: p.byteHash,
    source_hash: p.byteHash,
    source_key: householdCompositionSource.key,
    acquisition_succeeded: true,
    source_release_id: p.releaseId,
    typed_metadata: householdCompositionReleaseMetadata(input(), p.releaseId),
    source_records: structuredClone(p.records),
    observations: plan.observations.map((o) => ({
      ...o,
      series_id: 8,
      geography_code: "079160",
      reference_type: "stock",
      unit: "famiglie",
      source_status: "unknown",
      source_observation_status: null,
    })),
    acquired_at: new Date("2026-09-19T14:00:00Z"),
  };
}

test("six ISTAT aggregates produce six distinct dated observations, not 246 sections or municipal children classes", () => {
  const plan = planHouseholdComposition(input());
  assert.equal(p.records.length, 6);
  assert.equal(plan.observations.length, 6);
  assert.deepEqual(
    plan.observations.map((o) => o.dimensions),
    ["1", "2", "3", "4", "5", "6+"].map((components) => ({ components })),
  );
  assert.ok(
    plan.observations.every((o) => o.reference_period === "2023-12-31"),
  );
  assert.equal(
    plan.observations.reduce((n, o) => n + Number(o.value), 0),
    27591,
  );
  assert.equal(p.contentText, bytes.toString());
  assert.equal(
    p.sourceTimestampRaw,
    null,
    "verification is not a fabricated source-generation timestamp",
  );
  assert.deepEqual(p.demographics, {
    seriesKey: HOUSEHOLD_COMPOSITION_SERIES,
    observations: 6,
  });
  const sql = demographicSnapshotStatements(p, p.releaseId);
  assert.equal(sql.seriesInsert.values.at(-1), "ISTAT");
  assert.equal(sql.verify.values.at(-1), "ISTAT");
  assert.match(String(sql.releaseInsert.values.at(-1)), /2023-12-31/);
});

test("rejects wrong identity, period, source fields, missing values, non-reconciliation and unverified provenance", () => {
  const changes = [
    (x: any) => (x.referenceYear = 2024),
    (x: any) => (x.municipality.istatCode = "000000"),
    (x: any) => (x.source.referenceDate = "2023-01-01"),
    (x: any) => (x.source.sourceUpdateDate = "2026-02-30"),
    (x: any) => (x.source.archiveSha256 = "wrong"),
    (x: any) => (x.source.downloadUrl = "https://example.com/data"),
    (x: any) => (x.verification.verifiedAt = "2023-01-01T00:00:00.000Z"),
    (x: any) => (x.byComponents[0].households = null),
    (x: any) => (x.byComponents[0].households = -1),
    (x: any) => (x.byComponents[0].sourceField = "PF4"),
    (x: any) => (x.byComponents[0].key = "6+"),
    (x: any) => (x.byComponents[0].share = 0),
    (x: any) => x.byComponents.pop(),
    (x: any) => x.totalHouseholds++,
    (x: any) => x.quality.componentSum--,
    (x: any) => x.quality.incompleteRows++,
    (x: any) => x.indicators.fivePlusHouseholds--,
  ];
  for (const change of changes) {
    const x = input();
    change(x);
    assert.throws(
      () => planHouseholdComposition(x),
      /HOUSEHOLD_COMPOSITION_INVALID_SOURCE/,
      change.toString(),
    );
  }
});

test("projects measured counts with source quality and separate provenance dates; public allowlist excludes unexpected metadata", () => {
  const row = fixture();
  const x = input();
  x.private = "not-public";
  x.source.private = "not-public";
  x.byComponents[0].private = "not-public";
  row.content_text = JSON.stringify(x);
  row.byte_hash = row.source_hash = snapshotHash(row.content_text);
  row.source_records[0].payload = x.byComponents[0];
  row.source_records[0].record_hash = snapshotHash(
    canonicalSnapshotJson(x.byComponents[0]),
  );
  const out = projectHouseholdComposition(row);
  assert.equal(out.totalHouseholds, 27591);
  assert.equal(out.quality.includedRows, 246);
  assert.equal(out.source.referenceDate, "2023-12-31");
  assert.equal(out.source.sourceUpdateDate, "2026-06-09");
  assert.equal(out.verification.verifiedAt, "2026-09-01T18:11:15.000Z");
  assert.equal(out.provenance.acquired_at, "2026-09-19T14:00:00.000Z");
  assert.ok(!JSON.stringify(out).includes("not-public"));
});

test("read reconciliation rejects altered evidence, counts, dimensional meanings, metadata and duplicate observations", () => {
  const changes = [
    (r: any) => (r.byte_hash = "b".repeat(64)),
    (r: any) => (r.acquisition_succeeded = false),
    (r: any) => (r.source_key = "lamezia.demographics.families-children"),
    (r: any) => r.source_records[0].payload.households++,
    (r: any) => (r.source_records[0].ordinal = 1),
    (r: any) => r.source_records.pop(),
    (r: any) => (r.typed_metadata.source_update_date = "2026-09-19"),
    (r: any) => (r.observations[0].value = "0"),
    (r: any) => (r.observations[0].reference_period = "2023"),
    (r: any) => (r.observations[0].dimensions = { children_count: "1" }),
    (r: any) => (r.observations[0].source_status = "final"),
    (r: any) => (r.observations[1] = r.observations[0]),
  ];
  for (const change of changes) {
    const row = structuredClone(fixture());
    change(row);
    assert.throws(
      () => projectHouseholdComposition(row),
      /CANONICAL_RECONCILIATION_FAILED/,
      change.toString(),
    );
  }
});

test("reader uses one read, pins releases, rejects ambiguous latest editions and never falls back from a broken newest release", async () => {
  let calls = 0;
  const row = fixture();
  const client = {
    query: async (_: string, values?: unknown[]) => {
      calls++;
      assert.deepEqual(values, [HOUSEHOLD_COMPOSITION_SERIES, p.byteHash]);
      return { rows: [row] };
    },
  };
  assert.equal(
    (await readHouseholdComposition(client, p.byteHash)).provenance
      .release_hash,
    p.byteHash,
  );
  assert.equal(calls, 1);
  await assert.rejects(
    readHouseholdComposition(client, "invalid"),
    /INVALID_RELEASE/,
  );
  assert.equal(calls, 1);
  await assert.rejects(
    readHouseholdComposition({ query: async () => ({ rows: [] }) }),
    /CANONICAL_DATA_UNAVAILABLE/,
  );
  await assert.rejects(
    readHouseholdComposition({
      query: async () => ({ rows: [{ ...row, source_release_id: null }, row] }),
    }),
    /CANONICAL_RECONCILIATION_FAILED/,
  );
  await assert.rejects(
    readHouseholdComposition({
      query: async () => ({
        rows: [row, { ...row, source_hash: "b".repeat(64) }],
      }),
    }),
    /CANONICAL_RECONCILIATION_FAILED/,
  );
});
