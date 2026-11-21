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

const id = "aree-sgambamento-cani-gianturco-2023";

describe("Scouting 21 novembre: aree cani Gianturco, 2023–2026", () => {
  const proposal = PUBLIC_PROPOSALS.find((item) => item.id === id)!;

  it("mantiene un'identità e una timeline verificabile senza duplicati", () => {
    expect(PUBLIC_PROPOSALS.filter((p) => p.id === id)).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map((p) => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
    expect(proposal.promoterId).toBe("mimmo-gianturco");
    expect(proposal.events.map((event) => event.date)).toEqual([
      "2023-02-17",
      "2026-11-18",
      "2026-11-19",
    ]);
    expect(proposal.events.map((event) => event.type)).toEqual([
      "emersione",
      "aggiornamento",
      "aggiornamento",
    ]);
    expect(proposal.events[0].sourceUrl).toContain("gianturco-comune-realizzi");
    expect(proposal.status).toBe("proposta_emersa");
  });

  it("mantiene presentazione canonica neutrale e misure atomiche", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(id);
    expect(canonical.title).toContain("sgambamento");
    expect(canonical.request).toBeTruthy();
    expect(canonical.measures).toHaveLength(4);
    expect(canonical.measures.every((measure) => measure.length > 18)).toBe(true);
    expect(canonical.expectedOutcome).not.toMatch(/attuato|realizzato/i);
  });

  it("conserva il vocabolario AgID completo, con primaria ufficiale e secondarie audit", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map((subject) => subject.code)).size).toBe(15);
    for (const subject of subjects) {
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
    }
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("11");
    expect(getProposalSecondaryPaSubjects(proposal).map((x) => x.code)).toEqual(["10"]);
  });

  it("non equipara destinatario a competenza né notizie di atti a deposito o attuazione", () => {
    expect(proposal.institutionalRecipient).toContain("Sindaco");
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    const institutional = getProposalInstitutionalState(proposal);
    expect(institutional.hasFormalization).toBe(false);
    expect(institutional.implementation).toBe("none");
    expect(institutional.publicState).toBe("segnalata");
    expect(proposal.events.every((e) => !["deposito", "recepimento", "petizione"].includes(e.type))).toBe(true);
  });

  it("gestisce geografia citywide e sito storico come riferimento, senza WGS84 fittizie", () => {
    const geo = getProposalGeography(id)!;
    expect(geo.scope).toBe("citywide");
    expect(geo.areas).toContain("intera_citta");
    expect(geo.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
    expect(geo.label).toContain("Argada");
  });
});
