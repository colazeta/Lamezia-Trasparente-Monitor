import { describe, expect, it } from "vitest";

import {
  buildFoiaDraft,
  type FoiaDraftCase,
  type FoiaRequestKind,
} from "@/lib/foiaDraftTemplates";

const forbiddenAccusatoryTerms = [
  "violazione",
  "omissione",
  "illecito",
  "corruzione",
  "favoritismo",
] as const;

function combinedDraftText(draftCase: FoiaDraftCase) {
  const draft = buildFoiaDraft(draftCase);
  return `${draft.subject}\n${draft.body}\n${draft.cautions.join("\n")}`.toLowerCase();
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
    expect(draft.body.toLowerCase()).toContain(
      "non risulta rintracciato/aggiornato alla data del controllo",
    );
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
    expect(draft.body).toContain("chiarimento puntuale");
    expect(draft.body).toContain("senza assumere che il dato parziale dipenda da una causa specifica");
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
    expect(draft.body).toContain("documentazione amministrativa più ampia");
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
