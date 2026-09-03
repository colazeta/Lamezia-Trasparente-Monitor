import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Contracts } from "@/pages/Contracts";

const contractQueryState = vi.hoisted(() => ({ isError: false }));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();

  return {
    ...actual,
    useListContracts: () => ({
      data: [],
      isError: contractQueryState.isError,
      isLoading: false,
    }),
    useGetContractsAnalytics: () => ({
      data: {
        totalCount: 0,
        totalAmount: 0,
        withoutTenderCount: 0,
        withoutTenderPct: 0,
        withoutMepaCount: 0,
        withoutMepaPct: 0,
        topBeneficiaries: [],
        mostRecurrentBeneficiary: null,
        byProcedure: [],
        byAcquisitionTool: [],
        amountOverTime: [],
      },
      isLoading: false,
    }),
    useGetContractsFeedStatus: () => ({
      data: {
        lastUpdatedAt: "2026-07-04T00:00:00.000Z",
        itemsTotal: 0,
        url: "https://dati.anticorruzione.it/superset/dashboard/appalti/",
      },
    }),
    useListThemes: () => ({ data: [], isLoading: false }),
  };
});

function renderContractsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Contracts />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("Contracts page public rendering", () => {
  beforeEach(() => {
    contractQueryState.isError = false;
  });

  it("keeps the citizen view concise without exposing the technical BDNCP bridge", () => {
    renderContractsPage();

    expect(
      screen.getByRole("heading", {
        name: "Cosa affida il Comune, a chi e per quanto",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Esplora tutti i contratti" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "I dati mancanti non sono trattati come zero e non indicano irregolarità.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ponte BDNCP")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Fascicoli civici CIG/CUP"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Dataset ANAC")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Pacchetti consultati:/i),
    ).not.toBeInTheDocument();
  });

  it("does not present an unavailable source as zero contracts", () => {
    contractQueryState.isError = true;
    renderContractsPage();

    expect(screen.getAllByText("Fonte in attivazione").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByText(/la pagina non mostra valori sostitutivi/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Verifica su BDNCP ANAC" }),
    ).toHaveAttribute("href", expect.stringContaining("anticorruzione.it"));
    expect(screen.queryByText("Contratti nel perimetro")).not.toBeInTheDocument();
  });
});
