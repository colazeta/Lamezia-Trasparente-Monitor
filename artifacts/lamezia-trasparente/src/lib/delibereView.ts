import type {
  Publication,
  PublicationAttachment,
} from "@workspace/api-client-react";

import type {
  DeliberaArchiveItem,
  DeliberaAreaTheme,
} from "@/data/delibereArchive";
import type { AlboOperationalStatus } from "@/data/alboStatus";

export type DeliberaOrgan = "giunta" | "consiglio" | "altro";
export type DeliberaOrganFilter = "all" | DeliberaOrgan;
export type DeliberaOrigin = "archive" | "api" | "archive+api";
export type DeliberaDocumentStatus = "archived" | "available" | "not_archived";

export const ALL_DELIBERE_THEMES = "all";
export const UNCLASSIFIED_DELIBERE_THEME = "senza-area";

export type DeliberaFilterState = {
  query: string;
  organ: DeliberaOrganFilter;
  theme: string;
  year: string;
  dateFrom: string;
  dateTo: string;
};

export type DeliberaReaderState = DeliberaFilterState & {
  page: number;
};

export type DeliberaReaderStatePatch = Partial<DeliberaReaderState>;

export type DeliberaThemeOption = {
  id: string;
  label: string;
  count: number;
};

export type DeliberaListItem = {
  id: string;
  publicId: string;
  dedupeKey: string;
  origin: DeliberaOrigin;
  organ: DeliberaOrgan;
  publicationNumber: string | null;
  actNumber: string | null;
  actType: string | null;
  office: string | null;
  subject: string;
  searchText: string;
  actDate: string | null;
  publicationStart: string | null;
  themeId: string | null;
  themeLabel: string | null;
  isNew: boolean;
  internalHref: string | null;
  attachments: PublicationAttachment[];
  archivedDocumentPath: string | null;
  sourceUrl: string | null;
  verificationStatus: AlboOperationalStatus["verification_status"] | null;
  lastObservedAt: string | null;
  publicNote: string | null;
  publicVisibility: DeliberaArchiveItem["public_visibility"];
  privacyRisk: DeliberaArchiveItem["privacy_risk"];
};

export const DEFAULT_DELIBERA_FILTERS: DeliberaFilterState = {
  query: "",
  organ: "all",
  theme: ALL_DELIBERE_THEMES,
  year: "",
  dateFrom: "",
  dateTo: "",
};

function usefulNumber(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized !== "0" ? normalized : null;
}

function verificationStatus(
  value: string,
): AlboOperationalStatus["verification_status"] | null {
  return value === "verification_required" ||
    value === "official_source_acquired" ||
    value === "normalised_automatically"
    ? value
    : null;
}

function apiAreaTheme(
  publication: Publication,
): Pick<DeliberaAreaTheme, "theme_id" | "theme_label"> {
  const areaTheme = publication.presentation.area_theme;
  const themeId = areaTheme.theme_id?.trim() || null;
  const themeLabel = areaTheme.theme_label?.trim() || null;
  return Boolean(themeId) === Boolean(themeLabel)
    ? { theme_id: themeId, theme_label: themeLabel }
    : { theme_id: null, theme_label: null };
}

function safeApiAttachments(publication: Publication): PublicationAttachment[] {
  if (publication.publicSafety.attachments_attested !== true) return [];

  return (publication.attachments ?? []).filter((attachment) => {
    const safeOfficialUrl = safePublicHref(attachment.officialUrl);
    const safeStoragePath =
      attachment.storagePath === null || safePublicHref(attachment.storagePath);
    return safeOfficialUrl && safeStoragePath;
  });
}

function safePublicHref(value: string): boolean {
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("..")
  ) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
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
  const organ = inferDeliberaOrgan(item.deliberation_body);
  return {
    id: item.id,
    publicId: item.public_id,
    dedupeKey: `public:${item.public_id}`,
    origin: "archive",
    organ,
    publicationNumber: item.publication_number,
    actNumber: item.act_number,
    actType: item.act_type,
    office: item.office,
    subject: item.presentation.display_title,
    searchText: item.presentation.search_text,
    actDate: item.act_date,
    publicationStart: item.publication_start,
    themeId: item.presentation.area_theme.theme_id,
    themeLabel: item.presentation.area_theme.theme_label,
    isNew: false,
    internalHref: null,
    attachments: [],
    archivedDocumentPath: item.archived_document?.platform_path ?? null,
    sourceUrl: item.source_url,
    verificationStatus: verificationStatus(item.verification_status),
    lastObservedAt: item.last_observed_at,
    publicNote: item.public_note,
    publicVisibility: item.public_visibility,
    privacyRisk: item.privacy_risk,
  };
}

