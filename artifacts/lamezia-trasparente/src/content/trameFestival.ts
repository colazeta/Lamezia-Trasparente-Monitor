export type TrameContentType =
  | "proposta"
  | "analisi_del_contesto"
  | "diagnosi"
  | "policy_suggestion"
  | "memoria_civica"
  | "benchmark"
  | "indicatore_potenziale"
  | "accesso_civico_potenziale";

export type TramePublicationStatus =
  | "draft"
  | "needs_human_review"
  | "approved"
  | "published"
  | "excluded";

export type TrameEditorialPriority = "high" | "medium" | "low" | "exclude";

export type TrameTranscriptStatus =
  | "not_started"
  | "auto_available"
  | "downloaded"
  | "normalised"
  | "review_required"
  | "human_verified"
  | "blocked";

export interface TramePublicCard {
  card_id: string;
  card_title: string;
  content_type: TrameContentType;
  content_summary: string;
  speaker_name: string;
  speaker_role: string;
  event_title: string;
  event_date: string;
  edition_year: number;
  video_url: string;
  video_minute: string;
  source_label: string;
  transcript_status: TrameTranscriptStatus;
  verification_status: string;
  territorial_relevance: string;
  relevance_for_lamezia: string;
  possible_civic_translation: string;
  editorial_note: string;
  analytical_depth: number;
  non_obviousness: number;
  territorial_relevance_score: number;
  specificity: number;
  civic_transformability: number;
  source_verifiability: number;
  editorial_priority: TrameEditorialPriority;
  publication_status: TramePublicationStatus;
  last_reviewed: string;
}

export const TRAME_FESTIVAL_ROUTE = "/legalita/trame-festival" as const;

export const trameFestivalMethodology = {
  title: "Trame - Festival",
  subtitle:
    "Idee, proposte e analisi emerse dal festival Trame, selezionate per rilevanza civica e utilita per il territorio lametino.",
  primarySource:
    "Sito ufficiale Trame Festival e playlist YouTube Trame.15 incorporata nel sito ufficiale.",
  selectionCriteria:
    "Solo contenuti specifici, verificabili e utili per leggere o migliorare il territorio lametino.",
  transcriptState:
    "Probe tecnico avviato, nessuna trascrizione automatica trattata come verificata.",
  lastUpdated: "2026-06-19",
  knownLimits:
    "Durate, timestamp, speaker e transcript richiedono controllo umano prima della pubblicazione.",
  internalRepository:
    "Il censimento interno conserva fonti, video, interlocutori, transcript, analisi e QA; la pagina pubblica mostra solo schede approvate.",
} as const;

export const trameFestivalQualityCriteria = [
  "Non ovvieta: esclude formule generiche senza analisi concreta o proposta operativa.",
  "Ampiezza della riflessione: collega cause, conseguenze, attori, vincoli o traiettorie di intervento.",
  "Rilevanza territoriale: deve essere utile per Lamezia, Calabria, Mezzogiorno o territori comparabili.",
  "Specificita: indica problema, meccanismo, pratica, soluzione, criticita o linea di azione.",
  "Trasformabilita civica: puo diventare proposta, indicatore, accesso civico, benchmark o approfondimento.",
  "Verificabilita: richiede interlocutore, ruolo, evento, data, minuto video, fonte e stato transcript.",
] as const;

export const tramePublicCards: TramePublicCard[] = [];

const PUBLICATION_ALLOWED = new Set<TramePublicationStatus>([
  "approved",
  "published",
]);

const PRIORITY_ALLOWED = new Set<TrameEditorialPriority>(["high", "medium"]);

export function getPublishedTrameFestivalCards(
  cards: readonly TramePublicCard[] = tramePublicCards,
): TramePublicCard[] {
  return cards.filter(
    (card) =>
      PUBLICATION_ALLOWED.has(card.publication_status) &&
      PRIORITY_ALLOWED.has(card.editorial_priority),
  );
}

export function hasCompleteTramePublicAttribution(card: TramePublicCard) {
  return Boolean(
    card.speaker_name.trim() &&
      card.speaker_role.trim() &&
      card.event_title.trim() &&
      card.event_date.trim() &&
      card.video_url.trim() &&
      card.video_minute.trim() &&
      card.source_label.trim() &&
      card.transcript_status.trim() &&
      card.verification_status.trim(),
  );
}
