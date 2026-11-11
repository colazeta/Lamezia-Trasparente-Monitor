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

const priorId = "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";
const newId = "scordovillo-consiglio-aperto-pd-azione-per-vivere-bene-2026";
const ids = [priorId, newId] as const;
const originalSource =
  "https://www.lametino.it/ultime/lamezia-il-19-novembre-consiglio-comunale-aperto-sul-superamento-del-campo-rom-di-scordovillo.html";

describe("Scouting 11 novembre — Scordovillo: due promotori, unico filone e status probatorio", () => {
  const proposals = ids.map(id => PUBLIC_PROPOSALS.find(p => p.id === id)!);

  it("mantiene tutte le 15 materie ufficiali comprensive dei metadati, anche non utilizzate", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map(x => x.code)).size).toBe(15);
    for (const item of catalogue) {
      expect(item.code).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.uri).toMatch(/^https:\/\//);
      expect(item.schemeUri).toMatch(/^https:\/\//);
      expect(item.authority).toBeTruthy();
    }
  });

  it("preserva gli ID, deduplica per identità e distingue i promotori", () => {
    for (const id of ids) expect(PUBLIC_PROPOSALS.filter(p => p.id === id)).toHaveLength(1);
    const [prior, current] = proposals;
    expect(prior.promoterId).toBe("futuro-nazionale-lamezia");
    expect(current.promoterId).toBe("gruppi-consiliari-pd-azione-per-vivere-bene-lamezia");
    expect(prior.promoterId).not.toBe(current.promoterId);
    expect(prior.threadId).toBe(current.threadId);
    expect(current.coPromoters).toHaveLength(6);
    expect(current.channel).toBe("comunicato");
    expect(current.firstSeen).toBe("2026-11-10");
    expect(current.sourceUrl).toBe(originalSource);
  });

  it("copre entrambi gli ID con una presentazione canonica LT non promozionale", () => {
    for (const proposal of proposals) {
      expect(getCanonicalProposalPresentationIds()).toContain(proposal.id);
      const presentation = getCanonicalProposalPresentation(proposal);
      expect(presentation.proposalId).toBe(proposal.id);
      expect(presentation.version).toBe("1.0");
      expect(presentation.request.length).toBeGreaterThan(45);
      expect(presentation.measures.length).toBeGreaterThanOrEqual(3);
      expect(presentation.actionTypes).toContain("trasparenza");
    }
  });

  it("assegna una sola materia primaria ufficiale e mantiene separate le secondarie", () => {
    for (const p of proposals) {
      const primary = getProposalPrimaryPaSubject(p);
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(primary.code).toBe("GOVE");
      expect(primary.uri).toBe("http://publications.europa.eu/resource/authority/data-theme/GOVE");
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      expect(secondary).toEqual([]);
    }
  });

  it("registra il nuovo sviluppo nella stessa timeline originale senza falsi depositi o calendarizzazioni", () => {
    const [prior, current] = proposals;
    expect(prior.events).toHaveLength(4);
    expect(prior.lastUpdated).toBe("2026-11-10");
    const priorNew = prior.events.find(e => e.id === "scordovillo-centrosinistra-data-consiglio-aperto-riferita-2026-11-10");
    expect(priorNew?.type).toBe("aggiornamento");
    expect(priorNew?.sourceUrl).toBe(originalSource);
    expect(current.events).toHaveLength(1);
    expect(current.events[0]?.type).toBe("emersione");
    expect(current.events[0]?.date).toBe("2026-11-10");
    for (const proposal of proposals) {
      expect(new Set(proposal.events.map(e => e.id)).size).toBe(proposal.events.length);
      expect(proposal.events.some(e => ["petizione", "deposito", "calendarizzazione", "discussione", "recepimento"].includes(e.type))).toBe(false);
      expect(proposal.events.every(e => e.date >= proposal.firstSeen && e.date <= proposal.lastUpdated)).toBe(true);
      expect(proposal.events.every(e => e.sourceUrl?.startsWith("https://"))).toBe(true);
      expect(proposal.verificationNote).toContain("convocazione");
    }
  });

  it("separa esplicitamente l'addressee dall'assessment di competenza fondato sul Regolamento", () => {
    for (const proposal of proposals) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("partially_verified");
      expect(competence.primaryAuthority?.id).toBe("presidente-consiglio-comunale-lamezia-terme");
      expect(competence.primaryAuthority?.sourceUrl).toContain("regolamento-di-funzionamento");
      expect(competence.assessmentNote).toBeTruthy();
      expect(competence.involvedAuthorities).toEqual([]);
    }
  });

  it("deriva lo stato sintetico senza inferire attuazione, recepimento o deposizioni", () => {
    for (const proposal of proposals) {
      const state = getProposalInstitutionalState(proposal);
      expect(state.progressStage).toBe("emersa");
      expect(state.publicState).toBe("segnalata");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");
    }
  });

  it("mantiene entrambe le geografie citywide non georeferenziate", () => {
    for (const id of ids) {
      const geography = getProposalGeography(id)!;
      expect(geography.scope).toBe("citywide");
      expect(geography.areas).toEqual(["intera_citta"]);
      expect(geography.points).toHaveLength(0);
      expect(isProposalGeoreferenced(id)).toBe(false);
    }
  });
});
