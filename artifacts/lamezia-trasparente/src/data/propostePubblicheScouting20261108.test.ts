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

const id = "scuola-perri-pitagora-don-milani-orario-sei-giorni-di-spena-2026";
const source = "https://www.change.org/p/ripristino-dell-orario-scolastico-8-15-13-15-all-i-c-perri-pitagora-don-milani";

describe("Scouting 8 novembre — stesso proposal ID in ogni gate", () => {
  it("mantiene il vocabolario ufficiale completo di tutte le 15 materie", () => {
    const catalogue = getAllPaPublicServiceSubjects();
    expect(catalogue).toHaveLength(15);
    expect(new Set(catalogue.map(concept => concept.code)).size).toBe(15);
    for (const concept of catalogue) {
      expect(concept.label).toBeTruthy();
      expect(concept.uri).toMatch(/^https:\/\//);
      expect(concept.schemeUri).toMatch(/^https:\/\//);
      expect(concept.authority).toBeTruthy();
      expect(concept.source).toBe("schema.gov.it / AgID");
    }
  });

  it("valida l'unica acquisizione, la presentazione canonica e la classificazione", () => {
    const matches = PUBLIC_PROPOSALS.filter(p => p.id === id);
    expect(matches).toHaveLength(1);
    const p = matches[0]!;
    expect(p.promoterId).toBe("silvia-di-spena-genitori-perri-pitagora");
    expect(p.promoterType).toBe("cittadino_comitato");
    expect(p.channel).toBe("petizione");
    expect(p.firstSeen).toBe("2026-09-19");
    expect(p.lastUpdated).toBe("2026-09-19");
    expect(p.status).toBe("proposta_emersa");
    expect(p.sourceUrl).toBe(source);
    const canonical = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.version).toBe("1.0");
    expect(canonical.title.length).toBeGreaterThan(15);
    expect(canonical.request.length).toBeGreaterThan(45);
    expect(canonical.measures).toHaveLength(4);
    expect(canonical.actionTypes).toContain("organizzazione");
    expect(canonical.measures.every(m => m.length > 30)).toBe(true);

    const primary = getProposalPrimaryPaSubject(p);
    expect(primary.code).toBe("1");
    expect(primary.label).toBe("Educazione e formazione");
    expect(primary.uri).toMatch(/^https:\/\//);
    expect(primary.schemeUri).toMatch(/^https:\/\//);
    expect(primary.authority).toBeTruthy();
    const secondary = getProposalSecondaryPaSubjects(p);
    expect(secondary.map(c => c.code)).toEqual(["4"]);
    expect(secondary[0]!.uri).not.toBe(primary.uri);
    expect(new Set(secondary.map(c => c.uri)).size).toBe(secondary.length);
  });

  it("distingue petizione da deposito, provvedimento anteriore da risposta e recepimento da attuazione", () => {
    const p = PUBLIC_PROPOSALS.find(row => row.id === id)!;
    expect(p.events).toHaveLength(1);
    expect(p.events[0]!.type).toBe("petizione");
    expect(p.events[0]!.date).toBe("2026-09-19");
    expect(p.events[0]!.sourceUrl).toBe(source);
    expect(p.linkedActs).toHaveLength(0);
    expect(p.verificationNote).toContain("anteriore");
    const state = getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.progressStage).toBe("emersa");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.institutionalEventCount).toBe(0);
    expect(state.implementation).toBe("none");
  });

  it("verifica separatamente destinatario e competenza sulla base della fonte scolastica originale", () => {
    const p = PUBLIC_PROPOSALS.find(row => row.id === id)!;
    expect(p.institutionalRecipient).toContain("Consiglio d'Istituto");
    expect(p.institutionalRecipient).toContain("Comune di Lamezia Terme");
    const competence = getProposalInstitutionalCompetence(p);
    expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
    expect(competence.publicAddressee).toBeTruthy();
    expect(competence.assessmentStatus).toBe("partially_verified");
    expect(competence.primaryAuthority?.id).toBe("ic-perri-pitagora-don-milani");
    expect(competence.primaryAuthority?.sourceUrl).toContain("adozione-della-settimana-corta");
    expect(competence.involvedAuthorities).toEqual([]);
    expect(competence.assessmentNote).toContain("non è inserito come ente competente");
  });

  it("normalizza geografia multi-plesso senza coordinate artificiali", () => {
    const area = getProposalGeography(id)!;
    expect(area.scope).toBe("area");
    expect(area.areas).toEqual(["intera_citta"]);
    expect(area.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });

  it("non confonde la petizione d'istituto con quella sul calendario regionale", () => {
    const local = PUBLIC_PROPOSALS.find(p => p.id === id)!;
    const regional = PUBLIC_PROPOSALS.find(p => p.id === "scuole-posticipo-apertura-petizione-2026")!;
    expect(regional).toBeDefined();
    expect(local.id).not.toBe(regional.id);
    expect(local.promoterId).not.toBe(regional.promoterId);
    expect(local.threadId).not.toBe(regional.threadId);
    expect(local.theme).not.toBe(regional.theme);
    expect(local.institutionalRecipient).not.toBe(regional.institutionalRecipient);
  });
});
