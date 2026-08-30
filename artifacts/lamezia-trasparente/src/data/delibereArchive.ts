import publicDelibereArchive from "../../../../data/public/albo/delibere-archive.json";
import { classifyAlboRecordCategory } from "../../../../scripts/albo-classification-dictionary";

import type {
  AlboArchivedDocument,
  AlboItemClassification,
  AlboPrivacyRisk,
  AlboPublicRunItem,
  AlboPublicVisibility,
} from "@/data/alboPublicRun";

export type DeliberationBody = "giunta" | "consiglio" | "altro";

export type DeliberaAreaTheme = {
  schema_version: string;
  taxonomy_id: string;
  taxonomy_version: string;
  theme_id: string | null;
  theme_label: string | null;
  confidence: "high" | "medium" | null;
  basis: "deterministic_rule" | "manual_override" | "fallback";
  null_reason: string | null;
};

export type DeliberaPresentation = {
  display_title: string;
  action_id: string | null;
  action_label: string | null;
  search_text: string;
  area_theme: DeliberaAreaTheme;
  standardisation: {
    profile_id: string;
    profile_version: string;
    input_field: "subject";
  };
};

export type DeliberaArchiveItem = Omit<AlboPublicRunItem, "presentation"> & {
  public_id: string;
  deliberation_body: DeliberationBody;
  presentation: DeliberaPresentation;
  first_observed_at: string;
  last_observed_at: string;
  archived_document: AlboArchivedDocument | null;
};

type RawArchive = {
  generated_at?: unknown;
  source?: unknown;
  source_url?: unknown;
  verification_status?: unknown;
  coverage?: {
    first_observed_at?: unknown;
    last_observed_at?: unknown;
    first_act_date?: unknown;
    last_act_date?: unknown;
  };
  known_limits?: unknown;
  items?: unknown;
};

type RawArchiveItem = Record<string, unknown> & {
  archived_document?: unknown;
};

type RawArchiveDocument = Record<string, unknown>;

const rawArchive = publicDelibereArchive as unknown as RawArchive;

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function visibility(value: unknown): AlboPublicVisibility | null {
  return value === "publishable" ||
    value === "publishable_with_minimisation" ||
    value === "metadata_only"
    ? value
    : null;
}

function privacyRisk(value: unknown): AlboPrivacyRisk | null {
  return value === "low" || value === "medium" || value === "high"
    ? value
    : null;
}

function deliberationBody(value: unknown): DeliberationBody | null {
  return value === "giunta" || value === "consiglio" || value === "altro"
    ? value
    : null;
}

function areaTheme(value: unknown): DeliberaAreaTheme | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const schemaVersion = text(candidate.schema_version);
  const taxonomyId = text(candidate.taxonomy_id);
  const taxonomyVersion = text(candidate.taxonomy_version);
  const themeId = text(candidate.theme_id);
  const themeLabel = text(candidate.theme_label);
  const confidence = candidate.confidence;
  const basis = candidate.basis;
  const nullReason = text(candidate.null_reason);

  if (
    !schemaVersion ||
    !taxonomyId ||
    !taxonomyVersion ||
    Boolean(themeId) !== Boolean(themeLabel) ||
    (confidence !== null && confidence !== "high" && confidence !== "medium") ||
    (themeId !== null && confidence === null) ||
    (themeId === null && (confidence !== null || nullReason === null)) ||
    (themeId !== null && nullReason !== null) ||
    (basis === "fallback" && themeId !== null) ||
    (basis !== "fallback" && themeId === null) ||
    (basis !== "deterministic_rule" &&
      basis !== "manual_override" &&
      basis !== "fallback")
  ) {
    return null;
  }

  return {
    schema_version: schemaVersion,
    taxonomy_id: taxonomyId,
    taxonomy_version: taxonomyVersion,
    theme_id: themeId,
    theme_label: themeLabel,
    confidence,
    basis,
    null_reason: nullReason,
  };
}

