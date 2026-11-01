import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
import { applyScoutingUpdates20261027ProjectVita } from "./proposalScoutingUpdates20261027ProjectVita";

const ID = "politiche-sociali-progetto-vita-2026";
const EVENT_ID = "progetto-vita-intesa-ats-asp-riferita-26-ottobre";

describe("Scouting 27 October: Progetto di Vita existing ID — shared integrity gates", () => {
  const proposals = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === ID);
  const proposal = proposals[0]!;

  it("preserves the single existing civic proposal and appends exactly one sourced context event", () => {
    expect(proposals).toHaveLength(1);
    expect(proposal.promoterId).toBe("una-citta-dove-vivere-bene");
    expect(proposal.firstSeen).toBe("2026-06-04");
    expect(proposal.lastUpdated).toBe("2026-10-30");
    expect(proposal.institutionalRecipient).toContain("Comune di Lamezia Terme");
    expect(proposal.linkedActs).toContain("Mozione consiliare prot. n. 47464/2026");
    expect(proposal.events.some((event) => event.id === "progetto-vita-informativa-amministrazione-14-agosto")).toBe(true);
    expect(proposal.events.filter((event) => event.id === EVENT_ID)).toHaveLength(1);
    const event = proposal.events.find((item) => item.id === EVENT_ID)!;
    expect(event.date).toBe("2026-10-26");
    expect(event.type).toBe("aggiornamento");
    expect(event.evidenceLevel).toBe("fonte_stampa");
    expect(event.sourceUrl).toMatch(/^https:\/\/www\.lametino\.it\//);
    expect(proposal.verificationNote).toContain("Non è stata acquisita copia dell'accordo firmato");
    expect(new Set(proposal.events.map((e) => e.id)).size).toBe(proposal.events.length);
    expect(applyScoutingUpdates20261027ProjectVita(proposal)).toBe(proposal);
  });

  it("retains the existing canonical LT presentation and official-first taxonomy", () => {
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(ID);
    expect(canonical.title).toBeTruthy();
    expect(canonical.request).toBeTruthy();
    expect(canonical.measures.length).toBeGreaterThan(0);
    expect(canonical.actionTypes.length).toBeGreaterThan(0);
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((entry) => entry.code)).size).toBe(15);
    for (const concept of vocabulary) {
      expect(concept.label).toBeTruthy();
      expect(concept.uri).toMatch(/^https:\/\//);
      expect(concept.schemeUri).toMatch(/^https:\/\//);
      expect(concept.authority).toBeTruthy();
    }
    const primary = getProposalPrimaryPaSubject(proposal);
    expect(vocabulary.map((entry) => entry.code)).toContain(primary.code);
    expect(getProposalSecondaryPaSubjects(proposal).every((secondary) => secondary.code !== primary.code)).toBe(true);
  });

  it("does not infer competence, institutional reception or implementation from the newspaper update", () => {
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.publicAddressee).toBeTruthy();
    expect(["not_assessed", "partially_verified", "verified"]).toContain(competence.assessmentStatus);
    expect(proposal.status).toBe("presentata_formalmente");
    const institutional = getProposalInstitutionalState(proposal);
    expect(institutional.publicState).toBe("con_seguito");
    expect(institutional.implementation).toBe("none");
    expect(institutional.hasFormalization).toBe(true);
    expect(proposal.events.filter((e) => e.id === EVENT_ID && e.type === "recepimento")).toHaveLength(0);
  });

  it("keeps the citywide geographical scope unlocated", () => {
    const geo = getProposalGeography(ID)!;
    expect(geo.scope).toBe("citywide");
    expect(geo.points).toEqual([]);
    expect(isProposalGeoreferenced(ID)).toBe(false);
  });
});
