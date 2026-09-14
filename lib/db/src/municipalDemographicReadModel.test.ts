import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { planSourceSnapshot } from "./sourceSnapshotPersistence";
import {
  municipalDemographicSources,
  planMunicipalDemographicSource,
} from "./municipalDemographicPlan";
import {
  MUNICIPAL_PUBLIC_KEYS,
  MUNICIPAL_SERIES,
  readMunicipalDemographicSnapshot,
  projectMunicipalDemographicSnapshot,
  type MunicipalPublicKey,
} from "./municipalDemographicReadModel";
function fixture(key: MunicipalPublicKey) {
  const source = municipalDemographicSources.find(
    (s) => s.key === `lamezia.demographics.${key}`,
  )!;
  const bytes = readFileSync(
    new URL(`../../../${source.path}`, import.meta.url),
  );
  const p = planSourceSnapshot(source, bytes, "a".repeat(40));
  const parsed = planMunicipalDemographicSource(
    source.key,
    JSON.parse(p.contentText),
  );
  return {
    raw: JSON.parse(p.contentText),
    row: {
      series_id: 1,
      series_key: parsed.definition.seriesKey,
      unit: parsed.definition.unit,
      source_dataset: parsed.definition.datasetId,
      geography_level: "municipality",
      reference_type: "stock",
      source_key: source.key,
      acquisition_succeeded: true,
      source_hash: p.byteHash,
      byte_hash: p.byteHash,
      content_text: p.contentText,
      source_release_id: p.releaseId,
      acquired_at: "2026-09-10T19:00:00.000Z",
      typed_metadata: {
        source_registry_release_id: p.releaseId,
        extractor_version: "municipal-demographics.v1",
        source_generated_at: parsed.metadata.generated_at,
      },
      source_records: p.records,
      observations: parsed.observations.map((point) => ({
        ...point,
        series_id: 1,
        geography_code: "079160",
        reference_type: "stock",
        unit: parsed.definition.unit,
        source_status: "unknown",
        source_observation_status: null,
      })),
    },
  };
}
for (const key of MUNICIPAL_PUBLIC_KEYS)
  test(`${key}: typed public values reproduce the source without flattening provenance`, () => {
    const { row, raw } = fixture(key);
    const result = projectMunicipalDemographicSnapshot(key, row);
    const { provenance, ...data } = result;
    assert.deepEqual(data, raw);
    assert.equal(provenance.canonical, true);
    assert.equal(
      provenance.reference_period_unspecified,
      key === "families-children",
    );
    row.observations.reverse();
    assert.deepEqual(projectMunicipalDemographicSnapshot(key, row), result);
  });
for (const [name, change] of [
  ["missing observation", (r: any) => r.observations.pop()],
  ["duplicate observation", (r: any) => r.observations.push(r.observations[0])],
  ["changed typed value", (r: any) => (r.observations[0].value = "999999")],
  ["wrong geography", (r: any) => (r.observations[0].geography_code = "other")],
  ["wrong series", (r: any) => (r.observations[0].series_id = 2)],
  ["invented status", (r: any) => (r.observations[0].source_status = "final")],
  [
    "invented source status",
    (r: any) => (r.observations[0].source_observation_status = "final"),
  ],
  ["lost uncertainty", (r: any) => (r.observations[0].quality_flags = [])],
  ["corrupted hash", (r: any) => (r.byte_hash = "b".repeat(64))],
  [
    "corrupted evidence",
    (r: any) => (r.source_records[0].payload.year = "1900"),
  ],
  [
    "wrong collection",
    (r: any) => (r.source_records[0].collection_key = "other"),
  ],
  [
    "lost source link",
    (r: any) => (r.typed_metadata.source_registry_release_id = "other"),
  ],
  ["unfinished acquisition", (r: any) => (r.acquisition_succeeded = false)],
  [
    "wrong upstream",
    (r: any) => (r.source_key = "lamezia.demographics.families-children"),
  ],
] as const)
  test(`reject ${name}, not a silent static or earlier replacement`, () => {
    const { row } = fixture("population");
    change(row);
    assert.throws(() => projectMunicipalDemographicSnapshot("population", row));
  });
test("unavailable is not empty success", async () => {
  await assert.rejects(
    readMunicipalDemographicSnapshot(
      { query: async () => ({ rows: [] }) },
      "population",
    ),
    /CANONICAL_DATA_UNAVAILABLE/,
  );
});
test("invalid parameters never reach SQL", async () => {
  const client = {
    query: async () => {
      throw new Error("must not query");
    },
  };
  await assert.rejects(
    readMunicipalDemographicSnapshot(client, "__proto__"),
    /INVALID_KEY/,
  );
  await assert.rejects(
    readMunicipalDemographicSnapshot(client, "population", "';DROP"),
    /INVALID_RELEASE/,
  );
});
test("one SQL snapshot; latest selection occurs before left evidence joins", async () => {
  const { row } = fixture("population");
  let calls = 0;
  await readMunicipalDemographicSnapshot(
    {
      query: async (sql, values) => {
        calls++;
        assert.deepEqual(values, [MUNICIPAL_SERIES.population, row.byte_hash]);
        assert.ok(sql.includes("candidates AS MATERIALIZED"));
        assert.ok(sql.includes("LEFT JOIN source_releases"));
        assert.ok(!sql.includes(row.byte_hash));
        return { rows: [row] };
      },
    },
    "population",
    row.byte_hash,
  );
  assert.equal(calls, 1);
});
test("equally dated contradictory releases need resolution", async () => {
  const { row } = fixture("population");
  await assert.rejects(
    readMunicipalDemographicSnapshot(
      {
        query: async () => ({
          rows: [row, { ...row, source_hash: "b".repeat(64) }],
        }),
      },
      "population",
    ),
    /CANONICAL_RECONCILIATION_FAILED/,
  );
});
test("broken newest source does not expose a healthy older snapshot", async () => {
  const { row } = fixture("population");
  await assert.rejects(
    readMunicipalDemographicSnapshot(
      {
        query: async () => ({
          rows: [{ ...row, source_release_id: null, content_text: null }, row],
        }),
      },
      "population",
    ),
    /CANONICAL_RECONCILIATION_FAILED/,
  );
});
