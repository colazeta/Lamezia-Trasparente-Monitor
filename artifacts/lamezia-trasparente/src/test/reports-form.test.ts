import { describe, expect, it } from "vitest";

import {
  buildReportSubmission,
  formSchema,
  SOURCE_TYPES,
  type FormValues,
} from "@/pages/Reports";

const baseFormValues: FormValues = {
  title: "Tempi da verificare su una richiesta",
  description:
    "Descrizione circostanziata da usare come elemento da verificare senza accuse.",
  category: "trasparenza",
  location: "non localizzato",
  citizenName: "",
  initialSourceUrl: "",
  initialSourceType: "",
  competentOffice: "",
  formalAct: "",
  availableData: "",
  missingData: "",
};

describe("reports evidence form", () => {
  it("keeps evidence fields optional in validation", () => {
    const parsed = formSchema.safeParse(baseFormValues);

    expect(parsed.success).toBe(true);
  });

  it("supports the guided initial source type options", () => {
    expect(SOURCE_TYPES).toEqual([
      "articolo",
      "comunicato",
      "post pubblico",
      "interrogazione",
      "mozione",
      "accesso",
      "albo",
      "delibera",
      "altro",
    ]);
  });

  it("separates personal data from the document context prepared for review", () => {
    const submission = buildReportSubmission({
      ...baseFormValues,
      citizenName: " Nome riservato ",
      initialSourceUrl: " https://example.test/albo ",
      initialSourceType: "albo",
      competentOffice: "Settore trasparenza",
      formalAct: "Determina da identificare",
      availableData: "Numero di protocollo citato nella pagina pubblica",
      missingData: "Allegati e stato del procedimento",
    });

    expect(submission.citizenName).toBe("Nome riservato");
    expect(submission.initialSourceUrl).toBe("https://example.test/albo");
    expect(submission.initialSourceType).toBe("albo");
    expect(submission.description).toContain(
      "Contesto documentale fornito per la verifica redazionale",
    );
    expect(submission.description).toContain(
      "- Ufficio o settore potenzialmente competente: Settore trasparenza",
    );
    expect(submission.description).toContain(
      "Possibile handoff logico: valutare una richiesta Accesso civico/FOIA Machine sui dati mancanti, senza invio automatico.",
    );
    expect(submission.description).not.toContain("Nome riservato");
  });
});
