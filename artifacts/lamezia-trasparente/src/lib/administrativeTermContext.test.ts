import { describe, expect, it } from "vitest";

import {
  attachAdministrativeTermContextToAnnualRecords,
  getAdministrativeTermsForYear,
  type AdministrativeTermContext,
  validateAdministrativeTermContext,
} from "@/lib/administrativeTermContext";

const syntheticTerms: AdministrativeTermContext[] = [
  {
    id: "term-2019-2021",
    termType: "mayor_administration",
    startsOn: "2019-06-01",
    endsOn: "2021-11-10",
    mayorName: "Sindaco sintetico A",
    source: {
      label: "Fonte documentale sintetica A",
      url: "demo://administrative-terms/term-2019-2021",
    },
    verificationStatus: "documented",
    verificationNote:
      "Periodo sintetico usato solo per testare il collegamento temporale.",
  },
  {
    id: "term-2021-2022",
    termType: "commissioner_management",
    startsOn: "2021-11-11",
    endsOn: "2022-06-20",
    commissionerLabel: "Gestione commissariale sintetica",
    source: {
      label: "Fonte documentale sintetica commissariale",
    },
    verificationStatus: "partial",
    verificationNote:
      "Periodo sintetico con verifica parziale per testare lo stato prudenziale.",
  },
  {
    id: "term-2022-2026",
    termType: "mayor_administration",
    startsOn: "2022-06-21",
    endsOn: "2026-06-30",
    mayorName: "Sindaco sintetico B",
    verificationStatus: "needs_source",
    verificationNote:
      "Fonte da integrare: il modello deve permettere lo stato needs_source.",
  },
];

describe("administrativeTermContext", () => {
  it("links an annuality to all overlapping administrative periods", () => {
    const context = getAdministrativeTermsForYear(2021, syntheticTerms);

    expect(context.year).toBe(2021);
    expect(context.terms.map((linkedTerm) => linkedTerm.term.id)).toEqual([
      "term-2019-2021",
      "term-2021-2022",
    ]);
    expect(context.terms[0].overlapStartsOn).toBe("2021-01-01");
    expect(context.terms[0].overlapEndsOn).toBe("2021-11-10");
    expect(context.terms[1].overlapStartsOn).toBe("2021-11-11");
    expect(context.terms[1].overlapEndsOn).toBe("2021-12-31");
    expect(context.verificationStatus).toBe("partial");
  });

  it("keeps at least three synthetic periods as neutral temporal context only", () => {
    const linkedIds = [2020, 2021, 2023].flatMap((year) =>
      getAdministrativeTermsForYear(year, syntheticTerms).terms.map(
        (linkedTerm) => linkedTerm.term.id,
      ),
    );

    expect(new Set(linkedIds)).toEqual(
      new Set(["term-2019-2021", "term-2021-2022", "term-2022-2026"]),
    );
    expect(
      getAdministrativeTermsForYear(2023, syntheticTerms).note.toLowerCase(),
    ).not.toMatch(/rating|classifica|responsabilit|colpevol|corruzione|mafia/);
  });

  it("adds administrative term context to annual comparison records", () => {
    const annualRecords = [
      { year: 2020, recurrenceCount: 2, sourceStatus: "synthetic" },
      { year: 2023, recurrenceCount: 1, sourceStatus: "synthetic" },
    ] as const;

    const enriched = attachAdministrativeTermContextToAnnualRecords(
      annualRecords,
      syntheticTerms,
    );

    expect(enriched[0].recurrenceCount).toBe(2);
    expect(enriched[0].administrativeTermContext.terms[0].term.id).toBe(
      "term-2019-2021",
    );
    expect(enriched[1].administrativeTermContext.terms[0].term.id).toBe(
      "term-2022-2026",
    );
    expect(enriched[1].administrativeTermContext.verificationStatus).toBe(
      "needs_source",
    );
  });

  it("requires a source unless the term is explicitly marked needs_source", () => {
    expect(validateAdministrativeTermContext(syntheticTerms[0])).toEqual([]);
    expect(validateAdministrativeTermContext(syntheticTerms[2])).toEqual([]);
    expect(
      validateAdministrativeTermContext({
        ...syntheticTerms[0],
        source: undefined,
      }),
    ).toContain("source_required_unless_needs_source");
  });

  it("returns a recoverable needs_source context when no term covers an annuality", () => {
    const context = getAdministrativeTermsForYear(2030, syntheticTerms);

    expect(context.terms).toEqual([]);
    expect(context.verificationStatus).toBe("needs_source");
    expect(context.note).toMatch(/verifica fonte richiesta/i);
  });
});
