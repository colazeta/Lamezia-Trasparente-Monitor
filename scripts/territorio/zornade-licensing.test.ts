import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ZornadeLayerMetadata = {
  frontendStatus: string;
  licensing: {
    downloadDataset: {
      licence: string;
      licenceUrl: string;
      underlyingSource: string;
      cleanedVersionProvider: string;
      recommendedVisibleAttribution: string;
      zornadeUrl: string;
    };
    api: {
      termsUrl: string;
      attributionGuideUrl: string;
      sourceLicenceMetadataField: string;
      sourceAttributionsAlwaysRequired: boolean;
      zornadeAttributionField: string;
      zornadeAttributionRequiredField: string;
      freeKeyVisibleAttribution: {
        text: string;
        url: string;
      };
      commercialLicenceMayRemoveZornadeAttributionOnly: boolean;
      rawDataRedistributionProhibited: boolean;
      massExtractionProhibited: boolean;
      competingDatabaseReconstructionProhibited: boolean;
    };
  };
  publicationGate: {
    status: "blocked" | "ready";
    visibleAttributionImplemented: boolean;
    rule: string;
  };
  lastLicenceCheck: string;
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const metadata = JSON.parse(
  readFileSync(
    path.join(
      repoRoot,
      "data/processed/territorio/zornade_sezioni_urbane_catasto.layer.json",
    ),
    "utf8",
  ),
) as ZornadeLayerMetadata;

test("Zornade download metadata preserves CC BY attribution", () => {
  assert.equal(metadata.licensing.downloadDataset.licence, "CC BY 4.0");
  assert.equal(
    metadata.licensing.downloadDataset.licenceUrl,
    "https://creativecommons.org/licenses/by/4.0/deed.it",
  );
  assert.equal(
    metadata.licensing.downloadDataset.underlyingSource,
    "Agenzia delle Entrate",
  );
  assert.equal(
    metadata.licensing.downloadDataset.cleanedVersionProvider,
    "Zornade",
  );
  assert.match(
    metadata.licensing.downloadDataset.recommendedVisibleAttribution,
    /Agenzia delle Entrate/,
  );
  assert.match(
    metadata.licensing.downloadDataset.recommendedVisibleAttribution,
    /Zornade/,
  );
});

test("Zornade API metadata preserves both source and free-key attribution rules", () => {
  assert.equal(metadata.licensing.api.sourceLicenceMetadataField, "meta.licenses");
  assert.equal(metadata.licensing.api.sourceAttributionsAlwaysRequired, true);
  assert.equal(
    metadata.licensing.api.zornadeAttributionField,
    "meta.zornade_attribution",
  );
  assert.equal(
    metadata.licensing.api.zornadeAttributionRequiredField,
    "meta.zornade_attribution_required",
  );
  assert.deepEqual(metadata.licensing.api.freeKeyVisibleAttribution, {
    text: "Dati elaborati da Zornade",
    url: "https://zornade.com",
  });
  assert.equal(
    metadata.licensing.api.commercialLicenceMayRemoveZornadeAttributionOnly,
    true,
  );
});

test("Zornade API use keeps prohibited bulk/raw reuse fail-closed", () => {
  assert.equal(metadata.licensing.api.rawDataRedistributionProhibited, true);
  assert.equal(metadata.licensing.api.massExtractionProhibited, true);
  assert.equal(
    metadata.licensing.api.competingDatabaseReconstructionProhibited,
    true,
  );
});

test("Zornade public layer stays blocked until visible attribution is verified", () => {
  const isCurrentlyPublic =
    /wired|enabled|public/i.test(metadata.frontendStatus) &&
    !/not wired|not public|disabled/i.test(metadata.frontendStatus);

  if (isCurrentlyPublic) {
    assert.equal(
      metadata.publicationGate.visibleAttributionImplemented,
      true,
      "A public Zornade layer must have visible attribution implemented",
    );
    assert.equal(metadata.publicationGate.status, "ready");
  } else {
    assert.equal(metadata.publicationGate.status, "blocked");
    assert.equal(metadata.publicationGate.visibleAttributionImplemented, false);
  }

  assert.match(metadata.publicationGate.rule, /attribution/i);
  assert.match(metadata.lastLicenceCheck, /^\d{4}-\d{2}-\d{2}$/);
});
