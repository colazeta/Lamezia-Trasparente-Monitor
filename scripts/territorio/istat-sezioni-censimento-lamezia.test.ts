import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJoinParts,
  chooseIndicatorColumns,
  classifyFictitiousSection,
  detectColumns,
  normalizeMunicipalityCode,
  normalizeSectionSuffix,
} from "./istat-sezioni-censimento-lamezia";

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
