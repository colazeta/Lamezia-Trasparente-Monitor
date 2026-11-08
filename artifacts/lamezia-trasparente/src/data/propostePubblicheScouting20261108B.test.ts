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

const id = "via-guido-dorso-ripristino-cristiano-villella-2026";
const source = "https://www.lametino.it/ultime/lamezia-via-guido-dorso-ridotta-a-un-colabrodo-consiglieri-cristiano-e-villella-presentano-interrogazione.html";

describe("Scouting 8 novembre B — controllo end-to-end sul medesimo proposal ID", () => {
  it("conserva tutte le 15 materie ufficiali, incluse quelle inutilizzate", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map(x => x.code)).size).toBe(15);
    for (const subject of catalogue) {
      expect(subject.code).toBeTruthy();
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
      expect(subject.source).toBe("schema.gov.it / AgID");
    }
  });

  it("valida acquisizione unica, canone operativo e classificazione official-first", () => {
    const hits = PUBLIC_PROPOSALS.filter(x => x.id === id);
    expect(hits).toHaveLength(1);
    const p = hits[0]!;
    expect(p.promoterId).toBe("futuro-nazionale-lamezia");
    expect(p.coPromoters).toEqual(["Massimo Cristiano", "Carmine Villella"]);
    expect(p.promoterType).toBe("forza_politica");
    expect(p.firstSeen).toBe("2026-11-07");
    expect(p.lastUpdated).toBe("2026-11-07");
    expect(p.channel).toBe("comunicato");
    expect(p.status).toBe("proposta_emersa");
    expect(p.sourceUrl).toBe(source);
    const canonical = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.version).toBe("1.0");
    expect(canonical.title.length).toBeGreaterThan(15);
    expect(canonical.request.length).toBeGreaterThan(45);
    expect(canonical.actionTypes).toContain("manutenzione");
    expect(canonical.measures).toHaveLength(4);
    expect(canonical.measures.every(x => x.length > 30)).toBe(true);
    const primary = getProposalPrimaryPaSubject(p);
    expect(primary.code).toBe("4");
    expect(primary.label).toBe("Mobilità e trasporti");
    expect(primary.uri).toMatch(/^https:\/\//);
    expect(primary.schemeUri).toMatch(/^https:\/\//);
    const secondary = getProposalSecondaryPaSubjects(p);
    expect(secondary.map(x => x.code)).toEqual(["8"]);
    expect(secondary.every(x => x.uri !== primary.uri)).toBe(true);
    expect(new Set(secondary.map(x => x.uri)).size).toBe(secondary.length);
  });

  it("separa interrogazione riferita dal deposito, e ricadute potenziali dall'attuazione", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    expect(p.linkedActs).toEqual([]);
    expect(p.events).toHaveLength(1);
    expect(p.events[0]!.type).toBe("emersione");
    expect(p.events[0]!.date).toBe("2026-11-07");
    expect(p.events[0]!.sourceUrl).toBe(source);
    expect(new Set(p.events.map(x => x.id)).size).toBe(p.events.length);
    expect(p.verificationNote).toContain("non si registra deposito formale");
    const state = getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });

  it("mantiene distinto il destinatario e non inventa la competenza", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    expect(p.institutionalRecipient).toContain("Sindaco");
    const assessment = getProposalInstitutionalCompetence(p);
    expect(assessment.sourceAddressee).toBe(p.institutionalRecipient);
    expect(assessment.publicAddressee).toBeTruthy();
    expect(assessment.assessmentStatus).toBe("not_assessed");
    expect(assessment.primaryAuthority).toBeUndefined();
    expect(assessment.involvedAuthorities).toEqual([]);
  });

  it("preserva area stradale specifica senza attribuirle coordinate", () => {
    const geo = getProposalGeography(id)!;
    expect(geo.label).toContain("Guido Dorso");
    expect(geo.scope).toBe("area");
    expect(geo.areas).toEqual(["intera_citta"]);
    expect(geo.points).toEqual([]);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });

  it("deduplica per promotore e distingue oggetti stradali diversi", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    for (const otherId of [
      "cafaldo-rifacimento-strade-cristiano-villella-2026",
      "contrade-acquadauzano-filicioni-viabilita-cristiano-villella-2026",
      "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026",
    ]) {
      const other = PUBLIC_PROPOSALS.find(x => x.id === otherId)!;
      expect(other.promoterId).toBe(p.promoterId);
      expect(other.id).not.toBe(p.id);
      expect(other.threadId).not.toBe(p.threadId);
      expect(other.territorialArea).not.toBe(p.territorialArea);
    }
  });
});