function presentation(value: unknown): DeliberaPresentation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const standardisation =
    candidate.standardisation &&
    typeof candidate.standardisation === "object" &&
    !Array.isArray(candidate.standardisation)
      ? (candidate.standardisation as Record<string, unknown>)
      : null;
  const displayTitle = text(candidate.display_title);
  const searchText = text(candidate.search_text);
  const itemAreaTheme = areaTheme(candidate.area_theme);
  const profileId = text(standardisation?.profile_id);
  const profileVersion = text(standardisation?.profile_version);
  if (
    !displayTitle ||
    !searchText ||
    !itemAreaTheme ||
    !profileId ||
    !profileVersion ||
    standardisation?.input_field !== "subject"
  ) {
    return null;
  }
  return {
    display_title: displayTitle,
    action_id: text(candidate.action_id),
    action_label: text(candidate.action_label),
    search_text: searchText,
    area_theme: itemAreaTheme,
    standardisation: {
      profile_id: profileId,
      profile_version: profileVersion,
      input_field: "subject",
    },
  };
}

function classification(
  value: unknown,
  item: RawArchiveItem,
): AlboItemClassification {
  if (value && typeof value === "object") {
    const candidate = value as Partial<AlboItemClassification>;
    if (
      typeof candidate.dictionary_version === "string" &&
      candidate.sector &&
      typeof candidate.sector.id === "string" &&
      typeof candidate.sector.label === "string" &&
      candidate.act_category &&
      typeof candidate.act_category.id === "string" &&
      typeof candidate.act_category.label === "string"
    ) {
      return candidate as AlboItemClassification;
    }
  }

  return classifyAlboRecordCategory({
    office: text(item.office),
    act_type: text(item.act_type),
    subject: text(item.subject),
  });
}

function platformDocumentPath(storagePath: string): string {
  return storagePath.startsWith("data/public/")
    ? `/${storagePath}`
    : storagePath;
}

function archivedDocument(value: unknown): AlboArchivedDocument | null {
  if (!value || typeof value !== "object") return null;
  const document = value as RawArchiveDocument;
  const storagePath = text(document.storage_path);
  const sha256 = text(document.sha256)?.toLowerCase() ?? null;
  const contentType = text(document.content_type);
  const sizeBytes = document.size_bytes;
  if (
    !text(document.id) ||
    !text(document.publication_number) ||
    !text(document.retrieved_at) ||
    !storagePath ||
    !/^data\/public\/albo\/documents\/[0-9]{4}\/[a-f0-9]{64}\.pdf$/i.test(
      storagePath,
    ) ||
    !sha256 ||
    !/^[a-f0-9]{64}$/.test(sha256) ||
    !storagePath.toLowerCase().endsWith(`/${sha256}.pdf`) ||
    typeof sizeBytes !== "number" ||
    !Number.isFinite(sizeBytes) ||
    sizeBytes <= 0 ||
    contentType?.split(";", 1)[0]?.trim().toLowerCase() !== "application/pdf" ||
    !text(document.verification_status)
  ) {
    return null;
  }

  return {
    id: text(document.id)!,
    publication_number: text(document.publication_number)!,
    retrieved_at: text(document.retrieved_at)!,
    storage_path: storagePath,
    platform_path: platformDocumentPath(storagePath),
    sha256,
    size_bytes: sizeBytes,
    content_type: contentType,
    verification_status: text(document.verification_status)!,
  };
}

