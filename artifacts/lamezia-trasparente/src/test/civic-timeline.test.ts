import { describe, expect, it } from "vitest";

import {
  civicTimelineCategories,
  filterCivicTimelineEventsByCategory,
  getCivicTimelineCategoryLabel,
  getCivicTimelineValidationIssues,
  getTimelineVerificationStatusLabel,
  hasCompleteCivicTimelineMinimumFields,
  isValidCivicTimelineDate,
  isValidTimelineSourceEvidenceUrl,
  normalizeTimelineSourceEvidenceUrl,
  sortCivicTimelineEventsByDate,
  type CivicTimelineEvent,
} from "@/lib/civicTimeline";

const syntheticEvents: CivicTimelineEvent[] = [
  {
    id: "evt-partecipazione-001",
    title: "Incontro civico informativo su strumenti di partecipazione",
    date: "2025-04-18",
    category: "partecipazione",
    verificationStatus: "documentato",
    sourceEvidence: {
      title: "Avviso dimostrativo incontro civico",
      type: "dataset_dimostrativo",
      url: "demo://civic-timeline/partecipazione-001",
      limitationNote: "Record sintetico usato solo per testare lo schema.",
    },
    documentedFact:
      "La scheda sintetica descrive un incontro informativo su strumenti di partecipazione civica.",
    contextNotes: [
      {
        kind: "contesto",
        text: "Il record non contiene valutazioni su persone, enti o responsabilità.",
      },
      {
        kind: "nota_editoriale",
        text: "Usare la voce solo come esempio per future fonti documentali verificabili.",
      },
    ],
    futureLinks: {
      proposalIds: ["proposta-demo-partecipazione"],
    },
  },
  {
    id: "evt-istituzionale-001",
    title: "Seduta istituzionale dimostrativa su trasparenza amministrativa",
    date: "2025-01-10",
    category: "istituzionale",
    verificationStatus: "verifica_parziale",
    sourceEvidence: {
      title: "Verbale sintetico dimostrativo",
      type: "atto_amministrativo",
      url: "demo://civic-timeline/istituzionale-001",
    },
    documentedFact:
      "La scheda registra una seduta dimostrativa con riferimento a materiali documentali da collegare.",
    contextNotes: [
      {
        kind: "fatto_documentato",
        text: "La data e la categoria sono presenti nel record sintetico.",
      },
    ],
    futureLinks: {
      deliberationIds: ["delibera-demo-001"],
    },
  },
  {
    id: "evt-prevenzione-001",
    title: "Nota metodologica dimostrativa su prevenzione amministrativa",
    date: "2025-03-05",
    category: "prevenzione",
    verificationStatus: "documentato",
    sourceEvidence: {
      title: "Nota demo prevenzione",
      type: "nota_metodologica",
      url: "demo://civic-timeline/prevenzione-001",
    },
    documentedFact:
      "Il record collega una nota metodologica sintetica a un tema di prevenzione amministrativa.",
    contextNotes: [
      {
        kind: "contesto",
        text: "La prevenzione è trattata come ambito informativo, non come indicazione di illeciti.",
      },
    ],
  },
  {
    id: "evt-trasparenza-001",
    title: "Aggiornamento dimostrativo su accessibilità delle fonti",
    date: "2025-06-12",
    category: "trasparenza",
    verificationStatus: "da_verificare",
    sourceEvidence: {
      title: "Scheda demo fonti trasparenza",
      type: "pagina_istituzionale",
      url: "https://example.test/trasparenza/demo",
      limitationNote:
        "URL non consultato dai test; usato solo per validare il formato.",
    },
    documentedFact:
      "La scheda indica un aggiornamento documentale sintetico relativo alla consultabilità delle fonti.",
    contextNotes: [
      {
        kind: "nota_editoriale",
        text: "La verifica resta richiesta prima di qualunque uso pubblico del contenuto.",
      },
    ],
    futureLinks: {
      monthlyReportIds: ["report-demo-2025-06"],
    },
  },
  {
    id: "evt-regolamenti-001",
    title: "Scheda dimostrativa su regolamento comunale",
    date: "2025-02-20",
    category: "regolamenti",
    verificationStatus: "fonte_da_collegare",
    sourceEvidence: {
      title: "Indice demo regolamenti",
      type: "registro_pubblico",
      url: "demo://civic-timeline/regolamenti-001",
    },
    documentedFact:
      "Il record segnala la necessità di collegare il testo regolamentare prima della pubblicazione.",
    contextNotes: [
      {
        kind: "contesto",
        text: "La voce evidenzia una esigenza di tracciabilità documentale.",
      },
    ],
  },
  {
    id: "evt-progetti-civici-001",
    title: "Progetto civico dimostrativo per lettura documentale",
    date: "2025-05-02",
    category: "progetti_civici",
    verificationStatus: "documentato",
    sourceEvidence: {
      title: "Scheda demo progetto civico",
      type: "dataset_dimostrativo",
      url: "demo://civic-timeline/progetti-civici-001",
    },
    documentedFact:
      "La scheda sintetica descrive un progetto civico finalizzato a migliorare la comprensione dei documenti.",
    contextNotes: [
      {
        kind: "contesto",
        text: "Il contenuto è dimostrativo e non sostituisce fonti istituzionali.",
      },
    ],
  },
];

