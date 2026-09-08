import type { SnapshotQueryClient } from "./sourceSnapshotPersistence";
import { PNRR_RESOLVER_VERSION } from "./canonicalPnrrPlan";

export type ProjectReconciliation = {
  status: "verified" | "review_required" | "not_materialized";
  sourceSnapshotAt: string | null;
  sourceRecords: number;
  projectRecords: number;
  canonicalProjects: number;
  resolvedCandidates: number;
  unresolvedCandidates: number;
  unprocessedRecords: number;
  currentFieldDecisions: number;
  fieldsWithAlternatives: number;
  typedValueMismatches: number;
  unmappedLegacyRows: number;
  legacyValueMismatches: number;
};

export const canonicalPnrrCoverageSql = `WITH latest AS (
  SELECT r.id,r.source_timestamp_raw FROM public.source_releases r
  JOIN public.source_endpoints e ON e.id=r.endpoint_id
  JOIN public.source_sources s ON s.id=e.source_id
  JOIN public.source_acquisition_runs run ON run.release_id=r.id AND run.status='succeeded'
  WHERE s.source_key='lamezia.pnrr.municipal' ORDER BY run.started_at DESC,run.id DESC LIMIT 1
), records AS (SELECT r.* FROM public.source_records r JOIN latest ON latest.id=r.release_id),
outcomes AS (SELECT o.* FROM public.core_resolution_outcomes o JOIN records r ON r.id=o.source_record_id WHERE o.resolver_version='${PNRR_RESOLVER_VERSION}'),
mapped AS (SELECT a.*,p.id AS canonical_id,
  EXISTS(SELECT 1 FROM public.project_identifiers i WHERE i.project_id=p.id AND i.scheme='CUP' AND i.issuer='it.dipe' AND i.value=upper(btrim(a.cup))) AS cup_matches,
  p.title AS canonical_title,p.mission AS canonical_mission,p.component AS canonical_component,
  p.investment AS canonical_investment,p.intervention AS canonical_intervention,p.programme_holder,p.implementer,p.financed_amount,p.execution_status,
  p.start_date AS canonical_start,p.end_date AS canonical_end,p.published_at AS canonical_published,p.source_url,p.attachments AS canonical_attachments
  FROM public.attuazione_pnrr_projects a
  LEFT JOIN public.legacy_subject_map m ON m.legacy_namespace='postgres' AND m.legacy_type='attuazione_pnrr_projects' AND m.legacy_id=a.id::text AND m.valid_to IS NULL
  LEFT JOIN public.project_projects p ON p.id=m.subject_id)
SELECT
  (SELECT source_timestamp_raw FROM latest) AS "sourceSnapshotAt",
  (SELECT count(*)::int FROM records) AS "sourceRecords",
  (SELECT count(*)::int FROM records WHERE collection_key='projects') AS "projectRecords",
  (SELECT count(*)::int FROM public.project_projects) AS "canonicalProjects",
  (SELECT count(*)::int FROM outcomes WHERE status='resolved') AS "resolvedCandidates",
  (SELECT count(*)::int FROM outcomes WHERE status<>'resolved') AS "unresolvedCandidates",
  (SELECT count(*)::int FROM records r WHERE NOT EXISTS(SELECT 1 FROM outcomes o WHERE o.source_record_id=r.id)) AS "unprocessedRecords",
  (SELECT count(*)::int FROM public.project_field_resolutions WHERE valid_to IS NULL) AS "currentFieldDecisions",
  (SELECT count(*)::int FROM public.project_field_resolutions WHERE valid_to IS NULL AND alternative_count>0) AS "fieldsWithAlternatives",
  (SELECT count(*)::int FROM public.project_field_resolutions r JOIN public.project_projects p ON p.id=r.project_id JOIN public.core_assertions a ON a.id=r.selected_assertion_id
    WHERE r.valid_to IS NULL AND to_jsonb(p)->r.field IS DISTINCT FROM a.value) AS "typedValueMismatches",
  (SELECT count(*)::int FROM mapped WHERE canonical_id IS NULL OR NOT cup_matches) AS "unmappedLegacyRows",
  (SELECT count(*)::int FROM mapped WHERE canonical_id IS NOT NULL AND
    (title,mission,component,investment,intervention,holder,attuatore,importo_finanziato,status,
     (start_date AT TIME ZONE 'UTC')::date,(end_date AT TIME ZONE 'UTC')::date,(published_at AT TIME ZONE 'UTC')::date,url,attachments)
    IS DISTINCT FROM
    (canonical_title,canonical_mission,canonical_component,canonical_investment,canonical_intervention,programme_holder,implementer,financed_amount,execution_status,
     canonical_start,canonical_end,canonical_published,source_url,canonical_attachments)) AS "legacyValueMismatches"`;

export async function readCanonicalPnrrCoverage(
  client: SnapshotQueryClient,
): Promise<ProjectReconciliation> {
  const row = (await client.query(canonicalPnrrCoverageSql)).rows[0];
  if (!row) throw new Error("PNRR_COVERAGE_UNAVAILABLE");
  const { sourceSnapshotAt, ...counts } = row;
  const result = Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, Number(value)]),
  ) as Omit<ProjectReconciliation, "status" | "sourceSnapshotAt">;
  if (Object.values(result).some((v) => !Number.isSafeInteger(v) || v < 0))
    throw new Error("PNRR_COVERAGE_INVALID");
  return {
    sourceSnapshotAt:
      typeof sourceSnapshotAt === "string" ? sourceSnapshotAt : null,
    status:
      !result.sourceRecords || !result.canonicalProjects
        ? "not_materialized"
        : result.unresolvedCandidates ||
            result.unprocessedRecords ||
            result.typedValueMismatches ||
            result.unmappedLegacyRows ||
            result.legacyValueMismatches
          ? "review_required"
          : "verified",
    ...result,
  };
}
