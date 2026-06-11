import { describe, expect, it } from "vitest";

import {
  buildPnrrCivicTwinReport,
  buildPnrrEvidenceLink,
  normalizePnrrComparableText,
  type PnrrActConnectionInput,
  type PnrrProject,
} from "../lib/pnrrCivicTwin";

const basePnrrSource = buildPnrrEvidenceLink({
  id: "pnrr:source-a",
  sourceType: "pnrr",
  sourceLabel: "Pagina comunale Attuazione Misure PNRR",
  sourceUrl: "https://example.test/pnrr",
  status: "collegamento-verificato",
  confidence: "alta",
  matchedBy: ["cup"],
  reason: "collegamento verificato tramite cup",
});

function project(overrides: Partial<PnrrProject> = {}): PnrrProject {
  return {
    id: "project-1",
    title: "Riqualificazione scuola primaria quartiere Bella",
    missionComponent: { mission: "M4", component: "C1", investment: "I1.1" },
    cup: "J81B22001230006",
    amountEuro: 120000,
    placeOrDistrict: "Bella",
    pnrrSource: basePnrrSource,
    keywords: ["scuola", "bella"],
    cigs: ["A012345678"],
    incompletenessNotes: ["Importo disponibile solo se presente nella fonte PNRR"],
    ...overrides,
  };
}

function act(overrides: Partial<PnrrActConnectionInput> = {}): PnrrActConnectionInput {
  return {
    id: "act-1",
    title: "SAL lavori scuola primaria quartiere Bella",
    sourceLabel: "Albo pretorio - determinazione SAL",
    sourceUrl: "https://example.test/albo/act-1",
    cup: "J81B22001230006",
    cig: "A012345678",
    keywords: ["scuola", "sal"],
    ...overrides,
  };
}

describe("PNRR civic twin reconciliation", () => {
  it("keeps verified evidence links for a project with CUP and an Albo SAL act", () => {
    const report = buildPnrrCivicTwinReport([project()], [act()]);
    const reconciliation = report.projects[0];
    const connection = reconciliation.connectedActs[0];

    expect(report.generatedFrom).toBe("documented-fields-only");
    expect(reconciliation.status).toBe("collegamento-verificato");
    expect(connection).toMatchObject({
      actId: "act-1",
      status: "collegamento-verificato",
      confidence: "alta",
    });
    expect(connection.evidenceLink).toMatchObject({
      sourceType: "albo",
      sourceLabel: "Albo pretorio - determinazione SAL",
      sourceUrl: "https://example.test/albo/act-1",
      status: "collegamento-verificato",
      confidence: "alta",
    });
    expect(connection.evidenceLink.matchedBy).toEqual(["cup", "cig", "parola-chiave"]);
    expect(connection.reason).toContain("collegamento verificato");
  });

  it("records cautious incompleteness notes for a project without CUP", () => {
    const report = buildPnrrCivicTwinReport(
      [project({ id: "project-no-cup", cup: null, cigs: [], keywords: ["biblioteca"] })],
      [act({ id: "act-no-cup", title: "Acquisto arredi biblioteca", cup: null, cig: null, keywords: ["biblioteca"] })],
    );
    const reconciliation = report.projects[0];
    const connection = reconciliation.connectedActs[0];

    expect(reconciliation.status).toBe("collegamento-possibile");
    expect(reconciliation.incompletenessNotes).toContain("CUP non documentato nella scheda progetto fornita");
    expect(connection.status).toBe("collegamento-possibile");
    expect(connection.confidence).toBe("bassa");
    expect(connection.evidenceLink.matchedBy).toEqual(["parola-chiave"]);
    expect(connection.reason).toBe("collegamento possibile tramite parola-chiave");
  });

  it("links a collaudo act by normalized title without mutating the source fields", () => {
    const report = buildPnrrCivicTwinReport(
      [project({ id: "project-collaudo", cup: undefined, cigs: [], keywords: [] })],
      [
        act({
          id: "act-collaudo",
          title: "Riqualificazione scuola primaria quartiere Bella",
          sourceLabel: "Albo pretorio - certificato di collaudo",
          cup: undefined,
          cig: undefined,
          keywords: ["collaudo"],
        }),
      ],
    );
    const connection = report.projects[0].connectedActs[0];

    expect(connection.status).toBe("collegamento-possibile");
    expect(connection.confidence).toBe("media");
    expect(connection.evidenceLink.matchedBy).toEqual(["titolo-normalizzato"]);
    expect(connection.evidenceLink.sourceLabel).toBe("Albo pretorio - certificato di collaudo");
  });

  it("keeps mismatched titles as unreconciled instead of inferring completeness", () => {
    const report = buildPnrrCivicTwinReport(
      [project({ id: "project-mismatch", cup: null, cigs: [], keywords: ["verde pubblico"] })],
      [act({ id: "act-mismatch", title: "Manutenzione impianto sportivo", cup: null, cig: null, keywords: ["sport"] })],
    );

    expect(report.projects[0].status).toBe("non-rilevato-nelle-fonti-monitorate");
    expect(report.projects[0].connectedActs).toEqual([]);
    expect(report.projects[0].unreconciledEvidence[0]).toMatchObject({
      sourceType: "pnrr",
      status: "non-rilevato-nelle-fonti-monitorate",
      confidence: "nessuna",
    });
    expect(report.projects[0].unreconciledEvidence[0].reason).toContain("non rilevato nelle fonti monitorate");
    expect(report.unlinkedAlboActs[0].evidenceLink).toMatchObject({
      sourceType: "unreconciled",
      status: "fonte-non-riconciliata",
      confidence: "nessuna",
    });
  });

  it("normalizes comparable titles deterministically for documented-field matching", () => {
    expect(normalizePnrrComparableText("  Scuola: Primària — Bella!  ")).toBe("scuola primaria bella");
  });
});
