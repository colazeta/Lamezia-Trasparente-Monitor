import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Position = [number, number] | [number, number, number];

type Geometry =
  | {
      type: "Polygon";
      coordinates: Position[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: Position[][][];
    };

type IndicatorValues = {
  p1?: number | null;
  popolazione_totale?: number | null;
  [key: string]: number | string | null | undefined;
};

type FeatureProperties = {
  sezione_censimento_id: string;
  istat_municipal_code: string;
  municipality: string;
  matched_istat_2023_variables: boolean;
  indicators_istat_2023: IndicatorValues;
  [key: string]: unknown;
};

type Feature = {
  type: "Feature";
  properties: FeatureProperties;
  geometry: Geometry | null;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

type Metadata = {
  publicLabel: string;
  sourceInstitution: string;
  sourceDataset: string;
  sourceYear: string;
  territorialLevel: string;
  municipality: string;
  istatMunicipalCode: string;
  verificationStatus: string;
  knownLimits: string[];
  counts: {
    outputFeatures: number;
    matchedVariables: number;
    missingVariables: number;
    skippedFictitious: number;
    variableFictitiousRows: number;
  };
  qa?: {
    indicatorCoverage?: Record<
      string,
      {
        availableCount: number;
        nullCount: number;
        zeroCount: number;
      }
    >;
    populationValueCoverage?: {
      totalFeatures: number;
      availableCount: number;
      nullCount: number;
      zeroCount?: number;
    };
  };
};

type IndicatorDictionary = {
  indicators: Array<{
    id: string;
    istatSourceField: string | null;
    istatSourceDefinitions?: Record<string, string>;
    publicField: string | null;
    publicLabel: string;
    category: string;
    unitOfMeasure: string;
    numerator: string | string[] | null;
    denominator: string | null;
    formula?: string;
    enabled: boolean;
    status?: string;
    sourceYear: string;
    territorialLevel: string;
    missingnessCount?: number;
    publicInterpretation: string;
    knownCaveats: string[];
  }>;
  disabledCandidates?: Array<{
    id: string;
    enabled: boolean;
    reason: string;
  }>;
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(path.join(repoRoot, relativePath), "utf8"),
  ) as T;
}

const collection = readJson<FeatureCollection>(
  "data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
);
const metadata = readJson<Metadata>(
  "data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json",
);
const dictionary = readJson<IndicatorDictionary>(
  "data/processed/territorio/istat_indicator_dictionary.json",
);

function getPolygons(geometry: Geometry): Position[][][] {
  return geometry.type === "Polygon"
    ? [geometry.coordinates]
    : geometry.coordinates;
}

function validateGeometry(feature: Feature): string[] {
  const problems: string[] = [];

  if (!feature.geometry) {
    return [`${feature.properties.sezione_censimento_id}: missing geometry`];
  }

  for (const polygon of getPolygons(feature.geometry)) {
    for (const ring of polygon) {
      if (ring.length < 4) {
        problems.push(
          `${feature.properties.sezione_censimento_id}: short ring`,
        );
        continue;
      }

      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        problems.push(`${feature.properties.sezione_censimento_id}: open ring`);
      }

      for (const position of ring) {
        if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) {
          problems.push(
            `${feature.properties.sezione_censimento_id}: non-finite coordinate`,
          );
        }
      }
    }
  }

  return problems;
}

test("processed ISTAT layer keeps only Lamezia census sections", () => {
  assert.equal(collection.type, "FeatureCollection");
  assert.equal(collection.features.length, 317);

  const municipalCodes = new Set(
    collection.features.map(
      (feature) => feature.properties.istat_municipal_code,
    ),
  );
  assert.deepEqual([...municipalCodes], ["079160"]);

  assert.ok(
    collection.features.every(
      (feature) => feature.properties.municipality === "Lamezia Terme",
    ),
  );
  assert.ok(
    collection.features.every(
      (feature) =>
        !/888888|999999/.test(feature.properties.sezione_censimento_id),
    ),
  );
});

test("processed ISTAT layer does not mix cadastral or accessory features", () => {
  const allowedPropertyKeys = new Set([
    "sezione_censimento_id",
    "istat_municipal_code",
    "municipality",
    "matched_istat_2023_variables",
    "indicators_istat_2023",
  ]);

  for (const feature of collection.features) {
    for (const key of Object.keys(feature.properties)) {
      assert.ok(
        allowedPropertyKeys.has(key),
        `unexpected property ${key} on ${feature.properties.sezione_censimento_id}`,
      );
    }
  }

  const featureProperties = JSON.stringify(
    collection.features.map((feature) => feature.properties),
  ).toLowerCase();
  assert.doesNotMatch(
    featureProperties,
    /zornade|catast|cadastr|omi|irpef|sezioni_urbane/,
  );
});

