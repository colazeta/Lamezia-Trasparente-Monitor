import type { CanonicalAlboPlan } from "./canonicalAlboPlan";
import {
  ALBO_EXTRACTOR_VERSION,
  TAXONOMY_KEY,
  taxonomyFacets,
  taxonomyDefinitionHash,
} from "./canonicalAlboPlan";
import type { SnapshotStatement } from "./sourceSnapshotPersistence";

export const canonicalAlboRecordsSql = `WITH latest AS (
  SELECT DISTINCT ON (s.source_key) rel.id,s.source_key
  FROM public.source_releases rel JOIN public.source_endpoints e ON e.id=rel.endpoint_id
  JOIN public.source_sources s ON s.id=e.source_id
  JOIN public.source_acquisition_runs run ON run.release_id=rel.id AND run.status='succeeded'
  WHERE s.source_key IN ('lamezia.albo.current','lamezia.albo.delibere')
  ORDER BY s.source_key,run.started_at DESC,run.id DESC)
  SELECT r.id,latest.source_key,r.collection_key,r.native_key,r.payload
  FROM public.source_records r JOIN latest ON latest.id=r.release_id
  ORDER BY latest.source_key,r.collection_key,r.ordinal`;

export const canonicalAlboIdentitiesSql = `SELECT id,'publication'::text AS kind,publication_number AS key FROM public.document_publications
  UNION ALL SELECT id,'document',source_url FROM public.document_documents
  UNION ALL SELECT id,'act',jsonb_build_array(issuer_key,office,act_type,act_number,act_date::text)::text FROM public.document_acts`;

