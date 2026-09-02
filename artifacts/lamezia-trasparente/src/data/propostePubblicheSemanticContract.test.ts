import { describe, expect, it } from "vitest";

import {
  PA_PUBLIC_SERVICE_SUBJECT_CODES,
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getAvailablePrimaryPaSubjects,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  proposalMatchesPrimaryPaSubject,
} from "./propostePubbliche";

describe("public proposal semantic contract", () => {
  it("exposes the complete official taxonomy through the public data module", () => {
    expect(PA_PUBLIC_SERVICE_SUBJECT_CODES).toHaveLength(15);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
  });

  it("exposes one primary subject per proposal and keeps secondary subjects separate", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const primary = getProposalPrimaryPaSubject(proposal);
      const secondary = getProposalSecondaryPaSubjects(proposal);

      expect(primary.code).toBeTruthy();
      expect(proposalMatchesPrimaryPaSubject(proposal, primary.code)).toBe(true);
      expect(secondary.some((subject) => subject.uri === primary.uri)).toBe(false);
    }
  });

  it("keeps public navigation smaller than the complete backend taxonomy", () => {
    const publicSubjects = getAvailablePrimaryPaSubjects(PUBLIC_PROPOSALS);
    expect(publicSubjects.length).toBeGreaterThan(0);
    expect(publicSubjects.length).toBeLessThanOrEqual(
      getAllPaPublicServiceSubjects().length + 1,
    );
  });
});
