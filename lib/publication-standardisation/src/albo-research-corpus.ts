import {
  classifyProcurementRecord,
  type ProcurementClassificationStatus,
  type ProcurementRelevance,
  type ProcurementTaxonomyAssignment,
} from "./procurement";

export const ALBO_RESEARCH_CORPUS_SCHEMA_VERSION =
  "albo-research-corpus.v1" as const;
export const ALBO_RESEARCH_CORPUS_DATA_PATH =
  "data/public/research/albo-canonical-current.json" as const;

export interface AlboResearchSourceItem {
  id?: string | number;
  public_id?: string;
  source?: string;
  source_url?: string;
  retrieved_at?: string;
  publication_number?: string;
  publication_start?: string | null;
  publication_end?: string | null;
  office?: string | null;
  act_type?: string | null;
  act_number?: string | null;
  act_date?: string | null;
  content_hash?: string | null;
  subject?: string | null;
  document_url?: string | null;
  public_note?: string | null;
  verification_status?: string;
  privacy_risk?: string;
  public_visibility?: string;
  classification?: {
    dictionary_version?: string | null;
    sector?: { id?: string | null; confidence?: string | null } | null;
    act_category?: { id?: string | null; confidence?: string | null } | null;
  } | null;
  presentation?: {
    display_title?: string | null;
    action_id?: string | null;
    action_label?: string | null;
    area_theme?: {
      theme_id?: string | null;
      confidence?: string | null;
      taxonomy_version?: string | null;
    } | null;
  } | null;
}

export interface AlboResearchSourceSnapshot {
  generated_at?: string;
  source?: string;
  source_url?: string;
  retrieved_at?: string;
  verification_status?: string;
  known_limits?: string[];
  counts?: {
    acquired?: number;
    publishable?: number;
    minimised?: number;
    metadata_only?: number;
    excluded?: number;
  };
  items?: AlboResearchSourceItem[];
}

export interface CanonicalAlboResearchRecord {
  canonical_id: string;
  record_kind: "publication";
  identity_status: "source_id" | "publication_number" | "fallback_unstable";
  source_record: {
    id: string | number | null;
    public_id: string | null;
    publication_number: string | null;
    publication_start: string | null;
    publication_end: string | null;
    office: string | null;
    act_type: string | null;
    act_number: string | null;
    act_date: string | null;
    subject: string | null;
    display_title: string | null;
    document_url: string | null;
    public_note: string | null;
  };
  provenance: {
    source: string | null;
    source_url: string | null;
    retrieved_at: string | null;
    content_hash: string | null;
    verification_status: string | null;
    public_visibility: string | null;
    privacy_risk: string | null;
    input_boundary: "public_safe_snapshot";
  };
  taxonomy: {
    existing: {
      dictionary_version: string | null;
      sector_id: string | null;
      sector_confidence: string | null;
      act_category_id: string | null;
      act_category_confidence: string | null;
      area_theme_id: string | null;
      area_theme_confidence: string | null;
      area_theme_taxonomy_version: string | null;
      presentation_action_id: string | null;
      presentation_action_label: string | null;
    };
    procurement: ProcurementTaxonomyAssignment;
  };
  identifiers: {
    cigs: string[];
    cups: string[];
  };
  public_projection_eligible: boolean;
  research_status: {
    taxonomy_decision: ProcurementClassificationStatus;
    procurement_relevance: ProcurementRelevance;
    source_detail: "public_safe_full" | "public_safe_minimised" | "metadata_only" | "excluded" | "unknown";
  };
}

export interface AlboResearchCoverageLedger {
  source_records_declared: number | null;
  records_materialised: number;
  source_snapshot_reconciled: boolean | null;
  records_with_source_identity: number;
  records_with_fallback_identity: number;
  taxonomy_decided: number;
  taxonomy_coverage: number;
  public_projection_eligible: number;
  procurement_confirmed: number;
  procurement_possible: number;
  procurement_none: number;
  procurement_unknown: number;
  procurement_review_required: number;
  records_with_cig: number;
  records_with_cup: number;
  public_procurement_candidates: number;
  public_procurement_with_cig: number;
  public_procurement_unresolved: number;
  non_public_procurement_candidates: number;
  document_type_counts: Record<string, number>;
  administrative_action_counts: Record<string, number>;
  procurement_phase_counts: Record<string, number>;
}

export interface CanonicalAlboResearchCorpus {
  schema_version: typeof ALBO_RESEARCH_CORPUS_SCHEMA_VERSION;
  generated_at: string;
  source: {
    name: string;
    url: string | null;
    snapshot_generated_at: string | null;
    snapshot_retrieved_at: string | null;
    input_boundary: "public_safe_snapshot";
    known_limits: string[];
  };
  methodology: {
    taxonomy_required_for_every_materialised_record: true;
    implicit_unclassified_state_allowed: false;
    public_projection_requires_official_publishable_record: true;
    procurement_entity_materialisation_requires_cig_in_current_api: true;
  };
  coverage: AlboResearchCoverageLedger;
  records: CanonicalAlboResearchRecord[];
}

