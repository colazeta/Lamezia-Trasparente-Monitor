import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PopulationHouseholdsPanel } from "@/components/demographics/PopulationHouseholdsPanel";

const payload = {
  geography: { code: "079160", name: "Lamezia Terme", level: "municipality" },
  period: "2025",
  availablePeriods: ["2021", "2022", "2023", "2024", "2025"],
  sourceStatus: "final",
  counts: {
    households: 28600,
    householdPopulation: 65600,
    averageHouseholdSize: 2.29,
    totalPopulation: 67500,
    householdPopulationShare: 97.2,
  },
  changeFromFirst: {
    firstPeriod: "2021",
    householdsAbsolute: 900,
    householdsPercent: 3.2,
    averageHouseholdSize: -0.08,
  },
  history: [
    {
      period: "2021",
      households: 27700,
      householdPopulation: 65650,
      averageHouseholdSize: 2.37,
      sourceStatus: "final",
      totalPopulation: 67400,
    },
    {
      period: "2025",
      households: 28600,
      householdPopulation: 65600,
      averageHouseholdSize: 2.29,
      sourceStatus: "final",
      totalPopulation: 67500,
    },
  ],
  quality: {
    publishedAverageHouseholdSize: 2.29,
    derivedAverageHouseholdSize: 2.294,
    averageDifference: -0.004,
    flags: ["derived_from_p02_release"],
  },
  source: {
    name: "ISTAT",
    dataset: "P02",
    url: "https://demo.istat.it/app/?i=P02&l=it",
    projection: "Variabili estratte dalla release P02 archiviata.",
  },
  methodology: {
    household: "La famiglia anagrafica può avere un solo componente.",
    referencePeriod: "Stock al 31 dicembre.",
    averageHouseholdSize:
      "La dimensione media è popolazione residente in famiglia / numero di famiglie.",
    provenance: "La proiezione riusa le release P02 immutabili già archiviate.",
    coverage: "La popolazione in famiglia è distinta dalla convivenza.",
    history: "Sono mostrate solo annualità realmente acquisite.",
    childrenDataset:
      "La distribuzione comunale per figli resta separata perché non è datata.",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PopulationHouseholdsPanel", () => {
  it("renders dated household stocks and keeps the children dataset caveat separate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationHouseholdsPanel />);

    expect(
      await screen.findByRole("heading", { name: "Come cambiano le famiglie" }),
    ).toBeInTheDocument();

    const householdsCard = screen.getByText("Famiglie", {
      selector: "p",
    }).parentElement;
    const averageCard = screen.getByText("Componenti medi").parentElement;
    expect(householdsCard).not.toBeNull();
    expect(averageCard).not.toBeNull();
    expect(
      within(householdsCard as HTMLElement).getByText("28.600"),
    ).toBeInTheDocument();
    expect(
      within(averageCard as HTMLElement).getByText("2,29"),
    ).toBeInTheDocument();
    expect(screen.getByText("97,2%")).toBeInTheDocument();
    expect(
      screen.getByText(/distribuzione comunale per figli resta separata/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/demographics/households");
  });

  it("requests the selected historical year", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationHouseholdsPanel />);
    await screen.findByRole("heading", { name: "Come cambiano le famiglie" });

    fireEvent.change(screen.getByLabelText("Anno dei dati sulle famiglie"), {
      target: { value: "2023" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/demographics/households?period=2023",
      );
    });
  });
});
