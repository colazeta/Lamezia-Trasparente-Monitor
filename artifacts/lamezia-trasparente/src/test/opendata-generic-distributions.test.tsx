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
  });

  it("opens confiscated assets as one dataset with JSON and GeoJSON distributions", () => {
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
    expect(
      screen.getByRole("heading", { name: "Distribuzioni riusabili" }),
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
    expect(
      screen.getByText(/GeoJSON è una distribuzione del dataset/i),
    ).toBeInTheDocument();
  });

  it("publishes the PNRR registry through one stable project distribution", () => {
    render(<Opendata />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Apri scheda dataset Progetti PNRR/i,
      }),
    );

    expect(
      screen.getByRole("heading", { name: /Progetti PNRR - Lamezia Terme/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scarica JSON" })).toHaveAttribute(
      "href",
      "/data/curated/pnrr/lamezia-pnrr-projects.json",
    );
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
});
