import {
  PUBLICATION_STANDARDISATION_SCHEMA_VERSION,
  type PublicationPresentation,
} from "./index";
import { PUBLICATION_AREA_THEME_SCHEMA_VERSION } from "./area-theme";
import { ALBO_PUBLIC_AREA_THEME_TAXONOMY } from "./albo-area-theme";
import {
  ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  standardiseAlboPublicSubject,
  type AlboPublicationPresentation,
} from "./albo";

export const PUBLIC_ACT_PROJECTION_SCHEMA_VERSION =
  "public-act-projection.v1" as const;
export const ALBO_PUBLIC_SAFETY_POLICY_ID = "albo-public-safety" as const;
export const ALBO_PUBLIC_SAFETY_POLICY_VERSION = "2026-08-30.1" as const;
export const PUBLIC_ACT_SAFETY_ATTESTATION_SCHEMA_VERSION =
  "public-act-safety-attestation.v1" as const;

export type PublicActPrivacyRisk = "low" | "medium" | "high";
export type PublicActVisibility =
  | "publishable"
  | "publishable_with_minimisation"
  | "metadata_only"
  | "do_not_publish";

export interface PublicActSafetyDecision {
  policy_id: typeof ALBO_PUBLIC_SAFETY_POLICY_ID;
  policy_version: typeof ALBO_PUBLIC_SAFETY_POLICY_VERSION;
  standardisation_profile_id: typeof ALBO_PUBLICATION_STANDARDISATION_PROFILE.id;
  standardisation_profile_version: typeof ALBO_PUBLICATION_STANDARDISATION_PROFILE.version;
  public_visibility: PublicActVisibility;
  privacy_risk: PublicActPrivacyRisk;
  reason: string | null;
}

export interface PublicActSafetyAttestation {
  schema_version: typeof PUBLIC_ACT_SAFETY_ATTESTATION_SCHEMA_VERSION;
  evaluated_at: string;
  decision_source: "albo_ingestion";
  source_fingerprint: string;
  decision: PublicActSafetyDecision;
  presentation: AlboPublicationPresentation | null;
}

export type PublicActSafetyAttestationFailureReason =
  | "missing"
  | "invalid_schema"
  | "invalid_timestamp"
  | "invalid_source"
  | "invalid_fingerprint"
  | "stale_policy"
  | "stale_profile"
  | "invalid_decision"
  | "invalid_presentation"
  | "source_changed";

export interface AlboPublicSafetyInput {
  subject: string | null;
  act_type: string | null;
  office: string | null;
  act_category_id?: string | null;
}

export interface PublicActAttachmentInput {
  name: string;
  tipo: string | null;
  official_url: string | null;
  archived_url: string | null;
  content_type: string | null;
  size: number | null;
  /** Explicit attestation from a reviewed public-artifact manifest. */
  public_safe: boolean;
}

export interface PublicActMarkdownInput {
  text: string;
  source: string | null;
  extracted_at: string | null;
  /** Explicit attestation from a reviewed public-artifact manifest. */
  public_safe: boolean;
}

export interface PublicActProjectionInput {
  id: number | string;
  progressivo: string;
  tipologia: string | null;
  category: string;
  subcategory: string | null;
  provenienza: string | null;
  oggetto: string | null;
  data_atto: string | null;
  publication_start: string | null;
  publication_end: string | null;
  registry_section_number: string | null;
  registry_general_number: string | null;
  cups: readonly string[];
  pnrr_mission: string | null;
  is_pnrr: boolean;
  is_new: boolean;
  first_seen_at: string;
  macrotema: string | null;
  decision: unknown;
  attachments?: readonly PublicActAttachmentInput[];
  markdown?: PublicActMarkdownInput | null;
}

export interface PublicActProjectionAttachment {
  name: string;
  tipo: string | null;
  official_url: string | null;
  archived_url: string | null;
  content_type: string | null;
  size: number | null;
}

export interface PublicActProjection {
  projection_schema_version: typeof PUBLIC_ACT_PROJECTION_SCHEMA_VERSION;
  id: number | string;
  public_id: string;
  progressivo: string;
  tipologia: string;
  category: string;
  subcategory: string | null;
  provenienza: string | null;
  oggetto: string;
  data_atto: string | null;
  publication_start: string | null;
  publication_end: string | null;
  registry_section_number: string | null;
  registry_general_number: string | null;
  cups: string[];
  pnrr_mission: string | null;
  is_pnrr: boolean;
  is_new: boolean;
  first_seen_at: string;
  macrotema: string | null;
  presentation: AlboPublicationPresentation;
  public_safety: PublicActSafetyDecision & {
    projection_schema_version: typeof PUBLIC_ACT_PROJECTION_SCHEMA_VERSION;
    attachments_attested: boolean;
    markdown_attested: boolean;
  };
  attachments: PublicActProjectionAttachment[];
  markdown: {
    text: string;
    source: string | null;
    extracted_at: string | null;
  } | null;
}

