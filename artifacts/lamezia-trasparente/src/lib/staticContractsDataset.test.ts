import { describe, expect, it } from "vitest";

import {
  buildStaticContractsDataset,
  extractCig,
  extractCup,
  parseExplicitAmount,
  type AlboPublicSnapshot,
} from "./staticContractsDataset";
import { createPendingAnacBdncpSnapshot } from "./anacBdncpSync";
import {
  createPendingAnacAuthorityDiscoverySnapshot,
  type AnacAuthorityDiscoverySnapshot,
} from "./anacAuthorityDiscovery";
import { BDNCP_CIG_DETAIL_URL } from "./bdncp";

describe("static contracts compatibility facade", () => {
  it("projects the canonical Albo corpus through the multi-source census", () => {
    const dataset = buildStaticContractsDataset(fixtureSnapshot());

    expect(dataset.schemaVersion).toBe("lamezia-contracts-multisource.v1");
    expect(dataset.source.scope).toBe("known-public-sources");
    expect(dataset.source.publicClaim).toBe(
      "contratti individuati dalle fonti pubbliche integrate",
    );
    expect(dataset.contracts).toHaveLength(2);
    expect(dataset.coverage).toMatchObject({
      procurementEvents: 2,
      eventsWithCig: 2,
      eventsWithoutCig: 0,
      multiCigEvents: 1,
      canonicalContracts: 2,
      contractEventLinks: 2,
      multiSourceContracts: 2,
      overlapContracts: 0,
      alboOnlyContracts: 2,
      anacOnlyContracts: 0,
      anacAuthorityDiscoveredContracts: 0,
      anacAuthorityWithTenderAmount: 0,
      authorityHistoricalBackfillComplete: false,
      withCup: 1,
      withExplicitAmount: 1,
      withExplicitSupplier: 1,
      eventCoverageInvariantSatisfied: true,
      resolutionInvariantSatisfied: true,
      unionInvariantSatisfied: true,
    });
    expect(dataset.reconciliation).toMatchObject({
      localCanonicalCigs: 2,
      anacAuthorityCigs: 0,
      unionCigs: 2,
      overlapCigs: [],
      alboOnlyCigs: ["A01D5289C5", "B123456789"],
      anacOnlyCigs: [],
      historicalBackfillComplete: false,
      sourceResolutionInvariantSatisfied: true,
    });
    expect(dataset.feedStatus).toMatchObject({
      source: "multi_source_procurement_census",
      status: "multi-source-backfill",
      itemsTotal: 2,
    });
    expect(dataset.anacConnection).toMatchObject({
      schemaVersion: "anac-bdncp-connection.v1",
      status: "pending",
    });
    expect(dataset.authorityDiscovery).toMatchObject({
      schemaVersion: "anac-authority-discovery.v1",
      status: "pending",
    });

    const directAward = dataset.contracts.find(
      (contract) => contract.cig === "B123456789",
    );
    expect(directAward).toMatchObject({
      cup: "C12D34567890123",
      supplier: "Libreria Civica",
      amount: 1234.56,
      withoutTender: true,
      withoutMepa: false,
      macrotema: "scuole",
    });
    expect(directAward?.procedureType).toContain("dichiarato nell'atto");
    expect(directAward?.anacUrl).toBe(
      `${BDNCP_CIG_DETAIL_URL}?cig=B123456789`,
    );

    const specificContract = dataset.contracts.find(
      (contract) => contract.cig === "A01D5289C5",
    );
    expect(specificContract).toMatchObject({
      supplier: "Non disponibile negli atti pubblici collegati",
      amount: 0,
      withoutTender: false,
      withoutMepa: false,
    });
    expect(dataset.contracts.map((contract) => contract.cig)).not.toContain(
      "9181061337",
    );
  });

  it("keeps compatibility identifier and amount helpers conservative", () => {
    expect(
      parseExplicitAmount(
        "Approvazione SAL 3. Svincolo della ritenuta per infortuni 0,5%.",
      ),
    ).toBe(0);
    expect(extractCup("Atto senza identificativo progetto")).toBeNull();
    expect(
      extractCig("CIG AQ 9181061337 - CIG CONTRATTO SPECIFICO A01D5289C5"),
    ).toBe("A01D5289C5");
    expect(extractCig("C.I.G. n. B123456789")).toBe("B123456789");
  });

  it("keeps tracked-CIG ANAC enrichment separate from current-Albo facts", () => {
    const anacSnapshot = createPendingAnacBdncpSnapshot(
      "2026-09-01T12:00:00.000Z",
    );
    anacSnapshot.status = "current";
    anacSnapshot.lastAttemptAt = anacSnapshot.generatedAt;
    anacSnapshot.lastSuccessAt = anacSnapshot.generatedAt;
    anacSnapshot.consultedArchives = [
      {
        period: "2026-08",
        url: "https://dati.anticorruzione.it/archive.zip",
        retrievedAt: anacSnapshot.generatedAt,
        recordsScanned: 20,
        matchedRecords: 1,
      },
    ];
    anacSnapshot.records = [
      {
        cig: "B123456789",
        title: "Record ANAC del lotto",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: null,
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 9876.54,
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
        recordId: "GARA-1",
        sourceArchiveUrl: "https://dati.anticorruzione.it/archive.zip",
        sourcePeriod: "2026-08",
        acquiredAt: anacSnapshot.generatedAt,
      },
    ];

    const dataset = buildStaticContractsDataset(fixtureSnapshot(), anacSnapshot);

    expect(dataset.anacConnection.coverage).toMatchObject({
      structuredMatches: 1,
      consultedArchives: 1,
    });
    expect(dataset.anacConnection.unmatchedCigs).toContain("A01D5289C5");
    expect(
      dataset.contracts.find((contract) => contract.cig === "B123456789")
        ?.amount,
    ).toBe(1234.56);
  });

  it("adds ANAC-only CIGs without overwriting overlapping local evidence", () => {
    const authority = authoritySnapshotFixture();
    const dataset = buildStaticContractsDataset(
      fixtureSnapshot(),
      createPendingAnacBdncpSnapshot(),
      authority,
    );

    expect(dataset.contracts.map((contract) => contract.cig).sort()).toEqual([
      "A01D5289C5",
      "B123456789",
      "C000000001",
    ]);
    expect(dataset.reconciliation).toMatchObject({
      overlapCigs: ["B123456789"],
      alboOnlyCigs: ["A01D5289C5"],
      anacOnlyCigs: ["C000000001"],
      unionCigs: 3,
    });
    expect(dataset.coverage).toMatchObject({
      anacAuthorityDiscoveredContracts: 2,
      anacAuthorityWithTenderAmount: 2,
    });
    expect(
      dataset.contracts.find((contract) => contract.cig === "B123456789")
        ?.amount,
    ).toBe(1234.56);
    expect(
      dataset.contracts.find((contract) => contract.cig === "C000000001"),
    ).toMatchObject({
      title: "Procedura solo ANAC",
      amount: 0,
      status: "Individuato in ANAC/BDNCP; lifecycle locale da ricostruire",
    });
    const anacOnly = dataset.contracts.find(
      (contract) => contract.cig === "C000000001",
    );
    expect(dataset.storylines[String(anacOnly?.id)].timeline[0]).toMatchObject({
      estimatedAmount: 5000,
      tipologia: "Record strutturato ANAC/BDNCP",
    });
  });
});

