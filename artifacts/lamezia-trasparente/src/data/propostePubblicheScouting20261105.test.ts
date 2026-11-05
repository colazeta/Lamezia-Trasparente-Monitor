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

const PATTO_ID = "patto-civico-monitoraggio-progetti-de-biase-2026";
const TORRENTI_ID = "corsi-acqua-manutenzione-cristiano-villella-2026";
const rows = [
  { id: PATTO_ID, promoter: "salvatore-de-biase", first: "2026-11-04", primary: "GOVE", secondary: [], events: 1 },
  { id: TORRENTI_ID, promoter: "massimo-cristiano-carmine-villella-futuro-nazionale", first: "2026-10-10", primary: "11", secondary: ["8"], events: 3 },
] as const;

describe("Scouting 5 novembre — identici proposal ID da acquisizione a stato e geografia", () => {
  it("preserva l'intero vocabolario ufficiale AgID, compresi i concetti non usati", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(x => x.code)).size).toBe(15);
    expect(all.every(x => x.code && x.label && x.uri && x.schemeUri && x.authority)).toBe(true);
  });

  for (const row of rows) {
    it("garantisce identità, canone, tassonomia ufficiale, destinatario e stato separati: " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(matches).toHaveLength(1);
      const proposal = matches[0]!;
      expect(proposal.promoterId).toBe(row.promoter);
      expect(proposal.firstSeen).toBe(row.first);
      expect(proposal.lastUpdated).toBe("2026-11-04");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.events).toHaveLength(row.events);
      expect(new Set(proposal.events.map(e => e.id)).size).toBe(proposal.events.length);
      expect(proposal.events.filter(e => e.type === "emersione")).toHaveLength(1);
      expect(proposal.events.every(e => e.type === "emersione" || e.type === "aggiornamento")).toBe(true);
      expect(proposal.events.every(e => e.sourceUrl?.startsWith("https://"))).toBe(true);
      expect(proposal.events.every(e => e.date >= proposal.firstSeen && e.date <= proposal.lastUpdated)).toBe(true);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.title.length).toBeGreaterThan(20);
      expect(canonical.request.length).toBeGreaterThan(40);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(row.primary);
      expect(primary.uri && primary.schemeUri && primary.authority).toBeTruthy();
      expect(primary.source).toBe(row.primary === "GOVE" ? "EU Data Theme" : "schema.gov.it / AgID");
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map(s => s.code)).toEqual([...row.secondary]);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);

      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const status = getProposalInstitutionalState(proposal);
      expect(status.publicState).toBe("segnalata");
      expect(status.progressStage).toBe("emersa");
      expect(status.hasFormalization).toBe(false);
      expect(status.implementation).toBe("none");
      expect(status.hasInstitutionalFollowUp).toBe(false);
      expect(proposal.events.some(e => e.type === "recepimento" || e.type === "deposito" || e.type === "risposta_istituzionale")).toBe(false);

      const geography = getProposalGeography(row.id)!;
      expect(geography).toBeDefined();
      expect(geography.scope).toBe("citywide");
      expect(geography.areas).toEqual(["intera_citta"]);
      expect(geography.points).toHaveLength(0);
      expect(isProposalGeoreferenced(row.id)).toBe(false);
    });
  }

  it("non trasforma la dichiarazione di Giunta in attuazione né duplica la segnalazione Fialà", () => {
    const p = PUBLIC_PROPOSALS.find(p => p.id === TORRENTI_ID)!;
    const e = p.events.find(e => e.id === "cristiano-villella-torrenti-giunta-protocollo-2026-11-04")!;
    expect(e.type).toBe("aggiornamento");
    expect(e.evidenceLevel).toBe("fonte_stampa");
    expect(p.verificationNote).toContain("deliberazione");
    expect(p.verificationNote).toContain("NON una risposta formale");
    const fiala = PUBLIC_PROPOSALS.filter(p => p.id === "cottola-fiala-pulizia-detriti-residenti-agricoltori-2026");
    expect(fiala).toHaveLength(1);
    expect(fiala[0].events).toHaveLength(1);
    expect(fiala[0].lastUpdated).toBe("2026-11-03");
  });

  it("mantiene distinti i promotori del Patto e della proposta idrica PD", () => {
    const patto = PUBLIC_PROPOSALS.find(p => p.id === PATTO_ID)!;
    const acqua = PUBLIC_PROPOSALS.find(p => p.id === "piano-ricognizione-interventi-rete-idrica-pd-2026")!;
    expect(patto.promoterId).not.toBe(acqua.promoterId);
    expect(patto.events).toHaveLength(1);
    expect(acqua.events).toHaveLength(1);
  });
});
