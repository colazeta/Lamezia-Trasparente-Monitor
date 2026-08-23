import {
  identifyInstitutionalSessionCandidate,
  type InstitutionalSessionCandidate,
  type InstitutionalSessionCandidateInput,
} from "../../../../scripts/institutional-session-candidates";

import type {
  CouncilSessionV0,
  CouncilSessionV0ContextResearch,
  CouncilSessionV0Provenance,
} from "@/data/councilSessionV0";

const OFFICIAL_ALBO_URL = "https://albo.tinnvision.cloud/?ente=00301390795";
const COMMISSION_NOTICE_URL =
  "https://albo.tinnvision.cloud/allegati/2026_2648_2_P?ente=00301390795";
const COMMISSION_ARCHIVED_DOCUMENT_URL =
  "/data/public/albo/documents/2026/842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304.pdf";
const SOURCE_REVIEWED_AT = "2026-08-22T12:10:49Z";
const CONTEXT_RESEARCHED_AT = "2026-08-22T15:42:23Z";

const councilContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: CONTEXT_RESEARCHED_AT,
  searchNote:
    "Due resoconti giornalistici del 13 agosto sono compatibili con l'avviso, ma l'assenza dell'allegato ufficiale impedisce di stabilire che descrivano la stessa seduta.",
  articles: [
    {
      title:
        "Consiglio comunale prima di Ferragosto con soliti stilemi politici e qualche fuoriprogramma estivo",
      url: "https://www.lameziainforma.it/istituzione/2026/08/13/consiglio-comunale-prima-di-ferragosto-con-soliti-stilemi-politici-e-qualche-fuoriprogramma-estivo/68880/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "possible_same_session",
      relevanceNote:
        "Data di pubblicazione, organo e temi trattati sono compatibili con l'avviso Albo 2026/2673; manca l'allegato ufficiale per stabilire il collegamento in modo definitivo.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
    {
      title: "Question time politico evaso in consiglio comunale",
      url: "https://www.lameziainforma.it/politica/2026/08/13/question-time-politico-evaso-in-consiglio-comunale/68885/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-13",
      relationship: "possible_same_session",
      relevanceNote:
        "Il resoconto descrive question time e debiti fuori bilancio nella stessa giornata; è un indizio contestuale, non una fonte ufficiale della convocazione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

const commissionContextResearch: CouncilSessionV0ContextResearch = {
  status: "reviewed_matches",
  checkedAt: CONTEXT_RESEARCHED_AT,
  searchNote:
    "La ricerca per organo, date e temi non ha restituito articoli che nominino con sufficiente precisione le sedute della II Commissione del 10 o 11 agosto; i collegamenti riportati riguardano soltanto i temi in agenda.",
  articles: [
    {
      title:
        "Approvato in giunta l'assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026",
      url: "https://www.lameziainforma.it/istituzione/2026/08/06/approvato-in-giunta-lassestamento-generale-di-bilancio-e-salvaguardia-degli-equilibri-per-lesercizio-2026/68773/",
      publisher: "LameziaInforma",
      publishedAt: "2026-08-06",
      relationship: "agenda_item",
      relevanceNote:
        "Approfondisce la proposta di assestamento approvata dalla Giunta il 6 agosto, poi indicata nel primo punto della convocazione; non documenta le riunioni della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
    {
      title:
        "LAMEZIA | Bilancio, la maggioranza si sfalda in Giunta: tre assessori assenti. Muraca: «È sfiducia al sindaco»",
      url: "https://lanovitaonline.it/lamezia-bilancio-la-maggioranza-si-sfalda-in-giunta-tre-assessori-assenti-muraca-e-sfiducia-al-sindaco/",
      publisher: "La Novità Online",
      publishedAt: "2026-08-08",
      relationship: "agenda_item",
      relevanceNote:
        "Riporta una posizione politica sulla deliberazione di Giunta relativa all'assestamento; riguarda il tema in agenda e non verifica attività o esiti della Commissione.",
      reviewedAt: CONTEXT_RESEARCHED_AT,
    },
  ],
  media: [],
};

function requireCandidate(
  input: InstitutionalSessionCandidateInput,
): InstitutionalSessionCandidate {
  const candidate = identifyInstitutionalSessionCandidate(input);
  if (!candidate) {
    throw new Error(`Invalid institutional session source record: ${input.id}`);
  }
  return candidate;
}

const commissionCandidate = requireCandidate({
  id: "albo-2026-2648",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2648",
  publication_start: "2026-08-07",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONI COMMISSIONI CONSILIARI",
  subject:
    "Convocazione 2° Commissione Consiliare Permanente. Calendario lavori.",
  document_url: COMMISSION_NOTICE_URL,
  content_hash:
    "f4301f15e2bfd99aecb79f25ceb4d1346a486ff1fe20e748f9bac89a818eee09",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const councilCandidate = requireCandidate({
  id: "albo-2026-2673",
  source: "Albo Pretorio Comune di Lamezia Terme",
  source_url: OFFICIAL_ALBO_URL,
  retrieved_at: "2026-08-11T07:32:34.743Z",
  publication_number: "2026/2673",
  publication_start: "2026-08-10",
  publication_end: "2026-08-14",
  act_type: "CONVOCAZIONE CONSIGLIO COMUNALE",
  subject: "Avviso seduta di Consiglio Comunale.",
  document_url: null,
  content_hash:
    "31789ffe968c4991b8b066817d50b757920a36b0bc6f83bff5628f9012a4d108",
  verification_status: "official_source_acquired",
  privacy_risk: "low",
  public_visibility: "publishable",
});

const commissionProvenance: CouncilSessionV0Provenance = {
  noticeId: commissionCandidate.id,
  publicationNumber: commissionCandidate.publicationNumber,
  sourceLabel: commissionCandidate.source.label,
  sourceUrl: commissionCandidate.source.url,
  documentUrl: commissionCandidate.source.documentUrl,
  archivedDocumentUrl: COMMISSION_ARCHIVED_DOCUMENT_URL,
  sourceContentHash: commissionCandidate.source.contentHash,
  documentSha256:
    "842702b2044b4b6f9a7b21a65eac2ab59866ee3f321872e6b28fd481598be304",
  embeddedDocumentSha256:
    "3069388db15c43fdbf3cc980195f9c88ded602a6e9f8f89f358a006ce789096c",
  retrievedAt: commissionCandidate.source.retrievedAt,
  reviewedAt: SOURCE_REVIEWED_AT,
  sourceReviewStatus: "reviewed_against_official_attachment",
};

const councilProvenance: CouncilSessionV0Provenance = {
  noticeId: councilCandidate.id,
  publicationNumber: councilCandidate.publicationNumber,
  sourceLabel: councilCandidate.source.label,
  sourceUrl: councilCandidate.source.url,
  documentUrl: null,
  archivedDocumentUrl: null,
  sourceContentHash: councilCandidate.source.contentHash,
  documentSha256: null,
  embeddedDocumentSha256: null,
  retrievedAt: councilCandidate.source.retrievedAt,
  reviewedAt: SOURCE_REVIEWED_AT,
  sourceReviewStatus: "official_metadata_only",
};

const commissionAgenda = [
  "Esame della proposta di deliberazione del Consiglio comunale n. 2259 del 6 agosto 2026: assestamento generale di bilancio e salvaguardia degli equilibri per l'esercizio 2026.",
  "Esame delle proposte di deliberazione del Consiglio comunale relative a debiti fuori bilancio derivanti da sentenze esecutive.",
] as const;

function commissionSession(
  date: "2026-08-10" | "2026-08-11",
): CouncilSessionV0 {
  const italianDate =
    date === "2026-08-10" ? "10 agosto 2026" : "11 agosto 2026";
  const documentUrl = commissionCandidate.source.documentUrl ?? undefined;

  return {
    id: `albo-2026-2648-commissione-ii-${date}`,
    kind: "commission",
    isDemoFixture: false,
    provenance: commissionProvenance,
    contextResearch: commissionContextResearch,
    title: {
      key: "title",
      label: "Titolo",
      value: `II Commissione consiliare permanente — seduta del ${italianDate}`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Titolo normalizzato dalla convocazione ufficiale; la fonte identifica la II Commissione come Servizi economici e finanziari.",
    },
    scheduledAt: {
      key: "scheduledAt",
      label: "Data e ora",
      value: `${date}T09:30:00+02:00`,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Data e ora trascritte dall'allegato ufficiale; indicano la programmazione, non provano lo svolgimento.",
    },
    sessionStatus: {
      key: "sessionStatus",
      label: "Stato seduta",
      value: "non_verificata",
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "La convocazione documenta la seduta programmata; non è stata collegata una fonte che ne confermi lo svolgimento o l'eventuale rinvio.",
    },
    agenda: {
      key: "agenda",
      label: "Ordine del giorno",
      value: commissionAgenda,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Sintesi fedele dei due punti riportati nell'allegato; per formulazione completa e riferimenti normativi consultare il documento originale.",
    },
    sourceLink: {
      key: "sourceLink",
      label: "Fonte",
      value: "Apri la convocazione nell'Albo ufficiale",
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit: `Pubblicazione ${commissionCandidate.publicationNumber}; copia acquisita e verificata tramite hash nel repository.`,
    },
    liveStreaming: {
      key: "liveStreaming",
      label: "Streaming live",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione consultata; ciò non esclude che possa essere stato comunicato su un altro canale.",
    },
    recording: {
      key: "recording",
      label: "Registrazione",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevata nella fonte monitorata; nessuna conclusione viene tratta sulla disponibilità complessiva di registrazioni.",
    },
    minutesOrReport: {
      key: "minutesOrReport",
      label: "Verbale o resoconto",
      value: null,
      sourceStatus: "assente",
      sourceUrl: documentUrl,
      limit:
        "Non rilevato nella convocazione; verbali o resoconti successivi richiedono una ricerca separata nelle fonti istituzionali.",
    },
    lastCheckedAt: {
      key: "lastCheckedAt",
      label: "Ultimo controllo",
      value: SOURCE_REVIEWED_AT,
      sourceStatus: "verificato",
      sourceUrl: documentUrl,
      limit:
        "Controllo della copia ufficiale archiviata; future modifiche o nuove pubblicazioni non sono incluse automaticamente in questa scheda revisionata.",
    },
    dataLimits: {
      key: "dataLimits",
      label: "Limiti del dato",
      value: [
        "La stessa convocazione programma due sedute, il 10 e l'11 agosto 2026 alle 09:30.",
        "La scheda non certifica svolgimento, presenze, esiti o completezza storica.",
        "Streaming, registrazione e verbale sono indicati come non rilevati nella fonte consultata, non come inesistenti.",
      ],
      sourceStatus: "parziale",
      sourceUrl: documentUrl,
      limit:
        "Prima tranche editoriale basata su un solo avviso ufficiale; la copertura delle Commissioni non è completa.",
    },
  };
}

const councilMetadataOnlySession: CouncilSessionV0 = {
  id: "albo-2026-2673-consiglio-comunale",
  kind: "council",
  isDemoFixture: false,
  provenance: councilProvenance,
  contextResearch: councilContextResearch,
  title: {
    key: "title",
    label: "Titolo",
    value: "Consiglio comunale — avviso di seduta",
    sourceStatus: "verificato",
    sourceUrl: councilCandidate.source.url,
    limit: `Titolo normalizzato dall'oggetto della pubblicazione ${councilCandidate.publicationNumber}.`,
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: null,
    sourceStatus: "da_verificare",
    sourceUrl: councilCandidate.source.url,
    limit:
      "L'export ufficiale monitorato non espone l'allegato: le date di inizio e fine pubblicazione non vengono usate come data della seduta.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "non_verificata",
    sourceStatus: "da_verificare",
    sourceUrl: councilCandidate.source.url,
    limit:
      "È verificata la presenza dell'avviso nell'Albo, non la programmazione puntuale né lo svolgimento della seduta.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati ufficiali acquisiti; serve l'allegato o un'altra fonte istituzionale per pubblicarlo.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: "Apri l'Albo Pretorio ufficiale",
    sourceStatus: "verificato",
    sourceUrl: councilCandidate.source.url,
    limit: `Pubblicazione ${councilCandidate.publicationNumber}; l'export non ha restituito un URL diretto al documento.`,
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati dell'avviso; il controllo dei canali video istituzionali resta separato.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevata nei metadati dell'avviso; non equivale a dichiararne l'inesistenza.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "assente",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Non rilevato nei metadati acquisiti; una pubblicazione successiva richiede un controllo dedicato.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: SOURCE_REVIEWED_AT,
    sourceStatus: "verificato",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Controllo del record ufficiale acquisito; la scheda conserva solo i metadati effettivamente disponibili.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Scheda metadata-only: data, ora e ordine del giorno restano da verificare.",
      "La finestra di pubblicazione Albo dal 10 al 14 agosto 2026 non è la data della seduta.",
      "Il rilevamento dell'avviso non prova che la seduta si sia svolta.",
    ],
    sourceStatus: "parziale",
    sourceUrl: councilCandidate.source.url,
    limit:
      "Prima identificazione fonte-centrica del tipo atto Consiglio; nessuna copertura storica completa è dichiarata.",
  },
};

export const councilSessionV0ReviewedRecords: readonly CouncilSessionV0[] = [
  commissionSession("2026-08-11"),
  commissionSession("2026-08-10"),
  councilMetadataOnlySession,
];

const reviewedRecordsById = new Map(
  councilSessionV0ReviewedRecords.map((session) => [session.id, session]),
);

export function findCouncilSessionV0ReviewedRecord(
  id: string,
): CouncilSessionV0 | undefined {
  return reviewedRecordsById.get(id);
}