function authoritySnapshotFixture(): AnacAuthorityDiscoverySnapshot {
  const generatedAt = "2026-09-01T12:00:00.000Z";
  return {
    ...createPendingAnacAuthorityDiscoverySnapshot(generatedAt),
    status: "current",
    lastAttemptAt: generatedAt,
    lastSuccessAt: generatedAt,
    requestedYears: [2025],
    completedYears: [2025],
    completedPeriods: ["2025-01"],
    consultedArchives: [
      {
        period: "2025-01",
        year: 2025,
        url: "https://dati.anticorruzione.it/opendata/download/dataset/cig-2025/filesystem/20250101-cig_csv.zip",
        retrievedAt: generatedAt,
        recordsScanned: 100,
        matchedRecords: 2,
      },
    ],
    recordsScanned: 100,
    records: [
      {
        cig: "B123456789",
        title: "Record ANAC sovrapposto",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: null,
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 9999,
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
        acquiredAt: generatedAt,
      },
      {
        cig: "C000000001",
        title: "Procedura solo ANAC",
        contractingAuthority: "Comune di Lamezia Terme",
        contractingAuthorityCode: null,
        contractingAuthorityTaxId: "00301390795",
        tenderAmount: 5000,
        procedureType: "PROCEDURA APERTA",
        procedureCode: null,
        publicationDate: "2025-01-15",
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
        acquiredAt: generatedAt,
      },
    ],
  };
}

function fixtureSnapshot(): AlboPublicSnapshot {
  return {
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
    generated_at: "2026-09-01T12:00:00.000Z",
    retrieved_at: "2026-09-01T12:00:00.000Z",
    counts: { acquired: 4, publishable: 3 },
    known_limits: ["Snapshot corrente, non storico."],
    items: [
      {
        public_id: "albo-2026-1001",
        publication_number: "2026/1001",
        publication_start: "2026-08-30",
        act_date: "2026-08-29",
        subject:
          'Decisione a contrarre e affidamento diretto alla libreria "Libreria Civica". CUP C12D34567890123. CIG B123456789. Importo € 1.234,56.',
        document_url:
          "https://albo.tinnvision.cloud/allegati/atto-1001.pdf?ente=00301390795",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
        presentation: {
          display_title: "Fornitura libri alla biblioteca civica",
          area_theme: { theme_id: "scuola_educazione" },
        },
      },
      {
        public_id: "albo-2026-1002",
        publication_number: "2026/1002",
        publication_start: "2026-08-31",
        subject:
          "Liquidazione quota progettazione. CIG AQ 9181061337 - CIG CONTRATTO SPECIFICO A01D5289C5.",
        document_url:
          "https://albo.tinnvision.cloud/allegati/atto-1002.pdf?ente=00301390795",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1003",
        publication_number: "2026/1003",
        publication_start: "2026-08-31",
        subject: "Metadato minimo CIG B000000001",
        verification_status: "official_source_acquired",
        public_visibility: "metadata_only",
      },
      {
        public_id: "albo-2026-1004",
        publication_number: "2026/1004",
        publication_start: "2026-08-31",
        subject: "Atto pubblico senza CIG",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
    ],
  };
}
