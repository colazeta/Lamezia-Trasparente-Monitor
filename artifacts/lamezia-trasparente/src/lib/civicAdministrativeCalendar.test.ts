import { describe, expect, it } from "vitest";

import {
  assertValidCivicCalendarBundle,
  getEventDateStatus,
  recurrenceCategories,
  recurrenceVerificationStatuses,
  toCivicCalendarJson,
  toCivicCalendarTableRows,
  validateCivicCalendarBundle,
  type CivicCalendarBundle,
  type CivicRecurrence,
  type RecurrenceCategory,
  type RecurrenceVerificationStatus,
} from "./civicAdministrativeCalendar";

function windowFor(id: string, month: string) {
  return {
    id: `window-${id}`,
    label: `Finestra sintetica ${month}`,
    startDate: `2026-${month}-01` as const,
    endDate: `2026-${month}-28` as const,
    note: "Finestra di pianificazione documentaria sintetica per test.",
  };
}

function recurrence(
  id: string,
  category: RecurrenceCategory,
  status: RecurrenceVerificationStatus = "verified",
): CivicRecurrence {
  return {
    id,
    title: `Ricorrenza sintetica ${id}`,
    category,
    expectedFrequency: "annual",
    planningWindow: windowFor(id, "03"),
    verificationStatus: status,
    sources: [
      {
        id: `source-${id}`,
        title: `Fonte sintetica ${id}`,
        sourceType: "sito",
        url: `https://example.test/${id}`,
        publicationDate: "2026-02-15",
        limitations: "Dato sintetico usato solo per verificare il modello.",
      },
    ],
    methodologicalNote:
      "La ricorrenza è un segnale di calendario documentario, non una valutazione di performance amministrativa.",
  };
}

const syntheticRecurrences: CivicRecurrence[] = [
  recurrence("bilancio-previsione", "finanza_bilancio", "verified"),
  recurrence("rendiconto", "finanza_bilancio", "partial"),
  recurrence("dup", "programmazione_amministrativa", "estimated_from_history"),
  recurrence("piano-performance", "programmazione_amministrativa"),
  recurrence("iscrizioni-mensa", "scuola_servizi_educativi"),
  recurrence("sostegno-sociale", "sociale_welfare"),
  recurrence("protezione-civile", "ambiente_protezione_civile"),
  recurrence("estate-cultura", "cultura_turismo_sport"),
  recurrence("convocazioni-consiglio", "consiglio_partecipazione"),
  recurrence("tributi-locali", "tributi_servizi_cittadino"),
  recurrence("manutenzioni-strade", "lavori_pubblici_manutenzioni"),
  recurrence(
    "ricognizione-fonti",
    "programmazione_amministrativa",
    "needs_review",
  ),
];

const bundle: CivicCalendarBundle = {
  recurrences: syntheticRecurrences,
  preparatoryActs: [
    {
      id: "atto-delibera-bilancio",
      recurrenceId: "bilancio-previsione",
      title: "Delibera sintetica collegata alla finestra di bilancio",
      sourceType: "delibera",
      evidenceId: "source-bilancio-previsione",
    },
    {
      id: "atto-avviso-mensa",
      recurrenceId: "iscrizioni-mensa",
      title: "Avviso sintetico per iscrizioni mensa",
      sourceType: "avviso",
      url: "https://example.test/avviso-mensa",
    },
  ],
  events: [
    {
      id: "evento-bilancio-certo",
      recurrenceId: "bilancio-previsione",
      title: "Evento sintetico con data certa",
      category: "finanza_bilancio",
      date: {
        kind: "certain",
        date: "2026-03-12",
        evidenceId: "source-bilancio-previsione",
      },
      preparatoryActIds: ["atto-delibera-bilancio"],
    },
    {
      id: "evento-dup-stimato",
      recurrenceId: "dup",
      title: "Evento sintetico con data stimata",
      category: "programmazione_amministrativa",
      date: {
        kind: "estimated",
        date: "2026-03-20",
        basisEvidenceIds: ["source-dup"],
        estimationNote:
          "Stima sintetica basata su ricorrenza storica, da verificare su fonte documentaria.",
      },
    },
    {
      id: "evento-fonti-non-rilevato",
      recurrenceId: "ricognizione-fonti",
      title: "Evento sintetico non rilevato",
      category: "programmazione_amministrativa",
      date: {
        kind: "not_detected",
        monitoredWindow: windowFor("fonti", "04"),
        monitoringNote:
          "Nessuna data rilevata nelle fonti monitorate durante la finestra sintetica.",
      },
    },
  ],
};

