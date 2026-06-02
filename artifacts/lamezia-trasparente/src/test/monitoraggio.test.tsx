import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { MonitoringReport } from "@workspace/api-client-react";

/**
 * Mutable holders so each test can supply its own data to the mocked hooks
 * before rendering. Public pages read the public endpoints, the admin page
 * reads the admin endpoint — kept separate so we can assert that the public
 * surface never reaches the (unfiltered) admin endpoint.
 */
const mockState: {
  publicReports: MonitoringReport[];
  detailReport: MonitoringReport | null;
  detailError: boolean;
  adminReports: MonitoringReport[];
  contractStoryline:
    | { contract: { title: string; cig: string | null; cup: string | null } }
    | undefined;
  contractStorylineError: boolean;
} = {
  publicReports: [],
  detailReport: null,
  detailError: false,
  adminReports: [],
  contractStoryline: undefined,
  contractStorylineError: false,
};

// Records which list endpoint each render touched, so we can prove the public
// page never calls the admin (unmoderated) endpoint.
const listPublicSpy = vi.fn();
const listAdminSpy = vi.fn();

// Captures the per-hook init options (carrying the Authorization header) so we
// can assert moderation/admin calls are authenticated.
const capturedAuth: {
  adminList?: unknown;
  moderate?: unknown;
  remove?: unknown;
} = {};

const createMutate = vi.fn(async () => ({ id: 1 }) as MonitoringReport);
const moderateMutate = vi.fn(async () => undefined);
const deleteMutate = vi.fn(async () => undefined);
const uploadMutate = vi.fn(async () => ({
  uploadURL: "https://example.test/upload",
  objectPath: "/monitoring/x.pdf",
}));

