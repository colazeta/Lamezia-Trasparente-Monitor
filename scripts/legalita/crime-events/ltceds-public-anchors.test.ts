import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { streetScopeKey } from "@workspace/publication-standardisation/ltceds-location";

import {
  ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH,
  DEFAULT_PUBLIC_ANCHOR_POLICY,
  buildPublicAnchorManifest,
  buildPublicAnchorSnapshot,
  parseCsvRecords,
  partitionStreetPrivacySets,
} from "./ltceds-public-anchors";

const HEADER = [
  "access_id",
  "odonimo_raw",
  "civico",
  "esponente",
  "effective_lon",
  "effective_lat",
  "effective_coordinate_source",
  "coordinate_recovery_status",
  "coordinate_quality_flag",
  "manual_decision_confidence",
  "manual_reviewed_by",
  "manual_review_date",
  "exclude_from_geometry",
].join(",");

function row(input: {
  id: string;
  street?: string;
  civic: string;
  lon: number;
  lat: number;
  status?: string;
  quality?: string;
  source?: string;
  exponent?: string;
  confidence?: string;
  reviewer?: string;
  reviewDate?: string;
}): string {
  return [
    input.id,
    input.street ?? "VIA TEST",
    input.civic,
    input.exponent ?? "",
    input.lon,
    input.lat,
    input.source ?? "anncsu_source_coordinate",
    input.status ?? "source_coordinate_unchanged",
    input.quality ?? "ok",
    input.confidence ?? "",
    input.reviewer ?? "",
    input.reviewDate ?? "",
    "",
  ].join(",");
}

function syntheticStreet(count = 8, street = "VIA TEST"): string[] {
  return Array.from({ length: count }, (_, index) =>
    row({
      id: `${index + 1}`,
      street,
      civic: `${index + 1}`,
      lon: 16.25 + index * 0.0001,
      lat: 38.95,
    }),
  );
}

function csv(rows: readonly string[]): string {
  return `${HEADER}\n${rows.join("\n")}\n`;
}

test("CSV parser preserves quoted commas and embedded newlines", () => {
  const parsed = parseCsvRecords(
    'a,b,c\n1,"two, parts","line one\nline two"\n',
  );
  assert.deepEqual(parsed, [{ a: "1", b: "two, parts", c: "line one\nline two" }]);
});

test("eight distinct reviewed addresses with spatial spread form a street anchor", () => {
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv(syntheticStreet()),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  assert.equal(snapshot.anchors.length, 1);
  const anchor = snapshot.anchors[0]!;
  assert.equal(anchor.scope_key, streetScopeKey("VIA TEST"));
  assert.equal(anchor.privacy_set_size, 8);
  assert.ok(anchor.distinct_coordinate_count >= 3);
  assert.ok(anchor.spatial_span_m >= 30);
  assert.equal(snapshot.summary.covered_unique_addresses, 8);
});

test("duplicate rows do not inflate the privacy set", () => {
  const seven = syntheticStreet(7);
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv([...seven, seven[0]!]),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  assert.equal(snapshot.summary.eligible_rows, 8);
  assert.equal(snapshot.summary.eligible_unique_addresses, 7);
  assert.equal(snapshot.anchors.length, 0);
});

test("suspect ANNCSU coordinates and unreviewed provider results are excluded", () => {
  const rows = [
    ...syntheticStreet(8),
    row({
      id: "bad-1",
      civic: "100",
      lon: 16.26,
      lat: 38.96,
      status: "suspect_requires_review",
      quality: "street_context_mismatch",
    }),
    row({
      id: "bad-2",
      civic: "101",
      lon: 16.261,
      lat: 38.961,
      source: "nominatim",
    }),
  ];
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv(rows),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  assert.equal(snapshot.summary.eligible_rows, 8);
  assert.equal(snapshot.summary.exclusion_counts.anncsu_coordinate_not_quality_ok, 1);
  assert.equal(snapshot.summary.exclusion_counts.coordinate_source_not_eligible, 1);
});

test("reviewed manual overrides may enter the anchor source layer", () => {
  const rows = syntheticStreet(7);
  rows.push(
    row({
      id: "manual-1",
      civic: "8",
      lon: 16.2507,
      lat: 38.95,
      source: "manual_coordinate_override",
      status: "manual_override_applied",
      quality: "street_context_mismatch",
      confidence: "high",
      reviewer: "reviewer-id",
      reviewDate: "2026-09-05",
    }),
  );
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv(rows),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  assert.equal(snapshot.anchors.length, 1);
  assert.equal(snapshot.summary.eligible_rows, 8);
});

