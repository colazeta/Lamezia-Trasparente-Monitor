import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PopulationCitizenshipPanel } from "@/components/demographics/PopulationCitizenshipPanel";

const payload = {
  geography: { code: "079160", name: "Lamezia Terme", level: "municipality" },
  period: "2025",
  availablePeriods: ["2002", "2019", "2024", "2025"],
  sourceStatus: "final",
  counts: {
    population: 67000,
    foreign: 6000,
    italian: 61000,
    foreignShare: 9,
  },
  foreignAgeBands: [
    { key: "0-14", count: 1200, shareOfForeign: 20 },
    { key: "15-64", count: 4500, shareOfForeign: 75 },
    { key: "65+", count: 300, shareOfForeign: 5 },
  ],
  history: [
    {
      period: "2002",
      population: 69000,
      foreign: 2070,
      foreignShare: 3,
      sourceStatus: "reconstructed",
    },
    {
      period: "2019",
      population: 68000,
      foreign: 4760,
      foreignShare: 7,
      sourceStatus: "final",
    },
    {
      period: "2024",
      population: 67300,
      foreign: 5720,
      foreignShare: 8.5,
      sourceStatus: "final",
    },
    {
      period: "2025",
      population: 67000,
      foreign: 6000,
      foreignShare: 9,
      sourceStatus: "final",
    },
  ],
  citizenshipDetail: {
    period: "2024",
    availablePeriods: ["2019", "2020", "2021", "2022", "2023", "2024"],
    topCountries: [
      {
        code: "RO",
        name: "Romania",
        total: 1200,
        male: 540,
        female: 660,
        shareOfForeign: 21,
      },
      {
        code: "UA",
        name: "Ucraina",
        total: 700,
        male: 280,
        female: 420,
        shareOfForeign: 12.2,
      },
    ],
    countryLeafTotal: 5690,
    foreignTotal: 5720,
    coverageDifference: 30,
  },
  source: {
    name: "ISTAT",
    foreignDataset: "29_7_DF_DCIS_POPSTRRES1_20",
    citizenshipDataset: "29_317_DF_DCIS_POPSTRCIT1_20",
    url: "https://esploradati.istat.it",
  },
  methodology: {
    citizenship:
      "Per popolazione straniera si intendono i residenti con cittadinanza non italiana.",
    referencePeriod: "Consistenze al 1° gennaio.",
    temporalBreak:
      "Il tratto 2002–2018 è ricostruito; dal 2019 usa il Censimento permanente.",
    countryDetail:
      "Il dettaglio per singola cittadinanza usa il dataflow ISTAT dal 2019.",
    coverage:
      "La somma dei singoli paesi è confrontata con il totale indipendente dei residenti stranieri.",
    birthplace:
      "Il paese di nascita non è inferito dalla cittadinanza e sarà una serie autonoma.",
  },
} as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PopulationCitizenshipPanel", () => {
  it("keeps citizenship distinct from birthplace and shows coverage-aware country detail", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationCitizenshipPanel />);

    expect(
      await screen.findByRole("heading", {
        name: "Cittadinanza e presenza straniera",
      }),
    ).toBeInTheDocument();

    const foreignCard = screen.getByText("Cittadini stranieri").parentElement;
    const shareCard = screen.getByText("Incidenza").parentElement;
    const deltaCard = screen.getByText("Variazione dal primo anno").parentElement;
    expect(foreignCard).not.toBeNull();
    expect(shareCard).not.toBeNull();
    expect(deltaCard).not.toBeNull();
    expect(within(foreignCard as HTMLElement).getByText("6.000")).toBeInTheDocument();
    expect(within(shareCard as HTMLElement).getByText("9%")).toBeInTheDocument();
    expect(within(deltaCard as HTMLElement).getByText("+6 p.p.")).toBeInTheDocument();
    expect(
      within(deltaCard as HTMLElement).getByText(/2025.*2002/i),
    ).toBeInTheDocument();

    expect(screen.getByText("Dettaglio disponibile per il 2024")).toBeInTheDocument();
    expect(screen.getByText("Romania")).toBeInTheDocument();
    expect(screen.getByText("Ucraina")).toBeInTheDocument();
    expect(screen.getByText(/differenza rispetto al totale stranieri 30/i)).toBeInTheDocument();
    expect(screen.getAllByText(/paese di nascita/i).length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith("/api/demographics/citizenship");
  });

  it("requests the selected historical year without conflating the latest alias", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationCitizenshipPanel />);
    await screen.findByRole("heading", {
      name: "Cittadinanza e presenza straniera",
    });

    fireEvent.change(screen.getByLabelText("Anno dei dati di cittadinanza"), {
      target: { value: "2019" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/demographics/citizenship?period=2019",
      );
    });
  });
});
