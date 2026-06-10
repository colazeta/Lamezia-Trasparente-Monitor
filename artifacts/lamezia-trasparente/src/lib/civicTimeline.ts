export const civicTimelineCategories = [
  "istituzionale",
  "amministrativo",
  "prevenzione",
  "partecipazione",
  "trasparenza",
  "regolamenti",
  "progetti_civici",
  "aggiornamenti_documentali",
] as const;

export type CivicTimelineCategory = (typeof civicTimelineCategories)[number];

export const civicTimelineVerificationStatuses = [
  "documentato",
  "verifica_parziale",
  "da_verificare",
  "fonte_da_collegare",
] as const;

export type TimelineVerificationStatus =
  (typeof civicTimelineVerificationStatuses)[number];

export const timelineSourceEvidenceTypes = [
  "atto_amministrativo",
  "pagina_istituzionale",
  "registro_pubblico",
  "nota_metodologica",
  "dataset_dimostrativo",
] as const;

export type TimelineSourceEvidenceType =
  (typeof timelineSourceEvidenceTypes)[number];

export type TimelineSourceEvidence = {
  title: string;
  type: TimelineSourceEvidenceType;
  url: string;
  publishedAt?: string;
  retrievedAt?: string;
  limitationNote?: string;
};

export type TimelineContextNote = {
  kind: "fatto_documentato" | "contesto" | "nota_editoriale";
  text: string;
};

export type CivicTimelineFutureLinks = {
  proposalIds?: string[];
  deliberationIds?: string[];
  monthlyReportIds?: string[];
};

export type CivicTimelineEvent = {
  id: string;
  title: string;
  date: string;
  category: CivicTimelineCategory;
  verificationStatus: TimelineVerificationStatus;
  sourceEvidence: TimelineSourceEvidence;
  documentedFact: string;
  contextNotes: TimelineContextNote[];
  futureLinks?: CivicTimelineFutureLinks;
};

export type CivicTimelineValidationIssue =
  | "id_mancante"
  | "titolo_mancante"
  | "data_non_valida"
  | "fonte_mancante"
  | "url_fonte_non_ammesso"
  | "fatto_documentato_mancante"
  | "contesto_mancante"
  | "stato_verifica_mancante";

const allowedEvidenceProtocols = new Set(["http:", "https:", "demo:"]);

const categoryLabels: Record<CivicTimelineCategory, string> = {
  istituzionale: "Istituzionale",
  amministrativo: "Amministrativo",
  prevenzione: "Prevenzione",
  partecipazione: "Partecipazione",
  trasparenza: "Trasparenza",
  regolamenti: "Regolamenti",
  progetti_civici: "Progetti civici",
  aggiornamenti_documentali: "Aggiornamenti documentali",
};

const verificationStatusLabels: Record<TimelineVerificationStatus, string> = {
  documentato: "Documentato da fonte indicata",
  verifica_parziale: "Verifica parziale",
  da_verificare: "Verifica richiesta",
  fonte_da_collegare: "Fonte da collegare",
};

export function isValidCivicTimelineDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

export function normalizeTimelineSourceEvidenceUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url.trim());

    if (!allowedEvidenceProtocols.has(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}

export function isValidTimelineSourceEvidenceUrl(url: string): boolean {
  return normalizeTimelineSourceEvidenceUrl(url) !== null;
}

export function sortCivicTimelineEventsByDate(
  events: readonly CivicTimelineEvent[],
  direction: "asc" | "desc" = "asc",
): CivicTimelineEvent[] {
  const sortedEvents = [...events].sort((first, second) => {
    const dateComparison = first.date.localeCompare(second.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return first.id.localeCompare(second.id);
  });

  return direction === "asc" ? sortedEvents : sortedEvents.reverse();
}

export function filterCivicTimelineEventsByCategory(
  events: readonly CivicTimelineEvent[],
  categories: readonly CivicTimelineCategory[],
): CivicTimelineEvent[] {
  const categorySet = new Set(categories);

  return events.filter((event) => categorySet.has(event.category));
}

export function getCivicTimelineCategoryLabel(
  category: CivicTimelineCategory,
): string {
  return categoryLabels[category];
}

export function getTimelineVerificationStatusLabel(
  status: TimelineVerificationStatus,
): string {
  return verificationStatusLabels[status];
}

export function getCivicTimelineValidationIssues(
  event: CivicTimelineEvent,
): CivicTimelineValidationIssue[] {
  const issues: CivicTimelineValidationIssue[] = [];

  if (event.id.trim().length === 0) {
    issues.push("id_mancante");
  }

  if (event.title.trim().length === 0) {
    issues.push("titolo_mancante");
  }

  if (!isValidCivicTimelineDate(event.date)) {
    issues.push("data_non_valida");
  }

  if (event.sourceEvidence.title.trim().length === 0) {
    issues.push("fonte_mancante");
  }

  if (!isValidTimelineSourceEvidenceUrl(event.sourceEvidence.url)) {
    issues.push("url_fonte_non_ammesso");
  }

  if (event.documentedFact.trim().length === 0) {
    issues.push("fatto_documentato_mancante");
  }

  if (event.contextNotes.length === 0) {
    issues.push("contesto_mancante");
  }

  if (!civicTimelineVerificationStatuses.includes(event.verificationStatus)) {
    issues.push("stato_verifica_mancante");
  }

  return issues;
}

export function hasCompleteCivicTimelineMinimumFields(
  event: CivicTimelineEvent,
): boolean {
  return getCivicTimelineValidationIssues(event).length === 0;
}
