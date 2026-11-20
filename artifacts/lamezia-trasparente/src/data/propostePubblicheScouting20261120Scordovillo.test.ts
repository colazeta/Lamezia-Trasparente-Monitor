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
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
import { SCORDOVILLO_DISCUSSION_IDS, SCORDOVILLO_20261119_SOURCE } from "./proposalScoutingUpdates20261120Scordovillo";

const eventId = "scordovillo-consiglio-aperto-seduta-effettiva-2026-11-19";

describe("Scouting 20 novembre: seduta Scordovillo documentata per gli stessi due proposal ID", () => {
  const ids = SCORDOVILLO_DISCUSSION_IDS;
  const proposals = ids.map(id => PUBLIC_PROPOSALS.find(p => p.id === id)!);

  it("preserva due promoter diversi in un filone senza duplicati", () => {
    expect(proposals.every(Boolean)).toBe(true);
    for (const id of ids) expect(PUBLIC_PROPOSALS.filter(p => p.id === id)).toHaveLength(1);
    expect(proposals[0].promoterId).not.toBe(proposals[1].promoterId);
    expect(proposals[0].threadId).toBe(proposals[1].threadId);
    expect(proposals.map(p => p.lastUpdated)).toEqual(["2026-11-19", "2026-11-19"]);
  });

  it("registra la discussione reale ma non inventa deposito, calendario ufficiale o attuazione", () => {
    for (const p of proposals) {
      expect(p.status).toBe("discussa");
      expect(p.events.filter(e => e.id === eventId)).toHaveLength(1);
      const event = p.events.find(e => e.id === eventId)!;
      expect(event.type).toBe("discussione");
      expect(event.date).toBe("2026-11-19");
      expect(event.sourceUrl).toBe(SCORDOVILLO_20261119_SOURCE);
      expect(event.evidenceLevel).toBe("ricostruzione_multi_fonte");
      expect(p.events.some(e => e.type === "deposito" || e.type === "calendarizzazione" || e.type === "recepimento")).toBe(false);
      expect(p.events.every(e => e.date <= p.lastUpdated)).toBe(true);
      expect(p.verificationNote).toContain("verbale");
      expect(p.verificationNote).toContain("NON riguarda");
      const state = getProposalInstitutionalState(p);
      expect(state.progressStage).toBe("discussa");
      expect(state.publicState).toBe("con_seguito");
      expect(state.hasInstitutionalFollowUp).toBe(true);
      expect(state.implementation).toBe("none");
      expect(state.institutionalEventCount).toBe(1);
    }
  });

  it("mantiene canonica neutra, misure atomiche, materia official-first e vocabolario integrale", () => {
    const official = getAllPaPublicServiceSubjects();
    expect(official).toHaveLength(15);
    expect(new Set(official.map(x => x.code)).size).toBe(15);
    official.forEach(x => {
      expect(x.code).toBeTruthy();
      expect(x.label).toBeTruthy();
      expect(x.uri).toMatch(/^https:\/\//);
      expect(x.schemeUri).toMatch(/^https:\/\//);
      expect(x.authority).toBeTruthy();
    });
    for (const p of proposals) {
      expect(getCanonicalProposalPresentationIds()).toContain(p.id);
      const canonical = getCanonicalProposalPresentation(p);
      expect(canonical.proposalId).toBe(p.id);
      expect(canonical.request.length).toBeGreaterThan(40);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
      expect(canonical.actionTypes).toEqual(["organizzazione", "trasparenza", "coordinamento"]);
      expect(canonical.editorialNote).toContain("19 novembre 2026");
      expect(canonical.editorialNote).toContain("non costituisce approvazione");
      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe("GOVE");
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      expect(getProposalSecondaryPaSubjects(p)).toEqual([]);
    }
  });

  it("non inferisce competenza dal destinatario e conserva geografia citywide non georeferenziata", () => {
    for (const p of proposals) {
      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("partially_verified");
      expect(competence.primaryAuthority?.id).toBe("presidente-consiglio-comunale-lamezia-terme");
      expect(competence.primaryAuthority?.sourceUrl).toContain("regolamento");
      expect(competence.involvedAuthorities).toEqual([]);
      const geo = getProposalGeography(p.id)!;
      expect(geo.scope).toBe("citywide");
      expect(geo.areas).toEqual(["intera_citta"]);
      expect(geo.points).toHaveLength(0);
      expect(isProposalGeoreferenced(p.id)).toBe(false);
    }
  });
});
