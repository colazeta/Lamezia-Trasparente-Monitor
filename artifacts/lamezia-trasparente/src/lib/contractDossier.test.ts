import { describe, expect, it } from "vitest";
import type {
  Contract,
  StorylineEvent,
  StorylineIndicators,
} from "@workspace/api-client-react";

import {
  CONTRACT_LIFECYCLE_PHASE_ORDER,
  buildContractDossier,
  getLifecyclePhase,
} from "./contractDossier";

const baseContract: Contract = {
  id: 42,
  title: "Fixture lavori pubblici",
  description: "Manutenzione straordinaria di un edificio pubblico",
  supplier: "Operatore fixture",
  amount: 125000,
  procedureType: "Affidamento diretto",
  status: "Aggiudicato",
  awardDate: "2026-01-15",
  cig: "1234567CE7",
  cup: "H12B123456789AB",
  stazioneAppaltante: "Comune di Lamezia Terme",
  acquisitionTool: "MEPA",
  withoutTender: false,
  withoutMepa: false,
  anacUrl: null,
  themeId: null,
  macrotema: "strade",
  macrotemaManual: false,
  latitude: null,
  longitude: null,
  geoAddress: "Via fixture",
  geoQuartiere: "nicastro",
  geoSource: "manual",
  geoManual: true,
  geoVerify: false,
};

const attachment = {
  name: "determina.pdf",
  tipo: "pdf",
  officialUrl: "https://example.test/determina.pdf",
  storagePath: null,
  contentType: "application/pdf",
  size: 1234,
};

const indicators: StorylineIndicators = {
  evidenceCount: 3,
  phaseCounts: {
    affidamento: 1,
    contratto: 0,
    variante: 0,
    liquidazione: 1,
    collaudo: 1,
    altro: 0,
  },
  firstEvidenceDate: "2026-01-20",
  lastEvidenceDate: "2026-05-20",
  daysToFirstLiquidazione: 60,
  daysToLastLiquidazione: 60,
  awardedAmount: 125000,
  extraAmount: null,
  extraAmountIsEstimate: false,
  costOverrunPct: null,
  liquidatedAmount: 25000,
  liquidatedAmountIsEstimate: true,
  status: "liquidato",
};

function event(
  publicationId: number,
  phase: StorylineEvent["phase"],
  attachments = [attachment],
): StorylineEvent {
  return {
    publicationId,
    progressivo: `2026/${publicationId}`,
    phase,
    matchedBy: "cig",
    tipologia: "Determina",
    oggetto: `Atto fixture ${phase}`,
    date: "2026-02-01",
    estimatedAmount: null,
    attachments,
  };
}

describe("contract dossier lifecycle", () => {
  it("keeps the civic lifecycle phase order stable", () => {
    expect(CONTRACT_LIFECYCLE_PHASE_ORDER).toEqual([
      "programmazione",
      "progettazione",
      "gara_pubblicazione",
      "svolgimento_gara",
      "affidamento",
      "esecuzione",
      "valutazione",
    ]);
  });

  it("derives documented phases from source evidence and partial phases from identifiers", () => {
    const dossier = buildContractDossier({
      contract: baseContract,
      indicators,
      timeline: [
        event(1, "affidamento"),
        event(2, "liquidazione"),
        event(3, "collaudo"),
      ],
    });

    expect(getLifecyclePhase(dossier, "programmazione").status).toBe("partial");
    expect(getLifecyclePhase(dossier, "gara_pubblicazione").status).toBe(
      "partial",
    );
    expect(getLifecyclePhase(dossier, "svolgimento_gara").status).toBe(
      "partial",
    );
    expect(getLifecyclePhase(dossier, "affidamento").status).toBe("documented");
    expect(getLifecyclePhase(dossier, "esecuzione").status).toBe("documented");
    expect(getLifecyclePhase(dossier, "valutazione").status).toBe("documented");
    expect(dossier.phases.map((phase) => phase.label)).toEqual([
      "Programmazione",
      "Progettazione",
      "Gara / pubblicazione",
      "Esecuzione della gara",
      "Affidamento",
      "Esecuzione del contratto",
      "Conclusione, collaudi e verifiche",
    ]);
  });

  it("surfaces missing CIG and CUP without inventing links or public-work completeness", () => {
    const dossier = buildContractDossier({
      contract: { ...baseContract, cig: null, cup: null },
      indicators: {
        ...indicators,
        phaseCounts: {},
        status: "nessuna_liquidazione",
      },
      timeline: [],
    });

    expect(dossier.identifiers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "cig",
          formalStatus: "missing",
          sourceStatus: "missing-source",
        }),
        expect.objectContaining({
          kind: "cup",
          formalStatus: "missing",
          sourceStatus: "missing-source",
        }),
      ]),
    );
    expect(dossier.workAxis).toMatchObject({
      isPublicWork: true,
      cupStatus: "missing",
      message: "CUP non rilevato nelle fonti disponibili.",
    });
    expect(dossier.publicLimits).toContain(
      "CUP non rilevato nelle fonti disponibili.",
    );
  });

  it("does not fabricate an official-source status for evidence without source material", () => {
    const dossier = buildContractDossier({
      contract: baseContract,
      indicators,
      timeline: [event(7, "affidamento", [])],
    });

    expect(dossier.evidence).toContainEqual(
      expect.objectContaining({
        id: "albo-7",
        sourceStatus: "derived-data",
        isOfficialSourceEvidence: false,
      }),
    );
    expect(
      dossier.evidence.some(
        (evidence) =>
          evidence.sourceStatus === "official-source" &&
          !evidence.isOfficialSourceEvidence,
      ),
    ).toBe(false);
  });

  it("keeps ingestion metadata separate from public source labels", () => {
    const ingestionMetadata = {
      source_dataset_id: "test-dataset",
      source_dataset_label: "TEST dataset",
      source_record_id: "record-1",
      source_downloaded_at: "2026-06-27T00:00:00.000Z",
      source_published_at: "2026-06-26",
      source_update_kind: "full" as const,
      parser_version: "test-parser-v0",
      ingestion_status: "parsed" as const,
      mapping_notes: ["fixture only"],
    };
    const dossier = buildContractDossier({
      contract: baseContract,
      sourceEvidence: [
        {
          id: "ingested-gara",
          phaseKey: "gara_pubblicazione",
          title: "Fixture fonte ingerita",
          description: "Record test-only ingerito da fixture.",
          sourceKind: "bdncp",
          sourceStatus: "official-ingested-source",
          sourceLabel: "TEST dataset",
          identifier: "1234567CE7",
          isOfficialSourceEvidence: true,
          ingestionMetadata,
        },
      ],
    });

    expect(dossier.ingestionMetadata).toEqual([ingestionMetadata]);
    expect(getLifecyclePhase(dossier, "gara_pubblicazione").status).toBe(
      "documented",
    );
    expect(dossier.evidence).toContainEqual(
      expect.objectContaining({
        sourceStatus: "official-ingested-source",
        ingestionMetadata,
      }),
    );
  });
});
