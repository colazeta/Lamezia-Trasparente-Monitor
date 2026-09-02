import { describe, expect, it } from "vitest";

import { PUBLIC_PROPOSALS } from "./propostePubbliche";
import {
  PROPOSAL_GEOGRAPHY,
  PROPOSAL_GEO_AREAS,
  getProposalGeography,
  getProposalLocalGeoAreas,
  isProposalGeoreferenced,
  proposalMatchesGeoArea,
} from "./proposalGeography";

describe("proposal geography", () => {
  it("assigns geographic applicability metadata to every proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const geography = getProposalGeography(proposal.id);
      expect(geography, proposal.id).toBeDefined();
      expect(geography?.areas.length, proposal.id).toBeGreaterThan(0);
    }
  });

  it("never assigns coordinates to citywide proposals", () => {
    for (const [proposalId, geography] of Object.entries(PROPOSAL_GEOGRAPHY)) {
      if (geography.scope === "citywide") {
        expect(geography.points, proposalId).toHaveLength(0);
        expect(isProposalGeoreferenced(proposalId), proposalId).toBe(false);
      } else {
        expect(geography.points.length, proposalId).toBeGreaterThan(0);
        expect(isProposalGeoreferenced(proposalId), proposalId).toBe(true);
      }
    }
  });

  it("does not contain orphan geography records", () => {
    const proposalIds = new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.id));
    for (const geographyId of Object.keys(PROPOSAL_GEOGRAPHY)) {
      expect(proposalIds.has(geographyId), geographyId).toBe(true);
    }
  });

  it("keeps actual coordinates inside valid WGS84 bounds", () => {
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

  it("keeps the local-area filter distinct from citywide scope", () => {
    expect(getProposalLocalGeoAreas()).not.toContain("intera_citta");
    expect(getProposalLocalGeoAreas()).toEqual(
      expect.arrayContaining(["nicastro", "sambiase", "sant_eufemia", "costa"]),
    );
  });

  it("supports filtering georeferenced proposals by geographic area", () => {
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

  it("distinguishes a citywide proposal from a georeferenced one", () => {
    expect(
      isProposalGeoreferenced("scuole-posticipo-apertura-petizione-2026"),
    ).toBe(false);
    expect(
      isProposalGeoreferenced("aeroporto-intermodalita-rilancio-taverna-2026"),
    ).toBe(true);
  });
});
