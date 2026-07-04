import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Contracts } from "@/pages/Contracts";

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();

  return {
    ...actual,
    useListContracts: () => ({ data: [], isLoading: false }),
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

describe("Contracts page lifecycle rendering", () => {
  it("renders the public contracts page with the full BDNCP lifecycle", () => {
    renderContractsPage();

    expect(
      screen.getByRole("heading", {
        name: "Contratti pubblici sotto osservazione",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ponte BDNCP")).toBeInTheDocument();
    expect(screen.getByText("Fascicoli civici CIG/CUP")).toBeInTheDocument();

    for (const phase of [
      "Programmazione",
      "Progettazione",
      "Gara / pubblicazione",
      "Esecuzione della gara",
      "Affidamento",
      "Esecuzione del contratto",
      "Conclusione, collaudi e verifiche",
    ]) {
      expect(screen.getByText(phase)).toBeInTheDocument();
    }
  });
});