export type PublicActProjectionFailureReason =
  | "invalid_or_stale_decision"
  | "invalid_identity"
  | "invalid_category"
  | "invalid_first_seen_at"
  | "do_not_publish";

const DO_NOT_PUBLISH_TERMS = [
  "minore",
  "minori",
  "adozione",
  "affido",
  "sanitar",
  "disabil",
  "handicap",
  "invalid",
  "tutela",
  "amministratore di sostegno",
];

const METADATA_ONLY_TERMS = [
  "assegno di maternita",
  "assegno maternita",
  "maternita",
  "beneficiari",
  "elenco benefici",
  "elenco dei benefici",
  "graduatoria benefici",
  "contributo economico a favore di persona fisica",
  "contributi economici straordinari",
  "assistenza domiciliare",
  "assistenza sociale",
  "assistenti sociali",
  "fondo poverta",
  "servizi sociali",
  "servizio sociale",
  "non autosufficien",
  "fragil",
  "fna ",
  "pubblicazione di matrimonio",
  "matrimonio",
  "notifica",
  "irreperibil",
  "cambio nome",
  "cambio cognome",
  "avviso di deposito",
  "casa comunale",
  "elenco x 1 gg",
];

const MINIMISE_TERMS = [
  "benefici",
  "assegno",
  "sussidio",
  "sussidi",
  "bonus sociale",
  "welfare",
  "sostegno economico",
  "sostegno al reddito",
  "supporto familiare",
  "nucleo familiare",
  "nuclei familiari",
  "graduatori",
  "contenzioso",
  "risarc",
  "transatt",
  "sinistro",
  "avvocatura",
];

const PROCEDURAL_NOTIFICATION_PATTERNS = [
  /\bart(?:icolo)?\s*\.?\s*(?:140|143)\s*(?:c\s*\.?\s*p\s*\.?\s*c\s*\.?|codice\s+di\s+procedura\s+civile)\b/iu,
  /\baffissione\s+all['’]albo\s+nei\s+confronti\s+di\b/iu,
  /\bnotifica\s+per\s+pubblici\s+proclami\b/iu,
  /\bdeposito\s+(?:presso|nella)\s+(?:la\s+)?casa\s+comunale\b/iu,
];

const DECISION_BASE = {
  policy_id: ALBO_PUBLIC_SAFETY_POLICY_ID,
  policy_version: ALBO_PUBLIC_SAFETY_POLICY_VERSION,
  standardisation_profile_id: ALBO_PUBLICATION_STANDARDISATION_PROFILE.id,
  standardisation_profile_version:
    ALBO_PUBLICATION_STANDARDISATION_PROFILE.version,
} as const;

export function classifyAlboPublicSafety(
  input: AlboPublicSafetyInput,
): PublicActSafetyDecision {
  const text = [input.subject, input.act_type, input.office]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "");

  if (DO_NOT_PUBLISH_TERMS.some((term) => text.includes(term))) {
    return decision(
      "do_not_publish",
      "high",
      "Regola automatica prudenziale: possibile contenuto sociale, sanitario o personale sensibile.",
    );
  }
  if (METADATA_ONLY_TERMS.some((term) => text.includes(term))) {
    return decision(
      "metadata_only",
      "high",
      "Regola automatica prudenziale: stato civile, notifiche o metadati personali pubblicati solo in forma minima.",
    );
  }
  if (
    PROCEDURAL_NOTIFICATION_PATTERNS.some((pattern) => pattern.test(text)) ||
    input.act_category_id === "notifiche_depositi"
  ) {
    return decision(
      "metadata_only",
      "high",
      "Regola automatica prudenziale: notifiche e depositi procedurali pubblicati solo in forma minima.",
    );
  }
  if (MINIMISE_TERMS.some((term) => text.includes(term))) {
    return decision(
      "publishable_with_minimisation",
      "medium",
      "Regola automatica prudenziale: oggetto minimizzato per possibile presenza di dati personali o contenzioso.",
    );
  }
  return decision("publishable", "low", null);
}

