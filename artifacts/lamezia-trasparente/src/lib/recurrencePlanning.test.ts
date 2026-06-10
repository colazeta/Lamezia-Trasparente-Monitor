import { describe, expect, it } from "vitest";

import {
  buildRecurrencePlanningDigest,
  classifyRecurrencePlanningWindow,
  daysBetweenPublicationAndTarget,
  getRecurrenceSourceStatus,
  type RecurrencePlanningInput,
} from "./recurrencePlanning";

const referenceDate = "2026-06-10";

const fixtures: readonly RecurrencePlanningInput[] = Object.freeze([
  {
    id: "past-due",
    title: "Scadenza già trascorsa",
    targetDate: "2026-06-01",
    publicationDate: "2026-05-20",
    sourceUrl: "demo://fixture/past-due",
  },
  {
    id: "today",
    title: "Scadenza alla data di riferimento",
    targetDate: "2026-06-10",
    publicationDate: "2026-06-01",
    sourceLabel: "Promemoria interno",
  },
  {
    id: "seven-days-edge",
    title: "Scadenza entro sette giorni",
    targetDate: "2026-06-17",
    publicationDate: "2026-06-10T08:00:00.000Z",
    sourceUrl: "https://example.invalid/fixture",
  },
  {
    id: "thirty-days-edge",
    title: "Scadenza entro trenta giorni",
    targetDate: "2026-07-10",
    publicationDate: "2026-07-01",
    sourceLabel: "Scheda sintetica",
  },
  {
    id: "later",
    title: "Scadenza oltre trenta giorni",
    targetDate: "2026-08-01",
    publicationDate: "2026-07-15",
    sourceUrl: "demo://fixture/later",
  },
  {
    id: "missing-target",
    title: "Record senza data target",
    targetDate: null,
    publicationDate: "2026-06-01",
    sourceLabel: "Registro locale",
  },
  {
    id: "missing-publication",
    title: "Record senza pubblicazione",
    targetDate: "2026-06-12",
    publicationDate: null,
    sourceUrl: "demo://fixture/no-publication",
  },
  {
    id: "missing-source",
    title: "Record senza fonte",
    targetDate: "2026-06-15",
    publicationDate: "2026-06-10",
  },
  {
    id: "publication-after-target",
    title: "Pubblicazione successiva alla data target",
    targetDate: "2026-06-05",
    publicationDate: "2026-06-07",
    sourceLabel: "Annotazione di verifica",
  },
  {
    id: "invalid-dates",
    title: "Record con date non valide",
    targetDate: "2026-02-30",
    publicationDate: "non-una-data",
    sourceUrl: "   ",
  },
]);

const digest = buildRecurrencePlanningDigest(fixtures, referenceDate);

describe("recurrence planning helpers", () => {
  it("builds digest output for the 10 scoped fixture records", () => {
    expect(digest).toHaveLength(10);
    expect(digest.map((item) => item.id)).toEqual(
      fixtures.map((item) => item.id),
    );
  });

  it("classifies target dates into deterministic planning windows", () => {
    expect(digest.map((item) => [item.id, item.window])).toEqual([
      ["past-due", "past-due"],
      ["today", "due-today"],
      ["seven-days-edge", "next-7-days"],
      ["thirty-days-edge", "next-30-days"],
      ["later", "later"],
      ["missing-target", "missing-target-date"],
      ["missing-publication", "next-7-days"],
      ["missing-source", "next-7-days"],
      ["publication-after-target", "past-due"],
      ["invalid-dates", "missing-target-date"],
    ]);
  });

  it("calculates day differences from publication date to target date", () => {
    expect(daysBetweenPublicationAndTarget("2026-06-01", "2026-06-10")).toBe(9);
    expect(daysBetweenPublicationAndTarget("2026-06-07", "2026-06-05")).toBe(
      -2,
    );
    expect(daysBetweenPublicationAndTarget(null, "2026-06-05")).toBeNull();
  });

  it("normalizes date-times to calendar dates before computing digest deltas", () => {
    expect(digest.find((item) => item.id === "seven-days-edge")).toMatchObject({
      targetDate: "2026-06-17",
      publicationDate: "2026-06-10",
      daysUntilTarget: 7,
      daysBetweenPublicationAndTarget: 7,
    });
  });

  it("marks source availability using only local source fields", () => {
    expect(getRecurrenceSourceStatus({ sourceUrl: "demo://fixture" })).toBe(
      "available",
    );
    expect(getRecurrenceSourceStatus({ sourceLabel: "Delibera" })).toBe(
      "available",
    );
    expect(
      getRecurrenceSourceStatus({ sourceUrl: " ", sourceLabel: null }),
    ).toBe("unavailable");
    expect(digest.find((item) => item.id === "missing-source")).toMatchObject({
      sourceStatus: "unavailable",
    });
  });

  it("handles missing or invalid target dates without producing numeric gaps", () => {
    expect(digest.find((item) => item.id === "missing-target")).toMatchObject({
      targetDate: null,
      daysUntilTarget: null,
      daysBetweenPublicationAndTarget: null,
      window: "missing-target-date",
    });
    expect(digest.find((item) => item.id === "invalid-dates")).toMatchObject({
      targetDate: null,
      publicationDate: null,
      sourceStatus: "unavailable",
    });
  });

  it("adds digest labels and caveats in cautious planning language", () => {
    const missingSource = digest.find((item) => item.id === "missing-source");
    expect(missingSource?.digestLabel).toBe(
      "Record senza fonte — entro 7 giorni; fonte da integrare",
    );
    expect(missingSource?.caveats).toContain(
      "Fonte non disponibile nel record: integrazione documentale richiesta.",
    );
  });

  it("does not mutate fixture records while building digest output", () => {
    const mutableFixtures = fixtures.map((fixture) => ({ ...fixture }));

    buildRecurrencePlanningDigest(mutableFixtures, referenceDate);

    expect(mutableFixtures).toEqual(fixtures);
  });

  it("classifies an invalid reference date as requiring target-date verification", () => {
    expect(classifyRecurrencePlanningWindow("2026-06-12", "not-a-date")).toBe(
      "missing-target-date",
    );
  });
});
