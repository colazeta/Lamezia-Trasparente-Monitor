import type { PnrrProject } from "@workspace/api-client-react";

export type CantieriometroAmountFilter =
  | "all"
  | "under-100k"
  | "100k-500k"
  | "500k-1m"
  | "over-1m";
export type CantieriometroPresenceFilter = "all" | "yes" | "no";
export type CantieriometroLocationFilter = "all" | "available" | "missing";
export type CantieriometroFreshnessFilter = "all" | "updated" | "verify";

export type CantieriometroFilters = {
  amount: CantieriometroAmountFilter;
  cup: CantieriometroPresenceFilter;
  linkedActs: CantieriometroPresenceFilter;
  location: CantieriometroLocationFilter;
  freshness: CantieriometroFreshnessFilter;
};

export type CantieriometroCard = {
  projectId: number;
  projectKey: string;
  title: string;
  cup: string | null;
  amount: number | null;
  location: string | null;
  locationQuality: PnrrProject["locationQuality"];
  locationNote: string;
  projectStatus: string | null;
  linkedActsCount: number;
  linkedContractsCount: number;
  lastUpdatedAt: string | null;
  hasCup: boolean;
  hasLinkedActs: boolean;
  hasLocation: boolean;
  needsDataVerification: boolean;
};

export const defaultCantieriometroFilters: CantieriometroFilters = {
  amount: "all",
  cup: "all",
  linkedActs: "all",
  location: "all",
  freshness: "all",
};

export function buildCantieriometroCards(
  projects: readonly PnrrProject[],
): CantieriometroCard[] {
  return projects
    .map((project) => {
      const linkedActsCount = Math.max(
        project.documentsCount ?? 0,
        project.documents?.length ?? 0,
      );
      const location = normalizeText(project.location);
      const hasLocation =
        Boolean(location) && project.locationQuality !== "non_disponibile";
      const lastUpdatedAt =
        project.lastUpdatedAt ??
        project.lastPublication ??
        project.publishedAt ??
        null;

      return {
        projectId: project.id,
        projectKey: project.key,
        title: normalizeText(project.intervention) ?? project.title,
        cup: normalizeText(project.cup),
        amount: normalizeAmount(project.importoFinanziato),
        location,
        locationQuality: project.locationQuality,
        locationNote: project.locationNote,
        projectStatus: normalizeText(project.status),
        linkedActsCount,
        linkedContractsCount: project.linkedContracts?.length ?? 0,
        lastUpdatedAt,
        hasCup: Boolean(normalizeText(project.cup)),
        hasLinkedActs: linkedActsCount > 0,
        hasLocation,
        needsDataVerification:
          project.aggiornamentoVecchio ||
          !lastUpdatedAt ||
          project.locationQuality === "da_verificare",
      };
    })
    .sort((a, b) => {
      const amountDelta = (b.amount ?? -1) - (a.amount ?? -1);
      if (amountDelta !== 0) return amountDelta;
      return a.title.localeCompare(b.title, "it");
    });
}

export function filterCantieriometroCards(
  cards: readonly CantieriometroCard[],
  filters: CantieriometroFilters,
): CantieriometroCard[] {
  return cards.filter((card) => {
    if (!matchesAmount(card.amount, filters.amount)) return false;
    if (!matchesPresence(card.hasCup, filters.cup)) return false;
    if (!matchesPresence(card.hasLinkedActs, filters.linkedActs)) return false;
    if (filters.location === "available" && !card.hasLocation) return false;
    if (filters.location === "missing" && card.hasLocation) return false;
    if (filters.freshness === "updated" && card.needsDataVerification)
      return false;
    if (filters.freshness === "verify" && !card.needsDataVerification)
      return false;
    return true;
  });
}

export function matchesAmount(
  amount: number | null,
  filter: CantieriometroAmountFilter,
) {
  if (filter === "all") return true;
  if (amount == null || Number.isNaN(amount)) return false;
  if (filter === "under-100k") return amount < 100_000;
  if (filter === "100k-500k") return amount >= 100_000 && amount < 500_000;
  if (filter === "500k-1m") return amount >= 500_000 && amount < 1_000_000;
  return amount >= 1_000_000;
}

function matchesPresence(value: boolean, filter: CantieriometroPresenceFilter) {
  if (filter === "all") return true;
  return value === (filter === "yes");
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeAmount(value: number | null | undefined) {
  return value != null && !Number.isNaN(value) ? value : null;
}