/** Packages a decision already produced by the ingestion safety boundary. */
export function makeAlboPublicSafetyDecision(
  public_visibility: PublicActVisibility,
  privacy_risk: PublicActPrivacyRisk,
  reason: string | null,
): PublicActSafetyDecision | null {
  const value = decision(public_visibility, privacy_risk, reason);
  return isPublicActSafetyDecision(value) ? value : null;
}

/**
 * Renews an attestation against the current policy without making a previously
 * attested record more permissive merely because the policy/profile changed.
 * A malformed prior decision is reduced to metadata-only instead of being
 * reclassified from raw fields.
 */
export function renewAlboPublicSafetyDecision(
  previous: unknown,
  candidate: PublicActSafetyDecision,
): PublicActSafetyDecision {
  const prior = structuralPublicActSafetyDecision(previous);
  if (!prior) {
    return decision(
      "metadata_only",
      "high",
      "Attestazione precedente non valida: rinnovo limitato al metadato minimo.",
    );
  }

  const publicVisibility =
    visibilityRank(prior.public_visibility) >
    visibilityRank(candidate.public_visibility)
      ? prior.public_visibility
      : candidate.public_visibility;
  const privacyRisk =
    riskRank(prior.privacy_risk) > riskRank(candidate.privacy_risk)
      ? prior.privacy_risk
      : candidate.privacy_risk;
  const reason =
    publicVisibility !== candidate.public_visibility ||
    privacyRisk !== candidate.privacy_risk
      ? (prior.reason ??
        "Il rinnovo conserva la decisione precedente più restrittiva.")
      : candidate.reason;

  return decision(publicVisibility, privacyRisk, reason);
}

export function makePublicActSafetyAttestation(input: {
  evaluated_at: string;
  decision_source: "albo_ingestion";
  source_fingerprint: string;
  decision: PublicActSafetyDecision;
  presentation: AlboPublicationPresentation | null;
}): PublicActSafetyAttestation | null {
  const value: PublicActSafetyAttestation = {
    schema_version: PUBLIC_ACT_SAFETY_ATTESTATION_SCHEMA_VERSION,
    ...input,
  };
  return publicActSafetyAttestationFailureReason(value) ? null : value;
}

export function publicActSafetyAttestationFailureReason(
  value: unknown,
  expectedSourceFingerprint?: string,
): PublicActSafetyAttestationFailureReason | null {
  if (value === null || value === undefined) return "missing";
  if (typeof value !== "object" || Array.isArray(value)) {
    return "invalid_schema";
  }
  const candidate = value as Partial<PublicActSafetyAttestation>;
  if (
    candidate.schema_version !== PUBLIC_ACT_SAFETY_ATTESTATION_SCHEMA_VERSION
  ) {
    return "invalid_schema";
  }
  if (!validDate(candidate.evaluated_at)) return "invalid_timestamp";
  if (candidate.decision_source !== "albo_ingestion") {
    return "invalid_source";
  }
  if (
    typeof candidate.source_fingerprint !== "string" ||
    !/^[a-f0-9]{64}$/u.test(candidate.source_fingerprint)
  ) {
    return "invalid_fingerprint";
  }
  if (!candidate.decision || typeof candidate.decision !== "object") {
    return "invalid_decision";
  }
  const decision = candidate.decision as Partial<PublicActSafetyDecision>;
  if (
    decision.policy_id !== ALBO_PUBLIC_SAFETY_POLICY_ID ||
    decision.policy_version !== ALBO_PUBLIC_SAFETY_POLICY_VERSION
  ) {
    return "stale_policy";
  }
  if (
    decision.standardisation_profile_id !==
      ALBO_PUBLICATION_STANDARDISATION_PROFILE.id ||
    decision.standardisation_profile_version !==
      ALBO_PUBLICATION_STANDARDISATION_PROFILE.version
  ) {
    return "stale_profile";
  }
  if (!isPublicActSafetyDecision(decision)) return "invalid_decision";
  if (
    decision.public_visibility === "do_not_publish"
      ? candidate.presentation !== null
      : !isPublicationPresentation(candidate.presentation)
  ) {
    return "invalid_presentation";
  }
  // Fingerprint comparison comes last. A malformed or stale prior attestation
  // must never masquerade as an ordinary source change and regain a more
  // permissive decision during ingestion.
  if (
    expectedSourceFingerprint &&
    candidate.source_fingerprint !== expectedSourceFingerprint
  ) {
    return "source_changed";
  }
  return null;
}

