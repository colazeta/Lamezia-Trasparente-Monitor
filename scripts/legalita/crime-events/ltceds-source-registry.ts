import { createHash } from "node:crypto";

export const LTCEDS_SOURCE_AUTHORITY_TYPES = [
  "judicial_primary",
  "law_enforcement_primary",
  "public_authority_primary",
  "news_agency",
  "press_secondary",
  "academic_archive",
  "other",
] as const;

export type LtcedsSourceAuthorityType =
  (typeof LTCEDS_SOURCE_AUTHORITY_TYPES)[number];

export const LTCEDS_ACQUISITION_MODES = [
  "api",
  "rss",
  "sitemap",
  "html_listing",
  "structured_download",
  "manual",
  "archive",
] as const;

export type LtcedsAcquisitionMode = (typeof LTCEDS_ACQUISITION_MODES)[number];

export const LTCEDS_CONTENT_MODES = [
  "structured",
  "semi_structured",
  "narrative",
  "aggregate",
] as const;

export type LtcedsContentMode = (typeof LTCEDS_CONTENT_MODES)[number];

export const LTCEDS_EVIDENCE_ROLES = [
  "occurrence_primary",
  "corroboration",
  "discovery_only",
  "context_only",
] as const;

export type LtcedsEvidenceRole = (typeof LTCEDS_EVIDENCE_ROLES)[number];

export const LTCEDS_CANDIDATE_POLICIES = [
  "automatic",
  "human_gate",
  "disabled",
] as const;

export type LtcedsCandidatePolicy = (typeof LTCEDS_CANDIDATE_POLICIES)[number];

export const LTCEDS_PUBLICATION_SUPPORT = [
  "primary_possible",
  "corroboration_only",
  "discovery_only",
  "context_only",
] as const;

export type LtcedsPublicationSupport =
  (typeof LTCEDS_PUBLICATION_SUPPORT)[number];

export const LTCEDS_REUSE_STATUSES = [
  "open_reuse",
  "public_access",
  "manual_review",
  "unknown",
] as const;

export type LtcedsReuseStatus = (typeof LTCEDS_REUSE_STATUSES)[number];

export type LtcedsRiskLevel = "low" | "medium" | "high";

export interface LtcedsSourceDefinition {
  sourceId: string;
  name: string;
  authorityType: LtcedsSourceAuthorityType;
  acquisitionMode: LtcedsAcquisitionMode;
  contentMode: LtcedsContentMode;
  evidenceRole: LtcedsEvidenceRole;
  candidatePolicy: LtcedsCandidatePolicy;
  publicationSupport: LtcedsPublicationSupport;
  reuseStatus: LtcedsReuseStatus;
  personalDataRisk: LtcedsRiskLevel;
  reputationalRisk: LtcedsRiskLevel;
  requiresCorroboration: boolean;
  limitations: readonly string[];
}

export const LTCEDS_CANDIDATE_KINDS = [
  "incident_report",
  "press_release",
  "judicial_document",
  "news_article",
  "aggregate_report",
  "historical_source",
  "non_event_context",
] as const;

export type LtcedsCandidateKind = (typeof LTCEDS_CANDIDATE_KINDS)[number];

export const LTCEDS_CANDIDATE_RESOLUTION_STATES = [
  "new",
  "extracted",
  "needs_review",
  "linked_to_event",
  "linked_to_cluster",
  "rejected_duplicate",
  "rejected_non_event",
] as const;

export type LtcedsCandidateResolutionState =
  (typeof LTCEDS_CANDIDATE_RESOLUTION_STATES)[number];

export const LTCEDS_ASSERTION_ROLES = [
  "occurrence_date",
  "occurrence_location",
  "offence_classification",
  "event_count",
  "arrest_date",
  "arrest_location",
  "search_date",
  "search_location",
  "discovery_date",
  "discovery_location",
  "procedural_status",
  "other",
] as const;

export type LtcedsAssertionRole = (typeof LTCEDS_ASSERTION_ROLES)[number];

export type LtcedsAssertionBasis =
  | "source_stated"
  | "structured_field"
  | "extracted"
  | "editorial_review";

export interface LtcedsCandidateAssertion {
  role: LtcedsAssertionRole;
  value: string;
  basis: LtcedsAssertionBasis;
  sourceLocator?: string | null;
}