export function buildCanonicalAlboResearchCorpus(
  snapshot: AlboResearchSourceSnapshot,
): CanonicalAlboResearchCorpus {
  const items = snapshot.items ?? [];
  const records = items.map((item, index) => buildRecord(item, index));
  const sourceRecordsDeclared = finiteNonNegative(snapshot.counts?.acquired);
  const generatedAt = validDate(snapshot.generated_at)
    ? snapshot.generated_at!
    : validDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at!
      : new Date(0).toISOString();

  return {
    schema_version: ALBO_RESEARCH_CORPUS_SCHEMA_VERSION,
    generated_at: generatedAt,
    source: {
      name: cleanText(snapshot.source) || "Albo Pretorio Comune di Lamezia Terme",
      url: cleanText(snapshot.source_url) || null,
      snapshot_generated_at: validDate(snapshot.generated_at)
        ? snapshot.generated_at!
        : null,
      snapshot_retrieved_at: validDate(snapshot.retrieved_at)
        ? snapshot.retrieved_at!
        : null,
      input_boundary: "public_safe_snapshot",
      known_limits: uniqueStrings(snapshot.known_limits ?? []),
    },
    methodology: {
      taxonomy_required_for_every_materialised_record: true,
      implicit_unclassified_state_allowed: false,
      public_projection_requires_official_publishable_record: true,
      procurement_entity_materialisation_requires_cig_in_current_api: true,
    },
    coverage: buildCoverage(records, sourceRecordsDeclared),
    records,
  };
}

function buildRecord(
  item: AlboResearchSourceItem,
  index: number,
): CanonicalAlboResearchRecord {
  const identity = canonicalIdentity(item, index);
  const procurement = classifyProcurementRecord({
    subject: item.subject,
    act_type: item.act_type,
    office: item.office,
    presentation_action_id: item.presentation?.action_id,
  });
  const cigs = procurement.identifiers
    .filter((identifier) => identifier.type === "cig")
    .map((identifier) => identifier.value);
  const cups = procurement.identifiers
    .filter((identifier) => identifier.type === "cup")
    .map((identifier) => identifier.value);
  const publicVisibility = cleanText(item.public_visibility) || null;
  const verificationStatus = cleanText(item.verification_status) || null;

  return {
    canonical_id: identity.id,
    record_kind: "publication",
    identity_status: identity.status,
    source_record: {
      id: item.id ?? null,
      public_id: cleanText(item.public_id) || null,
      publication_number: cleanText(item.publication_number) || null,
      publication_start: cleanText(item.publication_start) || null,
      publication_end: cleanText(item.publication_end) || null,
      office: cleanText(item.office) || null,
      act_type: cleanText(item.act_type) || null,
      act_number: cleanText(item.act_number) || null,
      act_date: cleanText(item.act_date) || null,
      subject: cleanText(item.subject) || null,
      display_title: cleanText(item.presentation?.display_title) || null,
      document_url: cleanText(item.document_url) || null,
      public_note: cleanText(item.public_note) || null,
    },
    provenance: {
      source: cleanText(item.source) || null,
      source_url: cleanText(item.source_url) || null,
      retrieved_at: validDate(item.retrieved_at) ? item.retrieved_at! : null,
      content_hash: cleanText(item.content_hash) || null,
      verification_status: verificationStatus,
      public_visibility: publicVisibility,
      privacy_risk: cleanText(item.privacy_risk) || null,
      input_boundary: "public_safe_snapshot",
    },
    taxonomy: {
      existing: {
        dictionary_version: cleanText(item.classification?.dictionary_version) || null,
        sector_id: cleanText(item.classification?.sector?.id) || null,
        sector_confidence:
          cleanText(item.classification?.sector?.confidence) || null,
        act_category_id:
          cleanText(item.classification?.act_category?.id) || null,
        act_category_confidence:
          cleanText(item.classification?.act_category?.confidence) || null,
        area_theme_id: cleanText(item.presentation?.area_theme?.theme_id) || null,
        area_theme_confidence:
          cleanText(item.presentation?.area_theme?.confidence) || null,
        area_theme_taxonomy_version:
          cleanText(item.presentation?.area_theme?.taxonomy_version) || null,
        presentation_action_id:
          cleanText(item.presentation?.action_id) || null,
        presentation_action_label:
          cleanText(item.presentation?.action_label) || null,
      },
      procurement,
    },
    identifiers: { cigs, cups },
    public_projection_eligible:
      publicVisibility === "publishable" &&
      verificationStatus === "official_source_acquired",
    research_status: {
      taxonomy_decision: procurement.classification_status,
      procurement_relevance: procurement.relevance,
      source_detail: sourceDetail(publicVisibility),
    },
  };
}

