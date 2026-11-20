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

const id = "aeroporto-caro-voli-accordi-nucifero-2026";
describe("Scouting Nucifero: stessa proposta, due fonti, gate end-to-end", () => {
  it("preserva tutte le 15 materie AgID e i rispettivi metadati ufficiali", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(x => x.code)).size).toBe(15);
    for (const x of all) {
      expect(x.code).toBeTruthy();
      expect(x.label).toBeTruthy();
      expect(x.uri.startsWith("https://")).toBe(true);
      expect(x.schemeUri.startsWith("https://")).toBe(true);
      expect(x.authority).toBeTruthy();
    }
  });
  it("deduplica per promotore e oggetto e mantiene due eventi nello stesso ID", () => {
    const matches = PUBLIC_PROPOSALS.filter(p => p.id === id);
    expect(matches).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map(p => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    const p = matches[0]!;
    expect(p.promoterId).toBe("fernando-nucifero-udc");
    expect(p.promoterType).toBe("forza_politica");
    expect(p.institutionalRecipient).toBe("Regione Calabria");
    expect(p.channel).toBe("comunicato");
    expect(p.firstSeen).toBe("2026-11-03");
    expect(p.lastUpdated).toBe("2026-11-19");
    expect(p.events.map(e => e.date)).toEqual(["2026-11-03", "2026-11-19"]);
    expect(p.events.map(e => e.type)).toEqual(["emersione", "aggiornamento"]);
    expect(p.events[0]?.sourceUrl).toBe("https://www.lametino.it/calabria/caro-voli-lappello-di-nucifero-alla-regione-servono-accordi-con-le-compagnie-aeree.html");
    expect(p.events[1]?.sourceUrl).toBe("https://www.lametino.it/calabria/caro-voli-e-fondi-pubblici-nucifero-udc-regione-pretenda-tariffe-piu-accessibili.html");
    expect(p.linkedActs).toHaveLength(0);
    expect(PUBLIC_PROPOSALS.find(x => x.id === "aeroporto-intermodalita-rilancio-taverna-2026")?.promoterId).not.toBe(p.promoterId);
  });
  it("produce canonica distinta dall'acquisizione e materia primaria univoca", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const c = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(c.proposalId).toBe(id);
    expect(c.title).not.toBe(p.title);
    expect(c.request).toBeTruthy();
    expect(c.measures.length).toBeGreaterThanOrEqual(4);
    expect(c.measures.every(m => m.length > 20)).toBe(true);
    expect(c.actionTypes).toEqual(["coordinamento", "regolazione", "trasparenza"]);
    expect(c.expectedOutcome).toBeTruthy();
    const subject = getProposalPrimaryPaSubject(p);
    const secondary = getProposalSecondaryPaSubjects(p);
    expect(subject.code).toBe("4");
    expect(secondary.map(s => s.code)).toEqual(["9"]);
    expect(secondary.every(s => s.uri !== subject.uri)).toBe(true);
  });
  it("non confonde destinatario e competenza, né comunicazione e deposito", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const comp = getProposalInstitutionalCompetence(p);
    expect(comp.sourceAddressee).toBe(p.institutionalRecipient);
    expect(comp.publicAddressee).toBeTruthy();
    expect(comp.assessmentStatus).toBe("not_assessed");
    expect(comp.primaryAuthority).toBeUndefined();
    expect(comp.involvedAuthorities).toEqual([]);
    expect(p.status).toBe("proposta_emersa");
    const state = getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });
  it("conserva area nominata e non genera coordinate WGS84", () => {
    const g = getProposalGeography(id)!;
    expect(g.scope).toBe("area");
    expect(g.areas).toEqual(["sant_eufemia"]);
    expect(g.points).toHaveLength(0);
    expect(g.note).toContain("WGS84");
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
