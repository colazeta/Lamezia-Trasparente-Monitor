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

const priorId = "ex-cinema-grandinetti-bonifica-2026";
const newId = "ex-cinema-grandinetti-gestione-salvatore-vescio-2026";
const ids = [priorId, newId] as const;
const source = "https://www.lametino.it/ultime/lamezia-vescio-passi-avanti-per-restituire-alla-citta-ex-cinema-teatro-grandinetti-di-sambiase.html";

describe("Scouting 10 novembre — due proposal ID senza falsi esiti istituzionali", () => {
  it("mantiene il catalogo ufficiale integrale di 15 materie e metadati autoritativi", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(x => x.code)).size).toBe(15);
    for (const item of subjects) {
      expect(item.code).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.uri).toMatch(/^https:\/\//);
      expect(item.schemeUri).toMatch(/^https:\/\//);
      expect(item.authority).toBeTruthy();
    }
  });
  it("deduplica gli ID, distingue Lidia e Salvatore Vescio e conserva lo stesso filone", () => {
    for (const id of ids) expect(PUBLIC_PROPOSALS.filter(p => p.id === id)).toHaveLength(1);
    const oldP = PUBLIC_PROPOSALS.find(p => p.id === priorId)!;
    const newP = PUBLIC_PROPOSALS.find(p => p.id === newId)!;
    expect(oldP.promoterId).toBe("lidia-vescio");
    expect(newP.promoterId).toBe("salvatore-vescio");
    expect(newP.promoterType).toBe("consigliere");
    expect(newP.channel).toBe("comunicato");
    expect(newP.firstSeen).toBe("2026-11-09");
    expect(newP.sourceUrl).toBe(source);
    expect(newP.status).toBe("proposta_emersa");
    expect(oldP.threadId).toBe(newP.threadId);
    expect(oldP.theme).not.toBe(newP.theme);
  });
  it("garantisce la presentazione canonica per entrambi gli ID", () => {
    for (const id of ids) {
      const proposal = PUBLIC_PROPOSALS.find(p => p.id === id)!;
      expect(getCanonicalProposalPresentationIds()).toContain(id);
      const presentation = getCanonicalProposalPresentation(proposal);
      expect(presentation.proposalId).toBe(id);
      expect(presentation.version).toBe("1.0");
      expect(presentation.request.length).toBeGreaterThan(35);
      expect(presentation.measures.length).toBeGreaterThan(1);
    }
    const newP = PUBLIC_PROPOSALS.find(p => p.id === newId)!;
    expect(getCanonicalProposalPresentation(newP).actionTypes).toContain("organizzazione");
  });
  it("usa una sola materia ufficiale primaria per ID con classificazioni secondarie distinte", () => {
    const oldP = PUBLIC_PROPOSALS.find(p => p.id === priorId)!;
    const newP = PUBLIC_PROPOSALS.find(p => p.id === newId)!;
    expect(getProposalPrimaryPaSubject(oldP).code).toBe("5");
    expect(getProposalPrimaryPaSubject(newP).code).toBe("10");
    expect(getProposalSecondaryPaSubjects(newP).map(x => x.code)).toEqual(["5"]);
    expect(getProposalSecondaryPaSubjects(oldP).map(x => x.code)).toContain("10");
    expect(getProposalPrimaryPaSubject(newP).uri).not.toBe(getProposalSecondaryPaSubjects(newP)[0]?.uri);
  });
  it("registra dichiarazioni di approvazione e lavori solo come aggiornamento, non come attuazione", () => {
    const oldP = PUBLIC_PROPOSALS.find(p => p.id === priorId)!;
    const event = oldP.events.find(e => e.id === "lidia-vescio-grandinetti-esito-riferito-2026-08-18");
    expect(event?.date).toBe("2026-08-18");
    expect(event?.type).toBe("aggiornamento");
    expect(oldP.lastUpdated).toBe("2026-08-18");
    expect(new Set(oldP.events.map(e => e.id)).size).toBe(oldP.events.length);
    expect(oldP.status).toBe("presentata_formalmente");
    expect(oldP.events.filter(e => e.type === "recepimento")).toHaveLength(0);
    const newP = PUBLIC_PROPOSALS.find(p => p.id === newId)!;
    expect(newP.linkedActs).toEqual([]);
    expect(newP.events).toHaveLength(1);
    expect(newP.events[0]!.type).toBe("emersione");
    const state = getProposalInstitutionalState(newP);
    expect(state.publicState).toBe("segnalata");
    expect(state.hasFormalization).toBe(false);
    expect(state.implementation).toBe("none");
  });
  it("mantiene il destinatario separato dalla competenza", () => {
    for (const id of ids) {
      const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
      const competence = getProposalInstitutionalCompetence(p);
      expect(p.institutionalRecipient).toBeTruthy();
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);
    }
  });
  it("verifica il medesimo landmark WGS84 sulla fonte cartografica e non inventa una seconda ubicazione", () => {
    const oldGeo = getProposalGeography(priorId)!;
    const newGeo = getProposalGeography(newId)!;
    expect(oldGeo.scope).toBe("point");
    expect(newGeo.scope).toBe("point");
    expect(newGeo.areas).toEqual(["sambiase"]);
    expect(newGeo.points).toHaveLength(1);
    expect(newGeo.points[0]?.latitude).toBe(oldGeo.points[0]?.latitude);
    expect(newGeo.points[0]?.longitude).toBe(oldGeo.points[0]?.longitude);
    expect(newGeo.points[0]?.sourceUrl).toBe("https://mapcarta.com/W596701561");
    expect(isProposalGeoreferenced(newId)).toBe(true);
  });
});
