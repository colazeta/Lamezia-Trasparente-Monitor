import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "natale-2026-eventi-sambiase-isa-muraca";
const earlierId = "luminarie-frazioni-contrade-raso-2026";

describe("Scouting 21 novembre: proposta di Isa Muraca per il Natale a Sambiase", () => {
  const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id)!;

  it("mantiene la proposta unica e distinta dalle luminarie di Marialucia Raso", () => {
    expect(PUBLIC_PROPOSALS.filter((p) => p.id === id)).toHaveLength(1);
    expect(PUBLIC_PROPOSALS.filter((p) => p.id === earlierId)).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map((p) => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    expect(proposal.promoterId).toBe("carmelina-isa-muraca");
    expect(proposal.events.map((event) => event.date)).toEqual(["2026-11-20"]);
    expect(proposal.events[0].sourceUrl).toContain("natale-lamezia-isa-muraca");
    expect(proposal.status).toBe("proposta_emersa");
  });

  it("garantisce la canonica neutrale, separata dalla fonte originaria", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    const presentation = getCanonicalProposalPresentation(proposal);
    expect(presentation.proposalId).toBe(id);
    expect(presentation.request).toContain("Piazza 5 Dicembre");
    expect(presentation.measures).toHaveLength(4);
    expect(presentation.measures.every((measure) => measure.length > 18)).toBe(true);
    expect(presentation.expectedOutcome).not.toMatch(/approvato|attuato/i);
  });

  it("preserva 15 materie ufficiali e una sola materia primaria", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map((s) => s.code)).size).toBe(15);
    for (const subject of subjects) {
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
    }
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("10");
    expect(getProposalSecondaryPaSubjects(proposal)).toEqual([]);
  });

  it("mantiene destinatario e competenza distinti e non inventa depositi o attuazione", () => {
    expect(proposal.institutionalRecipient).toBe("Amministrazione comunale di Lamezia Terme");
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    const institutional = getProposalInstitutionalState(proposal);
    expect(institutional.hasFormalization).toBe(false);
    expect(institutional.implementation).toBe("none");
    expect(institutional.publicState).toBe("segnalata");
    expect(proposal.events.every((event) => event.type === "emersione")).toBe(true);
  });

  it("conserva la geografia citywide senza coordinate arbitrarie", () => {
    const geo = getProposalGeography(id)!;
    expect(geo.scope).toBe("citywide");
    expect(geo.areas).toContain("intera_citta");
    expect(geo.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
