import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
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

vi.mock("react-leaflet", () => {
  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "");

  return {
    MapContainer: ({
      children,
      className,
    }: {
      children?: ReactNode;
      className?: string;
    }) => (
      <div className={className} data-testid="atlante-leaflet-map">
        {children}
      </div>
    ),
    TileLayer: ({
      attribution,
      opacity,
      url,
    }: {
      attribution?: string;
      opacity?: number;
      url?: string;
    }) => (
      <div
        data-opacity={opacity}
        data-testid="atlante-osm-tile-layer"
        data-url={url}
      >
        {stripHtml(attribution ?? "")}
      </div>
    ),
    GeoJSON: ({
      data,
      onEachFeature,
    }: {
      data?: { features?: Array<Record<string, unknown>> };
      onEachFeature?: (
        feature: Record<string, unknown>,
        layer: {
          bindTooltip: (content: string) => unknown;
          on: (handlers: Record<string, () => void> | string) => unknown;
        },
      ) => void;
    }) => (
      <div data-testid="atlante-istat-overlay">
        {(data?.features ?? []).map((feature) => {
          const handlers: Record<string, () => void> = {};
          const sectionId = String(
            (feature.properties as { sezione_censimento_id?: string })
              ?.sezione_censimento_id ?? "sezione non identificata",
          );
          let tooltip = sectionId;
          const layer = {
            bindTooltip: (content: string) => {
              tooltip = content;
              return layer;
            },
            on: (eventHandlers: Record<string, () => void> | string) => {
              if (typeof eventHandlers === "object") {
                Object.assign(handlers, eventHandlers);
              }
              return layer;
            },
          };
          onEachFeature?.(feature, layer);

          return (
            <button
              aria-label={stripHtml(tooltip)}
              key={sectionId}
              onClick={() => handlers.click?.()}
              onMouseEnter={() => handlers.mouseover?.()}
              onMouseLeave={() => handlers.mouseout?.()}
              type="button"
            >
              {sectionId}
            </button>
          );
        })}
      </div>
    ),
    useMap: () => ({
      fitBounds: vi.fn(),
      invalidateSize: vi.fn(),
    }),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
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
    expect(summary.sum).toBe(50);
    expect(summary.mean).toBe(12.5);
    expect(summary.median).toBe(15);
    expect(summary.bins.reduce((total, bin) => total + bin.count, 0)).toBe(4);
    expect(summary.bins[0].count).toBeGreaterThan(0);
    expect(describeAtlanteDistributionPosition(null, summary.bins)).toBe(
      "Dato non disponibile per questa sezione.",
    );
    expect(describeAtlanteDistributionPosition(20, summary.bins)).toContain(
      "fascia alta",
    );
  });

  it("shows the clean map explorer and keeps null values distinct from zero", async () => {
    const createObjectURL = vi.fn(() => "blob:atlante-map");
    const revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const officialCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            sezione_censimento_id: "0791600000198",
            area_territoriale: "Nicastro centro",
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
            sezione_censimento_id: "0791600000199",
            matched_istat_2023_variables: true,
            indicators_istat_2023: {
              p1: 10,
              popolazione_totale: 10,
            },
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [16.32, 38.9],
                [16.33, 38.9],
                [16.33, 38.91],
                [16.32, 38.91],
                [16.32, 38.9],
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
                      "Il file ISTAT 2023 aggancia variabili a 2 sezioni su 3; 1 sezione resta geometria ufficiale senza valore indicatore.",
                    ],
                    processingDate: "2026-06-20",
                    qa: {
                      indicatorDictionaryPath:
                        "data/processed/territorio/istat_indicator_dictionary.json",
                      populationValueCoverage: {
                        totalFeatures: 3,
                        availableCount: 2,
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

    const mapHeading = await screen.findByRole("heading", {
      name: "Mappa",
    });
    const summaryHeading = screen.getByRole("heading", {
      name: /Sintesi citt/i,
    });

    expect(
      mapHeading.compareDocumentPosition(summaryHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("Distribuzione")).not.toBeInTheDocument();
    expect(screen.queryByText("Fonti e limiti")).not.toBeInTheDocument();
    expect(screen.queryByText(/File atteso/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("atlante-leaflet-map")).toBeInTheDocument();
    expect(screen.getByTestId("atlante-istat-overlay")).toBeInTheDocument();
    expect(screen.getByText("Contesto mappa")).toBeInTheDocument();
    expect(screen.getByText("Esplora e confronta")).toBeInTheDocument();
    expect(screen.getByText("Copertura dati")).toBeInTheDocument();
    expect(
      screen.getByText("2 sezioni con dato · 1 sezione senza dato"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nessuna area selezionata")).toBeInTheDocument();
    expect(screen.getByText("Strade · OpenStreetMap")).toBeInTheDocument();
    expect(screen.getByTestId("atlante-osm-tile-layer")).toHaveAttribute(
      "data-url",
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    );
    expect(screen.getByTestId("atlante-osm-tile-layer")).toHaveTextContent(
      "OpenStreetMap contributors",
    );
    expect(
      screen.getByRole("button", { name: /Reimposta vista/i }),
    ).toBeInTheDocument();
    const basemapSelect = screen.getByRole("combobox", {
      name: /Sfondo mappa/i,
    });
    expect(basemapSelect).toHaveValue("openstreetmap-standard");
    fireEvent.change(basemapSelect, {
      target: { value: "esri-world-imagery" },
    });
    expect(
      screen.getByText("Aerea · Immagini satellitari"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("atlante-osm-tile-layer")).toHaveAttribute(
      "data-url",
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    );
    expect(screen.getByTestId("atlante-osm-tile-layer")).toHaveTextContent(
      "Esri",
    );
    fireEvent.change(basemapSelect, { target: { value: "none" } });
    expect(screen.getByText("Senza sfondo")).toBeInTheDocument();
    expect(
      screen.queryByTestId("atlante-osm-tile-layer"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("atlante-istat-overlay")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Scarica mappa/i }));
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:atlante-map");
    expect(screen.getByLabelText("Indicatore")).toBeInTheDocument();
    expect(screen.getAllByText("Popolazione").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Popolazione residente").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("button", { name: /Età in preparazione/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Cittadinanza in preparazione/i }),
    ).toBeDisabled();
    expect(
      screen.getByText("Popolazione totale nelle sezioni con P1 disponibile"),
    ).toBeInTheDocument();
    expect(screen.getByText("10 persone")).toBeInTheDocument();
    expect(screen.getByText("Sezioni totali")).toBeInTheDocument();
    expect(screen.getByText("3 (100%)")).toBeInTheDocument();
    expect(screen.getByText("Con dato P1")).toBeInTheDocument();
    expect(screen.getByText("2 (66,7%)")).toBeInTheDocument();
    expect(screen.getAllByText("Dato non disponibile").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("1 (33,3%)").length).toBe(2);
    expect(screen.getByText("Valore 0")).toBeInTheDocument();
    expect(screen.getByText("Distribuzione per fasce")).toBeInTheDocument();
    expect(screen.getByText("2 classi")).toBeInTheDocument();
    expect(screen.getAllByText(/1 sezione · 50%/).length).toBe(2);
    expect(screen.getAllByText(/dato non disponibile/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("heading", { name: "Nessuna sezione selezionata" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Seleziona una sezione sulla mappa per vedere i dati disponibili.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Nicastro centro .*0791600000198.*0 persone/i,
      }),
    );
    let profile = screen.getByText("Sezione selezionata").closest("section");
    expect(profile).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Nicastro centro" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Nicastro centro").length).toBeGreaterThan(1);
    expect(
      screen.getByText("Sezione censuaria ISTAT: 0791600000198"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("0 persone").length).toBeGreaterThan(0);
    expect(screen.getByText(/Zero .* valore reale/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Area censuaria 0204 .*0791600000204.*dato non disponibile/i,
      }),
    );
    profile = screen.getByText("Sezione selezionata").closest("section");
    expect(profile).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Area censuaria 0204" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sezione censuaria ISTAT: 0791600000204"),
    ).toBeInTheDocument();
    expect(
      within(profile as HTMLElement).getAllByText("Popolazione residente"),
    ).toHaveLength(1);
    expect(screen.getByText("Fonte dati")).toBeInTheDocument();
    expect(screen.getByText("Come leggere")).toBeInTheDocument();
    expect(screen.getByText("Cosa non mostra")).toBeInTheDocument();
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
    expect(screen.getAllByText("Popolazione").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/in preparazione/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Fonte dati")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Le sezioni catastali Zornade restano un livello accessorio/non censuario e non sono usate come base della mappa.",
        {
          exact: false,
        },
      ),
    ).toBeInTheDocument();
  });
});
