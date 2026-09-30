import type { SnapshotSource } from "./sourceSnapshotManifest";
import type { JsonObject } from "./sourceSnapshotPersistence";

export const MUNICIPAL_DEMOGRAPHIC_EXTRACTOR = "municipal-demographics.v1";
export const MUNICIPAL_GEOGRAPHY_CODE = "079160";

const definitions = {
  "lamezia.demographics.population": {
    filename: "lameziaDemographicTrend.json",
    datasetId: "be119781-22b5-4883-ae4e-7f299546c2b7",
    resourceId: "634c5b42-1bd4-43bd-ac0a-6fb9ace5f3e9",
    collection: "annual_rows",
    columnsKey: "annual_columns",
    columns: ["index", "year", "population_resident", "delta_abs", "delta_pct"],
    seriesKey: "municipal-population-resident-annual",
    title: "Popolazione residente — serie annuale comunale",
    unit: "abitanti",
  },
  "lamezia.demographics.foreign-age-sex": {
    filename: "lameziaForeignResidentsAgeSex.json",
    datasetId: "fc9889e0-ea84-44b1-a95d-9c6c1fa7e115",
    resourceId: "55ffccd6-5ed9-4633-a592-53dab719620b",
    collection: "age_rows",
    columnsKey: "age_columns",
    columns: [
      "year",
      "age_class",
      "male",
      "female",
      "total",
      "share_of_year",
      "age_group",
    ],
    seriesKey: "municipal-foreign-residents-age-sex",
    title: "Residenti stranieri per sesso e classe di età — fonte comunale",
    unit: "abitanti",
  },
  "lamezia.demographics.families-children": {
    filename: "lameziaFamiliesChildren.json",
    datasetId: "bbd58e2a-af9f-41cb-bd32-f56410863eb4",
    resourceId: "c29d86df-a1ad-48f7-a702-1c74abcf2946",
    collection: "family_children_rows",
    columnsKey: "family_children_columns",
    columns: [
      "children_count_label",
      "children_count_min",
      "families",
      "share_of_total",
      "cumulative_families",
    ],
    seriesKey: "municipal-families-by-children",
    title: "Famiglie per numero di figli — periodo non specificato dalla fonte",
    unit: "famiglie",
  },
} as const;

type SourceKey = keyof typeof definitions;
export function isMunicipalDemographicSource(key: string): key is SourceKey {
  return Object.hasOwn(definitions, key);
}

export const municipalDemographicSources: SnapshotSource[] = Object.entries(
  definitions,
).map(([key, definition]) => ({
  key,
  title: definition.title,
  path: `artifacts/lamezia-trasparente/src/data/generated/${definition.filename}`,
  role: "derived_dataset",
  upstreamUrls: [
    "https://opendata.comune.lamezia-terme.cz.it/it",
    `https://dataportal.maggioli.cloud/api/v1/mgg-od/datasets/detail/${definition.datasetId}?cod-ente=188067-opendata&organizations=comune-di-lamezia-terme`,
  ],
  collections: { [definition.collection]: "_native_key" },
}));

export type MunicipalObservation = {
  reference_period: string;
  dimensions: Record<string, string>;
  dimension_key: string;
  value: string;
  source_native_key: string;
  quality_flags: string[];
};

function requireValue(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(`MUNICIPAL_DEMOGRAPHIC_${code}`);
}
function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function count(value: string): number {
  requireValue(/^(0|[1-9]\d*)$/.test(value), "INVALID_COUNT");
  const number = Number(value);
  // The existing numeric(18,4) observation column has fourteen integer digits.
  requireValue(
    Number.isSafeInteger(number) && number < 1e14,
    "COUNT_PRECISION",
  );
  return number;
}
function year(value: string): string {
  requireValue(/^[1-9]\d{3}$/.test(value), "INVALID_YEAR");
  return value;
}
function numericMatches(value: string, expected: number): boolean {
  return /^-?\d+(\.\d{1,4})?$/.test(value) && Number(value) === expected;
}
const roundFour = (value: number) => Number(value.toFixed(4));

