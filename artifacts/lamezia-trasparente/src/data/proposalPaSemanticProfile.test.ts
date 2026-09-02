import { describe, expect, it } from "vitest";

import {
  LT_SEMANTIC_EXTENSIONS,
  OFFICIAL_FALLBACK_DATA_THEMES,
  PA_PUBLIC_SERVICE_SUBJECT_SCHEME,
  PA_PUBLIC_SERVICE_SUBJECTS,
  PA_TRANSPARENCY_SUBJECT_SCHEME_URI,
  getAvailablePaSubjects,
  getMappedProposalThemes,
  getProposalLocalSemanticExtensions,
  getProposalOfficialPaSubjects,
  getProposalPaSemanticProfile,
} from "./proposalPaSemanticProfile";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("official PA semantic profile for civic proposals", () => {
  it("maps every published proposal to at least one official semantic concept", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      expect(() => getProposalPaSemanticProfile(proposal)).not.toThrow();
      expect(getProposalOfficialPaSubjects(proposal).length).toBeGreaterThan(0);
      expect(getProposalLocalSemanticExtensions(proposal)).toHaveLength(0);
    }
  });

  it("uses stable w3id.org URIs for Italian public-service subjects", () => {
    expect(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri).toBe(
      "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
    );

    for (const proposal of PUBLIC_PROPOSALS) {
      for (const subject of getProposalOfficialPaSubjects(proposal)) {
        if (subject.source !== "schema.gov.it / AgID") continue;
        expect(subject.schemeUri).toBe(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri);
        expect(subject.uri).toBe(`${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${subject.code}`);
        expect(
          PA_PUBLIC_SERVICE_SUBJECTS[
            subject.code as keyof typeof PA_PUBLIC_SERVICE_SUBJECTS
          ].label,
        ).toBe(subject.label);
      }
    }
  });

  it("uses the official GOVE Data Theme instead of inventing a local governance theme", () => {
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);

    const governanceConcept = OFFICIAL_FALLBACK_DATA_THEMES.GOVE;
    expect(governanceConcept.label).toBe("Governo e settore pubblico");
    expect(governanceConcept.uri).toBe(
      "http://publications.europa.eu/resource/authority/data-theme/GOVE",
    );
    expect(governanceConcept.relatedOfficialUris).toContain(
      PA_TRANSPARENCY_SUBJECT_SCHEME_URI,
    );

    const governanceProposals = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.theme === "Trasparenza e partecipazione democratica",
    );
    expect(governanceProposals.length).toBeGreaterThan(0);
    expect(
      governanceProposals.every((proposal) =>
        getProposalOfficialPaSubjects(proposal).some(
          (subject) => subject.code === "GOVE" && subject.source === "EU Data Theme",
        ),
      ),
    ).toBe(true);
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
    expect(available.every((subject) => subject.uri.startsWith("http"))).toBe(true);
    expect(available.some((subject) => subject.label === "Salute, benessere e assistenza")).toBe(
      true,
    );
    expect(available.some((subject) => subject.label === "Mobilità e trasporti")).toBe(true);
    expect(available.some((subject) => subject.label === "Governo e settore pubblico")).toBe(true);
  });
});