export function apiDeliberaItem(
  publication: Publication,
): DeliberaListItem | null {
  const publicId = publication.publicId?.trim();
  if (
    !publication.presentation ||
    !publication.publicSafety ||
    !publicId ||
    !/^albo-(?:\d{4}-[1-9]\d*|raw-(?:[a-f0-9]{4})+)$/u.test(publicId)
  ) {
    return null;
  }
  const displayTitle = publication.presentation.display_title?.trim();
  const searchText = publication.presentation.search_text?.trim();
  if (!displayTitle || !searchText) return null;

  const organ = inferDeliberaOrgan(
    publication.subcategory ?? publication.tipologia,
  );
  const areaTheme = apiAreaTheme(publication);
  return {
    id: publicId,
    publicId,
    dedupeKey: `public:${publicId}`,
    origin: "api",
    organ,
    publicationNumber: usefulNumber(publication.progressivo),
    actNumber: apiDeliberaNumber(publication),
    actType: publication.tipologia,
    office: publication.provenienza ?? null,
    subject: displayTitle,
    searchText,
    actDate: publication.dataAtto ?? null,
    publicationStart: publication.pubStart ?? null,
    themeId: areaTheme.theme_id,
    themeLabel: areaTheme.theme_label,
    isNew: publication.isNew,
    internalHref: `/albo/${encodeURIComponent(publicId)}`,
    attachments: safeApiAttachments(publication),
    archivedDocumentPath: null,
    sourceUrl: null,
    verificationStatus: null,
    lastObservedAt: null,
    publicNote: publication.publicSafety.reason,
    publicVisibility: publication.publicSafety.public_visibility,
    privacyRisk: publication.publicSafety.privacy_risk,
  };
}

export function mergeDelibere(
  archiveItems: DeliberaArchiveItem[],
  apiPublications: Publication[],
): DeliberaListItem[] {
  const merged = new Map(
    archiveItems.map((item) => {
      const view = archiveDeliberaItem(item);
      return [view.publicId, view];
    }),
  );

  for (const publication of apiPublications) {
    const apiItem = apiDeliberaItem(publication);
    if (!apiItem) continue;
    const archived = merged.get(apiItem.publicId);
    if (!archived) {
      merged.set(apiItem.publicId, apiItem);
      continue;
    }

    const mayExposeApiDocuments =
      !archived.archivedDocumentPath &&
      archived.publicVisibility === "publishable" &&
      archived.privacyRisk === "low" &&
      apiItem.publicVisibility === "publishable" &&
      apiItem.privacyRisk === "low";
    merged.set(apiItem.publicId, {
      ...archived,
      origin: "archive+api",
      internalHref: apiItem.internalHref,
      attachments: mayExposeApiDocuments ? apiItem.attachments : [],
      isNew: apiItem.isNew,
      themeId: archived.themeId ?? apiItem.themeId,
      themeLabel: archived.themeLabel ?? apiItem.themeLabel,
    });
  }

  return [...merged.values()].sort(compareDelibere);
}

function normalizedSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function deliberationDate(item: DeliberaListItem): string | null {
  return item.actDate ?? item.publicationStart;
}

function deliberationDay(item: DeliberaListItem): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T|$)/u.exec(
    deliberationDate(item) ?? "",
  );
  return match?.[1] ?? null;
}

function dateYear(value: string | null): string | null {
  const match = /^(\d{4})-\d{2}-\d{2}/u.exec(value ?? "");
  return match?.[1] ?? null;
}

export function filterDelibere(
  items: DeliberaListItem[],
  filters: DeliberaFilterState,
): DeliberaListItem[] {
  const normalizedQuery = normalizedSearch(filters.query);
  return items.filter((item) => {
    const date = deliberationDay(item);
    if (filters.organ !== "all" && item.organ !== filters.organ) return false;
    if (
      filters.theme !== ALL_DELIBERE_THEMES &&
      (filters.theme === UNCLASSIFIED_DELIBERE_THEME
        ? item.themeId !== null
        : item.themeId !== filters.theme)
    ) {
      return false;
    }
    if (filters.year && dateYear(date) !== filters.year) return false;
    if (filters.dateFrom && (!date || date < filters.dateFrom)) return false;
    if (filters.dateTo && (!date || date > filters.dateTo)) return false;
    if (!normalizedQuery) return true;
    return normalizedSearch(
      [
        item.subject,
        item.searchText,
        item.publicId,
        item.publicationNumber,
        item.actNumber,
        item.actType,
        item.office,
        item.themeLabel,
      ]
        .filter(Boolean)
        .join(" "),
    ).includes(normalizedQuery);
  });
}

export function deliberaThemeOptions(
  items: DeliberaListItem[],
): DeliberaThemeOption[] {
  const options = new Map<string, DeliberaThemeOption>();
  let unclassified = 0;
  for (const item of items) {
    if (!item.themeId || !item.themeLabel) {
      unclassified += 1;
      continue;
    }
    const current = options.get(item.themeId);
    if (current) current.count += 1;
    else
      options.set(item.themeId, {
        id: item.themeId,
        label: item.themeLabel,
        count: 1,
      });
  }

  const classified = [...options.values()].sort(
    (left, right) =>
      left.label.localeCompare(right.label, "it") ||
      left.id.localeCompare(right.id),
  );
  return unclassified > 0
    ? [
        ...classified,
        {
          id: UNCLASSIFIED_DELIBERE_THEME,
          label: "Area non disponibile",
          count: unclassified,
        },
      ]
    : classified;
}

