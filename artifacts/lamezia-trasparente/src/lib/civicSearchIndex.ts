import { OPEN_DATA_THEME_LIBRARY } from "@/data/opendataThemeCategories";
import {
  listStaticOfficials,
  listStaticOrgani,
} from "@/lib/institutionalStaticData";

export type CivicSearchKind = "dataset" | "organo" | "persona";

export interface CivicSearchItem {
  id: string;
  kind: CivicSearchKind;
  label: string;
  detail: string;
  href: string;
  keywords: string;
  statusLabel: string;
}

export interface CivicSearchResult extends CivicSearchItem {
  score: number;
}

const KIND_PRIORITY: Record<CivicSearchKind, number> = {
  persona: 0,
  organo: 1,
  dataset: 2,
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildOpenDataArchiveHref(
  themeId: string,
  datasetId: string,
): string {
  const params = new URLSearchParams({ tema: themeId, dataset: datasetId });
  return `/opendata?${params.toString()}`;
}

export function buildCivicSearchIndex(): CivicSearchItem[] {
  const organi: CivicSearchItem[] = listStaticOrgani().map((organo) => ({
    id: `organo:${organo.slug}`,
    kind: "organo",
    label: organo.name,
    detail: `Organo istituzionale Â· ${organo.memberCount} componenti correnti`,
    href: `/organi/${organo.slug}`,
    keywords: [organo.type, organo.description ?? "", "comune composizione"]
      .filter(Boolean)
      .join(" "),
    statusLabel: `${organo.memberCount} componenti`,
  }));

  const officials: CivicSearchItem[] = listStaticOfficials().map(
    (official) => ({
      id: `persona:${official.id}`,
      kind: "persona",
      label: official.name,
      detail: official.roleTitle ?? official.role,
      href: `/amministratori/${official.id}`,
      keywords: [
        official.role,
        official.roleTitle ?? "",
        official.group ?? "",
        official.status,
        "amministratore profilo persona",
      ].join(" "),
      statusLabel: official.status === "cessato" ? "Cessato" : "In carica",
    }),
  );

  const datasets: CivicSearchItem[] = OPEN_DATA_THEME_LIBRARY.flatMap((theme) =>
    theme.datasets.map((dataset) => ({
      id: `dataset:${dataset.id}`,
      kind: "dataset" as const,
      label: dataset.label,
      detail: `${theme.label} Â· ${dataset.dataType}`,
      href: buildOpenDataArchiveHref(theme.id, dataset.id),
      keywords: [
        theme.label,
        theme.shortLabel,
        theme.description,
        theme.civicQuestion,
        dataset.description,
        dataset.dataType,
        dataset.sourceLabel,
        dataset.updateCadence,
      ].join(" "),
      statusLabel: dataset.statusLabel,
    })),
  );

  return [...officials, ...organi, ...datasets];
}

export const CIVIC_SEARCH_INDEX = buildCivicSearchIndex();

function scoreItem(item: CivicSearchItem, normalizedQuery: string): number {
  const label = normalizeSearchText(item.label);
  const detail = normalizeSearchText(item.detail);
  const keywords = normalizeSearchText(item.keywords);
  const combined = `${label} ${detail} ${keywords}`;
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  if (tokens.some((token) => !combined.includes(token))) return 0;

  let score = 0;
  if (label === normalizedQuery) score += 240;
  else if (label.startsWith(normalizedQuery)) score += 160;
  else if (label.includes(normalizedQuery)) score += 110;
  else if (combined.includes(normalizedQuery)) score += 60;

  for (const token of tokens) {
    if (label === token) score += 70;
    else if (label.startsWith(token)) score += 45;
    else if (label.includes(token)) score += 30;
    else if (detail.includes(token)) score += 18;
    else if (keywords.includes(token)) score += 10;
  }

  return score;
}

export function searchCivicIndex(
  query: string,
  limit = 12,
  index: readonly CivicSearchItem[] = CIVIC_SEARCH_INDEX,
): CivicSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2 || limit <= 0) return [];

  return index
    .map((item) => ({ ...item, score: scoreItem(item, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind] ||
        a.label.localeCompare(b.label, "it"),
    )
    .slice(0, limit);
}