export interface LtcedsCandidateEnvelope {
  candidateKey: string;
  sourceId: string;
  sourceRecordId: string | null;
  canonicalUrl: string | null;
  publishedAt: string | null;
  retrievedAt: string;
  contentSha256: string;
  candidateKind: LtcedsCandidateKind;
  claimedEventCount: number | null;
  resolutionState: LtcedsCandidateResolutionState;
  assertions: LtcedsCandidateAssertion[];
}

export interface BuildLtcedsCandidateInput {
  source: LtcedsSourceDefinition;
  sourceRecordId?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  retrievedAt: string;
  content: string | Uint8Array;
  candidateKind: LtcedsCandidateKind;
  claimedEventCount?: number | null;
  assertions?: readonly LtcedsCandidateAssertion[];
}

export type LtcedsSourceDisposition =
  | "disabled"
  | "human_gate"
  | "automatic_candidate"
  | "discovery_only"
  | "context_only";

export type LtcedsCardinalityPlan =
  | "no_event"
  | "unresolved"
  | "single_event_possible"
  | "individual_resolution_possible"
  | "event_cluster_required"
  | "mixed_resolved_plus_cluster_required";

const TRACKING_QUERY_PARAMETERS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "mc_cid",
  "mc_eid",
  "msclkid",
]);

const PRIMARY_AUTHORITY_TYPES = new Set<LtcedsSourceAuthorityType>([
  "judicial_primary",
  "law_enforcement_primary",
  "public_authority_primary",
]);

const PROCEDURAL_ASSERTION_ROLES = new Set<LtcedsAssertionRole>([
  "arrest_date",
  "arrest_location",
  "search_date",
  "search_location",
  "discovery_date",
  "discovery_location",
  "procedural_status",
]);

