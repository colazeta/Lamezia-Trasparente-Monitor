import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  compareSnapshotCheckpoint,
  validateSnapshotPlan,
} from "./lib/sourceSnapshotVerification.mjs";
import {
  prepareSourceSnapshotImport,
  publicSnapshotImportReport,
} from "../lib/db/src/sourceSnapshotRunner.ts";

const root = fileURLToPath(new URL("../", import.meta.url));

async function expandedFixture() {
  const { report: plan } = await prepareSourceSnapshotImport(root);
  const report = {
    ...structuredClone(plan),
    mode: "execute",
    status: "verified",
    completedAt: new Date().toISOString(),
    results: plan.sources.map((source) => ({
      source: source.source,
      status: "succeeded",
      byteHash: source.byteHash,
      records: source.records,
      verified: source.records,
      inserted: 0,
      ...(source.demographics
        ? {
            demographics: {
              ...source.demographics,
              verified: source.demographics.observations,
              inserted: 0,
            },
          }
        : {}),
      legacy:
        source.source === "lamezia.pnrr.municipal"
          ? { inserted: 0, matched: plan.pnrrExpected }
          : null,
    })),
  };
  return {
    plan,
    checkpoint: {
      status: "verified",
      verificationBasis: "process_startup",
      report: publicSnapshotImportReport(report),
    },
  };
}

function fixture() {
  const plan = {
    schemaVersion: "lt-source-import-report.v1",
    importerVersion: "test.v1",
    mode: "plan",
    status: "planned",
    repositoryCommit: "a".repeat(40),
    pnrrExpected: 2,
    sources: ["a", "b", "lamezia.pnrr.municipal", "d", "e"].map((source) => ({
      source,
      byteHash: "b".repeat(64),
      bytes: 10,
      records: 2,
      collections: { items: 2 },
      sourceStatus: "degraded",
      sourceTimestampRaw: "1970-01-01T00:00:00Z",
    })),
  };
  const checkpoint = {
    status: "verified",
    verificationBasis: "process_startup",
    report: {
      ...structuredClone(plan),
      mode: "execute",
      status: "verified",
      generatedAt: "2026-09-07T12:00:00Z",
      completedAt: "2026-09-07T12:01:00Z",
      results: plan.sources.map((source) => ({
        source: source.source,
        status: "succeeded",
        byteHash: source.byteHash,
        records: 2,
        verified: 2,
        inserted: 0,
        legacy:
          source.source === "lamezia.pnrr.municipal"
            ? { matched: 2, inserted: 0 }
            : null,
      })),
    },
  };
  return { plan, checkpoint };
}

test("accepts complete idempotent reconciliation while retaining degraded source status", () => {
  const { plan, checkpoint } = fixture();
  checkpoint.report.sources.reverse();
  assert.deepEqual(compareSnapshotCheckpoint(plan, checkpoint), {
    ok: true,
    errors: [],
  });
});

test("rejects stale commits, wrong hashes, missing results and partial reconciliation", () => {
  const mutations = [
    (c) => {
      c.report.repositoryCommit = "c".repeat(40);
    },
    (c) => {
      c.report.sources[0].byteHash = "c".repeat(64);
    },
    (c) => {
      c.report.results.pop();
    },
    (c) => {
      c.report.results[0] = c.report.results[1];
    },
    (c) => {
      c.report.results[0].status = "failed";
    },
    (c) => {
      c.report.results[0].verified = 0;
    },
    (c) => {
      c.report.results[2].legacy.matched = 1;
    },
    (c) => {
      delete c.report.results[2].legacy;
    },
    (c) => {
      c.report.sources[0].sourceTimestampRaw = null;
    },
    (c) => {
      c.report.sources[0].collections = { different: 2 };
    },
    (c) => {
      c.report.completedAt = "invalid";
    },
    (c) => {
      c.report.error = "DATABASE_FAILURE";
    },
  ];
  for (const mutate of mutations) {
    const { plan, checkpoint } = fixture();
    mutate(checkpoint);
    assert.equal(
      compareSnapshotCheckpoint(plan, checkpoint).ok,
      false,
      mutate.toString(),
    );
  }
});

