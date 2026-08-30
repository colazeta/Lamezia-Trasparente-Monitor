import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PopulationStructurePanel } from "@/components/demographics/PopulationStructurePanel";

const payload = {
  geography: { code: "079160", name: "Lamezia Terme", level: "municipality" },
  period: "2026",
  availablePeriods: ["2024", "2025", "2026"],
  sourceStatus: "estimated",
  source: { name: "ISTAT", dataset: "22_289", url: "https://esploradati.istat.it" },
  counts: { total: 67000, male: 32500, female: 34500 },
  bands: [
    { key: "0-14", count: 8500, share: 12.7 },
    { key: "15-64", count: 43000, share: 64.2 },
    { key: "65+", count: 15500, share: 23.1 },
    { key: "80+", count: 4600, share: 6.9 },
  ],
  indicators: {
    ageingIndex: 182.4,
    structuralDependency: 55.8,
    elderlyDependency: 36,
    youthDependency: 19.8,
  },
  pyramid: [
    { ageGroup: "0–4", from: 0, to: 4, male: 1200, female: 1150, total: 2350 },
    { ageGroup: "5–9", from: 5, to: 9, male: 1300, female: 1250, total: 2550 },
    { ageGroup: "100+", from: 100, to: null, male: 7, female: 20, total: 27 },
  ],
  quality: {
    sexReconciliationDifference: 0,
    ageReconciliationDifference: 0,
    exactSexReconciliation: true,
    exactAgeReconciliation: true,
  },
  methodology: {
    referencePeriod: "Popolazione al 1 gennaio.",
    ageBands: "Classi sommate dalle singole età.",
    ageingIndex: "65+ / 0-14 x 100",
    structuralDependency: "(0-14 + 65+) / 15-64 x 100",
    elderlyDependency: "65+ / 15-64 x 100",
    youthDependency: "0-14 / 15-64 x 100",
    pyramid: "Classi quinquennali; 100+ resta aperta.",
    temporalBreak: "2002–2018 ricostruito; dal 2019 Censimento permanente.",
    quality: "Il totale è confrontato con sesso ed età.",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PopulationStructurePanel", () => {
  it("renders the pyramid context, exact bands and estimated source status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationStructurePanel />);

    expect(
      await screen.findByRole("heading", { name: "Chi vive a Lamezia" }),
    ).toBeInTheDocument();
    expect(screen.getByText("stima")).toBeInTheDocument();
    expect(screen.getByText("12,7%")).toBeInTheDocument();
    expect(screen.getByText("23,1%")).toBeInTheDocument();
    expect(screen.getByText("182,4")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Piramide della popolazione di Lamezia Terme al 1° gennaio 2026/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("quadratura esatta")).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/demographics/structure");
  });

  it("requests a selected historical year without changing the latest alias", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationStructurePanel />);
    await screen.findByRole("heading", { name: "Chi vive a Lamezia" });

    fireEvent.change(screen.getByLabelText("Anno della struttura demografica"), {
      target: { value: "2025" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/demographics/structure?period=2025",
      );
    });
  });
});
