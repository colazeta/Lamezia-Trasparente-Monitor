import { describe, expect, it } from "vitest";
import type { PnrrProject } from "@workspace/api-client-react";

import {
  buildCantieriometroCards,
  filterCantieriometroCards,
  type CantieriometroFilters,
} from "@/lib/cantieriometro";

function project(overrides: Partial<PnrrProject>): PnrrProject {
  return {
    id: 1,
    key: "pnrr-1",
    sourceId: "source-1",
    projectSourceUrl: "https://example.test/progetti.csv",
    locationSourceUrl: "https://example.test/localizzazione.csv",
    importSourceLabel: "Dataset ufficiale",
    importSourceUrl: "https://example.test/progetti.csv",
    importSourceStatus: null,
    importSourceError: null,
    url: null,
    title: "Riqualificazione edificio pubblico",
    cup: "C11B22000000001",
    mission: "M5 Inclusione",
    component: "C2 Infrastrutture sociali",
    investment: "Investimento 2.1",
    intervention: null,
    holder: "Comune di Lamezia Terme",
    attuatore: "Comune di Lamezia Terme",
    importoFinanziato: 250_000,
    status: "In corso",
    startDate: null,
    endDate: null,
    publishedAt: "2024-01-10",
    lastUpdatedAt: "2025-01-15",
    location: "Lamezia Terme",
    locationQuality: "ufficiale",
    locationNote: "Localizzazione da dataset territoriale ufficiale.",
    trasparenzaCompleta: true,
    aggiornamentoVecchio: false,
    attachments: [],
    documentsCount: 1,
    lastPublication: "2025-01-20",
    documents: [
      {
        id: 10,
        progressivo: "10/2025",
        tipologia: "Determinazione",
        category: "Determine",
        oggetto: "Determina collegata al CUP",
        pubStart: "2025-01-20",
        pubEnd: null,
        cups: ["C11B22000000001"],
        pnrrMission: null,
        isPnrr: true,
        attachments: [],
        isNew: false,
        firstSeenAt: "2025-01-20",
        macrotema: "altro",
      },
    ],
    linkedContracts: [
      {
        relationKey: "CUP",
        relationValue: "C11B22000000001",
        relationNote: "Collegamento documentale tramite CUP.",
        contract: {
          id: 99,
          title: "Affidamento lavori",
          description: "Lavori collegati al progetto PNRR.",
          status: "Aggiudicato",
          cig: "A000000000",
          cup: "C11B22000000001",
          supplier: "Impresa esempio",
          amount: 100_000,
          procedureType: "Affidamento diretto",
          awardDate: "2025-01-22",
          anacUrl: null,
        },
      },
    ],
    ...overrides,
  };
}

const allFilters: CantieriometroFilters = {
  amount: "all",
  cup: "all",
  linkedActs: "all",
  location: "all",
  freshness: "all",
};

describe("Cantieriometro bridge", () => {
  it("maps PNRR projects to civic work/intervention cards without adding external data", () => {
    const [card] = buildCantieriometroCards([
      project({ intervention: "Palestra scolastica", documentsCount: 0 }),
    ]);

    expect(card).toMatchObject({
      title: "Palestra scolastica",
      cup: "C11B22000000001",
      amount: 250_000,
      location: "Lamezia Terme",
      locationQuality: "ufficiale",
      projectStatus: "In corso",
      linkedActsCount: 1,
      linkedContractsCount: 1,
      lastUpdatedAt: "2025-01-15",
      hasCup: true,
      hasLinkedActs: true,
      hasLocation: true,
      needsDataVerification: false,
    });
  });

  it("marks missing or old documentary data as verification needs", () => {
    const [card] = buildCantieriometroCards([
      project({
        cup: null,
        importoFinanziato: null,
        location: null,
        locationQuality: "non_disponibile",
        locationNote: "Localizzazione non disponibile nel dato importato.",
        lastUpdatedAt: null,
        lastPublication: null,
        publishedAt: null,
        aggiornamentoVecchio: true,
        documents: [],
        documentsCount: 0,
        linkedContracts: [],
      }),
    ]);

    expect(card.hasCup).toBe(false);
    expect(card.amount).toBeNull();
    expect(card.hasLocation).toBe(false);
    expect(card.hasLinkedActs).toBe(false);
    expect(card.linkedContractsCount).toBe(0);
    expect(card.needsDataVerification).toBe(true);
  });

  it("filters cards by amount, CUP, linked acts, location and freshness", () => {
    const cards = buildCantieriometroCards([
      project({ id: 1, key: "a", importoFinanziato: 1_200_000 }),
      project({
        id: 2,
        key: "b",
        cup: null,
        importoFinanziato: 80_000,
        location: null,
        locationQuality: "non_disponibile",
        documents: [],
        documentsCount: 0,
        aggiornamentoVecchio: true,
      }),
    ]);

    expect(
      filterCantieriometroCards(cards, {
        ...allFilters,
        amount: "over-1m",
        cup: "yes",
        linkedActs: "yes",
        location: "available",
        freshness: "updated",
      }).map((card) => card.projectId),
    ).toEqual([1]);

    expect(
      filterCantieriometroCards(cards, {
        ...allFilters,
        amount: "under-100k",
        cup: "no",
        linkedActs: "no",
        location: "missing",
        freshness: "verify",
      }).map((card) => card.projectId),
    ).toEqual([2]);
  });
});