const OCCURRENCE_ASSERTION_ROLES = new Set<LtcedsAssertionRole>([
  "occurrence_date",
  "occurrence_location",
  "offence_classification",
]);

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function assertValidDateLike(value: string | null, label: string): void {
  if (value === null) return;
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be a parseable date/date-time`);
  }
}

export function canonicalizeLtcedsSourceUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("LTCEDS source URLs must use http or https");
  }
  if (url.username || url.password) {
    throw new Error("LTCEDS source URLs must not contain credentials");
  }

  url.hash = "";

  const kept = [...url.searchParams.entries()]
    .filter(([key]) => {
      const lowered = key.toLowerCase();
      return (
        !lowered.startsWith("utm_") &&
        !TRACKING_QUERY_PARAMETERS.has(lowered)
      );
    })
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      const keyOrder = leftKey.localeCompare(rightKey);
      return keyOrder !== 0 ? keyOrder : leftValue.localeCompare(rightValue);
    });

  url.search = "";
  for (const [key, value] of kept) url.searchParams.append(key, value);

  return url.toString();
}

export function sha256LtcedsContent(content: string | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

export function buildLtcedsCandidateKey(input: {
  sourceId: string;
  sourceRecordId?: string | null;
  canonicalUrl?: string | null;
}): string {
  const sourceId = nonEmpty(input.sourceId);
  if (!sourceId) throw new Error("sourceId is required");

  const sourceRecordId = nonEmpty(input.sourceRecordId);
  const canonicalUrl = nonEmpty(input.canonicalUrl);
  if (!sourceRecordId && !canonicalUrl) {
    throw new Error("sourceRecordId or canonicalUrl is required");
  }

  // A source-native record identifier is preferred because URLs can move.
  // Retrieval time, content hash and semantic classification are deliberately
  // excluded: they may change while the observed source record remains the same.
  const locator = sourceRecordId
    ? `record:${sourceRecordId}`
    : `url:${canonicalUrl}`;
  const digest = createHash("sha256")
    .update(JSON.stringify([sourceId, locator]))
    .digest("hex");
  return `cand_${digest}`;
}

export function evaluateLtcedsSourceDisposition(
  source: LtcedsSourceDefinition,
): LtcedsSourceDisposition {
  if (source.candidatePolicy === "disabled") return "disabled";
  if (
    source.personalDataRisk === "high" ||
    source.reputationalRisk === "high" ||
    source.candidatePolicy === "human_gate"
  ) {
    return "human_gate";
  }
  if (
    source.evidenceRole === "context_only" ||
    source.publicationSupport === "context_only"
  ) {
    return "context_only";
  }
  if (
    source.evidenceRole === "discovery_only" ||
    source.publicationSupport === "discovery_only"
  ) {
    return "discovery_only";
  }
  return "automatic_candidate";
}

export function sourceMaySolelySupportPublicEvent(
  source: LtcedsSourceDefinition,
): boolean {
  return (
    source.publicationSupport === "primary_possible" &&
    PRIMARY_AUTHORITY_TYPES.has(source.authorityType) &&
    source.candidatePolicy !== "disabled" &&
    source.personalDataRisk !== "high" &&
    source.reputationalRisk !== "high" &&
    !source.requiresCorroboration
  );
}

export function isOccurrenceAssertion(
  assertion: LtcedsCandidateAssertion,
): boolean {
  return OCCURRENCE_ASSERTION_ROLES.has(assertion.role);
}

export function isProceduralOnlyCandidate(
  candidate: Pick<LtcedsCandidateEnvelope, "candidateKind" | "assertions">,
): boolean {
  if (candidate.candidateKind === "non_event_context") return false;
  return (
    candidate.assertions.length > 0 &&
    candidate.assertions.every((assertion) =>
      PROCEDURAL_ASSERTION_ROLES.has(assertion.role),
    )
  );
}

export function planLtcedsCandidateCardinality(
  candidate: Pick<
    LtcedsCandidateEnvelope,
    "candidateKind" | "claimedEventCount"
  >,
  individuallyResolvedItems: number,
): LtcedsCardinalityPlan {
  if (!Number.isInteger(individuallyResolvedItems) || individuallyResolvedItems < 0) {
    throw new Error("individuallyResolvedItems must be a non-negative integer");
  }
  if (candidate.candidateKind === "non_event_context") return "no_event";

  const claimed = candidate.claimedEventCount;
  if (claimed === null) {
    if (individuallyResolvedItems === 0) return "unresolved";
    return individuallyResolvedItems === 1
      ? "single_event_possible"
      : "individual_resolution_possible";
  }

  if (!Number.isInteger(claimed) || claimed < 1) {
    throw new Error("claimedEventCount must be a positive integer or null");
  }
  if (individuallyResolvedItems > claimed) {
    throw new Error(
      "individuallyResolvedItems cannot exceed the source-claimed event count",
    );
  }
  if (claimed === 1) {
    return individuallyResolvedItems === 1
      ? "single_event_possible"
      : "unresolved";
  }
  if (individuallyResolvedItems === 0) return "event_cluster_required";
  if (individuallyResolvedItems < claimed) {
    return "mixed_resolved_plus_cluster_required";
  }
  return "individual_resolution_possible";
}

export function buildLtcedsCandidate(
  input: BuildLtcedsCandidateInput,
): LtcedsCandidateEnvelope {
  const sourceId = nonEmpty(input.source.sourceId);
  if (!sourceId) throw new Error("source.sourceId is required");

  const sourceRecordId = nonEmpty(input.sourceRecordId);
  const rawUrl = nonEmpty(input.url);
  const canonicalUrl = rawUrl ? canonicalizeLtcedsSourceUrl(rawUrl) : null;
  if (!sourceRecordId && !canonicalUrl) {
    throw new Error("sourceRecordId or url is required");
  }

  const retrievedAt = nonEmpty(input.retrievedAt);
  if (!retrievedAt) throw new Error("retrievedAt is required");
  assertValidDateLike(retrievedAt, "retrievedAt");

  const publishedAt = nonEmpty(input.publishedAt);
  assertValidDateLike(publishedAt, "publishedAt");

  const claimedEventCount = input.claimedEventCount ?? null;
  if (
    claimedEventCount !== null &&
    (!Number.isInteger(claimedEventCount) || claimedEventCount < 1)
  ) {
    throw new Error("claimedEventCount must be a positive integer or null");
  }

  const assertions = (input.assertions ?? []).map((assertion) => ({
    ...assertion,
    sourceLocator: assertion.sourceLocator ?? null,
  }));

  return {
    candidateKey: buildLtcedsCandidateKey({
      sourceId,
      sourceRecordId,
      canonicalUrl,
    }),
    sourceId,
    sourceRecordId,
    canonicalUrl,
    publishedAt,
    retrievedAt,
    contentSha256: sha256LtcedsContent(input.content),
    candidateKind: input.candidateKind,
    claimedEventCount,
    resolutionState:
      input.candidateKind === "non_event_context"
        ? "rejected_non_event"
        : evaluateLtcedsSourceDisposition(input.source) === "human_gate"
          ? "needs_review"
          : "new",
    assertions,
  };
}
