import { describe, expect, it } from "vitest";

import {
  LT_SEMANTIC_EXTENSIONS,
  PA_PUBLIC_SERVICE_SUBJECT_SCHEME,
  PA_PUBLIC_SERVICE_SUBJECTS,
  getAvailablePaSubjects,
  getMappedProposalThemes,
  getProposalLocalSemanticExtensions,
  getProposalOfficialPaSubjects,
  getProposalPaSemanticProfile,
} from "./proposalPaSemanticProfile";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("schema.gov.it semantic profile for civic proposals", () => {
  it("maps every published proposal to the PA semantic profile", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      expect(() => getProposalPaSemanticProfile(proposal)).not.toThrow();
      const official = getProposalOfficialPaSubjects(proposal);
      const local = getProposalLocalSemanticExtensions(proposal);
      expect(official.length + local.length).toBeGreaterThan(0);
    }
  });

  it("uses stable w3id.org URIs for every official subject", () => {
    expect(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri).toBe(
      "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
    );

    for (const proposal of PUBLIC_PROPOSALS) {
      for (const subject of getProposalOfficialPaSubjects(proposal)) {
        expect(subject.schemeUri).toBe(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri);
        expect(subject.uri).toBe(`${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${subject.code}`);
        expect(PA_PUBLIC_SERVICE_SUBJECTS[subject.code].label).toBe(subject.label);
        expect(subject.authority).toBe("schema.gov.it / AgID");
      }
    }
  });

  it("keeps the national vocabulary primary and local extensions exceptional", () => {
    const proposalsWithLocalExtension = PUBLIC_PROPOSALS.filter(
      (proposal) => getProposalLocalSemanticExtensions(proposal).length > 0,
    );

    expect(proposalsWithLocalExtension.length).toBeGreaterThan(0);
    expect(
      proposalsWithLocalExtension.every(
        (proposal) => proposal.theme === "Trasparenza e partecipazione democratica",
      ),
    ).toBe(true);

    const extension = LT_SEMANTIC_EXTENSIONS.civic_governance_participation;
    expect(extension.relatedOfficialUris).toContain(
      "http://publications.europa.eu/resource/authority/data-theme/GOVE",
    );
    expect(extension.relatedOfficialUris).toContain(
      "https://w3id.org/italia/controlled-vocabulary/classifications-for-transparency/transparency-subject",
    );
  });

  it("does not allow an acquisition theme to bypass semantic mapping", () => {
    const publishedThemes = [...new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.theme))].sort(
      (a, b) => a.localeCompare(b, "it"),
    );
    expect(getMappedProposalThemes()).toEqual(publishedThemes);
  });

  it("derives the official subject catalogue actually used by the archive", () => {
    const available = getAvailablePaSubjects(PUBLIC_PROPOSALS);
    expect(available.length).toBeGreaterThan(0);
    expect(available.every((subject) => subject.uri.startsWith(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri))).toBe(
      true,
    );
    expect(available.some((subject) => subject.label === "Salute, benessere e assistenza")).toBe(
      true,
    );
    expect(available.some((subject) => subject.label === "Mobilità e trasporti")).toBe(true);
  });
});
