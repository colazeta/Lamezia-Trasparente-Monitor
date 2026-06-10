export type RecurrencePlanningWindow =
  | "missing-target-date"
  | "past-due"
  | "due-today"
  | "next-7-days"
  | "next-30-days"
  | "later";

export type RecurrenceSourceStatus = "available" | "unavailable";

export interface RecurrencePlanningInput {
  id: string;
  title: string;
  targetDate?: string | null;
  publicationDate?: string | null;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
}

export interface RecurrencePlanningDigestItem {
  id: string;
  title: string;
  targetDate: string | null;
  publicationDate: string | null;
  daysUntilTarget: number | null;
  daysBetweenPublicationAndTarget: number | null;
  window: RecurrencePlanningWindow;
  sourceStatus: RecurrenceSourceStatus;
  digestLabel: string;
  caveats: string[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCalendarDate(
  value: string | null | undefined,
): string | null {
  const trimmed = normalizeOptionalText(value);
  if (!trimmed) return null;

  const dateOnly = trimmed.slice(0, 10);
  if (!DATE_ONLY_PATTERN.test(dateOnly)) return null;

  const parsed = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  const normalized = parsed.toISOString().slice(0, 10);
  return normalized === dateOnly ? normalized : null;
}

function toUtcDay(value: string): number {
  return Date.parse(`${value}T00:00:00.000Z`) / MS_PER_DAY;
}

function diffCalendarDays(fromDate: string, toDate: string): number {
  return Math.round(toUtcDay(toDate) - toUtcDay(fromDate));
}

export function getRecurrenceSourceStatus(
  recurrence: Pick<RecurrencePlanningInput, "sourceLabel" | "sourceUrl">,
): RecurrenceSourceStatus {
  return normalizeOptionalText(recurrence.sourceUrl) ||
    normalizeOptionalText(recurrence.sourceLabel)
    ? "available"
    : "unavailable";
}

export function daysBetweenPublicationAndTarget(
  publicationDate: string | null | undefined,
  targetDate: string | null | undefined,
): number | null {
  const normalizedPublicationDate = normalizeCalendarDate(publicationDate);
  const normalizedTargetDate = normalizeCalendarDate(targetDate);

  if (!normalizedPublicationDate || !normalizedTargetDate) return null;
  return diffCalendarDays(normalizedPublicationDate, normalizedTargetDate);
}

export function classifyRecurrencePlanningWindow(
  targetDate: string | null | undefined,
  referenceDate: string,
): RecurrencePlanningWindow {
  const normalizedTargetDate = normalizeCalendarDate(targetDate);
  const normalizedReferenceDate = normalizeCalendarDate(referenceDate);

  if (!normalizedTargetDate || !normalizedReferenceDate) {
    return "missing-target-date";
  }

  const daysUntilTarget = diffCalendarDays(
    normalizedReferenceDate,
    normalizedTargetDate,
  );

  if (daysUntilTarget < 0) return "past-due";
  if (daysUntilTarget === 0) return "due-today";
  if (daysUntilTarget <= 7) return "next-7-days";
  if (daysUntilTarget <= 30) return "next-30-days";
  return "later";
}

export function buildRecurrencePlanningDigest(
  recurrences: readonly RecurrencePlanningInput[],
  referenceDate: string,
): RecurrencePlanningDigestItem[] {
  const normalizedReferenceDate = normalizeCalendarDate(referenceDate);

  return recurrences.map((recurrence) => {
    const targetDate = normalizeCalendarDate(recurrence.targetDate);
    const publicationDate = normalizeCalendarDate(recurrence.publicationDate);
    const daysUntilTarget =
      targetDate && normalizedReferenceDate
        ? diffCalendarDays(normalizedReferenceDate, targetDate)
        : null;
    const publicationDelta = daysBetweenPublicationAndTarget(
      publicationDate,
      targetDate,
    );
    const window = classifyRecurrencePlanningWindow(targetDate, referenceDate);
    const sourceStatus = getRecurrenceSourceStatus(recurrence);
    const caveats = buildCaveats({ targetDate, publicationDate, sourceStatus });

    return {
      id: recurrence.id,
      title: recurrence.title,
      targetDate,
      publicationDate,
      daysUntilTarget,
      daysBetweenPublicationAndTarget: publicationDelta,
      window,
      sourceStatus,
      digestLabel: buildDigestLabel(recurrence.title, window, sourceStatus),
      caveats,
    };
  });
}

function buildDigestLabel(
  title: string,
  window: RecurrencePlanningWindow,
  sourceStatus: RecurrenceSourceStatus,
): string {
  const sourceNote =
    sourceStatus === "available" ? "fonte indicata" : "fonte da integrare";

  return `${title} — ${planningWindowLabel(window)}; ${sourceNote}`;
}

function planningWindowLabel(window: RecurrencePlanningWindow): string {
  switch (window) {
    case "missing-target-date":
      return "data target da integrare";
    case "past-due":
      return "ricorrenza precedente alla data di riferimento";
    case "due-today":
      return "ricorrenza alla data di riferimento";
    case "next-7-days":
      return "entro 7 giorni";
    case "next-30-days":
      return "entro 30 giorni";
    case "later":
      return "oltre 30 giorni";
  }
}

function buildCaveats({
  targetDate,
  publicationDate,
  sourceStatus,
}: {
  targetDate: string | null;
  publicationDate: string | null;
  sourceStatus: RecurrenceSourceStatus;
}): string[] {
  const caveats: string[] = [];

  if (!targetDate) {
    caveats.push(
      "Data target mancante o non valida: pianificazione da verificare.",
    );
  }

  if (!publicationDate) {
    caveats.push(
      "Data di pubblicazione mancante o non valida: differenza temporale non calcolabile.",
    );
  }

  if (sourceStatus === "unavailable") {
    caveats.push(
      "Fonte non disponibile nel record: integrazione documentale richiesta.",
    );
  }

  return caveats;
}
