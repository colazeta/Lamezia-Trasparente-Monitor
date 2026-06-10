import type { CivicVerificationStatus } from "./civicGraph";

export type CivicEvidenceSourceType =
  | "primary"
  | "secondary"
  | "internal"
  | "missing";

export type CivicEvidenceQuality =
  | "direct_document"
  | "corroborated_document"
  | "partial_document"
  | "automated_parse"
  | "missing_document";

export type CivicRelationSensitivity =
  | "standard"
  | "nominal_vote"
  | "attributed_statement"
  | "attendance"
  | "signed_proposal";

export type CivicAutomatedReliability = "high" | "medium" | "low" | "unknown";

export type CivicEvidenceReasonCode =
  | "verified_primary_source"
  | "verified_documented_source"
  | "missing_source"
  | "explicit_unverified_status_required"
  | "verification_status_not_verified"
  | "primary_source_required"
  | "punctual_source_required"
  | "secondary_source_partial"
  | "internal_source_to_verify"
  | "automated_parse_partial"
  | "corrected_or_superseded";

export interface CivicEvidenceSource {
  type: CivicEvidenceSourceType;
  id?: string;
  url?: string;
  label?: string;
}

export interface CivicEvidenceInput {
  verificationStatus?: CivicVerificationStatus;
  sources?: readonly CivicEvidenceSource[];
  quality?: CivicEvidenceQuality;
  automatedReliability?: CivicAutomatedReliability;
  supersededById?: string;
  correctedById?: string;
}

export interface CivicEvidenceAssessment {
  verificationStatus: CivicVerificationStatus;
  effectiveStatus: CivicVerificationStatus;
  canShowAsVerified: boolean;
  requiresExplicitStatus: boolean;
  strongestSourceType: CivicEvidenceSourceType;
  reasonCodes: CivicEvidenceReasonCode[];
}

const SOURCE_STRENGTH: Record<CivicEvidenceSourceType, number> = {
  missing: 0,
  internal: 1,
  secondary: 2,
  primary: 3,
};

const SENSITIVE_RELATIONS_REQUIRING_PRIMARY: ReadonlySet<CivicRelationSensitivity> =
  new Set(["nominal_vote", "attendance", "signed_proposal"]);

const TERMINAL_NON_CURRENT_STATUSES: ReadonlySet<CivicVerificationStatus> =
  new Set(["corrected", "superseded"]);

export function assessCivicNodeEvidence(
  evidence: CivicEvidenceInput,
): CivicEvidenceAssessment {
  return assessCivicEvidence(evidence, "standard");
}

export function assessCivicRelationEvidence(
  evidence: CivicEvidenceInput,
  sensitivity: CivicRelationSensitivity = "standard",
): CivicEvidenceAssessment {
  return assessCivicEvidence(evidence, sensitivity);
}

export function canShowCivicNodeAsVerified(
  evidence: CivicEvidenceInput,
): boolean {
  return assessCivicNodeEvidence(evidence).canShowAsVerified;
}

export function canShowCivicRelationAsVerified(
  evidence: CivicEvidenceInput,
  sensitivity: CivicRelationSensitivity = "standard",
): boolean {
  return assessCivicRelationEvidence(evidence, sensitivity).canShowAsVerified;
}

export function strongestCivicEvidenceSourceType(
  sources: readonly CivicEvidenceSource[] | undefined,
): CivicEvidenceSourceType {
  return (sources ?? []).reduce<CivicEvidenceSourceType>(
    (strongest, source) => {
      if (SOURCE_STRENGTH[source.type] > SOURCE_STRENGTH[strongest]) {
        return source.type;
      }

      return strongest;
    },
    "missing",
  );
}

