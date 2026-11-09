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

const id = "infermieristica-sede-ospedale-parco-agricolo-2026";
const source = "https://cityonelamezia.it/2026/11/06/corso-di-laurea-in-infermieristica-la-sede-ideale-e-lospedale-giovanni-paolo-ii-renda/";

describe("Scouting 9 novembre — gate end-to-end sul medesimo proposal ID", () => {
  it("mantiene il vocabolario ufficiale completo nel backend", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map(x => x.code)).size).toBe(15);
    for (const subject of catalogue) {
      expect(subject.code).toBeTruthy();
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
    }
  });
  it("normalizza il promotore, acquisisce una sola proposta e mostra un canone autonomo", () => {
    const hits = PUBLIC_PROPOSALS.filter(x => x.id === id);
    expect(hits).toHaveLength(1);
    const p = hits[0]!;
    expect(p.promoterId).toBe("parco-agricolo-calabria");
    expect(p.promoterType).toBe("associazione");
    expect(p.coPromoters).toEqual(["Piero Renda"]);
    expect(p.channel).toBe("comunicato");
    expect(p.status).toBe("proposta_emersa");
    expect(p.firstSeen).toBe("2026-11-06");
    expect(p.sourceUrl).toBe(source);
    const canonical = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.version).toBe("1.0");
    expect(canonical.request.length).toBeGreaterThan(40);
    expect(canonical.measures).toHaveLength(3);
    expect(canonical.measures.every(x => x.length > 35)).toBe(true);
    expect(canonical.actionTypes).toContain("organizzazione");
  });
  it("mappa una sola materia primaria e secondaria ufficiale separata", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const primary = getProposalPrimaryPaSubject(p);
    expect(primary.code).toBe("1");
    expect(primary.label).toBe("Educazione e formazione");
    expect(primary.schemeUri).toMatch(/^https:\/\//);
    const secondary = getProposalSecondaryPaSubjects(p);
    expect(secondary.map(x => x.code)).toEqual(["2"]);
    expect(secondary[0]!.uri).not.toBe(primary.uri);
  });
  it("non confonde comunicato, petizione, deposito, recepimento e attuazione", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    expect(p.linkedActs).toEqual([]);
    expect(p.events).toHaveLength(1);
    expect(p.events[0]!.date).toBe("2026-11-06");
    expect(p.events[0]!.type).toBe("emersione");
    expect(p.events[0]!.sourceUrl).toBe(source);
    expect(new Set(p.events.map(x => x.id)).size).toBe(1);
    const state = getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });
  it("non deriva la competenza istituzionale dal destinatario", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    expect(p.institutionalRecipient).toContain("Amministrazione comunale");
    const competence = getProposalInstitutionalCompetence(p);
    expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
    expect(competence.publicAddressee).toBeTruthy();
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    expect(competence.involvedAuthorities).toEqual([]);
  });
  it("non georeferenzia coordinate ospedaliere incerte né citywide", () => {
    const geo = getProposalGeography(id)!;
    expect(geo.scope).toBe("area");
    expect(geo.points).toEqual([]);
    expect(geo.areas).toEqual(["intera_citta"]);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
  it("non duplica la distinta richiesta del promotore sulla Polizia Locale", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const other = PUBLIC_PROPOSALS.find(x => x.id === "polizia-locale-piano-assunzioni-h24-parco-agricolo-2026")!;
    expect(other.promoterId).toBe(p.promoterId);
    expect(other.threadId).not.toBe(p.threadId);
    expect(other.id).not.toBe(p.id);
  });
});
