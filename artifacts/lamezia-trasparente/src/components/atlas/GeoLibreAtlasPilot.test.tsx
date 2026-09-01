import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GeoLibreAtlasPilot } from "./GeoLibreAtlasPilot";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GeoLibre Atlas pilot", () => {
  it("renders only the feeds that pass the availability check", async () => {
    const fetcher: typeof fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/spatial_layer_manifest.json")) {
        expect(init?.method).toBe("GET");
        return Response.json(
          {
            schema_version: "1.0",
            generated_at: "2026-09-01T18:00:00.000Z",
            scope: { municipality: "Lamezia Terme", istat_code: "079160" },
            publication_policy: "default-deny",
            layers: [
              {
                layer_id: "municipal-boundary",
                primary_data_path:
                  "/data/processed/territorio/lamezia_confine_comunale.geojson",
                data_path:
                  "/data/processed/territorio/lamezia_confine_comunale.geojson",
                distribution_role: "primary",
                media_type: "application/geo+json",
                distribution_status: "published",
                content_status: "populated",
                feature_count: 1,
                excluded_feature_count: 0,
                sha256: "a".repeat(64),
                source_label: "OSM",
                licence: "ODbL 1.0",
                source_modified: null,
                publication_note: "test",
              },
              {
                layer_id: "census-sections",
                primary_data_path:
                  "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
                data_path:
                  "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
                distribution_role: "primary",
                media_type: "application/geo+json",
                distribution_status: "published",
                content_status: "populated",
                feature_count: 317,
                excluded_feature_count: 0,
                sha256: "b".repeat(64),
                source_label: "ISTAT",
                licence: "CC BY 4.0",
                source_modified: "2023",
                publication_note: "test",
              },
              {
                layer_id: "confiscated-assets",
                primary_data_path: "/api/beni-confiscati/geojson",
                data_path:
                  "/data/processed/territorio/beni_confiscati_lamezia.geojson",
                distribution_role: "continuity_fallback",
                media_type: "application/geo+json",
                distribution_status: "published",
                content_status: "empty_by_policy",
                feature_count: 0,
                excluded_feature_count: 340,
                sha256: "c".repeat(64),
                source_label: "ANBSC",
                licence: "IODL 2.0",
                source_modified: "2026-09-02 04:00:00",
                publication_note:
                  "Le coordinate comunali non sono posizioni dei singoli beni.",
              },
            ],
          },
          { headers: { "content-type": "application/json" } },
        );
      }

      expect(init?.method).toBe("HEAD");

      if (url.endsWith("/api/beni-confiscati/geojson")) {
        return new Response(null, {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(null, {
        status: 200,
        headers: {
          "content-type": "application/geo+json; charset=utf-8",
        },
      });
    };
    vi.stubGlobal("fetch", vi.fn(fetcher));

    render(<GeoLibreAtlasPilot />);

    expect(
      await screen.findByText(/Copertura GeoLibre: 3 di 3 layer disponibili/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Snapshot statici pubblicati: 3 di 3; 2 con geometrie/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fallback statico di continuità attivo/),
    ).toBeInTheDocument();
    expect(screen.getByText(/feed primario HTTP 503/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Beni confiscati — 0 feature pubblicate; 340 record esclusi/,
      ),
    ).toBeInTheDocument();

    const iframe = screen.getByTitle(
      "Atlante territoriale — viewer GeoLibre sperimentale",
    );
    const viewerUrl = new URL(iframe.getAttribute("src") ?? "");
    expect(viewerUrl.searchParams.getAll("data")).toEqual([
      `${window.location.origin}/data/processed/territorio/lamezia_confine_comunale.geojson`,
      `${window.location.origin}/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`,
      `${window.location.origin}/data/processed/territorio/beni_confiscati_lamezia.geojson`,
    ]);
  });
});
