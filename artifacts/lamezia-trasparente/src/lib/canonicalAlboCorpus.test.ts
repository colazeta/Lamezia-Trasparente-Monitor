import { describe, expect, it } from "vitest";

import { buildCanonicalAlboCorpus } from "./canonicalAlboCorpus";
import type { AlboPublicSnapshot } from "./staticContractsDataset";

describe("canonical Albo corpus", () => {
  it("materialises every official publishable record and exposes coverage gaps", () => {
    const snapshot: AlboPublicSnapshot = {
      source: "Albo Pretorio Comune di Lamezia Terme",
      source_url: "https://albo.tinnvision.cloud/?ente=00301390795",
      generated_at: "2026-09-06T00:00:00.000Z",
      counts: { acquired: 4, publishable: 3 },
      items: [
        {
          public_id: "albo-1",
          publication_number: "2026/1",
          subject: "Affidamento diretto servizio. CIG B123456789",
          verification_status: "official_source_acquired",
          public_visibility: "publishable",
        },
        {
          public_id: "albo-2",
          publication_number: "2026/2",
          subject: "Liquidazione fattura per fornitura materiale",
          verification_status: "official_source_acquired",
          public_visibility: "publishable",
        },
        {
          public_id: "albo-3",
          publication_number: "2026/3",
          subject: "Ordinanza viabilità",
          verification_status: "official_source_acquired",
          public_visibility: "publishable",
        },
        {
          public_id: "albo-4",
          publication_number: "2026/4",
          subject: "Atto non pubblicabile",
          verification_status: "official_source_acquired",
          public_visibility: "metadata_only",
        },
      ],
    };

    const corpus = buildCanonicalAlboCorpus(snapshot);

    expect(corpus.records).toHaveLength(3);
    expect(corpus.coverage).toMatchObject({
      sourceItemsObserved: 4,
      sourceItemsReportedAcquired: 4,
      publicOfficialItems: 3,
      recordsMaterialised: 3,
      procurementConfirmed: 1,
      procurementPossible: 1,
      procurementNone: 1,
      procurementWithCig: 1,
      procurementWithoutCig: 1,
      coverageInvariantSatisfied: true,
    });
    expect(corpus.records.find((record) => record.canonicalId === "albo:albo-2")?.taxonomy)
      .toMatchObject({
        procurementRelevance: "possible",
        taxonomyStatus: "review_required",
      });
  });
});
