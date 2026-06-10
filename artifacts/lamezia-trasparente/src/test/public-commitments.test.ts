import { describe, expect, it } from "vitest";

import {
  buildCommitmentDocumentChain,
  COMMITMENT_STATUS_DESCRIPTIONS,
  type PublicCommitment,
  validateCommitmentDocumentChain,
} from "@/lib/publicCommitments";

function baseCommitment(
  overrides: Partial<PublicCommitment> = {},
): PublicCommitment {
  const commitment: PublicCommitment = {
    id: "commitment-001",
    neutralTitle: "Apertura di un punto informativo comunale",
    summary:
      "Impegno pubblico descritto in termini neutrali e verificabile solo tramite fonti documentali.",
    sources: [
      {
        id: "source-programme-001",
        kind: "political_promise",
        title: "Documento programmatico pubblico",
        date: "2026-06-01",
        url: "https://www.comune.lamezia-terme.cz.it/documenti/programma.pdf",
        citation: "Sezione servizi civici",
        note: "Fonte pubblica da leggere entro il perimetro del documento originale.",
      },
    ],
    evidenceLinks: [
      {
        id: "evidence-announced-001",
        sourceId: "source-programme-001",
        commitmentId: "commitment-001",
        relation: "states_commitment",
        note: "Collega la fonte programmatica all'impegno senza attribuire esiti o responsabilità.",
      },
    ],
    administrativeFollowUps: [],
    currentStatus: "announced",
    currentStatusEvidenceLinkIds: ["evidence-announced-001"],
    timeline: [
      {
        id: "timeline-announced-001",
        commitmentId: "commitment-001",
        status: "announced",
        date: "2026-06-01",
        evidenceLinkIds: ["evidence-announced-001"],
        note: "Stato iniziale basato sulla sola fonte pubblica disponibile.",
      },
    ],
    methodologyNote:
      "Classificazione prudente fondata su fonte e verifica documentale, senza giudizi politici o accuse.",
  };

  return { ...commitment, ...overrides };
}