test("population values are numeric only for joined ISTAT 2023 rows", () => {
  let joinedCount = 0;
  let nullCount = 0;
  let zeroCount = 0;

  for (const feature of collection.features) {
    const indicators = feature.properties.indicators_istat_2023;
    const p1 = indicators.p1;
    const population = indicators.popolazione_totale;

    assert.equal(p1, population);

    if (feature.properties.matched_istat_2023_variables) {
      joinedCount += 1;
      assert.equal(typeof p1, "number");
      if (p1 === 0) {
        zeroCount += 1;
      }
    } else {
      nullCount += 1;
      assert.equal(p1, null);
      assert.equal(population, null);
    }
  }

  assert.equal(joinedCount, 246);
  assert.equal(nullCount, 71);
  assert.equal(zeroCount, 22);
});

test("null population values are preserved and not coerced to zero", () => {
  const nullFeature = collection.features.find(
    (feature) => feature.properties.sezione_censimento_id === "0791600000204",
  );
  const zeroFeature = collection.features.find(
    (feature) => feature.properties.sezione_censimento_id === "0791600000198",
  );

  assert.ok(nullFeature);
  assert.ok(zeroFeature);
  assert.equal(nullFeature.properties.indicators_istat_2023.p1, null);
  assert.equal(
    nullFeature.properties.indicators_istat_2023.popolazione_totale,
    null,
  );
  assert.equal(zeroFeature.properties.indicators_istat_2023.p1, 0);
  assert.equal(
    zeroFeature.properties.indicators_istat_2023.popolazione_totale,
    0,
  );
});

test("enabled derived indicators preserve formulas, nulls and zero denominators", () => {
  const formulaFeature = collection.features.find(
    (feature) => feature.properties.sezione_censimento_id === "0791600000001",
  );
  const zeroDenominatorFeature = collection.features.find(
    (feature) => feature.properties.sezione_censimento_id === "0791600000198",
  );
  const nullFeature = collection.features.find(
    (feature) => feature.properties.sezione_censimento_id === "0791600000204",
  );

  assert.ok(formulaFeature);
  assert.ok(zeroDenominatorFeature);
  assert.ok(nullFeature);

  const indicators = formulaFeature.properties.indicators_istat_2023;
  assert.equal(indicators.popolazione_0_14, 36);
  assert.equal(indicators.quota_0_14, 12.68);
  assert.equal(indicators.popolazione_65_piu, 91);
  assert.equal(indicators.quota_65_piu, 32.04);
  assert.equal(indicators.stranieri_totale, 22);
  assert.equal(indicators.quota_stranieri, 7.75);
  assert.equal(indicators.famiglie_totale, 124);
  assert.equal(indicators.abitazioni_totali, 253);
  assert.equal(indicators.automobili_totale, 173);
  assert.equal(indicators.quota_titoli_terziari, 8.37);
  assert.equal(indicators.occupati_15_64, 77);

  const zeroDenominatorIndicators =
    zeroDenominatorFeature.properties.indicators_istat_2023;
  assert.equal(zeroDenominatorIndicators.p1, 0);
  assert.equal(zeroDenominatorIndicators.popolazione_0_14, 0);
  assert.equal(zeroDenominatorIndicators.quota_0_14, null);
  assert.equal(zeroDenominatorIndicators.quota_65_piu, null);
  assert.equal(zeroDenominatorIndicators.quota_stranieri, null);

  const nullIndicators = nullFeature.properties.indicators_istat_2023;
  assert.equal(nullIndicators.famiglie_totale, null);
  assert.equal(nullIndicators.abitazioni_totali, null);
  assert.equal(nullIndicators.automobili_totale, null);
  assert.equal(nullIndicators.quota_titoli_terziari, null);
});

