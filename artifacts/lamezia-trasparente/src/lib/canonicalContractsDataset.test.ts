import { describe, expect, it } from "vitest";

import {
  buildCanonicalContractsDataset,
  CANONICAL_CONTRACTS_SCHEMA_VERSION,
  contractIdForCig,
} from "./canonicalContractsDataset";
import type { AlboPublicSnapshot } from "./staticContractsDataset";

describe("canonical contracts projection", () => {
  it("groups lifecycle acts by CIG and keeps procurement events without CIG unresolved", () => {
    const dataset = buildCanonicalContractsDataset(fixtureSnapshot());

    expect(dataset.schemaVersion).toBe(CANONICAL_CONTRACTS_SCHEMA_VERSION);
    expect(dataset.coverage).toMatchObject({
      sourceItemsObserved: 5,
      publicOfficialItems: 5,
      procurementEvents: 4,
      procurementConfirmed: 3,
      procurementPossible: 1,
      eventsWithCig: 3,
      eventsWithoutCig: 1,
      multiCigEvents: 1,
      canonicalContracts: 2,
      contractEventLinks: 3,
      unresolvedEvents: 1,
      eventCoverageInvariantSatisfied: true,
      resolutionInvariantSatisfied: true,
    });

    const main = dataset.contracts.find(
      (contract) => contract.cig === "B123456789",
    );
    expect(main).toBeDefined();
    expect(main?.id).toBe(contractIdForCig("B123456789"));
    expect(main).toMatchObject({
      supplier: "Libreria Civica",
      amount: 1234.56,
      cup: "C12D34567890123",
      withoutTender: true,
    });
    expect(dataset.storylines[String(main?.id)].timeline).toHaveLength(2);
    expect(
      dataset.storylines[String(main?.id)].timeline.map((item) => item.phase),
    ).toEqual(["affidamento", "liquidazione"]);

    expect(dataset.unresolvedEvents).toHaveLength(1);
    expect(dataset.unresolvedEvents[0]).toMatchObject({
      publicationNumber: "2026/1003",
      procurementRelevance: "possible",
      resolutionStatus: "unresolved_no_cig",
      contractIds: [],
    });
  });

  it("treats a specific-contract CIG as the entity identity while retaining the framework CIG", () => {
    const dataset = buildCanonicalContractsDataset(fixtureSnapshot());
    const frameworkEvent = dataset.procurementEvents.find(
      (event) => event.publicationNumber === "2026/1004",
    );

    expect(frameworkEvent).toMatchObject({
      cigs: ["9181061337", "A01D5289C5"],
      contractIdentityCigs: ["A01D5289C5"],
      relatedCigs: ["9181061337"],
      resolutionStatus: "resolved_exact_cig",
    });
    expect(dataset.contracts.map((contract) => contract.cig)).not.toContain(
      "9181061337",
    );
    expect(dataset.contracts.map((contract) => contract.cig)).toContain(
      "A01D5289C5",
    );
  });

  it("derives stable safe numeric ids directly from canonical CIGs", () => {
    const first = contractIdForCig("B123456789");
    const second = contractIdForCig("A01D5289C5");

    expect(Number.isSafeInteger(first)).toBe(true);
    expect(first).toBeGreaterThan(0);
    expect(first).not.toBe(second);
    expect(contractIdForCig("b123456789")).toBe(first);
  });
});

function fixtureSnapshot(): AlboPublicSnapshot {
  return {
    source: "Albo Pretorio Comune di Lamezia Terme",
    source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
    generated_at: "2026-09-06T00:00:00.000Z",
    retrieved_at: "2026-09-06T00:00:00.000Z",
    counts: { acquired: 5, publishable: 5 },
    items: [
      {
        public_id: "albo-2026-1001",
        publication_number: "2026/1001",
        act_date: "2026-08-29",
        publication_start: "2026-08-30",
        subject:
          'Decisione a contrarre e affidamento diretto alla libreria "Libreria Civica". CUP C12D34567890123. CIG B123456789. Importo € 1.234,56.',
        document_url:
          "https://albo.tinnvision.cloud/allegati/atto-1001.pdf?ente=00301390795",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
        presentation: { display_title: "Fornitura libri alla biblioteca civica" },
      },
      {
        public_id: "albo-2026-1002",
        publication_number: "2026/1002",
        act_date: "2026-09-02",
        publication_start: "2026-09-03",
        subject: "Liquidazione fattura del servizio. CIG B123456789. Euro 400,00.",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1003",
        publication_number: "2026/1003",
        act_date: "2026-09-03",
        subject: "Liquidazione fattura relativa alla fornitura di materiale per uffici",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1004",
        publication_number: "2026/1004",
        act_date: "2026-09-04",
        subject:
          "Liquidazione quota progettazione. CIG AQ 9181061337 - CIG CONTRATTO SPECIFICO A01D5289C5.",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
      {
        public_id: "albo-2026-1005",
        publication_number: "2026/1005",
        act_date: "2026-09-05",
        subject: "Ordinanza temporanea di viabilità",
        verification_status: "official_source_acquired",
        public_visibility: "publishable",
      },
    ],
  };
}
