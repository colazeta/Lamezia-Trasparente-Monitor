import assert from "node:assert/strict";
import test from "node:test";
import { compareSnapshotCheckpoint } from "./lib/sourceSnapshotVerification.mjs";

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