export function isPublicActSafetyAttestation(
  value: unknown,
  expectedSourceFingerprint?: string,
): value is PublicActSafetyAttestation {
  return !publicActSafetyAttestationFailureReason(
    value,
    expectedSourceFingerprint,
  );
}

export function isPublicActSafetyDecision(
  value: unknown,
): value is PublicActSafetyDecision {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PublicActSafetyDecision>;
  if (
    candidate.policy_id !== ALBO_PUBLIC_SAFETY_POLICY_ID ||
    candidate.policy_version !== ALBO_PUBLIC_SAFETY_POLICY_VERSION ||
    candidate.standardisation_profile_id !==
      ALBO_PUBLICATION_STANDARDISATION_PROFILE.id ||
    candidate.standardisation_profile_version !==
      ALBO_PUBLICATION_STANDARDISATION_PROFILE.version ||
    !isVisibility(candidate.public_visibility) ||
    !isRisk(candidate.privacy_risk) ||
    !(candidate.reason === null || typeof candidate.reason === "string")
  ) {
    return false;
  }
  return (
    minimumVisibilityForRisk(candidate.privacy_risk) <=
    visibilityRank(candidate.public_visibility)
  );
}

/**
 * The only public projection for Albo-derived acts.
 *
 * It is deliberately fail-closed: an absent, stale or inconsistent decision,
 * an invalid core identity, or a do-not-publish decision returns `null`.
 * Attachments and extracted Markdown require their own explicit attestation;
 * a file merely existing in a database is never enough.
 */
export function projectPublicAct(
  input: PublicActProjectionInput,
): PublicActProjection | null {
  if (publicActProjectionFailureReason(input)) return null;
  const safetyDecision = input.decision as PublicActSafetyDecision;
  const publicId = publicActPublicId(input.progressivo);
  if (!publicId) return null;

  const isFull =
    safetyDecision.public_visibility === "publishable" &&
    safetyDecision.privacy_risk === "low";
  const isMetadataOnly = safetyDecision.public_visibility === "metadata_only";
  const sourceSubject = clean(input.oggetto);
  const minimisedSubject = isMetadataOnly
    ? "Metadato minimo; oggetto non ripubblicato per prudenza privacy."
    : "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.";
  const presentation = standardiseAlboPublicSubject(
    isFull ? sourceSubject : minimisedSubject,
    {
      area_theme_availability: isFull
        ? sourceSubject
          ? "available"
          : "missing"
        : "withheld_for_privacy",
    },
  );
  if (!presentation) return null;
  const publicSubject = isFull
    ? (sourceSubject ?? presentation.display_title)
    : minimisedSubject;

  const attachments = isFull
    ? (input.attachments ?? []).flatMap((attachment) => {
        if (!attachment.public_safe || !validAttachment(attachment)) return [];
        return [
          {
            name: clean(attachment.name) || "Documento",
            tipo: clean(attachment.tipo),
            official_url: safeUrl(attachment.official_url),
            archived_url: safeArchivedUrl(attachment.archived_url),
            content_type: clean(attachment.content_type),
            size:
              Number.isInteger(attachment.size) && (attachment.size ?? -1) >= 0
                ? attachment.size
                : null,
          },
        ];
      })
    : [];
  const markdown =
    isFull && input.markdown?.public_safe && nonEmpty(input.markdown.text)
      ? {
          text: input.markdown.text,
          source: clean(input.markdown.source),
          extracted_at: validOptionalDate(input.markdown.extracted_at),
        }
      : null;

  return {
    projection_schema_version: PUBLIC_ACT_PROJECTION_SCHEMA_VERSION,
    id: input.id,
    public_id: publicId,
    progressivo: input.progressivo.trim(),
    tipologia: isFull
      ? clean(input.tipologia) || "Atto amministrativo"
      : "Atto amministrativo",
    category: safeTaxonomyToken(input.category)!,
    subcategory: isFull ? safeTaxonomyToken(input.subcategory) : null,
    provenienza: isFull ? clean(input.provenienza) : null,
    oggetto: publicSubject,
    data_atto: isMetadataOnly ? null : validOptionalDate(input.data_atto),
    publication_start: validOptionalDate(input.publication_start),
    publication_end: validOptionalDate(input.publication_end),
    registry_section_number: isMetadataOnly
      ? null
      : clean(input.registry_section_number),
    registry_general_number: isMetadataOnly
      ? null
      : clean(input.registry_general_number),
    cups: isFull
      ? input.cups.filter(nonEmpty).map((value) => value.trim())
      : [],
    pnrr_mission: isFull ? clean(input.pnrr_mission) : null,
    is_pnrr: isFull ? input.is_pnrr : false,
    is_new: input.is_new,
    first_seen_at: input.first_seen_at,
    macrotema: isFull ? safeTaxonomyToken(input.macrotema) : null,
    presentation,
    public_safety: {
      ...safetyDecision,
      // Policy decisions may be persisted or imported from older snapshots.
      // Never turn their free-form explanation into another public text field.
      reason: publicSafetyReason(safetyDecision),
      projection_schema_version: PUBLIC_ACT_PROJECTION_SCHEMA_VERSION,
      attachments_attested: attachments.length > 0,
      markdown_attested: markdown !== null,
    },
    attachments,
    markdown,
  };
}

