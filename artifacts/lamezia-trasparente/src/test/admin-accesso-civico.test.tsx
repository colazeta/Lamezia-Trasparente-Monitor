import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { AccessoCivicoRequestAdmin } from "@workspace/api-client-react";

/**
 * Mutable holder so each test can supply its own admin request list to the
 * mocked `useListAccessoCivicoAdmin` hook before rendering.
 */
const mockState: { requests: AccessoCivicoRequestAdmin[] } = { requests: [] };

const updateMutate = vi.fn(async () => undefined);
const deleteMutate = vi.fn(async () => undefined);
const publishMutate = vi.fn(async () => undefined);
const importMutate = vi.fn(async () => ({ create: 0, aggiornate: 0, scartate: [] }));

vi.mock("@workspace/api-client-react", () => ({
  useListAccessoCivicoAdmin: () => ({
    data: mockState.requests,
    isLoading: false,
    error: null,
  }),
  useUpdateAccessoCivico: () => ({ mutateAsync: updateMutate, isPending: false }),
  useDeleteAccessoCivico: () => ({ mutateAsync: deleteMutate, isPending: false }),
  usePublishAccessoCivico: () => ({ mutateAsync: publishMutate, isPending: false }),
  useImportAccessoCivico: () => ({ mutateAsync: importMutate, isPending: false }),
  useRequestDocumentUploadUrl: () => ({
    mutateAsync: vi.fn(async () => ({
      uploadURL: "https://example.test/upload",
      objectPath: "/documents/x.pdf",
    })),
    isPending: false,
  }),
  getListAccessoCivicoAdminQueryKey: () => ["mock", "listAccessoCivicoAdmin"],
  getListAccessoCivicoQueryKey: () => ["mock", "listAccessoCivico"],
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { AdminAccessoCivico } from "@/pages/AdminAccessoCivico";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function makeRequest(
  overrides: Partial<AccessoCivicoRequestAdmin> & { id: number },
): AccessoCivicoRequestAdmin {
  return {
    oggetto: `Richiesta ${overrides.id}`,
    tipo: "generalizzato",
    ente: "Comune di Lamezia Terme",
    descrizione: "",
    requestText: "",
    requesterName: null,
    requestDate: "2024-03-15",
    stato: "in-attesa",
    esitoNote: "",
    responseDate: null,
    responseUrl: null,
    responseLabel: null,
    themeId: null,
    pnrrProjectId: null,
    status: "published",
    origine: "cittadino",
    fonteUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  } as AccessoCivicoRequestAdmin;
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

describe("AdminAccessoCivico source distinction", () => {
  beforeEach(() => {
    updateMutate.mockClear();
    deleteMutate.mockClear();
    publishMutate.mockClear();
    importMutate.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    mockState.requests = [];
  });

  it("distinguishes official-register entries from citizen requests in the list", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.requests = [
      makeRequest({ id: 1, origine: "cittadino" }),
      makeRequest({
        id: 2,
        origine: "registro-ufficiale",
        fonteUrl: "https://comune.example/registro",
      }),
    ];

    renderWithProviders(<AdminAccessoCivico />);

    const citizenRow = screen.getByTestId("row-request-1");
    expect(
      within(citizenRow).getByTestId("badge-origine-1"),
    ).toHaveTextContent(/cittadino/i);

    const officialRow = screen.getByTestId("row-request-2");
    expect(
      within(officialRow).getByTestId("badge-origine-2"),
    ).toHaveTextContent(/registro ufficiale/i);

    const fonteLink = within(officialRow).getByTestId("link-fonte-2");
    expect(fonteLink).toHaveAttribute(
      "href",
      "https://comune.example/registro",
    );
    expect(fonteLink).toHaveAttribute("target", "_blank");

    expect(
      within(citizenRow).queryByTestId("link-fonte-1"),
    ).not.toBeInTheDocument();
  });
});
