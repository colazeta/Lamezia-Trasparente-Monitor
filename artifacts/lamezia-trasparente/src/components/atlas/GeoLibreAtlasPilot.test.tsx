import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GeoLibreAtlasPilot } from "./GeoLibreAtlasPilot";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GeoLibre Atlas pilot", () => {
  it("renders only the feeds that pass the availability check", async () => {
    const fetcher: typeof fetch = async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      const isCensusLayer = url.endsWith(
        "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
      );

      return new Response(null, {
        status: isCensusLayer ? 200 : 503,
        headers: {
          "content-type": isCensusLayer
            ? "application/geo+json; charset=utf-8"
            : "application/json; charset=utf-8",
        },
      });
    };
    vi.stubGlobal("fetch", vi.fn(fetcher));

    render(<GeoLibreAtlasPilot />);

    expect(
      await screen.findByText(/Copertura GeoLibre: 1 di 3 layer disponibili/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Confine comunale — HTTP 503/)).toBeInTheDocument();
    expect(screen.getByText(/Beni confiscati — HTTP 503/)).toBeInTheDocument();

    const iframe = screen.getByTitle(
      "Atlante territoriale — viewer GeoLibre sperimentale",
    );
    const viewerUrl = new URL(iframe.getAttribute("src") ?? "");
    expect(viewerUrl.searchParams.getAll("data")).toEqual([
      `${window.location.origin}/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`,
    ]);
  });
});
