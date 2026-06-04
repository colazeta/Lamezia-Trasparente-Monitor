import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

type Pub = {
  id: number;
  oggetto: string;
  tipologia: string;
  brief: string | null;
  briefManual: boolean;
  briefGeneratedAt: string | null;
  attachments: unknown[];
  cups: string[];
  macrotema: string;
  isNew: boolean;
  isPnrr: boolean;
  pubStart: string | null;
  pubEnd: string | null;
  dataAtto: string | null;
  numRegGen: string | null;
  provenienza: string | null;
  firstSeenAt: string;
};

const basePub: Pub = {
  id: 42,
  oggetto: "Determina di esempio",
  tipologia: "Determina",
  brief: "Sintesi esistente generata.",
  briefManual: false,
  briefGeneratedAt: "2026-06-01T10:00:00.000Z",
  attachments: [],
  cups: [],
  macrotema: "altro",
  isNew: false,
  isPnrr: false,
  pubStart: "2026-06-01T10:00:00.000Z",
  pubEnd: null,
  dataAtto: "2026-06-01T10:00:00.000Z",
  numRegGen: null,
  provenienza: null,
  firstSeenAt: "2026-06-01T10:00:00.000Z",
};

const mockState: { pub: Pub } = { pub: { ...basePub } };

const regenerateMutate = vi.fn();
const saveMutate = vi.fn();

vi.mock("wouter", async () => {
  const actual = await vi.importActual<typeof import("wouter")>("wouter");
  return {
    ...actual,
    useRoute: () => [true, { id: "42" }],
  };
});

vi.mock("@workspace/api-client-react", () => ({
  useGetPublication: () => ({
    data: mockState.pub,
    isLoading: false,
    isError: false,
  }),
  useGetPublicationStoria: () => ({ data: undefined, isLoading: false }),
  useRegeneratePublicationBrief: () => ({
    mutate: regenerateMutate,
    isPending: false,
  }),
  useSetPublicationBrief: () => ({ mutate: saveMutate, isPending: false }),
  getGetPublicationQueryKey: (id: number) => ["mock", "publication", id],
  getGetPublicationStoriaQueryKey: (id: number) => ["mock", "storia", id],
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

import { AlboDetail } from "@/pages/AlboDetail";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

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

describe("AlboDetail brief admin", () => {
  afterEach(() => {
    sessionStorage.clear();
    regenerateMutate.mockClear();
    saveMutate.mockClear();
    mockState.pub = { ...basePub };
  });

  it("hides the editorial panel when no token is stored", () => {
    renderWithProviders(<AlboDetail />);
    expect(screen.queryByTestId("brief-admin")).not.toBeInTheDocument();
  });

  describe("authenticated", () => {
    beforeEach(() => {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
    });

    it("shows the AI-source badge and triggers regeneration on click", () => {
      renderWithProviders(<AlboDetail />);
      expect(screen.getByTestId("badge-brief-source")).toHaveTextContent(
        "Generata AI",
      );
      fireEvent.click(screen.getByTestId("button-regenerate-brief"));
      expect(regenerateMutate).toHaveBeenCalledTimes(1);
      expect(regenerateMutate.mock.calls[0][0]).toEqual({ id: 42 });
    });

    it("marks the badge as hand-written when briefManual is true", () => {
      mockState.pub = { ...basePub, briefManual: true };
      renderWithProviders(<AlboDetail />);
      expect(screen.getByTestId("badge-brief-source")).toHaveTextContent(
        "Scritta a mano",
      );
    });

    it("opens the editor and saves a hand-written summary", () => {
      renderWithProviders(<AlboDetail />);
      fireEvent.click(screen.getByTestId("button-edit-brief"));
      const textarea = screen.getByTestId("textarea-brief");
      fireEvent.change(textarea, { target: { value: "Nuova sintesi a mano" } });
      fireEvent.click(screen.getByTestId("button-save-brief"));
      expect(saveMutate).toHaveBeenCalledTimes(1);
      expect(saveMutate.mock.calls[0][0]).toEqual({
        id: 42,
        data: { brief: "Nuova sintesi a mano" },
      });
    });
  });
});
