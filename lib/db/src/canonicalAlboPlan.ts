import {
  classifyAlboItem,
  CANONICAL_TAXONOMY_VERSION,
} from "@workspace/publication-standardisation/procurement-taxonomy";
import {
  generateCanonicalUuidV7,
  isCanonicalUuidV7,
} from "./canonicalIdentity";
import {
  canonicalSnapshotJson,
  snapshotHash,
  type JsonObject,
} from "./sourceSnapshotPersistence";

export const ALBO_RESOLVER_VERSION = "albo-document-resolution.v1";
export const ALBO_EXTRACTOR_VERSION = "albo-public-snapshot-claims.v1";
export const ALBO_REGISTER_KEY = "it.00301390795.albo";
export const TAXONOMY_KEY = "lamezia-canonical-taxonomy";
export const taxonomyFacets = {
  document_type: [
    "determinazione",
    "deliberazione",
    "ordinanza",
    "avviso",
    "decreto",
    "verbale",
    "contratto",
    "altro",
  ],
  procurement_relevance: ["none", "possible", "confirmed"],
  procurement_phase: [
    "programmazione",
    "gara",
    "affidamento",
    "esecuzione",
    "pagamento",
    "conclusione",
  ],
} as const;
export const taxonomyDefinitionHash = snapshotHash(
  canonicalSnapshotJson(taxonomyFacets),
);

export type AlboRegistryRecord = {
  id: string;
  source_key: string;
  collection_key: string;
  native_key: string | null;
  payload: JsonObject;
};
export type ExistingAlboIdentity = {
  id: string;
  kind: "publication" | "act" | "document";
  key: string;
};
type Row = Record<string, unknown>;
export type CanonicalAlboPlan = {
  resolverVersion: string;
  extractorVersion: string;
  taxonomyVersion: string;
  subjects: Row[];
  publications: Row[];
  versions: Row[];
  acts: Row[];
  documents: Row[];
  actLinks: Row[];
  documentLinks: Row[];
  assertions: Row[];
  outcomes: Row[];
  classifications: Row[];
  mentions: Row[];
  summary: {
    sourceRecords: number;
    publications: number;
    versions: number;
    acts: number;
    documents: number;
    assertions: number;
    candidates: number;
    resolved: number;
    unresolved: number;
    nonResolved: number;
    notApplicable: number;
    insufficientEvidence: number;
    reviewRequired: number;
    noCanonicalTarget: number;
    classifications: number;
    procurementMentions: number;
    withheldRecords: number;
  };
};
const text = (x: unknown): string | null =>
  typeof x === "string" && x.trim() ? x.trim() : null;
const object = (x: unknown): JsonObject =>
  x !== null && typeof x === "object" && !Array.isArray(x)
    ? (x as JsonObject)
    : {};
