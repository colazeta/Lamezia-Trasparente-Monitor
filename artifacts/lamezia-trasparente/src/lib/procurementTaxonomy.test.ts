import { describe, expect, it } from "vitest";

import { classifyProcurementRecord } from "../../../../lib/publication-standardisation/src/procurement";

describe("procurement taxonomy", () => {
  it("does not use generic office labels as procurement evidence", () => {
    const result = classifyProcurementRecord({
      subject: "Convocazione della commissione comunale",
      act_type: "DETERMINAZIONE",
      office: "Settore Lavori pubblici e servizi",
    });

    expect(result).toMatchObject({
      classification_status: "not_applicable",
      relevance: "none",
    });
    expect(result.evidence).toEqual([]);
  });

  it("keeps ambiguous civic uses of affidamento and gara in the review queue", () => {
    expect(
      classifyProcurementRecord({ subject: "Affidamento familiare di minore" }),
    ).toMatchObject({
      classification_status: "review_required",
      relevance: "possible",
      confidence: "low",
    });
    expect(
      classifyProcurementRecord({ subject: "Gara podistica cittadina" }),
    ).toMatchObject({
      classification_status: "review_required",
      relevance: "possible",
      confidence: "low",
    });
  });

  it("confirms lifecycle actions only when procurement context supports an ambiguous action", () => {
    const result = classifyProcurementRecord({
      subject: "Liquidazione fattura per servizio manutenzione alla ditta Alfa S.r.l.",
    });

    expect(result).toMatchObject({
      classification_status: "classified",
      relevance: "confirmed",
      confidence: "medium",
      phase: "payment",
    });
    expect(result.administrative_actions).toEqual(
      expect.arrayContaining(["liquidation", "invoice"]),
    );
  });

  it("treats withheld public-safe subjects as unknown rather than non-procurement", () => {
    const result = classifyProcurementRecord({
      subject: "Oggetto non ripubblicato per prudenza privacy",
      act_type: "DETERMINAZIONE",
      office: "Settore Lavori pubblici",
    });

    expect(result).toMatchObject({
      classification_status: "unknown",
      relevance: "unknown",
      confidence: null,
      review_reasons: ["input_withheld_for_privacy"],
    });
  });

  it("keeps a formal CIG as deterministic high-confidence evidence", () => {
    const result = classifyProcurementRecord({
      subject: "Atto collegato - C.I.G. B123456789",
    });

    expect(result).toMatchObject({
      classification_status: "classified",
      relevance: "confirmed",
      confidence: "high",
    });
    expect(result.identifiers).toEqual([
      expect.objectContaining({ type: "cig", value: "B123456789" }),
    ]);
  });
});
