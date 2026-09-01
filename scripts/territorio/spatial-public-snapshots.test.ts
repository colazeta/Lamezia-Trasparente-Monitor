import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildConfiscatedAssetsSnapshot,
  buildSpatialPublicationManifest,
  sha256,
  type AnbscPublicDataset,
  type ConfiscatedAssetsSnapshot,
  type SpatialPublicationManifest,
} from "./spatial-public-snapshots-core";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

function dataset(
  iter: "In Amministrazione" | "Destinato",
  records: Array<Record<string, unknown>>,
): AnbscPublicDataset {
  return {
    "dct:title": iter,
    "@graph": records.map((record, index) => ({
      bene_id: `${iter}-${index}`,
      comune: "Lamezia Terme",
      iter_amministrativo: iter,
      ...record,
    })),
  };
}

function buildSnapshot(
  inAdministration: AnbscPublicDataset,
  destined: AnbscPublicDataset,
) {
  return buildConfiscatedAssetsSnapshot({
    inAdministration,
    destined,
    sourceModified: "2026-09-02 04:00:00",
    sourceDatasetUrl: "https://benidestinati.anbsc.it/api/data/beni/catalog",
  });
}

test("does not turn ANBSC municipality centroids into asset locations", () => {
  const snapshot = buildSnapshot(
    dataset("In Amministrazione", [
      { latitudine_comune: 38.9603933, longitudine_comune: 16.2949951 },
    ]),
    dataset("Destinato", [{ latitudine_comune: "", longitudine_comune: "" }]),
  );

  assert.deepEqual(snapshot.features, []);
  assert.equal(snapshot.metadata.input_records, 2);
  assert.equal(snapshot.metadata.excluded_records, 2);
  assert.equal(snapshot.metadata.distribution_role, "continuity_fallback");
  assert.equal(
    snapshot.metadata.primary_data_path,
    "/api/beni-confiscati/geojson",
  );
  assert.deepEqual(snapshot.metadata.exclusions, {
    municipal_centroid_only: 1,
    missing_asset_coordinates: 1,
    asset_coordinates_pending_review: 0,
  });
  assert.equal(snapshot.metadata.automatic_geocoder, "not used");
});

test("keeps newly exposed asset-level coordinates pending explicit review", () => {
  const snapshot = buildSnapshot(
    dataset("In Amministrazione", [
      { latitudine_bene: 38.97, longitudine_bene: 16.31 },
    ]),
    dataset("Destinato", []),
  );

  assert.equal(snapshot.features.length, 0);
  assert.equal(
    snapshot.metadata.exclusions.asset_coordinates_pending_review,
    1,
  );
});

test("rejects records outside Lamezia and duplicate source identifiers", () => {
  assert.throws(
    () =>
      buildSnapshot(
        dataset("In Amministrazione", [
          { bene_id: "outside", comune: "Catanzaro" },
        ]),
        dataset("Destinato", []),
      ),
    /outside Lamezia Terme/,
  );

  assert.throws(
    () =>
      buildSnapshot(
        dataset("In Amministrazione", [{ bene_id: "same" }]),
        dataset("Destinato", [{ bene_id: "same" }]),
      ),
    /Duplicate ANBSC source identifier same/,
  );
});

test("manifest records checksums and distinguishes empty-by-policy content", () => {
  const confiscatedAssetsSnapshot = buildSnapshot(
    dataset("In Amministrazione", [
      { latitudine_comune: 38.96, longitudine_comune: 16.29 },
    ]),
    dataset("Destinato", []),
  );
  const confiscatedJson = `${JSON.stringify(confiscatedAssetsSnapshot)}\n`;
  const manifest = buildSpatialPublicationManifest({
    generatedAt: "2026-09-01T18:00:00.000Z",
    municipalBoundaryJson: "municipal",
    municipalFeatureCount: 1,
    censusSectionsJson: "census",
    censusFeatureCount: 317,
    confiscatedAssetsJson: confiscatedJson,
    confiscatedAssetsSnapshot,
  });

  assert.equal(manifest.layers.length, 3);
  assert.equal(manifest.layers[0].sha256, sha256("municipal"));
  assert.deepEqual(
    manifest.layers.map(
      ({
        layer_id,
        primary_data_path,
        distribution_role,
        content_status,
        feature_count,
      }) => ({
        layer_id,
        primary_data_path,
        distribution_role,
        content_status,
        feature_count,
      }),
    ),
    [
      {
        layer_id: "municipal-boundary",
        primary_data_path:
          "/data/processed/territorio/lamezia_confine_comunale.geojson",
        distribution_role: "primary",
        content_status: "populated",
        feature_count: 1,
      },
      {
        layer_id: "census-sections",
        primary_data_path:
          "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
        distribution_role: "primary",
        content_status: "populated",
        feature_count: 317,
      },
      {
        layer_id: "confiscated-assets",
        primary_data_path: "/api/beni-confiscati/geojson",
        distribution_role: "continuity_fallback",
        content_status: "empty_by_policy",
        feature_count: 0,
      },
    ],
  );
});

test("committed spatial snapshots match their publication manifest", () => {
  const manifestPath = path.join(
    repoRoot,
    "data/processed/territorio/spatial_layer_manifest.json",
  );
  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf8"),
  ) as SpatialPublicationManifest;
  const confiscatedPath = path.join(
    repoRoot,
    "data/processed/territorio/beni_confiscati_lamezia.geojson",
  );
  const confiscated = JSON.parse(
    readFileSync(confiscatedPath, "utf8"),
  ) as ConfiscatedAssetsSnapshot;

  assert.equal(manifest.schema_version, "1.0");
  assert.equal(manifest.publication_policy, "default-deny");
  assert.equal(manifest.layers.length, 3);

  for (const layer of manifest.layers) {
    const contents = readFileSync(
      path.join(repoRoot, layer.data_path.replace(/^\//, "")),
      "utf8",
    );
    const collection = JSON.parse(contents) as { features: unknown[] };
    assert.equal(sha256(contents), layer.sha256, layer.layer_id);
    assert.equal(
      collection.features.length,
      layer.feature_count,
      layer.layer_id,
    );
  }

  assert.deepEqual(confiscated.features, []);
  assert.equal(confiscated.metadata.distribution_role, "continuity_fallback");
  assert.equal(
    confiscated.metadata.primary_data_path,
    "/api/beni-confiscati/geojson",
  );
  assert.equal(confiscated.metadata.input_records, 340);
  assert.equal(confiscated.metadata.excluded_records, 340);
  assert.deepEqual(confiscated.metadata.source_counts, {
    in_administration: 119,
    destined: 221,
  });
  assert.deepEqual(confiscated.metadata.exclusions, {
    municipal_centroid_only: 292,
    missing_asset_coordinates: 48,
    asset_coordinates_pending_review: 0,
  });
});
