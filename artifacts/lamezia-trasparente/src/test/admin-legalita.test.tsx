import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type {
  LegalitySection,
  LegalityAreaWithRequirements,
  LegalityRequirement,
} from "@workspace/api-client-react";

/**
 * Mutable holder so each test can supply its own section payload to the mocked
 * `useGetLegalitySection` hook before rendering.
 */
const mockState: { data: LegalitySection | undefined; isLoading: boolean } = {
  data: undefined,
  isLoading: false,
};

const updateOverviewMutate = vi.fn(async () => undefined);
const createAreaMutate = vi.fn(async () => undefined);
const updateAreaMutate = vi.fn(async () => undefined);
const deleteAreaMutate = vi.fn(async () => undefined);
const createRequirementMutate = vi.fn(async () => undefined);
const updateRequirementMutate = vi.fn(async () => undefined);
const deleteRequirementMutate = vi.fn(async () => undefined);

vi.mock("@workspace/api-client-react", () => ({
  useGetLegalitySection: () => ({
    data: mockState.data,
    isLoading: mockState.isLoading,
    error: null,
  }),
  useUpdateLegalityOverview: () => ({
    mutateAsync: updateOverviewMutate,
    isPending: false,
  }),
  useCreateLegalityArea: () => ({
    mutateAsync: createAreaMutate,
    isPending: false,
  }),
  useUpdateLegalityArea: () => ({
    mutateAsync: updateAreaMutate,
    isPending: false,
  }),
  useDeleteLegalityArea: () => ({
    mutateAsync: deleteAreaMutate,
    isPending: false,
  }),
  useCreateLegalityRequirement: () => ({
    mutateAsync: createRequirementMutate,
    isPending: false,
  }),
  useUpdateLegalityRequirement: () => ({
    mutateAsync: updateRequirementMutate,
    isPending: false,
  }),
  useDeleteLegalityRequirement: () => ({
    mutateAsync: deleteRequirementMutate,
    isPending: false,
  }),
  getGetLegalitySectionQueryKey: () => ["mock", "getLegalitySection"],
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { AdminLegalita } from "@/pages/AdminLegalita";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function makeRequirement(
  overrides: Partial<LegalityRequirement> & { id: number; areaId: number },
): LegalityRequirement {
  return {
    title: `Requisito ${overrides.id}`,
    description: "",
    status: "present",
    comment: "",
    linkedActs: [],
    position: 0,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  } as LegalityRequirement;
}

function makeArea(
  overrides: Partial<LegalityAreaWithRequirements> & {
    id: number;
    slug: string;
  },
): LegalityAreaWithRequirements {
  return {
    title: `Area ${overrides.id}`,
    description: "",
    finalJudgment: "",
    position: 0,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    requirements: [],
    ...overrides,
  } as LegalityAreaWithRequirements;
}

function makeSection(
  overrides: Partial<LegalitySection> = {},
): LegalitySection {
  return {
    overallJudgment: "",
    updatedAt: null,
    areas: [],
    ...overrides,
  } as LegalitySection;
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

describe("AdminLegalita", () => {
  beforeEach(() => {
    updateOverviewMutate.mockClear();
    createAreaMutate.mockClear();
    updateAreaMutate.mockClear();
    deleteAreaMutate.mockClear();
    createRequirementMutate.mockClear();
    updateRequirementMutate.mockClear();
    deleteRequirementMutate.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
    mockState.data = undefined;
    mockState.isLoading = false;
  });

  it("shows the token gate when no token is stored", () => {
    renderWithProviders(<AdminLegalita />);
    expect(
      screen.getByLabelText(/Token di accesso redazione/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Gestione Legalità e Trasparenza"),
    ).not.toBeInTheDocument();
  });

  it("renders existing areas and requirements once authenticated", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({
      overallJudgment: "Giudizio di sintesi",
      areas: [
        makeArea({
          id: 1,
          slug: "trasparenza",
          title: "Trasparenza",
          requirements: [
            makeRequirement({
              id: 10,
              areaId: 1,
              title: "Albo pretorio online",
            }),
          ],
        }),
      ],
    });

    renderWithProviders(<AdminLegalita />);

    expect(
      screen.getByText("Gestione Legalità e Trasparenza"),
    ).toBeInTheDocument();
    expect(screen.getByText("Trasparenza")).toBeInTheDocument();
    expect(screen.getByText("Albo pretorio online")).toBeInTheDocument();
  });

  it("creates a new area from the form", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({ areas: [] });

    renderWithProviders(<AdminLegalita />);

    fireEvent.click(screen.getByRole("button", { name: /Nuova area/i }));
    fireEvent.change(screen.getByLabelText("Slug"), {
      target: { value: "antiriciclaggio" },
    });
    fireEvent.change(screen.getByLabelText("Titolo"), {
      target: { value: "Antiriciclaggio" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Crea$/i }));

    expect(createAreaMutate).toHaveBeenCalledTimes(1);
    expect(createAreaMutate).toHaveBeenCalledWith({
      data: { slug: "antiriciclaggio", title: "Antiriciclaggio", position: 0 },
    });
  });

  it("adds a requirement to an existing area", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({
      areas: [
        makeArea({ id: 5, slug: "trasparenza", title: "Trasparenza" }),
      ],
    });

    renderWithProviders(<AdminLegalita />);

    fireEvent.change(screen.getByLabelText("Nuovo requisito"), {
      target: { value: "Pubblicazione dei contratti" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Aggiungi$/i }));

    expect(createRequirementMutate).toHaveBeenCalledTimes(1);
    expect(createRequirementMutate).toHaveBeenCalledWith({
      id: 5,
      data: { title: "Pubblicazione dei contratti", position: 0 },
    });
  });

  it("saves the overall judgment", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({ overallJudgment: "" });

    renderWithProviders(<AdminLegalita />);

    fireEvent.change(
      screen.getByPlaceholderText(
        /Scrivi il giudizio complessivo della Redazione/i,
      ),
      { target: { value: "Buon livello complessivo" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Salva giudizio complessivo/i }),
    );

    expect(updateOverviewMutate).toHaveBeenCalledTimes(1);
    expect(updateOverviewMutate).toHaveBeenCalledWith({
      data: { overallJudgment: "Buon livello complessivo" },
    });
  });

  it("adds a linked act to a requirement and saves the cleaned payload", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({
      areas: [
        makeArea({
          id: 1,
          slug: "trasparenza",
          title: "Trasparenza",
          requirements: [
            makeRequirement({
              id: 20,
              areaId: 1,
              title: "Albo pretorio online",
              linkedActs: [],
            }),
          ],
        }),
      ],
    });

    renderWithProviders(<AdminLegalita />);

    fireEvent.click(
      screen.getByRole("button", { name: "Modifica requisito" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Aggiungi atto/i }));

    fireEvent.change(
      screen.getByPlaceholderText(/Etichetta \(es\. Delibera/i),
      { target: { value: "Delibera n. 12/2025" } },
    );
    fireEvent.change(
      screen.getByPlaceholderText(/\/albo oppure/i),
      { target: { value: "/delibere" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Salva requisito/i }),
    );

    expect(updateRequirementMutate).toHaveBeenCalledTimes(1);
    expect(updateRequirementMutate).toHaveBeenCalledWith({
      id: 20,
      data: expect.objectContaining({
        title: "Albo pretorio online",
        linkedActs: [{ label: "Delibera n. 12/2025", url: "/delibere" }],
      }),
    });
  });

  it("removes an existing linked act and saves the cleared list", () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    mockState.data = makeSection({
      areas: [
        makeArea({
          id: 1,
          slug: "trasparenza",
          title: "Trasparenza",
          requirements: [
            makeRequirement({
              id: 30,
              areaId: 1,
              title: "Albo pretorio online",
              linkedActs: [{ label: "Atto esistente", url: "/albo" }],
            }),
          ],
        }),
      ],
    });

    renderWithProviders(<AdminLegalita />);

    fireEvent.click(
      screen.getByRole("button", { name: "Modifica requisito" }),
    );

    const editor = screen
      .getByDisplayValue("Atto esistente")
      .closest("div") as HTMLElement;
    fireEvent.click(
      within(editor).getByRole("button", { name: "Rimuovi atto collegato" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Salva requisito/i }),
    );

    expect(updateRequirementMutate).toHaveBeenCalledTimes(1);
    expect(updateRequirementMutate).toHaveBeenCalledWith({
      id: 30,
      data: expect.objectContaining({ linkedActs: [] }),
    });
  });
});
