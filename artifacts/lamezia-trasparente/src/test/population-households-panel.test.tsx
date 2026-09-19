import { HOUSEHOLD_FIXTURE } from "./fixtures/householdComposition";
vi.mock("@/hooks/useHouseholdComposition", () => ({
  useHouseholdComposition: () => ({
    data: HOUSEHOLD_FIXTURE,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { DemographicHouseholdsResponse } from "@workspace/api-client-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PopulationHouseholdsPanel } from "@/components/demographics/PopulationHouseholdsPanel";

const payload: DemographicHouseholdsResponse = {
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
  composition: HOUSEHOLD_FIXTURE,
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
    composition:
      "La composizione è una fotografia censuaria 2023 distinta dallo storico.",
    compositionQuality:
      "PF3-PF8 quadrano esattamente con PF1 sui conteggi interi.",
    familyRelationships:
      "La dimensione non consente di inferire coppie, figli o parentela.",
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
    const composition = screen.getByRole("region", {
      name: "Composizione delle famiglie nel 2023",
    });
    const onePersonCard = within(composition).getByText(
      "Famiglie unipersonali",
    ).parentElement;
    const fivePlusCard = within(composition).getByText(
      "Famiglie con almeno 5 componenti",
    ).parentElement;
    expect(onePersonCard).not.toBeNull();
    expect(fivePlusCard).not.toBeNull();
    expect(
      within(onePersonCard as HTMLElement).getByText("8713"),
    ).toBeInTheDocument();
    expect(
      within(fivePlusCard as HTMLElement).getByText("1603"),
    ).toBeInTheDocument();
    expect(within(composition).getByText(/PF3–PF8 = PF1/i)).toBeInTheDocument();
    expect(
      within(composition).getByText(/edizione aggiornata il 9 giugno 2026/i),
    ).toBeInTheDocument();
    expect(
      within(composition).getByText(
        /non consente di inferire coppie, figli o parentela/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/distribuzione comunale per figli resta separata/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/demographics/households",
      undefined,
    );
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
        undefined,
      );
    });
  });

  it("keeps the verified 2023 composition visible when the annual API is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PopulationHouseholdsPanel />);

    expect(
      await screen.findByRole("heading", { name: "Come cambiano le famiglie" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Serie annuale non disponibile in questa sessione"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Famiglie di Lamezia Terme per numero di componenti nel 2023/i,
      }),
    ).toBeInTheDocument();

    const total = screen.getByText("Famiglie totali").closest("dl");
    const onePerson = screen.getByText("Famiglie unipersonali").closest("dl");
    const fivePlus = screen.getByText("Almeno 5 componenti").closest("dl");
    expect(total).not.toBeNull();
    expect(onePerson).not.toBeNull();
    expect(fivePlus).not.toBeNull();
    expect(
      within(total as HTMLElement).getByText("27.591"),
    ).toBeInTheDocument();
    expect(
      within(onePerson as HTMLElement).getByText("8.713"),
    ).toBeInTheDocument();
    expect(
      within(fivePlus as HTMLElement).getByText("1.603"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Scarica JSON/i })).toHaveAttribute(
      "download",
      "lamezia-famiglie-componenti-2023.json",
    );
    expect(
      screen.getByRole("link", { name: /Verifica API annuale/i }),
    ).toHaveAttribute("href", "/api/demographics/households");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/demographics/households",
      undefined,
    );
  });
});
