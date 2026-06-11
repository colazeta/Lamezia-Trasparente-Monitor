import { describe, expect, it } from "vitest";

import {
  accessRequestStatuses,
  createAccessRequestTrackerEntry,
  createCivicAccessRequest,
  selectAccessRequestTemplate,
  type MissingEvidenceTrigger,
} from "./accessoCivicoTracker";

const triggers: MissingEvidenceTrigger[] = [
  {
    kind: "seduta_non_rilevata",
    sourceLabel: "Calendario sedute consiglio comunale",
    missingEvidenceLabel: "seduta del 2026-04-18 non rilevata",
    observedAt: "2026-04-20",
    expectedPublication: "da_verificare",
  },
  {
    kind: "verbale_resoconto_non_rilevato",
    sourceLabel: "Sezione organi istituzionali",
    missingEvidenceLabel: "verbale della seduta del 2026-03-12",
    observedAt: "2026-03-20",
    expectedPublication: "obbligatoria",
  },
  {
    kind: "dataset_open_data_assente_o_non_aggiornato",
    sourceLabel: "Catalogo open data comunale",
    missingEvidenceLabel: "dataset contratti aggiornato al trimestre corrente",
    observedAt: "2026-05-02",
    contextNote:
      "ultimo aggiornamento visibile precedente al periodo monitorato",
  },
  {
    kind: "cup_cig_non_riconciliato",
    sourceLabel: "Scheda intervento PNRR e dati contratti",
    missingEvidenceLabel:
      "riconciliazione tra CUP J00A00000000001 e CIG 0000000000",
    observedAt: "2026-05-10",
  },
  {
    kind: "atto_citato_documento_non_raggiungibile",
    sourceLabel: "Albo pretorio / scheda atto citato",
    missingEvidenceLabel: "allegato citato ma non raggiungibile dalla scheda",
    observedAt: "2026-05-15",
    sourceUrl: "https://example.test/atto/123",
    expectedPublication: "da_verificare",
  },
];

describe("accesso civico tracker helpers", () => {
  it("exposes the minimum access request statuses required by the issue", () => {
    expect(accessRequestStatuses).toEqual([
      "draft",
      "ready_to_send",
      "sent",
      "answered",
      "partially_answered",
      "rejected",
      "expired",
      "needs_follow_up",
    ]);
  });

  it.each(triggers)(
    "creates a cautious draft with required public fields for %s",
    (trigger) => {
      const request = createCivicAccessRequest(trigger);

      expect(request.subject).toContain(trigger.missingEvidenceLabel);
      expect(request.missingSource).toContain(trigger.sourceLabel);
      expect(request.request).toContain(trigger.missingEvidenceLabel);
      expect(request.genericRecipient).toMatch(/Ufficio|Responsabile/);
      expect(request.status).toBe("draft");
      expect(request.linkedTrigger.kind).toBe(trigger.kind);
      expect(request.request).toContain("bozza");
      expect(request.request).toMatch(/non (implica|presuppone)/i);
    },
  );

  it("uses the simple access template when mandatory publication is documented", () => {
    expect(selectAccessRequestTemplate(triggers[1]).id).toBe(
      "accesso_civico_semplice",
    );
  });

  it("uses the generalized access template when publication duty needs verification", () => {
    expect(selectAccessRequestTemplate(triggers[0]).id).toBe(
      "accesso_civico_generalizzato",
    );
  });

  it("creates tracker entries without implying automatic sending", () => {
    const entry = createAccessRequestTrackerEntry(triggers[4]);

    expect(entry.status).toBe("draft");
    expect(entry.statusNote).toContain("nessun invio automatico");
    expect(entry.request.missingSource).toContain(
      "https://example.test/atto/123",
    );
  });

  it("normalizes blank fields to explicit verification placeholders", () => {
    const request = createCivicAccessRequest({
      kind: "atto_citato_documento_non_raggiungibile",
      sourceLabel: "  ",
      missingEvidenceLabel: "  ",
      observedAt: "non-validata",
    });

    expect(request.missingSource).toBe("fonte da verificare");
    expect(request.subject).toContain("documento o informazione da verificare");
    expect(request.createdAt).toBe("data da verificare");
  });
});
