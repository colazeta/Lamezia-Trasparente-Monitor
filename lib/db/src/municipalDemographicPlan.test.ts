import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  municipalDemographicSources,
  planMunicipalDemographicSource,
} from "./municipalDemographicPlan";
import {
  planSourceSnapshot,
  persistSourceSnapshot,
  snapshotVerificationStatement,
  type SnapshotQueryClient,
} from "./sourceSnapshotPersistence";
import {
  municipalDemographicStatements,
  reconcileMunicipalDemographicSnapshot,
} from "./municipalDemographicPersistence";

const commit = "a".repeat(40);
const sourceReleaseId = "01993900-0000-7000-8000-000000000001";
function fixture(index: number) {
  const source = municipalDemographicSources[index];
  const bytes = readFileSync(
    new URL(`../../../${source.path}`, import.meta.url),
  );
  return { source, bytes, input: JSON.parse(bytes.toString()) };
}
function prepared(index: number) {
  const { source, bytes } = fixture(index);
  return planSourceSnapshot(source, bytes, commit);
}

test("three real sources retain fifty rows and map to sixty-nine typed observations", () => {
  assert.deepEqual(
    municipalDemographicSources.map((source, index) => {
      const { input } = fixture(index);
      const plan = planMunicipalDemographicSource(source.key, input);
      return [plan.records.length, plan.observations.length];
    }),
    [
      [25, 25],
      [19, 38],
      [6, 6],
    ],
  );
});

test("all compact rows can be reconstructed exactly and source bytes/metadata survive", () => {
  for (let index = 0; index < 3; index++) {
    const { source, bytes, input } = fixture(index);
    const decoded = planMunicipalDemographicSource(source.key, input);
    const p = prepared(index);
    const restoredRows = p.records
      .map(({ payload }) =>
        decoded.definition.columns.map((column) => payload[column]).join("|"),
      )
      .join("\n");
    assert.equal(restoredRows, input[decoded.definition.collection]);
    assert.equal(p.contentText, bytes.toString());
    assert.deepEqual(p.metadata.metadata, input.metadata);
    assert.equal(p.sourceTimestampRaw, input.metadata.generated_at);
    assert.equal(
      p.records.every((row) => row.native_key !== null),
      true,
    );
  }
});

test("municipal population is not relabelled as the ISTAT January stock", () => {
  const { source, input } = fixture(0);
  const plan = planMunicipalDemographicSource(source.key, input);
  assert.notEqual(plan.definition.seriesKey, "population-resident-jan1");
  assert.equal(plan.observations[0].reference_period, "2001");
  assert.equal(plan.observations[0].value, "65834");
  assert.equal(plan.observations.at(-1)!.value, "68405");
  assert.ok(
    plan.observations.every((row) =>
      row.quality_flags.includes("reference_day_unspecified"),
    ),
  );
});

test("families have an explicitly unknown reference period, not the generation year", () => {
  const { source, input } = fixture(2);
  const plan = planMunicipalDemographicSource(source.key, input);
  assert.ok(
    plan.observations.every(
      (row) =>
        row.reference_period === "unknown" &&
        row.quality_flags.includes("reference_period_unspecified"),
    ),
  );
  assert.equal(
    plan.observations.reduce((n, row) => n + Number(row.value), 0),
    13358,
  );
  assert.equal(plan.observations.at(-1)!.dimensions.children_count, "6 o piu");
  input.metadata.year = 2026;
  assert.throws(
    () => planMunicipalDemographicSource(source.key, input),
    /REFERENCE_PERIOD_REQUIRES_REVIEW/,
  );
});

test("sex counts are primary observations; redundant totals remain source evidence", () => {
  const { source, input } = fixture(1);
  const plan = planMunicipalDemographicSource(source.key, input);
  assert.equal(
    plan.observations
      .filter((row) => row.dimensions.sex === "male")
      .reduce((n, row) => n + Number(row.value), 0),
    3826,
  );
  assert.equal(
    plan.observations
      .filter((row) => row.dimensions.sex === "female")
      .reduce((n, row) => n + Number(row.value), 0),
    2790,
  );
  assert.ok(plan.observations.every((row) => row.dimensions.sex !== "total"));
  assert.equal(
    plan.observations[0].dimension_key,
    '{"age_class":"00-04","sex":"male"}',
  );
});

