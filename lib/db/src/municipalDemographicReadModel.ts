import { createHash } from "node:crypto";
import type { SnapshotQueryClient } from "./sourceSnapshotPersistence";
import { canonicalSnapshotJson } from "./sourceSnapshotPersistence";
import {
  planMunicipalDemographicSource,
  MUNICIPAL_DEMOGRAPHIC_EXTRACTOR,
} from "./municipalDemographicPlan";

export const MUNICIPAL_SERIES = {
  population: "municipal-population-resident-annual",
  "foreign-age-sex": "municipal-foreign-residents-age-sex",
  "families-children": "municipal-families-by-children",
} as const;
export const MUNICIPAL_PUBLIC_KEYS = Object.keys(MUNICIPAL_SERIES) as Array<
  keyof typeof MUNICIPAL_SERIES
>;
export type MunicipalPublicKey = keyof typeof MUNICIPAL_SERIES;
export class MunicipalReadModelError extends Error {
  constructor(
    readonly code:
      | "INVALID_KEY"
      | "INVALID_RELEASE"
      | "CANONICAL_DATA_UNAVAILABLE"
      | "CANONICAL_RECONCILIATION_FAILED",
  ) {
    super(code);
  }
}
export type MunicipalPublicSnapshot = {
  schema_version: 1;
  metadata: Record<string, unknown>;
  annual_columns?: readonly string[];
  annual_rows?: string;
  age_columns?: readonly string[];
  age_rows?: string;
  family_children_columns?: readonly string[];
  family_children_rows?: string;
  provenance: {
    schema_version: "lt-municipal-demographic-public.v1";
    canonical: true;
    series_key: string;
    source_key: string;
    release_hash: string;
    acquired_at: string;
    source_generated_at: string;
    source_status: "unknown";
    reference_period_unspecified: boolean;
    reference_day_unspecified: true;
    source_records: number;
    canonical_observations: number;
    extractor_version: string;
  };
};

// Select typed releases BEFORE joining evidence. A broken newest release must
// fail closed, not silently expose an older apparently healthy snapshot.
// All rows and evidence are read in one statement / MVCC snapshot.
export const municipalReadStatement = `WITH candidates AS MATERIALIZED (
  SELECT s.id AS series_id,s.series_key,s.unit,s.source_dataset,s.geography_level,s.reference_type,
    r.id AS release_id,r.source_hash,r.acquired_at,r.metadata AS typed_metadata
  FROM demographic_series s JOIN demographic_releases r ON r.series_id=s.id
  WHERE s.series_key=$1 AND ($2::text IS NULL OR r.source_hash=$2)
  ORDER BY r.metadata->>'source_generated_at' DESC NULLS FIRST,r.id DESC LIMIT 2
)
SELECT c.*,sr.id::text AS source_release_id,ss.source_key,a.content_text,a.byte_hash,
  EXISTS(SELECT 1 FROM source_acquisition_runs run WHERE run.release_id=sr.id AND run.status='succeeded') AS acquisition_succeeded,
  (SELECT jsonb_agg(jsonb_build_object('collection_key',x.collection_key,'ordinal',x.ordinal,
    'native_key',x.native_key,'record_hash',x.record_hash,'payload',x.payload) ORDER BY x.ordinal)
    FROM source_records x WHERE x.release_id=sr.id) AS source_records,
  (SELECT jsonb_agg(jsonb_build_object('series_id',x.series_id,'geography_code',x.geography_code,
    'reference_period',x.reference_period,'reference_type',x.reference_type,'dimensions',x.dimensions,
    'dimension_key',x.dimension_key,'value',x.value::text,'unit',x.unit,'source_status',x.source_status,
    'source_observation_status',x.source_observation_status,'quality_flags',x.quality_flags)
    ORDER BY x.dimension_key,x.reference_period) FROM demographic_observations x WHERE x.release_id=c.release_id) AS observations
FROM candidates c
LEFT JOIN source_releases sr ON sr.id::text=c.typed_metadata->>'source_registry_release_id'
LEFT JOIN source_endpoints ep ON ep.id=sr.endpoint_id
LEFT JOIN source_sources ss ON ss.id=ep.source_id
LEFT JOIN source_artifacts a ON a.id=sr.artifact_id
ORDER BY c.typed_metadata->>'source_generated_at' DESC NULLS FIRST,c.release_id DESC`;

