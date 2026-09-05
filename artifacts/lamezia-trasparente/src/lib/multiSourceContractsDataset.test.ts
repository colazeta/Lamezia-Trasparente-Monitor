import { describe, expect, it } from "vitest";

import { createPendingAnacBdncpSnapshot } from "./anacBdncpSync";
import {
  createPendingAnacAuthorityDiscoverySnapshot,
  type AnacAuthorityDiscoverySnapshot,
} from "./anacAuthorityDiscovery";
import {
  buildMultiSourceContractsDataset,
  contractSourceResolution,
  MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION,
} from "./multiSourceContractsDataset";
import type { AlboPublicSnapshot } from "./contractsSource";

describe("multi-source contracts census", () => {
  it("unions canonical Albo CIGs with independently discovered ANAC CIGs", () => {
    const dataset = buildMultiSourceContractsDataset(
      alboFixture(),
      createPendingAnacBdncpSnapshot("2026-09-06T00:00:00.000Z"),
      authorityFixture(),
    );

    expect(dataset.schemaVersion).toBe(MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION);
    expect(dataset.contracts.map((contract) => contract.cig).sort()).toEqual([
      "A01D5289C5",
      "B123456789",
    ]);
    expect(dataset.reconciliation).toMatchObject({
      localCanonicalCigs: 1,
      anacAuthorityCigs: 2,
      unionCigs: 2,
      overlapCigs: ["B123456789"],
      alboOnlyCigs: [],
      anacOnlyCigs: ["A01D5289C5"],
      historicalBackfillComplete: true,
      sourceResolutionInvariantSatisfied: true,
    });
    expect(dataset.coverage).toMatchObject({
      multiSourceContracts: 2,
      overlapContracts: 1,
      alboOnlyContracts: 0,
      anacOnlyContracts: 1,
      anacAuthorityDiscoveredContracts: 2,
      authorityHistoricalBackfillComplete: true,
      unionInvariantSatisfied: true,
    });

    const anacOnly = dataset.contracts.find(
      (contract) => contract.cig === "A01D5289C5",
    );
    expect(anacOnly).toMatchObject({
      title: "Servizio ANAC non presente nell'Albo corrente",
      amount: 25000,
      supplier: "Non disponibile nel dataset CIG ANAC",
      status: "Individuato in ANAC/BDNCP; lifecycle locale da ricostruire",
    });
    expect(dataset.storylines[String(anacOnly?.id)]).toMatchObject({
      indicators: {
        evidenceCount: 1,
        awardedAmount: 0,
        status: "nessuna_liquidazione",
      },
    });
    expect(dataset.storylines[String(anacOnly?.id)].timeline[0]).toMatchObject({
      progressivo: "ANAC:A01D5289C5",
      phase: "altro",
      tipologia: "Record strutturato ANAC/BDNCP",
      estimatedAmount: 25000,
    });
  });

  it("keeps no-CIG Albo procurement evidence unresolved rather than matching it heuristically", () => {
    const snapshot = alboFixture();
    snapshot.items?.push({
      public_id: "albo-no-cig",
      publication_number: "2026/3",
      act_date: "2026-09-05",
      subject: "Liquidazione fattura relativa a fornitura per gli uffici",
      verification_status: "official_source_acquired",
      public_visibility: "publishable",
    });
    const dataset = buildMultiSourceContractsDataset(
      snapshot,
      createPendingAnacBdncpSnapshot(),
      authorityFixture(),
    );

    expect(dataset.unresolvedEvents).toHaveLength(1);
    expect(dataset.reconciliation.unresolvedAlboEvents).toBe(1);
    expect(dataset.contracts).toHaveLength(2);
  });

  it("exposes source resolution per CIG", () => {
    const dataset = buildMultiSourceContractsDataset(
      alboFixture(),
      createPendingAnacBdncpSnapshot(),
      authorityFixture(),
    );
    expect(contractSourceResolution("B123456789", dataset.reconciliation)).toBe(
      "albo_and_anac",
    );
    expect(contractSourceResolution("A01D5289C5", dataset.reconciliation)).toBe(
      "anac_only",
    );
    expect(contractSourceResolution("C000000001", dataset.reconciliation)).toBeNull();
  });
});

function alboFixture(): AlboPublicSnapshot {
  return {
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
    generated_at: "2026-09-06T00:00:00.000Z",
    retrieved_at: "2026-09-06T00:00:00.000Z",
    counts: { acquired: 2, publishable: 2 },
    items: [
      {
        public_id: "albo-1",
        publication_number: "2026/1",
        act_date: "2026-09-01",
        subject: "Affidamento diretto servizio. CIG B123456789. Euro 1.000,00",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2",
        publication_number: "2026/2",
        act_date: "2026-09-02",
        subject: "Ordinanza viabilità",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
    ],
  };
}

function authorityFixture(): AnacAuthorityDiscoverySnapshot {
  const snapshot = createPendingAnacAuthorityDiscoverySnapshot(
    "2026-09-06T00:00:00.000Z",
  );
  return {
    ...snapshot,
    status: "current",
    lastAttemptAt: "2026-09-06T00:00:00.000Z",
    lastSuccessAt: "2026-09-06T00:00:00.000Z",
    requestedYears: [2025],
    completedYears: [2025],
    completedPeriods: ["2025-01"],
    consultedArchives: [
      {
        period: "2025-01",
        year: 2025,
        url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20250101-cig_csv.zip",
        retrievedAt: "2026-09-06T00:00:00.000Z",
        recordsScanned: 100,
        matchedRecords: 2,
      },
    ],
    recordsScanned: 100,
    records: [
      {
        cig: "B123456789",
        title: "Servizio presente anche nell'Albo",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: null,
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 5000,
        procedureType: "AFFIDAMENTO DIRETTO",
        procedureCode: null,
        publicationDate: "2025-01-10",
        submissionDeadline: null,
        cpvCode: null,
        cpvDescription: null,
        cpvIsPrimary: null,
        outcomeCode: null,
        outcome: null,
        outcomeDate: null,
        recordId: null,
        sourceArchiveUrl:
          "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20250101-cig_csv.zip",
        sourcePeriod: "2025-01",
        acquiredAt: "2026-09-06T00:00:00.000Z",
      },
      {
        cig: "A01D5289C5",
        title: "Servizio ANAC non presente nell'Albo corrente",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: null,
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 25000,
        procedureType: "PROCEDURA APERTA",
        procedureCode: null,
        publicationDate: "2025-01-15",
        submissionDeadline: null,
        cpvCode: "72000000-5",
        cpvDescription: "Servizi informatici",
        cpvIsPrimary: true,
        outcomeCode: null,
        outcome: null,
        outcomeDate: null,
        recordId: null,
        sourceArchiveUrl:
          "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20250101-cig_csv.zip",
        sourcePeriod: "2025-01",
        acquiredAt: "2026-09-06T00:00:00.000Z",
      },
    ],
  };
}
