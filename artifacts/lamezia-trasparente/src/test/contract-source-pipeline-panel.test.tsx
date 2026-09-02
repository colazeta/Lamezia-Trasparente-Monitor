import { render, screen } from "@testing-library/react";
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

  it("shows a concise citizen-facing source overview", () => {
    renderPanel();

    expect(screen.getByText("Fonti dei contratti")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Dati pubblici, con la fonte sempre raggiungibile",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Consulta ANAC/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Come leggiamo i dati" }),
    ).toBeInTheDocument();
  });

  it("keeps internal pipeline mechanics out of the ordinary public view", () => {
    renderPanel();

    expect(screen.queryByText("Ponte BDNCP")).not.toBeInTheDocument();
    expect(screen.queryByText("Perimetro e prossimo passo")).not.toBeInTheDocument();
    expect(screen.queryByText("Copertura fasi")).not.toBeInTheDocument();
    expect(screen.queryByText(/Passaggio 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/parser/i)).not.toBeInTheDocument();
  });

  it("summarizes the current public scope without exposing technical coverage metrics", () => {
    contractListMock.contracts = [
      contractFixture({ cig: "B123456789" }),
      contractFixture({ id: 102, title: "Servizio senza CIG", cig: null }),
    ];

    renderPanel();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1 con CIG rilevato")).toBeInTheDocument();
    expect(screen.queryByText(/fasi mancanti/i)).not.toBeInTheDocument();
  });

  it("keeps the historical integration model testable outside the public copy", () => {
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
