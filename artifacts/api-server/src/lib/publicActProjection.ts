import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import { type Publication } from "@workspace/db";
import {
  classifyAlboPublicSafety,
  isPublicActSafetyAttestation,
  makeAlboPublicSafetyDecision,
  makePublicActSafetyAttestation,
  projectPublicAct,
  publicActSafetyAttestationFailureReason,
  renewAlboPublicSafetyDecision,
  structuralPublicActSafetyDecision,
  type PublicActProjection,
  type PublicActSafetyAttestation,
  type PublicActSafetyAttestationFailureReason,
  type PublicActSafetyDecision,
} from "@workspace/publication-standardisation/public-act";

export type PublicActAttestationStatus =
  | "valid"
  | "legacy_missing"
  | "invalid"
  | "stale"
  | "source_changed";

export interface PublicationSafetySource {
  progressivo: string;
  tipologia: string | null;
  category: string;
  subcategory: string | null;
  provenienza: string | null;
  oggetto: string | null;
  dataAtto: Date | string | null;
  pubStart: Date | string | null;
  pubEnd: Date | string | null;
  numRegSet: string | null;
  numRegGen: string | null;
  cups: readonly string[];
  pnrrMission: string | null;
  isPnrr: boolean;
}

type ProjectedDatabasePublication = PublicActProjection & {
  public_safety: PublicActProjection["public_safety"] & {
    attestation_status: PublicActAttestationStatus;
    attestation_reason: PublicActSafetyAttestationFailureReason | null;
    attestation_source: "albo_ingestion" | null;
    attested_at: string | null;
    source_fingerprint_verified: boolean;
  };
};

