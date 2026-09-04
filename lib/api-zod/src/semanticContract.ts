import * as z from "zod/v4";

export const SEMANTIC_ENTITY_TYPES = [
  "Person",
  "Organization",
  "PublicOrganization",
  "PrivateOrganization",
  "Place",
  "Asset",
  "Project",
  "ProcurementProcess",
  "PublicContract",
  "Event",
  "InformationResource",
  "AdministrativeAct",
  "Dataset",
  "Indicator",
  "TransparencyObligation",
  "TransparencyResource",
] as const;

export const SEMANTIC_RECORD_TYPES = [
  "Source",
  "SourceRecord",
  "Statement",
  "Identifier",
  "Distribution",
] as const;

export const SEMANTIC_CANONICAL_TARGET_TYPES = [
  ...SEMANTIC_ENTITY_TYPES,
  ...SEMANTIC_RECORD_TYPES,
] as const;

export const SEMANTIC_ASSOCIATION_TYPES = [
  "RoleAssignment",
  "EventParticipation",
  "Ownership",
  "ProcurementParticipation",
  "ProjectParticipation",
  "AssetStateAssertion",
  "AssetMeasure",
  "EntityMention",
  "EvidenceLink",
  "IndicatorObservation",
  "EntityResolutionDecision",
] as const;

export const SEMANTIC_ENTITY_RESOLUTION_STATUSES = [
  "resolved_by_qualified_identifier",
  "resolved_by_authoritative_context",
  "resolved_after_editorial_review",
  "possible_match",
  "unresolved",
  "rejected_match",
] as const;

export const SEMANTIC_RELATION_ASSERTION_STATUSES = [
  "source_explicit",
  "deterministic_identifier_link",
  "deterministic_rule",
  "editorially_confirmed",
  "candidate",
  "mention_only",
  "unresolved",
] as const;

export const SEMANTIC_EVIDENCE_MATCH_BASES = [
  "qualified_identifier_exact",
  "source_explicit_reference",
  "deterministic_rule",
  "editorial_review",
] as const;

export const SEMANTIC_DISALLOWED_CANONICAL_MATCH_BASES = [
  "topic_only",
  "generic_text_similarity",
  "pnrr_keyword_only",
] as const;

export const SEMANTIC_INVARIANTS = [
  "no_fictional_seed_as_evidence",
  "no_name_only_entity_merge",
  "no_status_to_history_inference",
  "no_text_only_project_reconciliation",
  "source_records_preserved_after_canonicalization",
  "observation_provenance_preserved",
  "relation_and_identity_confidence_separate",
] as const;

export const SEMANTIC_FUTURE_EXPORTS = [
  "json",
  "jsonld",
  "rdf_turtle",
  "shacl",
] as const;

export const SEMANTIC_IDENTIFIER_SCHEMES = [
  "CUP",
  "CIG",
  "source_id",
  "tax_identifier",
] as const;

export const SEMANTIC_IDENTIFIER_SCOPES = [
  "global",
  "source_specific",
  "domain_qualified",
] as const;

export const SemanticEntityTypeSchema = z.enum(SEMANTIC_ENTITY_TYPES);
export const SemanticRecordTypeSchema = z.enum(SEMANTIC_RECORD_TYPES);
export const SemanticCanonicalTargetTypeSchema = z.enum(
  SEMANTIC_CANONICAL_TARGET_TYPES,
);
export const SemanticAssociationTypeSchema = z.enum(SEMANTIC_ASSOCIATION_TYPES);
export const SemanticEntityResolutionStatusSchema = z.enum(
  SEMANTIC_ENTITY_RESOLUTION_STATUSES,
);
export const SemanticRelationAssertionStatusSchema = z.enum(
  SEMANTIC_RELATION_ASSERTION_STATUSES,
);
export const SemanticEvidenceMatchBasisSchema = z.enum(
  SEMANTIC_EVIDENCE_MATCH_BASES,
);
export const SemanticDisallowedCanonicalMatchBasisSchema = z.enum(
  SEMANTIC_DISALLOWED_CANONICAL_MATCH_BASES,
);
export const SemanticInvariantSchema = z.enum(SEMANTIC_INVARIANTS);
export const SemanticFutureExportSchema = z.enum(SEMANTIC_FUTURE_EXPORTS);
export const SemanticIdentifierSchemeSchema = z.enum(
  SEMANTIC_IDENTIFIER_SCHEMES,
);
export const SemanticIdentifierScopeSchema = z.enum(SEMANTIC_IDENTIFIER_SCOPES);

