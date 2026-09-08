import {
  generateCanonicalUuidV7,
  isCanonicalUuidV7,
} from "./canonicalIdentity";
import {
  canonicalSnapshotJson,
  snapshotHash,
  type JsonObject,
} from "./sourceSnapshotPersistence";

export const PNRR_RESOLVER_VERSION = "pnrr-source-resolution.v1";
export const PNRR_EXTRACTOR_VERSION = "pnrr-snapshot-claims.v1";
export const PNRR_DECISION_RULE =
  "municipal_then_opencup_explicit_field_semantics.v1";

export type PnrrRegistryRecord = {
  id: string;
  collection_key: string;
  native_key: string | null;
  payload: JsonObject;
  legacy_id?: number | null;
};
export type ExistingProjectIdentifier = { value: string; project_id: string };

export const projectFieldTypes = {
  title: "text",
  mission: "text",
  component: "text",
  investment: "text",
  intervention: "text",
  programme_holder: "text",
  implementer: "text",
  financed_amount: "numeric(14,2)",
  execution_status: "text",
  start_date: "date",
  end_date: "date",
  published_at: "date",
  source_url: "text",
  attachments: "jsonb",
  cup_status: "text",
  opencup_total_cost: "numeric(14,2)",
  opencup_public_funding: "numeric(14,2)",
} as const;
type ProjectField = keyof typeof projectFieldTypes;
const municipalFields: Record<string, ProjectField> = {
  title: "title",
  mission: "mission",
  component: "component",
  investment: "investment",
  intervention: "intervention",
  holder: "programme_holder",
  attuatore: "implementer",
  amount_eur: "financed_amount",
  status: "execution_status",
  start_date: "start_date",
  end_date: "end_date",
  published_at: "published_at",
  source_url: "source_url",
  attachments: "attachments",
};
const opencupFields: Record<string, ProjectField> = {
  title: "title",
  cup_status: "cup_status",
  total_cost_eur: "opencup_total_cost",
  public_funding_eur: "opencup_public_funding",
};
type Assertion = {
  id: string;
  source_record_id: string;
  source_pointer: string;
  property_key: string;
  assertion_kind: "extracted" | "derived";
  value: unknown;
  value_state: "known" | "unknown";
  value_hash: string;
  source_url: string;
  extractor_version: string;
};
type Outcome = {
  id: string;
  source_record_id: string;
  candidate_key: string;
  assertion_pointer: string;
  target_subject_id: string | null;
  status: string;
  role: string;
  reason_code: string;
  resolver_version: string;
};
type FieldCandidate = {
  assertion: Assertion;
  value: unknown;
  priority: number;
  nativeKey: string;
};
type Project = {
  id: string;
  cup: string;
  fields: Record<string, unknown>;
  evidence: Assertion;
  candidates: Map<ProjectField, FieldCandidate[]>;
};