function day(x: unknown): string | null {
  const s = text(x);
  if (s === null) return null;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) !== s
  )
    throw new Error("ALBO_INVALID_DATE");
  return s;
}
function officialUrl(x: unknown): string | null {
  const s = text(x);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" &&
      u.hostname === "albo.tinnvision.cloud" &&
      !u.username &&
      !u.password &&
      !u.port
      ? s
      : null;
  } catch {
    return null;
  }
}
function actKey(x: JsonObject): string | null {
  const office = text(x.office),
    type = text(x.act_type),
    number = text(x.act_number),
    date = day(x.act_date);
  return office && type && number && date
    ? canonicalSnapshotJson(["it.00301390795", office, type, number, date])
    : null;
}
export function buildCanonicalAlboPlan(
  records: AlboRegistryRecord[],
  existing: ExistingAlboIdentity[] = [],
): CanonicalAlboPlan {
  const p: CanonicalAlboPlan = {
    resolverVersion: ALBO_RESOLVER_VERSION,
    extractorVersion: ALBO_EXTRACTOR_VERSION,
    taxonomyVersion: CANONICAL_TAXONOMY_VERSION,
    subjects: [],
    publications: [],
    versions: [],
    acts: [],
    documents: [],
    actLinks: [],
    documentLinks: [],
    assertions: [],
    outcomes: [],
    classifications: [],
    mentions: [],
    summary: {
      sourceRecords: records.length,
      publications: 0,
      versions: 0,
      acts: 0,
      documents: 0,
      assertions: 0,
      candidates: 0,
      resolved: 0,
      unresolved: 0,
      nonResolved: 0,
      notApplicable: 0,
      insufficientEvidence: 0,
      reviewRequired: 0,
      noCanonicalTarget: 0,
      classifications: 0,
      procurementMentions: 0,
      withheldRecords: 0,
    },
  };
  const known = new Map<string, string>(),
    emitted = new Set<string>(),
    ids = new Set<string>();
  for (const x of existing) {
    if (
      !isCanonicalUuidV7(x.id) ||
      (known.has(`${x.kind}:${x.key}`) &&
        known.get(`${x.kind}:${x.key}`) !== x.id)
    )
      throw new Error("ALBO_EXISTING_IDENTITY_CONFLICT");
    known.set(`${x.kind}:${x.key}`, x.id);
  }
  function identity(
    kind: ExistingAlboIdentity["kind"],
    key: string,
    values: Row,
  ) {
    const k = `${kind}:${key}`,
      id = known.get(k) ?? generateCanonicalUuidV7();
    known.set(k, id);
    if (!emitted.has(k)) {
      emitted.add(k);
      p.subjects.push({
        subject_id: id,
        subject_kind: kind === "publication" ? "event" : "entity",
        domain_type: `document.${kind}`,
      });
      p[
        kind === "publication"
          ? "publications"
          : kind === "act"
            ? "acts"
            : "documents"
      ].push({ id, ...values });
    }
    return id;
  }
  function assertion(
    r: AlboRegistryRecord,
    pointer: string,
    property: string,
    value: unknown,
    url: string,
    derived = false,
  ) {
    p.assertions.push({
      id: generateCanonicalUuidV7(),
      source_record_id: r.id,
      source_pointer: pointer,
      property_key: property,
      assertion_kind: derived ? "derived" : "extracted",
      value,
      value_state: value === null ? "unknown" : "known",
      value_hash: snapshotHash(canonicalSnapshotJson(value)),
      source_url: url,
      extractor_version: ALBO_EXTRACTOR_VERSION,
    });
    return pointer;
  }
  function outcome(
    r: AlboRegistryRecord,
    key: string,
    pointer: string,
    target: string | null,
    reason: string,
    status = "insufficient_evidence",
  ) {
    p.outcomes.push({
      id: generateCanonicalUuidV7(),
      source_record_id: r.id,
      candidate_key: key,
      assertion_pointer: pointer,
      target_subject_id: target,
      status: target ? "resolved" : status,
      role: key,
      reason_code: reason,
      resolver_version: ALBO_RESOLVER_VERSION,
    });
  }
  for (const r of records) {
    if (
      !isCanonicalUuidV7(r.id) ||
      ids.has(r.id) ||
      !["lamezia.albo.current", "lamezia.albo.delibere"].includes(
        r.source_key,
      ) ||
      !["items", "excluded"].includes(r.collection_key)
    )
      throw new Error("ALBO_RECORD_SCOPE_INVALID");
    ids.add(r.id);
    const x = r.payload,
      url = officialUrl(x.source_url);
    if (!url) throw new Error("ALBO_SOURCE_ORIGIN_INVALID");
    const attestation = object(x.privacy_attestation),
      visibility = text(x.public_visibility);
    // This is an import of the existing public-safe projection, not a new review.
    const safe =
      r.collection_key !== "excluded" &&
      visibility === "publishable" &&
      x.verification_status === "official_source_acquired" &&
      x.privacy_risk === "low" &&
      attestation.status === "current" &&
      attestation.policy_version === "albo-privacy-policy.2026-08-30.1" &&
      attestation.schema_version === "albo-privacy-policy-attestation.v1";
    const effectiveVisibility = safe
      ? "publishable"
      : visibility === "metadata_only" && r.collection_key !== "excluded"
        ? "metadata_only"
        : "do_not_publish";
    if (!safe) p.summary.withheldRecords++;
    const number = text(x.publication_number),
      validNumber = number && /^\d{4}\/[0-9]+$/.test(number) ? number : null;
    const publicationId = validNumber
      ? identity("publication", validNumber, {
          register_key: ALBO_REGISTER_KEY,
          publication_number: validNumber,
        })
      : null;
    const publicationPointer = assertion(
      r,
      "/publication_number",
      "document.publication_identifier",
      validNumber,
      url,
    );
    outcome(
      r,
      "publication",
      publicationPointer,
      publicationId,
      publicationId
        ? "register_and_source_number"
        : "missing_or_invalid_publication_number",
    );
    p.versions.push({
      source_record_id: r.id,
      publication_id: publicationId,
      source_url: url,
      title: safe ? text(x.subject) : null,
      publication_start: day(x.publication_start),
      publication_end: day(x.publication_end),
      public_visibility: effectiveVisibility,
      policy_version: text(attestation.policy_version),
      resolver_version: ALBO_RESOLVER_VERSION,
    });
    const key = safe ? actKey(x) : null;
    const actPointer = assertion(
      r,
      "/_derived/act_identity",
      "document.act_identity",
      key
        ? {
            issuer_key: "it.00301390795",
            office: text(x.office),
            act_type: text(x.act_type),
            act_number: text(x.act_number),
            act_date: day(x.act_date),
          }
        : null,
      url,
      true,
    );
    const actId = key
      ? identity("act", key, {
          issuer_key: "it.00301390795",
          office: text(x.office),
          act_type: text(x.act_type),
          act_number: text(x.act_number),
          act_date: day(x.act_date),
        })
      : null;
    outcome(
      r,
      "act",
      actPointer,
      actId,
      safe
        ? actId
          ? "qualified_issuer_office_type_number_date"
          : "incomplete_act_identity"
        : "public_safety_withheld",
      safe ? "insufficient_evidence" : "not_applicable",
    );
    if (actId)
      p.actLinks.push({
        source_record_id: r.id,
        act_id: actId,
        assertion_pointer: actPointer,
      });
    const documentUrl = safe ? officialUrl(x.document_url) : null;
    const docPointer = assertion(
      r,
      "/document_url",
      "document.source_url",
      documentUrl,
      url,
    );
    const docId = documentUrl
      ? identity("document", documentUrl, { source_url: documentUrl })
      : null;
    outcome(
      r,
      "document",
      docPointer,
      docId,
      safe
        ? docId
          ? "official_document_resource_url"
          : "document_not_available"
        : "public_safety_withheld",
      safe ? "insufficient_evidence" : "not_applicable",
    );
    if (docId)
      p.documentLinks.push({
        source_record_id: r.id,
        document_id: docId,
        assertion_pointer: docPointer,
        role: "main",
      });
    const classification = safe
      ? classifyAlboItem({ subject: text(x.subject) })
      : null;
    const pointer = assertion(
      r,
      "/_derived/taxonomy",
      "taxonomy.albo_classification",
      classification,
      url,
      true,
    );
    for (const facet of Object.keys(taxonomyFacets) as Array<
      keyof typeof taxonomyFacets
    >) {
      const value = classification
        ? facet === "document_type"
          ? classification.documentType
          : facet === "procurement_relevance"
            ? classification.procurementRelevance
            : classification.procurementPhase
        : null;
      const status = !safe
        ? "not_applicable"
        : value === "unknown"
          ? "unknown"
          : value === "not_applicable"
            ? "not_applicable"
            : classification!.taxonomyStatus;
      p.classifications.push({
        id: generateCanonicalUuidV7(),
        source_record_id: r.id,
        scheme_key: TAXONOMY_KEY,
        version: CANONICAL_TAXONOMY_VERSION,
        facet,
        concept_code: status === "classified" ? `${facet}.${value}` : null,
        status,
        method: ALBO_EXTRACTOR_VERSION,
        assertion_pointer: pointer,
      });
    }
    const candidates =
      classification && classification.procurementRelevance !== "none"
        ? classification.identifiers.cigs.length
          ? classification.identifiers.cigs.map((cig) => ({
              key: `procurement:${cig}`,
              cig,
            }))
          : [{ key: "procurement:unidentified", cig: null }]
        : [];
    if (!candidates.length)
      outcome(
        r,
        "procurement",
        pointer,
        null,
        safe ? "no_procurement_candidate" : "public_safety_withheld",
        "not_applicable",
      );
    for (const c of candidates) {
      p.mentions.push({
        id: generateCanonicalUuidV7(),
        source_record_id: r.id,
        candidate_key: c.key,
        cig: c.cig,
        relevance: classification!.procurementRelevance,
        phase: classification!.procurementPhase,
        assertion_pointer: pointer,
      });
      outcome(
        r,
        c.key,
        pointer,
        null,
        c.cig
          ? "identifier_mention_not_contract_identity"
          : "procurement_without_identifier",
        "review_required",
      );
    }
  }
  Object.assign(p.summary, {
    publications: p.publications.length,
    versions: p.versions.length,
    acts: p.acts.length,
    documents: p.documents.length,
    assertions: p.assertions.length,
    candidates: p.outcomes.length,
    resolved: p.outcomes.filter((x) => x.status === "resolved").length,
    unresolved: p.outcomes.filter((x) => x.status === "unresolved").length,
    nonResolved: p.outcomes.filter((x) => x.status !== "resolved").length,
    notApplicable: p.outcomes.filter((x) => x.status === "not_applicable")
      .length,
    insufficientEvidence: p.outcomes.filter(
      (x) => x.status === "insufficient_evidence",
    ).length,
    reviewRequired: p.outcomes.filter((x) => x.status === "review_required")
      .length,
    noCanonicalTarget: p.outcomes.filter(
      (x) => x.status === "no_canonical_target",
    ).length,
    classifications: p.classifications.length,
    procurementMentions: p.mentions.length,
  });
  return p;
}
