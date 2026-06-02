import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { LegalitySection } from "@workspace/api-client-react";

/**
 * Mutable holder so each test can drive the mocked `useGetLegalitySection`
 * hook with a specific loading state / payload before rendering.
 */
const mockState: {
  data: LegalitySection | undefined;
  isLoading: boolean;
} = { data: undefined, isLoading: false };

vi.mock("@workspace/api-client-react", () => ({
  useGetLegalitySection: () => ({
    data: mockState.data,
    isLoading: mockState.isLoading,
  }),
}));

import { Legalita } from "@/pages/Legalita";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter>
            <Legalita />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockState.data = undefined;
  mockState.isLoading = false;
});

afterEach(() => {
  window.localStorage.clear();
});

describe("Legalita page", () => {
  it("shows the empty state when there is no content", () => {
    mockState.isLoading = false;
    mockState.data = {
      overallJudgment: "",
      updatedAt: null,
      areas: [],
    };

    renderPage();

    expect(screen.getByText("Legalità e Trasparenza")).toBeInTheDocument();
    expect(screen.getByText("Sezione in preparazione")).toBeInTheDocument();
  });

  it("treats an undefined payload (still loading) without showing the empty state", () => {
    mockState.isLoading = true;
    mockState.data = undefined;

    renderPage();

    expect(screen.getByText("Legalità e Trasparenza")).toBeInTheDocument();
    expect(
      screen.queryByText("Sezione in preparazione"),
    ).not.toBeInTheDocument();
  });

  it("renders the overall judgment, areas and requirements when populated", () => {
    mockState.isLoading = false;
    mockState.data = {
      overallJudgment: "Giudizio complessivo di prova",
      updatedAt: "2026-06-01T10:00:00.000Z",
      areas: [
        {
          id: 1,
          slug: "trasparenza",
          title: "Trasparenza",
          description: "Area di prova",
          finalJudgment: "Giudizio sull'area",
          position: 0,
          createdAt: "2026-06-01T10:00:00.000Z",
          updatedAt: "2026-06-01T10:00:00.000Z",
          requirements: [
            {
              id: 10,
              areaId: 1,
              title: "Albo pretorio online",
              description: "Descrizione requisito",
              status: "present",
              comment: "Commento della Redazione",
              linkedActs: [
                { label: "Atto interno", url: "/albo" },
                { label: "Atto esterno", url: "https://example.org/atto" },
              ],
              position: 0,
              createdAt: "2026-06-01T10:00:00.000Z",
              updatedAt: "2026-06-01T10:00:00.000Z",
            },
          ],
        },
      ],
    };

    renderPage();

    expect(
      screen.getByText("Giudizio complessivo della Redazione"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Giudizio complessivo di prova"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Trasparenza" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Albo pretorio online")).toBeInTheDocument();
    expect(screen.getByText("Presente")).toBeInTheDocument();

    // The internal act renders as a wouter Link to its internal path; the
    // external one is a new-tab anchor.
    const internal = screen.getByRole("link", { name: /Atto interno/ });
    expect(internal).toHaveAttribute("href", "/albo");
    const external = screen.getByRole("link", { name: /Atto esterno/ });
    expect(external).toHaveAttribute("href", "https://example.org/atto");
    expect(external).toHaveAttribute("target", "_blank");

    // The empty state must not appear when there is content.
    expect(
      screen.queryByText("Sezione in preparazione"),
    ).not.toBeInTheDocument();
  });

  it("shows a per-area placeholder when an area has no requirements", () => {
    mockState.isLoading = false;
    mockState.data = {
      overallJudgment: "",
      updatedAt: null,
      areas: [
        {
          id: 2,
          slug: "partecipazione",
          title: "Partecipazione",
          description: "",
          finalJudgment: "",
          position: 0,
          createdAt: "2026-06-01T10:00:00.000Z",
          updatedAt: "2026-06-01T10:00:00.000Z",
          requirements: [],
        },
      ],
    };

    renderPage();

    const heading = screen.getByRole("heading", { name: "Partecipazione" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    expect(
      within(section as HTMLElement).getByText(
        "Nessun requisito ancora pubblicato per quest'area.",
      ),
    ).toBeInTheDocument();
  });
});