test("malformed or incomplete checkpoints never become successful empty imports", () => {
  const { plan } = fixture();
  for (const checkpoint of [
    null,
    [],
    {},
    { status: "disabled" },
    { status: "verified", verificationBasis: "process_startup", report: null },
  ])
    assert.equal(compareSnapshotCheckpoint(plan, checkpoint).ok, false);
  assert.throws(
    () => compareSnapshotCheckpoint({ ...plan, sources: [] }, {}),
    /INVALID_LOCAL_PLAN/,
  );
});

test("accepts the committed nine-source plan with decoded typed expectations", async () => {
  const { plan, checkpoint } = await expandedFixture();
  assert.equal(validateSnapshotPlan(plan).size, 9);
  assert.equal(
    plan.sources.reduce((n, source) => n + source.records, 0),
    316,
  );
  assert.equal(
    plan.sources.reduce(
      (n, source) => n + (source.demographics?.observations ?? 0),
      0,
    ),
    75,
  );
  checkpoint.report.sources.reverse();
  checkpoint.report.results.reverse();
  assert.deepEqual(compareSnapshotCheckpoint(plan, checkpoint), {
    ok: true,
    errors: [],
  });
});

test("rejects missing, extra and substituted sources against the expanded plan", async () => {
  const { plan, checkpoint } = await expandedFixture();
  for (const field of ["sources", "results"]) {
    for (const mutate of [
      (rows) => rows.pop(),
      (rows) => rows.push({ ...rows[0], source: "unplanned" }),
      (rows) => {
        rows[0].source = "unplanned";
      },
      (rows) => {
        rows[0] = rows[1];
      },
    ]) {
      const changed = structuredClone(checkpoint);
      mutate(changed.report[field]);
      assert.equal(compareSnapshotCheckpoint(plan, changed).ok, false);
    }
  }
});

test("source-row success cannot mask absent or inconsistent typed observations", async () => {
  const { plan, checkpoint } = await expandedFixture();
  const mutations = [
    (result) => {
      delete result.demographics;
    },
    (result) => {
      result.demographics.seriesKey = "different-series";
    },
    (result) => {
      result.demographics.observations--;
    },
    (result) => {
      result.demographics.verified--;
    },
    (result) => {
      result.demographics.inserted = -1;
    },
    (result) => {
      result.demographics.inserted = result.demographics.observations + 1;
    },
  ];
  for (const mutate of mutations) {
    const changed = structuredClone(checkpoint);
    mutate(changed.report.results.find((source) => source.demographics));
    assert.ok(
      compareSnapshotCheckpoint(plan, changed).errors.includes(
        "DEMOGRAPHIC_RECONCILIATION_MISMATCH",
      ),
    );
  }
  const changed = structuredClone(checkpoint);
  delete changed.report.sources.find((source) => source.demographics)
    .demographics;
  assert.equal(compareSnapshotCheckpoint(plan, changed).ok, false);
});

test("rejects local municipal plans without valid typed expectations", async () => {
  const { plan } = await expandedFixture();
  for (const value of [
    undefined,
    null,
    {},
    { seriesKey: "", observations: 1 },
    { seriesKey: "example", observations: -1 },
  ]) {
    const changed = structuredClone(plan);
    changed.sources.find((source) => source.demographics).demographics = value;
    assert.throws(() => validateSnapshotPlan(changed), /INVALID_LOCAL_PLAN/);
  }
});

test(
  "verifies the real PostgreSQL import and rerun through the public checkpoint contract",
  {
    skip: !process.env.SOURCE_SNAPSHOT_INTEGRATION_REPORT,
  },
  async () => {
    const integration = JSON.parse(
      await readFile(process.env.SOURCE_SNAPSHOT_INTEGRATION_REPORT, "utf8"),
    );
    const { report: plan } = await prepareSourceSnapshotImport(root);
    assert.equal(integration.status, "passed");
    for (const report of [
      integration.firstImport,
      integration.repeatedImport,
    ]) {
      assert.deepEqual(
        compareSnapshotCheckpoint(plan, {
          status: "verified",
          verificationBasis: "process_startup",
          report: publicSnapshotImportReport(report),
        }),
        { ok: true, errors: [] },
      );
    }
  },
);