export function normalizedReportedCup(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  // Syntax is not validation by the issuing authority. Qualification records
  // that limitation; do not remove internal characters or merge by title.
  return /^[A-Z0-9]{15}$/.test(normalized) ? normalized : null;
}
function object(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function sourceUrl(value: unknown, origin: string): string {
  if (typeof value !== "string" || new URL(value).origin !== origin)
    throw new Error("PNRR_CLAIM_SOURCE_ORIGIN");
  return value;
}
function fieldValue(field: ProjectField, value: unknown): unknown {
  if (value === null || value === undefined) return null;
  const type = projectFieldTypes[field];
  if (type === "numeric(14,2)") {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value >= 1e12 ||
      Math.abs(value * 100 - Math.round(value * 100)) > 1e-4
    )
      throw new Error("PNRR_CANONICAL_AMOUNT_PRECISION");
    return value.toFixed(2);
  }
  if (type === "jsonb") {
    if (!Array.isArray(value)) throw new Error("PNRR_CANONICAL_ATTACHMENTS");
    return value;
  }
  if (typeof value !== "string" || !value.trim())
    throw new Error("PNRR_CANONICAL_FIELD_TYPE");
  if (type === "date") {
    const parsed = new Date(value + "T00:00:00.000Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    )
      throw new Error("PNRR_CANONICAL_DATE_PRECISION");
  }
  return value;
}
const pointerToken = (key: string) =>
  key.replaceAll("~", "~0").replaceAll("/", "~1");

/** Builds evidence independently of successful identity resolution. No I/O. */
export function buildCanonicalPnrrPlan(
  records: PnrrRegistryRecord[],
  existing: ExistingProjectIdentifier[] = [],
) {
  const known = new Map<string, string>();
  for (const row of existing) {
    if (
      !isCanonicalUuidV7(row.project_id) ||
      !normalizedReportedCup(row.value) ||
      known.has(row.value)
    )
      throw new Error("PNRR_CANONICAL_IDENTITY_INVALID");
    known.set(row.value, row.project_id);
  }
  const projects = new Map<string, Project>();
  const assertions: Assertion[] = [];
  const outcomes: Outcome[] = [];
  const mappings: Array<{ legacy_id: string; project_id: string }> = [];
  const seenRecords = new Set<string>();
  const claim = (
    record: PnrrRegistryRecord,
    pointer: string,
    key: string,
    value: unknown,
    url: string,
    derived = false,
  ): Assertion => {
    const actual = value ?? null;
    const a: Assertion = {
      id: generateCanonicalUuidV7(),
      source_record_id: record.id,
      source_pointer: pointer,
      property_key: `project.${/^[a-z][a-z0-9_]*$/.test(key) ? key : "source_field"}`,
      assertion_kind: derived ? "derived" : "extracted",
      value: actual,
      value_state: actual === null ? "unknown" : "known",
      value_hash: snapshotHash(canonicalSnapshotJson(actual)),
      source_url: url,
      extractor_version: PNRR_EXTRACTOR_VERSION,
    };
    assertions.push(a);
    return a;
  };
  const outcome = (
    record: PnrrRegistryRecord,
    candidate: string,
    a: Assertion,
    projectId: string | null,
    role: string,
    reason?: string,
  ) => {
    outcomes.push({
      id: generateCanonicalUuidV7(),
      source_record_id: record.id,
      candidate_key: candidate,
      assertion_pointer: a.source_pointer,
      target_subject_id: projectId,
      status: projectId
        ? "resolved"
        : reason === "cup_missing"
          ? "insufficient_evidence"
          : reason === "unknown_project_reference"
            ? "unresolved"
            : "review_required",
      role,
      reason_code: reason ?? "qualified_reported_cup",
      resolver_version: PNRR_RESOLVER_VERSION,
    });
  };
  const projectFor = (cup: string, a: Assertion): Project => {
    let project = projects.get(cup);
    if (!project) {
      project = {
        id: known.get(cup) ?? generateCanonicalUuidV7(),
        cup,
        evidence: a,
        fields: Object.fromEntries(
          Object.keys(projectFieldTypes).map((key) => [key, null]),
        ),
        candidates: new Map(),
      };
      projects.set(cup, project);
    }
    return project;
  };
  const candidatesFor = (
    record: PnrrRegistryRecord,
    payload: JsonObject,
    prefix: string,
    fields: Record<string, ProjectField>,
    url: string,
    priority: number,
    project: Project | null,
  ) => {
    const keys = new Set([
      ...Object.keys(payload),
      ...Object.keys(fields),
      "cup",
    ]);
    const claims = new Map<string, Assertion>();
    for (const key of [...keys].sort()) {
      // Nested OpenCUP has its own source URL and assertion pointers.
      if (!prefix && key === "opencup" && object(payload[key])) continue;
      const a = claim(
        record,
        `${prefix}/${pointerToken(key)}`,
        key,
        payload[key],
        url,
        ["attachments", "albo_evidence_ids", "opencup_acquisition"].includes(
          key,
        ),
      );
      claims.set(key, a);
      const field = fields[key];
      if (field && project) {
        const list = project.candidates.get(field) ?? [];
        list.push({
          assertion: a,
          value: fieldValue(field, payload[key]),
          priority,
          nativeKey: record.native_key ?? record.id,
        });
        project.candidates.set(field, list);
      }
    }
    return claims;
  };

  const projectRecords = records.filter((r) => r.collection_key === "projects");
  for (const record of records) {
    if (
      !isCanonicalUuidV7(record.id) ||
      seenRecords.has(record.id) ||
      !object(record.payload) ||
      !["projects", "albo_evidence"].includes(record.collection_key)
    )
      throw new Error("PNRR_REGISTRY_RECORD_INVALID");
    seenRecords.add(record.id);
  }
  for (const record of projectRecords) {
    const p = record.payload;
    const url = sourceUrl(
      p.source_url,
      "https://www.comune.lamezia-terme.cz.it",
    );
    const cup = normalizedReportedCup(p.cup);
    // Every candidate gets one CUP assertion, including explicit unknown.
    const cupEvidence = claim(record, "/cup", "cup", p.cup, url);
    const project = cup ? projectFor(cup, cupEvidence) : null;
    const rest = { ...p };
    // candidatesFor includes CUP; keep only one pointer in the assertion list.
    assertions.pop();
    const claims = candidatesFor(
      record,
      rest,
      "",
      municipalFields,
      url,
      0,
      project,
    );
    if (project && project.evidence === cupEvidence)
      project.evidence = claims.get("cup")!;
    outcome(
      record,
      "/municipal",
      claims.get("cup")!,
      project?.id ?? null,
      "project_description",
      cup
        ? undefined
        : p.cup == null || p.cup === ""
          ? "cup_missing"
          : "cup_invalid_format",
    );
    if (project && record.legacy_id != null)
      mappings.push({
        legacy_id: String(record.legacy_id),
        project_id: project.id,
      });

    if (object(p.opencup)) {
      const other = p.opencup;
      const otherUrl = sourceUrl(
        other.source_url,
        "https://www.opencup.gov.it",
      );
      const otherCup = normalizedReportedCup(other.cup);
      // A different CUP inside an enrichment is a review case, not permission
      // to silently attach the other project's facts to the parent project.
      const target = otherCup && otherCup === cup ? project : null;
      const more = candidatesFor(
        record,
        other,
        "/opencup",
        opencupFields,
        otherUrl,
        1,
        target,
      );
      outcome(
        record,
        "/opencup",
        more.get("cup")!,
        target?.id ?? null,
        "project_description",
        target ? undefined : "opencup_parent_identity_mismatch",
      );
    }
  }
  for (const record of records.filter(
    (r) => r.collection_key === "albo_evidence",
  )) {
    const p = record.payload;
    const url = sourceUrl(p.source_url, "https://albo.tinnvision.cloud");
    const cups = Array.isArray(p.cups) && p.cups.length ? p.cups : [null];
    for (const [index, raw] of cups.entries()) {
      const cup = normalizedReportedCup(raw);
      const a = claim(
        record,
        `/cups/${index}`,
        "referenced_cup",
        raw,
        url,
        true,
      );
      const id = cup ? (projects.get(cup)?.id ?? known.get(cup) ?? null) : null;
      outcome(
        record,
        `/references/${index}`,
        a,
        id,
        "project_reference",
        id ? undefined : cup ? "unknown_project_reference" : "cup_missing",
      );
    }
  }

  const fields: Array<{
    id: string;
    project_id: string;
    field: string;
    source_record_id: string;
    assertion_pointer: string;
    alternative_count: number;
    decision_rule: string;
    resolver_version: string;
  }> = [];
  for (const project of projects.values()) {
    for (const [field, candidates] of project.candidates) {
      candidates.sort(
        (a, b) =>
          a.priority - b.priority ||
          a.nativeKey.localeCompare(b.nativeKey) ||
          a.assertion.source_record_id.localeCompare(
            b.assertion.source_record_id,
          ),
      );
      const chosen = candidates[0];
      project.fields[field] = chosen.value;
      const variants = new Set(
        candidates
          .filter((c) => c.value !== null)
          .map((c) => canonicalSnapshotJson(c.value)),
      );
      fields.push({
        id: generateCanonicalUuidV7(),
        project_id: project.id,
        field,
        source_record_id: chosen.assertion.source_record_id,
        assertion_pointer: chosen.assertion.source_pointer,
        alternative_count: Math.max(
          0,
          variants.size - (chosen.value === null ? 0 : 1),
        ),
        decision_rule: PNRR_DECISION_RULE,
        resolver_version: PNRR_RESOLVER_VERSION,
      });
    }
  }
  return {
    schemaVersion: "lt-canonical-pnrr-plan.v1",
    resolverVersion: PNRR_RESOLVER_VERSION,
    extractorVersion: PNRR_EXTRACTOR_VERSION,
    sourceRecordIds: records.map((r) => r.id),
    projects: [...projects.values()].map((p) => ({
      id: p.id,
      cup: p.cup,
      ...p.fields,
    })),
    identifiers: [...projects.values()].map((p) => ({
      id: generateCanonicalUuidV7(),
      project_id: p.id,
      value: p.cup,
      source_record_id: p.evidence.source_record_id,
      assertion_pointer: p.evidence.source_pointer,
    })),
    assertions,
    outcomes,
    fields,
    mappings,
    summary: {
      sourceRecords: records.length,
      projectRecords: projectRecords.length,
      projects: projects.size,
      assertions: assertions.length,
      candidates: outcomes.length,
      resolved: outcomes.filter((x) => x.status === "resolved").length,
      unresolved: outcomes.filter((x) => x.status !== "resolved").length,
      fields: fields.length,
      fieldsWithAlternatives: fields.filter((x) => x.alternative_count > 0)
        .length,
    },
  };
}
export type CanonicalPnrrPlan = ReturnType<typeof buildCanonicalPnrrPlan>;