describe("public commitment documentary model", () => {
  it("keeps a single-source commitment chain from source to status", () => {
    const commitment = baseCommitment();

    expect(validateCommitmentDocumentChain(commitment)).toEqual([]);
    expect(buildCommitmentDocumentChain(commitment)).toEqual({
      commitmentId: "commitment-001",
      sourceIds: ["source-programme-001"],
      evidenceLinkIds: ["evidence-announced-001"],
      followUpIds: [],
      status: {
        status: "announced",
        evidenceLinkIds: ["evidence-announced-001"],
        sourceIds: ["source-programme-001"],
        reason: undefined,
      },
    });
  });

  it("supports multiple sources while separating promise, direction, and public communication", () => {
    const commitment = baseCommitment({
      sources: [
        ...baseCommitment().sources,
        {
          id: "source-direction-001",
          kind: "administrative_direction",
          title: "Atto di indirizzo collegato",
          date: "2026-06-12",
          url: "https://www.comune.lamezia-terme.cz.it/atti/indirizzo-001.pdf",
          note: "Atto di indirizzo: indica un passaggio amministrativo, non un esito concluso.",
        },
        {
          id: "source-communication-001",
          kind: "public_communication",
          title: "Comunicazione istituzionale di calendario",
          date: "2026-06-18",
          url: "https://www.comune.lamezia-terme.cz.it/comunicati/calendario",
          note: "Comunicazione pubblica da verificare con atti successivi.",
        },
      ],
      evidenceLinks: [
        ...baseCommitment().evidenceLinks,
        {
          id: "evidence-formalised-001",
          sourceId: "source-direction-001",
          commitmentId: "commitment-001",
          relation: "formalises_commitment",
          note: "Formalizza l'indirizzo amministrativo senza indicare realizzazione automatica.",
        },
        {
          id: "evidence-scheduled-001",
          sourceId: "source-communication-001",
          commitmentId: "commitment-001",
          relation: "schedules_commitment",
          note: "Documenta una calendarizzazione pubblica da monitorare.",
        },
      ],
      currentStatus: "scheduled",
      currentStatusEvidenceLinkIds: [
        "evidence-formalised-001",
        "evidence-scheduled-001",
      ],
      timeline: [
        ...baseCommitment().timeline,
        {
          id: "timeline-formalised-001",
          commitmentId: "commitment-001",
          status: "formalised",
          date: "2026-06-12",
          evidenceLinkIds: ["evidence-formalised-001"],
          note: "Passaggio di indirizzo amministrativo documentato.",
        },
        {
          id: "timeline-scheduled-001",
          commitmentId: "commitment-001",
          status: "scheduled",
          date: "2026-06-18",
          evidenceLinkIds: ["evidence-scheduled-001"],
          note: "Programmazione pubblica documentata da fonte istituzionale.",
        },
      ],
    });

    expect(validateCommitmentDocumentChain(commitment)).toEqual([]);
    expect(buildCommitmentDocumentChain(commitment).status).toEqual({
      status: "scheduled",
      evidenceLinkIds: ["evidence-formalised-001", "evidence-scheduled-001"],
      sourceIds: ["source-direction-001", "source-communication-001"],
      reason: undefined,
    });
  });

  it("keeps linked administrative acts attached to both evidence and status", () => {
    const commitment = baseCommitment({
      sources: [
        ...baseCommitment().sources,
        {
          id: "source-executive-act-001",
          kind: "executive_act",
          title: "Determinazione gestionale collegata",
          date: "2026-07-02",
          url: "https://www.comune.lamezia-terme.cz.it/atti/determina-001.pdf",
          note: "Atto esecutivo collegato da leggere con allegati e limiti della fonte.",
        },
      ],
      evidenceLinks: [
        ...baseCommitment().evidenceLinks,
        {
          id: "evidence-progress-001",
          sourceId: "source-executive-act-001",
          commitmentId: "commitment-001",
          relation: "documents_progress",
          note: "Documenta un avanzamento amministrativo circoscritto.",
        },
      ],
      administrativeFollowUps: [
        {
          id: "follow-up-001",
          commitmentId: "commitment-001",
          kind: "executive_act",
          title: "Avvio gestionale del punto informativo",
          date: "2026-07-02",
          sourceId: "source-executive-act-001",
          evidenceLinkId: "evidence-progress-001",
          note: "Atto collegato come seguito amministrativo, non come valutazione politica.",
        },
      ],
      currentStatus: "in_progress",
      currentStatusEvidenceLinkIds: ["evidence-progress-001"],
      timeline: [
        ...baseCommitment().timeline,
        {
          id: "timeline-progress-001",
          commitmentId: "commitment-001",
          status: "in_progress",
          date: "2026-07-02",
          evidenceLinkIds: ["evidence-progress-001"],
          note: "Avanzamento documentale collegato a un atto esecutivo.",
        },
      ],
    });

    expect(validateCommitmentDocumentChain(commitment)).toEqual([]);
    expect(buildCommitmentDocumentChain(commitment)).toMatchObject({
      commitmentId: "commitment-001",
      followUpIds: ["follow-up-001"],
      status: {
        status: "in_progress",
        sourceIds: ["source-executive-act-001"],
      },
    });
  });

  it("allows a not-assessable status only with an explicit documentary reason", () => {
    const assessableWithReason = baseCommitment({
      currentStatus: "not_assessable",
      currentStatusEvidenceLinkIds: [],
      currentStatusReason:
        "La fonte monitorata non contiene elementi sufficienti per distinguere indirizzo, atto esecutivo o stato verificato.",
      timeline: [
        {
          id: "timeline-not-assessable-001",
          commitmentId: "commitment-001",
          status: "not_assessable",
          date: "2026-06-20",
          evidenceLinkIds: [],
          note: "Classificazione sospesa per limite documentale esplicito.",
          notAssessableReason:
            "Servono ulteriori fonti amministrative prima di una classificazione prudente.",
        },
      ],
    });
    const notAssessableWithoutReason = baseCommitment({
      currentStatus: "not_assessable",
      currentStatusEvidenceLinkIds: [],
      currentStatusReason: " ",
      timeline: [
        {
          id: "timeline-not-assessable-001",
          commitmentId: "commitment-001",
          status: "not_assessable",
          date: "2026-06-20",
          evidenceLinkIds: [],
          note: "Classificazione sospesa.",
        },
      ],
    });

    expect(validateCommitmentDocumentChain(assessableWithReason)).toEqual([]);
    expect(validateCommitmentDocumentChain(notAssessableWithoutReason)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "currentStatusReason",
          reason: "missing-not-assessable-reason",
        }),
        expect.objectContaining({
          field: "timeline.timeline-not-assessable-001.notAssessableReason",
          reason: "missing-not-assessable-reason",
        }),
      ]),
    );
  });

  it("uses prudent status copy that does not imply misconduct or responsibility", () => {
    const combinedCopy = Object.values(COMMITMENT_STATUS_DESCRIPTIONS).join(
      " ",
    );

    expect(combinedCopy).toMatch(/fonte|fonti|document/i);
    expect(combinedCopy).not.toMatch(
      /corruzione|favoritismo|mafia|responsabilit[aà] individuale|colpa|inadempienza/i,
    );
  });
});