export const SemanticAssociationDefinitionSchema = z.strictObject({
  type: SemanticAssociationTypeSchema,
  required_dimensions: z.array(z.string().min(1)).min(1),
  temporal: z.boolean(),
  source_statement_required: z.boolean(),
  requires_dated_event: z.boolean(),
  historical_event_implied: z.boolean(),
});

export const SemanticIdentifierPolicySchema = z.strictObject({
  scheme: SemanticIdentifierSchemeSchema,
  canonical_target_types: z.array(SemanticCanonicalTargetTypeSchema),
  scope: SemanticIdentifierScopeSchema,
  public_safety_review: z.boolean(),
});

export const SemanticContractSchema = z.strictObject({
  schema_version: z.literal("lt-semantic-contract.v0.2"),
  profile_version: z.literal("lt-semantic-profile.v0.2"),
  profile_path: z.literal("docs/architecture/semantic-profile.v0.2.yaml"),
  issue: z.literal(943),
  status: z.literal("runtime_candidate_validation"),
  runtime_public_surface: z.literal(false),
  database_migration_authorized: z.literal(false),
  entity_types: z.array(SemanticEntityTypeSchema).min(1),
  record_types: z.array(SemanticRecordTypeSchema).min(1),
  associations: z.array(SemanticAssociationDefinitionSchema).min(1),
  status_axes: z.strictObject({
    independent: z.literal(true),
    entity_resolution_statuses: z
      .array(SemanticEntityResolutionStatusSchema)
      .min(1),
    relation_assertion_statuses: z
      .array(SemanticRelationAssertionStatusSchema)
      .min(1),
  }),
  evidence_link_policy: z.strictObject({
    allowed_match_bases: z.array(SemanticEvidenceMatchBasisSchema).min(1),
    disallowed_canonical_link_bases: z
      .array(SemanticDisallowedCanonicalMatchBasisSchema)
      .min(1),
    text_only_canonical_link_allowed: z.literal(false),
  }),
  identifier_policies: z.array(SemanticIdentifierPolicySchema).min(1),
  invariants: z.array(SemanticInvariantSchema).min(1),
  future_exports: z.array(SemanticFutureExportSchema).min(1),
});

export const SemanticFixtureSourceAnchorSchema = z.strictObject({
  path: z.string().min(1),
  must_contain: z.array(z.string().min(1)).min(1),
});

export const SemanticContractFixtureSchema = z.strictObject({
  id: z.string().min(1),
  source_anchors: z.array(SemanticFixtureSourceAnchorSchema).min(1),
  entity_types: z.array(SemanticEntityTypeSchema),
  record_types: z.array(SemanticRecordTypeSchema),
  association_types: z.array(SemanticAssociationTypeSchema),
  resolution_statuses: z.array(SemanticEntityResolutionStatusSchema),
  relation_statuses: z.array(SemanticRelationAssertionStatusSchema),
  required_invariants: z.array(SemanticInvariantSchema).min(1),
  forbidden_association_types: z.array(SemanticAssociationTypeSchema),
});

export const SemanticContractFixtureManifestSchema = z.strictObject({
  schema_version: z.literal("lt-semantic-contract-fixtures.v0.2"),
  contract: z.literal("docs/architecture/semantic-contract.v0.2.json"),
  profile: z.literal("docs/architecture/semantic-profile.v0.2.yaml"),
  issue: z.literal(943),
  fixture_count: z.literal(7),
  fixtures: z.array(SemanticContractFixtureSchema).length(7),
});

export function semanticContractToJsonSchema() {
  return z.toJSONSchema(SemanticContractSchema, {
    target: "draft-2020-12",
  });
}

export type SemanticContract = z.infer<typeof SemanticContractSchema>;
export type SemanticContractFixtureManifest = z.infer<
  typeof SemanticContractFixtureManifestSchema
>;
