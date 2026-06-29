import publicAlboLatest from "../../../../data/public/albo/latest.json";
import publicAlboDocumentsManifest from "../../../../data/public/albo/documents-manifest.json";
import { ALBO_OPERATIONAL_STATUS, type AlboStatusCounts } from "@/data/alboStatus";

export type AlboPublicVisibility =
  | "publishable"
  | "publishable_with_minimisation"
  | "metadata_only";

export type AlboPrivacyRisk = "low" | "medium" | "high";

export type AlboPublicRunItem = {
  id: string;
  source: string;
  source_url: string;
  retrieved_at: string;
  publication_number: string | null;
  publication_start: string | null;
  publication_end: string | null;
  office: string | null;
  act_type: string | null;
  act_number: string | null;
  act_date: string | null;
  subject: string;
  content_hash: string | null;
  verification_status: string;
  privacy_risk: AlboPrivacyRisk;
  public_visibility: AlboPublicVisibility;
  known_limits: string[];
  public_note: string | null;
};

type RawAlboPublicRunItem = Partial<AlboPublicRunItem> & {
  public_visibility?: string;
  privacy_risk?: string;
};

type RawAlboPublicLatest = {
  source: string;
  source_url: string;
  retrieved_at: string;
  verification_status: string;
  counts: AlboStatusCounts;
  known_limits: string[];
  items: RawAlboPublicRunItem[];
};

type RawArchivedAlboDocument = {
  id?: unknown;
  publication_number?: unknown;
  retrieved_at?: unknown;
  storage_path?: unknown;
  sha256?: unknown;
  size_bytes?: unknown;
  content_type?: unknown;
  verification_status?: unknown;
};

type RawAlboDocumentsManifest = {
  generated_at?: unknown;
  retrieved_at?: unknown;
  verification_status?: unknown;
  policy?: {
    eligibility?: unknown;
    max_size_bytes?: unknown;
    no_ocr?: unknown;
    no_pdf_parsing?: unknown;
    no_summaries?: unknown;
    no_rankings?: unknown;
  };
  counts?: {
    considered?: unknown;
    eligible?: unknown;
    archived?: unknown;
    skipped?: unknown;
    excluded?: unknown;
    human_review_required?: unknown;
  };
  documents?: RawArchivedAlboDocument[];
  warnings?: unknown;
};

