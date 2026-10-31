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
  { id: "riequilibrio-piano-revoca-mascaro-2026", primary: "9", secondary: [], firstSeen: "2026-07-20", events: 2 },
  { id: "palestre-allenamento-raffaele-arpaia-lamezia-2026", primary: "10", secondary: ["5"], firstSeen: "2026-10-30", events: 1 },
  { id: "educazione-legalita-mozione-fdi-lamezia-2026", primary: "1", secondary: ["8"], firstSeen: "2026-10-30", events: 1 },
] as const;

describe("Scouting 31 ottobre B — gate end-to-end del medesimo insieme di proposal ID", () => {
  it("preserva l'intero vocabolario ufficiale delle 15 materie, comprese le non usate", () => {
    const terms = getAllPaPublicServiceSubjects();
    expect(terms).toHaveLength(15);
    expect(new Set(terms.map((x) => x.code)).size).toBe(15);
    expect(terms.every((x) => x.label && x.uri && x.schemeUri && x.authority)).toBe(true);
  });

  for (const row of rows) {
    it("verifica canone, mapping, destinatario, stato e geografia per " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter((p) => p.id === row.id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(p.institutionalRecipient?.trim().length).toBeGreaterThan(10);
      expect(p.status).toBe("proposta_emersa");
      expect(p.evidenceLevel).toBe("fonte_stampa");
      expect(p.sourceUrl).toContain("lametino.it");
      expect(p.firstSeen).toBe(row.firstSeen);
      expect(p.lastUpdated).toBe("2026-10-30");
      expect(p.verificationNote).toContain("not_assessed");
      expect(p.linkedActs).toEqual([]);
      expect(p.events).toHaveLength(row.events);
      expect(new Set(p.events.map((event) => event.id)).size).toBe(p.events.length);
      expect(p.events.every((event) => event.sourceUrl && event.evidenceLevel)).toBe(true);
      expect(p.events.every((event) => event.type !== "deposito" && event.type !== "recepimento")).toBe(true);

      const canonical = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(p.id);
      expect(canonical.proposalId).toBe(p.id);
      expect(canonical.version).toBe("1.0");
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(25);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(2);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(row.primary);
      expect(primary.source).toBe("schema.gov.it / AgID");
      expect(primary.uri.startsWith("https://")).toBe(true);
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map((x) => x.code)).toEqual([...row.secondary]);
      expect(secondary.every((x) => x.code !== primary.code)).toBe(true);

      const recipient = getProposalInstitutionalCompetence(p);
      expect(recipient.sourceAddressee).toBe(p.institutionalRecipient);
      expect(recipient.publicAddressee).toBeTruthy();
      expect(recipient.assessmentStatus).toBe("not_assessed");
      expect(recipient.primaryAuthority).toBeUndefined();
      expect(recipient.involvedAuthorities).toEqual([]);
      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const g = getProposalGeography(p.id)!;
      expect(g.scope).toBe("citywide");
      expect(g.areas).toEqual(["intera_citta"]);
      expect(g.points).toEqual([]);
      expect(isProposalGeoreferenced(p.id)).toBe(false);
    });
  }

  it("conserva una timeline unica per Mascaro e non confonde la richiesta Arpaia con MTL", () => {
    const m = PUBLIC_PROPOSALS.find((p) => p.id === rows[0].id)!;
    expect(m.events.map((e) => e.date)).toEqual(["2026-07-20", "2026-10-30"]);
    const sport = PUBLIC_PROPOSALS.find((p) => p.id === rows[1].id)!;
    const mtl = PUBLIC_PROPOSALS.find((p) => p.id === "palasparti-riapertura-manutenzione-mtl-2026")!;
    expect(sport.promoterId).not.toBe(mtl.promoterId);
    expect(sport.threadId).toBe(mtl.threadId);
    expect(sport.institutionalRecipient).not.toBeUndefined();
  });
});
