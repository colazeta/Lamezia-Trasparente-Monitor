import { describe, expect, it } from "vitest";

import {
  CIVIC_RECURRENCE_CATEGORIES,
  CIVIC_RECURRENCE_MUNICIPALITY,
  candidateHasSourceOrNeedsSource,
  civicRecurrenceCalendarCandidates,
  filterCivicRecurrencesByCategory,
  hasUniqueCivicRecurrenceIds,
  summarizeCivicRecurrenceCalendar,
} from "../data/civicRecurrenceCalendar";

const candidatesText = JSON.stringify(civicRecurrenceCalendarCandidates);

const forbiddenPersonalOrCertaintyPatterns = [
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
  /codice\s+fiscale/i,
  /protocollo\s+n[.°]?\s*\d+/i,
  /\bcorruzione\b/i,
  /\bmafia\b/i,
  /\bfavoritismo\b/i,
  /\birregolarit[àa]\b/i,
  /\bcertamente\b/i,
];

describe("civic recurrence calendar candidates", () => {
  it("contains at least 30 importable candidate recurrences", () => {
    expect(CIVIC_RECURRENCE_MUNICIPALITY).toBe("Lamezia Terme");
    expect(civicRecurrenceCalendarCandidates.length).toBeGreaterThanOrEqual(30);
    expect(hasUniqueCivicRecurrenceIds()).toBe(true);
  });

  it("covers all required civic categories with multiple entries", () => {
    const summary = summarizeCivicRecurrenceCalendar();

    expect(Object.keys(summary.byCategory).sort()).toEqual(
      [...CIVIC_RECURRENCE_CATEGORIES].sort(),
    );

    for (const category of CIVIC_RECURRENCE_CATEGORIES) {
      expect(summary.byCategory[category]).toBeGreaterThanOrEqual(5);
      expect(filterCivicRecurrencesByCategory(category)).toHaveLength(
        summary.byCategory[category],
      );
    }
  });

  it("requires every candidate to include a temporal window and a source status", () => {
    for (const candidate of civicRecurrenceCalendarCandidates) {
      expect(candidate.title).toBeTruthy();
      expect(candidate.temporalWindow.label).toBeTruthy();
      expect(candidate.temporalWindow.note).toBeTruthy();
      expect(candidateHasSourceOrNeedsSource(candidate)).toBe(true);
      expect(candidate.monitoringRationale.length).toBeGreaterThan(40);
      expect(candidate.caveat).toBeTruthy();
    }
  });

  it("summarizes source coverage without treating unsourced items as complete", () => {
    const summary = summarizeCivicRecurrenceCalendar();

    expect(summary.total).toBe(civicRecurrenceCalendarCandidates.length);
    expect(summary.withSource).toBeGreaterThan(0);
    expect(summary.needsSource).toBeGreaterThan(0);
    expect(summary.withSource + summary.needsSource).toBe(summary.total);
  });

  it("keeps the fixture non-personal, cautious and non-accusatory", () => {
    for (const forbiddenPattern of forbiddenPersonalOrCertaintyPatterns) {
      expect(candidatesText).not.toMatch(forbiddenPattern);
    }

    expect(candidatesText).toMatch(/needs_source/);
    expect(candidatesText).toMatch(/verific/i);
  });
});
