export const COUNCIL_SESSION_V0_STATUSES = [
  "programmata",
  "svolta",
  "rinviata",
  "non_verificata",
] as const;

export type CouncilSessionV0Status = (typeof COUNCIL_SESSION_V0_STATUSES)[number];

export type CouncilSessionV0Kind = "council" | "commission";

export const councilSessionV0KindLabels: Record<CouncilSessionV0Kind, string> = {
  council: "Consiglio comunale",
  commission: "Commissione consiliare",
};

export const COUNCIL_SESSION_V0_CONTEXT_RELATIONSHIPS = [
  "same_session",
  "possible_same_session",
  "agenda_item",
] as const;

export type CouncilSessionV0ContextRelationship =
  (typeof COUNCIL_SESSION_V0_CONTEXT_RELATIONSHIPS)[number];

export const councilSessionV0ContextRelationshipLabels: Record<
  CouncilSessionV0ContextRelationship,
  string
> = {
  same_session: "Stessa seduta",
  possible_same_session: "Possibile corrispondenza",
  agenda_item: "Tema all'ordine del giorno",
};

export const COUNCIL_SESSION_V0_CONTEXT_RESEARCH_STATUSES = [
  "not_run",
  "checked_no_match",
  "reviewed_matches",
] as const;

export type CouncilSessionV0ContextResearchStatus =
  (typeof COUNCIL_SESSION_V0_CONTEXT_RESEARCH_STATUSES)[number];

export const COUNCIL_SESSION_V0_FIELD_STATUSES = [
  "verificato",
  "parziale",
  "assente",
  "da_verificare",
  "fixture_dimostrativa",
] as const;

export type CouncilSessionV0FieldStatus =
  (typeof COUNCIL_SESSION_V0_FIELD_STATUSES)[number];

export const councilSessionV0StatusLabels: Record<CouncilSessionV0Status, string> = {
  programmata: "Seduta programmata",
  svolta: "Seduta svolta",
  rinviata: "Seduta rinviata",
  non_verificata: "Stato della seduta non verificato",
};

export const councilSessionV0FieldStatusLabels: Record<CouncilSessionV0FieldStatus, string> = {
  verificato: "Dato verificato dalla fonte indicata",
  parziale: "Dato parziale o incompleto",
  assente: "Dato non rilevato nella fonte consultata",
  da_verificare: "Dato da verificare prima dell'uso pubblico",
  fixture_dimostrativa: "Dato dimostrativo, non fonte reale",
};

export type CouncilSessionV0PublicFieldKey =
  | "title"
  | "scheduledAt"
  | "sessionStatus"
  | "agenda"
  | "sourceLink"
  | "liveStreaming"
  | "recording"
  | "minutesOrReport"
  | "lastCheckedAt"
  | "dataLimits";

export interface CouncilSessionV0Field<T> {
  key: CouncilSessionV0PublicFieldKey;
  label: string;
  value: T | null;
  sourceStatus: CouncilSessionV0FieldStatus;
  sourceUrl?: string;
  limit: string;
}

export type CouncilSessionV0SourceReviewStatus =
  | "official_metadata_only"
  | "reviewed_against_official_attachment";

export interface CouncilSessionV0Provenance {
  noticeId: string;
  publicationNumber: string;
  sourceLabel: string;
  sourceUrl: string;
  documentUrl: string | null;
  archivedDocumentUrl: string | null;
  sourceContentHash: string;
  documentSha256: string | null;
  embeddedDocumentSha256: string | null;
  retrievedAt: string;
  reviewedAt: string;
  sourceReviewStatus: CouncilSessionV0SourceReviewStatus;
}

export interface CouncilSessionV0ContextArticle {
  title: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  relationship: CouncilSessionV0ContextRelationship;
  relevanceNote: string;
  reviewedAt: string;
}

export interface CouncilSessionV0ContextResearch {
  status: CouncilSessionV0ContextResearchStatus;
  checkedAt: string | null;
  searchNote: string;
  articles: readonly CouncilSessionV0ContextArticle[];
}

export interface CouncilSessionV0 {
  id: string;
  kind: CouncilSessionV0Kind;
  isDemoFixture: boolean;
  provenance?: CouncilSessionV0Provenance;
  contextResearch: CouncilSessionV0ContextResearch;
  title: CouncilSessionV0Field<string>;
  scheduledAt: CouncilSessionV0Field<string>;
  sessionStatus: CouncilSessionV0Field<CouncilSessionV0Status>;
  agenda: CouncilSessionV0Field<readonly string[]>;
  sourceLink: CouncilSessionV0Field<string>;
  liveStreaming: CouncilSessionV0Field<string>;
  recording: CouncilSessionV0Field<string>;
  minutesOrReport: CouncilSessionV0Field<string>;
  lastCheckedAt: CouncilSessionV0Field<string>;
  dataLimits: CouncilSessionV0Field<readonly string[]>;
}

