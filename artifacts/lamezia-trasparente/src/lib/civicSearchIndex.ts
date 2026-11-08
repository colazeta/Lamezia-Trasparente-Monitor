import { OPEN_DATA_THEME_LIBRARY } from "@/data/opendataThemeCategories";
import {
  listStaticOfficials,
  listStaticOrgani,
} from "@/lib/institutionalStaticData";

import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import { councilSessionV0StatusLabels } from "@/data/councilSessionV0";

export type CivicSearchKind = "dataset" | "organo" | "persona" | "seduta";

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
  seduta: 0,
  persona: 1,
  organo: 2,
  dataset: 3,
};

const DATASET_SEARCH_ALIASES: Record<string, readonly string[]> = {
  "lamezia-demographic-trend": ["trend demografico"],
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
    detail: `Organo istituzionale · ${organo.memberCount} componenti correnti`,
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
      detail: `${theme.label} · ${dataset.dataType}`,
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
        ...(DATASET_SEARCH_ALIASES[dataset.id] ?? []),
      ].join(" "),
      statusLabel: dataset.statusLabel,
    })),
  );

  const sessions: CivicSearchItem[] = councilSessionV0ReviewedRecords
    .filter((session) => !session.isDemoFixture)
    .map((session) => ({
      id: `seduta:${session.id}`,
      kind: "seduta",
      label: session.title.value ?? "Seduta senza titolo",
      detail: [
        session.kind === "council"
          ? "Consiglio comunale"
          : "Commissione consiliare",
        session.scheduledAt.value?.slice(0, 10) ?? "Data da verificare",
        session.provenance
          ? "Fonti nella scheda"
          : "Contesto da fonti editoriali",
      ].join(" · "),
      href: `/convocazioni/${session.id}`,
      keywords: [
        "seduta convocazione ordine del giorno",
        ...(session.agenda.value ?? []),
        ...(session.contextResearch.editorialAgenda ?? []).map(
          (item) => item.title,
        ),
        ...session.contextResearch.articles.map((item) => item.title),
      ].join(" "),
      statusLabel:
        councilSessionV0StatusLabels[
          session.sessionStatus.value ?? "non_verificata"
        ],
    }));

  return [...sessions, ...officials, ...organi, ...datasets];
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
