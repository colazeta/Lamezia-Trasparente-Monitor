import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe, { type Result, type RunOptions } from "axe-core";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="leaflet-map">{children}</div>
  ),
  GeoJSON: () => <div data-testid="census-geojson" />,
  TileLayer: () => null,
  useMap: () => ({
    fitBounds: vi.fn(),
    getZoom: () => 12,
    invalidateSize: vi.fn(),
    setView: vi.fn(),
  }),
}));

vi.mock("@/components/atlas/MunicipalBoundaryAtlasLayer", () => ({
  useMunicipalBoundaryAtlasLayer: () => ({
    status: "ready",
    collection: { type: "FeatureCollection", features: [] },
    message: null,
  }),
  MunicipalBoundaryAtlasLayer: () => <div data-testid="municipal-boundary" />,
}));

vi.mock("@/components/atlas/ConfiscatedAssetsAtlasLayer", () => ({
  useConfiscatedAssetsAtlasLayer: () => ({
    status: "idle",
    collection: null,
    message: null,
  }),
  getConfiscatedAssetsCoverageLabel: () => null,
  ConfiscatedAssetsAtlasLayer: () => <div data-testid="confiscated-assets" />,
}));

vi.mock("@/data/atlanteTerritoriale", async () => {
  const actual = await vi.importActual<
    typeof import("@/data/atlanteTerritoriale")
  >("@/data/atlanteTerritoriale");

  return {
    ...actual,
    loadAtlanteLayer: vi.fn(async () => ({
      dataStatus: "official" as const,
      loadedFrom: "test",
      metadata: {
        datasetStatus: "official" as const,
        publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
        sourceInstitution: "ISTAT",
        sourceDataset: "Basi territoriali 2021 e dati censuari 2023",
        sourceYear: "geometrie 2021, indicatori 2023",
        territorialLevel: "sezione di censimento",
        verificationStatus: "Fixture di test",
        knownLimits: ["Fixture di test"],
        processingDate: "2026-08-31T00:00:00.000Z",
      },
      collection: {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            geometry: {
              type: "Polygon" as const,
              coordinates: [
                [
                  [16.3, 38.97],
                  [16.31, 38.97],
                  [16.31, 38.98],
                  [16.3, 38.98],
                  [16.3, 38.97],
                ],
              ],
            },
            properties: {
              sezione_censimento_id: "0791600000001",
              indicators_istat_2023: {
                popolazione_totale: 100,
                quota_65_piu: 20,
              },
            },
          },
          {
            type: "Feature" as const,
            geometry: {
              type: "Polygon" as const,
              coordinates: [
                [
                  [16.31, 38.97],
                  [16.32, 38.97],
                  [16.32, 38.98],
                  [16.31, 38.98],
                  [16.31, 38.97],
                ],
              ],
            },
            properties: {
              sezione_censimento_id: "0791600000002",
              indicators_istat_2023: {
                popolazione_totale: 0,
                quota_65_piu: null,
              },
            },
          },
        ],
      },
    })),
  };
});

import { AtlanteTerritoriale } from "@/pages/AtlanteTerritorialeExplorer";

const RUN_OPTIONS: RunOptions = {
  resultTypes: ["violations"],
  rules: {
    "color-contrast": { enabled: false },
  },
};

function blockingViolations(results: Awaited<ReturnType<typeof axe.run>>) {
  return results.violations.filter((violation: Result) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
}

async function renderLoadedAtlas(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const result = render(<AtlanteTerritoriale />);
  await screen.findByText("Consulta i dati senza mappa");
  return result;
}

beforeEach(() => {
  window.history.replaceState({}, "", "/atlante-territoriale");
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
  window.history.replaceState({}, "", "/");
});

describe.sequential("Atlante territorial accessibility baseline", () => {
  for (const theme of ["light", "dark"] as const) {
    it.sequential(`has no serious or critical axe violations in ${theme} mode`, async () => {
      const { container } = await renderLoadedAtlas(theme);
      fireEvent.click(screen.getByText("Consulta i dati senza mappa"));

      const results = await axe.run(container, RUN_OPTIONS);
      expect(blockingViolations(results)).toEqual([]);
    });
  }

  it("keeps census-only controls aligned with census layer visibility", async () => {
    await renderLoadedAtlas("light");

    expect(screen.getByLabelText("Indicatore della mappa censuaria")).toBeTruthy();
    expect(screen.getByLabelText("Scarica mappa censuaria in SVG")).toBeTruthy();
    expect(screen.getByText("Consulta i dati senza mappa")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Livello Sezioni censuarie"));

    await waitFor(() => {
      expect(
        screen.queryByLabelText("Indicatore della mappa censuaria"),
      ).toBeNull();
    });
    expect(screen.queryByLabelText("Scarica mappa censuaria in SVG")).toBeNull();
    expect(screen.queryByText("Consulta i dati senza mappa")).toBeNull();
    expect(
      screen.getByText("Attiva “Sezioni censuarie” per visualizzare gli indicatori ISTAT."),
    ).toBeTruthy();
  });
});
