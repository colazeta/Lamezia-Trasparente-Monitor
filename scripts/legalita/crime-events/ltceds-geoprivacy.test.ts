import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MINIMUM_RESIDENTIAL_PRIVACY_SET_SIZE,
  capGeocodePrecision,
  evaluateGeocodeCandidate,
  projectPublicLocation,
  validateInternalLocationPrecision,
  type LtcedsInternalLocation,
  type LtcedsPublicAnchor,
} from "@workspace/publication-standardisation/ltceds-location";

const exactPoint = { type: "Point" as const, coordinates: [16.25, 38.95] as const };

function location(
  overrides: Partial<LtcedsInternalLocation> = {},
): LtcedsInternalLocation {
  return {
    role: "occurrence",
    municipality: "Lamezia Terme",
    evidence_basis: "source_stated_exact",
    evidence_precision: "exact_address",
    resolved_precision: "exact_address",
    sensitivity: "private_or_sensitive",
    publication_risk: "residential",
    geometry: exactPoint,
    place_name: "Synthetic address",
    neighbourhood: "Synthetic neighbourhood",
    ...overrides,
  };
}

function anchor(
  kind: LtcedsPublicAnchor["kind"],
  overrides: Partial<LtcedsPublicAnchor> = {},
): LtcedsPublicAnchor {
  const precision =
    kind === "street_anchor"
      ? "street_segment"
      : kind === "neighbourhood_anchor"
        ? "neighbourhood"
        : "locality";
  return {
    anchor_id: `anchor-${kind}`,
    kind,
    geometry: {
      type: "Point",
      coordinates:
        kind === "street_anchor"
          ? [16.251, 38.951]
          : kind === "neighbourhood_anchor"
            ? [16.26, 38.96]
            : [16.3, 39.0],
    },
    precision,
    source: "synthetic-anchor-source",
    privacy_set_size: kind === "street_anchor" ? 12 : null,
    generated_at: "2026-09-05T22:00:00Z",
    ...overrides,
  };
}

test("a geocoder can never upgrade street evidence to an exact address", () => {
  assert.equal(
    capGeocodePrecision("street_segment", "exact_address"),
    "street_segment",
  );
  const decision = evaluateGeocodeCandidate(
    {
      evidence_basis: "source_stated_street",
      evidence_precision: "street_segment",
      municipality: "Lamezia Terme",
    },
    {
      provider: "synthetic",
      query_variant: "street_only",
      geometry: exactPoint,
      precision: "exact_address",
      match_level: "exact_civic",
      within_municipality: true,
    },
  );
  assert.equal(decision.status, "candidate");
  assert.equal(decision.capped_precision, "street_segment");
  assert.match(decision.reasons.join(" "), /capped from exact_address/);
});

test("geocoder output remains a candidate rather than an automatically accepted fact", () => {
  const decision = evaluateGeocodeCandidate(
    {
      evidence_basis: "source_stated_exact",
      evidence_precision: "exact_address",
      municipality: "Lamezia Terme",
    },
    {
      provider: "synthetic",
      query_variant: "exact_civic",
      geometry: exactPoint,
      precision: "exact_address",
      match_level: "exact_civic",
      within_municipality: true,
      provider_confidence: 0.99,
    },
  );
  assert.equal(decision.status, "candidate");
  assert.match(decision.reasons.join(" "), /remains a candidate/);
});

test("outside-municipality geocoder candidates are rejected", () => {
  const decision = evaluateGeocodeCandidate(
    {
      evidence_basis: "source_stated_exact",
      evidence_precision: "exact_address",
      municipality: "Lamezia Terme",
    },
    {
      provider: "synthetic",
      query_variant: "exact_civic",
      geometry: exactPoint,
      precision: "exact_address",
      match_level: "exact_civic",
      within_municipality: false,
    },
  );
  assert.equal(decision.status, "rejected");
});

test("resolved internal precision cannot be finer than source evidence", () => {
  const issues = validateInternalLocationPrecision(
    location({
      evidence_basis: "source_stated_street",
      evidence_precision: "street_segment",
      resolved_precision: "exact_address",
    }),
  );
  assert.equal(issues.length, 1);
  assert.match(issues[0] ?? "", /more specific than evidence_precision/);
});

