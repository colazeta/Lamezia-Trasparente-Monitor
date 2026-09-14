import type {
  SnapshotPlan,
  SnapshotQueryClient,
  SnapshotStatement,
} from "./sourceSnapshotPersistence";
import {
  MUNICIPAL_DEMOGRAPHIC_EXTRACTOR,
  MUNICIPAL_GEOGRAPHY_CODE,
  planMunicipalDemographicSource,
} from "./municipalDemographicPlan";

/** The caller owns the source-import transaction and its source-specific advisory lock. */
export function municipalDemographicStatements(
  p: SnapshotPlan,
  sourceReleaseId: string,
) {
  const plan = planMunicipalDemographicSource(
    p.source.key,
    JSON.parse(p.contentText),
  );
  const { definition, metadata } = plan;
  const description =
    "Fonte comunale autonoma. Definizioni e limiti originali sono conservati nelle release collegate. Le date di acquisizione e generazione non sostituiscono il periodo di riferimento.";
  const upstream = p.source.upstreamUrls[1];
  const externalKey = `comune:c_m208:${definition.datasetId}:${definition.resourceId}`;
  const releaseMetadata = {
    extractor_version: MUNICIPAL_DEMOGRAPHIC_EXTRACTOR,
    source_registry_release_id: sourceReleaseId,
    source_collection: definition.collection,
    source_native_key_field: "_native_key",
    source_csv_url: metadata.source_csv_url,
    source_generated_at: metadata.generated_at,
    source_metadata_modified: metadata.metadata_modified ?? null,
    source_resource_last_modified: metadata.resource_last_modified ?? null,
    source_caveat: metadata.caveat,
    evidence_kind: "repository_derived_dataset",
    reference_day: null,
    reference_period_unspecified:
      definition.collection === "family_children_rows",
  };
  const series = [
    definition.seriesKey,
    definition.title,
    description,
    definition.unit,
    definition.datasetId,
    upstream,
    externalKey,
  ];
  const observations = JSON.stringify(plan.observations);
  const seriesInsert: SnapshotStatement = {
    text: `INSERT INTO public.demographic_series
      (series_key,title,description,unit,geography_level,reference_type,source,source_dataset,source_url,external_key)
      VALUES ($1,$2,$3,$4,'municipality','stock','Comune di Lamezia Terme',$5,$6,$7)
      ON CONFLICT(series_key) DO NOTHING`,
    values: series,
  };
  const releaseInsert: SnapshotStatement = {
    text: `INSERT INTO public.demographic_releases
      (series_id,source_dataset,source_url,source_hash,source_version,release_date,raw_payload,metadata)
      SELECT s.id,$2,a.locator,$3,'repository:'||a.repository_commit,NULL,NULL,$5::jsonb
      FROM public.demographic_series s
      JOIN public.source_releases sr ON sr.id=$4::uuid
      JOIN public.source_artifacts a ON a.id=sr.artifact_id
      WHERE s.series_key=$1 AND a.byte_hash=$3
      ON CONFLICT(series_id,source_hash) DO NOTHING`,
    values: [
      definition.seriesKey,
      definition.datasetId,
      p.byteHash,
      sourceReleaseId,
      JSON.stringify(releaseMetadata),
    ],
  };
  const observationInsert: SnapshotStatement = {
    text: `WITH inserted AS (
      INSERT INTO public.demographic_observations
        (series_id,release_id,geography_code,reference_period,reference_type,dimensions,dimension_key,value,unit,source_status,source_observation_status,quality_flags)
      SELECT s.id,r.id,$3,x.reference_period,'stock',x.dimensions,x.dimension_key,x.value::numeric,$4,'unknown',NULL,x.quality_flags
      FROM public.demographic_series s
      JOIN public.demographic_releases r ON r.series_id=s.id AND r.source_hash=$2
      CROSS JOIN jsonb_to_recordset($5::jsonb) AS x(reference_period text,dimensions jsonb,dimension_key text,value text,quality_flags jsonb)
      WHERE s.series_key=$1
      ON CONFLICT(release_id,geography_code,reference_period,dimension_key) DO NOTHING
      RETURNING id) SELECT count(*)::integer AS inserted FROM inserted`,
    values: [
      definition.seriesKey,
      p.byteHash,
      MUNICIPAL_GEOGRAPHY_CODE,
      definition.unit,
      observations,
    ],
  };
  const verify: SnapshotStatement = {
    text: `WITH expected AS MATERIALIZED (
        SELECT * FROM jsonb_to_recordset($12::jsonb) AS x(reference_period text,dimensions jsonb,dimension_key text,value text,source_native_key text,quality_flags jsonb)
      )
      SELECT s.id AS series_id,r.id AS release_id,
        (SELECT count(*)::integer FROM public.demographic_observations WHERE release_id=r.id) AS observations,
        (s.title=$2 AND s.description=$3 AND s.unit=$4 AND s.geography_level='municipality'
        AND s.reference_type='stock' AND s.source='Comune di Lamezia Terme' AND s.source_dataset=$5
        AND s.source_url=$6 AND s.external_key=$7
        AND r.source_dataset=$5 AND r.source_url=a.locator AND r.source_version='repository:'||a.repository_commit
        AND r.release_date IS NULL AND r.raw_payload IS NULL AND r.metadata=$10::jsonb
        AND NOT EXISTS (
          SELECT 1 FROM (SELECT * FROM public.demographic_observations WHERE release_id=r.id) actual
          FULL JOIN expected ON actual.reference_period=expected.reference_period AND actual.dimension_key=expected.dimension_key
          WHERE actual.id IS NULL OR expected.reference_period IS NULL
            OR actual.series_id IS DISTINCT FROM s.id OR actual.geography_code IS DISTINCT FROM $11
            OR actual.reference_type IS DISTINCT FROM 'stock' OR actual.dimensions IS DISTINCT FROM expected.dimensions
            OR actual.value IS DISTINCT FROM expected.value::numeric OR actual.unit IS DISTINCT FROM $4
            OR actual.source_status IS DISTINCT FROM 'unknown' OR actual.source_observation_status IS NOT NULL
            OR actual.quality_flags IS DISTINCT FROM expected.quality_flags
        ) AND NOT EXISTS (
          SELECT 1 FROM expected WHERE NOT EXISTS (
            SELECT 1 FROM public.source_records evidence
            WHERE evidence.release_id=$9::uuid AND evidence.collection_key=$13
              AND evidence.native_key=expected.source_native_key
          )
        )) AS verified
      FROM public.demographic_series s
      JOIN public.demographic_releases r ON r.series_id=s.id AND r.source_hash=$8
      JOIN public.source_releases sr ON sr.id=$9::uuid
      JOIN public.source_artifacts a ON a.id=sr.artifact_id AND a.byte_hash=$8
      WHERE s.series_key=$1`,
    values: [
      ...series,
      p.byteHash,
      sourceReleaseId,
      JSON.stringify(releaseMetadata),
      MUNICIPAL_GEOGRAPHY_CODE,
      observations,
      definition.collection,
    ],
  };
  return {
    seriesInsert,
    releaseInsert,
    observationInsert,
    verify,
    seriesKey: definition.seriesKey,
    expected: plan.observations.length,
  };
}

export async function reconcileMunicipalDemographicSnapshot(
  client: SnapshotQueryClient,
  p: SnapshotPlan,
  sourceReleaseId: string,
) {
  const statements = municipalDemographicStatements(p, sourceReleaseId);
  for (const statement of [statements.seriesInsert, statements.releaseInsert])
    await client.query(statement.text, statement.values);
  const insert = statements.observationInsert;
  const inserted = Number(
    (await client.query(insert.text, insert.values)).rows[0]?.inserted ?? 0,
  );
  const verify = statements.verify;
  const result = (await client.query(verify.text, verify.values)).rows[0];
  if (
    result?.verified !== true ||
    Number(result.observations) !== statements.expected
  )
    throw new Error("MUNICIPAL_DEMOGRAPHIC_RECONCILIATION_FAILED");
  return {
    seriesKey: statements.seriesKey,
    observations: statements.expected,
    inserted,
    verified: statements.expected,
  };
}
