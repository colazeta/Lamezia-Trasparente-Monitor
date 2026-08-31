import { fireEvent, render, screen } from "@testing-library/react";
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
          on: (...args: unknown[]) => unknown;
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
            on: (...args: unknown[]) => {
              const eventHandlers = args[0];
              if (
                typeof eventHandlers === "object" &&
                eventHandlers !== null &&
                !Array.isArray(eventHandlers)
              ) {
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
          residenti_per_kmq: 0,
          quota_0_14: null,
          quota_65_piu: null,
          quota_stranieri: null,
          famiglie_totale: 0,
          abitazioni_totali: 2,
          automobili_totale: 0,
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
          residenti_per_kmq: 1000,
          quota_0_14: 30,
          quota_65_piu: 20,
          quota_stranieri: 10,
          famiglie_totale: 4,
          abitazioni_totali: 8,
          automobili_totale: 5,
          auto_per_100_residenti: 50,
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
          residenti_per_kmq: null,
          quota_stranieri: null,
          famiglie_totale: null,
          abitazioni_totali: null,
          automobili_totale: null,
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

const officialMetadata = {
  publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
  sourceInstitution: "ISTAT",
  sourceDataset: "Basi territoriali 2021 e dati per sezioni di censimento 2023",
  sourceYear: "geometrie 2021, indicatori 2023",
  territorialLevel: "sezione di censimento",
  verificationStatus:
    "Processato da fonti ufficiali ISTAT; indicatori pubblici validati contro il tracciato 2023.",
  knownLimits: [
    "Il file ISTAT 2023 aggancia variabili a 2 sezioni su 3; 1 sezione resta geometria ufficiale senza valore indicatore.",
    "Le sezioni urbane catastali Zornade non sono sezioni censuarie.",
  ],
  processingDate: "2026-06-20",
  sourcePages: {
    geometries: "https://www.istat.it/it/archivio/222527",
    variables: "https://www.istat.it/it/archivio/285267",
  },
  qa: {
    populationValueCoverage: {
      totalFeatures: 3,
      availableCount: 2,
      nullCount: 1,
      zeroCount: 1,
    },
  },
};

function stubOfficialFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url === ATLANTE_EXPECTED_GEOJSON_PATH
              ? officialCollection
              : officialMetadata,
          ),
      }),
    ),
  );
}

describe("Atlante territoriale", () => {
  it("loads official GeoJSON metadata when the processed ISTAT files are present", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url === ATLANTE_EXPECTED_GEOJSON_PATH
              ? officialCollection
              : officialMetadata,
          ),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const layer = await loadAtlanteLayer();

    expect(layer.dataStatus).toBe("official");
    expect(layer.loadedFrom).toBe(ATLANTE_EXPECTED_GEOJSON_PATH);
    expect(layer.metadata.verificationStatus).toContain("ISTAT");
    expect(layer.metadata.knownLimits[1]).toContain("Zornade");
    expect(layer.metadata.qa?.populationValueCoverage?.nullCount).toBe(1);
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
    expect(describeAtlanteDistributionPosition(null, summary.bins)).toBe(
      "Dato non disponibile per questa sezione.",
    );
    expect(describeAtlanteDistributionPosition(20, summary.bins)).toContain(
      "fascia alta",
    );
  });

  it("keeps the first-time map flow minimal and opens detail only after selection", async () => {
    const createObjectURL = vi.fn(() => "blob:atlante-map");
    const revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    stubOfficialFetch();

    render(<AtlanteTerritoriale />);

    expect(
      screen.getByRole("heading", { name: "Atlante territoriale" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Scegli un indicatore, poi tocca un’area della mappa."),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("atlante-leaflet-map")).toBeInTheDocument();
    expect(screen.getByTestId("atlante-istat-overlay")).toBeInTheDocument();
    expect(screen.getByText("Tocca un’area per vedere i dati.")).toBeInTheDocument();
    expect(screen.queryByText(/in preparazione/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", { name: /Dettaglio area Atlante/i }),
    ).not.toBeInTheDocument();

    const indicatorSelect = screen.getByRole("combobox", {
      name: "Indicatore mappa",
    });
    expect(indicatorSelect).toHaveValue("popolazione-residente");
    expect(screen.getByText("2 sezioni con dato")).toBeInTheDocument();
    expect(screen.getByText("1 sezione senza dato")).toBeInTheDocument();
    expect(screen.getByText("Fonte e limiti dei dati censuari")).toBeInTheDocument();

    const basemapSelect = screen.getByRole("combobox", { name: "Sfondo mappa" });
    expect(basemapSelect).toHaveValue("none");
    fireEvent.change(basemapSelect, {
      target: { value: "openstreetmap-standard" },
    });
    expect(screen.getByTestId("atlante-osm-tile-layer")).toHaveAttribute(
      "data-url",
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    );
    fireEvent.change(basemapSelect, { target: { value: "none" } });
    expect(screen.queryByTestId("atlante-osm-tile-layer")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pagina intera" }));
    expect(
      screen.getByRole("button", { name: "Esci dalla pagina intera" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(
      screen.getByRole("button", { name: "Esci dalla pagina intera" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Scarica mappa" }));
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:atlante-map");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Nicastro centro .*0791600000198.*0 persone/i,
      }),
    );
    expect(
      screen.getByRole("complementary", { name: /Dettaglio area Atlante/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nicastro centro" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("0 persone").length).toBeGreaterThan(0);
    expect(screen.getByText(/Zero è un valore reale/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Chiudi dettaglio area" }));
    expect(
      screen.queryByRole("complementary", { name: /Dettaglio area Atlante/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Nicastro centro .* apri dati/i }),
    );
    expect(
      screen.getByRole("complementary", { name: /Dettaglio area Atlante/i }),
    ).toBeInTheDocument();

    fireEvent.change(indicatorSelect, { target: { value: "quota-stranieri" } });
    expect(screen.getAllByText("Dato non disponibile").length).toBeGreaterThan(0);
    fireEvent.click(
      screen.getByRole("button", {
        name: /Area censuaria 0199 .*0791600000199.*10%/i,
      }),
    );
    expect(screen.getAllByText("10%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Cerca un’area"));
    const searchbox = screen.getByRole("searchbox", {
      name: "Cerca sezione censuaria",
    });
    fireEvent.change(searchbox, { target: { value: "0204" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Seleziona Area censuaria 0204" }),
    );
    expect(
      screen.getByRole("heading", { name: "Area censuaria 0204" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Dato non disponibile").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Fonte e limiti dei dati censuari"));
    expect(screen.getByText("Fonte dati")).toBeInTheDocument();
    expect(screen.getByText("Come leggere")).toBeInTheDocument();
    expect(screen.getByText("Limiti")).toBeInTheDocument();
    expect(screen.getByText(/non assegna punteggi, classifiche o giudizi/i)).toBeInTheDocument();
    expect(formatAtlanteValue(null, "persone")).toBe("dato non disponibile");
    expect(formatAtlanteValue(0, "persone")).toBe("0 persone");
  }, 30000);

  it("renders an explicit demo fallback without exposing empty roadmap controls", async () => {
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
    expect(await screen.findAllByText(/Dato dimostrativo/i)).not.toHaveLength(0);
    expect(screen.getByTestId("atlante-leaflet-map")).toBeInTheDocument();
    expect(screen.queryByText(/in preparazione/i)).not.toBeInTheDocument();
    expect(screen.getByText("Fonte e limiti dei dati censuari")).toBeInTheDocument();
  });
});