test("low-risk exact public sites can retain exact occurrence geometry", () => {
  const decision = projectPublicLocation(
    location({
      evidence_basis: "source_stated_named_site",
      evidence_precision: "exact_public_site",
      resolved_precision: "exact_public_site",
      sensitivity: "public_place",
      publication_risk: "low_public_site",
      place_name: "Synthetic public square",
    }),
    [],
  );
  assert.equal(decision.public_location.geometry?.coordinates[0], 16.25);
  assert.equal(decision.public_location.privacy_transform, "none");
  assert.equal(decision.map_default, true);
});

test("residential exact locations use a sufficiently large street privacy anchor", () => {
  const decision = projectPublicLocation(location(), [anchor("street_anchor")]);
  assert.equal(decision.selected_anchor_id, "anchor-street_anchor");
  assert.equal(decision.public_location.precision, "street_segment");
  assert.equal(decision.public_location.privacy_transform, "street_generalisation");
  assert.equal(decision.public_location.place_name, null);
  assert.equal(decision.map_default, true);
});

test("street anchors below the privacy-set threshold fall back to neighbourhood", () => {
  const decision = projectPublicLocation(location(), [
    anchor("street_anchor", { privacy_set_size: 7 }),
    anchor("neighbourhood_anchor"),
  ]);
  assert.equal(
    DEFAULT_MINIMUM_RESIDENTIAL_PRIVACY_SET_SIZE,
    8,
  );
  assert.equal(decision.selected_anchor_id, "anchor-neighbourhood_anchor");
  assert.equal(decision.public_location.precision, "neighbourhood");
  assert.equal(decision.public_location.privacy_transform, "neighbourhood_centroid");
  assert.match(decision.reasons.join(" "), /below minimum 8/);
});

test("unknown publication risk skips street anchors", () => {
  const decision = projectPublicLocation(
    location({ publication_risk: "unknown", sensitivity: "unknown" }),
    [anchor("street_anchor", { privacy_set_size: 99 }), anchor("neighbourhood_anchor")],
  );
  assert.equal(decision.selected_anchor_id, "anchor-neighbourhood_anchor");
  assert.match(decision.reasons.join(" "), /street anchor skipped/);
});

test("minor or sexual-offence vulnerability suppresses public point geometry", () => {
  for (const risk of ["minor_or_vulnerable", "sexual_offence_context"] as const) {
    const decision = projectPublicLocation(
      location({ publication_risk: risk }),
      [anchor("street_anchor"), anchor("neighbourhood_anchor")],
    );
    assert.equal(decision.public_location.geometry, null);
    assert.equal(decision.public_location.privacy_transform, "suppressed");
    assert.equal(decision.public_location.precision, "municipality");
    assert.equal(decision.map_default, false);
  }
});

test("municipality-only evidence never becomes a centroid point", () => {
  const decision = projectPublicLocation(
    location({
      evidence_basis: "source_stated_locality",
      evidence_precision: "municipality",
      resolved_precision: "municipality",
      geometry: null,
      sensitivity: "unknown",
      publication_risk: "unknown",
    }),
    [anchor("neighbourhood_anchor")],
  );
  assert.equal(decision.public_location.geometry, null);
  assert.equal(decision.map_default, false);
});

test("locality anchors fail closed on geometry until the public schema has an explicit transform", () => {
  const decision = projectPublicLocation(
    location({
      evidence_basis: "source_stated_locality",
      evidence_precision: "locality",
      resolved_precision: "locality",
    }),
    [anchor("locality_anchor")],
  );
  assert.equal(decision.selected_anchor_id, "anchor-locality_anchor");
  assert.equal(decision.public_location.precision, "locality");
  assert.equal(decision.public_location.geometry, null);
  assert.equal(decision.public_location.privacy_transform, "suppressed");
});

test("an exact arrest location may exist in the record but never becomes the default crime-map point", () => {
  const decision = projectPublicLocation(
    location({
      role: "arrest",
      evidence_basis: "source_stated_named_site",
      evidence_precision: "exact_public_site",
      resolved_precision: "exact_public_site",
      sensitivity: "public_place",
      publication_risk: "low_public_site",
    }),
    [],
  );
  assert.notEqual(decision.public_location.geometry, null);
  assert.equal(decision.map_default, false);
});
