export const legalitaTimelineCategories = [
  "atto_pubblico",
  "procedimento_amministrativo",
  "bene_confiscato",
  "contratto_o_affidamento",
  "comunicazione_istituzionale",
  "da_verificare",
] as const;

export type LegalitaTimelineCategory =
  (typeof legalitaTimelineCategories)[number];

export const legalitaTimelineSourceTypes = [
  "atto_amministrativo",
  "registro_pubblico",
  "comunicazione_ente",
  "dataset_demo",
  "fonte_da_verificare",
] as const;

export type LegalitaTimelineSourceType =
  (typeof legalitaTimelineSourceTypes)[number];

export const legalitaTimelineVerificationStatuses = [
  "verificato_documentale",
  "verifica_parziale",
  "da_verificare",
  "fonte_non_verificata",
] as const;

export type LegalitaTimelineVerificationStatus =
  (typeof legalitaTimelineVerificationStatuses)[number];

export interface LegalitaTimelineEvent {
  id: string;
  title: string;
  date: string;
  category: LegalitaTimelineCategory;
  sourceType: LegalitaTimelineSourceType;
  verificationStatus: LegalitaTimelineVerificationStatus;
  sourceUrl?: string;
  note?: string;
}

export interface LegalitaTimelineCounts {
  byCategory: Record<LegalitaTimelineCategory, number>;
  byVerificationStatus: Record<LegalitaTimelineVerificationStatus, number>;
}

export type LegalitaTimelineNonPublishableReason =
  | "id_mancante"
  | "data_non_valida"
  | "protocollo_fonte_non_ammesso"
  | "verifica_insufficiente";

export interface LegalitaTimelinePublicationIssue {
  event: LegalitaTimelineEvent;
  reasons: LegalitaTimelineNonPublishableReason[];
}

const allowedSourceProtocols = new Set(["http:", "https:", "demo:"]);

const categoryLabels: Record<LegalitaTimelineCategory, string> = {
  atto_pubblico: "Atto pubblico",
  procedimento_amministrativo: "Procedimento amministrativo",
  bene_confiscato: "Bene confiscato",
  contratto_o_affidamento: "Contratto o affidamento",
  comunicazione_istituzionale: "Comunicazione istituzionale",
  da_verificare: "Da verificare",
};

const sourceTypeLabels: Record<LegalitaTimelineSourceType, string> = {
  atto_amministrativo: "Atto amministrativo",
  registro_pubblico: "Registro pubblico",
  comunicazione_ente: "Comunicazione dell'ente",
  dataset_demo: "Dataset dimostrativo",
  fonte_da_verificare: "Fonte da verificare",
};

const verificationStatusLabels: Record<
  LegalitaTimelineVerificationStatus,
  string
> = {
  verificato_documentale: "Verifica documentale disponibile",
  verifica_parziale: "Verifica parziale",
  da_verificare: "Da verificare",
  fonte_non_verificata: "Fonte non verificata",
};

const insufficientVerificationStatuses =
  new Set<LegalitaTimelineVerificationStatus>([
    "da_verificare",
    "fonte_non_verificata",
  ]);

const makeCategoryCountSeed = (): Record<LegalitaTimelineCategory, number> =>
  Object.fromEntries(
    legalitaTimelineCategories.map((category) => [category, 0]),
  ) as Record<LegalitaTimelineCategory, number>;

const makeVerificationCountSeed = (): Record<
  LegalitaTimelineVerificationStatus,
  number
> =>
  Object.fromEntries(
    legalitaTimelineVerificationStatuses.map((status) => [status, 0]),
  ) as Record<LegalitaTimelineVerificationStatus, number>;

export function isValidLegalitaTimelineDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const dateUtc = new Date(Date.UTC(year, month - 1, day));

  return (
    dateUtc.getUTCFullYear() === year &&
    dateUtc.getUTCMonth() === month - 1 &&
    dateUtc.getUTCDate() === day
  );
}

export function normalizeLegalitaTimelineSourceUrl(
  sourceUrl: string,
): string | null {
  try {
    const parsedUrl = new URL(sourceUrl.trim());

    if (!allowedSourceProtocols.has(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}

export function isValidLegalitaTimelineSourceUrl(sourceUrl: string): boolean {
  return normalizeLegalitaTimelineSourceUrl(sourceUrl) !== null;
}

export function sortLegalitaTimelineEvents(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelineEvent[] {
  return [...events].sort((first, second) => {
    const dateComparison = first.date.localeCompare(second.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return first.id.localeCompare(second.id);
  });
}

export function countLegalitaTimelineEvents(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelineCounts {
  const counts: LegalitaTimelineCounts = {
    byCategory: makeCategoryCountSeed(),
    byVerificationStatus: makeVerificationCountSeed(),
  };

  for (const event of events) {
    counts.byCategory[event.category] += 1;
    counts.byVerificationStatus[event.verificationStatus] += 1;
  }

  return counts;
}

export function getLegalitaTimelineCategoryLabel(
  category: LegalitaTimelineCategory,
): string {
  return categoryLabels[category];
}

export function getLegalitaTimelineSourceTypeLabel(
  sourceType: LegalitaTimelineSourceType,
): string {
  return sourceTypeLabels[sourceType];
}

export function getLegalitaTimelineVerificationStatusLabel(
  status: LegalitaTimelineVerificationStatus,
): string {
  return verificationStatusLabels[status];
}

export function getLegalitaTimelineEventLabel(
  event: LegalitaTimelineEvent,
): string {
  return `${getLegalitaTimelineCategoryLabel(event.category)} · ${getLegalitaTimelineVerificationStatusLabel(event.verificationStatus)}`;
}

export function getLegalitaTimelineNonPublishableReasons(
  event: LegalitaTimelineEvent,
): LegalitaTimelineNonPublishableReason[] {
  const reasons: LegalitaTimelineNonPublishableReason[] = [];

  if (event.id.trim().length === 0) {
    reasons.push("id_mancante");
  }

  if (!isValidLegalitaTimelineDate(event.date)) {
    reasons.push("data_non_valida");
  }

  if (
    event.sourceUrl !== undefined &&
    !isValidLegalitaTimelineSourceUrl(event.sourceUrl)
  ) {
    reasons.push("protocollo_fonte_non_ammesso");
  }

  if (insufficientVerificationStatuses.has(event.verificationStatus)) {
    reasons.push("verifica_insufficiente");
  }

  return reasons;
}

export function getLegalitaTimelineNonPublishableEvents(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelinePublicationIssue[] {
  return events.flatMap((event) => {
    const reasons = getLegalitaTimelineNonPublishableReasons(event);

    return reasons.length > 0 ? [{ event, reasons }] : [];
  });
}
