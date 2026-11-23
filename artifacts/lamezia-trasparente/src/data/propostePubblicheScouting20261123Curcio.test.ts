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

const id = "via-domenico-curcio-manutenzione-drenaggio-residenti-2026";

describe("Scouting 23 novembre: recupero via Domenico Curcio e criticità del drenaggio", () => {
  const proposal = PUBLIC_PROPOSALS.find((p) => p.id === id)!;

  it("conserva una sola proposta per promotore e oggetto con due eventi datati", () => {
    expect(proposal).toBeDefined();
    expect(PUBLIC_PROPOSALS.filter((p) => p.id === id)).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map((p) => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    expect(proposal.promoterId).toBe("residenti-via-domenico-curcio-magola");
    expect(proposal.promoterType).toBe("cittadino_comitato");
    expect(proposal.events.map((e) => e.date)).toEqual(["2026-07-16", "2026-11-03"]);
    expect(proposal.events.map((e) => e.type)).toEqual(["emersione", "aggiornamento"]);
    expect(proposal.events.every((e) => !["deposito", "recepimento", "petizione"].includes(e.type))).toBe(true);
    expect(proposal.linkedActs).toHaveLength(0);
  });

  it("espone presentazione canonica neutrale e distinta dall'acquisizione", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.title).toContain("Domenico Curcio");
    expect(canonical.title).not.toMatch(/cancellano|allagamento accertato/i);
    expect(canonical.request).toBeTruthy();
    expect(canonical.measures).toHaveLength(5);
    expect(canonical.measures.every((m) => /^(Verificare|Accertare|Ripristinare|Individuare|Comunicare)/.test(m))).toBe(true);
    expect(canonical.expectedOutcome).not.toMatch(/attuato|realizzato|completato/i);
  });

  it("conserva il vocabolario ufficiale completo e una primaria con secondarie distinte", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map((s) => s.code)).size).toBe(15);
    subjects.forEach((s) => {
      expect(s.label).toBeTruthy();
      expect(s.uri).toMatch(/^https:\/\//);
      expect(s.schemeUri).toMatch(/^https:\/\//);
      expect(s.authority).toBeTruthy();
    });
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("4");
    expect(getProposalSecondaryPaSubjects(proposal).map((s) => s.code)).toEqual(["8", "11"]);
  });

  it("non trasforma l'indirizzamento al Comune in competenza, deposito o attuazione", () => {
    expect(proposal.institutionalRecipient).toContain("Comune di Lamezia Terme");
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    const state = getProposalInstitutionalState(proposal);
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.publicState).toBe("segnalata");
    expect(state.implementation).toBe("none");
  });

  it("rappresenta Magolà come area non georeferenziata", () => {
    const geography = getProposalGeography(id)!;
    expect(geography.scope).toBe("area");
    expect(geography.areas).toEqual(["nicastro"]);
    expect(geography.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
