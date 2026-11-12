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

const cases = [
  { id: "nuovo-cimitero-monumentale-studio-de-biase-2026", promoter: "salvatore-de-biase", first: "2026-11-11", last: "2026-11-11", primary: "5", secondary: ["2"], events: 1 },
  { id: "microforesta-urbana-lamezia-respira-vescio-scaramuzzino-2026", promoter: "lidia-vescio", first: "2026-09-29", last: "2026-10-03", primary: "11", secondary: ["5"], events: 2 },
  { id: "reu-verifica-adeguamento-v-commissione-vescio-2026", promoter: "quinta-commissione-consiliare-lamezia-terme", first: "2026-09-28", last: "2026-09-28", primary: "5", secondary: [], events: 1 },
] as const;

describe("Scouting 12 novembre: gate end-to-end sugli stessi tre proposal ID", () => {
  it("conserva nel backend tutte le 15 materie ufficiali, anche non utilizzate", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(s => s.code)).size).toBe(15);
    for (const subject of subjects) {
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
      expect(subject.source).toBe("schema.gov.it / AgID");
    }
  });

  for (const row of cases) {
    it("conserva acquisizione, canonica, materia primaria, secondarie, destinatario, competenza, stato e geo per " + row.id, () => {
      const hits = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(hits).toHaveLength(1);
      const p = hits[0]!;
      expect(p.promoterId).toBe(row.promoter);
      expect(p.firstSeen).toBe(row.first);
      expect(p.lastUpdated).toBe(row.last);
      expect(p.status).toBe("proposta_emersa");
      expect(p.institutionalRecipient?.trim()).toBeTruthy();
      expect(p.verificationNote).toContain("not_assessed");
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.events).toHaveLength(row.events);
      expect(p.events[0]!.type).toBe("emersione");
      expect(p.events[0]!.date).toBe(row.first);
      expect(p.events.every(e => e.type !== "deposito" && e.type !== "petizione" && e.type !== "recepimento")).toBe(true);
      expect(new Set(p.events.map(e => e.id)).size).toBe(row.events);
      expect(p.linkedActs).toHaveLength(0);

      const canonical = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.version).toBe("1.0");
      expect(canonical.title.length).toBeGreaterThan(20);
      expect(canonical.request.length).toBeGreaterThan(35);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(5);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);
      expect(canonical.measures.every(m => m.length > 20)).toBe(true);

      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(row.primary);
      expect(primary.uri).toMatch(/^https?:\/\//);
      expect(primary.schemeUri).toMatch(/^https?:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map(s => s.code)).toEqual([...row.secondary]);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);
      expect(new Set(secondary.map(s => s.uri)).size).toBe(secondary.length);

      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const institutionalState = getProposalInstitutionalState(p);
      expect(institutionalState.publicState).toBe("segnalata");
      expect(institutionalState.hasFormalization).toBe(false);
      expect(institutionalState.hasInstitutionalFollowUp).toBe(false);
      expect(institutionalState.implementation).toBe("none");

      const geography = getProposalGeography(p.id)!;
      expect(geography.scope).toBe("citywide");
      expect(geography.areas).toEqual(["intera_citta"]);
      expect(geography.points).toHaveLength(0);
      expect(isProposalGeoreferenced(p.id)).toBe(false);
    });
  }

  it("non fonde richieste di uno stesso promotore su oggetti differenti", () => {
    const newCem = PUBLIC_PROPOSALS.find(p => p.id === cases[0].id)!;
    const patto = PUBLIC_PROPOSALS.find(p => p.id === "patto-civico-monitoraggio-progetti-de-biase-2026")!;
    expect(newCem.promoterId).toBe(patto.promoterId);
    expect(newCem.id).not.toBe(patto.id);
    expect(newCem.theme).not.toBe(patto.theme);
    const greens = PUBLIC_PROPOSALS.filter(p => p.promoterId === "lidia-vescio" && p.theme === "Rigenerazione del verde urbano e microforeste");
    expect(greens).toHaveLength(1);
  });
});
