import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJoinParts,
  chooseIndicatorColumns,
  classifyFictitiousSection,
  detectColumns,
  normalizeMunicipalityCode,
  normalizeSectionSuffix,
} from "./istat-sezioni-censimento-lamezia-materialize";

test("normalizes Lamezia municipal codes", () => {
  assert.equal(normalizeMunicipalityCode("79160"), "079160");
  assert.equal(normalizeMunicipalityCode("079160"), "079160");
});

test("builds stable section join keys from municipality plus section suffix", () => {
  const columns = detectColumns(["PRO_COM", "SEZ21", "P1"]);
  const parts = buildJoinParts(
    {
      PRO_COM: "079160",
      SEZ21: "0000012",
      P1: "42",
    },
    columns,
  );

  assert.equal(parts.joinKey, "079160|12");
  assert.equal(parts.displaySectionId, "0791600000012");
  assert.equal(normalizeSectionSuffix("0791600000012", "079160"), "12");
});

test("handles ISTAT 2023 workbook keys that omit the leading zero in SEZ21_ID", () => {
  const columns = detectColumns([
    "CODREG",
    "CODCOM",
    "PROCOM",
    "SEZ21_ID",
    "P1",
  ]);
  const parts = buildJoinParts(
    {
      CODREG: "18",
      CODCOM: "160",
      PROCOM: "079160",
      SEZ21_ID: "791600000001",
      P1: "284",
    },
    columns,
  );

  assert.equal(columns.municipality, "PROCOM");
  assert.equal(columns.section, "SEZ21_ID");
  assert.equal(parts.joinKey, "079160|1");
  assert.equal(parts.displaySectionId, "0791600000001");
  assert.equal(normalizeSectionSuffix("791600000001", "079160"), "1");
});

test("classifies ISTAT fictitious census sections", () => {
  assert.equal(
    classifyFictitiousSection("0791608888881", "079160"),
    "senza_dimora",
  );
  assert.equal(
    classifyFictitiousSection("0791609999998", "079160"),
    "zona_in_contestazione",
  );
  assert.equal(classifyFictitiousSection("0791600000012", "079160"), undefined);
});

test("chooses a bounded first set of variable indicators", () => {
  const headers = ["PRO_COM", "SEZ", "COMUNE", "P1", "P2", "descrizione"];
  const columns = detectColumns(headers);
  const indicators = chooseIndicatorColumns(
    headers,
    [
      {
        PRO_COM: "079160",
        SEZ: "1",
        COMUNE: "Lamezia Terme",
        P1: "10",
        P2: "5",
        descrizione: "sample",
      },
    ],
    columns,
    2,
  );

  assert.deepEqual(indicators, ["P1", "P2"]);
});
