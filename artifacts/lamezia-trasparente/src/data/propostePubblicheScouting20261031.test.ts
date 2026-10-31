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
  { id: "commissariato-lamezia-rinforzi-sap-2026", primary: "8", secondary: [], scope: "citywide" },
  { id: "polizia-frontiera-lamezia-tavolo-indennita-sap-2026", primary: "3", secondary: ["8"], scope: "area" },
] as const;

describe("Scouting SAP del 31 ottobre — gate sullo stesso insieme di proposal ID", () => {
  it("conserva il vocabolario ufficiale completo anche per le materie inutilizzate", () => {
    const terms = getAllPaPublicServiceSubjects();
    expect(terms).toHaveLength(15);
    expect(new Set(terms.map((term) => term.code)).size).toBe(15);
    expect(terms.every((term) => term.label && term.uri && term.schemeUri && term.authority)).toBe(true);
  });

  for (const row of rows) {
    it("verifica acquisizione, presentazione, materia, destinatario, percorso, timeline e geografia: " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter((p) => p.id === row.id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(p.promoterId).toBe("sap-catanzaro");
      expect(p.promoterType).toBe("categoria");
      expect(p.institutionalRecipient).toBe("Prefetto di Catanzaro");
      expect(p.channel).toBe("comunicato");
      expect(p.firstSeen).toBe("2026-10-28");
      expect(p.lastUpdated).toBe("2026-10-28");
      expect(p.status).toBe("proposta_emersa");
      expect(p.sourceUrl).toContain("lanuovacalabria.it");
      expect(p.linkedActs).toEqual([]);
      expect(p.verificationNote).toContain("not_assessed");
      expect(p.events).toHaveLength(1);
      expect(p.events[0]?.type).toBe("emersione");
      expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
      expect(new Set(p.events.map((event) => event.id)).size).toBe(p.events.length);

      const canonical = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(p.id);
      expect(canonical.proposalId).toBe(p.id);
      expect(canonical.version).toBe("1.0");
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(30);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(2);
      expect(canonical.measures.every((m) => m.length > 20)).toBe(true);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(row.primary);
      expect(primary.source).toBe("schema.gov.it / AgID");
      expect(primary.uri.startsWith("https://")).toBe(true);
      expect(primary.schemeUri.startsWith("https://")).toBe(true);
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map((s) => s.code)).toEqual([...row.secondary]);
      expect(secondary.every((s) => s.code !== primary.code)).toBe(true);

      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBe("Prefetto di Catanzaro");
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const geography = getProposalGeography(p.id)!;
      expect(geography.scope).toBe(row.scope);
      expect(geography.points).toEqual([]);
      expect(isProposalGeoreferenced(p.id)).toBe(false);
      if (row.scope === "citywide") expect(geography.areas).toEqual(["intera_citta"]);
      else expect(geography.areas).toEqual(["sant_eufemia"]);
    });
  }

  it("separa il SAP dal COISP e le due misure SAP senza creare duplicati", () => {
    const coisp = PUBLIC_PROPOSALS.find((p) => p.id === "commissariato-lamezia-organico-cento-unita-coisp-2026")!;
    const sap = PUBLIC_PROPOSALS.find((p) => p.id === rows[0].id)!;
    const polaria = PUBLIC_PROPOSALS.find((p) => p.id === rows[1].id)!;
    expect(sap.promoterId).not.toBe(coisp.promoterId);
    expect(sap.threadId).toBe(coisp.threadId);
    expect(sap.threadId).not.toBe(polaria.threadId);
    expect(sap.promoterId).toBe(polaria.promoterId);
    expect(polaria.events.some((e) => e.type === "deposito" || e.type === "recepimento")).toBe(false);
  });
});
