import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { Contract } from "@workspace/api-client-react";

/**
 * Mutable holder so each test can supply its own contract list to the mocked
 * `useListContracts` hook before rendering.
 */
const mockState: { contracts: Contract[] } = { contracts: [] };

const updateMacrotemaMutate = vi.fn();
// The location mutation immediately resolves: invoke the caller's onSuccess so
// we can assert the save-and-advance flow without a real network round-trip.
const updateLocationMutate = vi.fn(
  (
    _vars: unknown,
    opts?: { onSuccess?: () => void; onError?: (e: unknown) => void },
  ) => {
    opts?.onSuccess?.();
  },
);

vi.mock("@workspace/api-client-react", () => ({
  useListContracts: () => ({ data: mockState.contracts, isLoading: false }),
  useUpdateContractMacrotema: () => ({
    mutate: updateMacrotemaMutate,
    isPending: false,
  }),
  useUpdateContractLocation: () => ({
    mutate: updateLocationMutate,
    isPending: false,
  }),
  getListContractsQueryKey: () => ["mock", "listContracts"],
  getGetContractsAnalyticsQueryKey: () => ["mock", "contractsAnalytics"],
}));

// Leaflet cannot measure layout in jsdom; replace the map primitives with
// inert stand-ins so the editor mounts without touching the real library.
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  GeoJSON: () => null,
  CircleMarker: () => null,
  useMapEvents: () => null,
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { AdminAppalti } from "@/pages/AdminAppalti";
import { LocationEditor } from "@/components/LocationEditor";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function makeContract(overrides: Partial<Contract> & { id: number }): Contract {
  return {
    title: `Appalto ${overrides.id}`,
    description: "",
    supplier: `Fornitore ${overrides.id}`,
    amount: 1000,
    procedureType: "affidamento diretto",
    status: "aggiudicato",
    awardDate: "2025-01-01",
    cig: null,
    macrotema: "altro",
    macrotemaManual: false,
    latitude: null,
    longitude: null,
    ...overrides,
  } as Contract;
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

describe("AdminAppalti map-positioning triage", () => {
  beforeEach(() => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    updateMacrotemaMutate.mockClear();
    updateLocationMutate.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    mockState.contracts = [];
  });

  it("shows progress count, progress-bar width and filter chip counts", () => {
    mockState.contracts = [
      makeContract({ id: 1, latitude: 38.96, longitude: 16.31 }),
      makeContract({ id: 2, latitude: 38.97, longitude: 16.32 }),
      makeContract({ id: 3 }),
      makeContract({ id: 4 }),
    ];

    renderWithProviders(<AdminAppalti />);

    // 2 of 4 located → "2 di 4 ... · 2 ancora da posizionare"
    expect(
      screen.getByText(/2 di 4 appalti posizionati sulla mappa/),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 ancora da posizionare/)).toBeInTheDocument();

    // Progress bar reflects 50% (2 of 4).
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    const fill = progressbar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("50%");

    // Filter chips carry the right counts.
    expect(
      screen.getByRole("button", { name: "Tutti (4)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Da posizionare (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Geolocalizzati (2)" }),
    ).toBeInTheDocument();
  });

  it("filters to only unplaced contracts via the 'Da posizionare' chip", () => {
    mockState.contracts = [
      makeContract({
        id: 1,
        title: "Strada con posizione",
        latitude: 38.96,
        longitude: 16.31,
      }),
      makeContract({ id: 2, title: "Scuola da posizionare" }),
      makeContract({ id: 3, title: "Parco da posizionare" }),
    ];

    renderWithProviders(<AdminAppalti />);

    // Initially all three are visible.
    expect(screen.getByText("Strada con posizione")).toBeInTheDocument();
    expect(screen.getByText("Scuola da posizionare")).toBeInTheDocument();
    expect(screen.getByText("Parco da posizionare")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Da posizionare (2)" }),
    );

    // The located contract disappears, the unplaced ones remain.
    expect(screen.queryByText("Strada con posizione")).not.toBeInTheDocument();
    expect(screen.getByText("Scuola da posizionare")).toBeInTheDocument();
    expect(screen.getByText("Parco da posizionare")).toBeInTheDocument();
  });
});

describe("LocationEditor queue (sequential placement)", () => {
  beforeEach(() => {
    updateLocationMutate.mockClear();
  });

  const baseContract = makeContract({
    id: 7,
    title: "Intervento in coda",
    latitude: 38.96,
    longitude: 16.31,
  });

  it("renders the queue badge and a 'Salta' button", () => {
    const onNext = vi.fn();
    renderWithProviders(
      <LocationEditor
        contract={baseContract}
        token="test-token"
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onAuthError={vi.fn()}
        queue={{ position: 1, total: 3, onNext }}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Da posizionare 1 di 3"),
    ).toBeInTheDocument();

    const skip = within(dialog).getByRole("button", { name: /Salta/ });
    fireEvent.click(skip);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("advances to the next contract (onNext) instead of closing on save", () => {
    const onNext = vi.fn();
    const onClose = vi.fn();
    const onSaved = vi.fn();
    renderWithProviders(
      <LocationEditor
        contract={baseContract}
        token="test-token"
        onClose={onClose}
        onSaved={onSaved}
        onAuthError={vi.fn()}
        queue={{ position: 1, total: 3, onNext }}
      />,
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Salva e prosegui/ }),
    );

    expect(updateLocationMutate).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes (onClose) instead of advancing when no queue is provided", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    renderWithProviders(
      <LocationEditor
        contract={baseContract}
        token="test-token"
        onClose={onClose}
        onSaved={onSaved}
        onAuthError={vi.fn()}
        queue={null}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).queryByRole("button", { name: /Salta/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: /Salva posizione/ }),
    );

    expect(updateLocationMutate).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
