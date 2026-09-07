import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sourceSnapshotManifest } from "./sourceSnapshotManifest";
import {
  planSourceSnapshot,
  canonicalSnapshotJson,
  snapshotHash,
  snapshotDataStatements,
  persistSourceSnapshot,
  type SnapshotQueryClient,
} from "./sourceSnapshotPersistence";
import { pnrrCompatibilityRows } from "./sourceSnapshotPnrr";

const commit = "a".repeat(40),
  source = sourceSnapshotManifest[0];
const plan = (value: unknown) =>
  planSourceSnapshot(source, Buffer.from(JSON.stringify(value)), commit);
test("all original metadata, exclusions, keys and record order are reconstructable", () => {
  const input = {
    generated_at: "1970-01-01T00:00:00.000Z",
    known_limits: ["incompleto"],
    items: [
      { id: "a", title: "L'acqua € e $$", amount: null },
      { id: "b", title: "" },
    ],
    excluded: [{ id: "c", reason: "privacy" }],
  };
  const p = plan(input),
    restored = { ...p.metadata };
  for (const collection of Object.keys(p.collections))
    restored[collection] = p.records
      .filter((r) => r.collection_key === collection)
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((r) => r.payload);
  assert.deepEqual(restored, input);
  assert.equal(p.byteHash, snapshotHash(Buffer.from(p.contentText)));
  assert.equal(p.sourceTimestampRaw, input.generated_at);
  assert.equal(
    p.records[0].record_hash,
    snapshotHash(canonicalSnapshotJson(input.items[0])),
  );
});
test("native-key duplicates and missing native keys are retained as separate observations", () => {
  const p = plan({
    items: [{ id: "x", v: 1 }, { id: "x", v: 2 }, { v: 3 }],
    excluded: [],
  });
  assert.deepEqual(
    p.records.map((r) => [r.ordinal, r.native_key]),
    [
      [0, "x"],
      [1, "x"],
      [2, null],
    ],
  );
  assert.equal(new Set(p.records.map((r) => r.id)).size, 3);
});
test("record hashes are independent of object-key order while original bytes remain distinct", () => {
  const a = plan({ items: [{ id: "a", x: 1 }], excluded: [] });
  const b = plan({ excluded: [], items: [{ x: 1, id: "a" }] });
  assert.equal(a.records[0].record_hash, b.records[0].record_hash);
  assert.notEqual(a.byteHash, b.byteHash);
});
test("unsupported inputs fail before an import can begin", () => {
  assert.throws(() => plan({ items: [] }), /MISSING_COLLECTION/);
  assert.throws(() => plan({ items: [null], excluded: [] }), /INVALID_RECORD/);
  assert.throws(() =>
    planSourceSnapshot(source, new Uint8Array([0xff]), commit),
  );
  assert.throws(
    () => planSourceSnapshot(source, Buffer.from("[]"), commit),
    /OBJECT_REQUIRED/,
  );
  assert.throws(
    () => planSourceSnapshot(source, Buffer.from("{}"), "main"),
    /INVALID_REPOSITORY_COMMIT/,
  );
  assert.throws(
    () => planSourceSnapshot(source, Buffer.alloc(4194305), commit),
    /SIZE_LIMIT/,
  );
  assert.throws(
    () => canonicalSnapshotJson(Number.MAX_SAFE_INTEGER + 1),
    /UNSUPPORTED_JSON_NUMBER/,
  );
});
test("SQL keeps hostile source content in parameters", () => {
  const payload = "'); DROP TABLE source_records; -- $$ $1";
  const p = plan({ items: [{ id: payload }], excluded: [] });
  const statements = snapshotDataStatements(p);
  assert.ok(statements.every((s) => !s.text.includes(payload)));
  assert.ok(
    statements.some((s) =>
      s.values.some((v) => typeof v === "string" && v.includes(payload)),
    ),
  );
});
test("real PNRR mapping retains nulls and every attachment without conflating project source keys", () => {
  const source = sourceSnapshotManifest.find(
    (s) => s.key === "lamezia.pnrr.municipal",
  )!;
  const bytes = readFileSync(
    new URL(`../../../${source.path}`, import.meta.url),
  );
  const p = planSourceSnapshot(source, bytes, commit),
    rows = pnrrCompatibilityRows(p);
  const input = JSON.parse(bytes.toString());
  assert.equal(rows.length, input.projects.length);
  rows.forEach((row, i) => {
    assert.deepEqual(row.attachments, input.projects[i].attachments);
    assert.equal(row.status, input.projects[i].status);
    assert.equal(row.source_id, input.projects[i].source_id);
  });
});
test("PNRR money and date mapping refuse rounding and artificial timestamps", () => {
  const source = sourceSnapshotManifest.find(
    (s) => s.key === "lamezia.pnrr.municipal",
  )!;
  const input = JSON.parse(
    readFileSync(
      new URL(`../../../${source.path}`, import.meta.url),
    ).toString(),
  );
  input.projects[0].amount_eur = 12.345;
  assert.throws(
    () =>
      pnrrCompatibilityRows(
        planSourceSnapshot(source, Buffer.from(JSON.stringify(input)), commit),
      ),
    /AMOUNT_PRECISION/,
  );
  input.projects[0].amount_eur = null;
  input.projects[0].published_at = "2026-02-30";
  assert.throws(
    () =>
      pnrrCompatibilityRows(
        planSourceSnapshot(source, Buffer.from(JSON.stringify(input)), commit),
      ),
    /INVALID_DATE/,
  );
});
test("failed reconciliation rolls back data and leaves a failed attempt rather than success", async () => {
  const statements: string[] = [];
  const client: SnapshotQueryClient = {
    query: async (text) => {
      statements.push(text);
      return {
        rows: text.includes("AS release_id")
          ? [{ release_id: "x", verified: false, records: 1 }]
          : [],
      };
    },
  };
  await assert.rejects(
    persistSourceSnapshot(client, plan({ items: [{ id: "x" }], excluded: [] })),
    /RECONCILIATION_FAILED/,
  );
  const rollback = statements.lastIndexOf("ROLLBACK");
  assert.ok(rollback > statements.indexOf("COMMIT"));
  assert.ok(statements[rollback + 1].includes("status='failed'"));
  assert.ok(!statements.some((s) => s.includes("status='succeeded'")));
});