for (const mutation of [
  {
    name: "dataset identity",
    index: 0,
    change: (x: any) => {
      x.metadata.dataset_id = "other";
    },
    error: /SOURCE_IDENTITY_MISMATCH/,
  },
  {
    name: "column order",
    index: 0,
    change: (x: any) => {
      x.annual_columns.reverse();
    },
    error: /COLUMNS_MISMATCH/,
  },
  {
    name: "row count",
    index: 0,
    change: (x: any) => {
      x.metadata.rows++;
    },
    error: /ROW_COUNT_MISMATCH/,
  },
  {
    name: "negative count",
    index: 0,
    change: (x: any) => {
      x.annual_rows = x.annual_rows.replace("65834", "-65834");
    },
    error: /INVALID_COUNT/,
  },
  {
    name: "unsafe count precision",
    index: 0,
    change: (x: any) => {
      x.annual_rows = x.annual_rows.replace("65834", "100000000000000");
    },
    error: /COUNT_PRECISION/,
  },
  {
    name: "invented first change",
    index: 0,
    change: (x: any) => {
      x.annual_rows = x.annual_rows.replace("65834||", "65834|0|0");
    },
    error: /FIRST_CHANGE_MUST_BE_NULL/,
  },
  {
    name: "incorrect rate",
    index: 0,
    change: (x: any) => {
      x.annual_rows = x.annual_rows.replace("0.0027", "0.27");
    },
    error: /DERIVED_VALUE_MISMATCH/,
  },
  {
    name: "duplicate age class",
    index: 1,
    change: (x: any) => {
      const r = x.age_rows.split("\n");
      r[1] = r[0];
      x.age_rows = r.join("\n");
    },
    error: /DUPLICATE_SOURCE_KEY/,
  },
  {
    name: "incorrect sex total",
    index: 1,
    change: (x: any) => {
      x.age_rows = x.age_rows.replace("127|117|244", "127|117|245");
    },
    error: /DERIVED_VALUE_MISMATCH/,
  },
  {
    name: "incorrect summary",
    index: 1,
    change: (x: any) => {
      x.metadata.latest_total++;
    },
    error: /SUMMARY_MISMATCH/,
  },
  {
    name: "incorrect family cumulative count",
    index: 2,
    change: (x: any) => {
      x.family_children_rows = x.family_children_rows.replace("11991", "11992");
    },
    error: /DERIVED_VALUE_MISMATCH/,
  },
  {
    name: "impossible timestamp",
    index: 2,
    change: (x: any) => {
      x.metadata.generated_at = "2026-02-30T00:00:00.000Z";
    },
    error: /INVALID_GENERATED_AT/,
  },
]) {
  test(`rejects ${mutation.name} before persistence`, () => {
    const { source, input } = fixture(mutation.index);
    mutation.change(input);
    assert.throws(
      () =>
        planSourceSnapshot(source, Buffer.from(JSON.stringify(input)), commit),
      mutation.error,
    );
  });
}

test("verification covers exact source bytes as well as decoded payloads", () => {
  const p = prepared(0),
    statement = snapshotVerificationStatement(p);
  assert.equal(statement.values.at(-1), p.contentText);
  assert.match(
    statement.text,
    /actual.payload IS DISTINCT FROM expected.payload/,
  );
  assert.match(statement.text, /a.content_text=\$11/);
});

test("typed inserts are idempotent, append-only, parameterised and linked to source evidence", () => {
  const { source, input } = fixture(0);
  const marker = "'); DELETE FROM demographic_series; -- $$";
  input.metadata.caveat += marker;
  const p = planSourceSnapshot(
    source,
    Buffer.from(JSON.stringify(input)),
    commit,
  );
  const statements = municipalDemographicStatements(p, sourceReleaseId);
  for (const statement of [
    statements.seriesInsert,
    statements.releaseInsert,
    statements.observationInsert,
    statements.verify,
  ]) {
    assert.ok(!statement.text.includes(marker));
    assert.doesNotMatch(statement.text, /\bUPDATE\b|\bDELETE\b|\bDROP\b/);
  }
  assert.match(
    statements.seriesInsert.text,
    /ON CONFLICT\(series_key\) DO NOTHING/,
  );
  assert.match(
    statements.releaseInsert.text,
    /ON CONFLICT\(series_id,source_hash\) DO NOTHING/,
  );
  assert.match(
    statements.observationInsert.text,
    /ON CONFLICT\(release_id,geography_code,reference_period,dimension_key\) DO NOTHING/,
  );
  assert.match(
    statements.verify.text,
    /evidence.native_key=expected.source_native_key/,
  );
  assert.ok(
    statements.releaseInsert.values.some((value) =>
      String(value).includes(marker),
    ),
  );
});

test("typed failure cannot mark source import succeeded and rolls back the data transaction", async () => {
  const p = prepared(0),
    queries: string[] = [];
  const client: SnapshotQueryClient = {
    query: async (text) => {
      queries.push(text);
      if (
        text.includes("r.id AS release_id") &&
        text.includes("source_releases r JOIN artifact")
      )
        return {
          rows: [{ release_id: sourceReleaseId, verified: true, records: 25 }],
        };
      if (text.includes("s.id AS series_id"))
        return { rows: [{ verified: false, observations: 25 }] };
      return { rows: [] };
    },
  };
  await assert.rejects(
    persistSourceSnapshot(client, p),
    /MUNICIPAL_DEMOGRAPHIC_RECONCILIATION_FAILED/,
  );
  assert.equal(queries.filter((text) => text === "COMMIT").length, 1);
  assert.ok(queries.includes("ROLLBACK"));
  assert.ok(queries.at(-1)!.includes("status='failed'"));
  assert.ok(!queries.some((text) => text.includes("status='succeeded'")));
});

test("successful typed reconciliation reports verified counts without exposing payloads", async () => {
  const p = prepared(0);
  const client: SnapshotQueryClient = {
    query: async (text) => ({
      rows: text.includes("s.id AS series_id")
        ? [{ verified: true, observations: 25 }]
        : [{ inserted: 0 }],
    }),
  };
  assert.deepEqual(
    await reconcileMunicipalDemographicSnapshot(client, p, sourceReleaseId),
    {
      seriesKey: "municipal-population-resident-annual",
      observations: 25,
      inserted: 0,
      verified: 25,
    },
  );
});