/**
 * Stable cross-surface id.
 *
 * The canonical official shape `YYYY/N` keeps its reader-friendly id. Every
 * non-canonical value is encoded by UTF-16 code unit, which is reversible and
 * cannot collapse punctuation variants that are distinct in the database.
 */
export function publicActPublicId(progressivo: string): string | null {
  if (!nonEmpty(progressivo)) return null;
  const value = progressivo;
  const official = /^(\d{4})\/([1-9]\d*)$/u.exec(value);
  if (official) return `albo-${official[1]}-${official[2]}`;

  let encoded = "";
  for (let index = 0; index < value.length; index += 1) {
    encoded += value.charCodeAt(index).toString(16).padStart(4, "0");
  }
  return encoded ? `albo-raw-${encoded}` : null;
}

export function publicActProjectionFailureReason(
  input: PublicActProjectionInput,
): PublicActProjectionFailureReason | null {
  if (!isPublicActSafetyDecision(input.decision)) {
    return "invalid_or_stale_decision";
  }
  if (!validId(input.id) || !nonEmpty(input.progressivo)) {
    return "invalid_identity";
  }
  if (!publicActPublicId(input.progressivo)) return "invalid_identity";
  if (!safeTaxonomyToken(input.category)) return "invalid_category";
  if (!validDate(input.first_seen_at)) return "invalid_first_seen_at";
  if (input.decision.public_visibility === "do_not_publish") {
    return "do_not_publish";
  }
  return null;
}

function decision(
  public_visibility: PublicActVisibility,
  privacy_risk: PublicActPrivacyRisk,
  reason: string | null,
): PublicActSafetyDecision {
  return { ...DECISION_BASE, public_visibility, privacy_risk, reason };
}

function isVisibility(value: unknown): value is PublicActVisibility {
  return (
    value === "publishable" ||
    value === "publishable_with_minimisation" ||
    value === "metadata_only" ||
    value === "do_not_publish"
  );
}

function isRisk(value: unknown): value is PublicActPrivacyRisk {
  return value === "low" || value === "medium" || value === "high";
}

function visibilityRank(value: PublicActVisibility): number {
  return {
    publishable: 0,
    publishable_with_minimisation: 1,
    metadata_only: 2,
    do_not_publish: 3,
  }[value];
}

function minimumVisibilityForRisk(value: PublicActPrivacyRisk): number {
  return value === "low" ? 0 : value === "medium" ? 1 : 2;
}

function riskRank(value: PublicActPrivacyRisk): number {
  return value === "low" ? 0 : value === "medium" ? 1 : 2;
}

/**
 * Reads only the monotonic restriction fields from legacy decisions. Policy
 * and profile identifiers are deliberately not required here: their mismatch
 * is exactly what renewal repairs, and can never justify loosening a prior
 * restriction.
 */
export function structuralPublicActSafetyDecision(
  value: unknown,
): Pick<
  PublicActSafetyDecision,
  "public_visibility" | "privacy_risk" | "reason"
> | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PublicActSafetyDecision>;
  if (
    !isVisibility(candidate.public_visibility) ||
    !isRisk(candidate.privacy_risk) ||
    !(candidate.reason === null || typeof candidate.reason === "string") ||
    minimumVisibilityForRisk(candidate.privacy_risk) >
      visibilityRank(candidate.public_visibility)
  ) {
    return null;
  }
  return {
    public_visibility: candidate.public_visibility,
    privacy_risk: candidate.privacy_risk,
    reason: candidate.reason,
  };
}

