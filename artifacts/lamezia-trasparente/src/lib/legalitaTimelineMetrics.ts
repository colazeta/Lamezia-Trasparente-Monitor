import {
  LEGALITA_TIMELINE_CATEGORIES,
  type LegalitaTimelineCategory,
  type LegalitaTimelineEvent,
} from "@/data/legalitaTimelineDemo";

export type LegalitaTimelineCategoryDistribution = Record<
  LegalitaTimelineCategory,
  number
>;

export type LegalitaTimelineTemporalCoverage = {
  startDate: string | null;
  endDate: string | null;
};

export function countLegalitaTimelineEvents(
  events: readonly LegalitaTimelineEvent[],
): number {
  return events.length;
}

export function buildLegalitaTimelineCategoryDistribution(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelineCategoryDistribution {
  const distribution = Object.fromEntries(
    LEGALITA_TIMELINE_CATEGORIES.map((category) => [category, 0]),
  ) as LegalitaTimelineCategoryDistribution;

  for (const event of events) {
    distribution[event.category] += 1;
  }

  return distribution;
}

export function getLegalitaTimelineEventsMissingSource(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelineEvent[] {
  return events.filter((event) => event.documentSource === null);
}

export function getLegalitaTimelineTemporalCoverage(
  events: readonly LegalitaTimelineEvent[],
): LegalitaTimelineTemporalCoverage {
  if (events.length === 0) {
    return { startDate: null, endDate: null };
  }

  const dates = events.flatMap((event) => [
    event.timeframe.startDate,
    event.timeframe.endDate ?? event.timeframe.startDate,
  ]);

  return {
    startDate: dates.reduce((earliest, date) =>
      date < earliest ? date : earliest,
    ),
    endDate: dates.reduce((latest, date) => (date > latest ? date : latest)),
  };
}

export function isLegalitaTimelineDemoOnly(
  events: readonly LegalitaTimelineEvent[],
): boolean {
  return events.every(
    (event) =>
      event.demoOnly === true && event.verifiedRealWorldEvent === false,
  );
}
