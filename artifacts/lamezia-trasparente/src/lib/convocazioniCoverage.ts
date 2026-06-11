import type { Publication, Seduta } from "@workspace/api-client-react";

export type CoverageFilter = "all" | "present" | "missing";

export type SedutaPublication = Pick<
  Publication,
  "id" | "cups" | "isPnrr" | "pnrrMission" | "odgMacrotemi"
>;

type LinkedOutcome = {
  type?: string | null;
  id?: number | string | null;
};

type LinkedOdgPoint = {
  outcomes?: LinkedOutcome[] | null;
};

type SedutaCoverageSource = Seduta & {
  votes?: unknown[] | null;
  odgPoints?: LinkedOdgPoint[] | null;
  linkedActs?: unknown[] | null;
  linkedContracts?: unknown[] | null;
};

export type SedutaCoverageFlags = {
  hasOdg: boolean;
  hasReport: boolean;
  hasVotes: boolean;
  hasLinkedActs: boolean;
  hasContractsOrPnrr: boolean;
};

export type ConvocazioniCoverageSummary = {
  total: number;
  withOdg: number;
  withReport: number;
  withVotes: number;
  withLinkedActs: number;
  withContractsOrPnrr: number;
};

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function hasPublicationPnrrLink(publication: SedutaPublication | undefined) {
  return Boolean(
    publication?.isPnrr ||
    hasText(publication?.pnrrMission) ||
    (publication?.cups?.length ?? 0) > 0,
  );
}

function hasOutcomesOfType(
  seduta: SedutaCoverageSource,
  predicate: (outcome: LinkedOutcome) => boolean,
) {
  return (seduta.odgPoints ?? []).some((point) =>
    (point.outcomes ?? []).some(predicate),
  );
}

export function getSedutaCoverageFlags(
  seduta: SedutaCoverageSource,
  publication?: SedutaPublication,
): SedutaCoverageFlags {
  const hasOdg =
    hasText(seduta.agenda) ||
    seduta.odgMacrotemi.length > 0 ||
    (publication?.odgMacrotemi?.length ?? 0) > 0 ||
    (seduta.odgPoints?.length ?? 0) > 0;

  const hasLinkedActs =
    (seduta.linkedActs?.length ?? 0) > 0 ||
    hasOutcomesOfType(seduta, (outcome) => outcome.type !== "contract");

  const hasContractsOrPnrr =
    (seduta.linkedContracts?.length ?? 0) > 0 ||
    hasOutcomesOfType(seduta, (outcome) => outcome.type === "contract") ||
    hasPublicationPnrrLink(publication);

  return {
    hasOdg,
    hasReport: seduta.hasReport,
    hasVotes: (seduta.votes?.length ?? 0) > 0,
    hasLinkedActs,
    hasContractsOrPnrr,
  };
}

export function summarizeConvocazioniCoverage(
  sedute: SedutaCoverageSource[],
  publicationsById: Map<number, SedutaPublication> = new Map(),
): ConvocazioniCoverageSummary {
  return sedute.reduce<ConvocazioniCoverageSummary>(
    (summary, seduta) => {
      const publication =
        seduta.publicationId != null
          ? publicationsById.get(seduta.publicationId)
          : undefined;
      const flags = getSedutaCoverageFlags(seduta, publication);

      summary.total += 1;
      if (flags.hasOdg) summary.withOdg += 1;
      if (flags.hasReport) summary.withReport += 1;
      if (flags.hasVotes) summary.withVotes += 1;
      if (flags.hasLinkedActs) summary.withLinkedActs += 1;
      if (flags.hasContractsOrPnrr) summary.withContractsOrPnrr += 1;
      return summary;
    },
    {
      total: 0,
      withOdg: 0,
      withReport: 0,
      withVotes: 0,
      withLinkedActs: 0,
      withContractsOrPnrr: 0,
    },
  );
}

export function matchesCoverageFilter(
  present: boolean,
  filter: CoverageFilter,
) {
  if (filter === "present") return present;
  if (filter === "missing") return !present;
  return true;
}
