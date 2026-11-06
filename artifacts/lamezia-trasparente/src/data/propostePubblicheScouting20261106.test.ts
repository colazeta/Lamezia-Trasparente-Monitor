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
    id: "contrade-acquadauzano-filicioni-viabilita-cristiano-villella-2026",
    promoter: "futuro-nazionale-lamezia",
    date: "2026-10-22",
    primary: "4",
    secondary: ["8"],
    areas: ["intera_citta"],
  },
  {
    id: "santeufemia-sicurezza-accessi-scuole-liberali-2026",
    promoter: "i-liberali-lamezia-terme",
    date: "2026-10-20",
    primary: "8",
    secondary: ["1", "4"],
    areas: ["sant_eufemia"],
  },
] as const;

describe("Scouting 6 novembre — stessi proposal ID per tutti i gate", () => {
  it("preserva ogni materia AgID nel backend, inclusi i concetti non utilizzati", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(subject => subject.code)).size).toBe(15);
    for (const subject of subjects) {
      expect(subject.code).toBeTruthy();
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
      expect(subject.source).toBe("schema.gov.it / AgID");
    }
  });

  for (const row of rows) {
    it("valida acquisizione, canone, materie, destinatario, competenza, stato e geografia: " + row.id, () => {
      const hits = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(hits).toHaveLength(1);
      const proposal = hits[0]!;
      expect(proposal.promoterId).toBe(row.promoter);
      expect(proposal.promoterType).toBe("forza_politica");
      expect(proposal.firstSeen).toBe(row.date);
      expect(proposal.lastUpdated).toBe(row.date);
      expect(proposal.year).toBe("2026");
      expect(proposal.channel).toBe("comunicato");
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.events).toHaveLength(1);
      expect(new Set(proposal.events.map(event => event.id)).size).toBe(1);
      expect(proposal.events[0]!.date).toBe(row.date);
      expect(proposal.events[0]!.type).toBe("emersione");
      expect(proposal.events[0]!.sourceUrl).toBe(proposal.sourceUrl);
      expect(proposal.events.every(event => ![
        "petizione", "deposito", "calendarizzazione", "discussione",
        "risposta_istituzionale", "recepimento",
      ].includes(event.type))).toBe(true);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.title.length).toBeGreaterThan(20);
      expect(canonical.request.length).toBeGreaterThan(45);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(4);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(row.primary);
      expect(primary.schemeUri).toMatch(/^https:\/\//);
      expect(primary.uri).toMatch(/^https:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map(x => x.code)).toEqual([...row.secondary]);
      expect(secondary.every(x => x.uri !== primary.uri)).toBe(true);
      expect(new Set(secondary.map(x => x.uri)).size).toBe(secondary.length);

      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(proposal);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const geography = getProposalGeography(row.id)!;
      expect(geography).toBeDefined();
      expect(geography.scope).toBe("area");
      expect(geography.areas).toEqual([...row.areas]);
      expect(geography.points).toHaveLength(0);
      expect(isProposalGeoreferenced(row.id)).toBe(false);
    });
  }

  it("non duplica le proposte di stessi promotori riferite ad oggetti diversi", () => {
    const hamlets = PUBLIC_PROPOSALS.find(p => p.id === rows[0].id)!;
    const cafaldo = PUBLIC_PROPOSALS.find(p => p.id === "cafaldo-rifacimento-strade-cristiano-villella-2026")!;
    expect(hamlets.promoterId).toBe(cafaldo.promoterId);
    expect(hamlets.id).not.toBe(cafaldo.id);
    expect(hamlets.threadId).not.toBe(cafaldo.threadId);
    expect(hamlets.territorialArea).not.toBe(cafaldo.territorialArea);

    const schools = PUBLIC_PROPOSALS.find(p => p.id === rows[1].id)!;
    const square = PUBLIC_PROPOSALS.find(p => p.id === "piazza-italia-sicurezza-prevenzione-2026")!;
    expect(schools.promoterId).toBe(square.promoterId);
    expect(schools.id).not.toBe(square.id);
    expect(schools.threadId).not.toBe(square.threadId);
    expect(schools.territorialArea).not.toBe(square.territorialArea);
  });
});