const metadataKeys = [
  "source",
  "source_url",
  "source_catalog_url",
  "source_api_url",
  "source_csv_url",
  "source_catalog_homepage",
  "source_catalog_description",
  "organization",
  "cod_ente",
  "dataset_id",
  "dataset_name",
  "dataset_title",
  "resource_id",
  "resource_name",
  "resource_hash",
  "holder_name",
  "holder_identifier",
  "publisher_name",
  "publisher_identifier",
  "license_title",
  "license_id",
  "license_type",
  "frequency",
  "metadata_created",
  "metadata_modified",
  "resource_last_modified",
  "generated_at",
  "rows",
  "first_year",
  "latest_year",
  "years",
  "latest_total",
  "latest_male_total",
  "latest_female_total",
  "latest_children_total",
  "latest_working_age_total",
  "latest_senior_total",
  "total_families_with_children",
  "one_child_families",
  "two_children_families",
  "three_or_more_children_families",
  "update_policy",
  "caveat",
];
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const same = (a: unknown, b: unknown) =>
  canonicalSnapshotJson(a) === canonicalSnapshotJson(b);
function ensure(ok: unknown): asserts ok {
  if (!ok) throw new MunicipalReadModelError("CANONICAL_RECONCILIATION_FAILED");
}

/** Reconcile retained evidence before exposing an allowlisted public projection. */
export function projectMunicipalDemographicSnapshot(
  key: MunicipalPublicKey,
  row: Record<string, any>,
): MunicipalPublicSnapshot {
  ensure(
    typeof row.content_text === "string" &&
      Buffer.byteLength(row.content_text) <= 4 * 1024 * 1024,
  );
  ensure(
    hash(row.content_text) === row.byte_hash &&
      row.source_hash === row.byte_hash,
  );
  ensure(
    row.source_key === `lamezia.demographics.${key}` &&
      row.acquisition_succeeded === true,
  );
  const plan = planMunicipalDemographicSource(
    row.source_key,
    JSON.parse(row.content_text),
  );
  const { definition, metadata } = plan;
  ensure(
    row.series_key === definition.seriesKey &&
      row.source_dataset === definition.datasetId,
  );
  ensure(
    row.unit === definition.unit &&
      row.reference_type === "stock" &&
      row.geography_level === "municipality",
  );
  ensure(
    row.source_release_id &&
      row.typed_metadata?.source_registry_release_id === row.source_release_id,
  );
  ensure(
    row.typed_metadata?.extractor_version === MUNICIPAL_DEMOGRAPHIC_EXTRACTOR,
  );
  ensure(row.typed_metadata?.source_generated_at === metadata.generated_at);
  ensure(
    Array.isArray(row.source_records) &&
      row.source_records.length === plan.records.length,
  );
  plan.records.forEach((record, i) => {
    const source = row.source_records[i];
    ensure(
      source.ordinal === i &&
        source.collection_key === definition.collection &&
        source.native_key === record._native_key,
    );
    ensure(
      same(source.payload, record) &&
        source.record_hash === hash(canonicalSnapshotJson(record)),
    );
  });
  ensure(
    Array.isArray(row.observations) &&
      row.observations.length === plan.observations.length,
  );
  const actual = new Map<string, Record<string, any>>();
  for (const point of row.observations) {
    const id = `${point.reference_period}|${point.dimension_key}`;
    ensure(!actual.has(id));
    actual.set(id, point);
  }
  for (const point of plan.observations) {
    const value = actual.get(
      `${point.reference_period}|${point.dimension_key}`,
    );
    ensure(value && Number(value.value) === Number(point.value));
    ensure(
      value.series_id === row.series_id && value.geography_code === "079160",
    );
    ensure(
      value.reference_type === "stock" &&
        value.unit === definition.unit &&
        value.source_status === "unknown" &&
        value.source_observation_status === null,
    );
    ensure(
      same(value.dimensions, point.dimensions) &&
        same(value.quality_flags, point.quality_flags),
    );
  }
  const value = (period: string, dimensions: Record<string, string>) => {
    const dk = JSON.stringify(
      Object.fromEntries(
        Object.entries(dimensions).sort(([a], [b]) => a.localeCompare(b)),
      ),
    );
    const point = actual.get(`${period}|${dk}`);
    ensure(point);
    return Number(point.value);
  };
  const round = (n: number) => Number(n.toFixed(4));
  let previous: number | undefined;
  let cumulative = 0;
  const familyTotal =
    key === "families-children"
      ? plan.observations.reduce(
          (sum, p) => sum + value(p.reference_period, p.dimensions),
          0,
        )
      : 0;
  const yearTotals = new Map<string, number>();
  if (key === "foreign-age-sex")
    for (const p of plan.observations)
      yearTotals.set(
        p.reference_period,
        (yearTotals.get(p.reference_period) ?? 0) +
          value(p.reference_period, p.dimensions),
      );
  // Measured values come from typed observations; source labels/indices retain
  // their original meaning. Redundant totals/shares are reproduced, not reasserted.
  const rows = plan.records
    .map((record) => {
      if (key === "population") {
        const n = value(record.year, {});
        const delta = previous === undefined ? null : n - previous;
        const rate =
          previous === undefined || previous === 0
            ? null
            : round(delta! / previous);
        previous = n;
        return [record.index, record.year, n, delta ?? "", rate ?? ""].join(
          "|",
        );
      }
      if (key === "foreign-age-sex") {
        const male = value(record.year, {
          age_class: record.age_class,
          sex: "male",
        });
        const female = value(record.year, {
          age_class: record.age_class,
          sex: "female",
        });
        const total = male + female,
          denominator = yearTotals.get(record.year)!;
        return [
          record.year,
          record.age_class,
          male,
          female,
          total,
          denominator ? round(total / denominator) : 0,
          record.age_group,
        ].join("|");
      }
      const families = value("unknown", {
        children_count: record.children_count_label,
      });
      cumulative += families;
      return [
        record.children_count_label,
        record.children_count_min,
        families,
        familyTotal ? round(families / familyTotal) : 0,
        cumulative,
      ].join("|");
    })
    .join("\n");
  const publicMetadata: Record<string, unknown> = {};
  for (const name of metadataKeys)
    if (Object.hasOwn(metadata, name)) {
      const item = metadata[name];
      ensure(
        item === null ||
          ["string", "number", "boolean"].includes(typeof item) ||
          (name === "years" &&
            Array.isArray(item) &&
            item.every(Number.isSafeInteger)),
      );
      publicMetadata[name] = item;
    }
  const acquired = new Date(row.acquired_at);
  ensure(Number.isFinite(acquired.getTime()));
  return {
    schema_version: 1,
    metadata: publicMetadata,
    [definition.columnsKey]: [...definition.columns],
    [definition.collection]: rows,
    provenance: {
      schema_version: "lt-municipal-demographic-public.v1",
      canonical: true,
      series_key: definition.seriesKey,
      source_key: row.source_key,
      release_hash: row.byte_hash,
      acquired_at: acquired.toISOString(),
      source_generated_at: String(metadata.generated_at),
      source_status: "unknown",
      reference_period_unspecified: key === "families-children",
      reference_day_unspecified: true,
      source_records: plan.records.length,
      canonical_observations: plan.observations.length,
      extractor_version: MUNICIPAL_DEMOGRAPHIC_EXTRACTOR,
    },
  };
}
export async function readMunicipalDemographicSnapshot(
  client: SnapshotQueryClient,
  key: string,
  releaseHash?: string,
): Promise<MunicipalPublicSnapshot> {
  if (!Object.hasOwn(MUNICIPAL_SERIES, key))
    throw new MunicipalReadModelError("INVALID_KEY");
  if (releaseHash !== undefined && !/^[a-f0-9]{64}$/.test(releaseHash))
    throw new MunicipalReadModelError("INVALID_RELEASE");
  const result = await client.query(municipalReadStatement, [
    MUNICIPAL_SERIES[key as MunicipalPublicKey],
    releaseHash ?? null,
  ]);
  if (!result.rows.length)
    throw new MunicipalReadModelError("CANONICAL_DATA_UNAVAILABLE");
  const [row, other] = result.rows as Record<string, any>[];
  if (
    !releaseHash &&
    other &&
    row.typed_metadata?.source_generated_at ===
      other.typed_metadata?.source_generated_at &&
    row.source_hash !== other.source_hash
  )
    throw new MunicipalReadModelError("CANONICAL_RECONCILIATION_FAILED");
  try {
    return projectMunicipalDemographicSnapshot(key as MunicipalPublicKey, row);
  } catch {
    throw new MunicipalReadModelError("CANONICAL_RECONCILIATION_FAILED");
  }
}
