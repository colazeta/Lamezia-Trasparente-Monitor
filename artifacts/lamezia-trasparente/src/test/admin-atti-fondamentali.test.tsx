import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { FundamentalActAdmin } from "@workspace/api-client-react";

/**
 * Mutable holder so each test can supply its own admin act list to the mocked
 * `useListFundamentalActsAdmin` hook before rendering.
 */
const mockState: { acts: FundamentalActAdmin[] } = { acts: [] };

const confirmMutate = vi.fn(async () => undefined);
const createMutate = vi.fn(async () => undefined);
const updateMutate = vi.fn(async () => undefined);
const deleteMutate = vi.fn(async () => undefined);

vi.mock("@workspace/api-client-react", () => ({
  useListFundamentalActsAdmin: () => ({
    data: mockState.acts,
    isLoading: false,
    error: null,
  }),
  useCreateFundamentalAct: () => ({
    mutateAsync: createMutate,
    isPending: false,
  }),
  useUpdateFundamentalAct: () => ({
    mutateAsync: updateMutate,
    isPending: false,
  }),
  useDeleteFundamentalAct: () => ({
    mutateAsync: deleteMutate,
    isPending: false,
  }),
  useConfirmFundamentalActSuggestion: () => ({
    mutateAsync: confirmMutate,
    isPending: false,
  }),
  useRequestDocumentUploadUrl: () => ({
    mutateAsync: vi.fn(async () => ({
      uploadURL: "https://example.test/upload",
      objectPath: "/documents/x.pdf",
    })),
    isPending: false,
  }),
  getListFundamentalActsAdminQueryKey: () => ["mock", "listFundamentalActsAdmin"],
  getListFundamentalActsQueryKey: () => ["mock", "listFundamentalActs"],
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { AdminAttiFondamentali } from "@/pages/AdminAttiFondamentali";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function makeAct(
  overrides: Partial<FundamentalActAdmin> & { id: number; slug: string },
): FundamentalActAdmin {
  return {
    label: `Atto ${overrides.id}`,
    keywords: [],
    sortOrder: 0,
    title: null,
    description: null,
    source: "none",
    manualOfficialUrl: null,
    manualFile: null,
    attachments: [],
    linkedPublication: null,
    suggestedPublication: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  } as FundamentalActAdmin;
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter>{ui}</WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("AdminAttiFondamentali", () => {
  beforeEach(() => {
    confirmMutate.mockClear();
    createMutate.mockClear();
    updateMutate.mockClear();
    deleteMutate.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    mockState.acts = [];
  });

  it("shows the token gate when no token is stored", () => {
    renderWithProviders(<AdminAttiFondamentali />);
    expect(screen.getByLabelText(/Token di accesso/i)).toBeInTheDocument();
    expect(
      screen.queryByText("Gestione Atti fondamentali"),
    ).not.toBeInTheDocument();
  });

  it("lists configured acts once authenticated", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.acts = [
      makeAct({ id: 1, slug: "piao", label: "PIAO", source: "manual" }),
      makeAct({ id: 2, slug: "dup", label: "DUP", source: "none" }),
    ];

    renderWithProviders(<AdminAttiFondamentali />);

    expect(screen.getByText("Gestione Atti fondamentali")).toBeInTheDocument();
    expect(screen.getByTestId("row-atto-piao")).toBeInTheDocument();
    expect(screen.getByTestId("row-atto-dup")).toBeInTheDocument();
  });

  it("confirms an auto-suggestion when one is available and unlinked", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.acts = [
      makeAct({
        id: 3,
        slug: "bilancio",
        label: "Bilancio di previsione",
        source: "none",
        suggestedPublication: {
          id: 99,
          progressivo: "123",
          tipologia: "Delibera",
          oggetto: "Approvazione bilancio di previsione 2025",
          dataAtto: "2025-01-15",
          pubStart: "2025-01-20",
          attachments: [],
        },
        linkedPublication: null,
      }),
    ];

    renderWithProviders(<AdminAttiFondamentali />);

    const row = screen.getByTestId("row-atto-bilancio");
    expect(
      within(row).getByText("Approvazione bilancio di previsione 2025"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-confirm-bilancio"));
    expect(confirmMutate).toHaveBeenCalledTimes(1);
    expect(confirmMutate).toHaveBeenCalledWith({ id: 3 });
  });

  it("creates a new act from the form", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    renderWithProviders(<AdminAttiFondamentali />);

    fireEvent.change(screen.getByTestId("input-slug"), {
      target: { value: "statuto" },
    });
    fireEvent.change(screen.getByTestId("input-label"), {
      target: { value: "Statuto comunale" },
    });
    fireEvent.click(screen.getByTestId("button-save"));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "statuto",
          label: "Statuto comunale",
        }),
      }),
    );
  });
});
