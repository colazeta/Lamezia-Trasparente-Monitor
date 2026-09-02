import type {
  PublicProposal,
  ProposalEvent,
  ProposalEventType,
} from "./propostePubblicheCore";

export type ProposalTimelineMode = "origins" | "events";

export type ProposalTimelineRange = {
  key: string;
  label: string;
  start: string;
  end: string;
};

export type ProposalTimelineBucket = ProposalTimelineRange & {
  count: number;
  proposalCount: number;
  eventCount: number;
};

export const INSTITUTIONAL_PROPOSAL_EVENT_TYPES = [
  "deposito",
  "calendarizzazione",
  "discussione",
  "risposta_istituzionale",
  "recepimento",
] as const satisfies readonly ProposalEventType[];

const institutionalEventTypes = new Set<ProposalEventType>(
  INSTITUTIONAL_PROPOSAL_EVENT_TYPES,
);

const monthFormatter = new Intl.DateTimeFormat("it-IT", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

function monthKey(value: string) {
  return value.slice(0, 7);
}

function monthStart(key: string) {
  return `${key}-01`;
}

function monthEnd(key: string) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 0));
  return date.toISOString().slice(0, 10);
}

function monthLabel(key: string) {
  return monthFormatter.format(new Date(`${key}-01T12:00:00Z`));
}

function nextMonth(key: string) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return date.toISOString().slice(0, 7);
}

function datesForProposal(proposal: PublicProposal, mode: ProposalTimelineMode) {
  if (mode === "origins") return [proposal.firstSeen];
  return proposal.events.map((event) => event.date);
}

export function getProposalTimelineBuckets(
  proposals: readonly PublicProposal[],
  mode: ProposalTimelineMode,
): ProposalTimelineBucket[] {
  const dates = proposals.flatMap((proposal) => datesForProposal(proposal, mode));
  if (dates.length === 0) return [];

  const firstKey = monthKey([...dates].sort()[0]);
  const lastKey = monthKey([...dates].sort().at(-1) as string);
  const buckets: ProposalTimelineBucket[] = [];

  for (let key = firstKey; ; key = nextMonth(key)) {
    const proposalIds = new Set<string>();
    let eventCount = 0;

    for (const proposal of proposals) {
      if (mode === "origins") {
        if (monthKey(proposal.firstSeen) === key) proposalIds.add(proposal.id);
        continue;
      }

      const matchingEvents = proposal.events.filter((event) => monthKey(event.date) === key);
      if (matchingEvents.length > 0) {
        proposalIds.add(proposal.id);
        eventCount += matchingEvents.length;
      }
    }

    const proposalCount = proposalIds.size;
    buckets.push({
      key,
      label: monthLabel(key),
      start: monthStart(key),
      end: monthEnd(key),
      count: mode === "origins" ? proposalCount : eventCount,
      proposalCount,
      eventCount: mode === "origins" ? proposalCount : eventCount,
    });

    if (key === lastKey) break;
  }

  return buckets;
}

export function proposalMatchesTimelineRange(
  proposal: PublicProposal,
  range: ProposalTimelineRange | null,
  mode: ProposalTimelineMode,
) {
  if (!range) return true;
  return datesForProposal(proposal, mode).some(
    (date) => date >= range.start && date <= range.end,
  );
}

export function getInstitutionalProposalEvents(
  proposal: PublicProposal,
): ProposalEvent[] {
  return [...proposal.events]
    .filter((event) => institutionalEventTypes.has(event.type))
    .sort((a, b) => a.date.localeCompare(b.date));
}
