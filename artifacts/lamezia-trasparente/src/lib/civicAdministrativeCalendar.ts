export const recurrenceCategories = [
  "finanza_bilancio",
  "programmazione_amministrativa",
  "scuola_servizi_educativi",
  "sociale_welfare",
  "ambiente_protezione_civile",
  "cultura_turismo_sport",
  "consiglio_partecipazione",
  "tributi_servizi_cittadino",
  "lavori_pubblici_manutenzioni",
] as const;

export type RecurrenceCategory = (typeof recurrenceCategories)[number];

export const recurrenceVerificationStatuses = [
  "verified",
  "partial",
  "estimated_from_history",
  "not_found_in_monitored_sources",
  "needs_review",
] as const;

export type RecurrenceVerificationStatus =
  (typeof recurrenceVerificationStatuses)[number];

export const preparatoryActSourceTypes = [
  "albo",
  "sito",
  "delibera",
  "determina",
  "ordinanza",
  "avviso",
] as const;

export type PreparatoryActSourceType =
  (typeof preparatoryActSourceTypes)[number];

export type RecurrenceFrequency =
  | "annual"
  | "semiannual"
  | "quarterly"
  | "monthly"
  | "custom";

export type ISODateString = `${number}-${number}-${number}`;

export type PlanningWindow = {
  id: string;
  label: string;
  startDate: ISODateString;
  endDate: ISODateString;
  note?: string;
};

export type RecurrenceSourceEvidence = {
  id: string;
  title: string;
  sourceType: PreparatoryActSourceType | "regolamento" | "programma";
  url?: string;
  documentDate?: ISODateString;
  publicationDate?: ISODateString;
  referenceNumber?: string;
  limitations?: string;
};

export type PreparatoryAct = {
  id: string;
  recurrenceId: string;
  title: string;
  sourceType: PreparatoryActSourceType;
  evidenceId?: string;
  url?: string;
  documentDate?: ISODateString;
  note?: string;
};

export type CivicCalendarEventDate =
  | {
      kind: "certain";
      date: ISODateString;
      evidenceId: string;
    }
  | {
      kind: "estimated";
      date: ISODateString;
      basisEvidenceIds: string[];
      estimationNote: string;
    }
  | {
      kind: "not_detected";
      monitoredWindow: PlanningWindow;
      monitoringNote: string;
    };

export type CivicCalendarEvent = {
  id: string;
  recurrenceId: string;
  title: string;
  category: RecurrenceCategory;
  date: CivicCalendarEventDate;
  preparatoryActIds?: string[];
  note?: string;
};

export type CivicRecurrence = {
  id: string;
  title: string;
  category: RecurrenceCategory;
  expectedFrequency: RecurrenceFrequency;
  planningWindow: PlanningWindow;
  verificationStatus: RecurrenceVerificationStatus;
  sources: RecurrenceSourceEvidence[];
  methodologicalNote?: string;
};

export type CivicCalendarBundle = {
  recurrences: CivicRecurrence[];
  events?: CivicCalendarEvent[];
  preparatoryActs?: PreparatoryAct[];
};

export type CivicCalendarTableRow = {
  recurrenceId: string;
  title: string;
  category: RecurrenceCategory;
  expectedFrequency: RecurrenceFrequency;
  planningWindow: string;
  verificationStatus: RecurrenceVerificationStatus;
  eventDateStatus: CivicCalendarEventDate["kind"] | "not_mapped";
  eventDate: ISODateString | "";
  sourceCount: number;
  preparatoryActCount: number;
  note: string;
};

const validCategorySet = new Set<string>(recurrenceCategories);
const validVerificationSet = new Set<string>(recurrenceVerificationStatuses);
const validPreparatoryActSourceSet = new Set<string>(preparatoryActSourceTypes);

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function isValidDateOrder(window: PlanningWindow): boolean {
  return window.startDate <= window.endDate;
}

export function describePlanningWindow(window: PlanningWindow): string {
  return `${window.label} (${window.startDate} / ${window.endDate})`;
}

export function getEventDateStatus(event: CivicCalendarEvent): string {
  if (event.date.kind === "certain") return `data certa: ${event.date.date}`;
  if (event.date.kind === "estimated") {
    return `data stimata: ${event.date.date}`;
  }
  return `data non rilevata: ${describePlanningWindow(event.date.monitoredWindow)}`;
}

export function validateCivicRecurrence(recurrence: CivicRecurrence): string[] {
  const issues: string[] = [];

  if (!hasText(recurrence.id)) issues.push("id is required");
  if (!hasText(recurrence.title)) issues.push("title is required");
  if (!validCategorySet.has(recurrence.category)) {
    issues.push("category must be a supported recurrence category");
  }
  if (!validVerificationSet.has(recurrence.verificationStatus)) {
    issues.push("verificationStatus must be a supported verification status");
  }
  if (!hasText(recurrence.planningWindow.id)) {
    issues.push("planningWindow.id is required");
  }
  if (!hasText(recurrence.planningWindow.label)) {
    issues.push("planningWindow.label is required");
  }
  if (!isValidDateOrder(recurrence.planningWindow)) {
    issues.push("planningWindow startDate must be before or equal to endDate");
  }
  if (recurrence.sources.length === 0) {
    issues.push("at least one source evidence item is required");
  }
  recurrence.sources.forEach((source, index) => {
    if (!hasText(source.id)) issues.push(`sources[${index}].id is required`);
    if (!hasText(source.title)) {
      issues.push(`sources[${index}].title is required`);
    }
    if (!hasText(source.url) && !hasText(source.referenceNumber)) {
      issues.push(
        `sources[${index}] should include a url or referenceNumber for traceability`,
      );
    }
  });

  return issues;
}

