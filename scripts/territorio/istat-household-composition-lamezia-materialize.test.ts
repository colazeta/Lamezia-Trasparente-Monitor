import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { assertPublishableHouseholdComposition } from "./istat-household-composition-core";
import {
  buildHouseholdCompositionArtifact,
  householdRowsFromWorkbook,
  type HouseholdCompositionArtifact,
} from "./istat-household-composition-lamezia-materialize";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const artifactPath = path.join(
  repoRoot,
  "artifacts/api-server/src/data/lameziaHouseholdComposition2023.json",
);

const headers = [
  "REG",
  "PROCOM",
  "SEZ21_ID",
  "PF1",
  "PF3",
  "PF4",
  "PF5",
  "PF6",
  "PF7",
  "PF8",
];

test("selects Lamezia rows, preserves nulls and marks fictitious sections", () => {
  const rows = householdRowsFromWorkbook([
    headers,
    ["18", "79160", "791600000001", "10", "3", "2", "2", "1", "1", "1"],
    ["18", "79160", "791608888888", "2", "2", "0", "0", "0", "0", "0"],
    ["18", "79160", "791600000002", "4", "", "1", "1", "1", "1", "0"],
    ["18", "79123", "791230000001", "99", "99", "0", "0", "0", "0", "0"],
  ]);

  assert.equal(rows.length, 3);
  assert.equal(rows[0].sectionId, "0791600000001");
  assert.equal(rows[1].isFictitious, true);
  assert.equal(rows[2].PF3, null);
});

test("rejects a Lamezia row whose raw section belongs to another municipality", () => {
  assert.throws(
    () =>
      householdRowsFromWorkbook([
        headers,
        ["18", "79160", "791230000001", "1", "1", "0", "0", "0", "0", "0"],
      ]),
    /inconsistent with municipality 079160/i,
  );
});

test("rejects duplicate section identifiers before aggregation", () => {
  assert.throws(
    () =>
      householdRowsFromWorkbook([
        headers,
        ["18", "79160", "791600000001", "1", "1", "0", "0", "0", "0", "0"],
        ["18", "79160", "791600000001", "1", "1", "0", "0", "0", "0", "0"],
      ]),
    /duplicate ISTAT census section/i,
  );
});

test("requires every official household header", () => {
  assert.throws(
    () => householdRowsFromWorkbook([["PROCOM", "SEZ21_ID", "PF1", "PF3"]]),
    /missing required headers/i,
  );
});

test("the committed profile is publishable and matches the territorial PF1 total", async () => {
  const artifact = JSON.parse(
    await readFile(artifactPath, "utf8"),
  ) as HouseholdCompositionArtifact;
  assert.equal(artifact.schemaVersion, 1);
  assert.equal(artifact.totalHouseholds, 27_591);
  assert.deepEqual(
    artifact.byComponents.map(({ key, households }) => ({ key, households })),
    [
      { key: "1", households: 8_713 },
      { key: "2", households: 7_197 },
      { key: "3", households: 5_369 },
      { key: "4", households: 4_709 },
      { key: "5", households: 1_263 },
      { key: "6+", households: 340 },
    ],
  );
  assert.equal(artifact.indicators.onePersonShare, 31.6);
  assert.equal(artifact.indicators.fivePlusHouseholds, 1_603);
  assert.equal(artifact.indicators.fivePlusShare, 5.8);
  assert.equal(artifact.quality.includedRows, 246);
  assert.equal(artifact.quality.skippedFictitiousRows, 1);
  assert.equal(artifact.quality.incompleteRows, 0);
  assert.equal(artifact.quality.componentSum, 27_591);
  assert.equal(
    artifact.source.archiveSha256,
    "05661a6e248d4241c9fdd1b1fa1e740eae0706dd3fcfdbeb366f608269bfeb45",
  );
  assert.equal(
    artifact.source.workbookSha256,
    "40de6162994478f85773e71829dd7ec49badbef472e285ce4de855793eb1fa28",
  );
  assert.doesNotThrow(() => assertPublishableHouseholdComposition(artifact));

  const territorialLayer = JSON.parse(
    await readFile(
      path.join(
        repoRoot,
        "data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
      ),
      "utf8",
    ),
  ) as {
    features: Array<{
      properties?: { indicators_istat_2023?: { famiglie_totale?: unknown } };
    }>;
  };
  const pf1Values = territorialLayer.features
    .map(
      (feature) => feature.properties?.indicators_istat_2023?.famiglie_totale,
    )
    .filter((value): value is number => Number.isInteger(value));
  assert.equal(pf1Values.length, 246);
  assert.equal(
    pf1Values.reduce((sum, value) => sum + value, 0),
    artifact.totalHouseholds,
  );
});

test("does not build an artifact with non-auditable source hashes", () => {
  const rows = householdRowsFromWorkbook([
    headers,
    ["18", "79160", "791600000001", "1", "1", "0", "0", "0", "0", "0"],
  ]);
  assert.throws(
    () =>
      buildHouseholdCompositionArtifact(rows, {
        archiveSha256: "not-a-hash",
        archiveMemberSha256: "0".repeat(64),
        workbookSha256: "0".repeat(64),
      }),
    /expected a lowercase SHA-256 digest/i,
  );
});

test("does not publish a workbook that is not the archive member", () => {
  const rows = householdRowsFromWorkbook([
    headers,
    ["18", "79160", "791600000001", "1", "1", "0", "0", "0", "0", "0"],
  ]);
  assert.throws(
    () =>
      buildHouseholdCompositionArtifact(rows, {
        archiveSha256: "a".repeat(64),
        archiveMemberSha256: "b".repeat(64),
        workbookSha256: "c".repeat(64),
      }),
    /does not match archive member/i,
  );
});
