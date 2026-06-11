import { describe, expect, it } from "vitest";
import {
  LEGALITA_TIMELINE_CATEGORIES,
  LEGALITA_TIMELINE_CAUTION,
  LEGALITA_TIMELINE_DEMO_NOTICE,
  legalitaTimelineDemoEvents,
  type LegalitaTimelineEvent,
} from "@/data/legalitaTimelineDemo";
import {
  buildLegalitaTimelineCategoryDistribution,
  countLegalitaTimelineEvents,
  getLegalitaTimelineEventsMissingSource,
  getLegalitaTimelineTemporalCoverage,
  isLegalitaTimelineDemoOnly,
} from "@/lib/legalitaTimelineMetrics";

const expectedCategories = [
  "memoria_civica",
  "prevenzione",
  "bene_confiscato",
  "atto_istituzionale",
  "iniziativa_pubblica",
  "fonte_documentale",
];

describe("legalitaTimelineDemoEvents", () => {
  it("exports the cautious v0 taxonomy", () => {
    expect(LEGALITA_TIMELINE_CATEGORIES).toEqual(expectedCategories);
  });

  it("keeps one demo event for every taxonomy category", () => {
    const categories = new Set(
      legalitaTimelineDemoEvents.map((event) => event.category),
    );

    expect(categories).toEqual(new Set(expectedCategories));
  });

  it("marks the dataset as fictional demo data separated from verified real records", () => {
    expect(LEGALITA_TIMELINE_DEMO_NOTICE).toContain("fittizio");
    expect(isLegalitaTimelineDemoOnly(legalitaTimelineDemoEvents)).toBe(true);
    expect(
      legalitaTimelineDemoEvents.every(
        (event) => event.demoOnly && !event.verifiedRealWorldEvent,
      ),
    ).toBe(true);
  });

  it("keeps explicit safeguards against accusatory interpretation", () => {
    expect(LEGALITA_TIMELINE_CAUTION).toContain("non provano");
    expect(LEGALITA_TIMELINE_CAUTION).toContain("responsabilità");
    expect(LEGALITA_TIMELINE_CAUTION).toContain("infiltrazioni");
    expect(
      legalitaTimelineDemoEvents.every(
        (event) => event.cautionNote === LEGALITA_TIMELINE_CAUTION,
      ),
    ).toBe(true);
  });
});

describe("legalita timeline metrics", () => {
  it("counts events without side effects", () => {
    expect(countLegalitaTimelineEvents(legalitaTimelineDemoEvents)).toBe(6);
    expect(countLegalitaTimelineEvents([])).toBe(0);
  });

  it("builds a complete category distribution", () => {
    expect(
      buildLegalitaTimelineCategoryDistribution(legalitaTimelineDemoEvents),
    ).toEqual({
      memoria_civica: 1,
      prevenzione: 1,
      bene_confiscato: 1,
      atto_istituzionale: 1,
      iniziativa_pubblica: 1,
      fonte_documentale: 1,
    });

    expect(buildLegalitaTimelineCategoryDistribution([])).toEqual({
      memoria_civica: 0,
      prevenzione: 0,
      bene_confiscato: 0,
      atto_istituzionale: 0,
      iniziativa_pubblica: 0,
      fonte_documentale: 0,
    });
  });

  it("identifies records that still miss a demo source", () => {
    expect(
      getLegalitaTimelineEventsMissingSource(legalitaTimelineDemoEvents).map(
        (event) => event.id,
      ),
    ).toEqual(["demo-bene-confiscato-001"]);
  });

  it("computes temporal coverage from start and end dates", () => {
    expect(
      getLegalitaTimelineTemporalCoverage(legalitaTimelineDemoEvents),
    ).toEqual({ startDate: "2025-01-15", endDate: "2025-11-05" });

    expect(getLegalitaTimelineTemporalCoverage([])).toEqual({
      startDate: null,
      endDate: null,
    });
  });

  it("rejects arrays that contain a verified real-world event marker", () => {
    const unsafeEvent = {
      ...legalitaTimelineDemoEvents[0],
      id: "real-world-marker",
      demoOnly: false,
      verifiedRealWorldEvent: true,
    } as unknown as LegalitaTimelineEvent;

    expect(isLegalitaTimelineDemoOnly([unsafeEvent])).toBe(false);
  });
});
