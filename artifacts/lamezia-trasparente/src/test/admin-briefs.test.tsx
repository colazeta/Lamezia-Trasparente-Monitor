import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

type BriefStatus = {
  running: boolean;
  pending: number;
  withBrief: number;
  total: number;
};

/**
 * Mutable holder so each test can supply its own status to the mocked
 * `useGetBriefsStatus` hook before rendering.
 */
const mockState: { status: BriefStatus; isLoading: boolean } = {
  status: { running: false, pending: 0, withBrief: 0, total: 0 },
  isLoading: false,
};

const generateMutate = vi.fn();

vi.mock("@workspace/api-client-react", () => ({
  useGetBriefsStatus: () => ({
    data: mockState.status,
    isLoading: mockState.isLoading,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useGenerateBriefs: () => ({ mutate: generateMutate, isPending: false }),
  getGetBriefsStatusQueryKey: () => ["mock", "briefsStatus"],
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { AdminBriefs } from "@/pages/AdminBriefs";

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

describe("AdminBriefs", () => {
  afterEach(() => {
    generateMutate.mockClear();
    mockState.status = { running: false, pending: 0, withBrief: 0, total: 0 };
    mockState.isLoading = false;
  });

  it("shows coverage, progress-bar width and triggers generation on click", () => {
    mockState.status = {
      running: false,
      pending: 3,
      withBrief: 7,
      total: 10,
    };

    renderWithProviders(<AdminBriefs />);

    expect(screen.getByTestId("text-briefs-coverage")).toHaveTextContent(
      "7 di 10 atti con sintesi",
    );
    expect(screen.getByTestId("text-briefs-coverage")).toHaveTextContent(
      "3 ancora da generare",
    );

    // 7 of 10 = 70%
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "70");
    const fill = progressbar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("70%");

    const btn = screen.getByTestId("button-generate-briefs");
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(generateMutate).toHaveBeenCalledTimes(1);
  });

  it("disables the button and shows the running state during a batch", () => {
    mockState.status = {
      running: true,
      pending: 5,
      withBrief: 5,
      total: 10,
    };

    renderWithProviders(<AdminBriefs />);

    expect(screen.getByTestId("status-running")).toBeInTheDocument();
    expect(screen.getByTestId("button-generate-briefs")).toBeDisabled();
  });

  it("shows the complete state and disables the button when nothing is pending", () => {
    mockState.status = {
      running: false,
      pending: 0,
      withBrief: 10,
      total: 10,
    };

    renderWithProviders(<AdminBriefs />);

    expect(screen.getByTestId("status-complete")).toBeInTheDocument();
    expect(screen.getByTestId("button-generate-briefs")).toBeDisabled();
  });
});
