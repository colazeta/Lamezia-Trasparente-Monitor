import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtlanteTerritoriale } from "../pages/AtlanteTerritoriale";
import {
  ATLANTE_EXPECTED_GEOJSON_PATH,
  ATLANTE_EXPECTED_METADATA_PATH,
  buildAtlanteDistribution,
  describeAtlanteDistributionPosition,
  formatAtlanteValue,
  loadAtlanteLayer,
} from "../data/atlanteTerritoriale";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Atlante territoriale", () => {
  it("loads official GeoJSON metadata when the processed ISTAT files are present", async () => {
    const officialCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            sezione_censimento_id: "0791600000001",
            indicators_istat_2023: {
              popolazione_totale: 284,
            },
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [16.3, 38.9],
                [16.31, 38.9],
                [16.31, 38.91],
                [16.3, 38.91],
                [16.3, 38.9],
              ],
            ],
          },
        },
      ],
    };

    const fetchMock = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url === ATLANTE_EXPECTED_GEOJSON_PATH
              ? officialCollection
              : {
                  publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
                  sourceInstitution: "ISTAT",
                  sourceDataset:
                    "Basi territoriali 2021 e dati per sezioni di censimento 2023",
                  sourceYear: "geometrie 2021, indicatori 2023",
                  territorialLevel: "sezione di censimento",
                  verificationStatus:
                    "Processato da fonti ufficiali ISTAT; indicatore popolazione validato sul campo P1.",
                  knownLimits: [
                    "Il file ISTAT 2023 aggancia variabili a 246 sezioni su 317; le 71 sezioni rimanenti restano geometrie ufficiali senza valore indicatore.",
                    "Le sezioni urbane catastali Zornade non sono sezioni censuarie.",
                  ],
                  processingDate: "2026-06-20",
                  qa: {
                    populationValueCoverage: {
                      totalFeatures: 317,
                      availableCount: 246,
                      nullCount: 71,
                      zeroCount: 22,
                    },
                  },
                },
          ),
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const layer = await loadAtlanteLayer();

    expect(layer.dataStatus).toBe("official");
    expect(layer.loadedFrom).toBe(ATLANTE_EXPECTED_GEOJSON_PATH);
    expect(layer.metadata.verificationStatus).toContain("P1");
    expect(layer.metadata.knownLimits[0]).toContain("246");
    expect(layer.metadata.knownLimits[1]).toContain("Zornade");
    expect(layer.metadata.qa?.populationValueCoverage?.nullCount).toBe(71);
    expect(fetchMock).toHaveBeenCalledWith(ATLANTE_EXPECTED_METADATA_PATH, {
      cache: "no-store",
    });
  });

  it("computes distribution bins while keeping null and zero distinct", () => {
    const summary = buildAtlanteDistribution([0, 10, 20, null, 20], 3);

    expect(summary.totalCount).toBe(5);
    expect(summary.availableCount).toBe(4);
    expect(summary.missingCount).toBe(1);
    expect(summary.zeroCount).toBe(1);
    expect(summary.bins.reduce((total, bin) => total + bin.count, 0)).toBe(4);
    expect(summary.bins[0].count).toBeGreaterThan(0);
    expect(describeAtlanteDistributionPosition(null, summary.bins)).toBe(
      "Dato non disponibile per questa sezione.",
    );
    expect(describeAtlanteDistributionPosition(20, summary.bins)).toContain(
      "fascia alta",
    );
  });

  it("shows the distribution-first explorer and keeps null values distinct from zero", async () => {
    const officialCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            sezione_censimento_id: "0791600000198",
            matched_istat_2023_variables: true,
            indicators_istat_2023: {
              p1: 0,
              popolazione_totale: 0,
            },
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [16.3, 38.9],
                [16.31, 38.9],
                [16.31, 38.91],
                [16.3, 38.91],
                [16.3, 38.9],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            sezione_censimento_id: "0791600000204",
            matched_istat_2023_variables: false,
            indicators_istat_2023: {
              p1: null,
              popolazione_totale: null,
            },
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [16.31, 38.9],
                [16.32, 38.9],
                [16.32, 38.91],
                [16.31, 38.91],
                [16.31, 38.9],
              ],
            ],
          },
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url === ATLANTE_EXPECTED_GEOJSON_PATH
                ? officialCollection
                : {
                    publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
                    sourceInstitution: "ISTAT",
                    sourceDataset:
                      "Basi territoriali 2021 e dati per sezioni di censimento 2023",
                    sourceYear: "geometrie 2021, indicatori 2023",
                    territorialLevel: "sezione di censimento",
                    verificationStatus:
                      "Processato da fonti ufficiali ISTAT; indicatore popolazione validato sul campo P1.",
                    knownLimits: [
                      "Il file ISTAT 2023 aggancia variabili a 1 sezioni su 2; 1 sezione resta geometria ufficiale senza valore indicatore.",
                    ],
                    processingDate: "2026-06-20",
                    qa: {
                      indicatorDictionaryPath:
                        "data/processed/territorio/istat_indicator_dictionary.json",
                      populationValueCoverage: {
                        totalFeatures: 2,
                        availableCount: 1,
                        nullCount: 1,
                        zeroCount: 1,
                      },
                    },
                  },
            ),
        }),
      ),
    );

    render(<AtlanteTerritoriale />);

    expect(
      await screen.findByRole("heading", { name: "Popolazione residente" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Distribuzione")).toBeInTheDocument();
    expect(screen.getByText("Mappa")).toBeInTheDocument();
    expect(
      screen.getByText(/1 sezioni con dato/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/dato non disponibile/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("0 persone")).toBeInTheDocument();
    expect(screen.getByText("Fonti e limiti")).toBeInTheDocument();
    expect(formatAtlanteValue(null, "persone")).toBe("dato non disponibile");
    expect(formatAtlanteValue(0, "persone")).toBe("0 persone");
  });

  it("renders an explicit demo fallback when the processed ISTAT file is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    render(<AtlanteTerritoriale />);

    expect(
      screen.getByRole("heading", { name: "Atlante territoriale" }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText(/Dato dimostrativo/i)).not.toHaveLength(
      0,
    );
    expect(
      screen.getAllByText(/non contiene sezioni censuarie reali/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("popolazione")).toBeInTheDocument();
    expect(
      screen.getAllByText("Indicatore in preparazione").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Fonti e limiti")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Le sezioni urbane catastali Zornade non sono sezioni censuarie e restano fuori da questa base.",
        {
          exact: false,
        },
      ),
    ).toBeInTheDocument();
  });
});