type Spec = {
  array: keyof CanonicalAlboPlan;
  table: string;
  columns: Record<string, string>;
  keys: string[];
  evidence?: boolean;
  ignoreId?: boolean;
};
// Static SQL definitions: no input controls an identifier or SQL fragment.
const specs: Spec[] = [
  {
    array: "assertions",
    table: "core_assertions",
    columns: {
      id: "uuid",
      source_record_id: "uuid",
      source_pointer: "text",
      property_key: "text",
      assertion_kind: "text",
      value: "jsonb",
      value_state: "text",
      value_hash: "text",
      source_url: "text",
      extractor_version: "text",
    },
    keys: ["source_record_id", "source_pointer", "extractor_version"],
    ignoreId: true,
  },
  {
    array: "subjects",
    table: "canonical_subjects",
    columns: { subject_id: "uuid", subject_kind: "text", domain_type: "text" },
    keys: ["subject_id"],
  },
  {
    array: "publications",
    table: "document_publications",
    columns: { id: "uuid", register_key: "text", publication_number: "text" },
    keys: ["register_key", "publication_number"],
  },
  {
    array: "acts",
    table: "document_acts",
    columns: {
      id: "uuid",
      issuer_key: "text",
      office: "text",
      act_type: "text",
      act_number: "text",
      act_date: "date",
    },
    keys: ["issuer_key", "office", "act_type", "act_number", "act_date"],
  },
  {
    array: "documents",
    table: "document_documents",
    columns: { id: "uuid", source_url: "text" },
    keys: ["source_url"],
  },
  {
    array: "versions",
    table: "document_publication_versions",
    columns: {
      source_record_id: "uuid",
      publication_id: "uuid",
      source_url: "text",
      title: "text",
      publication_start: "date",
      publication_end: "date",
      public_visibility: "text",
      policy_version: "text",
      resolver_version: "text",
    },
    keys: ["source_record_id"],
  },
  {
    array: "actLinks",
    table: "document_publication_acts",
    columns: {
      source_record_id: "uuid",
      act_id: "uuid",
      evidence_assertion_id: "uuid",
    },
    keys: ["source_record_id"],
    evidence: true,
  },
  {
    array: "documentLinks",
    table: "document_publication_documents",
    columns: {
      source_record_id: "uuid",
      document_id: "uuid",
      evidence_assertion_id: "uuid",
      role: "text",
    },
    keys: ["source_record_id", "document_id"],
    evidence: true,
  },
  {
    array: "outcomes",
    table: "core_resolution_outcomes",
    columns: {
      id: "uuid",
      source_record_id: "uuid",
      candidate_key: "text",
      assertion_id: "uuid",
      target_subject_id: "uuid",
      status: "text",
      role: "text",
      reason_code: "text",
      resolver_version: "text",
    },
    keys: ["source_record_id", "candidate_key", "resolver_version"],
    evidence: true,
    ignoreId: true,
  },
  {
    array: "classifications",
    table: "taxonomy_classifications",
    columns: {
      id: "uuid",
      source_record_id: "uuid",
      scheme_key: "text",
      version: "text",
      facet: "text",
      concept_code: "text",
      status: "text",
      method: "text",
      evidence_assertion_id: "uuid",
    },
    keys: ["source_record_id", "scheme_key", "version", "facet", "method"],
    evidence: true,
    ignoreId: true,
  },
  {
    array: "mentions",
    table: "procurement_mentions",
    columns: {
      id: "uuid",
      source_record_id: "uuid",
      candidate_key: "text",
      cig: "text",
      relevance: "text",
      phase: "text",
      evidence_assertion_id: "uuid",
    },
    keys: ["source_record_id", "candidate_key"],
    evidence: true,
    ignoreId: true,
  },
];
function expected(spec: Spec) {
  const columns = Object.keys(spec.columns),
    declarations = columns
      .filter((c) => c !== "evidence_assertion_id" && c !== "assertion_id")
      .map((c) => `${c} ${spec.columns[c]}`);
  if (spec.evidence) declarations.push("assertion_pointer text");
  const value = (c: string) =>
    c === "evidence_assertion_id" || c === "assertion_id"
      ? "a.id"
      : c === "value"
        ? "COALESCE(x.value,'null'::jsonb)"
        : `x.${c}`;
  return `SELECT ${columns.map((c) => `${value(c)} AS ${c}`).join(",")} FROM pg_temp.lt_albo_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'${spec.array}') AS x(${declarations.join(",")}) ${spec.evidence ? `JOIN public.core_assertions a ON a.source_record_id=x.source_record_id AND a.source_pointer=x.assertion_pointer AND a.extractor_version='${ALBO_EXTRACTOR_VERSION}'` : ""}`;
}
export function canonicalAlboStatements(
  plan: CanonicalAlboPlan,
): SnapshotStatement[] {
  const concepts = Object.entries(taxonomyFacets).flatMap(([facet, values]) =>
    values.map((value) => ({
      scheme_key: TAXONOMY_KEY,
      version: plan.taxonomyVersion,
      code: `${facet}.${value}`,
      facet,
    })),
  );
  const sql: SnapshotStatement[] = [
    {
      text: "CREATE TEMPORARY TABLE lt_albo_plan(body jsonb NOT NULL) ON COMMIT DROP",
      values: [],
    },
    {
      text: "INSERT INTO pg_temp.lt_albo_plan VALUES ($1::jsonb)",
      values: [JSON.stringify(plan)],
    },
    {
      text: "INSERT INTO public.taxonomy_schemes(scheme_key,version,definition_hash) VALUES ($1,$2,$3) ON CONFLICT(scheme_key,version) DO NOTHING",
      values: [TAXONOMY_KEY, plan.taxonomyVersion, taxonomyDefinitionHash],
    },
    {
      text: "SELECT definition_hash FROM public.taxonomy_schemes WHERE scheme_key=$1 AND version=$2",
      values: [TAXONOMY_KEY, plan.taxonomyVersion],
    },
    {
      text: `DO $proof$ BEGIN IF EXISTS (SELECT 1 FROM public.taxonomy_schemes WHERE scheme_key='${TAXONOMY_KEY}' AND version=(SELECT body->>'taxonomyVersion' FROM pg_temp.lt_albo_plan) AND definition_hash <> '${taxonomyDefinitionHash}') THEN RAISE EXCEPTION 'ALBO_TAXONOMY_VERSION_CONFLICT'; END IF; END $proof$`,
      values: [],
    },
    {
      text: "INSERT INTO public.taxonomy_concepts(scheme_key,version,code,facet) SELECT scheme_key,version,code,facet FROM jsonb_to_recordset($1::jsonb) x(scheme_key text,version text,code text,facet text) ON CONFLICT(scheme_key,version,code) DO NOTHING",
      values: [JSON.stringify(concepts)],
    },
  ];
  for (const spec of specs) {
    const columns = Object.keys(spec.columns),
      comparable = columns.filter((c) => !spec.ignoreId || c !== "id"),
      source = expected(spec);
    sql.push({
      text: `WITH expected AS (${source}) INSERT INTO public.${spec.table}(${columns.join(",")}) SELECT ${columns.join(",")} FROM expected ON CONFLICT(${spec.keys.join(",")}) DO NOTHING`,
      values: [],
    });
    sql.push({
      text: `DO $proof$ BEGIN IF EXISTS (WITH expected AS (${source}) SELECT 1 FROM expected x LEFT JOIN public.${spec.table} q ON ${spec.keys.map((c) => `q.${c} IS NOT DISTINCT FROM x.${c}`).join(" AND ")} WHERE q.${spec.keys[0]} IS NULL OR (${comparable.map((c) => `q.${c}`).join(",")}) IS DISTINCT FROM (${comparable.map((c) => `x.${c}`).join(",")})) OR (SELECT count(*) FROM (${source}) e) <> (SELECT jsonb_array_length(body->'${spec.array}') FROM pg_temp.lt_albo_plan) THEN RAISE EXCEPTION 'ALBO_${spec.array.toUpperCase()}_CONFLICT'; END IF; END $proof$`,
      values: [],
    });
  }
  sql.push({
    text: "SELECT body->'summary' AS summary FROM pg_temp.lt_albo_plan",
    values: [],
  });
  return sql;
}
