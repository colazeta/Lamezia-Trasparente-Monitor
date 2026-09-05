import { describe, expect, it } from "vitest";

import {
  buildStaticContractsDataset,
  extractCig,
  extractCup,
  parseExplicitAmount,
  type AlboPublicSnapshot,
} from "./staticContractsDataset";
import { createPendingAnacBdncpSnapshot } from "./anacBdncpSync";
import { BDNCP_CIG_DETAIL_URL } from "./bdncp";

describe("static contracts compatibility facade", () => {
  it("projects canonical contracts rather than treating publications as contracts", () => {
    const dataset = buildStaticContractsDataset(fixtureSnapshot());

    expect(dataset.schemaVersion).toBe("lamezia-contracts-canonical.v2");
    expect(dataset.source.scope).toBe("current-public-window");
    expect(dataset.contracts).toHaveLength(2);
    expect(dataset.coverage).toMatchObject({
      procurementEvents: 2,
      eventsWithCig: 2,
      eventsWithoutCig: 0,
      multiCigEvents: 1,
      canonicalContracts: 2,
      contractEventLinks: 2,
      withCup: 1,
      withExplicitAmount: 1,
      withExplicitSupplier: 1,
      eventCoverageInvariantSatisfied: true,
      resolutionInvariantSatisfied: true,
    });
    expect(dataset.feedStatus).toMatchObject({
      source: "canonical_albo_procurement_projection",
      status: "current-window",
      itemsTotal: 2,
    });
    expect(dataset.anacConnection).toMatchObject({
      schemaVersion: "anac-bdncp-connection.v1",
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
    expect(directAward?.anacUrl).toBe(`${BDNCP_CIG_DETAIL_URL}?cig=B123456789`);

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

  it("keeps structured ANAC matches separate from current-Albo facts", () => {
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
        tenderAmount: 9876.54,
        procedureType: "AFFIDAMENTO DIRETTO",
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
});

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
