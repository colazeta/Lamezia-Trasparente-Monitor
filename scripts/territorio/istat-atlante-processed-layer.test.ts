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
    publicField: string | null;
    publicLabel: string;
    category: string;
    unitOfMeasure: string;
    numerator: string | null;
    denominator: string | null;
    enabled: boolean;
    sourceYear: string;
    territorialLevel: string;
    publicInterpretation: string;
    knownCaveats: string[];
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
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function validateGeometry(feature: Feature): string[] {
  const problems: string[] = [];

  if (!feature.geometry) {
    return [`${feature.properties.sezione_censimento_id}: missing geometry`];
  }

  for (const polygon of getPolygons(feature.geometry)) {
    for (const ring of polygon) {
      if (ring.length < 4) {
        problems.push(`${feature.properties.sezione_censimento_id}: short ring`);
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
    collection.features.map((feature) => feature.properties.istat_municipal_code),
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
  assert.equal(nullFeature.properties.indicators_istat_2023.popolazione_totale, null);
  assert.equal(zeroFeature.properties.indicators_istat_2023.p1, 0);
  assert.equal(zeroFeature.properties.indicators_istat_2023.popolazione_totale, 0);
});

test("metadata records source attribution, known limits and QA coverage", () => {
  assert.equal(metadata.sourceInstitution, "ISTAT");
  assert.equal(metadata.publicLabel, "Dato ufficiale ISTAT per sezione censuaria");
  assert.equal(metadata.territorialLevel, "sezione di censimento");
  assert.equal(metadata.municipality, "Lamezia Terme");
  assert.equal(metadata.istatMunicipalCode, "079160");
  assert.match(metadata.sourceDataset, /Basi territoriali 2021/);
  assert.match(metadata.sourceYear, /2023/);
  assert.match(metadata.verificationStatus, /P1/);
  assert.equal(metadata.counts.outputFeatures, 317);
  assert.equal(metadata.counts.matchedVariables, 246);
  assert.equal(metadata.counts.missingVariables, 71);
  assert.equal(metadata.counts.skippedFictitious, 1);
  assert.equal(metadata.counts.variableFictitiousRows, 1);
  assert.ok(
    metadata.knownLimits.some(
      (limit) => limit.includes("246") && limit.includes("317"),
    ),
  );
  assert.ok(metadata.knownLimits.some((limit) => /Zornade|catastali/.test(limit)));
  assert.equal(metadata.qa?.populationValueCoverage?.totalFeatures, 317);
  assert.equal(metadata.qa?.populationValueCoverage?.availableCount, 246);
  assert.equal(metadata.qa?.populationValueCoverage?.nullCount, 71);
  assert.equal(metadata.qa?.populationValueCoverage?.zeroCount, 22);
});

test("processed geometries pass the current web rendering gate", () => {
  const geometryTypes = new Set(
    collection.features.map((feature) => feature.geometry?.type),
  );
  assert.deepEqual([...geometryTypes], ["Polygon"]);

  const problems = collection.features.flatMap(validateGeometry);
  assert.deepEqual(problems, []);
});

test("indicator dictionary enables only the validated population indicator", () => {
  const enabled = dictionary.indicators.filter((indicator) => indicator.enabled);
  assert.deepEqual(
    enabled.map((indicator) => indicator.id),
    ["popolazione-residente"],
  );
  assert.equal(enabled[0].istatSourceField, "P1");
  assert.equal(enabled[0].publicField, "popolazione_totale");
  assert.equal(enabled[0].unitOfMeasure, "persone");

  for (const expectedId of [
    "quota-minori",
    "quota-anziani",
    "quota-stranieri",
    "famiglie",
    "abitazioni",
    "auto",
    "istruzione",
    "lavoro-occupazione",
  ]) {
    const indicator = dictionary.indicators.find(
      (candidate) => candidate.id === expectedId,
    );
    assert.ok(indicator, `missing candidate indicator ${expectedId}`);
    assert.equal(indicator.enabled, false);
    assert.equal(indicator.istatSourceField, null);
    assert.equal(indicator.territorialLevel, "sezione di censimento");
    assert.ok(indicator.knownCaveats.length > 0);
  }
});