function assessCivicEvidence(
  evidence: CivicEvidenceInput,
  sensitivity: CivicRelationSensitivity,
): CivicEvidenceAssessment {
  const declaredStatus = evidence.verificationStatus ?? "to_verify";
  const strongestSourceType = strongestCivicEvidenceSourceType(
    evidence.sources,
  );
  const hasPunctualSource = hasCivicPunctualSource(evidence.sources);
  const reasonCodes: CivicEvidenceReasonCode[] = [];
  let effectiveStatus = declaredStatus;
  let canShowAsVerified = declaredStatus === "verified";
  let requiresExplicitStatus = strongestSourceType === "missing";

  if (TERMINAL_NON_CURRENT_STATUSES.has(declaredStatus)) {
    reasonCodes.push("corrected_or_superseded");
    return buildAssessment({
      verificationStatus: declaredStatus,
      effectiveStatus: declaredStatus,
      canShowAsVerified: false,
      requiresExplicitStatus,
      strongestSourceType,
      reasonCodes,
    });
  }

  if (strongestSourceType === "missing") {
    reasonCodes.push("missing_source", "explicit_unverified_status_required");
    effectiveStatus = "missing_source";
    canShowAsVerified = false;
  }

  if (declaredStatus !== "verified") {
    reasonCodes.push("verification_status_not_verified");
    canShowAsVerified = false;
  }

  if (strongestSourceType === "internal") {
    reasonCodes.push("internal_source_to_verify");
    effectiveStatus = lessVerifiedStatus(effectiveStatus, "to_verify");
    canShowAsVerified = false;
  }

  if (evidence.quality === "automated_parse" || evidence.automatedReliability) {
    reasonCodes.push("automated_parse_partial");
    if (evidence.automatedReliability !== "high") {
      effectiveStatus = lessVerifiedStatus(effectiveStatus, "partial");
      canShowAsVerified = false;
    }
  }

  if (
    strongestSourceType === "secondary" &&
    sensitivity === "signed_proposal"
  ) {
    reasonCodes.push("secondary_source_partial");
    effectiveStatus = lessVerifiedStatus(effectiveStatus, "partial");
    canShowAsVerified = false;
  }

  if (requiresPrimarySource(sensitivity) && strongestSourceType !== "primary") {
    reasonCodes.push("primary_source_required");
    effectiveStatus = lessVerifiedStatus(
      effectiveStatus,
      strongestSourceType === "missing" ? "missing_source" : "partial",
    );
    canShowAsVerified = false;
  }

  if (
    sensitivity === "attributed_statement" &&
    strongestSourceType === "missing"
  ) {
    effectiveStatus = lessVerifiedStatus(effectiveStatus, "to_verify");
    canShowAsVerified = false;
  }

  if (sensitivity === "nominal_vote" && !hasPunctualSource) {
    reasonCodes.push("punctual_source_required");
    effectiveStatus = lessVerifiedStatus(effectiveStatus, "missing_source");
    canShowAsVerified = false;
  }

  if (canShowAsVerified) {
    reasonCodes.push(
      strongestSourceType === "primary"
        ? "verified_primary_source"
        : "verified_documented_source",
    );
    effectiveStatus = "verified";
    requiresExplicitStatus = false;
  }

  return buildAssessment({
    verificationStatus: declaredStatus,
    effectiveStatus,
    canShowAsVerified,
    requiresExplicitStatus,
    strongestSourceType,
    reasonCodes,
  });
}

function hasCivicPunctualSource(
  sources: readonly CivicEvidenceSource[] | undefined,
): boolean {
  return (sources ?? []).some((source) => {
    if (source.type === "missing") {
      return false;
    }

    return Boolean(source.id?.trim() || source.url?.trim());
  });
}

function requiresPrimarySource(sensitivity: CivicRelationSensitivity): boolean {
  return SENSITIVE_RELATIONS_REQUIRING_PRIMARY.has(sensitivity);
}

function lessVerifiedStatus(
  current: CivicVerificationStatus,
  fallback: CivicVerificationStatus,
): CivicVerificationStatus {
  if (current === "missing_source" || fallback === "missing_source") {
    return "missing_source";
  }

  if (current === "to_verify" || fallback === "to_verify") {
    return "to_verify";
  }

  if (current === "partial" || fallback === "partial") {
    return "partial";
  }

  return fallback;
}

function buildAssessment(
  assessment: CivicEvidenceAssessment,
): CivicEvidenceAssessment {
  return {
    ...assessment,
    reasonCodes: uniqueReasonCodes(assessment.reasonCodes),
  };
}

function uniqueReasonCodes(
  reasonCodes: readonly CivicEvidenceReasonCode[],
): CivicEvidenceReasonCode[] {
  return [...new Set(reasonCodes)];
}
