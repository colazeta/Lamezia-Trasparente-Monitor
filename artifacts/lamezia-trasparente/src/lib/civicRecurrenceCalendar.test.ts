import { describe, expect, it } from "vitest";

import {
  createCivicRecurrenceExports,
  toCivicRecurrenceCsv,
  type CivicCalendarEvent,
  type CivicRecurrence,
  type RecurrenceSourceEvidence,
} from "./civicRecurrenceCalendar";

const syntheticSource = (
  label: string,
  limitations: readonly string[] = ["Fixture sintetica senza dati ufficiali."],
): RecurrenceSourceEvidence => ({
  type: "synthetic_fixture",
  label,
  limitations,
});

const recurrences: CivicRecurrence[] = [
  recurrence("rendiconto", "Rendiconto annuale", "finance_budget", 4),
  recurrence("piao", "Aggiornamento PIAO", "administrative_planning", 1),
  recurrence("libri-testo", "Avviso libri di testo", "school_education", 9),
  recurrence("bonus-affitti", "Fondo affitti", "social_welfare", 5),
  recurrence(
    "disinfestazione",
    "Programma disinfestazione",
    "environment_civil_protection",
    6,
  ),
  recurrence(
    "estate-cittadina",
    "Programma estate cittadina",
    "culture_tourism_sport",
    7,
  ),
];

const events: CivicCalendarEvent[] = [
  {
    recurrenceId: "estate-cittadina",
    year: 2026,
    date: "2026-07-10",
    dateStatus: "estimated",
    verificationStatus: "estimated_from_history",
    dataLimitations: ["Data ricavata da confronto sintetico, non ufficiale."],
  },
  {
    recurrenceId: "rendiconto",
    year: 2026,
    date: "2026-04-30",
    dateStatus: "certain",
    verificationStatus: "verified",
  },
  {
    recurrenceId: "libri-testo",
    year: 2026,
    targetMonth: 9,
    dateStatus: "not_detected",
    verificationStatus: "not_found_in_monitored_sources",
    dataLimitations: ["Data non rilevata nelle fonti monitorate."],
  },
  {
    recurrenceId: "piao",
    year: 2026,
    date: "2026-01-31",
    dateStatus: "certain",
    verificationStatus: "partial",
  },
  {
    recurrenceId: "bonus-affitti",
    year: 2026,
    date: "2026-05-15",
    dateStatus: "estimated",
    verificationStatus: "needs_review",
  },
  {
    recurrenceId: "disinfestazione",
    year: 2026,
    targetMonth: 6,
    dateStatus: "not_detected",
    verificationStatus: "not_found_in_monitored_sources",
  },
];

describe("civic recurrence calendar exports", () => {
  it("creates deterministic table and calendar JSON exports", () => {
    expect(createCivicRecurrenceExports(recurrences, events)).toMatchSnapshot();
  });

  it("creates a deterministic tabular CSV export", () => {
    const rows = createCivicRecurrenceExports(recurrences, events).table;

    expect(toCivicRecurrenceCsv(rows)).toMatchSnapshot();
  });

  it("sorts rows by month, category, title and year without mutating input", () => {
    const beforeRecurrences = structuredClone(recurrences);
    const beforeEvents = structuredClone(events);

    const rows = createCivicRecurrenceExports(recurrences, events).table;

    expect(
      rows.map((row) => `${row.month}:${row.category}:${row.title}`),
    ).toEqual([
      "1:administrative_planning:Aggiornamento PIAO",
      "4:finance_budget:Rendiconto annuale",
      "5:social_welfare:Fondo affitti",
      "6:environment_civil_protection:Programma disinfestazione",
      "7:culture_tourism_sport:Programma estate cittadina",
      "9:school_education:Avviso libri di testo",
    ]);
    expect(recurrences).toEqual(beforeRecurrences);
    expect(events).toEqual(beforeEvents);
  });

  it("requires every event to reference a defined recurrence", () => {
    expect(() =>
      createCivicRecurrenceExports(recurrences, [
        ...events,
        { recurrenceId: "missing", year: 2026, dateStatus: "not_detected" },
      ]),
    ).toThrow("Missing recurrence definition for event missing");
  });

  it("keeps all synthetic fixtures free of personal or live official source data", () => {
    const serialized = JSON.stringify(
      createCivicRecurrenceExports(recurrences, events),
    );

    expect(serialized).not.toMatch(/https?:\/\//i);
    expect(serialized).not.toMatch(/comune\.lamezia-terme\.cz\.it/i);
    expect(serialized).not.toMatch(
      /codice fiscale|partita iva|email|telefono/i,
    );
  });
});

function recurrence(
  id: string,
  title: string,
  category: CivicRecurrence["category"],
  startMonth: number,
): CivicRecurrence {
  return {
    id,
    title,
    category,
    expectedFrequency: "annual",
    planningWindow: { startMonth, endMonth: startMonth },
    source: syntheticSource(`Fonte sintetica ${id}`),
    verificationStatus: "needs_review",
    dataLimitations: ["Usare solo come fixture documentale per test."],
  };
}