/** Fingerprint every source-owned field that can affect public projection. */
export function publicationSafetySourceFingerprint(
  source: PublicationSafetySource,
): string {
  const canonical = {
    progressivo: source.progressivo,
    tipologia: source.tipologia,
    category: source.category,
    subcategory: source.subcategory,
    provenienza: source.provenienza,
    oggetto: source.oggetto,
    dataAtto: iso(source.dataAtto),
    pubStart: iso(source.pubStart),
    pubEnd: iso(source.pubEnd),
    numRegSet: source.numRegSet,
    numRegGen: source.numRegGen,
    cups: [...source.cups],
    pnrrMission: source.pnrrMission,
    isPnrr: source.isPnrr,
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

/**
 * Ingestion-only safety boundary. Changed source is evaluated afresh; a
 * policy/profile renewal preserves any stricter prior decision. Malformed
 * prior state is repaired as metadata-only, never reactivated from raw.
 */
export function attestPublicationAtIngestion(input: {
  source: PublicationSafetySource;
  evaluatedAt: Date;
  previous: unknown;
}): PublicActSafetyAttestation {
  const fingerprint = publicationSafetySourceFingerprint(input.source);
  const previousFailure = publicActSafetyAttestationFailureReason(
    input.previous,
    fingerprint,
  );

  if (
    previousFailure === null &&
    isPublicActSafetyAttestation(input.previous, fingerprint)
  ) {
    return input.previous;
  }

  const candidate = classifyAlboPublicSafety({
    subject: input.source.oggetto,
    act_type: input.source.tipologia,
    office: input.source.provenienza,
  });
  let decision: PublicActSafetyDecision;

  const priorStructuralDecision = structuralPublicActSafetyDecision(
    previousDecision(input.previous),
  );

  if (previousFailure === "missing") {
    decision = candidate;
  } else if (
    previousFailure === "source_changed" ||
    previousFailure === "stale_policy" ||
    previousFailure === "stale_profile" ||
    previousFailure === "invalid_presentation"
  ) {
    decision = renewAlboPublicSafetyDecision(
      previousDecision(input.previous),
      candidate,
    );
  } else if (priorStructuralDecision) {
    // A malformed envelope cannot validate a permissive prior decision. It can,
    // however, carry a structurally stricter restriction that must never be
    // lost (especially do_not_publish).
    decision = renewAlboPublicSafetyDecision(
      previousDecision(input.previous),
      requiredMetadataOnlyDecision(
        "Attestazione precedente non valida: record limitato al metadato minimo.",
      ),
    );
  } else {
    decision = requiredMetadataOnlyDecision(
      "Attestazione precedente non valida: record limitato al metadato minimo.",
    );
  }

  const evaluatedAt = input.evaluatedAt.toISOString();
  const projection = projectSafetySource(input.source, decision, evaluatedAt);
  const attestation = makePublicActSafetyAttestation({
    evaluated_at: evaluatedAt,
    decision_source: "albo_ingestion",
    source_fingerprint: fingerprint,
    decision,
    presentation: projection?.presentation ?? null,
  });
  if (!attestation) {
    throw new Error("Unable to create a valid public-safety attestation");
  }
  return attestation;
}

/**
 * The only DB-to-public projection. No request-time policy runs against raw
 * fields. Legacy/stale/invalid/source-changed rows become generic metadata.
 */
export function projectDatabasePublication(
  publication: Publication,
): ProjectedDatabasePublication | null {
  const source = publicationSafetySourceFromRecord(publication);
  const fingerprint = publicationSafetySourceFingerprint(source);
  const persisted = publication.publicSafetyDecision;
  let failure = publicActSafetyAttestationFailureReason(persisted, fingerprint);
  const priorStructuralDecision = structuralPublicActSafetyDecision(
    previousDecision(persisted),
  );
  // A record once structurally excluded cannot become publicly enumerable just
  // because its attestation is stale, malformed around the decision, or no
  // longer matches the source fingerprint.
  if (
    failure &&
    priorStructuralDecision?.public_visibility === "do_not_publish"
  ) {
    return null;
  }
  let decision: PublicActSafetyDecision;
  let attestation: PublicActSafetyAttestation | null = null;

  if (!failure && isPublicActSafetyAttestation(persisted, fingerprint)) {
    attestation = persisted;
    decision = persisted.decision;
    const attestedProjection = projectSafetySource(
      source,
      decision,
      publication.firstSeenAt.toISOString(),
      publication,
    );
    if (
      decision.public_visibility !== "do_not_publish" &&
      (!attestedProjection ||
        !samePresentation(
          attestedProjection.presentation,
          persisted.presentation,
        ))
    ) {
      failure = "invalid_presentation";
      attestation = null;
    }
  } else {
    decision = requiredMetadataOnlyDecision(
      "Attestazione public-safe assente o non valida: record legacy limitato al metadato minimo.",
    );
  }

  if (failure) {
    decision = requiredMetadataOnlyDecision(
      failure === "missing"
        ? "Attestazione public-safe assente: record legacy limitato al metadato minimo."
        : `Attestazione public-safe non valida (${failure}): record limitato al metadato minimo.`,
    );
  }

  const projected = projectSafetySource(
    source,
    decision,
    publication.firstSeenAt.toISOString(),
    publication,
  );
  if (!projected) return null;

  return {
    ...projected,
    public_safety: {
      ...projected.public_safety,
      attestation_status: attestationStatus(failure),
      attestation_reason: failure,
      attestation_source: attestation?.decision_source ?? null,
      attested_at: attestation?.evaluated_at ?? null,
      source_fingerprint_verified: Boolean(attestation),
    },
  };
}

export function mapPublicPublication(publication: Publication) {
  const projected = projectDatabasePublication(publication);
  if (!projected) return null;
  return {
    id: projected.id as number,
    publicId: projected.public_id,
    progressivo: projected.progressivo,
    tipologia: projected.tipologia,
    category: projected.category,
    subcategory: projected.subcategory,
    provenienza: projected.provenienza,
    oggetto: projected.oggetto,
    dataAtto: projected.data_atto,
    pubStart: projected.publication_start,
    pubEnd: projected.publication_end,
    numRegSet: projected.registry_section_number,
    numRegGen: projected.registry_general_number,
    cups: projected.cups,
    pnrrMission: projected.pnrr_mission,
    isPnrr: projected.is_pnrr,
    attachments: projected.attachments.map((attachment) => ({
      name: attachment.name,
      tipo: attachment.tipo ?? "",
      officialUrl: attachment.official_url ?? attachment.archived_url ?? "",
      storagePath: attachment.archived_url,
      contentType: attachment.content_type,
      size: attachment.size,
    })),
    isNew: projected.is_new,
    firstSeenAt: projected.first_seen_at,
    macrotema: projected.macrotema ?? "altro",
    brief: null,
    briefManual: false,
    briefGeneratedAt: null,
    odgMacrotemi: [] as string[],
    presentation: projected.presentation,
    publicSafety: projected.public_safety,
  };
}

export function mapPublicDocument(publication: Publication) {
  const projected = projectDatabasePublication(publication);
  if (!projected) return null;
  return {
    id: projected.id as number,
    publicId: projected.public_id,
    progressivo: projected.progressivo,
    tipologia: projected.tipologia,
    category: projected.category,
    subcategory: projected.subcategory,
    provenienza: projected.provenienza,
    oggetto: projected.oggetto,
    dataAtto: projected.data_atto,
    pubStart: projected.publication_start,
    pubEnd: projected.publication_end,
    numRegSet: projected.registry_section_number,
    numRegGen: projected.registry_general_number,
    cups: projected.cups,
    pnrrMission: projected.pnrr_mission,
    isPnrr: projected.is_pnrr,
    attachments: projected.attachments.map((attachment) => ({
      name: attachment.name,
      officialUrl: attachment.official_url ?? attachment.archived_url ?? "",
      archivedUrl: attachment.archived_url,
      contentType: attachment.content_type,
      size: attachment.size,
    })),
    hasMarkdown: projected.markdown !== null,
    markdownSource: projected.markdown?.source ?? null,
    markdownExtractedAt: projected.markdown?.extracted_at ?? null,
    presentation: projected.presentation,
    publicSafety: projected.public_safety,
  };
}

export function mapPublicDocumentMarkdown(publication: Publication) {
  const projected = projectDatabasePublication(publication);
  if (!projected?.markdown) return null;
  return {
    id: projected.id as number,
    publicId: projected.public_id,
    progressivo: projected.progressivo,
    oggetto: projected.oggetto,
    markdownSource: projected.markdown.source,
    markdownExtractedAt: projected.markdown.extracted_at,
    markdown: projected.markdown.text,
    presentation: projected.presentation,
    publicSafety: projected.public_safety,
  };
}

function projectSafetySource(
  source: PublicationSafetySource,
  decision: PublicActSafetyDecision,
  firstSeenAt: string,
  publication?: Publication,
): PublicActProjection | null {
  return projectPublicAct({
    id: publication?.id ?? source.progressivo,
    progressivo: source.progressivo,
    tipologia: source.tipologia,
    category: source.category,
    subcategory: source.subcategory,
    provenienza: source.provenienza,
    oggetto: source.oggetto,
    data_atto: iso(source.dataAtto),
    publication_start: iso(source.pubStart),
    publication_end: iso(source.pubEnd),
    registry_section_number: source.numRegSet,
    registry_general_number: source.numRegGen,
    cups: source.cups,
    pnrr_mission: source.pnrrMission,
    is_pnrr: source.isPnrr,
    is_new: publication?.isNew ?? false,
    first_seen_at: firstSeenAt,
    macrotema: publication?.macrotema ?? null,
    decision,
    attachments: (publication?.attachments ?? []).map((attachment) => ({
      name: attachment.name,
      tipo: attachment.tipo,
      official_url: attachment.officialUrl,
      archived_url: attachment.storagePath,
      content_type: attachment.contentType,
      size: attachment.size,
      public_safe: false,
    })),
    markdown: publication?.markdownText
      ? {
          text: publication.markdownText,
          source: publication.markdownSource,
          extracted_at: iso(publication.markdownExtractedAt),
          public_safe: false,
        }
      : null,
  });
}

export function publicationSafetySourceFromRecord(
  publication: Publication,
): PublicationSafetySource {
  return {
    progressivo: publication.progressivo,
    tipologia: publication.tipologia,
    category: publication.category,
    subcategory: publication.subcategory,
    provenienza: publication.provenienza,
    oggetto: publication.oggetto,
    dataAtto: publication.dataAtto,
    pubStart: publication.pubStart,
    pubEnd: publication.pubEnd,
    numRegSet: publication.numRegSet,
    numRegGen: publication.numRegGen,
    cups: publication.cups,
    pnrrMission: publication.pnrrMission,
    isPnrr: publication.isPnrr,
  };
}

function requiredMetadataOnlyDecision(reason: string): PublicActSafetyDecision {
  const value = makeAlboPublicSafetyDecision("metadata_only", "high", reason);
  if (!value) throw new Error("Invalid metadata-only safety decision");
  return value;
}

function previousDecision(value: unknown): unknown {
  if (!value || typeof value !== "object") return null;
  return (value as { decision?: unknown }).decision ?? null;
}

function attestationStatus(
  failure: PublicActSafetyAttestationFailureReason | null,
): PublicActAttestationStatus {
  if (!failure) return "valid";
  if (failure === "missing") return "legacy_missing";
  if (failure === "stale_policy" || failure === "stale_profile") {
    return "stale";
  }
  return failure === "source_changed" ? "source_changed" : "invalid";
}

function samePresentation(left: unknown, right: unknown): boolean {
  // PostgreSQL jsonb does not preserve object-key order. Semantic equality is
  // required here; serialisation order must not invalidate an attestation.
  return isDeepStrictEqual(left, right);
}

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