export type AlboArchivedDocument = {
  id: string;
  publication_number: string;
  retrieved_at: string;
  storage_path: string;
  platform_path: string;
  sha256: string;
  size_bytes: number;
  content_type: string;
  verification_status: string;
};

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function arrayOfText(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isPublicVisibility(value: unknown): value is AlboPublicVisibility {
  return (
    value === "publishable" ||
    value === "publishable_with_minimisation" ||
    value === "metadata_only"
  );
}

function isPrivacyRisk(value: unknown): value is AlboPrivacyRisk {
  return value === "low" || value === "medium" || value === "high";
}

function normalizePublicRunItem(item: RawAlboPublicRunItem): AlboPublicRunItem | null {
  if (
    typeof item.id !== "string" ||
    typeof item.source !== "string" ||
    typeof item.source_url !== "string" ||
    typeof item.retrieved_at !== "string" ||
    typeof item.verification_status !== "string" ||
    !isPrivacyRisk(item.privacy_risk) ||
    !isPublicVisibility(item.public_visibility)
  ) {
    return null;
  }

  return {
    id: item.id,
    source: item.source,
    source_url: item.source_url,
    retrieved_at: item.retrieved_at,
    publication_number: nullableText(item.publication_number),
    publication_start: nullableText(item.publication_start),
    publication_end: nullableText(item.publication_end),
    office: nullableText(item.office),
    act_type: nullableText(item.act_type),
    act_number: nullableText(item.act_number),
    act_date: nullableText(item.act_date),
    subject: nullableText(item.subject) ?? "Oggetto non disponibile nel layer pubblico.",
    content_hash: nullableText(item.content_hash),
    verification_status: item.verification_status,
    privacy_risk: item.privacy_risk,
    public_visibility: item.public_visibility,
    known_limits: arrayOfText(item.known_limits),
    public_note: nullableText(item.public_note),
  };
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function platformDocumentPath(storagePath: string): string {
  const normalized = storagePath.replace(/\\/g, "/");
  return normalized.startsWith("data/public/")
    ? `/${normalized}`
    : normalized;
}

function normalizeArchivedDocument(document: RawArchivedAlboDocument): AlboArchivedDocument | null {
  const id = nullableText(document.id);
  const publicationNumber = nullableText(document.publication_number);
  const retrievedAt = nullableText(document.retrieved_at);
  const storagePath = nullableText(document.storage_path);
  const sha256 = nullableText(document.sha256);
  const contentType = nullableText(document.content_type);
  const verificationStatus = nullableText(document.verification_status);
  const sizeBytes = numberValue(document.size_bytes);

  if (!id || !publicationNumber || !retrievedAt || !storagePath || !sha256 || !contentType || !verificationStatus) {
    return null;
  }

  return {
    id,
    publication_number: publicationNumber,
    retrieved_at: retrievedAt,
    storage_path: storagePath,
    platform_path: platformDocumentPath(storagePath),
    sha256,
    size_bytes: sizeBytes,
    content_type: contentType,
    verification_status: verificationStatus,
  };
}

const latest = publicAlboLatest as RawAlboPublicLatest;
const documentsManifest = publicAlboDocumentsManifest as RawAlboDocumentsManifest;

export const ALBO_PUBLIC_RUN_ITEMS: AlboPublicRunItem[] = latest.items
  .map(normalizePublicRunItem)
  .filter((item): item is AlboPublicRunItem => item !== null);

export const ALBO_PUBLIC_RUN_SUMMARY = {
  source: latest.source,
  source_url: latest.source_url,
  retrieved_at: latest.retrieved_at,
  verification_status: latest.verification_status,
  counts: latest.counts,
  known_limits: latest.known_limits,
  official_albo_disclaimer: ALBO_OPERATIONAL_STATUS.official_albo_disclaimer,
};

export const ALBO_DOCUMENTS_MANIFEST = {
  generated_at: nullableText(documentsManifest.generated_at),
  retrieved_at: nullableText(documentsManifest.retrieved_at),
  verification_status: nullableText(documentsManifest.verification_status) ?? "verification_required",
  policy: {
    eligibility: nullableText(documentsManifest.policy?.eligibility) ?? "PDF archiviati solo quando risultano ufficiali e a basso rischio.",
    max_size_bytes: numberValue(documentsManifest.policy?.max_size_bytes),
    no_ocr: documentsManifest.policy?.no_ocr === true,
    no_pdf_parsing: documentsManifest.policy?.no_pdf_parsing === true,
    no_summaries: documentsManifest.policy?.no_summaries === true,
    no_rankings: documentsManifest.policy?.no_rankings === true,
  },
  counts: {
    considered: numberValue(documentsManifest.counts?.considered),
    eligible: numberValue(documentsManifest.counts?.eligible),
    archived: numberValue(documentsManifest.counts?.archived),
    skipped: numberValue(documentsManifest.counts?.skipped),
    excluded: numberValue(documentsManifest.counts?.excluded),
    human_review_required: numberValue(documentsManifest.counts?.human_review_required),
  },
  warnings: arrayOfText(documentsManifest.warnings),
  documents: (documentsManifest.documents ?? [])
    .map(normalizeArchivedDocument)
    .filter((document): document is AlboArchivedDocument => document !== null),
};

export const ALBO_ARCHIVED_DOCUMENTS_BY_ID = new Map(
  ALBO_DOCUMENTS_MANIFEST.documents.map((document) => [document.id, document]),
);

export const ALBO_PUBLIC_VISIBILITY_LABELS: Record<AlboPublicVisibility, string> = {
  publishable: "Pubblicabile",
  publishable_with_minimisation: "Minimizzato",
  metadata_only: "Solo metadato",
};

export const ALBO_PRIVACY_RISK_LABELS: Record<AlboPrivacyRisk, string> = {
  low: "rischio basso",
  medium: "rischio medio",
  high: "rischio alto",
};

function searchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function alboPublicSearchText(item: AlboPublicRunItem): string {
  return searchText([
    item.publication_number,
    item.publication_start,
    item.publication_end,
    item.office,
    item.act_type,
    item.act_number,
    item.act_date,
    item.subject,
    item.public_visibility,
    item.privacy_risk,
  ]
    .filter(Boolean)
    .join(" "));
}
