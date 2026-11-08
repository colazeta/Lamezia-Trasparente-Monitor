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

const canonicalId = "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026";
const retiredDuplicateId = "scuola-perri-pitagora-don-milani-orario-sei-giorni-di-spena-2026";
const source = "https://www.change.org/p/ripristino-dell-orario-scolastico-8-15-13-15-all-i-c-perri-pitagora-don-milani";

describe("Scouting 8 novembre: deduplica della petizione Di Spena senza perdita di evidenze", () => {
  it("conserva un solo record per promotore, fonte ed oggetto", () => {
    const matches = PUBLIC_PROPOSALS.filter(p => p.sourceUrl === source && p.firstSeen === "2026-09-19");
    expect(matches).toHaveLength(1);
    expect(matches[0]?.id).toBe(canonicalId);
    expect(PUBLIC_PROPOSALS.some(p => p.id === retiredDuplicateId)).toBe(false);
    expect(new Set(PUBLIC_PROPOSALS.map(p => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
  });

  it("mantiene canone, tassonomia e audit sullo stesso ID", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    for (const item of catalogue) {
      expect(item.code).toBeTruthy();
      expect(item.uri).toMatch(/^https:\/\//);
      expect(item.schemeUri).toMatch(/^https:\/\//);
      expect(item.authority).toBeTruthy();
    }
    const p = PUBLIC_PROPOSALS.find(p => p.id === canonicalId)!;
    expect(p.promoterId).toBe("silvia-di-spena");
    expect(p.promoterType).toBe("cittadino_comitato");
    expect(p.channel).toBe("petizione");
    expect(p.sourceUrl).toBe(source);
    expect(p.firstSeen).toBe("2026-09-19");
    expect(p.institutionalRecipient).toContain("Consiglio d'Istituto");
    const presentation = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(canonicalId);
    expect(getCanonicalProposalPresentationIds()).not.toContain(retiredDuplicateId);
    expect(presentation.proposalId).toBe(canonicalId);
    expect(presentation.measures.length).toBeGreaterThanOrEqual(3);
    expect(getProposalPrimaryPaSubject(p).code).toBe("1");
    expect(getProposalSecondaryPaSubjects(p).map(x => x.code)).toEqual(["4"]);
  });

  it("non scambia petizione per deposito, atto precedente per risposta né risposta per attuazione", () => {
    const p = PUBLIC_PROPOSALS.find(p => p.id === canonicalId)!;
    expect(p.events).toHaveLength(1);
    expect(p.events[0]!.type).toBe("petizione");
    expect(p.linkedActs).toHaveLength(0);
    const state = getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
  });

  it("verifica solo parzialmente la competenza su fonte scolastica diretta, senza dedurla dal destinatario", () => {
    const p = PUBLIC_PROPOSALS.find(p => p.id === canonicalId)!;
    const c = getProposalInstitutionalCompetence(p);
    expect(c.sourceAddressee).toBe(p.institutionalRecipient);
    expect(c.publicAddressee).toBeTruthy();
    expect(c.assessmentStatus).toBe("partially_verified");
    expect(c.primaryAuthority?.id).toBe("ic-perri-pitagora-don-milani");
    expect(c.primaryAuthority?.sourceUrl).toContain("adozione-della-settimana-corta");
    expect(c.involvedAuthorities).toEqual([]);
    expect(c.assessmentNote).toContain("non è inserito come ente competente");
  });

  it("mantiene geografia area multi-plesso senza coordinate artificiali", () => {
    const geo = getProposalGeography(canonicalId)!;
    expect(geo.scope).toBe("area");
    expect(geo.areas).toEqual(["intera_citta"]);
    expect(geo.points).toHaveLength(0);
    expect(isProposalGeoreferenced(canonicalId)).toBe(false);
    expect(getProposalGeography(retiredDuplicateId)).toBeUndefined();
  });
});
