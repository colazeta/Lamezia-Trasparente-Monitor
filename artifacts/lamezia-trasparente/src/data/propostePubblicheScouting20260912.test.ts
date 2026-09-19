import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const SCHOOL_ID = "scuole-orario-ridotto-caldo-settembre-2026";
const ASILI_ID = "asili-nido-continuita-servizio-2026";
const RUN_IDS = [SCHOOL_ID, ASILI_ID] as const;

describe("scouting updates 12 September 2026", () => {
  it("updates the same two proposal IDs without creating duplicates", () => {
    for (const id of RUN_IDS) {
      expect(PUBLIC_PROPOSALS.filter((proposal) => proposal.id === id)).toHaveLength(1);
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
      expect(proposal).toBeDefined();
      if (!proposal) continue;
      expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(id);
      expect(getProposalGeography(id)).toBeDefined();
      expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
      expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(id);
    }
  });

  it("records the verified school ordinance only as a non-causal institutional update", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === SCHOOL_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const event = proposal.events.find(
      (item) => item.id === "scuole-ordinanza-41-uscita-ore-12-10-settembre",
    );
    expect(event).toBeDefined();
    expect(event?.type).toBe("aggiornamento");
    expect(event?.evidenceLevel).toBe("fonte_ufficiale");
    expect(proposal.linkedActs).toContain(
      "Ordinanza Comune di Lamezia Terme n. 41 del 10/09/2026 — Albo Pretorio n. 2026/2924",
    );
    expect(getProposalInstitutionalState(proposal).implementation).toBe("none");
  });

  it("records the official nursery start date as calendarisation, not implementation", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === ASILI_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const event = proposal.events.find(
      (item) => item.id === "asili-nido-avvio-servizio-calendarizzato-15-settembre",
    );
    expect(event).toBeDefined();
    expect(event?.type).toBe("calendarizzazione");
    expect(event?.evidenceLevel).toBe("fonte_ufficiale");
    expect(proposal.status).toBe("presentata_formalmente");
    expect(getProposalInstitutionalState(proposal).implementation).toBe("none");
  });

  it("keeps the full official taxonomy and existing primary-secondary mappings", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);

    const school = PUBLIC_PROPOSALS.find((item) => item.id === SCHOOL_ID);
    const asili = PUBLIC_PROPOSALS.find((item) => item.id === ASILI_ID);
    expect(school).toBeDefined();
    expect(asili).toBeDefined();
    if (!school || !asili) return;

    expect(getProposalPrimaryPaSubject(school).code).toBe("1");
    expect(getProposalSecondaryPaSubjects(school).map((item) => item.code)).toEqual(["8"]);
    expect(getProposalPrimaryPaSubject(asili).code).toBe("1");
    expect(getProposalSecondaryPaSubjects(asili).map((item) => item.code)).toEqual(["2"]);
  });

  it("preserves coordinate-free citywide geography for the school proposal", () => {
    const geography = getProposalGeography(SCHOOL_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.points).toHaveLength(0);
  });
});
