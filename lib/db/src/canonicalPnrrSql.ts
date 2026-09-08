import {
  PNRR_DECISION_RULE,
  projectFieldTypes,
  type CanonicalPnrrPlan,
} from "./canonicalPnrrPlan";
import type { SnapshotStatement } from "./sourceSnapshotPersistence";

export const canonicalPnrrRecordsSql = `
  WITH latest AS (
    SELECT r.id FROM public.source_releases r
    JOIN public.source_endpoints e ON e.id = r.endpoint_id
    JOIN public.source_sources s ON s.id = e.source_id
    JOIN public.source_acquisition_runs run ON run.release_id = r.id AND run.status = 'succeeded'
    WHERE s.source_key = 'lamezia.pnrr.municipal'
    ORDER BY run.started_at DESC, run.id DESC LIMIT 1
  )
  SELECT r.id, r.collection_key, r.native_key, r.payload, a.id AS legacy_id
  FROM public.source_records r JOIN latest ON latest.id = r.release_id
  LEFT JOIN public.attuazione_pnrr_projects a ON r.collection_key = 'projects' AND a.source_id = r.native_key
  ORDER BY r.collection_key, r.ordinal`;
export const canonicalPnrrIdentifiersSql = `SELECT i.value, i.project_id
  FROM public.project_identifiers i WHERE i.scheme = 'CUP' AND i.issuer = 'it.dipe'`;

const fields = Object.keys(projectFieldTypes);
const declarations = fields
  .map((f) => `${f} ${projectFieldTypes[f as keyof typeof projectFieldTypes]}`)
  .join(",");
