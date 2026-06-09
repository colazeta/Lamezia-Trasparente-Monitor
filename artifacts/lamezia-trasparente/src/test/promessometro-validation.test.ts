import { describe, expect, it } from "vitest";

import { PROGRAMME_PROMISES, type ProgrammePromise } from "@/data/promessometro";
import {
  getRealProgrammePromises,
  validatePromessometroRealRecords,
} from "@/lib/promessometroValidation";

const VALID_REAL_PROMISE: ProgrammePromise = {
  id: "real-test-001",
  slug: "real-test-001",
  neutralTitle: "Intervento da fonte verificabile",
  area: "trasparenza",
  sourcePromiseSummary:
    "Sintesi neutra ricavata da una fonte programmatica o istituzionale verificata.",
  sourceLink: "https://www.comune.lamezia-terme.cz.it/",
  sourceDate: "2026-06-01",
  sourceLabel: "Documento programmatico istituzionale verificato",
  mandateReference: "Amministrazione e mandato indicati dalla fonte originale",
  implementationStatus: "non_verificabile",
  editorialSummary:
    "Scheda redazionale prudente che descrive soltanto il perimetro documentale disponibile.",
  cautionNote:
    "La classificazione è un indicatore documentale e non costituisce valutazione politica o prova di realizzazione.",
  lastVerification: "2026-06-08",
  missingForObservableImplementation:
    "Serve almeno una fonte aggiornata che documenti disponibilità, conclusione o avanzamento osservabile.",
};

describe("Promessometro real-data validation", () => {
  it("keeps the current placeholder out of real-record counts", () => {
    const result = validatePromessometroRealRecords(PROGRAMME_PROMISES);

    expect(result.realRecordCount).toBe(0);
    expect(result.placeholderCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(getRealProgrammePromises(PROGRAMME_PROMISES)).toEqual([]);
  });

  it("accepts a complete future real record with documented caution fields", () => {
    const result = validatePromessometroRealRecords([
      ...PROGRAMME_PROMISES,
      VALID_REAL_PROMISE,
    ]);

    expect(result.realRecordCount).toBe(1);
    expect(result.placeholderCount).toBe(1);
    expect(result.issues).toEqual([]);
  });

  it("rejects non-placeholder records without verifiable source and dates", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-missing-source",
      sourceLink: "",
      sourceDate: "Da inserire dopo verifica documentale",
      lastVerification: "",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          promiseId: "real-test-missing-source",
          field: "sourceLink",
        }),
        expect.objectContaining({
          promiseId: "real-test-missing-source",
          field: "sourceDate",
        }),
        expect.objectContaining({
          promiseId: "real-test-missing-source",
          field: "lastVerification",
        }),
      ]),
    );
  });

  it("rejects residual model copy in mandatory real-record fields", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-template-copy",
      sourceLabel: "Fonte programmatica da indicare prima della pubblicazione",
      mandateReference: "Mandato/amministrazione da inserire nella scheda reale",
      cautionNote: "Record dimostrativo da sostituire con una nota reale.",
      missingForObservableImplementation: "Esempio da censire in seguito.",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "sourceLabel" }),
        expect.objectContaining({ field: "mandateReference" }),
        expect.objectContaining({ field: "cautionNote" }),
        expect.objectContaining({ field: "missingForObservableImplementation" }),
      ]),
    );
  });
});