describe("civicTimeline", () => {
  it("exports the minimum civic timeline taxonomy from issue 344", () => {
    expect(civicTimelineCategories).toEqual([
      "istituzionale",
      "amministrativo",
      "prevenzione",
      "partecipazione",
      "trasparenza",
      "regolamenti",
      "progetti_civici",
      "aggiornamenti_documentali",
    ]);
  });

  it("keeps at least six synthetic events with category, source evidence and verification status", () => {
    expect(syntheticEvents).toHaveLength(6);
    expect(new Set(syntheticEvents.map((event) => event.category)).size).toBe(
      6,
    );

    for (const event of syntheticEvents) {
      expect(event.sourceEvidence.title).not.toBe("");
      expect(event.sourceEvidence.url).not.toBe("");
      expect(event.verificationStatus).not.toBe("");
      expect(hasCompleteCivicTimelineMinimumFields(event)).toBe(true);
    }
  });

  it("sorts events by date and id without mutating the input", () => {
    const originalOrder = syntheticEvents.map((event) => event.id);

    const sorted = sortCivicTimelineEventsByDate(syntheticEvents);

    expect(sorted.map((event) => event.id)).toEqual([
      "evt-istituzionale-001",
      "evt-regolamenti-001",
      "evt-prevenzione-001",
      "evt-partecipazione-001",
      "evt-progetti-civici-001",
      "evt-trasparenza-001",
    ]);
    expect(syntheticEvents.map((event) => event.id)).toEqual(originalOrder);
    expect(sortCivicTimelineEventsByDate(syntheticEvents, "desc")[0].id).toBe(
      "evt-trasparenza-001",
    );
  });

  it("filters events by one or more civic categories", () => {
    const filtered = filterCivicTimelineEventsByCategory(syntheticEvents, [
      "prevenzione",
      "trasparenza",
    ]);

    expect(filtered.map((event) => event.id)).toEqual([
      "evt-prevenzione-001",
      "evt-trasparenza-001",
    ]);
    expect(filterCivicTimelineEventsByCategory(syntheticEvents, [])).toEqual(
      [],
    );
  });

  it("keeps documented facts, context and editorial notes separated", () => {
    const participationEvent = syntheticEvents[0];

    expect(participationEvent.documentedFact).toContain("scheda sintetica");
    expect(participationEvent.contextNotes.map((note) => note.kind)).toEqual([
      "contesto",
      "nota_editoriale",
    ]);
    expect(participationEvent.futureLinks?.proposalIds).toEqual([
      "proposta-demo-partecipazione",
    ]);
  });

  it("validates dates and source evidence URLs without fetching live data", () => {
    expect(isValidCivicTimelineDate("2024-02-29")).toBe(true);
    expect(isValidCivicTimelineDate("2025-02-29")).toBe(false);
    expect(normalizeTimelineSourceEvidenceUrl(" HTTPS://Example.test/a ")).toBe(
      "https://example.test/a",
    );
    expect(isValidTimelineSourceEvidenceUrl("demo://timeline/local")).toBe(
      true,
    );
    expect(isValidTimelineSourceEvidenceUrl("javascript:alert(1)")).toBe(false);
  });

  it("returns neutral validation issues for incomplete events", () => {
    const incompleteEvent: CivicTimelineEvent = {
      ...syntheticEvents[0],
      id: " ",
      title: " ",
      date: "2025-02-30",
      sourceEvidence: {
        ...syntheticEvents[0].sourceEvidence,
        title: " ",
        url: "file:///private/source.pdf",
      },
      documentedFact: " ",
      contextNotes: [],
    };

    expect(getCivicTimelineValidationIssues(incompleteEvent)).toEqual([
      "id_mancante",
      "titolo_mancante",
      "data_non_valida",
      "fonte_mancante",
      "url_fonte_non_ammesso",
      "fatto_documentato_mancante",
      "contesto_mancante",
    ]);
  });

  it("uses cautious labels without accusatory wording", () => {
    const labelText = [
      getCivicTimelineCategoryLabel("prevenzione"),
      getTimelineVerificationStatusLabel("da_verificare"),
      getTimelineVerificationStatusLabel("fonte_da_collegare"),
    ].join(" ");

    expect(labelText).toContain("Prevenzione");
    expect(labelText).toContain("Verifica richiesta");
    expect(labelText.toLowerCase()).not.toMatch(
      /corruzione|illecito|colpevole|responsabilit|mafia|infiltrazione/,
    );
  });
});
