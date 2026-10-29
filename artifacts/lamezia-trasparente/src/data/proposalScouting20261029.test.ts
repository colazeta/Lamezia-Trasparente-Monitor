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

const candidates = [
  {
    id: "cafaldo-rifacimento-strade-cristiano-villella-2026",
    promoter: "futuro-nazionale-lamezia",
    firstSeen: "2026-10-28",
    primary: "4",
    secondary: ["8"],
    scope: "area",
    events: ["emersione"],
  },
  {
    id: "polo-oncologico-regionale-lamezia-natrella-2026",
    promoter: "pasquale-maria-natrella-forza-italia",
    firstSeen: "2026-10-13",
    primary: "2",
    secondary: [],
    scope: "point",
    events: ["emersione", "aggiornamento"],
  },
] as const;

describe("Scouting 29 ottobre — gate comuni ai due proposal ID", () => {
  it("mantiene i 15 concetti ufficiali completi e il backend semantico", () => {
    const official = getAllPaPublicServiceSubjects();
    expect(official).toHaveLength(15);
    expect(new Set(official.map((c) => c.code)).size).toBe(15);
    expect(official.every((c) => c.label && c.uri && c.schemeUri && c.authority)).toBe(true);
  });

  for (const candidate of candidates) {
    it(`valida acquisizione, canonical, semantica, competenza, timeline e geografia: ${candidate.id}`, () => {
      const records = PUBLIC_PROPOSALS.filter((p) => p.id === candidate.id);
      expect(records).toHaveLength(1);
      const proposal = records[0]!;
      expect(proposal.promoterId).toBe(candidate.promoter);
      expect(proposal.promoter).toBeTruthy();
      expect(proposal.promoterType).toBe("forza_politica");
      expect(proposal.channel).toBe("comunicato");
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.firstSeen).toBe(candidate.firstSeen);
      expect(proposal.lastUpdated).toBe("2026-10-28");
      expect(proposal.sourceLabel).toBeTruthy();
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.institutionalRecipient?.length).toBeGreaterThan(8);
      expect(proposal.linkedActs).toEqual([]);
      expect(proposal.events.map((e) => e.type)).toEqual(candidate.events);
      expect(proposal.events[0]?.type).toBe("emersione");
      expect(proposal.events[0]?.date).toBe(candidate.firstSeen);
      expect(proposal.events[0]?.sourceUrl).toBe(proposal.sourceUrl);
      expect(new Set(proposal.events.map((e) => e.id)).size).toBe(proposal.events.length);
      expect(proposal.events.every((e) => e.sourceUrl?.startsWith("https://"))).toBe(true);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(candidate.id);
      expect(canonical.proposalId).toBe(candidate.id);
      expect(canonical.title.length).toBeGreaterThan(18);
      expect(canonical.request.length).toBeGreaterThan(35);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(4);
      expect(canonical.measures.every((m) => m.length > 25)).toBe(true);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(candidate.primary);
      expect(primary.source).toBe("schema.gov.it / AgID");
      expect(primary.uri).toMatch(/^https:\/\//);
      expect(primary.schemeUri).toMatch(/^https:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map((s) => s.code)).toEqual(candidate.secondary);
      expect(secondary.every((s) => s.code !== primary.code)).toBe(true);

      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).not.toBe("Non indicato");
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const institutional = getProposalInstitutionalState(proposal);
      expect(institutional.publicState).toBe("segnalata");
      expect(institutional.progressStage).toBe("emersa");
      expect(institutional.hasFormalization).toBe(false);
      expect(institutional.hasInstitutionalFollowUp).toBe(false);
      expect(institutional.institutionalEventCount).toBe(0);
      expect(institutional.implementation).toBe("none");

      const geography = getProposalGeography(candidate.id)!;
      expect(geography.scope).toBe(candidate.scope);
      expect(geography.areas).toEqual(["sambiase"]);
      if (candidate.scope === "point") {
        expect(geography.points).toHaveLength(1);
        expect(geography.points[0]?.sourceUrl).toMatch(/^https:\/\//);
        expect(geography.points[0]?.precision).toBe("exact_landmark");
        expect(isProposalGeoreferenced(candidate.id)).toBe(true);
      } else {
        expect(geography.points).toEqual([]);
        expect(isProposalGeoreferenced(candidate.id)).toBe(false);
      }
    });
  }

  it("non sdoppia il rilancio oncologico del 28 ottobre", () => {
    const proposal = PUBLIC_PROPOSALS.find((p) => p.id === "polo-oncologico-regionale-lamezia-natrella-2026")!;
    expect(proposal.events).toHaveLength(2);
    expect(proposal.events[1]?.date).toBe("2026-10-28");
    expect(proposal.events[1]?.type).toBe("aggiornamento");
    expect(proposal.events[1]?.sourceUrl).toContain("lametino.it");
  });

  it("non confonde Cafaldo con via della Vittoria, pur normalizzando lo stesso promotore", () => {
    const cafaldo = PUBLIC_PROPOSALS.find((p) => p.id === "cafaldo-rifacimento-strade-cristiano-villella-2026")!;
    const vittoria = PUBLIC_PROPOSALS.find((p) => p.id === "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026")!;
    expect(cafaldo.promoterId).toBe(vittoria.promoterId);
    expect(cafaldo.threadId).not.toBe(vittoria.threadId);
    expect(cafaldo.territorialArea).toContain("Cafaldo");
    expect(vittoria.territorialArea).toContain("Vittoria");
  });
});
