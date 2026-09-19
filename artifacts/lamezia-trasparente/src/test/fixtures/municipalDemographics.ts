import population from "../../data/generated/lameziaDemographicTrend.json";
import foreign from "../../data/generated/lameziaForeignResidentsAgeSex.json";
import families from "../../data/generated/lameziaFamiliesChildren.json";
import {
  createDemographicTrendDataset,
  buildDemographicTrendSummary,
  getLameziaDemographicTrendRecord as findPopulation,
} from "../../data/lameziaDemographicTrend";
import {
  createForeignResidentsDataset,
  buildForeignResidentsSummary,
  getLameziaForeignResidentsAgeRecord as findForeign,
} from "../../data/lameziaForeignResidents";
import {
  createFamiliesChildrenDataset,
  buildFamiliesChildrenSummary,
  getLameziaFamiliesChildrenRecord as findFamilies,
} from "../../data/lameziaFamiliesChildren";
export const LAMEZIA_DEMOGRAPHIC_TREND_DATA =
  createDemographicTrendDataset(population);
export const LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY = buildDemographicTrendSummary(
  LAMEZIA_DEMOGRAPHIC_TREND_DATA.annual,
);
export const LAMEZIA_FOREIGN_RESIDENTS_DATA =
  createForeignResidentsDataset(foreign);
export const LAMEZIA_FOREIGN_RESIDENTS_LATEST_YEAR =
  foreign.metadata.latest_year;
export const LAMEZIA_FOREIGN_RESIDENTS_SUMMARY = buildForeignResidentsSummary(
  LAMEZIA_FOREIGN_RESIDENTS_DATA.age.filter(
    (r) => r.year === foreign.metadata.latest_year,
  ),
);
export const LAMEZIA_FAMILIES_CHILDREN_DATA =
  createFamiliesChildrenDataset(families);
export const LAMEZIA_FAMILIES_CHILDREN_SUMMARY = buildFamiliesChildrenSummary(
  LAMEZIA_FAMILIES_CHILDREN_DATA.family_children,
);
export const getLameziaDemographicTrendRecord = (year: number) =>
  findPopulation(LAMEZIA_DEMOGRAPHIC_TREND_DATA, year);
export const getLameziaForeignResidentsAgeRecord = (
  age: string,
  year?: number,
) => findForeign(LAMEZIA_FOREIGN_RESIDENTS_DATA, age, year);
export const getLameziaFamiliesChildrenRecord = (count: number) =>
  findFamilies(LAMEZIA_FAMILIES_CHILDREN_DATA, count);
function snapshot(
  raw: typeof population | typeof foreign | typeof families,
  key: string,
  observations: number,
) {
  return {
    ...raw,
    provenance: {
      schema_version: "lt-municipal-demographic-public.v1",
      canonical: true,
      series_key: (
        {
          population: "municipal-population-resident-annual",
          "foreign-age-sex": "municipal-foreign-residents-age-sex",
          "families-children": "municipal-families-by-children",
        } as Record<string, string>
      )[key],
      source_key: `lamezia.demographics.${key}`,
      release_hash: "a".repeat(64),
      source_generated_at: raw.metadata.generated_at,
      acquired_at: "2026-09-10T19:00:00.000Z",
      source_status: "unknown",
      reference_period_unspecified: key === "families-children",
      reference_day_unspecified: true,
      source_records: raw.metadata.rows,
      canonical_observations: observations,
      extractor_version: "municipal-demographics.v1",
    },
  };
}
export const MUNICIPAL_FIXTURES = {
  population: snapshot(population, "population", 25),
  "foreign-age-sex": snapshot(foreign, "foreign-age-sex", 38),
  "families-children": snapshot(families, "families-children", 6),
};
