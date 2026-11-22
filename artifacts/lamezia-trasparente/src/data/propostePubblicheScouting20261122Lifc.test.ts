import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "centro-fibrosi-cistica-lamezia-tutela-spazi-lifc-2026";

describe("Scouting 22 novembre: Centro Fibrosi Cistica e richiesta LIFC", () => {
  const proposal = PUBLIC_PROPOSALS.find((p) => p.id === id)!;

  it("censisce una sola richiesta e una timeline senza deposito artificiale", () => {
    expect(proposal).toBeDefined();
    expect(PUBLIC_PROPOSALS.filter((p) => p.id === id)).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map((p) => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    expect(proposal.promoterId).toBe("lifc-calabria-odv");
    expect(proposal.promoterType).toBe("associazione");
    expect(proposal.events.map((e) => e.date)).toEqual(["2026-11-17", "2026-11-21", "2026-11-21"]);
    expect(proposal.events.map((e) => e.type)).toEqual(["discussione", "emersione", "risposta_istituzionale"]);
    expect(proposal.events.every((e) => !["deposito","petizione","recepimento"].includes(e.type))).toBe(true);
    expect(proposal.linkedActs).toHaveLength(0);
    expect(proposal.sourceUrl).toContain("lametino.it");
  });

  it("fornisce una presentazione canonica distinta dall'acquisizione", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.title).toContain("fibrosi cistica");
    expect(canonical.request).toBeTruthy();
    expect(canonical.measures).toHaveLength(3);
    expect(canonical.measures.every((m) => /^(Mantenere|Conservare|Confrontare)/.test(m))).toBe(true);
    expect(canonical.expectedOutcome).not.toMatch(/attuato|realizzato|completato/i);
  });

  it("conserva integralmente 15 materie ufficiali e una primaria AgID", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map((s) => s.code)).size).toBe(15);
    subjects.forEach((s) => {
      expect(s.label).toBeTruthy();
      expect(s.uri).toMatch(/^https:\/\//);
      expect(s.schemeUri).toMatch(/^https:\/\//);
      expect(s.authority).toBeTruthy();
    });
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toEqual([]);
  });

  it("mantiene destinatario distinto da competenza e risposta distinta dall'attuazione", () => {
    expect(proposal.institutionalRecipient).toContain("ASP");
    const comp = getProposalInstitutionalCompetence(proposal);
    expect(comp.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(comp.assessmentStatus).toBe("not_assessed");
    expect(comp.primaryAuthority).toBeUndefined();
    const state = getProposalInstitutionalState(proposal);
    expect(state.progressStage).toBe("risposta_ricevuta");
    expect(state.hasInstitutionalFollowUp).toBe(true);
    expect(state.hasFormalization).toBe(false);
    expect(state.publicState).toBe("con_seguito");
    expect(state.implementation).toBe("none");
  });

  it("usa un'area ospedaliera senza coordinate create artificialmente", () => {
    const geography = getProposalGeography(id)!;
    expect(geography.scope).toBe("area");
    expect(geography.areas).toEqual(["nicastro"]);
    expect(geography.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
