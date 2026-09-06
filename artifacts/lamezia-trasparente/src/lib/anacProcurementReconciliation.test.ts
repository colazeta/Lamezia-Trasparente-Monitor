import { describe, expect, it } from "vitest";

import {
  buildAnacProcurementReconciliation,
  ANAC_PROCUREMENT_RECONCILIATION_SCHEMA_VERSION,
} from "./anacProcurementReconciliation";
import { buildCanonicalContractsDataset } from "./canonicalContractsDataset";
import { createPendingAnacAuthorityDiscoverySnapshot } from "./anacAuthorityDiscovery";
import type { AlboPublicSnapshot } from "./contractsSource";

describe("ANAC procurement reconciliation", () => {
  it("separates overlap, ANAC-only, Albo-only and unresolved Albo events", () => {
    const contracts = buildCanonicalContractsDataset(alboFixture());
    const authority = createPendingAnacAuthorityDiscoverySnapshot(
      "2026-09-06T07:00:00.000Z",
    );
    authority.status = "current";
    authority.lastAttemptAt = authority.generatedAt;
    authority.lastSuccessAt = authority.generatedAt;
    authority.requestedYears = [2025, 2026];
    authority.completedYears = [2025];
    authority.completedPeriods = ["2025-12", "2026-08"];
    authority.consultedArchives = [
      {
        period: "2025-12",
        year: 2025,
        url: "https://dati.anticorruzione.it/example-2025-12.zip",
        retrievedAt: authority.generatedAt,
        recordsScanned: 100,
        matchedRecords: 1,
      },
      {
        period: "2026-08",
        year: 2026,
        url: "https://dati.anticorruzione.it/example-2026-08.zip",
        retrievedAt: authority.generatedAt,
        recordsScanned: 120,
        matchedRecords: 1,
      },
    ];
    authority.recordsScanned = 220;
    authority.records = [
      anacRecord("B123456789", "2026-08"),
      anacRecord("C123456789", "2025-12"),
    ];

    const result = buildAnacProcurementReconciliation(contracts, authority);

    expect(result.schemaVersion).toBe(
      ANAC_PROCUREMENT_RECONCILIATION_SCHEMA_VERSION,
    );
    expect(result.coverage).toMatchObject({
      canonicalAlboContracts: 2,
      anacAuthorityContracts: 2,
      both: 1,
      anacOnly: 1,
      alboOnly: 1,
      unresolvedAlboProcurementEvents: 1,
      unionUniqueCigs: 3,
      historicalBackfillComplete: true,
      reconciliationInvariantSatisfied: true,
    });
    expect(result.records.map((record) => [record.cig, record.classification])).toEqual([
      ["A123456789", "albo_only"],
      ["B123456789", "both"],
      ["C123456789", "anac_only"],
    ]);
    expect(result.unresolvedAlboEvents).toHaveLength(1);
    expect(result.unresolvedAlboEvents[0].publicationNumber).toBe("2026/3");
  });
});

function alboFixture(): AlboPublicSnapshot {
  return {
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
    generated_at: "2026-09-06T06:00:00.000Z",
    counts: { acquired: 3, publishable: 3 },
    items: [
      {
        public_id: "1",
        publication_number: "2026/1",
        act_date: "2026-09-01",
        subject: "Affidamento diretto servizio. CIG B123456789",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "2",
        publication_number: "2026/2",
        act_date: "2026-09-02",
        subject: "Affidamento diretto fornitura. CIG A123456789",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "3",
        publication_number: "2026/3",
        act_date: "2026-09-03",
        subject: "Liquidazione fattura relativa alla fornitura di materiale",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
    ],
  };
}

function anacRecord(cig: string, sourcePeriod: string) {
  return {
    cig,
    title: `Procedura ${cig}`,
    contractingAuthority: "Comune di Lamezia Terme",
    contractingAuthorityCode: null,
    contractingAuthorityTaxId: "00301390795",
    tenderAmount: 1000,
    procedureType: "AFFIDAMENTO DIRETTO",
    procedureCode: null,
    publicationDate: "2026-08-01",
    submissionDeadline: null,
    cpvCode: null,
    cpvDescription: null,
    cpvIsPrimary: null,
    outcomeCode: null,
    outcome: null,
    outcomeDate: null,
    recordId: `record-${cig}`,
    sourceArchiveUrl: `https://dati.anticorruzione.it/${sourcePeriod}.zip`,
    sourcePeriod,
    acquiredAt: "2026-09-06T07:00:00.000Z",
  };
}
