import type {
  Publication,
  PublicationAttachment,
} from "@workspace/api-client-react";

import type { DeliberaArchiveItem } from "@/data/delibereArchive";

export type DeliberaOrgan = "giunta" | "consiglio" | "altro";
export type DeliberaOrigin = "archive" | "api" | "archive+api";

export type DeliberaListItem = {
  id: string;
  dedupeKey: string;
  origin: DeliberaOrigin;
  organ: DeliberaOrgan;
  publicationNumber: string | null;
  actNumber: string | null;
  actType: string | null;
  office: string | null;
  subject: string;
  actDate: string | null;
  publicationStart: string | null;
  macrotema: Publication["macrotema"] | null;
  isNew: boolean;
  internalHref: string | null;
  attachments: PublicationAttachment[];
  archivedDocumentPath: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  publicNote: string | null;
  publicVisibility: DeliberaArchiveItem["public_visibility"] | null;
};

function usefulNumber(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized !== "0" ? normalized : null;
}

function normalizeKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function dedupeKey(
  publicationNumber: string | null,
  organ: DeliberaOrgan,
  actNumber: string | null,
  date: string | null,
  fallback: string,
): string {
  if (publicationNumber)
    return `publication:${normalizeKey(publicationNumber)}`;
  if (actNumber && date) {
    return `act:${organ}:${normalizeKey(actNumber)}:${normalizeKey(date)}`;
  }
  return `record:${fallback}`;
}

export function inferDeliberaOrgan(
  value: string | null | undefined,
): DeliberaOrgan {
  const normalized = (value ?? "").toUpperCase();
  if (normalized.includes("CONSIGLIO")) return "consiglio";
  if (normalized.includes("GIUNTA")) return "giunta";
  return "altro";
}

export function apiDeliberaNumber(publication: Publication): string | null {
  const structured =
    usefulNumber(publication.numRegGen) ?? usefulNumber(publication.numRegSet);
  if (structured) return structured;
  const match = /\bNR\.?\s*(\d+)/i.exec(publication.tipologia ?? "");
  return match?.[1] ?? null;
}

export function archiveDeliberaItem(
  item: DeliberaArchiveItem,
): DeliberaListItem {
  const organ = inferDeliberaOrgan(item.act_type);
  return {
    id: item.id,
    dedupeKey: dedupeKey(
      item.publication_number,
      organ,
      item.act_number,
      item.act_date,
      item.id,
    ),
    origin: "archive",
    organ,
    publicationNumber: item.publication_number,
    actNumber: item.act_number,
    actType: item.act_type,
    office: item.office,
    subject: item.subject,
    actDate: item.act_date,
    publicationStart: item.publication_start,
    macrotema: null,
    isNew: false,
    internalHref: null,
    attachments: [],
    archivedDocumentPath: item.archived_document?.platform_path ?? null,
    sourceUrl: item.source_url,
    verifiedAt: item.last_observed_at,
    publicNote: item.public_note,
    publicVisibility: item.public_visibility,
  };
}

export function apiDeliberaItem(publication: Publication): DeliberaListItem {
  const organ = inferDeliberaOrgan(
    publication.subcategory ?? publication.tipologia,
  );
  const actNumber = apiDeliberaNumber(publication);
  return {
    id: `api-${publication.id}`,
    dedupeKey: dedupeKey(
      usefulNumber(publication.progressivo),
      organ,
      actNumber,
      publication.dataAtto ?? publication.pubStart ?? null,
      String(publication.id),
    ),
    origin: "api",
    organ,
    publicationNumber: usefulNumber(publication.progressivo),
    actNumber,
    actType: publication.tipologia,
    office: publication.provenienza ?? null,
    subject: publication.oggetto,
    actDate: publication.dataAtto ?? null,
    publicationStart: publication.pubStart ?? null,
    macrotema: publication.macrotema,
    isNew: publication.isNew,
    internalHref: `/albo/${publication.id}`,
    attachments: publication.attachments ?? [],
    archivedDocumentPath: null,
    sourceUrl: null,
    verifiedAt: null,
    publicNote: null,
    publicVisibility: null,
  };
}

export function mergeDelibere(
  archiveItems: DeliberaArchiveItem[],
  apiPublications: Publication[],
): DeliberaListItem[] {
  const merged = new Map(
    archiveItems.map((item) => {
      const view = archiveDeliberaItem(item);
      return [view.dedupeKey, view];
    }),
  );

  for (const publication of apiPublications) {
    const apiItem = apiDeliberaItem(publication);
    const archived = merged.get(apiItem.dedupeKey);
    if (!archived) {
      merged.set(apiItem.dedupeKey, apiItem);
      continue;
    }

    merged.set(apiItem.dedupeKey, {
      ...archived,
      origin: "archive+api",
      macrotema: apiItem.macrotema,
      isNew: apiItem.isNew,
      internalHref: apiItem.internalHref,
      attachments: apiItem.attachments,
    });
  }

  return [...merged.values()].sort(compareDelibere);
}

function normalizedSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterDelibere(
  items: DeliberaListItem[],
  organ: string,
  query: string,
): DeliberaListItem[] {
  const normalizedQuery = normalizedSearch(query);
  return items.filter((item) => {
    if (organ !== "all" && item.organ !== organ) return false;
    if (!normalizedQuery) return true;
    return normalizedSearch(
      [
        item.subject,
        item.publicationNumber,
        item.actNumber,
        item.actType,
        item.office,
      ]
        .filter(Boolean)
        .join(" "),
    ).includes(normalizedQuery);
  });
}

function compareDelibere(
  left: DeliberaListItem,
  right: DeliberaListItem,
): number {
  const leftKey = `${left.actDate ?? left.publicationStart ?? ""}|${left.publicationNumber ?? ""}|${left.id}`;
  const rightKey = `${right.actDate ?? right.publicationStart ?? ""}|${right.publicationNumber ?? ""}|${right.id}`;
  return rightKey.localeCompare(leftKey, "it");
}