const missingFieldNotes: Record<CouncilSessionV0FieldStatus, string> = {
  verificato: "Informazione verificata rispetto alla fonte indicata.",
  parziale: "Informazione disponibile solo in parte: leggere i limiti del dato prima di usarla.",
  assente: "Informazione non presente nella fonte consultata o non ancora disponibile.",
  da_verificare: "Informazione in attesa di verifica: non usarla come dato confermato.",
  fixture_dimostrativa: "Informazione dimostrativa: serve solo a mostrare il formato della scheda.",
};

export function getCouncilSessionV0PublicFieldNote(
  field: Pick<CouncilSessionV0Field<unknown>, "sourceStatus" | "limit">,
): string {
  return `${missingFieldNotes[field.sourceStatus]} ${field.limit}`;
}

export const councilSessionV0PublicFields: readonly CouncilSessionV0PublicFieldKey[] = [
  "title",
  "scheduledAt",
  "sessionStatus",
  "agenda",
  "sourceLink",
  "liveStreaming",
  "recording",
  "minutesOrReport",
  "lastCheckedAt",
  "dataLimits",
] as const;

export const councilSessionV0DemoFixture: CouncilSessionV0 = {
  id: "demo-consiglio-comunale-v0",
  kind: "council",
  isDemoFixture: true,
  contextResearch: {
    status: "not_run",
    checkedAt: null,
    searchNote:
      "Ricerca di contesto non eseguita: la scheda è una fixture dimostrativa e non descrive una seduta reale.",
    articles: [],
  },
  title: {
    key: "title",
    label: "Titolo",
    value: "Convocazione del Consiglio comunale — esempio dimostrativo",
    sourceStatus: "fixture_dimostrativa",
    limit: "Titolo costruito per testare la scheda; non rappresenta una convocazione reale.",
  },
  scheduledAt: {
    key: "scheduledAt",
    label: "Data e ora",
    value: "2026-06-30T18:00:00+02:00",
    sourceStatus: "fixture_dimostrativa",
    limit: "Data fittizia usata per verificare il layout e gli stati del dato.",
  },
  sessionStatus: {
    key: "sessionStatus",
    label: "Stato seduta",
    value: "non_verificata",
    sourceStatus: "fixture_dimostrativa",
    limit: "Stato non collegato a una seduta reale.",
  },
  agenda: {
    key: "agenda",
    label: "Ordine del giorno",
    value: [
      "Punto dimostrativo per verificare la leggibilità dell'ordine del giorno.",
      "Secondo punto dimostrativo, privo di valore informativo reale.",
    ],
    sourceStatus: "fixture_dimostrativa",
    limit: "Lista dimostrativa senza valore di fonte ufficiale.",
  },
  sourceLink: {
    key: "sourceLink",
    label: "Fonte",
    value: null,
    sourceStatus: "fixture_dimostrativa",
    limit: "Nessun link fonte reale associato alla fixture.",
  },
  liveStreaming: {
    key: "liveStreaming",
    label: "Streaming live",
    value: null,
    sourceStatus: "fixture_dimostrativa",
    limit: "Streaming non verificato per questa scheda dimostrativa.",
  },
  recording: {
    key: "recording",
    label: "Registrazione",
    value: null,
    sourceStatus: "fixture_dimostrativa",
    limit: "Registrazione non verificata per questa scheda dimostrativa.",
  },
  minutesOrReport: {
    key: "minutesOrReport",
    label: "Verbale o resoconto",
    value: null,
    sourceStatus: "fixture_dimostrativa",
    limit: "Verbale o resoconto non verificato per questa scheda dimostrativa.",
  },
  lastCheckedAt: {
    key: "lastCheckedAt",
    label: "Ultimo controllo",
    value: null,
    sourceStatus: "fixture_dimostrativa",
    limit: "Nessun controllo reale è stato eseguito per questa fixture.",
  },
  dataLimits: {
    key: "dataLimits",
    label: "Limiti del dato",
    value: [
      "Scheda dimostrativa: non usare come informazione civica reale.",
      "Ogni campo deve esporre stato fonte, limite e data di verifica quando sarà collegato a fonti effettive.",
    ],
    sourceStatus: "fixture_dimostrativa",
    limit: "I limiti descrivono il comportamento atteso della versione pubblica, non la copertura effettiva del Comune.",
  },
};

export function isCouncilSessionV0DemoFixture(session: CouncilSessionV0): boolean {
  return session.isDemoFixture;
}