function isPublicationPresentation(
  value: unknown,
): value is AlboPublicationPresentation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PublicationPresentation>;
  const audit = candidate.standardisation;
  return Boolean(
    nonEmpty(candidate.display_title) &&
    nonEmpty(candidate.search_text) &&
    (candidate.action_id === null || typeof candidate.action_id === "string") &&
    (candidate.action_label === null ||
      typeof candidate.action_label === "string") &&
    isPublicationAreaTheme(candidate.area_theme) &&
    audit &&
    typeof audit === "object" &&
    audit.schema_version === PUBLICATION_STANDARDISATION_SCHEMA_VERSION &&
    audit.profile_id === ALBO_PUBLICATION_STANDARDISATION_PROFILE.id &&
    audit.profile_version ===
      ALBO_PUBLICATION_STANDARDISATION_PROFILE.version &&
    audit.input_field === "subject" &&
    audit.input_field_preserved === true &&
    (audit.status === "unchanged" ||
      audit.status === "standardised_automatically" ||
      audit.status === "review_required") &&
    Array.isArray(audit.transformations) &&
    audit.transformations.every((item) => typeof item === "string") &&
    Array.isArray(audit.layout_flags) &&
    audit.layout_flags.every((item) => item === "display_title_too_long") &&
    Array.isArray(audit.review_reasons) &&
    audit.review_reasons.every((item) => typeof item === "string"),
  );
}

function isPublicationAreaTheme(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const theme =
    typeof candidate.theme_id === "string"
      ? ALBO_PUBLIC_AREA_THEME_TAXONOMY.themes.find(
          (item) => item.id === candidate.theme_id,
        )
      : null;
  const hasTheme = Boolean(theme);
  const evidence = candidate.evidence;
  const nullReason = candidate.null_reason;
  const override = candidate.override;
  return Boolean(
    candidate.schema_version === PUBLICATION_AREA_THEME_SCHEMA_VERSION &&
    candidate.taxonomy_id === ALBO_PUBLIC_AREA_THEME_TAXONOMY.id &&
    candidate.taxonomy_version === ALBO_PUBLIC_AREA_THEME_TAXONOMY.version &&
    (candidate.theme_id === null || hasTheme) &&
    (hasTheme
      ? candidate.theme_label === theme?.label &&
        (candidate.confidence === "high" || candidate.confidence === "medium") &&
        nullReason === null
      : candidate.theme_label === null &&
        candidate.confidence === null &&
        (nullReason === "input_withheld_for_privacy" ||
          nullReason === "input_missing" ||
          nullReason === "not_classified" ||
          nullReason === "ambiguous_match")) &&
    (candidate.basis === "deterministic_rule" ||
      candidate.basis === "manual_override" ||
      candidate.basis === "fallback") &&
    (candidate.rule_id === null || typeof candidate.rule_id === "string") &&
    Array.isArray(evidence) &&
    evidence.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof (item as Record<string, unknown>).rule_id === "string" &&
        typeof (item as Record<string, unknown>).input_field === "string" &&
        Array.isArray((item as Record<string, unknown>).matched_terms) &&
        ((item as Record<string, unknown>).matched_terms as unknown[]).every(
          (term) => typeof term === "string",
        ),
    ) &&
    (override === null ||
      (candidate.basis === "manual_override" &&
        typeof override === "object" &&
        !Array.isArray(override))),
  );
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clean(value: unknown): string | null {
  return nonEmpty(value) ? value.trim() : null;
}

function safeTaxonomyToken(value: unknown): string | null {
  const token = clean(value);
  return token && /^[a-z0-9][a-z0-9_-]{0,63}$/u.test(token) ? token : null;
}

function publicSafetyReason(decision: PublicActSafetyDecision): string | null {
  if (decision.public_visibility === "publishable") return null;
  if (decision.public_visibility === "publishable_with_minimisation") {
    return "Contenuto minimizzato in base alla policy public-safe.";
  }
  return "Record limitato al metadato minimo in base alla policy public-safe.";
}

function validId(value: unknown): value is number | string {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function validDate(value: unknown): value is string {
  return nonEmpty(value) && !Number.isNaN(Date.parse(value));
}

function validOptionalDate(value: unknown): string | null {
  return validDate(value) ? value : null;
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return /^https:\/\/[^\s<>{}"']+$/iu.test(trimmed) ? trimmed : null;
}

function safeArchivedUrl(value: string | null): string | null {
  if (!value) return null;
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("..")
  ) {
    return value;
  }
  return safeUrl(value);
}

function validAttachment(value: PublicActAttachmentInput): boolean {
  return Boolean(
    safeUrl(value.official_url) || safeArchivedUrl(value.archived_url),
  );
}
