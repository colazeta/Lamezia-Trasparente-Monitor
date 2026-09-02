import { describe, expect, it } from "vitest";

import {
  PROPOSAL_COMPETENCE_ASSESSMENTS,
  PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES,
  getProposalInstitutionalCompetence,
  hasVerifiedProposalCompetence,
} from "./proposalInstitutionalCompetence";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

function proposalById(id: string) {
  const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id);
  expect(proposal, id).toBeDefined();
  return proposal!;
}

describe("proposal institutional competence", () => {
  it("provides a canonical public addressee for every published proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.proposalId).toBe(proposal.id);
      expect(competence.publicAddressee.length).toBeGreaterThan(0);
      expect(PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES).toContain(
        competence.assessmentStatus,
      );
    }
  });

  it("keeps the exact source addressee available for audit", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(
        proposal.institutionalRecipient ?? null,
      );
    }
  });

  it("keeps competence selective instead of forcing an assessment for every proposal", () => {
    expect(Object.keys(PROPOSAL_COMPETENCE_ASSESSMENTS).length).toBeGreaterThan(0);
    expect(Object.keys(PROPOSAL_COMPETENCE_ASSESSMENTS).length).toBeLessThan(
      PUBLIC_PROPOSALS.length,
    );

    const unassessed = getProposalInstitutionalCompetence(
      proposalById("fontana-piazza-mercato-vecchio-manutenzione-2026"),
    );
    expect(unassessed.assessmentStatus).toBe("not_assessed");
    expect(unassessed.primaryAuthority).toBeUndefined();
    expect(unassessed.involvedAuthorities).toHaveLength(0);
    expect(
      hasVerifiedProposalCompetence(
        proposalById("fontana-piazza-mercato-vecchio-manutenzione-2026"),
      ),
    ).toBe(false);
  });

  it("requires sourced authorities for every curated assessment", () => {
    for (const proposalId of Object.keys(PROPOSAL_COMPETENCE_ASSESSMENTS)) {
      const competence = getProposalInstitutionalCompetence(proposalById(proposalId));
      expect(["partially_verified", "verified"]).toContain(
        competence.assessmentStatus,
      );
      expect(hasVerifiedProposalCompetence(proposalById(proposalId))).toBe(true);

      const authorities = [
        ...(competence.primaryAuthority ? [competence.primaryAuthority] : []),
        ...competence.involvedAuthorities,
      ];
      expect(authorities.length, proposalId).toBeGreaterThan(0);
      for (const authority of authorities) {
        expect(authority.label.length, proposalId).toBeGreaterThan(2);
        expect(authority.sourceLabel.length, proposalId).toBeGreaterThan(5);
        expect(authority.sourceUrl, proposalId).toMatch(/^https?:\/\//);
      }
    }
  });

  it("does not treat the political addressee as the hospital staffing authority", () => {
    const proposal = proposalById(
      "ospedale-organici-continuita-chirurgica-pd-2026",
    );
    const competence = getProposalInstitutionalCompetence(proposal);

    expect(competence.sourceAddressee).toContain("Comune di Lamezia Terme");
    expect(competence.primaryAuthority?.id).toBe("asp-catanzaro");
    expect(competence.primaryAuthority?.label).toContain(
      "Azienda Sanitaria Provinciale",
    );
    expect(competence.assessmentStatus).toBe("partially_verified");
  });

  it("assigns the regional school calendar to the Region without conflating school adaptations", () => {
    const postponement = getProposalInstitutionalCompetence(
      proposalById("scuole-posticipo-apertura-petizione-2026"),
    );
    expect(postponement.assessmentStatus).toBe("verified");
    expect(postponement.primaryAuthority?.id).toBe("regione-calabria");

    const reducedHours = getProposalInstitutionalCompetence(
      proposalById("scuole-orario-ridotto-caldo-settembre-2026"),
    );
    expect(reducedHours.assessmentStatus).toBe("partially_verified");
    expect(reducedHours.primaryAuthority?.id).toBe(
      "istituzioni-scolastiche-autonome",
    );
    expect(reducedHours.involvedAuthorities.map((item) => item.id)).toContain(
      "comune-lamezia-terme",
    );
  });

  it("keeps multi-authority proposals explicitly multi-authority", () => {
    const airport = getProposalInstitutionalCompetence(
      proposalById("aeroporto-intermodalita-rilancio-taverna-2026"),
    );
    expect(airport.assessmentStatus).toBe("partially_verified");
    expect(airport.primaryAuthority?.id).toBe("regione-calabria");
    expect(airport.involvedAuthorities.map((item) => item.id)).toContain("sacal");

    const security = getProposalInstitutionalCompetence(
      proposalById("piazza-italia-sicurezza-prevenzione-2026"),
    );
    expect(security.assessmentStatus).toBe("partially_verified");
    expect(security.primaryAuthority).toBeUndefined();
    expect(security.involvedAuthorities.map((item) => item.id)).toEqual(
      expect.arrayContaining(["comune-lamezia-terme", "prefettura-catanzaro"]),
    );
  });

  it("verifies clear local-service competence while preserving intermunicipal welfare complexity", () => {
    const nurseries = getProposalInstitutionalCompetence(
      proposalById("asili-nido-continuita-servizio-2026"),
    );
    expect(nurseries.assessmentStatus).toBe("verified");
    expect(nurseries.primaryAuthority?.id).toBe("comune-lamezia-terme");

    const projectOfLife = getProposalInstitutionalCompetence(
      proposalById("politiche-sociali-progetto-vita-2026"),
    );
    expect(projectOfLife.assessmentStatus).toBe("partially_verified");
    expect(projectOfLife.primaryAuthority?.id).toBe("ats-lamezia-terme");
    expect(projectOfLife.involvedAuthorities.map((item) => item.id)).toEqual(
      expect.arrayContaining(["asp-catanzaro", "conferenza-sindaci-ats-lamezia"]),
    );
  });

  it("simplifies internal role detail without changing the source record", () => {
    const asili = proposalById("asili-nido-continuita-servizio-2026");
    const competence = getProposalInstitutionalCompetence(asili);
    expect(competence.sourceAddressee).toContain("Sindaco");
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
  });
});