export function validatePreparatoryAct(act: PreparatoryAct): string[] {
  const issues: string[] = [];

  if (!hasText(act.id)) issues.push("id is required");
  if (!hasText(act.recurrenceId)) issues.push("recurrenceId is required");
  if (!hasText(act.title)) issues.push("title is required");
  if (!validPreparatoryActSourceSet.has(act.sourceType)) {
    issues.push(
      "sourceType must link to albo, sito, delibera, determina, ordinanza or avviso",
    );
  }
  if (!hasText(act.url) && !hasText(act.evidenceId)) {
    issues.push("url or evidenceId is required for traceability");
  }

  return issues;
}

export function validateCivicCalendarBundle(
  bundle: CivicCalendarBundle,
): string[] {
  const issues = bundle.recurrences.flatMap((recurrence) =>
    validateCivicRecurrence(recurrence).map(
      (issue) => `recurrences.${recurrence.id || "unknown"}: ${issue}`,
    ),
  );
  const recurrenceIds = new Set(bundle.recurrences.map(({ id }) => id));
  const evidenceIds = new Set(
    bundle.recurrences.flatMap((recurrence) =>
      recurrence.sources.map((source) => source.id),
    ),
  );
  const preparatoryActIds = new Set(
    (bundle.preparatoryActs ?? []).map(({ id }) => id),
  );

  (bundle.preparatoryActs ?? []).forEach((act) => {
    validatePreparatoryAct(act).forEach((issue) =>
      issues.push(`preparatoryActs.${act.id || "unknown"}: ${issue}`),
    );
    if (!recurrenceIds.has(act.recurrenceId)) {
      issues.push(`preparatoryActs.${act.id}: recurrenceId is not mapped`);
    }
    if (act.evidenceId && !evidenceIds.has(act.evidenceId)) {
      issues.push(`preparatoryActs.${act.id}: evidenceId is not mapped`);
    }
  });

  (bundle.events ?? []).forEach((event) => {
    if (!recurrenceIds.has(event.recurrenceId)) {
      issues.push(`events.${event.id}: recurrenceId is not mapped`);
    }
    if (!validCategorySet.has(event.category)) {
      issues.push(`events.${event.id}: category must be supported`);
    }
    if (
      event.date.kind === "certain" &&
      !evidenceIds.has(event.date.evidenceId)
    ) {
      issues.push(`events.${event.id}: date evidenceId is not mapped`);
    }
    if (
      event.date.kind === "estimated" &&
      event.date.basisEvidenceIds.length === 0
    ) {
      issues.push(
        `events.${event.id}: estimated dates require basisEvidenceIds`,
      );
    }
    if (event.date.kind === "estimated") {
      event.date.basisEvidenceIds.forEach((evidenceId) => {
        if (!evidenceIds.has(evidenceId)) {
          issues.push(
            `events.${event.id}: basisEvidenceId ${evidenceId} is not mapped`,
          );
        }
      });
    }
    (event.preparatoryActIds ?? []).forEach((preparatoryActId) => {
      if (!preparatoryActIds.has(preparatoryActId)) {
        issues.push(
          `events.${event.id}: preparatoryActId ${preparatoryActId} is not mapped`,
        );
      }
    });
  });

  return issues;
}

export function assertValidCivicCalendarBundle<T extends CivicCalendarBundle>(
  bundle: T,
): T {
  const issues = validateCivicCalendarBundle(bundle);
  if (issues.length > 0) {
    throw new Error(`Invalid civic calendar bundle:\n${issues.join("\n")}`);
  }
  return bundle;
}

export function toCivicCalendarJson(bundle: CivicCalendarBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function toCivicCalendarTableRows(
  bundle: CivicCalendarBundle,
): CivicCalendarTableRow[] {
  const eventsByRecurrence = new Map<string, CivicCalendarEvent>();
  (bundle.events ?? []).forEach((event) => {
    if (!eventsByRecurrence.has(event.recurrenceId)) {
      eventsByRecurrence.set(event.recurrenceId, event);
    }
  });

  return bundle.recurrences.map((recurrence) => {
    const event = eventsByRecurrence.get(recurrence.id);
    const preparatoryActCount = (bundle.preparatoryActs ?? []).filter(
      (act) => act.recurrenceId === recurrence.id,
    ).length;

    return {
      recurrenceId: recurrence.id,
      title: recurrence.title,
      category: recurrence.category,
      expectedFrequency: recurrence.expectedFrequency,
      planningWindow: describePlanningWindow(recurrence.planningWindow),
      verificationStatus: recurrence.verificationStatus,
      eventDateStatus: event?.date.kind ?? "not_mapped",
      eventDate:
        event?.date.kind === "certain" || event?.date.kind === "estimated"
          ? event.date.date
          : "",
      sourceCount: recurrence.sources.length,
      preparatoryActCount,
      note: recurrence.methodologicalNote ?? event?.note ?? "",
    };
  });
}
