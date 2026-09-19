import {
  canonicalSnapshotJson,
  snapshotHash,
  type SnapshotQueryClient,
} from "./sourceSnapshotPersistence";
import {
  municipalReadStatement,
  MunicipalReadModelError,
} from "./municipalDemographicReadModel";
import {
  HOUSEHOLD_COMPOSITION_KEY,
  HOUSEHOLD_COMPOSITION_SERIES,
  HOUSEHOLD_COMPOSITION_EXTRACTOR,
  planHouseholdComposition,
  householdCompositionReleaseMetadata,
} from "./householdCompositionPlan";

export const householdCompositionReadStatement = municipalReadStatement
  .replaceAll("source_generated_at", "source_verified_at")
  .replace(
    "ORDER BY r.metadata->>'source_verified_at'",
    "ORDER BY r.metadata->>'source_update_date' DESC NULLS FIRST,r.metadata->>'source_verified_at'",
  )
  .replace(
    "ORDER BY c.typed_metadata->>'source_verified_at'",
    "ORDER BY c.typed_metadata->>'source_update_date' DESC NULLS FIRST,c.typed_metadata->>'source_verified_at'",
  );
const same = (a: unknown, b: unknown) =>
  canonicalSnapshotJson(a) === canonicalSnapshotJson(b);
function ensure(ok: unknown): asserts ok {
  if (!ok) throw new MunicipalReadModelError("CANONICAL_RECONCILIATION_FAILED");
}

export function projectHouseholdComposition(row: Record<string, any>) {
  ensure(
    typeof row.content_text === "string" &&
      Buffer.byteLength(row.content_text) <= 4 * 1024 * 1024 &&
      snapshotHash(row.content_text) === row.byte_hash &&
      row.source_hash === row.byte_hash &&
      row.source_key === HOUSEHOLD_COMPOSITION_KEY &&
      row.acquisition_succeeded === true,
  );
  const input = JSON.parse(row.content_text);
  const plan = planHouseholdComposition(input);
  ensure(
    row.series_key === HOUSEHOLD_COMPOSITION_SERIES &&
      row.source_dataset === plan.definition.datasetId &&
      row.unit === "famiglie" &&
      row.reference_type === "stock" &&
      row.geography_level === "municipality" &&
      typeof row.source_release_id === "string" &&
      same(
        row.typed_metadata,
        householdCompositionReleaseMetadata(input, row.source_release_id),
      ),
  );
  ensure(Array.isArray(row.source_records) && row.source_records.length === 6);
  plan.records.forEach((record, index) => {
    const source = row.source_records[index];
    ensure(
      source.ordinal === index &&
        source.collection_key === "byComponents" &&
        source.native_key === record.key &&
        same(source.payload, record) &&
        source.record_hash === snapshotHash(canonicalSnapshotJson(record)),
    );
  });
  ensure(Array.isArray(row.observations) && row.observations.length === 6);
  const actual = new Map<string, Record<string, any>>();
  for (const point of row.observations) {
    ensure(!actual.has(point.dimension_key));
    actual.set(point.dimension_key, point);
  }
  const byComponents = plan.observations.map((point, index) => {
    const value = actual.get(point.dimension_key);
    ensure(
      value &&
        typeof value.value === "string" &&
        /^\d+(\.0+)?$/.test(value.value) &&
        Number(value.value) === Number(point.value) &&
        value.series_id === row.series_id &&
        value.geography_code === "079160" &&
        value.reference_period === "2023-12-31" &&
        value.reference_type === "stock" &&
        value.unit === "famiglie" &&
        value.source_status === "unknown" &&
        value.source_observation_status === null &&
        same(value.dimensions, point.dimensions) &&
        same(value.quality_flags, point.quality_flags),
    );
    return {
      ...plan.data.byComponents[index],
      households: Number(value.value),
    };
  });
  const totalHouseholds = byComponents.reduce((n, p) => n + p.households, 0);
  const share = (n: number) => Number(((n / totalHouseholds) * 100).toFixed(1));
  const one = byComponents[0].households,
    five = byComponents[4].households + byComponents[5].households;
  const acquired = new Date(row.acquired_at);
  ensure(Number.isFinite(acquired.getTime()));
  return {
    ...plan.data,
    totalHouseholds,
    byComponents: byComponents.map((p) => ({
      ...p,
      share: share(p.households),
    })),
    indicators: {
      onePersonHouseholds: one,
      onePersonShare: share(one),
      fivePlusHouseholds: five,
      fivePlusShare: share(five),
    },
    quality: { ...plan.data.quality, componentSum: totalHouseholds },
    provenance: {
      canonical: true as const,
      series_key: HOUSEHOLD_COMPOSITION_SERIES,
      source_key: HOUSEHOLD_COMPOSITION_KEY,
      release_hash: row.byte_hash as string,
      acquired_at: acquired.toISOString(),
      source_status: "unknown" as const,
      source_records: 6,
      canonical_observations: 6,
      extractor_version: HOUSEHOLD_COMPOSITION_EXTRACTOR,
    },
  };
}

/** One complete immutable release; never mixes census editions or reads a repository file. */
export async function readHouseholdComposition(
  client: SnapshotQueryClient,
  releaseHash?: string,
) {
  if (releaseHash !== undefined && !/^[a-f0-9]{64}$/.test(releaseHash))
    throw new MunicipalReadModelError("INVALID_RELEASE");
  const result = await client.query(householdCompositionReadStatement, [
    HOUSEHOLD_COMPOSITION_SERIES,
    releaseHash ?? null,
  ]);
  if (!result.rows.length)
    throw new MunicipalReadModelError("CANONICAL_DATA_UNAVAILABLE");
  const [row, other] = result.rows as Record<string, any>[];
  try {
    ensure(
      releaseHash ||
        !other ||
        row.typed_metadata?.source_update_date !==
          other.typed_metadata?.source_update_date ||
        row.typed_metadata?.source_verified_at !==
          other.typed_metadata?.source_verified_at ||
        row.source_hash === other.source_hash,
    );
    return projectHouseholdComposition(row);
  } catch {
    throw new MunicipalReadModelError("CANONICAL_RECONCILIATION_FAILED");
  }
}
