import { describe, expect, it } from "vitest";

import { buildCanonicalAlboResearchCorpus } from "../../../../lib/publication-standardisation/src/albo-research-corpus";
import {
  buildStaticContractsDataset,
  extractCig,
  extractCup,
  parseExplicitAmount,
  type AlboPublicSnapshot,
} from "./staticContractsDataset";
import { createPendingAnacBdncpSnapshot } from "./anacBdncpSync";
import { BDNCP_CIG_DETAIL_URL } from "./bdncp";

describe("static contracts dataset", () => {
  it("derives canonical contracts from the procurement taxonomy and preserves unresolved candidates", () => {
    const snapshot = fixtureSnapshot();
    const corpus = buildCanonicalAlboResearchCorpus(snapshot);
    const dataset = buildStaticContractsDataset(
      snapshot,
      createPendingAnacBdncpSnapshot(),
      corpus,
    );

    expect(dataset.schemaVersion).toBe("lamezia-contracts-current.v1");
    expect(dataset.source).toMatchObject({
      scope: "current-albo-window",
      publicClaim: "atti correnti con CIG",
      researchClaim: "atti procurement correnti tassonomizzati",
    });
    expect(dataset.taxonomy).toMatchObject({
      canonicalCorpusSchemaVersion: "albo-research-corpus.v1",
      taxonomyCoverage: 1,
      taxonomyDecided: 6,
    });
    expect(dataset.contracts).toHaveLength(2);
    expect(dataset.coverage).toMatchObject({
      procurementCandidates: 4,
      procurementItemsWithCig: 3,
      unresolvedProcurementCandidates: 1,
      cigBearingItems: 2,
      contracts: 2,
      lifecycleEvents: 3,
      withCup: 1,
      withExplicitAmount: 1,
      withExplicitSupplier: 1,
    });
    expect(dataset.unresolvedProcurementCandidates).toEqual([
      expect.objectContaining({
        canonicalId: "albo-2026-1003",
        publicationNumber: "2026/1003",
        relevance: "confirmed",
        reason: "missing_cig_in_public_safe_fields",
      }),
    ]);
    expect(dataset.feedStatus).toMatchObject({
      source: "albo_pretorio_procurement_current",
      status: "current-window",
      itemsTotal: 2,
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
    expect(directAward?.procedureType).toContain("dichiarato nell'oggetto");
    expect(directAward?.anacUrl).toBe(`${BDNCP_CIG_DETAIL_URL}?cig=B123456789`);
    expect(dataset.storylines[String(directAward?.id)]).toMatchObject({
      indicators: {
        evidenceCount: 2,
        phaseCounts: { affidamento: 1, liquidazione: 1 },
      },
    });
    expect(dataset.storylines[String(directAward?.id)].timeline).toHaveLength(2);

    const specificContract = dataset.contracts.find(
      (contract) => contract.cig === "A01D5289C5",
    );
    expect(specificContract).toMatchObject({
      supplier: "Non disponibile nei campi public-safe degli atti",
      amount: 0,
      withoutTender: false,
      withoutMepa: false,
    });
  });

  it("accepts recurring official CIG/CUP notation without turning unrelated numbers into facts", () => {
    expect(
      parseExplicitAmount(
        "Approvazione SAL 3. Svincolo della ritenuta per infortuni 0,5%.",
      ),
    ).toBe(0);
    expect(extractCup("Atto senza identificativo progetto")).toBeNull();
    expect(extractCig("CIG n. B123456789")).toBe("B123456789");
    expect(extractCig("C.I.G. A01D5289C5")).toBe("A01D5289C5");
    expect(
      extractCig("CIG AQ 9181061337 - CIG CONTRATTO SPECIFICO A01D5289C5"),
    ).toBe("A01D5289C5");
  });

  it("keeps structured ANAC matches separate from canonical Albo facts", () => {
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

    const snapshot = fixtureSnapshot();
    const dataset = buildStaticContractsDataset(
      snapshot,
      anacSnapshot,
      buildCanonicalAlboResearchCorpus(snapshot),
    );

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
    counts: { acquired: 6, publishable: 5 },
    known_limits: ["Snapshot corrente, non storico."],
    items: [
      {
        public_id: "albo-2026-1001",
        publication_number: "2026/1001",
        publication_start: "2026-08-30",
        act_date: "2026-08-29",
        subject:
          'Decisione a contrarre e affidamento diretto alla libreria "Libreria Civica". CUP C12D34567890123. CIG n. B123456789. Importo € 1.234,56.',
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
        subject: "Liquidazione fattura relativa alla fornitura. C.I.G. B123456789.",
        document_url:
          "https://albo.tinnvision.cloud/allegati/atto-1002.pdf?ente=00301390795",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1003",
        publication_number: "2026/1003",
        publication_start: "2026-08-31",
        subject:
          "Liquidazione fattura per servizio manutenzione alla società Alfa S.r.l.",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1004",
        publication_number: "2026/1004",
        publication_start: "2026-08-31",
        subject:
          "Liquidazione quota progettazione. CIG AQ 9181061337 - CIG CONTRATTO SPECIFICO A01D5289C5.",
        document_url:
          "https://albo.tinnvision.cloud/allegati/atto-1004.pdf?ente=00301390795",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1005",
        publication_number: "2026/1005",
        publication_start: "2026-08-31",
        subject: "Atto pubblico senza segnali di procurement",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1006",
        publication_number: "2026/1006",
        publication_start: "2026-08-31",
        subject: "Liquidazione CIG B000000001",
        verification_status: "official_source_acquired",
        public_visibility: "metadata_only",
      },
    ],
  };
}