vi.mock("@workspace/api-client-react", () => ({
  // Public list endpoint (server-filtered to pubblicato).
  useListMonitoringReports: () => {
    listPublicSpy();
    return { data: mockState.publicReports, isLoading: false };
  },
  getListMonitoringReportsQueryKey: () => ["mock", "listMonitoringReports"],
  // Public detail endpoint (404s for non-pubblicato → isError).
  useGetMonitoringReport: () => ({
    data: mockState.detailReport,
    isLoading: false,
    isError: mockState.detailError,
  }),
  getGetMonitoringReportQueryKey: (id: number) => [
    "mock",
    "getMonitoringReport",
    id,
  ],
  // Admin moderation endpoints.
  useListMonitoringReportsAdmin: (opts?: unknown) => {
    listAdminSpy();
    capturedAuth.adminList = opts;
    return { data: mockState.adminReports, isLoading: false, error: null };
  },
  getListMonitoringReportsAdminQueryKey: () => [
    "mock",
    "listMonitoringReportsAdmin",
  ],
  useModerateMonitoringReport: (opts?: unknown) => {
    capturedAuth.moderate = opts;
    return { mutateAsync: moderateMutate, isPending: false };
  },
  useDeleteMonitoringReport: (opts?: unknown) => {
    capturedAuth.remove = opts;
    return { mutateAsync: deleteMutate, isPending: false };
  },
  // New-report form dependencies.
  useGetContractStoryline: () => ({
    data: mockState.contractStoryline,
    isLoading: false,
    isError: mockState.contractStorylineError,
  }),
  getGetContractStorylineQueryKey: (id: number) => [
    "mock",
    "contractStoryline",
    id,
  ],
  useListPnrrProjects: () => ({
    data: { projects: [] },
    isLoading: false,
  }),
  getListPnrrProjectsQueryKey: () => ["mock", "listPnrrProjects"],
  useCreateMonitoringReport: () => ({
    mutateAsync: createMutate,
    isPending: false,
  }),
  useRequestMonitoringReportUploadUrl: () => ({
    mutateAsync: uploadMutate,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { toast } from "sonner";
import { Monitoraggio } from "@/pages/Monitoraggio";
import { MonitoraggioDetail } from "@/pages/MonitoraggioDetail";
import { MonitoraggioNuovo } from "@/pages/MonitoraggioNuovo";
import { AdminMonitoraggio } from "@/pages/AdminMonitoraggio";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function makeReport(
  overrides: Partial<MonitoringReport> & { id: number },
): MonitoringReport {
  return {
    subjectType: "contract",
    contractId: 10,
    pnrrProjectId: null,
    subjectTitle: `Progetto ${overrides.id}`,
    cig: "CIG0001",
    cup: null,
    title: `Report ${overrides.id}`,
    authorName: "Mario Rossi",
    deskAnalysis: "Analisi desk dettagliata del progetto monitorato.",
    effectivenessEvaluation: "Valutazione di efficacia approfondita.",
    impactResults: "Impatto e risultati osservati sul territorio.",
    overallAssessment: "positivo",
    attachments: [],
    status: "pubblicato",
    moderationNote: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    publishedAt: "2025-01-02T00:00:00.000Z",
    ...overrides,
  } as MonitoringReport;
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

beforeEach(() => {
  listPublicSpy.mockClear();
  listAdminSpy.mockClear();
  createMutate.mockClear();
  moderateMutate.mockClear();
  deleteMutate.mockClear();
  uploadMutate.mockClear();
  (toast.error as ReturnType<typeof vi.fn>).mockClear();
  (toast.success as ReturnType<typeof vi.fn>).mockClear();
  capturedAuth.adminList = undefined;
  capturedAuth.moderate = undefined;
  capturedAuth.remove = undefined;
});

afterEach(() => {
  sessionStorage.clear();
  mockState.publicReports = [];
  mockState.detailReport = null;
  mockState.detailError = false;
  mockState.adminReports = [];
  mockState.contractStoryline = undefined;
  mockState.contractStorylineError = false;
  window.history.replaceState({}, "", "/");
});

describe("Monitoraggio (public list)", () => {
  it("shows the empty state when there are no published reports", () => {
    renderWithProviders(<Monitoraggio />);
    expect(
      screen.getByText("Ancora nessun report pubblicato"),
    ).toBeInTheDocument();
  });

  it("renders a card for each published report and links to its detail", () => {
    mockState.publicReports = [
      makeReport({ id: 1, title: "Il parco è accessibile?" }),
      makeReport({ id: 2, title: "La scuola è stata completata?" }),
    ];

    renderWithProviders(<Monitoraggio />);

    expect(screen.getByText("Il parco è accessibile?")).toBeInTheDocument();
    expect(
      screen.getByText("La scuola è stata completata?"),
    ).toBeInTheDocument();

    const card = screen.getByTestId("card-monitoraggio-1");
    expect(card).toHaveAttribute("href", "/monitoraggio/1");
  });

  it("reads the public endpoint only — never the unmoderated admin endpoint", () => {
    mockState.publicReports = [makeReport({ id: 1 })];

    renderWithProviders(<Monitoraggio />);

    expect(listPublicSpy).toHaveBeenCalled();
    expect(listAdminSpy).not.toHaveBeenCalled();
    // The public surface exposes no moderation controls.
    expect(screen.queryByText("Pubblica")).not.toBeInTheDocument();
    expect(screen.queryByText("Rifiuta")).not.toBeInTheDocument();
  });
});

describe("MonitoraggioDetail", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/monitoraggio/1");
  });

  it("renders the three phases and the overall assessment", () => {
    mockState.detailReport = makeReport({
      id: 1,
      title: "Report dettagliato",
      overallAssessment: "critico",
    });

    renderWithProviders(<MonitoraggioDetail />);

    expect(screen.getByText("Report dettagliato")).toBeInTheDocument();
    expect(screen.getByText("Analisi desk")).toBeInTheDocument();
    expect(screen.getByText("Valutazione di efficacia")).toBeInTheDocument();
    expect(screen.getByText("Impatto e risultati")).toBeInTheDocument();
    expect(screen.getByText("Giudizio critico")).toBeInTheDocument();
  });

  it("shows 'Report non trovato' when the report is not publicly available", () => {
    mockState.detailReport = null;
    mockState.detailError = true;

    renderWithProviders(<MonitoraggioDetail />);

    expect(screen.getByText("Report non trovato")).toBeInTheDocument();
  });
});

describe("MonitoraggioNuovo", () => {
  it("prompts the user to pick a project when none is selected", () => {
    renderWithProviders(<MonitoraggioNuovo />);
    expect(
      screen.getByText("Scegli prima un progetto da monitorare"),
    ).toBeInTheDocument();
  });

  it("blocks submission and warns when the overall assessment is missing", () => {
    window.history.replaceState({}, "", "/monitoraggio/nuovo?contractId=42");
    mockState.contractStoryline = {
      contract: { title: "Parco urbano", cig: "CIGXYZ", cup: null },
    };

    renderWithProviders(<MonitoraggioNuovo />);

    fireEvent.change(screen.getByTestId("input-mr-title"), {
      target: { value: "Il parco è davvero accessibile?" },
    });
    fireEvent.change(screen.getByTestId("textarea-deskAnalysis"), {
      target: { value: "Analisi desk con almeno venti caratteri scritti." },
    });
    fireEvent.change(screen.getByTestId("textarea-effectivenessEvaluation"), {
      target: { value: "Valutazione di efficacia sufficientemente lunga." },
    });
    fireEvent.change(screen.getByTestId("textarea-impactResults"), {
      target: { value: "Impatto e risultati descritti con dettaglio reale." },
    });

    fireEvent.click(screen.getByTestId("button-submit-report"));

    expect(toast.error).toHaveBeenCalledWith(
      "Seleziona un giudizio complessivo.",
    );
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("submits a valid contract report with the expected payload", () => {
    window.history.replaceState({}, "", "/monitoraggio/nuovo?contractId=42");
    mockState.contractStoryline = {
      contract: { title: "Parco urbano", cig: "CIGXYZ", cup: null },
    };

    renderWithProviders(<MonitoraggioNuovo />);

    fireEvent.change(screen.getByTestId("input-mr-title"), {
      target: { value: "Il parco è davvero accessibile?" },
    });
    fireEvent.change(screen.getByTestId("textarea-deskAnalysis"), {
      target: { value: "Analisi desk con almeno venti caratteri scritti." },
    });
    fireEvent.change(screen.getByTestId("textarea-effectivenessEvaluation"), {
      target: { value: "Valutazione di efficacia sufficientemente lunga." },
    });
    fireEvent.change(screen.getByTestId("textarea-impactResults"), {
      target: { value: "Impatto e risultati descritti con dettaglio reale." },
    });
    fireEvent.click(screen.getByTestId("button-assessment-positivo"));
    fireEvent.click(screen.getByTestId("button-submit-report"));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subjectType: "contract",
          contractId: 42,
          title: "Il parco è davvero accessibile?",
          overallAssessment: "positivo",
        }),
      }),
    );
  });
});

