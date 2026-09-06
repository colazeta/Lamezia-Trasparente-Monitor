import { describe, expect, it } from "vitest";

import {
  CANONICAL_TAXONOMY_VERSION,
  classifyAlboItem,
  extractCigs,
  extractCups,
} from "./canonicalAlboTaxonomy";

describe("canonical Albo taxonomy", () => {
  it("classifies every record, including non-procurement acts", () => {
    const procurement = classifyAlboItem({
      subject:
        "Determina a contrarre e affidamento diretto del servizio. CIG n. B123456789. CUP C12D34567890123.",
    });
    const unrelated = classifyAlboItem({
      subject: "Ordinanza per modifica temporanea della viabilità cittadina",
    });

    expect(procurement).toMatchObject({
      taxonomyVersion: CANONICAL_TAXONOMY_VERSION,
      taxonomyStatus: "classified",
      documentType: "determinazione",
      procurementRelevance: "confirmed",
      procurementPhase: "affidamento",
      identifiers: {
        cigCandidates: ["B123456789"],
        cigs: ["B123456789"],
        invalidCigs: [],
        cupCandidates: ["C12D34567890123"],
        cups: ["C12D34567890123"],
        invalidCups: [],
      },
    });
    expect(procurement.administrativeActions).toEqual(
      expect.arrayContaining(["decisione_contrarre", "affidamento"]),
    );

    expect(unrelated).toMatchObject({
      taxonomyStatus: "classified",
      documentType: "ordinanza",
      procurementRelevance: "none",
      procurementPhase: "not_applicable",
    });
  });

  it("keeps procurement candidates without CIG instead of dropping them", () => {
    const result = classifyAlboItem({
      subject:
        "Liquidazione fattura relativa alla fornitura di materiale per gli uffici comunali",
    });

    expect(result.procurementRelevance).toBe("possible");
    expect(result.procurementPhase).toBe("pagamento");
    expect(result.taxonomyStatus).toBe("review_required");
    expect(result.identifiers.cigs).toEqual([]);
  });

  it("preserves CIG-shaped placeholders as evidence but never as contract identities", () => {
    const result = classifyAlboItem({
      subject: "Affidamento del servizio. CIG 0000000000",
    });

    expect(result).toMatchObject({
      procurementRelevance: "confirmed",
      taxonomyStatus: "review_required",
      identifiers: {
        cigCandidates: ["0000000000"],
        cigs: [],
        invalidCigs: ["0000000000"],
      },
    });
  });

  it("recognises common punctuated and numbered identifier forms before formal validation", () => {
    expect(extractCigs("C.I.G. n. B123456789; CIG: A01D5289C5")).toEqual([
      "B123456789",
      "A01D5289C5",
    ]);
    expect(extractCups("C.U.P. n. C12D34567890123")).toEqual([
      "C12D34567890123",
    ]);
  });

  it("marks empty records as explicit insufficient evidence", () => {
    expect(classifyAlboItem({})).toMatchObject({
      taxonomyStatus: "insufficient_evidence",
      documentType: "unknown",
      procurementRelevance: "none",
    });
  });
});
