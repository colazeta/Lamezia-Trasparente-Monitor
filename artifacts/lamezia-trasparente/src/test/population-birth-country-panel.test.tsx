import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PopulationBirthCountryPanel } from "@/components/demographics/PopulationBirthCountryPanel";

const payload = {
  geography: { code: "079160", name: "Lamezia Terme", level: "municipality" },
  period: "2025",
  availablePeriods: ["2002", "2024", "2025"],
  sourceStatus: "final",
  counts: {
    population: 1000,
    bornInItaly: 600,
    bornAbroad: 400,
    bornAbroadShare: 40,
    male: 490,
    female: 510,
  },
  topBirthCountries: [
    { code: "201", name: "Albania", total: 150, male: 80, female: 70, shareOfBornAbroad: 37.5 },
    { code: "235", name: "Romania", total: 100, male: 45, female: 55, shareOfBornAbroad: 25 },
  ],
  quality: { sourceCountryTotal: 1000, independentPopulation: 1000, coverageDifference: 0 },
  history: [
    { period: "2002", population: 900, bornInItaly: 700, bornAbroad: 200, bornAbroadShare: 22.2, sourceStatus: "reconstructed", coverageDifference: 0 },
    { period: "2024", population: 980, bornInItaly: 600, bornAbroad: 380, bornAbroadShare: 38.8, sourceStatus: "final", coverageDifference: 0 },
    { period: "2025", population: 1000, bornInItaly: 600, bornAbroad: 400, bornAbroadShare: 40, sourceStatus: "final", coverageDifference: 0 },
  ],
  sourceDataset: "RCS_birth_2025",
  source: { name: "ISTAT", dataset: "RCS – Paese di nascita", url: "https://demo.istat.it", bulkUrl: "https://demo.istat.it/data/rcs/Dati_RCS.zip" },
  methodology: {
    birthplace: "Il paese di nascita è distinto dalla cittadinanza.",
    referencePeriod: "Popolazione al 1 gennaio.",
    temporalBreak: "2002–2018 ricostruito; dal 2019 fonte censuaria.",
    countryDetail: "Singolo paese di nascita.",
    coverage: "Quadratura con popolazione indipendente.",
    citizenshipCross: "Nessun incrocio cittadinanza × paese di nascita viene ricostruito.",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PopulationBirthCountryPanel", () => {
  it("renders country-of-birth measures without presenting them as citizenship", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationBirthCountryPanel />);

    expect(
      await screen.findByRole("heading", { name: "Dove sono nati i residenti" }),
    ).toBeInTheDocument();
    const abroadCard = screen.getByText("Nati all'estero").parentElement;
    expect(abroadCard).not.toBeNull();
    expect(within(abroadCard as HTMLElement).getByText("400")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("Albania")).toBeInTheDocument();
    expect(screen.getByText(/Nessun incrocio cittadinanza × paese di nascita/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/demographics/birthplace");
  });

  it("requests a selected historical period", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationBirthCountryPanel />);
    await screen.findByRole("heading", { name: "Dove sono nati i residenti" });
    fireEvent.change(screen.getByLabelText("Anno dei dati sul paese di nascita"), {
      target: { value: "2002" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/demographics/birthplace?period=2002",
      );
    });
  });
});