function normalizeItem(value: unknown): DeliberaArchiveItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as RawArchiveItem;
  const itemVisibility = visibility(item.public_visibility);
  const itemPrivacyRisk = privacyRisk(item.privacy_risk);
  const itemClassification = classification(item.classification, item);
  const itemDeliberationBody = deliberationBody(item.deliberation_body);
  const itemPresentation = presentation(item.presentation);
  const id = text(item.id);
  const publicId = text(item.public_id);
  const source = text(item.source);
  const sourceUrl = text(item.source_url);
  const retrievedAt = text(item.retrieved_at);
  const verificationStatus = text(item.verification_status);
  const firstObservedAt = text(item.first_observed_at);
  const lastObservedAt = text(item.last_observed_at);
  const subject = text(item.subject);

  if (
    !id ||
    !/^albo-(?:\d{4}-[1-9]\d*|raw-(?:[a-f0-9]{4})+)$/u.test(id) ||
    publicId !== id ||
    !source ||
    !sourceUrl ||
    !retrievedAt ||
    !verificationStatus ||
    !firstObservedAt ||
    !lastObservedAt ||
    !subject ||
    !itemVisibility ||
    !itemPrivacyRisk ||
    !itemDeliberationBody ||
    !itemPresentation ||
    (!/^DELIBERAZIONE\b/i.test(text(item.act_type) ?? "") &&
      itemClassification.act_category.id !== "deliberazioni")
  ) {
    return null;
  }

  const document =
    itemVisibility === "publishable" && itemPrivacyRisk === "low"
      ? archivedDocument(item.archived_document)
      : null;
  const authorisedDocument = document?.id === id ? document : null;

  return {
    id,
    public_id: publicId,
    source,
    source_url: sourceUrl,
    retrieved_at: retrievedAt,
    publication_number: text(item.publication_number),
    publication_start: text(item.publication_start),
    publication_end: text(item.publication_end),
    office: text(item.office),
    act_type: text(item.act_type),
    act_number: text(item.act_number),
    act_date: text(item.act_date),
    subject,
    content_hash: text(item.content_hash),
    verification_status: verificationStatus,
    privacy_risk: itemPrivacyRisk,
    public_visibility: itemVisibility,
    classification: itemClassification,
    known_limits: textArray(item.known_limits),
    public_note: text(item.public_note),
    deliberation_body: itemDeliberationBody,
    presentation: itemPresentation,
    first_observed_at: firstObservedAt,
    last_observed_at: lastObservedAt,
    archived_document: authorisedDocument,
  };
}

function earliest(values: Array<string | null>): string | null {
  const available = values.filter((value): value is string => Boolean(value));
  return available.sort((left, right) => left.localeCompare(right))[0] ?? null;
}

function latest(values: Array<string | null>): string | null {
  const available = values.filter((value): value is string => Boolean(value));
  return available.sort((left, right) => right.localeCompare(left))[0] ?? null;
}

export const DELIBERE_ARCHIVE_ITEMS: DeliberaArchiveItem[] = (
  Array.isArray(rawArchive.items) ? rawArchive.items : []
)
  .map(normalizeItem)
  .filter((item): item is DeliberaArchiveItem => item !== null);

export const DELIBERE_ARCHIVE_SUMMARY = {
  generated_at: text(rawArchive.generated_at),
  source: text(rawArchive.source) ?? "Albo Pretorio Comune di Lamezia Terme",
  source_url:
    text(rawArchive.source_url) ??
    "https://albo.tinnvision.cloud/?ente=00301390795",
  verification_status:
    text(rawArchive.verification_status) ?? "verification_required",
  coverage: {
    first_observed_at: earliest(
      DELIBERE_ARCHIVE_ITEMS.map((item) => item.first_observed_at),
    ),
    last_observed_at: latest(
      DELIBERE_ARCHIVE_ITEMS.map((item) => item.last_observed_at),
    ),
    first_act_date: earliest(
      DELIBERE_ARCHIVE_ITEMS.map(
        (item) => item.act_date ?? item.publication_start,
      ),
    ),
    last_act_date: latest(
      DELIBERE_ARCHIVE_ITEMS.map(
        (item) => item.act_date ?? item.publication_start,
      ),
    ),
  },
  counts: {
    total: DELIBERE_ARCHIVE_ITEMS.length,
    giunta: DELIBERE_ARCHIVE_ITEMS.filter(
      (item) => item.deliberation_body === "giunta",
    ).length,
    consiglio: DELIBERE_ARCHIVE_ITEMS.filter(
      (item) => item.deliberation_body === "consiglio",
    ).length,
    archived_documents: DELIBERE_ARCHIVE_ITEMS.filter(
      (item) => item.archived_document !== null,
    ).length,
  },
  known_limits: textArray(rawArchive.known_limits),
};
