import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import {
  createPendingAnacBdncpSnapshot,
  validateAnacBdncpSyncSnapshot,
  type AnacBdncpRecord,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  CARDINAL_RED_FLAGS,
  assessIndicatorReadiness,
  buildCardinalReadinessReport,
  buildCardinalRecordOcdsPaths,
  inferOcdsProcurementMethod,
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

  it("keeps every Cardinal red flag gated while the committed ANAC snapshot has no records", async () => {
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
      "/tender/tenderPeriod/endDate",
      "/tender/title",
      "/tender/value/amount",
    ]);
    assert.deepEqual(report.conditionallyProjectableOcdsPaths, [
      "/tender/procurementMethod",
      "/tender/tenderPeriod/startDate",
    ]);
    assert.deepEqual(report.locallyDerivedOcdsPaths, ["/ocid"]);
  });

  it("makes R003 computable on a source-backed open procedure with both dates", () => {
    const snapshot = createPendingAnacBdncpSnapshot("2026-09-02T12:00:00.000Z");
    snapshot.status = "current";
    snapshot.lastAttemptAt = snapshot.generatedAt;
    snapshot.lastSuccessAt = snapshot.generatedAt;
    snapshot.records = [
      record({
        procedureCode: "1",
        procedureType: "PROCEDURA APERTA",
        publicationDate: "2026-08-01",
        submissionDeadline: "2026-08-31",
      }),
    ];

    const report = buildCardinalReadinessReport(
      snapshot,
      "2026-09-02T12:05:00.000Z",
    );
    const r003 = report.indicators.find((indicator) => indicator.code === "R003");
    const r018 = report.indicators.find((indicator) => indicator.code === "R018");

    assert.ok(r003);
    assert.ok(r018);
    assert.equal(r003.status, "computable");
    assert.equal(r003.recordCoverage.computableRecords, 1);
    assert.equal(r018.status, "partially-supported");
    assert.deepEqual(r018.availableRequiredOcdsPaths, [
      "/tender/procurementMethod",
    ]);
    assert.deepEqual(r018.missingRequiredOcdsPaths, [
      "/tender/numberOfTenderers",
    ]);
    assert.equal(report.executionGate.canRunIndicators, true);
  });

  it("does not promote publication date to a submission-period start for an ambiguous procedure", () => {
    const ambiguous = record({
      procedureCode: "7",
      procedureType: "PROCEDURA NEGOZIATA",
      publicationDate: "2026-08-01",
      submissionDeadline: "2026-08-31",
    });
    const paths = buildCardinalRecordOcdsPaths(ambiguous);

    assert.equal(paths.has("/tender/tenderPeriod/endDate"), true);
    assert.equal(paths.has("/tender/tenderPeriod/startDate"), false);
    assert.equal(paths.has("/tender/procurementMethod"), false);
  });

  it("requires procedure code and label to agree before mapping to OCDS open", () => {
    assert.equal(
      inferOcdsProcurementMethod(
        record({ procedureCode: "open", procedureType: "Aperta" }),
      ),
      "open",
    );
    assert.equal(
      inferOcdsProcurementMethod(
        record({ procedureCode: "1", procedureType: "PROCEDURA APERTA" }),
      ),
      "open",
    );
    assert.equal(
      inferOcdsProcurementMethod(
        record({ procedureCode: "1", procedureType: "PROCEDURA NEGOZIATA" }),
      ),
      null,
    );
    assert.equal(
      inferOcdsProcurementMethod(
        record({ procedureCode: null, procedureType: "PROCEDURA APERTA" }),
      ),
      null,
    );
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

function record(overrides: Partial<AnacBdncpRecord> = {}): AnacBdncpRecord {
  return {
    cig: "B123456789",
    title: "Servizio civico",
    contractingAuthority: "Comune di Lamezia Terme",
    contractingAuthorityCode: "0000247922",
    contractingAuthorityTaxId: "00301390795",
    tenderAmount: 100,
    procedureType: null,
    procedureCode: null,
    publicationDate: null,
    submissionDeadline: null,
    cpvCode: null,
    cpvDescription: null,
    cpvIsPrimary: null,
    outcomeCode: null,
    outcome: null,
    outcomeDate: null,
    recordId: "G-10",
    sourceArchiveUrl: "https://dati.anticorruzione.it/archive.zip",
    sourcePeriod: "2026-08",
    acquiredAt: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}
