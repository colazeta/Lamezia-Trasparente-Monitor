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

const rows = [
  {
    id: "turismo-imposta-soggiorno-trasparenza-acu-calabria-2026",
    promoter: "acu-calabria",
    first: "2026-11-02",
    primary: "9",
    secondary: ["7"],
    scope: "citywide",
    channel: "comunicato",
  },
  {
    id: "tutela-cane-kira-progetto-gestione-controllata-solla-2026",
    promoter: "clara-solla",
    first: "2026-09-08",
    primary: "2",
    secondary: [],
    scope: "area",
    channel: "petizione",
  },
  {
    id: "scuola-perri-pitagora-orario-sei-giorni-di-spena-2026",
    promoter: "silvia-di-spena",
    first: "2026-09-19",
    primary: "1",
    secondary: [],
    scope: "area",
    channel: "petizione",
  },
] as const;

describe("Recupero civico 5 novembre — stesso insieme di proposal ID end to end", () => {
  it("conserva tutti i 15 concetti nazionali nel backend, usati o non usati", () => {
    const concepts = getAllPaPublicServiceSubjects();
    expect(concepts).toHaveLength(15);
    expect(new Set(concepts.map(c => c.code)).size).toBe(15);
    for (const concept of concepts) {
      expect(concept.code).toBeTruthy();
      expect(concept.label).toBeTruthy();
      expect(concept.uri).toMatch(/^https:\/\//);
      expect(concept.schemeUri).toMatch(/^https:\/\//);
      expect(concept.authority).toBeTruthy();
    }
  });

  for (const row of rows) {
    it("verifica canone, classificazioni, destinatari, stato, petizione e geografia: " + row.id, () => {
      const duplicates = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(duplicates).toHaveLength(1);
      const proposal = duplicates[0]!;
      expect(proposal.promoterId).toBe(row.promoter);
      expect(proposal.firstSeen).toBe(row.first);
      expect(proposal.lastUpdated).toBe(row.first);
      expect(proposal.channel).toBe(row.channel);
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.events).toHaveLength(1);
      expect(proposal.events[0]!.date).toBe(row.first);
      expect(proposal.events[0]!.sourceUrl).toBe(proposal.sourceUrl);
      expect(proposal.events[0]!.type).toBe(row.channel === "petizione" ? "petizione" : "emersione");

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.request.length).toBeGreaterThan(40);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
      expect(canonical.actionTypes.length).toBeGreaterThanOrEqual(1);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(row.primary);
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.uri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      expect(primary.source).toBe("schema.gov.it / AgID");
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map(x => x.code)).toEqual([...row.secondary]);
      expect(secondary.every(x => x.uri !== primary.uri)).toBe(true);

      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const institutional = getProposalInstitutionalState(proposal);
      expect(institutional.publicState).toBe("segnalata");
      expect(institutional.progressStage).toBe("emersa");
      expect(institutional.hasFormalization).toBe(false);
      expect(institutional.hasInstitutionalFollowUp).toBe(false);
      expect(institutional.implementation).toBe("none");
      expect(proposal.events.every(e => !["deposito", "risposta_istituzionale", "recepimento"].includes(e.type))).toBe(true);

      const geo = getProposalGeography(row.id)!;
      expect(geo).toBeDefined();
      expect(geo.scope).toBe(row.scope);
      expect(geo.points).toHaveLength(0);
      expect(isProposalGeoreferenced(row.id)).toBe(false);
      if (row.scope === "citywide") expect(geo.areas).toEqual(["intera_citta"]);
    });
  }

  it("separa i promotori delle proposte sullo stesso filone invece di duplicarli", () => {
    const acu = PUBLIC_PROPOSALS.find(p => p.id === rows[0].id)!;
    const federalberghi = PUBLIC_PROPOSALS.find(p => p.id === "turismo-imposta-soggiorno-tavolo-federalberghi-2026")!;
    expect(acu.promoterId).not.toBe(federalberghi.promoterId);
    expect(acu.threadId).toBe(federalberghi.threadId);

    const kira = PUBLIC_PROPOSALS.find(p => p.id === rows[1].id)!;
    const vescio = PUBLIC_PROPOSALS.find(p => p.id === "tutela-animali-regolamento-garante-sportello-2026")!;
    expect(kira.promoterId).not.toBe(vescio.promoterId);
    expect(kira.threadId).toBe(vescio.threadId);

    const school = PUBLIC_PROPOSALS.find(p => p.id === rows[2].id)!;
    const nucifero = PUBLIC_PROPOSALS.find(p => p.id === "scuole-orario-ridotto-caldo-settembre-2026")!;
    expect(school.promoterId).not.toBe(nucifero.promoterId);
    expect(school.theme).not.toBe(nucifero.theme);
  });
});