test("metadata records source attribution, known limits and QA coverage", () => {
  assert.equal(metadata.sourceInstitution, "ISTAT");
  assert.equal(
    metadata.publicLabel,
    "Dato ufficiale ISTAT per sezione censuaria",
  );
  assert.equal(metadata.territorialLevel, "sezione di censimento");
  assert.equal(metadata.municipality, "Lamezia Terme");
  assert.equal(metadata.istatMunicipalCode, "079160");
  assert.match(metadata.sourceDataset, /Basi territoriali 2021/);
  assert.match(metadata.sourceYear, /2023/);
  assert.match(metadata.verificationStatus, /9 indicatori pubblici/);
  assert.equal(metadata.counts.outputFeatures, 317);
  assert.equal(metadata.counts.matchedVariables, 246);
  assert.equal(metadata.counts.missingVariables, 71);
  assert.equal(metadata.counts.skippedFictitious, 0);
  assert.equal(metadata.counts.variableFictitiousRows, 1);
  assert.ok(
    metadata.knownLimits.some(
      (limit) => limit.includes("246") && limit.includes("317"),
    ),
  );
  assert.ok(
    metadata.knownLimits.some((limit) => /Zornade|catastali/.test(limit)),
  );
  assert.ok(
    metadata.knownLimits.some(
      (limit) => limit.includes("0-14") && limit.includes("minori <18"),
    ),
  );
  assert.ok(metadata.knownLimits.some((limit) => /denominatore/.test(limit)));
  assert.equal(metadata.qa?.populationValueCoverage?.totalFeatures, 317);
  assert.equal(metadata.qa?.populationValueCoverage?.availableCount, 246);
  assert.equal(metadata.qa?.populationValueCoverage?.nullCount, 71);
  assert.equal(metadata.qa?.populationValueCoverage?.zeroCount, 22);
  assert.equal(
    metadata.qa?.indicatorCoverage?.["quota-stranieri"]?.availableCount,
    224,
  );
  assert.equal(
    metadata.qa?.indicatorCoverage?.["quota-stranieri"]?.nullCount,
    93,
  );
});

test("processed geometries pass the current web rendering gate", () => {
  const geometryTypes = new Set(
    collection.features.map((feature) => feature.geometry?.type),
  );
  assert.deepEqual([...geometryTypes], ["Polygon"]);

  const problems = collection.features.flatMap(validateGeometry);
  assert.deepEqual(problems, []);
});

test("indicator dictionary enables only fields verified against the ISTAT 2023 layout", () => {
  const enabled = dictionary.indicators.filter(
    (indicator) => indicator.enabled,
  );
  assert.deepEqual(
    enabled.map((indicator) => indicator.id),
    [
      "popolazione-residente",
      "quota-0-14",
      "quota-anziani",
      "quota-stranieri",
      "famiglie",
      "abitazioni",
      "automobili",
      "quota-titoli-terziari",
      "occupati-15-64",
    ],
  );

  const byId = new Map(
    dictionary.indicators.map((indicator) => [indicator.id, indicator]),
  );
  const population = byId.get("popolazione-residente");
  const age014 = byId.get("quota-0-14");
  const elderly = byId.get("quota-anziani");
  const foreignResidents = byId.get("quota-stranieri");
  const education = byId.get("quota-titoli-terziari");
  const employment = byId.get("occupati-15-64");

  assert.equal(population?.istatSourceField, "P1");
  assert.equal(population?.publicField, "popolazione_totale");
  assert.equal(population?.unitOfMeasure, "persone");
  assert.equal(age014?.formula, "(P14 + P15 + P16) / P1 * 100");
  assert.deepEqual(age014?.numerator, ["P14", "P15", "P16"]);
  assert.equal(age014?.denominator, "P1");
  assert.equal(age014?.unitOfMeasure, "percentuale");
  assert.equal(age014?.missingnessCount, 93);
  assert.ok(
    age014?.knownCaveats.some((caveat) => caveat.includes("minori <18")),
  );
  assert.equal(elderly?.formula, "(P27 + P28 + P29) / P1 * 100");
  assert.equal(foreignResidents?.istatSourceField, "ST1 + P1");
  assert.equal(foreignResidents?.formula, "ST1 / P1 * 100");
  assert.equal(foreignResidents?.missingnessCount, 93);
  assert.equal(education?.denominator, "P83");
  assert.equal(employment?.formula, "P101");
  assert.ok(
    employment?.knownCaveats.some((caveat) => /conteggio/.test(caveat)),
  );

  const disabledMinorShare = dictionary.disabledCandidates?.find(
    (candidate) => candidate.id === "quota-minori",
  );
  assert.ok(disabledMinorShare);
  assert.equal(disabledMinorShare.enabled, false);
  assert.match(disabledMinorShare.reason, /15-17/);
});