test("collapsed coordinates fail the spatial-diversity safeguard", () => {
  const rows = Array.from({ length: 12 }, (_, index) =>
    row({
      id: `${index}`,
      civic: `${index + 1}`,
      lon: 16.25,
      lat: 38.95,
    }),
  );
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv(rows),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  assert.equal(snapshot.anchors.length, 0);
  assert.equal(snapshot.summary.exclusion_counts.street_insufficient_spatial_diversity, 12);
});

test("anchor identity is stable across source row order and generation time", () => {
  const rows = syntheticStreet(10);
  const first = buildPublicAnchorSnapshot({
    csv: csv(rows),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  const second = buildPublicAnchorSnapshot({
    csv: csv([...rows].reverse()),
    generatedAt: "2026-09-06T08:00:00Z",
  });
  assert.deepEqual(
    first.anchors.map((anchor) => anchor.anchor_id),
    second.anchors.map((anchor) => anchor.anchor_id),
  );
  assert.deepEqual(
    first.anchors.map((anchor) => anchor.member_set_sha256),
    second.anchors.map((anchor) => anchor.member_set_sha256),
  );
});

test("partitioned privacy sets are disjoint and each satisfies the floor", () => {
  const records = parseCsvRecords(csv(syntheticStreet(24)));
  const addresses = records.map((record, index) => ({
    address_key: `street:test|${index + 1}|`,
    scope_key: streetScopeKey("VIA TEST"),
    street_label: "VIA TEST",
    lon: Number(record.effective_lon),
    lat: Number(record.effective_lat),
    coordinate_source: "anncsu_source_coordinate" as const,
  }));
  const groups = partitionStreetPrivacySets(addresses);
  assert.ok(groups.length >= 2);
  assert.equal(groups.flat().length, 24);
  assert.ok(groups.every((group) => group.length >= DEFAULT_PUBLIC_ANCHOR_POLICY.minimum_privacy_set_size));
  assert.equal(new Set(groups.flat().map((address) => address.address_key)).size, 24);
});

test("manifest hashes the full snapshot and carries no event-dependent fallback", () => {
  const snapshot = buildPublicAnchorSnapshot({
    csv: csv(syntheticStreet()),
    generatedAt: "2026-09-05T22:30:00Z",
  });
  const manifest = buildPublicAnchorManifest(snapshot);
  assert.match(manifest.snapshot_sha256, /^[0-9a-f]{64}$/);
  assert.match(manifest.source_sha256, /^[0-9a-f]{64}$/);
  assert.equal(manifest.fallback_layers.neighbourhood, "not_available");
  assert.equal(manifest.policy.random_jitter, false);
  assert.equal(manifest.policy.municipality_centroid, false);
});

test("current ANNCSU recovery layer materialises real privacy-safe street anchors", async () => {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
  );
  const sourcePath = path.join(repoRoot, ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH);
  const source = await readFile(sourcePath, "utf8");
  const snapshot = buildPublicAnchorSnapshot({
    csv: source,
    generatedAt: "2026-09-05T22:30:00Z",
  });

  assert.ok(snapshot.summary.input_rows > 20_000);
  assert.ok(snapshot.summary.eligible_unique_addresses > 10_000);
  assert.ok(snapshot.anchors.length > 0);
  assert.ok(snapshot.summary.covered_unique_addresses > 0);
  assert.equal(
    snapshot.anchors.reduce((sum, anchor) => sum + anchor.privacy_set_size, 0),
    snapshot.summary.covered_unique_addresses,
  );
  for (const anchor of snapshot.anchors) {
    assert.ok(anchor.privacy_set_size >= DEFAULT_PUBLIC_ANCHOR_POLICY.minimum_privacy_set_size);
    assert.ok(anchor.distinct_coordinate_count >= DEFAULT_PUBLIC_ANCHOR_POLICY.minimum_distinct_coordinate_count);
    assert.ok(anchor.spatial_span_m >= DEFAULT_PUBLIC_ANCHOR_POLICY.minimum_spatial_span_m);
    assert.ok(anchor.scope_key.startsWith("street:"));
    assert.equal("access_id" in anchor, false);
    assert.equal("civico" in anchor, false);
  }
});
