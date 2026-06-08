export type TimelineEventType =
  | "operazione_giudiziaria"
  | "misura_cautelare"
  | "rinvio_a_giudizio"
  | "sentenza_primo_grado"
  | "sentenza_appello"
  | "sentenza_definitiva"
  | "assoluzione"
  | "archiviazione"
  | "scioglimento_commissariamento"
  | "interdittiva_antimafia"
  | "bene_confiscato_assegnato"
  | "atto_comunale_legalita"
  | "iniziativa_pubblica_antimafia"
  | "episodio_pubblico_documentato"
  | "relazione_istituzionale";

export type TimelineStatus =
  | "indagine"
  | "misura_cautelare"
  | "processo_in_corso"
  | "condanna_non_definitiva"
  | "condanna_definitiva"
  | "assoluzione"
  | "archiviazione"
  | "misura_amministrativa"
  | "fatto_storico_istituzionale"
  | "non_applicabile";

export type TimelineSource = {
  label: string;
  url: string;
  kind:
    | "sentenza"
    | "comunicato_istituzionale"
    | "ministero_interno"
    | "prefettura"
    | "dia"
    | "anbsc"
    | "comune"
    | "albo"
    | "altro";
};

export type TimelineInternalLink = {
  label: string;
  href: string;
  relation:
    | "bene_confiscato"
    | "delibera"
    | "albo"
    | "requisito_legalita"
    | "criticita_pubblica"
    | "atto_fondamentale"
    | "metodologia"
    | "fonti";
};

export type LegalityTimelineEvent = {
  id: string;
  title: string;
  slug: string;
  dateLabel: string;
  startDate: string;
  endDate?: string;
  eventType: TimelineEventType;
  shortDescription: string;
  status: TimelineStatus;
  primarySource: TimelineSource;
  secondarySources: TimelineSource[];
  organisations: string[];
  places: string[];
  civicEffect: string;
  internalLinks: TimelineInternalLink[];
  cautionNote: string;
  lastVerification: string;
  published: boolean;
};

export const TIMELINE_EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  operazione_giudiziaria: "Operazione giudiziaria",
  misura_cautelare: "Misura cautelare",
  rinvio_a_giudizio: "Rinvio a giudizio",
  sentenza_primo_grado: "Sentenza di primo grado",
  sentenza_appello: "Sentenza d'appello",
  sentenza_definitiva: "Sentenza definitiva",
  assoluzione: "Assoluzione",
  archiviazione: "Archiviazione",
  scioglimento_commissariamento: "Scioglimento o commissariamento",
  interdittiva_antimafia: "Interdittiva antimafia",
  bene_confiscato_assegnato: "Bene confiscato o assegnato",
  atto_comunale_legalita: "Atto comunale su legalità",
  iniziativa_pubblica_antimafia: "Iniziativa pubblica antimafia",
  episodio_pubblico_documentato: "Episodio pubblico documentato",
  relazione_istituzionale: "Relazione istituzionale",
};

export const TIMELINE_STATUS_LABELS: Record<TimelineStatus, string> = {
  indagine: "Indagine",
  misura_cautelare: "Misura cautelare",
  processo_in_corso: "Processo in corso",
  condanna_non_definitiva: "Condanna non definitiva",
  condanna_definitiva: "Condanna definitiva",
  assoluzione: "Assoluzione",
  archiviazione: "Archiviazione",
  misura_amministrativa: "Misura amministrativa",
  fatto_storico_istituzionale: "Fatto storico-istituzionale",
  non_applicabile: "Non applicabile",
};

export const TIMELINE_SOURCE_KIND_LABELS: Record<TimelineSource["kind"], string> = {
  sentenza: "Sentenza",
  comunicato_istituzionale: "Comunicato istituzionale",
  ministero_interno: "Ministero dell'Interno",
  prefettura: "Prefettura",
  dia: "DIA",
  anbsc: "ANBSC",
  comune: "Comune",
  albo: "Albo pretorio",
  altro: "Altra fonte documentale",
};

// v0: no real events are published until the editorial team records a primary
// source, status, caution note and last verification for each item.
export const legalityTimelineEvents: LegalityTimelineEvent[] = [];

export const timelineSchemaExample: LegalityTimelineEvent = {
  id: "schema-evento-da-verificare",
  title: "Titolo neutro dell'evento documentato",
  slug: "titolo-neutro-evento-documentato",
  dateLabel: "AAAA o periodo verificato",
  startDate: "2026-01-01",
  eventType: "relazione_istituzionale",
  shortDescription:
    "Sintesi redazionale breve, basata solo sulla fonte indicata e senza qualificazioni accusatorie autonome.",
  status: "fatto_storico_istituzionale",
  primarySource: {
    label: "Fonte primaria da collegare prima della pubblicazione",
    url: "/fonti-dati",
    kind: "altro",
  },
  secondarySources: [],
  organisations: ["Ente o organizzazione citata nell'atto"],
  places: ["Luogo collegato, se presente nella fonte"],
  civicEffect:
    "Effetto istituzionale o civico descritto dall'atto, senza inferenze ulteriori.",
  internalLinks: [
    {
      label: "Metodologia",
      href: "/metodologia",
      relation: "metodologia",
    },
  ],
  cautionNote:
    "Scheda esempio non riferita a un fatto reale: ogni evento pubblicato deve riportare fonte primaria, status e limiti di lettura.",
  lastVerification: "2026-06-07",
  published: false,
};