function buildCoverage(
  records: readonly CanonicalAlboResearchRecord[],
  sourceRecordsDeclared: number | null,
): AlboResearchCoverageLedger {
  const procurementCandidates = records.filter((record) =>
    isProcurementCandidate(record.taxonomy.procurement.relevance),
  );
  const publicProcurementCandidates = procurementCandidates.filter(
    (record) => record.public_projection_eligible,
  );

  return {
    source_records_declared: sourceRecordsDeclared,
    records_materialised: records.length,
    source_snapshot_reconciled:
      sourceRecordsDeclared === null
        ? null
        : sourceRecordsDeclared === records.length,
    records_with_source_identity: records.filter(
      (record) => record.identity_status !== "fallback_unstable",
    ).length,
    records_with_fallback_identity: records.filter(
      (record) => record.identity_status === "fallback_unstable",
    ).length,
    taxonomy_decided: records.length,
    taxonomy_coverage:
      records.length === 0 ? 1 : records.length / records.length,
    public_projection_eligible: records.filter(
      (record) => record.public_projection_eligible,
    ).length,
    procurement_confirmed: countRelevance(records, "confirmed"),
    procurement_possible: countRelevance(records, "possible"),
    procurement_none: countRelevance(records, "none"),
    procurement_unknown: countRelevance(records, "unknown"),
    procurement_review_required: records.filter(
      (record) =>
        record.taxonomy.procurement.classification_status === "review_required",
    ).length,
    records_with_cig: records.filter((record) => record.identifiers.cigs.length > 0)
      .length,
    records_with_cup: records.filter((record) => record.identifiers.cups.length > 0)
      .length,
    public_procurement_candidates: publicProcurementCandidates.length,
    public_procurement_with_cig: publicProcurementCandidates.filter(
      (record) => record.identifiers.cigs.length > 0,
    ).length,
    public_procurement_unresolved: publicProcurementCandidates.filter(
      (record) => record.identifiers.cigs.length === 0,
    ).length,
    non_public_procurement_candidates: procurementCandidates.filter(
      (record) => !record.public_projection_eligible,
    ).length,
    document_type_counts: countValues(
      records.map((record) => record.taxonomy.procurement.document_type),
    ),
    administrative_action_counts: countValues(
      records.flatMap(
        (record) => record.taxonomy.procurement.administrative_actions,
      ),
    ),
    procurement_phase_counts: countValues(
      records.map((record) => record.taxonomy.procurement.phase),
    ),
  };
}

function canonicalIdentity(
  item: AlboResearchSourceItem,
  index: number,
): {
  id: string;
  status: CanonicalAlboResearchRecord["identity_status"];
} {
  const publicId = cleanText(item.public_id);
  if (publicId) return { id: publicId, status: "source_id" };
  const sourceId = typeof item.id === "string" ? cleanText(item.id) : "";
  if (sourceId) return { id: sourceId, status: "source_id" };
  if (typeof item.id === "number" && Number.isFinite(item.id)) {
    return { id: `albo-source-${item.id}`, status: "source_id" };
  }
  const publicationNumber = cleanText(item.publication_number);
  if (publicationNumber) {
    return {
      id: `albo-${publicationNumber.replace(/[^0-9A-Za-z]+/gu, "-")}`,
      status: "publication_number",
    };
  }
  return { id: `albo-unidentified-${index + 1}`, status: "fallback_unstable" };
}

function sourceDetail(
  publicVisibility: string | null,
): CanonicalAlboResearchRecord["research_status"]["source_detail"] {
  if (publicVisibility === "publishable") return "public_safe_full";
  if (
    publicVisibility === "publishable_with_minimisation" ||
    publicVisibility === "minimised"
  ) {
    return "public_safe_minimised";
  }
  if (publicVisibility === "metadata_only") return "metadata_only";
  if (
    publicVisibility === "do_not_publish" ||
    publicVisibility === "excluded"
  ) {
    return "excluded";
  }
  return "unknown";
}

function countRelevance(
  records: readonly CanonicalAlboResearchRecord[],
  relevance: ProcurementRelevance,
): number {
  return records.filter(
    (record) => record.taxonomy.procurement.relevance === relevance,
  ).length;
}

function isProcurementCandidate(relevance: ProcurementRelevance): boolean {
  return relevance === "confirmed" || relevance === "possible";
}

function countValues(values: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function finiteNonNegative(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function validDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

function cleanText(value: string | null | undefined): string {
  return value?.normalize("NFC").replace(/\s+/gu, " ").trim() ?? "";
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean)));
}
