import publicAlboLatest from "../../../../data/public/albo/latest.json";
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
    verification_status: item.verification_status,
    privacy_risk: item.privacy_risk,
    public_visibility: item.public_visibility,
    known_limits: arrayOfText(item.known_limits),
    public_note: nullableText(item.public_note),
  };
}

const latest = publicAlboLatest as RawAlboPublicLatest;

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

export function alboPublicSearchText(item: AlboPublicRunItem): string {
  return [
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
    .join(" ")
    .toLowerCase();
}
