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
    id: "ospedale-ascensori-totem-ticket-malati-cronici-2026",
    promoterId: "associazione-malati-cronici-lametino",
    primary: "2",
    secondary: ["5"],
    date: "2026-10-22",
    scope: "point",
  },
  {
    id: "municipio-ascensore-accessibilita-lamezia-maltrattata-2026",
    promoterId: "lamezia-maltrattata",
    primary: "5",
    secondary: ["2"],
    date: "2026-10-23",
    scope: "area",
  },
] as const;

describe("Scouting 2 novembre — recupero accessibilità, gate end-to-end stessi proposal ID", () => {
  it("mantiene tutti i 15 concetti ufficiali con URI, etichetta, codice e autorità", () => {
    const catalog = getAllPaPublicServiceSubjects();
    expect(catalog).toHaveLength(15);
    expect(new Set(catalog.map((c) => c.code)).size).toBe(15);
    expect(catalog.every((c) => c.code && c.label && c.uri && c.schemeUri && c.authority)).toBe(true);
  });

  for (const row of rows) {
    it("valida acquisizione, canone, materia primaria, destinatario, stato e geografia per " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter((p) => p.id === row.id);
      expect(matches).toHaveLength(1);
      const proposal = matches[0]!;
      expect(proposal.promoterId).toBe(row.promoterId);
      expect(proposal.institutionalRecipient?.trim().length).toBeGreaterThan(10);
      expect(proposal.channel).toBe("comunicato");
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toContain("cityonelamezia.it");
      expect(proposal.evidenceLevel).toBe("fonte_stampa");
      expect(proposal.firstSeen).toBe(row.date);
      expect(proposal.lastUpdated).toBe(row.date);
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.linkedActs).toEqual([]);
      expect(proposal.events).toHaveLength(1);
      expect(proposal.events[0]?.date).toBe(row.date);
      expect(proposal.events[0]?.type).toBe("emersione");
      expect(proposal.events[0]?.evidenceLevel).toBe("fonte_stampa");
      expect(proposal.events.every((e) => e.type !== "deposito" && e.type !== "recepimento")).toBe(true);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(30);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(2);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(row.primary);
      expect(primary.source).toBe("schema.gov.it / AgID");
      expect(primary.uri).toContain("/public-services-subject-matters/");
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map((s) => s.code)).toEqual([...row.secondary]);
      expect(secondary.every((s) => s.code !== primary.code)).toBe(true);

      const recipient = getProposalInstitutionalCompetence(proposal);
      expect(recipient.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(recipient.publicAddressee).toBeTruthy();
      expect(recipient.assessmentStatus).toBe("not_assessed");
      expect(recipient.primaryAuthority).toBeUndefined();
      expect(recipient.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(proposal);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const geo = getProposalGeography(row.id)!;
      expect(geo.scope).toBe(row.scope);
      expect(geo.areas).toHaveLength(1);
      expect(geo.points.length).toBe(row.scope === "point" ? 1 : 0);
      expect(isProposalGeoreferenced(row.id)).toBe(row.scope === "point");
      if (row.scope === "point") {
        expect(geo.points[0]?.sourceUrl).toContain("regione.calabria.it");
        expect(geo.points[0]?.precision).toBe("exact_landmark");
      } else {
        expect(geo.points).toEqual([]);
      }
    });
  }

  it("non deduplica promotori diversi solo perché entrambe le richieste riguardano ascensori", () => {
    const hospital = PUBLIC_PROPOSALS.find((p) => p.id === rows[0].id)!;
    const cityHall = PUBLIC_PROPOSALS.find((p) => p.id === rows[1].id)!;
    expect(hospital.promoterId).not.toBe(cityHall.promoterId);
    expect(hospital.threadId).not.toBe(cityHall.threadId);
    expect(hospital.institutionalRecipient).not.toBe(cityHall.institutionalRecipient);
    expect(hospital.sourceUrl).not.toBe(cityHall.sourceUrl);
  });
});
