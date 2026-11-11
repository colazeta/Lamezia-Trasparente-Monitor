import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import { getProposalGeography } from "./proposalGeography";
import { applyScoutingUpdates20261111Taverna } from "./proposalScoutingUpdates20261111Taverna";

const ID = "aeroporto-intermodalita-rilancio-taverna-2026";
const SOURCE = "https://www.lametino.it/ultime/lamezia-taverna-pd-aeroporto-tra-cantieri-fermi-e-voli-doro-che-penalizzano-i-calabresi.html";

describe("Scouting 11 novembre — Taverna: stesso proposal ID, sviluppo aeroporto", () => {
  const proposal = PUBLIC_PROPOSALS.find(p => p.id === ID)!;

  it("deduplica per promotore, tema e oggetto, preservando acquisizione e canale", () => {
    expect(PUBLIC_PROPOSALS.filter(p => p.id === ID)).toHaveLength(1);
    expect(proposal.promoterId).toBe("domenico-taverna-pd-lamezia");
    expect(proposal.promoterType).toBe("forza_politica");
    expect(proposal.theme).toBe("Mobilità, aeroporto e sviluppo territoriale");
    expect(proposal.channel).toBe("comunicato");
    expect(proposal.firstSeen).toBe("2026-09-01");
    expect(proposal.lastUpdated).toBe("2026-11-10");
    expect(proposal.sourceUrl).toContain("01-settembre-2026".replace("01-settembre-2026","aeroporti-calabresi-taverna"));
  });

  it("mantiene una timeline idempotente, fondata su due comunicati distinti", () => {
    expect(proposal.events.map(e => e.date)).toEqual(["2026-09-01", "2026-11-10"]);
    expect(proposal.events.map(e => e.type)).toEqual(["emersione", "aggiornamento"]);
    expect(proposal.events[1]?.sourceUrl).toBe(SOURCE);
    expect(new Set(proposal.events.map(e => e.id)).size).toBe(proposal.events.length);
    expect(applyScoutingUpdates20261111Taverna(proposal)).toBe(proposal);
    expect(proposal.events.every(e => e.sourceUrl?.startsWith("https://"))).toBe(true);
    expect(proposal.events.some(e => ["petizione", "deposito", "calendarizzazione", "recepimento"].includes(e.type))).toBe(false);
    expect(proposal.verificationNote).toContain("non accertamenti indipendenti");
  });

  it("preserva la presentazione canonica, con nuove misure atomiche e nessun risultato presunto", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(ID);
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(ID);
    expect(canonical.measures).toHaveLength(5);
    expect(canonical.measures.some(m => m.includes("cronoprogramma"))).toBe(true);
    expect(canonical.measures.some(m => m.includes("vettori"))).toBe(true);
    expect(canonical.actionTypes).toContain("trasparenza");
    expect(canonical.editorialNote).toContain("non è stata accertata");
  });

  it("mantiene il catalogo delle 15 materie official-first e una sola primaria", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map(s => s.code)).size).toBe(15);
    for (const s of catalogue) {
      expect(s.code).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.uri).toMatch(/^https:\/\//);
      expect(s.schemeUri).toMatch(/^https:\/\//);
      expect(s.authority).toBeTruthy();
    }
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("4");
    expect(getProposalSecondaryPaSubjects(proposal).map(s => s.code)).toEqual(["7"]);
  });

  it("non inferisce competenza tariffaria dal destinatario e preserva la geografia", () => {
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.publicAddressee).toBeTruthy();
    expect(competence.assessmentStatus).toBe("partially_verified");
    expect(competence.assessmentNote).toContain("tariff");
    expect(getProposalGeography(ID)).toBeDefined();
  });

  it("deriva lo stato pubblico senza inferire deposito, risposta o attuazione", () => {
    const state = getProposalInstitutionalState(proposal);
    expect(state.progressStage).toBe("emersa");
    expect(state.publicState).toBe("segnalata");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });
});
