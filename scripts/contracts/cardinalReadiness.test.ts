import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  CARDINAL_RED_FLAGS,
  assessIndicatorReadiness,
  buildCardinalReadinessReport,
} from "./cardinalReadiness";

const currentSnapshotPath = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "data/public/contracts/anac-bdncp/latest.json",
);

describe("OCDS Cardinal readiness", () => {
  it("tracks the complete Cardinal 0.0.8 red-flag catalogue", () => {
    assert.deepEqual(
      CARDINAL_RED_FLAGS.map((indicator) => indicator.code),
      [
        "R003",
        "R018",
        "R024",
        "R025",
        "R028",
        "R030",
        "R035",
        "R036",
        "R038",
        "R048",
        "R058",
      ],
    );
  });

  it("keeps every Cardinal red flag gated with the current ANAC/BDNCP field set", async () => {
    const snapshot = validateAnacBdncpSyncSnapshot(
      JSON.parse(await readFile(currentSnapshotPath, "utf8")) as unknown,
    );
    const report = buildCardinalReadinessReport(
      snapshot,
      "2026-09-02T12:00:00.000Z",
    );

    assert.equal(report.indicators.length, 11);
    assert.equal(report.summary.computable, 0);
    assert.equal(report.summary["partially-supported"], 0);
    assert.equal(report.summary.unsupported, 11);
    assert.equal(report.executionGate.canRunIndicators, false);
    assert.equal(
      report.sourceFieldCoverage.every(
        (field) => field.totalRecords === snapshot.records.length,
      ),
      true,
    );
    assert.deepEqual(report.safelyProjectableOcdsPaths, [
      "/buyer/name",
      "/tender/procurementMethodDetails",
      "/tender/title",
      "/tender/value/amount",
    ]);
    assert.deepEqual(report.locallyDerivedOcdsPaths, ["/ocid"]);
  });

  it("marks an indicator computable only when every minimum prerequisite is present", () => {
    const shortSubmissionPeriod = CARDINAL_RED_FLAGS.find(
      (indicator) => indicator.code === "R003",
    );
    assert.ok(shortSubmissionPeriod);

    const readiness = assessIndicatorReadiness(
      shortSubmissionPeriod,
      new Set([
        "/tender/tenderPeriod/startDate",
        "/tender/tenderPeriod/endDate",
      ]),
    );

    assert.equal(readiness.status, "computable");
    assert.deepEqual(readiness.missingRequiredOcdsPaths, []);
  });

  it("distinguishes partial support from computability", () => {
    const singleBid = CARDINAL_RED_FLAGS.find(
      (indicator) => indicator.code === "R018",
    );
    assert.ok(singleBid);

    const readiness = assessIndicatorReadiness(
      singleBid,
      new Set(["/tender/numberOfTenderers"]),
    );

    assert.equal(readiness.status, "partially-supported");
    assert.deepEqual(readiness.availableRequiredOcdsPaths, [
      "/tender/numberOfTenderers",
    ]);
    assert.deepEqual(readiness.missingRequiredOcdsPaths, [
      "/tender/procurementMethod",
    ]);
  });

  it("does not treat the raw ANAC procedure label as an OCDS procurement method", () => {
    const singleBid = CARDINAL_RED_FLAGS.find(
      (indicator) => indicator.code === "R018",
    );
    assert.ok(singleBid);

    const readiness = assessIndicatorReadiness(
      singleBid,
      new Set(["/tender/procurementMethodDetails"]),
    );

    assert.equal(readiness.status, "unsupported");
    assert.deepEqual(readiness.missingRequiredOcdsPaths, [
      "/tender/numberOfTenderers",
      "/tender/procurementMethod",
    ]);
  });
});
