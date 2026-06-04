import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
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

describe("AdminAccessoCivico import summary", () => {
  beforeEach(() => {
    importMutate.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    mockState.requests = [];
  });

  it("lists each skipped row with its source line, reason, counts and a re-upload CTA", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    // Riga 3 (oggetto mancante) viene scartata in anteprima; restano due righe
    // valide su righe sorgente 2 e 4. Il server scarta la seconda (indice 1),
    // che deve essere ricondotta alla riga 4 del file.
    importMutate.mockResolvedValueOnce({
      create: 1,
      aggiornate: 0,
      scartate: [
        {
          indice: 1,
          oggetto: "terzo",
          motivo: "Data presentazione non valida",
        },
      ],
    });

    renderWithProviders(<AdminAccessoCivico />);

    fireEvent.click(screen.getByTestId("button-toggle-import"));

    const csv = [
      "oggetto,data presentazione",
      "primo,15/03/2024",
      ",10/01/2024",
      "terzo,20/02/2024",
    ].join("\n");
    const file = new File([csv], "registro.csv", { type: "text/csv" });
    // jsdom in questo ambiente non implementa File.text(): la forniamo noi.
    if (typeof file.text !== "function") {
      Object.defineProperty(file, "text", { value: async () => csv });
    }
    fireEvent.change(screen.getByTestId("input-import-file"), {
      target: { files: [file] },
    });

    const confirm = await screen.findByTestId("button-confirm-import");
    fireEvent.click(confirm);

    const summary = await screen.findByTestId("import-summary");
    // Conteggi creati/aggiornati restano visibili.
    expect(summary).toHaveTextContent("1 nuove");
    expect(summary).toHaveTextContent("0 aggiornate");
    expect(summary).toHaveTextContent("1 scartate");

    const skipped = await screen.findByTestId("import-summary-skipped");
    // Riga sorgente reale (4), oggetto e motivo dello scarto.
    expect(skipped).toHaveTextContent("Riga 4");
    expect(skipped).toHaveTextContent("terzo");
    expect(skipped).toHaveTextContent("Data presentazione non valida");

    // Call-to-action per correggere e ricaricare.
    expect(
      within(skipped).getByTestId("button-reupload-import"),
    ).toBeInTheDocument();

    // Le righe inviate al server non includono il campo interno sourceRiga.
    await waitFor(() => expect(importMutate).toHaveBeenCalledTimes(1));
    const sentRighe = importMutate.mock.calls[0][0].data.righe;
    expect(sentRighe).toHaveLength(2);
    for (const riga of sentRighe) {
      expect(riga).not.toHaveProperty("sourceRiga");
    }
  });
});
