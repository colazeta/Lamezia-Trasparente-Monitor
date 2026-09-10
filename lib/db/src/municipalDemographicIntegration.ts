/** Integration test for a disposable local PostgreSQL service; never accepts a remote host. */
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import {
  executeSourceSnapshotImport,
  prepareSourceSnapshotImport,
  publicSnapshotImportReport,
} from "./sourceSnapshotRunner";
import {
  planSourceSnapshot,
  persistSourceSnapshot,
} from "./sourceSnapshotPersistence";
import { isMunicipalDemographicSource } from "./municipalDemographicPlan";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const url = process.env.MUNICIPAL_DEMOGRAPHIC_TEST_URL;
if (!url) throw new Error("MUNICIPAL_DEMOGRAPHIC_TEST_URL_REQUIRED");
const parsed = new URL(url);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) ||
  parsed.pathname !== "/municipal_demographic_test" ||
  process.env.DATABASE_URL
)
  throw new Error("DISPOSABLE_LOCAL_DATABASE_REQUIRED");
const pool = new Pool({ connectionString: url, max: 2 });
const report: Record<string, unknown> = {
  schemaVersion: "municipal-demographic-integration.v1",
  environment: "disposable-local-postgresql",
  productionAccess: false,
  startedAt: new Date().toISOString(),
};
async function counts() {
  const result = await pool.query(`SELECT
    (SELECT count(*)::integer FROM source_sources) AS sources,
    (SELECT count(*)::integer FROM source_artifacts) AS artifacts,
    (SELECT count(*)::integer FROM source_records) AS records,
    (SELECT count(*)::integer FROM demographic_series) AS series,
    (SELECT count(*)::integer FROM demographic_releases) AS releases,
    (SELECT count(*)::integer FROM demographic_observations) AS observations`);
  return result.rows[0];
}
try {
  const existing = await pool.query(
    "SELECT count(*)::integer AS n FROM information_schema.tables WHERE table_schema='public'",
  );
  assert.equal(
    existing.rows[0].n,
    0,
    "refuse an already populated test database",
  );
  await migrate(drizzle(pool), {
    migrationsFolder: path.join(root, "lib/db/migrations"),
  });
  const prepared = await prepareSourceSnapshotImport(root);
  const previous = {
    ...prepared,
    sources: prepared.sources.filter(
      (p) => !isMunicipalDemographicSource(p.source.key),
    ),
    report: {
      ...prepared.report,
      sources: prepared.report.sources.filter(
        (p) => !isMunicipalDemographicSource(p.source),
      ),
    },
  };
  const baseline = await executeSourceSnapshotImport(pool, previous);
  assert.equal(
    baseline.status,
    "verified",
    JSON.stringify(publicSnapshotImportReport(baseline)),
  );
  report.baseline = await counts();
  assert.equal((report.baseline as { observations: number }).observations, 0);
  assert.equal((report.baseline as { sources: number }).sources, 5);

  const first = await executeSourceSnapshotImport(
    pool,
    await prepareSourceSnapshotImport(root),
  );
  assert.equal(
    first.status,
    "verified",
    JSON.stringify(publicSnapshotImportReport(first)),
  );
  report.firstImport = publicSnapshotImportReport(first);
  const after = await counts();
  report.after = after;
  assert.equal(after.sources, 8);
  assert.equal(
    after.records - (report.baseline as { records: number }).records,
    50,
  );
  assert.equal(after.series, 3);
  assert.equal(after.releases, 3);
  assert.equal(after.observations, 69);

  const repeated = await executeSourceSnapshotImport(
    pool,
    await prepareSourceSnapshotImport(root),
  );
  assert.equal(
    repeated.status,
    "verified",
    JSON.stringify(publicSnapshotImportReport(repeated)),
  );
  assert.deepEqual(await counts(), after);
  for (const result of repeated.results) {
    assert.equal(result.status, "succeeded");
    if (result.status !== "succeeded") throw new Error("IMPORT_FAILED");
    assert.equal(result.inserted, 0);
    if (result.demographics) assert.equal(result.demographics.inserted, 0);
  }
  report.repeatedImport = publicSnapshotImportReport(repeated);

  const facts =
    await pool.query(`SELECT s.series_key, count(*)::integer AS observations,
    min(o.reference_period) AS first_period,max(o.reference_period) AS last_period,
    bool_and(o.source_status='unknown') AS no_invented_source_status,
    bool_and(r.release_date IS NULL) AS no_invented_release_date,
    bool_and(r.metadata->>'source_registry_release_id' IS NOT NULL) AS source_linked
    FROM demographic_observations o
    JOIN demographic_series s ON s.id=o.series_id
    JOIN demographic_releases r ON r.id=o.release_id
    GROUP BY s.series_key ORDER BY s.series_key`);
  report.series = facts.rows;
  const families = facts.rows.find(
    (r) => r.series_key === "municipal-families-by-children",
  );
  assert.equal(families.first_period, "unknown");
  assert.equal(families.last_period, "unknown");
  assert.ok(
    facts.rows.every(
      (r) =>
        r.no_invented_source_status &&
        r.no_invented_release_date &&
        r.source_linked,
    ),
  );

  // Trigger a real SQL-level reconciliation failure on a new source release.
  // Only the transaction-local inserted value is altered, not an existing record.
  const source = prepared.sources.find((p) =>
    isMunicipalDemographicSource(p.source.key),
  )!;
  const content = JSON.parse(
    await readFile(path.join(root, source.source.path), "utf8"),
  );
  content.metadata.generated_at = new Date(
    Date.parse(content.metadata.generated_at) + 1000,
  ).toISOString();
  const failurePlan = planSourceSnapshot(
    source.source,
    Buffer.from(JSON.stringify(content)),
    prepared.report.repositoryCommit,
  );
  const client = await pool.connect();
  let injected = false;
  try {
    await assert.rejects(
      persistSourceSnapshot(
        {
          query: async (text, values) => {
            if (
              text.includes("INSERT INTO public.demographic_observations") &&
              values
            ) {
              const changed = [...values];
              const rows = JSON.parse(String(changed[4]));
              rows[0].value = String(Number(rows[0].value) + 1);
              changed[4] = JSON.stringify(rows);
              injected = true;
              return client.query(text, changed);
            }
            return client.query(text, values);
          },
        },
        failurePlan,
      ),
      /MUNICIPAL_DEMOGRAPHIC_RECONCILIATION_FAILED/,
    );
  } finally {
    client.release();
  }
  assert.ok(injected);
  assert.deepEqual(
    await counts(),
    after,
    "failed import must not leave partial source or typed data",
  );
  const attempt = await pool.query(
    "SELECT status,error_code FROM source_acquisition_runs WHERE id=$1",
    [failurePlan.runId],
  );
  assert.equal(attempt.rows[0].status, "failed");
  assert.equal(
    attempt.rows[0].error_code,
    "MUNICIPAL_DEMOGRAPHIC_RECONCILIATION_FAILED",
  );
  report.failureRollback = {
    injected: true,
    dataUnchanged: true,
    attemptRecorded: true,
  };
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  const directory = path.join(
    root,
    "reports/municipal-demographic-integration",
  );
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  await pool.end();
}