/** Decode only explicitly reviewed compact sources; the original bytes remain unchanged. */
export function planMunicipalDemographicSource(key: string, input: unknown) {
  requireValue(isMunicipalDemographicSource(key), "UNREGISTERED_SOURCE");
  const definition = definitions[key];
  requireValue(
    object(input) && input.schema_version === 1 && object(input.metadata),
    "SCHEMA_MISMATCH",
  );
  const metadata = input.metadata;
  requireValue(
    metadata.dataset_id === definition.datasetId &&
      metadata.resource_id === definition.resourceId &&
      metadata.organization === "comune-di-lamezia-terme" &&
      metadata.holder_identifier === "c_m208" &&
      metadata.publisher_identifier === "c_m208",
    "SOURCE_IDENTITY_MISMATCH",
  );
  requireValue(
    typeof metadata.caveat === "string" && metadata.caveat.length > 0,
    "CAVEAT_REQUIRED",
  );
  requireValue(
    typeof metadata.source_csv_url === "string" &&
      metadata.source_csv_url.startsWith(
        `https://opendata.comune.lamezia-terme.cz.it/dataset/${definition.datasetId}/resource/${definition.resourceId}/`,
      ),
    "SOURCE_URL_MISMATCH",
  );
  requireValue(
    typeof metadata.generated_at === "string" &&
      !Number.isNaN(Date.parse(metadata.generated_at)) &&
      new Date(metadata.generated_at).toISOString() === metadata.generated_at,
    "INVALID_GENERATED_AT",
  );
  requireValue(
    JSON.stringify(input[definition.columnsKey]) ===
      JSON.stringify(definition.columns),
    "COLUMNS_MISMATCH",
  );
  const text = input[definition.collection];
  requireValue(typeof text === "string" && text.length > 0, "ROWS_REQUIRED");
  const records: Record<string, string>[] = text.split("\n").map((line) => {
    const cells = line.split("|");
    requireValue(
      cells.length === definition.columns.length,
      "ROW_WIDTH_MISMATCH",
    );
    return Object.fromEntries(
      definition.columns.map((column, index) => [column, cells[index]]),
    );
  });
  requireValue(metadata.rows === records.length, "ROW_COUNT_MISMATCH");
  const observations: MunicipalObservation[] = [];
  const nativeKeys = new Set<string>();
  function register(row: Record<string, string>, nativeKey: string) {
    requireValue(!nativeKeys.has(nativeKey), "DUPLICATE_SOURCE_KEY");
    nativeKeys.add(nativeKey);
    row._native_key = nativeKey;
  }
  function observe(
    row: Record<string, string>,
    period: string,
    value: number,
    dimensions: Record<string, string>,
    periodUnknown = false,
  ) {
    const ordered = Object.fromEntries(
      Object.entries(dimensions).sort(([a], [b]) => a.localeCompare(b)),
    );
    observations.push({
      reference_period: period,
      dimensions: ordered,
      dimension_key: JSON.stringify(ordered),
      value: String(value),
      source_native_key: row._native_key,
      quality_flags: [
        "recovered_from_repository_derived_dataset",
        periodUnknown
          ? "reference_period_unspecified"
          : "reference_day_unspecified",
      ],
    });
  }

  if (key === "lamezia.demographics.population") {
    let previous: { year: string; population: number } | undefined;
    records.forEach((row) => {
      const period = year(row.year),
        population = count(row.population_resident);
      count(row.index); // Preserve the source index; it is not a canonical identity.
      requireValue(
        !previous || period > previous.year,
        "PERIOD_ORDER_MISMATCH",
      );
      register(row, period);
      if (previous) {
        const difference = population - previous.population;
        requireValue(
          numericMatches(row.delta_abs, difference),
          "DERIVED_VALUE_MISMATCH",
        );
        const expected =
          previous.population === 0
            ? null
            : roundFour(difference / previous.population);
        requireValue(
          expected === null
            ? row.delta_pct === ""
            : numericMatches(row.delta_pct, expected),
          "DERIVED_VALUE_MISMATCH",
        );
      } else {
        requireValue(
          row.delta_abs === "" && row.delta_pct === "",
          "FIRST_CHANGE_MUST_BE_NULL",
        );
      }
      observe(row, period, population, {});
      previous = { year: period, population };
    });
    requireValue(
      metadata.first_year === Number(records[0].year) &&
        metadata.latest_year === Number(records.at(-1)!.year),
      "PERIOD_METADATA_MISMATCH",
    );
  } else if (key === "lamezia.demographics.foreign-age-sex") {
    const totals = new Map<string, number>();
    for (const row of records) {
      const period = year(row.year),
        male = count(row.male),
        female = count(row.female);
      const match = /^(\d{2})-(\d{2})$/.exec(row.age_class);
      const open = /^(\d{1,3}) e piu$/.exec(row.age_class);
      requireValue(match || open, "AGE_CLASS_UNRECOGNISED");
      const ageFrom = Number((match ?? open)![1]);
      requireValue(!match || Number(match[2]) >= ageFrom, "INVALID_AGE_CLASS");
      const ageGroup = ageFrom < 15 ? "0-14" : ageFrom < 65 ? "15-64" : "65+";
      requireValue(
        row.age_group === ageGroup && count(row.total) === male + female,
        "DERIVED_VALUE_MISMATCH",
      );
      register(row, `${period}|${row.age_class}`);
      totals.set(period, (totals.get(period) ?? 0) + male + female);
      observe(row, period, male, { age_class: row.age_class, sex: "male" });
      observe(row, period, female, { age_class: row.age_class, sex: "female" });
    }
    for (const row of records) {
      const total = totals.get(row.year)!;
      requireValue(
        numericMatches(
          row.share_of_year,
          total ? roundFour(count(row.total) / total) : 0,
        ),
        "DERIVED_VALUE_MISMATCH",
      );
    }
    const years = [...totals.keys()].map(Number).sort((a, b) => a - b);
    requireValue(
      JSON.stringify(metadata.years) === JSON.stringify(years) &&
        metadata.first_year === years[0] &&
        metadata.latest_year === years.at(-1),
      "PERIOD_METADATA_MISMATCH",
    );
    const latest = records.filter((row) => Number(row.year) === years.at(-1));
    const sum = (field: string, group?: string) =>
      latest
        .filter((row) => !group || row.age_group === group)
        .reduce((n, row) => n + count(row[field]), 0);
    requireValue(
      metadata.latest_total === sum("total") &&
        metadata.latest_male_total === sum("male") &&
        metadata.latest_female_total === sum("female") &&
        metadata.latest_children_total === sum("total", "0-14") &&
        metadata.latest_working_age_total === sum("total", "15-64") &&
        metadata.latest_senior_total === sum("total", "65+"),
      "SUMMARY_MISMATCH",
    );
  } else {
    // This source has no reference year. Its acquisition date must not become a fake period.
    requireValue(
      metadata.first_year === undefined &&
        metadata.latest_year === undefined &&
        metadata.year === undefined,
      "REFERENCE_PERIOD_REQUIRES_REVIEW",
    );
    const total = records.reduce((n, row) => n + count(row.families), 0);
    let cumulative = 0,
      previous = 0;
    for (const row of records) {
      const lower = count(row.children_count_min),
        families = count(row.families);
      requireValue(
        lower > previous &&
          (row.children_count_label === String(lower) ||
            row.children_count_label === `${lower} o piu`),
        "CHILDREN_CLASS_UNRECOGNISED",
      );
      previous = lower;
      cumulative += families;
      requireValue(
        count(row.cumulative_families) === cumulative &&
          numericMatches(
            row.share_of_total,
            total ? roundFour(families / total) : 0,
          ),
        "DERIVED_VALUE_MISMATCH",
      );
      register(row, row.children_count_label);
      observe(
        row,
        "unknown",
        families,
        { children_count: row.children_count_label },
        true,
      );
    }
    const sum = (predicate: (n: number) => boolean) =>
      records
        .filter((row) => predicate(count(row.children_count_min)))
        .reduce((n, row) => n + count(row.families), 0);
    requireValue(
      metadata.total_families_with_children === total &&
        metadata.one_child_families === sum((n) => n === 1) &&
        metadata.two_children_families === sum((n) => n === 2) &&
        metadata.three_or_more_children_families === sum((n) => n >= 3),
      "SUMMARY_MISMATCH",
    );
  }
  requireValue(
    new Set(
      observations.map((row) => `${row.reference_period}:${row.dimension_key}`),
    ).size === observations.length,
    "DUPLICATE_OBSERVATION",
  );
  return {
    definition,
    metadata,
    records,
    observations,
    expanded: { ...input, [definition.collection]: records },
  };
}
