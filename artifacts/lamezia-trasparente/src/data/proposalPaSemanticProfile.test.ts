import { describe, expect, it } from "vitest";

import {
  LT_SEMANTIC_EXTENSIONS,
  OFFICIAL_FALLBACK_DATA_THEMES,
  PA_PUBLIC_SERVICE_SUBJECT_CODES,
  PA_PUBLIC_SERVICE_SUBJECT_SCHEME,
  PA_PUBLIC_SERVICE_SUBJECTS,
  PA_TRANSPARENCY_SUBJECT_SCHEME_URI,
  getAllPaPublicServiceSubjects,
  getAvailablePaSubjects,
  getAvailablePrimaryPaSubjects,
  getMappedProposalThemes,
  getProposalLocalSemanticExtensions,
  getProposalOfficialPaSubjects,
  getProposalPaSemanticProfile,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./proposalPaSemanticProfile";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("official PA semantic profile for civic proposals", () => {
  it("keeps the complete 15-concept PA taxonomy in the backend", () => {
    expect(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.conceptCount).toBe(15);
    expect(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.numberOfLevels).toBe(1);
    expect(PA_PUBLIC_SERVICE_SUBJECT_CODES).toHaveLength(15);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(PA_PUBLIC_SERVICE_SUBJECTS)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
    ]);

    for (const code of PA_PUBLIC_SERVICE_SUBJECT_CODES) {
      const subject = PA_PUBLIC_SERVICE_SUBJECTS[code];
      expect(subject.code).toBe(code);
      expect(subject.label.length).toBeGreaterThan(2);
      expect(subject.schemeUri).toBe(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri);
      expect(subject.uri).toBe(`${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${code}`);
      expect(subject.authority).toBe("Agenzia per l'Italia Digitale");
    }
  });

  it("maps every published proposal to exactly one primary official subject", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      expect(() => getProposalPaSemanticProfile(proposal)).not.toThrow();
      const primary = getProposalPrimaryPaSubject(proposal);
      const secondary = getProposalSecondaryPaSubjects(proposal);
      const all = getProposalOfficialPaSubjects(proposal);

      expect(primary.uri.startsWith("http")).toBe(true);
      expect(all[0]).toEqual(primary);
      expect(all).toEqual([primary, ...secondary]);
      expect(getProposalLocalSemanticExtensions(proposal)).toHaveLength(0);
    }
  });

  it("uses stable official URIs for Italian public-service subjects", () => {
    expect(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri).toBe(
      "https://w3id.org/italia/controlled-vocabulary/classifications-for-public-services/public-services-subject-matters",
    );

    for (const subject of getAllPaPublicServiceSubjects()) {
      expect(subject.schemeUri).toBe(PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri);
      expect(subject.uri).toBe(`${PA_PUBLIC_SERVICE_SUBJECT_SCHEME.uri}/${subject.code}`);
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
      governanceProposals.every(
        (proposal) => getProposalPrimaryPaSubject(proposal).code === "GOVE",
      ),
    ).toBe(true);
  });

  it("does not allow an acquisition theme to bypass semantic mapping", () => {
    const publishedThemes = [...new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.theme))].sort(
      (a, b) => a.localeCompare(b, "it"),
    );
    expect(getMappedProposalThemes()).toEqual(publishedThemes);
  });

  it("keeps backend classification richer than the compact public navigation", () => {
    const allUsed = getAvailablePaSubjects(PUBLIC_PROPOSALS);
    const primaryUsed = getAvailablePrimaryPaSubjects(PUBLIC_PROPOSALS);

    expect(allUsed.length).toBeGreaterThanOrEqual(primaryUsed.length);
    expect(primaryUsed.every((subject) => subject.uri.startsWith("http"))).toBe(true);
    expect(primaryUsed.some((subject) => subject.label === "Salute, benessere e assistenza")).toBe(true);
    expect(primaryUsed.some((subject) => subject.label === "Mobilità e trasporti")).toBe(true);
    expect(primaryUsed.some((subject) => subject.label === "Governo e settore pubblico")).toBe(true);
  });
});