describe("AdminMonitoraggio", () => {
  it("shows the token gate when no token is stored", () => {
    renderWithProviders(<AdminMonitoraggio />);
    expect(
      screen.getByLabelText(/Token di accesso redazione/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Moderazione Monitoraggio Civico"),
    ).not.toBeInTheDocument();
  });

  it("lists reports of every status with their status badge", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.adminReports = [
      makeReport({ id: 1, title: "Primo report", status: "in_revisione" }),
      makeReport({ id: 2, title: "Secondo report", status: "pubblicato" }),
      makeReport({ id: 3, title: "Terzo report", status: "rifiutato" }),
    ];

    renderWithProviders(<AdminMonitoraggio />);

    expect(screen.getByTestId("row-report-1")).toBeInTheDocument();
    expect(screen.getByTestId("row-report-2")).toBeInTheDocument();
    expect(screen.getByTestId("row-report-3")).toBeInTheDocument();
    expect(screen.getByText("In revisione")).toBeInTheDocument();
    expect(screen.getByText("Pubblicato")).toBeInTheDocument();
    expect(screen.getByText("Rifiutato")).toBeInTheDocument();
  });

  it("publishes a report with the Authorization header", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.adminReports = [
      makeReport({ id: 5, status: "in_revisione", moderationNote: null }),
    ];

    renderWithProviders(<AdminMonitoraggio />);

    fireEvent.click(screen.getByTestId("button-publish-5"));

    expect(moderateMutate).toHaveBeenCalledTimes(1);
    expect(moderateMutate).toHaveBeenCalledWith({
      id: 5,
      data: { status: "pubblicato", moderationNote: null },
    });
    expect(capturedAuth.moderate).toMatchObject({
      request: { headers: { Authorization: "Bearer test-token" } },
    });
  });

  it("rejects a report and forwards the typed moderation note", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.adminReports = [
      makeReport({ id: 6, status: "in_revisione", moderationNote: null }),
    ];

    renderWithProviders(<AdminMonitoraggio />);

    const row = screen.getByTestId("row-report-6");
    fireEvent.change(within(row).getByLabelText(/Nota di moderazione/i), {
      target: { value: "Contenuto non verificabile." },
    });
    fireEvent.click(screen.getByTestId("button-reject-6"));

    expect(moderateMutate).toHaveBeenCalledWith({
      id: 6,
      data: { status: "rifiutato", moderationNote: "Contenuto non verificabile." },
    });
  });

  it("deletes a report (after confirmation) with the Authorization header", () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.adminReports = [makeReport({ id: 7, status: "pubblicato" })];

    renderWithProviders(<AdminMonitoraggio />);

    fireEvent.click(screen.getByTestId("button-delete-7"));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(deleteMutate).toHaveBeenCalledWith({ id: 7 });
    expect(capturedAuth.remove).toMatchObject({
      request: { headers: { Authorization: "Bearer test-token" } },
    });

    confirmSpy.mockRestore();
  });

  it("reads the admin endpoint with the Authorization header", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.adminReports = [makeReport({ id: 8 })];

    renderWithProviders(<AdminMonitoraggio />);

    expect(listAdminSpy).toHaveBeenCalled();
    expect(capturedAuth.adminList).toMatchObject({
      request: { headers: { Authorization: "Bearer test-token" } },
    });
  });
});