const projects = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'projects') AS x(id uuid,cup text,${declarations})`;
const assertions = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'assertions') AS x(id uuid,source_record_id uuid,source_pointer text,property_key text,assertion_kind text,value jsonb,value_state text,value_hash text,source_url text,extractor_version text)`;
const outcomes = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'outcomes') AS x(id uuid,source_record_id uuid,candidate_key text,assertion_pointer text,target_subject_id uuid,status text,role text,reason_code text,resolver_version text)`;
const resolutions = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'fields') AS x(id uuid,project_id uuid,field text,source_record_id uuid,assertion_pointer text,alternative_count integer,decision_rule text,resolver_version text)`;
const identifiers = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'identifiers') AS x(id uuid,project_id uuid,value text,source_record_id uuid,assertion_pointer text)`;
const mappings = `pg_temp.lt_pnrr_plan p CROSS JOIN LATERAL jsonb_to_recordset(p.body->'mappings') AS x(legacy_id text,project_id uuid)`;
const assertionJoin = `a.source_record_id = x.source_record_id AND a.source_pointer = x.assertion_pointer AND a.extractor_version = p.body->>'extractorVersion'`;

/** Caller owns BEGIN/advisory lock/COMMIT. Every proof runs before COMMIT. */
export function canonicalPnrrStatements(
  plan: CanonicalPnrrPlan,
): SnapshotStatement[] {
  const sql = [
    `CREATE TEMPORARY TABLE lt_pnrr_plan (body jsonb NOT NULL) ON COMMIT DROP`,
    `INSERT INTO pg_temp.lt_pnrr_plan(body) VALUES ($1::jsonb)`,
    // Refuse to erase manual decisions or unexplained edits to typed values.
    `DO $guard$ BEGIN
      IF EXISTS (SELECT 1 FROM public.project_field_resolutions r
        JOIN public.project_projects q ON q.id=r.project_id
        JOIN public.core_assertions a ON a.id=r.selected_assertion_id
        WHERE r.valid_to IS NULL AND r.project_id IN (SELECT (v->>'id')::uuid FROM pg_temp.lt_pnrr_plan, jsonb_array_elements(body->'projects') v) AND (r.decision_rule <> '${PNRR_DECISION_RULE}'
          OR to_jsonb(q)->r.field IS DISTINCT FROM a.value)) THEN
        RAISE EXCEPTION 'PNRR_MANUAL_REVIEW_REQUIRED';
      END IF;
    END $guard$`,
    `INSERT INTO public.core_assertions(id,source_record_id,source_pointer,property_key,assertion_kind,value,value_state,value_hash,source_url,extractor_version)
     SELECT x.id,x.source_record_id,x.source_pointer,x.property_key,x.assertion_kind,COALESCE(x.value,'null'::jsonb),x.value_state,x.value_hash,x.source_url,x.extractor_version FROM ${assertions}
     ON CONFLICT (source_record_id,source_pointer,extractor_version) DO NOTHING`,
    `INSERT INTO public.canonical_subjects(subject_id,subject_kind,domain_type)
     SELECT x.id,'entity','project.project' FROM ${projects} ON CONFLICT(subject_id) DO NOTHING`,
    `INSERT INTO public.project_projects(id,${fields.join(",")})
     SELECT x.id,${fields.map((f) => `x.${f}`).join(",")} FROM ${projects}
     ON CONFLICT(id) DO UPDATE SET ${fields.map((f) => `${f}=EXCLUDED.${f}`).join(",")},updated_at=now()
     WHERE (${fields.map((f) => `project_projects.${f}`).join(",")}) IS DISTINCT FROM (${fields.map((f) => `EXCLUDED.${f}`).join(",")})`,
    `INSERT INTO public.project_identifiers(id,project_id,scheme,issuer,value,qualification,evidence_assertion_id)
     SELECT x.id,x.project_id,'CUP','it.dipe',x.value,'source_reported_format_checked',a.id
     FROM ${identifiers} JOIN public.core_assertions a ON ${assertionJoin}
     ON CONFLICT(scheme,issuer,value) DO NOTHING`,
    `INSERT INTO public.core_resolution_outcomes(id,source_record_id,candidate_key,assertion_id,target_subject_id,status,role,reason_code,resolver_version)
     SELECT x.id,x.source_record_id,x.candidate_key,a.id,x.target_subject_id,x.status,x.role,x.reason_code,x.resolver_version
     FROM ${outcomes} JOIN public.core_assertions a ON ${assertionJoin}
     ON CONFLICT(source_record_id,candidate_key,resolver_version) DO NOTHING`,
    `WITH expected AS (SELECT x.*,a.id AS assertion_id FROM ${resolutions} JOIN public.core_assertions a ON ${assertionJoin})
     UPDATE public.project_field_resolutions old SET valid_to=now() FROM expected x
     WHERE old.project_id=x.project_id AND old.field=x.field AND old.valid_to IS NULL
       AND (old.selected_assertion_id,old.alternative_count,old.decision_rule,old.resolver_version)
         IS DISTINCT FROM (x.assertion_id,x.alternative_count,x.decision_rule,x.resolver_version)`,
    `INSERT INTO public.project_field_resolutions(id,project_id,field,selected_assertion_id,alternative_count,decision_rule,resolver_version)
     SELECT x.id,x.project_id,x.field,a.id,x.alternative_count,x.decision_rule,x.resolver_version
     FROM ${resolutions} JOIN public.core_assertions a ON ${assertionJoin}
     ON CONFLICT(project_id,field) WHERE valid_to IS NULL DO NOTHING`,
    `INSERT INTO public.legacy_subject_map(legacy_namespace,legacy_type,legacy_id,subject_id,resolution_method,mapping_status)
     SELECT 'postgres','attuazione_pnrr_projects',x.legacy_id,x.project_id,'qualified_reported_cup','active' FROM ${mappings}
     ON CONFLICT(legacy_namespace,legacy_type,legacy_id) WHERE valid_to IS NULL DO NOTHING`,
    `DO $proof$ BEGIN
      IF EXISTS (SELECT 1 FROM ${assertions} LEFT JOIN public.core_assertions a
        ON a.source_record_id=x.source_record_id AND a.source_pointer=x.source_pointer AND a.extractor_version=x.extractor_version
        WHERE a.id IS NULL OR (a.value,a.value_hash,a.property_key,a.assertion_kind,a.source_url,a.value_state)
          IS DISTINCT FROM (COALESCE(x.value,'null'::jsonb),x.value_hash,x.property_key,x.assertion_kind,x.source_url,x.value_state))
      THEN RAISE EXCEPTION 'PNRR_ASSERTION_CONFLICT'; END IF;
      IF EXISTS (SELECT 1 FROM ${projects}
        LEFT JOIN public.project_projects q ON q.id=x.id
        LEFT JOIN public.canonical_subjects s ON s.subject_id=q.id
        WHERE q.id IS NULL OR s.subject_kind <> 'entity' OR s.domain_type <> 'project.project'
          OR (${fields.map((f) => `q.${f}`).join(",")}) IS DISTINCT FROM (${fields.map((f) => `x.${f}`).join(",")}))
      THEN RAISE EXCEPTION 'PNRR_CANONICAL_PROJECT_CONFLICT'; END IF;
      IF EXISTS (SELECT 1 FROM ${identifiers} LEFT JOIN public.project_identifiers i
        ON i.scheme='CUP' AND i.issuer='it.dipe' AND i.value=x.value
        WHERE i.id IS NULL OR i.project_id<>x.project_id)
      THEN RAISE EXCEPTION 'PNRR_IDENTIFIER_CONFLICT'; END IF;
      IF EXISTS (SELECT 1 FROM ${outcomes} LEFT JOIN public.core_resolution_outcomes r
        ON r.source_record_id=x.source_record_id AND r.candidate_key=x.candidate_key AND r.resolver_version=x.resolver_version
        LEFT JOIN public.core_assertions a ON a.id=r.assertion_id
        WHERE r.id IS NULL OR (r.status,r.target_subject_id,r.reason_code,r.role,a.source_pointer)
          IS DISTINCT FROM (x.status,x.target_subject_id,x.reason_code,x.role,x.assertion_pointer))
      THEN RAISE EXCEPTION 'PNRR_RESOLUTION_CONFLICT'; END IF;
      IF EXISTS (SELECT 1 FROM ${resolutions} LEFT JOIN public.project_field_resolutions r
        ON r.project_id=x.project_id AND r.field=x.field AND r.valid_to IS NULL
        LEFT JOIN public.core_assertions a ON a.id=r.selected_assertion_id
        WHERE r.id IS NULL OR (a.source_record_id,a.source_pointer,r.alternative_count,r.decision_rule,r.resolver_version)
          IS DISTINCT FROM (x.source_record_id,x.assertion_pointer,x.alternative_count,x.decision_rule,x.resolver_version))
      THEN RAISE EXCEPTION 'PNRR_FIELD_PROVENANCE_CONFLICT'; END IF;
      IF EXISTS (SELECT 1 FROM ${mappings} LEFT JOIN public.legacy_subject_map m
        ON m.legacy_namespace='postgres' AND m.legacy_type='attuazione_pnrr_projects' AND m.legacy_id=x.legacy_id AND m.valid_to IS NULL
        WHERE m.subject_id IS DISTINCT FROM x.project_id)
      THEN RAISE EXCEPTION 'PNRR_LEGACY_IDENTITY_CONFLICT'; END IF;
    END $proof$`,
    `SELECT 'verified'::text AS status, body->'summary' AS summary FROM pg_temp.lt_pnrr_plan`,
  ];
  return sql.map((text, index) => ({
    text,
    values: index === 1 ? [JSON.stringify(plan)] : [],
  }));
}
