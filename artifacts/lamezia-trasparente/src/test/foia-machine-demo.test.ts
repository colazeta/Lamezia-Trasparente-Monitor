import { describe, expect, it } from "vitest";

import {
  FOIA_REQUEST_TYPES,
  foiaMachineDemoCases,
  foiaRequestTypeLabels,
  type FoiaRequestType,
} from "@/data/foiaMachineDemo";
import {
  countFoiaCasesByType,
  generateFoiaDraft,
  getMissingFoiaDemoFields,
  isFoiaDemoOnlyDataset,
} from "@/lib/foiaMachineTemplates";

const expectedTaxonomy: FoiaRequestType[] = [
  "accesso_civico_semplice",
  "accesso_civico_generalizzato",
  "richiesta_chiarimento",
  "richiesta_link_documento",
  "richiesta_aggiornamento",
];

const cautiousForbiddenTerms = [
  "violazione",
  "inadempienza",
  "omissione",
  "abuso",
  "irregolarità",
] as const;

describe("FOIA Machine demo dataset", () => {
  it("exports the prudent request taxonomy with labels", () => {
    expect(FOIA_REQUEST_TYPES).toEqual(expectedTaxonomy);

    for (const requestType of expectedTaxonomy) {
      expect(foiaRequestTypeLabels[requestType]).toBeTruthy();
    }
  });

  it("keeps all cases explicitly demo-only and separate from real-world identifiers", () => {
    expect(isFoiaDemoOnlyDataset(foiaMachineDemoCases)).toBe(true);

    const serializedCases = JSON.stringify(foiaMachineDemoCases).toLowerCase();
    expect(serializedCases).toContain("fittizio");
    expect(serializedCases).not.toContain("@comune");
    expect(serializedCases).not.toContain("pec");
    expect(serializedCases).not.toMatch(/\b(cup|cig)-?\d/i);
    expect(serializedCases).not.toMatch(/protocollo\s+n\.?\s*\d/i);
  });

  it("counts demo cases by request type without dropping empty taxonomy buckets", () => {
    expect(countFoiaCasesByType(foiaMachineDemoCases)).toEqual({
      accesso_civico_semplice: 1,
      accesso_civico_generalizzato: 1,
      richiesta_chiarimento: 1,
      richiesta_link_documento: 1,
      richiesta_aggiornamento: 1,
    });
  });

  it("detects required missing fields on partial demo cases", () => {
    expect(
      getMissingFoiaDemoFields({
        id: "foia-demo-99",
        demoOnly: true,
        requestType: "richiesta_chiarimento",
        cautionNotes: [],
      }),
    ).toEqual([
      "sourceModule",
      "documentSubject",
      "cautiousMotivation",
      "demoRecipientEntity",
      "sourceContext",
      "dataQualityStatus",
      "cautionNotes",
    ]);
  });

  it("generates editable, cautious textual drafts for every demo case", () => {
    for (const demoCase of foiaMachineDemoCases) {
      const draft = generateFoiaDraft(demoCase);
      const combinedDraft = `${draft.subject}\n${draft.body}`.toLowerCase();

      expect(draft.subject).toContain(foiaRequestTypeLabels[demoCase.requestType]);
      expect(draft.body).toContain("Testo modificabile dall'utente");
      expect(draft.editableNotice).toContain("modificabile");
      expect(draft.legalCaution).toContain("non prova inadempimento");
      expect(draft.legalCaution).toContain("responsabilità personale");
      expect(draft.legalCaution).toContain("obbligo giuridico accertato");

      for (const term of cautiousForbiddenTerms) {
        expect(combinedDraft).not.toContain(term);
      }
    }
  });
});
