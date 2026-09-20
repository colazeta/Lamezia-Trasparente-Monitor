import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  LT_SEMANTIC_EXTENSIONS,
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const SERRA_ANNUNZIATA_ID =
  "serra-annunziata-rifiuti-sicurezza-serratore-2026";

describe("scouted public proposal Serra e Annunziata and institutional follow-up", () => {
  it("publishes the proposal exactly once end to end", () => {
    expect(
      PUBLIC_PROPOSALS.filter(
        (proposal) => proposal.id === SERRA_ANNUNZIATA_ID,
      ),
    ).toHaveLength(1);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SERRA_ANNUNZIATA_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(
      SERRA_ANNUNZIATA_ID,
    );
    expect(getProposalGeography(SERRA_ANNUNZIATA_ID)).toBeDefined();
    expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
    expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(
      SERRA_ANNUNZIATA_ID,
    );
  });

  it("keeps the complete official vocabulary and classifies environment as primary", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SERRA_ANNUNZIATA_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("11");
    expect(getProposalSecondaryPaSubjects(proposal).map((item) => item.code)).toEqual([
      "8",
    ]);
  });

  it("uses a neutral canonical presentation with atomic measures", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SERRA_ANNUNZIATA_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.title).toBe(
      "Bonifica, monitoraggio e prevenzione nelle località Serra e Annunziata",
    );
    expect(canonical.measures).toHaveLength(6);
    expect(canonical.actionTypes).toEqual([
      "manutenzione",
      "prevenzione_rischio",
      "rafforzamento_servizio",
      "coordinamento",
    ]);
  });

  it("keeps the documented recipient separate from competence", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SERRA_ANNUNZIATA_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(
      "Comune di Lamezia Terme — Consiglio comunale",
    );
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
  });

  it("records official calendarisation without inferring discussion, reception or implementation", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SERRA_ANNUNZIATA_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.channel).toBe("mozione");
    expect(proposal.status).toBe("presentata_formalmente");
    expect(proposal.lastUpdated).toBe("2026-09-18");
    expect(proposal.events.map((event) => event.type)).toEqual([
      "deposito",
      "calendarizzazione",
    ]);
    expect(proposal.linkedActs.join(" ")).toContain("2026/3001");
    expect(proposal.linkedActs.join(" ")).toContain("71796/2026");

    const calendarisation = proposal.events.find(
      (event) => event.type === "calendarizzazione",
    );
    expect(calendarisation?.evidenceLevel).toBe("fonte_ufficiale");
    expect(calendarisation?.summary).toContain("21 settembre 2026 alle 10:30");
    expect(calendarisation?.summary).toContain("71796/2026");

    const institutionalState = getProposalInstitutionalState(proposal);
    expect(institutionalState.implementation).toBe("none");
    expect(proposal.events.some((event) => event.type === "discussione")).toBe(
      false,
    );
    expect(proposal.events.some((event) => event.type === "recepimento")).toBe(
      false,
    );
  });

  it("uses area geography without unverified coordinates", () => {
    const geography = getProposalGeography(SERRA_ANNUNZIATA_ID);
    expect(geography?.scope).toBe("area");
    expect(geography?.areas).toEqual(["nicastro"]);
    expect(geography?.points).toHaveLength(0);
  });
});
