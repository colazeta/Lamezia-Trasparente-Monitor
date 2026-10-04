import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  checkCivicPublicSnapshot,
  checkCivicPublicSupport,
} from "./check-civic-public-snapshot.mjs";
const snapshot = JSON.parse(
  await readFile(
    new URL("../data/public/canonical/civic-snapshot.json", import.meta.url),
    "utf8",
  ),
);
const support = JSON.parse(
  await readFile(
    new URL(
      "../artifacts/lamezia-trasparente/src/data/generated/canonicalAlboSupport.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
test("retained public edition and operational support are verified together", async () => {
  assert.deepEqual(await checkCivicPublicSnapshot(snapshot), snapshot);
  checkCivicPublicSupport(snapshot, support);
  const counts = support.documentsManifest.counts;
  assert.equal(
    counts.archived +
      counts.skipped +
      counts.excluded +
      counts.human_review_required,
    counts.considered,
  );
});
test("altered data, source bindings and unreconciled counts are rejected", async () => {
  for (const mutate of [
    (s) => {
      s.pnrr.projects[0].title += " drift";
    },
    (s) => {
      s.sources[0].repository_path = "unknown.json";
    },
    (s) => {
      s.reconciliation.albo_records++;
    },
    (s) => {
      s.sources[1].source_key = s.sources[0].source_key;
    },
  ]) {
    const altered = structuredClone(snapshot);
    mutate(altered);
    await assert.rejects(() => checkCivicPublicSnapshot(altered));
  }
});
test("a refresh cannot relabel retained bytes as current source bytes", async () => {
  const altered = structuredClone(snapshot);
  altered.sources[0].byte_hash = "0".repeat(64);
  await assert.rejects(
    () => checkCivicPublicSnapshot(altered, { requireCurrentSources: true }),
    /CIVIC_SOURCE_CUTOFF_MISMATCH/,
  );
});
test("support cannot publish excluded IDs, old titles, removed descriptions or mismatched document metadata", () => {
  for (const mutate of [
    (s) => {
      s.body_hash = "0".repeat(64);
    },
    (s) => {
      s.documentsManifest.counts.excluded +=
        s.documentsManifest.counts.skipped +
        s.documentsManifest.counts.human_review_required;
    },
    (s) => {
      s.diff.diff.new.push({ id: "excluded-source-row" });
    },
    (s) => {
      s.diff.diff.new.push({
        id: snapshot.albo.items[0].id,
        subject: "old source title",
      });
    },
    (s) => {
      s.diff.diff.removed.push({ id: "removed" });
    },
    (s) => {
      s.documentsManifest.documents[0].document_url =
        "https://unapproved.invalid";
    },
  ]) {
    const altered = structuredClone(support);
    mutate(altered);
    assert.throws(() => checkCivicPublicSupport(snapshot, altered));
  }
});
