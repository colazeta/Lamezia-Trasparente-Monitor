import { describe, expect, it } from "vitest";

import {
  buildFoiaDraft,
  type FoiaDraftCase,
  type FoiaDraftCheckOutcome,
  type FoiaRequestKind,
} from "@/lib/foiaDraftTemplates";

const forbiddenAccusatoryTerms = [
  "violazione",
  "omissione",
  "illecito",
  "corruzione",
  "favoritismo",
  "responsabilità",
  "abuso",
] as const;

function combinedDraftText(draftCase: FoiaDraftCase) {
  const draft = buildFoiaDraft(draftCase);
  return JSON.stringify(draft).toLowerCase();
}

describe("buildFoiaDraft", () => {
  it("classifies a mandatory document not found as accesso civico semplice", () => {
    const draft = buildFoiaDraft({
      sourceModule: "Modulo trasparenza fittizio",
      dataType: "documento obbligatorio di prova",
      checkedAt: "2026-06-09",
      checkOutcome: "documento_non_rintracciato",
      publicationExpectation: "obbligatoria",
      requestScope: "documento_obbligatorio",
      checkedSources: ["sezione dichiarata dall'utente"],
    });

    expect(draft.requestKind).toBe("accesso_civico_semplice" satisfies FoiaRequestKind);
    expect(draft.subject).toContain("accesso civico semplice");
    expect(draft.body).toContain("documento indicato non è stato rintracciato");
    expect(draft.body).toContain("alla data del controllo dichiarata (2026-06-09)");
    expect(draft.editableFields.requestSubject).toBe(draft.subject);
    expect(draft.editableFields.requestBody).toBe(draft.body);
  });

  it("keeps an incomplete data clarification conservatively to be evaluated", () => {
    const draft = buildFoiaDraft({
      sourceModule: "Cruscotto dimostrativo",
      dataType: "dato riepilogativo incompleto",
      checkedAt: "2026-06-09",
      checkOutcome: "dato_incompleto",
      publicationExpectation: "da_verificare",
      requestScope: "chiarimento_puntuale",
      note: "Serve solo chiarire il perimetro del dato indicato.",
    });

    expect(draft.requestKind).toBe("da_valutare" satisfies FoiaRequestKind);
    expect(draft.body).toContain("dato parziale o non completo");
    expect(draft.body).toContain("chiarimento puntuale");
    expect(draft.body).toContain("senza assumere che il dato parziale dipenda da una causa specifica");
    expect(draft.body).not.toContain("non risulta rintracciato/aggiornato");
  });

  it("classifies a broader document request as accesso civico generalizzato", () => {
    const draft = buildFoiaDraft({
      sourceModule: "Archivio dimostrativo",
      dataType: "insieme documentale di prova",
      checkedAt: "2026-06-09",
      checkOutcome: "documentazione_ampia",
      publicationExpectation: "non_specificata",
      requestScope: "documentazione_ampia",
    });

    expect(draft.requestKind).toBe("accesso_civico_generalizzato" satisfies FoiaRequestKind);
    expect(draft.subject).toContain("accesso civico generalizzato");
    expect(draft.body).toContain("documentazione amministrativa ampia");
    expect(draft.body).toContain("delimitare una richiesta documentale");
    expect(draft.body).not.toContain("non risulta rintracciato/aggiornato");
  });

  it.each([
    ["documento_non_rintracciato", "documento indicato non è stato rintracciato"],
    ["aggiornamento_non_rintracciato", "aggiornamento atteso del documento indicato non è stato rintracciato"],
    ["dato_incompleto", "dato parziale o non completo"],
    ["chiarimento_puntuale", "chiarimento circoscritto"],
    ["documentazione_ampia", "documentazione amministrativa ampia"],
    ["altro", "esito da valutare"],
  ] satisfies Array<[FoiaDraftCheckOutcome, string]>)
    ("uses outcome-specific context for %s", (checkOutcome, expectedContext) => {
      const draft = buildFoiaDraft({
        dataType: "informazione di prova",
        checkedAt: "2026-06-09",
        checkOutcome,
      });

      expect(draft.body).toContain(expectedContext);

      expect(draft.body).not.toContain("non risulta rintracciato/aggiornato");
    });

  it("does not invent sources, URLs, recipients, emails or institutional links when absent", () => {
    const draft = buildFoiaDraft({
      dataType: "informazione di prova",
      checkOutcome: "altro",
    });
    const serializedDraft = JSON.stringify(draft).toLowerCase();

    expect(draft.metadata.checkedSources).toEqual([]);
    expect(draft.metadata.checkedUrl).toBeUndefined();
    expect(draft.editableFields.recipientOffice).toBe("");
    expect(draft.editableFields.requesterContact).toBe("");
    expect(serializedDraft).not.toContain("http");
    expect(serializedDraft).not.toContain("www.");
    expect(serializedDraft).not.toContain("@comune");
    expect(serializedDraft).not.toMatch(/\bpec\b/);
  });

  it("neutralizes hostile free-text before reusing it in the draft", () => {
    const draft = buildFoiaDraft({
      sourceModule: "Modulo corruzione appalti",
      dataType: "omissione e illecito su incarichi",
      checkedAt: "2026-06-09",
      checkOutcome: "chiarimento_puntuale",
      publicationExpectation: "da_verificare",
      requestScope: "chiarimento_puntuale",
      checkedSources: ["pagina con violazione", "sezione ordinaria"],
      checkedUrl: "https://example.test/corruzione",
      note: "Possibile favoritismo e abuso da denunciare.",
    });
    const serializedDraft = JSON.stringify(draft).toLowerCase();

    expect(draft.metadata.sourceModule).toBe("contesto da descrivere in termini neutrali");
    expect(draft.metadata.dataType).toBe("informazione o documento da descrivere in termini neutrali");
    expect(draft.metadata.checkedSources).toEqual([
      "fonte dichiarata da verificare con formulazione neutrale",
      "sezione ordinaria",
    ]);
    expect(draft.metadata.checkedUrl).toBe("URL dichiarato da verificare con formulazione neutrale");
    expect(draft.editableFields.userNote).toBe(
      "Nota dell'utente da riformulare in termini documentali neutrali prima dell'eventuale uso esterno.",
    );

    for (const term of forbiddenAccusatoryTerms) {
      expect(serializedDraft).not.toContain(term);
    }
  });

  it("preserves ambiguous non-accusatory free-text after whitespace normalization", () => {
    const draft = buildFoiaDraft({
      sourceModule: "  Archivio   delibere   ",
      dataType: " elenco incarichi   aggiornato ",
      checkedSources: [" sezione amministrazione trasparente  ", " albo pretorio "],
      checkedUrl: " https://example.test/documenti ",
      note: "  Richiesta limitata al perimetro documentale indicato. ",
      checkOutcome: "altro",
    });

    expect(draft.metadata.sourceModule).toBe("Archivio delibere");
    expect(draft.metadata.dataType).toBe("elenco incarichi aggiornato");
    expect(draft.metadata.checkedSources).toEqual([
      "sezione amministrazione trasparente",
      "albo pretorio",
    ]);
    expect(draft.metadata.checkedUrl).toBe("https://example.test/documenti");
    expect(draft.editableFields.userNote).toBe(
      "Richiesta limitata al perimetro documentale indicato.",
    );
  });

  it("avoids forbidden accusatory wording in generated draft text", () => {
    const draftText = combinedDraftText({
      sourceModule: "Modulo fittizio",
      dataType: "aggiornamento di prova",
      checkedAt: "2026-06-09",
      checkOutcome: "aggiornamento_non_rintracciato",
      publicationExpectation: "obbligatoria",
      requestScope: "documento_obbligatorio",
      note: "La richiesta resta limitata a un controllo documentale prudente.",
    });

    for (const term of forbiddenAccusatoryTerms) {
      expect(draftText).not.toContain(term);
    }
  });
});
