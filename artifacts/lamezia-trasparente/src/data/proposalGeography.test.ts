import { describe, expect, it } from "vitest";

import { PUBLIC_PROPOSALS } from "./propostePubbliche";
import {
  PROPOSAL_GEOGRAPHY,
  PROPOSAL_GEO_AREAS,
  getProposalGeography,
  proposalMatchesGeoArea,
} from "./proposalGeography";

describe("proposal geography", () => {
  it("assigns a geographic reference to every proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const geography = getProposalGeography(proposal.id);
      expect(geography, proposal.id).toBeDefined();
      expect(geography?.points.length, proposal.id).toBeGreaterThan(0);
      expect(geography?.areas.length, proposal.id).toBeGreaterThan(0);
    }
  });

  it("does not contain orphan geography records", () => {
    const proposalIds = new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.id));
    for (const geographyId of Object.keys(PROPOSAL_GEOGRAPHY)) {
      expect(proposalIds.has(geographyId), geographyId).toBe(true);
    }
  });

  it("keeps coordinates inside valid WGS84 bounds", () => {
    for (const geography of Object.values(PROPOSAL_GEOGRAPHY)) {
      for (const point of geography.points) {
        expect(point.latitude).toBeGreaterThanOrEqual(-90);
        expect(point.latitude).toBeLessThanOrEqual(90);
        expect(point.longitude).toBeGreaterThanOrEqual(-180);
        expect(point.longitude).toBeLessThanOrEqual(180);
      }
    }
  });

  it("uses only declared geographic area tags", () => {
    const declaredAreas = new Set(PROPOSAL_GEO_AREAS);
    for (const geography of Object.values(PROPOSAL_GEOGRAPHY)) {
      for (const area of geography.areas) {
        expect(declaredAreas.has(area)).toBe(true);
      }
    }
  });

  it("supports filtering proposals by geographic area", () => {
    expect(
      proposalMatchesGeoArea(
        "piazza-italia-sicurezza-prevenzione-2026",
        "sant_eufemia",
      ),
    ).toBe(true);
    expect(
      proposalMatchesGeoArea(
        "piazza-italia-sicurezza-prevenzione-2026",
        "nicastro",
      ),
    ).toBe(false);
    expect(
      proposalMatchesGeoArea("asili-nido-continuita-servizio-2026", "nicastro"),
    ).toBe(true);
    expect(
      proposalMatchesGeoArea("asili-nido-continuita-servizio-2026", "sambiase"),
    ).toBe(true);
    expect(
      proposalMatchesGeoArea(
        "asili-nido-continuita-servizio-2026",
        "sant_eufemia",
      ),
    ).toBe(true);
  });
});
