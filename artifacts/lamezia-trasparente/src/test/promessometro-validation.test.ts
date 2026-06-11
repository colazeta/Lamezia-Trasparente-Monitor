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
  it("keeps the current placeholder out of real-record validation", () => {
    const result = validatePromessometroRealRecords(PROGRAMME_PROMISES);
    const realPromises = getRealProgrammePromises(PROGRAMME_PROMISES);

    expect(result.realRecordCount).toBe(realPromises.length);
    expect(result.placeholderCount).toBe(
      PROGRAMME_PROMISES.filter((promise) => promise.isPlaceholder === true).length,
    );
    expect(result.issues).toEqual([]);
    expect(realPromises.every((promise) => promise.isPlaceholder !== true)).toBe(true);
  });

  it("accepts a complete future real record with documented caution fields", () => {
    const result = validatePromessometroRealRecords([
      ...PROGRAMME_PROMISES,
      VALID_REAL_PROMISE,
    ]);

    expect(result.realRecordCount).toBe(
      getRealProgrammePromises([...PROGRAMME_PROMISES, VALID_REAL_PROMISE]).length,
    );
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
          reason: "invalid-url",
        }),
        expect.objectContaining({
          promiseId: "real-test-missing-source",
          field: "sourceDate",
          reason: "invalid-date",
        }),
        expect.objectContaining({
          promiseId: "real-test-missing-source",
          field: "lastVerification",
          reason: "invalid-date",
        }),
      ]),
    );
  });

  it("rejects impossible calendar dates instead of accepting JavaScript normalization", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-impossible-date",
      sourceDate: "2026-02-31",
      lastVerification: "2026-04-31",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          promiseId: "real-test-impossible-date",
          field: "sourceDate",
          reason: "invalid-date",
        }),
        expect.objectContaining({
          promiseId: "real-test-impossible-date",
          field: "lastVerification",
          reason: "invalid-date",
        }),
      ]),
    );
  });

  it("rejects non-http source URLs with a stable reason code", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-invalid-url",
      sourceLink: "ftp://www.comune.lamezia-terme.cz.it/documento.pdf",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        promiseId: "real-test-invalid-url",
        field: "sourceLink",
        reason: "invalid-url",
      }),
    ]);
  });

  it("rejects empty mandatory text fields with a stable reason code", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-empty-required-text",
      sourceLabel: "   ",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        promiseId: "real-test-empty-required-text",
        field: "sourceLabel",
        reason: "missing-required-text",
      }),
    ]);
  });

  it("rejects residual model copy in mandatory real-record fields", () => {
    const invalidPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-template-copy",
      sourcePromiseSummary:
        "Questo record è un modello redazionale, non una promessa reale: va sostituito con un estratto da programma elettorale.",
      sourceLabel: "Fonte programmatica da indicare prima della pubblicazione",
      mandateReference: "Mandato/amministrazione da indicare nella scheda reale",
      cautionNote: "Record dimostrativo escluso dai conteggi documentali.",
      missingForObservableImplementation:
        "Testo redazionale già completo senza residui modello.",
    };

    const result = validatePromessometroRealRecords([invalidPromise]);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "sourcePromiseSummary",
          reason: "model-record-residue",
        }),
        expect.objectContaining({
          field: "sourceLabel",
          reason: "model-record-residue",
        }),
        expect.objectContaining({
          field: "mandateReference",
          reason: "model-record-residue",
        }),
        expect.objectContaining({
          field: "cautionNote",
          reason: "model-record-residue",
        }),
      ]),
    );
    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "missingForObservableImplementation" }),
      ]),
    );
  });

  it("allows legitimate real-record text containing generic words such as modello and esempio", () => {
    const validPromise: ProgrammePromise = {
      ...VALID_REAL_PROMISE,
      id: "real-test-generic-words",
      sourcePromiseSummary:
        "La fonte cita un modello organizzativo e un esempio di intervento amministrativo verificabile.",
      sourceLabel: "Documento con esempio applicativo allegato alla fonte",
      mandateReference: "Mandato che descrive il modello operativo dell'intervento",
      cautionNote:
        "La presenza delle parole modello ed esempio non indica automaticamente testo placeholder.",
      missingForObservableImplementation:
        "Serve una verifica documentale successiva sul modello operativo citato dalla fonte.",
    };

    const result = validatePromessometroRealRecords([validPromise]);

    expect(result.issues).toEqual([]);
  });
});