export function deliberaYearOptions(items: DeliberaListItem[]): string[] {
  return [
    ...new Set(
      items.flatMap((item) => {
        const year = dateYear(deliberationDate(item));
        return year ? [year] : [];
      }),
    ),
  ].sort((left, right) => right.localeCompare(left));
}

export function deliberaOrganCounts(
  items: DeliberaListItem[],
  filters: DeliberaFilterState,
): Record<DeliberaOrganFilter, number> {
  const withoutOrgan = filterDelibere(items, { ...filters, organ: "all" });
  return {
    all: withoutOrgan.length,
    giunta: withoutOrgan.filter((item) => item.organ === "giunta").length,
    consiglio: withoutOrgan.filter((item) => item.organ === "consiglio").length,
    altro: withoutOrgan.filter((item) => item.organ === "altro").length,
  };
}

export function deliberaDocumentSummary(item: DeliberaListItem): {
  status: DeliberaDocumentStatus;
  count: number;
  label: string;
} {
  const count =
    Number(Boolean(item.archivedDocumentPath)) + item.attachments.length;
  if (item.archivedDocumentPath) {
    return {
      status: "archived",
      count,
      label:
        count === 1 ? "1 PDF archiviato" : `${count} documenti disponibili`,
    };
  }
  if (count > 0) {
    return {
      status: "available",
      count,
      label:
        count === 1
          ? "1 documento disponibile"
          : `${count} documenti disponibili`,
    };
  }
  return { status: "not_archived", count: 0, label: "0 documenti archiviati" };
}

function validDate(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return "";
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : "";
}

function validYear(value: string | null): string {
  return value && /^(?:19|20|21)\d{2}$/u.test(value) ? value : "";
}

function validOrgan(value: string | null): DeliberaOrganFilter {
  return value === "giunta" || value === "consiglio" || value === "altro"
    ? value
    : "all";
}

export function parseDeliberaReaderState(search: string): DeliberaReaderState {
  const params = new URLSearchParams(search);
  const rawPage = Number(params.get("pagina"));
  const theme = params.get("tema")?.trim();
  let dateFrom = validDate(params.get("dal"));
  let dateTo = validDate(params.get("al"));
  if (dateFrom && dateTo && dateFrom > dateTo) {
    dateFrom = "";
    dateTo = "";
  }
  return {
    query: params.get("q") ?? "",
    organ: validOrgan(params.get("organo")),
    theme: theme && /^[a-z0-9_-]+$/u.test(theme) ? theme : ALL_DELIBERE_THEMES,
    year: dateFrom || dateTo ? "" : validYear(params.get("anno")),
    dateFrom,
    dateTo,
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export function updateDeliberaReaderSearch(
  search: string,
  patch: DeliberaReaderStatePatch,
): string {
  const next = { ...parseDeliberaReaderState(search), ...patch };
  let year = validYear(next.year);
  let dateFrom = validDate(next.dateFrom);
  let dateTo = validDate(next.dateTo);
  if (patch.year) {
    dateFrom = "";
    dateTo = "";
  } else if (patch.dateFrom !== undefined || patch.dateTo !== undefined) {
    year = "";
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    dateFrom = "";
    dateTo = "";
  }
  const params = new URLSearchParams();
  if (next.query.trim()) params.set("q", next.query.trim());
  if (next.organ !== "all") params.set("organo", next.organ);
  if (next.theme !== ALL_DELIBERE_THEMES) params.set("tema", next.theme);
  if (year) params.set("anno", year);
  if (dateFrom) params.set("dal", dateFrom);
  if (dateTo) params.set("al", dateTo);
  if (next.page > 1) params.set("pagina", String(next.page));
  return params.toString();
}

export function paginateDelibere(
  items: DeliberaListItem[],
  requestedPage: number,
  pageSize: number,
): {
  items: DeliberaListItem[];
  currentPage: number;
  totalPages: number;
  firstVisible: number;
  lastVisible: number;
} {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  return {
    items: items.slice(firstIndex, firstIndex + pageSize),
    currentPage,
    totalPages,
    firstVisible: items.length === 0 ? 0 : firstIndex + 1,
    lastVisible: Math.min(firstIndex + pageSize, items.length),
  };
}

function compareDelibere(
  left: DeliberaListItem,
  right: DeliberaListItem,
): number {
  const leftKey = `${deliberationDate(left) ?? ""}|${left.publicationNumber ?? ""}|${left.publicId}`;
  const rightKey = `${deliberationDate(right) ?? ""}|${right.publicationNumber ?? ""}|${right.publicId}`;
  return rightKey.localeCompare(leftKey, "it");
}
