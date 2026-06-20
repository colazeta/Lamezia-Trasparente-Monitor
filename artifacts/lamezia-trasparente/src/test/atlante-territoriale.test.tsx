import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtlanteTerritoriale } from "../pages/AtlanteTerritoriale";
import {
  ATLANTE_EXPECTED_GEOJSON_PATH,
  ATLANTE_EXPECTED_METADATA_PATH,
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
                    "Le sezioni urbane catastali Zornade non sono sezioni censuarie.",
                  ],
                  processingDate: "2026-06-20",
                },
          ),
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const layer = await loadAtlanteLayer();

    expect(layer.dataStatus).toBe("official");
    expect(layer.loadedFrom).toBe(ATLANTE_EXPECTED_GEOJSON_PATH);
    expect(layer.metadata.verificationStatus).toContain("P1");
    expect(layer.metadata.knownLimits[0]).toContain("Zornade");
    expect(fetchMock).toHaveBeenCalledWith(ATLANTE_EXPECTED_METADATA_PATH, {
      cache: "no-store",
    });
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
      screen.getByText(/non contiene sezioni censuarie reali/i),
    ).toBeInTheDocument();
    expect(screen.getByText("popolazione")).toBeInTheDocument();
    expect(
      screen.getAllByText("Indicatore in preparazione").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Fonte istituzionale")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Layer Zornade resta un livello accessorio/non censuario",
        {
          exact: false,
        },
      ),
    ).toBeInTheDocument();
  });
});
