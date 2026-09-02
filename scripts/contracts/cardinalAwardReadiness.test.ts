import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPendingAnacBdncpSnapshot, type AnacBdncpRecord } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import { buildAnacAwardsSnapshot, parseAnacAwardsCsv } from "./anacAwards";
import { buildAwardAwareCardinalReadinessReport, isR018Computable } from "./cardinalAwardReadiness";

describe("Cardinal R018 with ANAC Aggiudicazioni", () => {
  it("makes R018 computable only when bid count and open procedure co-occur on the same CIG", () => {
    const procurement = createPendingAnacBdncpSnapshot("2026-09-02T18:00:00.000Z");
    procurement.status = "current";
    procurement.lastAttemptAt = procurement.generatedAt;
    procurement.lastSuccessAt = procurement.generatedAt;
    procurement.records = [record({ procedureCode: "1", procedureType: "PROCEDURA APERTA" })];

    const parsed = parseAnacAwardsCsv(
      "cig;num_imprese_offerenti\nB123456789;1\n",
      new Set(["B123456789"]),
      { url: "https://dati.anticorruzione.it/a.zip", acquiredAt: "2026-09-02T18:00:00.000Z" },
    );
    const awards = buildAnacAwardsSnapshot({
      generatedAt: "2026-09-02T18:00:00.000Z",
      trackedCigs: ["B123456789"],
      archiveUrl: "https://dati.anticorruzione.it/a.zip",
      parsed,
    });

    const report = buildAwardAwareCardinalReadinessReport(procurement, awards, "2026-09-02T18:05:00.000Z");
    const r018 = report.indicators.find((indicator) => indicator.code === "R018");
    assert.ok(r018);
    assert.equal(r018.status, "computable");
    assert.equal(r018.recordCoverage.computableRecords, 1);
    assert.deepEqual(r018.missingRequiredOcdsPaths, []);
    assert.equal(report.awardEnrichment.numberOfTenderersAvailable, 1);
  });

  it("keeps R018 gated for a direct/ambiguous procedure even with one bidder", () => {
    const procurement = createPendingAnacBdncpSnapshot("2026-09-02T18:00:00.000Z");
    procurement.records = [record({ procedureCode: "24", procedureType: "AFFIDAMENTO DIRETTO" })];
    const parsed = parseAnacAwardsCsv(
      "cig;num_imprese_offerenti\nB123456789;1\n",
      new Set(["B123456789"]),
      { url: "https://dati.anticorruzione.it/a.zip", acquiredAt: "2026-09-02T18:00:00.000Z" },
    );
    const awards = buildAnacAwardsSnapshot({ generatedAt: "2026-09-02T18:00:00.000Z", trackedCigs: ["B123456789"], archiveUrl: "https://dati.anticorruzione.it/a.zip", parsed });
    const report = buildAwardAwareCardinalReadinessReport(procurement, awards);
    const r018 = report.indicators.find((indicator) => indicator.code === "R018");
    assert.ok(r018);
    assert.notEqual(r018.status, "computable");
    assert.equal(r018.recordCoverage.computableRecords, 0);
  });

  it("does not infer numberOfTenderers from admitted offers", () => {
    assert.equal(isR018Computable(record({ procedureCode: "1", procedureType: "PROCEDURA APERTA" }), null), false);
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