describe("civic administrative calendar helpers", () => {
  it("validates at least 12 synthetic recurrences with required source metadata", () => {
    expect(syntheticRecurrences).toHaveLength(12);
    expect(validateCivicCalendarBundle(bundle)).toEqual([]);
    expect(assertValidCivicCalendarBundle(bundle)).toBe(bundle);
  });

  it("exposes the required initial categories and verification statuses", () => {
    expect(recurrenceCategories).toEqual([
      "finanza_bilancio",
      "programmazione_amministrativa",
      "scuola_servizi_educativi",
      "sociale_welfare",
      "ambiente_protezione_civile",
      "cultura_turismo_sport",
      "consiglio_partecipazione",
      "tributi_servizi_cittadino",
      "lavori_pubblici_manutenzioni",
    ]);
    expect(recurrenceVerificationStatuses).toEqual([
      "verified",
      "partial",
      "estimated_from_history",
      "not_found_in_monitored_sources",
      "needs_review",
    ]);
  });

  it("represents certain, estimated and not detected event dates", () => {
    expect(getEventDateStatus(bundle.events![0])).toContain("data certa");
    expect(getEventDateStatus(bundle.events![1])).toContain("data stimata");
    expect(getEventDateStatus(bundle.events![2])).toContain(
      "data non rilevata",
    );
  });

  it("serializes to JSON and tabular rows without adding undocumented inferences", () => {
    const parsed = JSON.parse(
      toCivicCalendarJson(bundle),
    ) as CivicCalendarBundle;
    const rows = toCivicCalendarTableRows(bundle);

    expect(parsed.recurrences).toHaveLength(12);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toMatchObject({
      recurrenceId: "bilancio-previsione",
      eventDateStatus: "certain",
      eventDate: "2026-03-12",
      sourceCount: 1,
      preparatoryActCount: 1,
    });
    expect(
      rows.find((row) => row.recurrenceId === "ricognizione-fonti"),
    ).toMatchObject({ eventDateStatus: "not_detected", eventDate: "" });
  });

  it("reports traceability and mapping gaps instead of inferring missing documentation", () => {
    const issues = validateCivicCalendarBundle({
      recurrences: [
        {
          ...recurrence("senza-fonte", "sociale_welfare"),
          sources: [],
        },
      ],
      preparatoryActs: [
        {
          id: "atto-non-mappato",
          recurrenceId: "assente",
          title: "Atto sintetico non collegato",
          sourceType: "determina",
          evidenceId: "fonte-assente",
        },
      ],
      events: [
        {
          id: "evento-non-mappato",
          recurrenceId: "senza-fonte",
          title: "Evento sintetico con fonte mancante",
          category: "sociale_welfare",
          date: {
            kind: "estimated",
            date: "2026-05-10",
            basisEvidenceIds: [],
            estimationNote: "Stima non accettabile senza fonte di base.",
          },
          preparatoryActIds: ["atto-assente"],
        },
      ],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        "recurrences.senza-fonte: at least one source evidence item is required",
        "preparatoryActs.atto-non-mappato: recurrenceId is not mapped",
        "preparatoryActs.atto-non-mappato: evidenceId is not mapped",
        "events.evento-non-mappato: estimated dates require basisEvidenceIds",
        "events.evento-non-mappato: preparatoryActId atto-assente is not mapped",
      ]),
    );
  });
});
