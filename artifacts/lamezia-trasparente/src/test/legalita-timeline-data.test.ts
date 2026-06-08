import { describe, expect, it } from "vitest";
import {
  getPublishedLegalityTimelineEvents,
  type LegalityTimelineEvent,
} from "@/content/legalitaTimeline";

const baseEvent: LegalityTimelineEvent = {
  id: "scheda-base",
  title: "Scheda base verificata",
  slug: "scheda-base-verificata",
  dateLabel: "2026",
  startDate: "2026-05-01",
  eventType: "relazione_istituzionale",
  shortDescription: "Sintesi documentale neutra collegata a una fonte.",
  status: "fatto_storico_istituzionale",
  primarySource: {
    label: "Fonte primaria",
    url: "/fonti-dati",
    kind: "altro",
  },
  secondarySources: [],
  organisations: [],
  places: [],
  civicEffect: "Effetto civico descritto dalla fonte.",
  internalLinks: [],
  cautionNote: "Nota di cautela della scheda.",
  lastVerification: "2026-06-08",
  published: true,
};

describe("getPublishedLegalityTimelineEvents", () => {
  it("keeps only records explicitly enabled for publication", () => {
    const unpublishedEvent: LegalityTimelineEvent = {
      ...baseEvent,
      id: "scheda-non-pubblicata",
      title: "Scheda redazionale non pubblicata",
      published: false,
    };
    const publishedEvent: LegalityTimelineEvent = {
      ...baseEvent,
      id: "scheda-pubblicata",
      title: "Scheda pubblicata",
      published: true,
    };

    expect(
      getPublishedLegalityTimelineEvents([unpublishedEvent, publishedEvent]),
    ).toEqual([publishedEvent]);
  });
});
