export const recurrenceCategories = [
  "finance_budget",
  "administrative_planning",
  "school_education",
  "social_welfare",
  "environment_civil_protection",
  "culture_tourism_sport",
  "council_participation",
  "taxes_citizen_services",
  "public_works_maintenance",
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

export type RecurrenceDateStatus = "certain" | "estimated" | "not_detected";

export type RecurrenceSourceType =
  | "institutional_site"
  | "albo_pretorio"
  | "transparent_administration"
  | "open_data_portal"
  | "pnrr_portal"
  | "synthetic_fixture"
  | "needs_source";

export type RecurrenceFrequency =
  | "annual"
  | "seasonal"
  | "quarterly"
  | "monthly"
  | "on_demand"
  | "unknown";

export type PreparatoryActType =
  | "albo"
  | "site_notice"
  | "delibera"
  | "determina"
  | "ordinanza"
  | "avviso";

export interface PlanningWindow {
  readonly startMonth: number;
  readonly endMonth: number;
  readonly note?: string;
}

export interface RecurrenceSourceEvidence {
  readonly type: RecurrenceSourceType;
  readonly label: string;
  readonly url?: string;
  readonly limitations: readonly string[];
}

export interface PreparatoryAct {
  readonly type: PreparatoryActType;
  readonly label: string;
  readonly date?: string;
  readonly source: RecurrenceSourceEvidence;
  readonly dateStatus: RecurrenceDateStatus;
}

export interface CivicRecurrence {
  readonly id: string;
  readonly title: string;
  readonly category: RecurrenceCategory;
  readonly expectedFrequency: RecurrenceFrequency;
  readonly planningWindow: PlanningWindow;
  readonly source: RecurrenceSourceEvidence;
  readonly verificationStatus: RecurrenceVerificationStatus;
  readonly dataLimitations: readonly string[];
  readonly preparatoryActs?: readonly PreparatoryAct[];
}

export interface CivicCalendarEvent {
  readonly recurrenceId: string;
  readonly year: number;
  readonly label?: string;
  readonly date?: string;
  readonly targetMonth?: number;
  readonly dateStatus: RecurrenceDateStatus;
  readonly source?: RecurrenceSourceEvidence;
  readonly verificationStatus?: RecurrenceVerificationStatus;
  readonly dataLimitations?: readonly string[];
}

export interface CivicRecurrenceTableRow {
  readonly recurrenceId: string;
  readonly title: string;
  readonly category: RecurrenceCategory;
  readonly year: number;
  readonly month: number;
  readonly date: string | null;
  readonly dateStatus: RecurrenceDateStatus;
  readonly verificationStatus: RecurrenceVerificationStatus;
  readonly sourceType: RecurrenceSourceType;
  readonly sourceLabel: string;
  readonly sourceUrl: string | null;
  readonly dataLimitations: readonly string[];
}

export interface CivicRecurrenceCalendarItem {
  readonly uid: string;
  readonly title: string;
  readonly category: RecurrenceCategory;
  readonly year: number;
  readonly month: number;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly allDay: true;
  readonly dateStatus: RecurrenceDateStatus;
  readonly verificationStatus: RecurrenceVerificationStatus;
  readonly source: RecurrenceSourceEvidence;
  readonly dataLimitations: readonly string[];
}

export interface CivicRecurrenceJsonExport {
  readonly schemaVersion: "civic-recurrence-calendar-export.v1";
  readonly table: readonly CivicRecurrenceTableRow[];
  readonly calendar: readonly CivicRecurrenceCalendarItem[];
}

const DEFAULT_LIMITATION = "Dato da verificare nelle fonti monitorate.";

export function createCivicRecurrenceExports(
  recurrences: readonly CivicRecurrence[],
  events: readonly CivicCalendarEvent[],
): CivicRecurrenceJsonExport {
  const recurrencesById = new Map(
    recurrences.map((recurrence) => [recurrence.id, recurrence]),
  );

  const table = sortCivicRecurrenceRows(
    events.map((event) => {
      const recurrence = recurrencesById.get(event.recurrenceId);

      if (!recurrence) {
        throw new Error(
          `Missing recurrence definition for event ${event.recurrenceId}`,
        );
      }

      return createCivicRecurrenceTableRow(recurrence, event);
    }),
  );

  return {
    schemaVersion: "civic-recurrence-calendar-export.v1",
    table,
    calendar: table.map((row) => createCalendarItem(row)),
  };
}

export function createCivicRecurrenceTableRow(
  recurrence: CivicRecurrence,
  event: CivicCalendarEvent,
): CivicRecurrenceTableRow {
  const source = event.source ?? recurrence.source;

  return {
    recurrenceId: recurrence.id,
    title: event.label ?? recurrence.title,
    category: recurrence.category,
    year: event.year,
    month: resolveEventMonth(recurrence, event),
    date: event.date ?? null,
    dateStatus: event.dateStatus,
    verificationStatus:
      event.verificationStatus ?? recurrence.verificationStatus,
    sourceType: source.type,
    sourceLabel: source.label,
    sourceUrl: source.url ?? null,
    dataLimitations: mergeLimitations(
      recurrence.dataLimitations,
      source.limitations,
      event.dataLimitations ?? [],
    ),
  };
}

export function sortCivicRecurrenceRows(
  rows: readonly CivicRecurrenceTableRow[],
): CivicRecurrenceTableRow[] {
  return [...rows].sort((left, right) => {
    const monthComparison = left.month - right.month;

    if (monthComparison !== 0) return monthComparison;

    const categoryComparison = left.category.localeCompare(right.category);

    if (categoryComparison !== 0) return categoryComparison;

    const titleComparison = left.title.localeCompare(right.title);

    if (titleComparison !== 0) return titleComparison;

    return left.year - right.year;
  });
}

export function toCivicRecurrenceCsv(
  rows: readonly CivicRecurrenceTableRow[],
): string {
  const header = [
    "recurrenceId",
    "title",
    "category",
    "year",
    "month",
    "date",
    "dateStatus",
    "verificationStatus",
    "sourceType",
    "sourceLabel",
    "sourceUrl",
    "dataLimitations",
  ];

  const body = rows.map((row) =>
    [
      row.recurrenceId,
      row.title,
      row.category,
      row.year,
      row.month,
      row.date ?? "",
      row.dateStatus,
      row.verificationStatus,
      row.sourceType,
      row.sourceLabel,
      row.sourceUrl ?? "",
      row.dataLimitations.join(" | "),
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}

function createCalendarItem(
  row: CivicRecurrenceTableRow,
): CivicRecurrenceCalendarItem {
  const source: RecurrenceSourceEvidence = {
    type: row.sourceType,
    label: row.sourceLabel,
    url: row.sourceUrl ?? undefined,
    limitations: row.dataLimitations,
  };

  return {
    uid: `${row.recurrenceId}-${row.year}`,
    title: row.title,
    category: row.category,
    year: row.year,
    month: row.month,
    startDate: row.date,
    endDate: row.date,
    allDay: true,
    dateStatus: row.dateStatus,
    verificationStatus: row.verificationStatus,
    source,
    dataLimitations: row.dataLimitations,
  };
}

function resolveEventMonth(
  recurrence: CivicRecurrence,
  event: CivicCalendarEvent,
): number {
  if (event.date) {
    return monthFromIsoDate(event.date);
  }

  if (event.targetMonth) {
    assertValidMonth(event.targetMonth);
    return event.targetMonth;
  }

  assertValidMonth(recurrence.planningWindow.startMonth);
  return recurrence.planningWindow.startMonth;
}

function monthFromIsoDate(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error(
      `Expected ISO date in YYYY-MM-DD format, received ${value}`,
    );
  }

  const month = Number(match[2]);
  assertValidMonth(month);
  return month;
}

function assertValidMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Expected month between 1 and 12, received ${month}`);
  }
}

function mergeLimitations(
  ...groups: readonly (readonly string[])[]
): readonly string[] {
  const values = groups.flat().filter((value) => value.trim().length > 0);
  const unique = [...new Set(values)];

  return unique.length > 0 ? unique : [DEFAULT_LIMITATION];
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}
