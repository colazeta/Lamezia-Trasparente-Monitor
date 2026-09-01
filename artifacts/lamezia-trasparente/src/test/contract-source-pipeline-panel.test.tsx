import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Contract } from "@workspace/api-client-react";

import { ContractSourcePipelinePanel } from "@/components/contracts";
import { buildContractPipelineSnapshot } from "@/lib/contractsPipelineVisualization";

const contractListMock = vi.hoisted(() => ({
  contracts: [] as Contract[],
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();

  return {
    ...actual,
    useListContracts: () => ({
      data: contractListMock.contracts,
      isLoading: false,
    }),
  };
});

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ContractSourcePipelinePanel />
    </QueryClientProvider>,
  );
}

describe("ContractSourcePipelinePanel", () => {
  beforeEach(() => {
    contractListMock.contracts = [];
  });

  it("renders the active current-Albo source pipeline with explicit limits", () => {
    renderPanel();

    expect(screen.getByText("Contratti protagonisti")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Stato dei fascicoli contrattuali",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Perimetro e prossimo passo")).toBeInTheDocument();
    expect(screen.getByText("Albo Pretorio corrente")).toBeInTheDocument();
    expect(screen.getByText("Filtro pubblico e privacy")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ponte di ricerca, non sincronizzazione della scheda ANAC",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lettura immediata dello stato"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ANAC sincronizzata/i)).not.toBeInTheDocument();
  });

  it("exposes dossier status controls on the complete contract list", () => {
    renderPanel();

    expect(screen.getByText("Stato fascicoli")).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Filtra fascicoli contrattuali per stato",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutti 0" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Da verificare 0" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Parziale 0" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Completo 0" }),
    ).toBeInTheDocument();
  });

  it("shows the phase state strip on each contract dossier card", () => {
    contractListMock.contracts = [
      contractFixture({
        title: "Manutenzione straordinaria strade",
        cig: "B123456789",
        macrotema: "strade",
      }),
    ];

    renderPanel();

    expect(screen.getByText("Flusso fasi")).toBeInTheDocument();
    const phaseStrip = screen.getByLabelText(
      "Stato fasi del fascicolo Manutenzione straordinaria strade",
    );

    expect(
      within(phaseStrip).getByText("Programmazione: mancante"),
    ).toBeInTheDocument();
    expect(
      within(phaseStrip).getByText("Progettazione: parziale"),
    ).toBeInTheDocument();
    expect(
      within(phaseStrip).getByText("Esecuzione del contratto: mancante"),
    ).toBeInTheDocument();

    expect(screen.getByText("Copertura fasi")).toBeInTheDocument();
    const phaseCoverage = screen.getByRole("list", {
      name: "Copertura stato fasi dei fascicoli",
    });

    expect(
      within(phaseCoverage).getByText("Programmazione"),
    ).toBeInTheDocument();
    expect(
      within(phaseCoverage).getByRole("img", {
        name: "Programmazione: 0 documentate, 0 parziali, 1 mancanti",
      }),
    ).toBeInTheDocument();
    expect(
      within(phaseCoverage).getByRole("img", {
        name: "Progettazione: 0 documentate, 1 parziali, 0 mancanti",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the historical ANAC integration separate from the active layer", () => {
    const snapshot = buildContractPipelineSnapshot();

    expect(snapshot.stages).toHaveLength(4);
    expect(snapshot.stages.map((stage) => stage.state)).toEqual([
      "complete",
      "complete",
      "complete",
      "ready",
    ]);
    expect(snapshot.nextAction).toContain("storico completo");
    expect(snapshot.nextAction).toContain("nessuna assenza");
  });
});

function contractFixture(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 101,
    title: "Manutenzione straordinaria strade",
    description: "Intervento di manutenzione su strade comunali.",
    supplier: "Operatore economico demo",
    amount: 120000,
    status: "in_corso",
    procedureType: "Affidamento diretto",
    acquisitionTool: "MEPA",
    awardDate: "2026-01-15T00:00:00.000Z",
    cig: null,
    cup: null,
    anacUrl: null,
    themeId: null,
    withoutTender: false,
    withoutMepa: false,
    stazioneAppaltante: "Comune di Lamezia Terme",
    macrotema: null,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoVerify: false,
    ...overrides,
  } as Contract;
}
