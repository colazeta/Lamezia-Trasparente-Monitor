import { describe, expect, it } from "vitest";

import {
  PROMESSOMETRO_DEMO_ITEMS,
  PROMESSOMETRO_DEMO_NOTICE,
  PROMESSOMETRO_STATUS_LABELS,
  PROMESSOMETRO_STATUS_NOTES,
  PROMESSOMETRO_STATUSES,
} from "@/data/promessometroDemo";
import {
  buildPromessometroStatusDistribution,
  calculatePromessometroSourceCoverage,
  countPromessometroItems,
  findPromessometroRecordsWithMissingSources,
  isPromessometroDemoOnlyItem,
} from "@/lib/promessometroMetrics";

describe("Promessometro demo taxonomy", () => {
  it("exports the prudent v0 status list", () => {
    expect(PROMESSOMETRO_STATUSES).toEqual([
      "non_verificabile",
      "da_verificare",
      "avviato",
      "atto_collegato",
      "in_esecuzione",
      "completato",
      "sospeso",
    ]);

    for (const status of PROMESSOMETRO_STATUSES) {
      expect(PROMESSOMETRO_STATUS_LABELS[status]).toBeTruthy();
      expect(PROMESSOMETRO_STATUS_NOTES[status]).not.toMatch(
        /corruzione|favoritismo|illegittimit[aà]|colpa/i,
      );
    }
  });
});

describe("Promessometro demo dataset", () => {
  it("keeps fictional demo records separated from verified or real data", () => {
    expect(PROMESSOMETRO_DEMO_NOTICE).toMatch(/dimostrativo fittizio/i);
    expect(PROMESSOMETRO_DEMO_NOTICE).toMatch(/separato da dati verificati/i);
    expect(PROMESSOMETRO_DEMO_NOTICE).toMatch(/non giudizi politici o accuse/i);

    for (const item of PROMESSOMETRO_DEMO_ITEMS) {
      expect(isPromessometroDemoOnlyItem(item)).toBe(true);
      expect(item.dataKind).toBe("demo_fittizio");
      expect(item.isDemoOnly).toBe(true);
      expect(item.methodologyNote).not.toMatch(
        /corruzione|favoritismo|illegittimit[aà]|colpa/i,
      );
      expect(item.programmeSource?.verified ?? false).toBe(false);
      expect(item.programmeSource?.isFictional ?? true).toBe(true);
      expect(item.linkedActSources.every((source) => source.isFictional && !source.verified)).toBe(true);
    }
  });
});

describe("Promessometro documentary metrics", () => {
  it("counts records and builds a full status distribution", () => {
    expect(countPromessometroItems(PROMESSOMETRO_DEMO_ITEMS)).toBe(3);

    expect(buildPromessometroStatusDistribution(PROMESSOMETRO_DEMO_ITEMS)).toEqual([
      { status: "non_verificabile", count: 1 },
      { status: "da_verificare", count: 1 },
      { status: "avviato", count: 0 },
      { status: "atto_collegato", count: 1 },
      { status: "in_esecuzione", count: 0 },
      { status: "completato", count: 0 },
      { status: "sospeso", count: 0 },
    ]);
  });

  it("calculates source coverage and records with missing sources", () => {
    expect(calculatePromessometroSourceCoverage(PROMESSOMETRO_DEMO_ITEMS)).toEqual({
      total: 3,
      withProgrammeSource: 2,
      withLinkedActSources: 1,
      withBothSourceTypes: 1,
      programmeSourceCoverage: 2 / 3,
      linkedActSourceCoverage: 1 / 3,
    });

    expect(findPromessometroRecordsWithMissingSources(PROMESSOMETRO_DEMO_ITEMS)).toEqual([
      {
        id: "demo-programma-001",
        missingProgrammeSource: false,
        missingLinkedActSources: true,
      },
      {
        id: "demo-programma-003",
        missingProgrammeSource: true,
        missingLinkedActSources: true,
      },
    ]);
  });

  it("keeps helpers pure for empty collections", () => {
    expect(countPromessometroItems([])).toBe(0);
    expect(calculatePromessometroSourceCoverage([])).toEqual({
      total: 0,
      withProgrammeSource: 0,
      withLinkedActSources: 0,
      withBothSourceTypes: 0,
      programmeSourceCoverage: 0,
      linkedActSourceCoverage: 0,
    });
    expect(findPromessometroRecordsWithMissingSources([])).toEqual([]);
  });
});
