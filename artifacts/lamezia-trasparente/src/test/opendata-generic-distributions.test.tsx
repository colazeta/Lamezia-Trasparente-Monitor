import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Opendata } from "../pages/Opendata";

vi.mock("@workspace/api-client-react", () => ({
  useListOpendataDatasets: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useGetOpendataFeedStatus: vi.fn(() => ({
    data: {
      lastUpdatedAt: "2026-09-02T08:00:00Z",
      itemsTotal: 0,
      url: "https://opendata.comune.lamezia-terme.cz.it",
    },
  })),
}));

describe("OpenData generic canonical distributions", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/opendata");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("beni_confiscati_lamezia_pilot.json")) {
          return {
            ok: true,
            json: async () => ({
              records: [
                { status: "riutilizzato" },
                { status: "riutilizzato" },
                { status: "in_verifica" },
              ],
            }),
          } as Response;
        }
        if (url.includes("lamezia-pnrr-projects.json")) {
          return {
            ok: true,
            json: async () => ({
              projects: [
                { mission: "M1 - Digitalizzazione" },
                { mission: "M1 - Digitalizzazione" },
                { mission: "M5 - Inclusione" },
              ],
            }),
          } as Response;
        }
        if (url.includes("istat_sezioni_censimento_lamezia.geojson")) {
          return {
            ok: true,
            json: async () => ({
              features: [
                { properties: { matched_istat_2023_variables: true } },
                { properties: { matched_istat_2023_variables: true } },
                { properties: { matched_istat_2023_variables: false } },
              ],
            }),
          } as Response;
        }
        return { ok: false, json: async () => ({}) } as Response;
      }),
    );
  });

  it("opens confiscated assets with a chart, one primary download and secondary formats", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Beni confiscati documentati/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /Beni confiscati documentati - Lamezia Terme/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scarica dati" })).toHaveAttribute(
      "href",
      "/data/curated/territorio/beni_confiscati_lamezia_pilot.json",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Beni documentati per stato di riuso",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Altri formati e riuso" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scarica JSON" })).toHaveAttribute(
      "href",
      "/data/curated/territorio/beni_confiscati_lamezia_pilot.json",
    );
    expect(
      screen.getByRole("link", { name: "Scarica GeoJSON" }),
    ).toHaveAttribute(
      "href",
      "/data/processed/territorio/beni_confiscati_lamezia.geojson",
    );
    expect(
      screen.getByText(/deliberatamente incompleto/i),
    ).toBeInTheDocument();
  });

  it("publishes the PNRR registry with a mission chart and simple download", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Progetti PNRR/i,
      }),
    );

    expect(
      screen.getByRole("heading", { name: /Progetti PNRR - Lamezia Terme/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scarica dati" })).toHaveAttribute(
      "href",
      "/data/curated/pnrr/lamezia-pnrr-projects.json",
    );
    expect(
      await screen.findByRole("heading", { name: "Progetti per missione PNRR" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Apri la fonte primaria/i }),
    ).toHaveAttribute(
      "href",
      "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
    );
    expect(
      screen.getByText(/non implica completezza rispetto all'intero universo nazionale/i),
    ).toBeInTheDocument();
  });

  it("shows the census coverage chart and downloads the GeoJSON directly", async () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Sezioni di censimento ISTAT 2023/i,
      }),
    );

    expect(screen.getByRole("link", { name: "Scarica dati" })).toHaveAttribute(
      "href",
      "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Copertura degli indicatori ISTAT 2023",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Con indicatori")).toBeInTheDocument();
    expect(screen.getByText("Solo geometria")).toBeInTheDocument();
  });
});
