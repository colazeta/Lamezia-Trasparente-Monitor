import { describe, expect, it } from "vitest";

import {
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
} from "./propostePubbliche";

const EMODINAMICA_IDS = [
  "emodinamica-h24-giovanni-paolo-ii-2026",
  "emodinamica-h24-vescio-2026",
  "emodinamica-h24-nucifero-2026",
] as const;

describe("scouting updates 6 September 2026", () => {
  it("updates each H24 proposal once without merging distinct promoters", () => {
    for (const id of EMODINAMICA_IDS) {
      const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === id);
      expect(matches).toHaveLength(1);
      expect(matches[0].lastUpdated).toBe("2026-09-04");
      expect(
        matches[0].events.some(
          (event) =>
            event.date === "2026-09-04" &&
            event.type === "aggiornamento" &&
            event.title.includes("operatività della sala di cardiologia interventistica"),
        ),
      ).toBe(true);
    }
  });

  it("keeps the operational room update distinct from implementation of H24", () => {
    for (const id of EMODINAMICA_IDS) {
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
      expect(proposal).toBeDefined();
      if (!proposal) continue;

      expect(getProposalInstitutionalState(proposal).implementation).toBe("none");
      expect(proposal.verificationNote).toContain(
        "non documentano un servizio di emodinamica strutturale H24/7",
      );
    }
  });

  it("preserves canonical presentation and the official health primary matter", () => {
    for (const id of EMODINAMICA_IDS) {
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
      expect(proposal).toBeDefined();
      if (!proposal) continue;

      expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(id);
      expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    }
  });
});
