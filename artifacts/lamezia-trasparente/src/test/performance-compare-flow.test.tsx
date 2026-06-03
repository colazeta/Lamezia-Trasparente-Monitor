import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
} from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

/**
 * Minimal indicator fixtures. Each indicator has a short historical series so
 * the comparison chart has something to plot.
 */
interface FakeValue {
  id: number;
  indicatorId: number;
  period: string;
  value: number;
  note: null;
  manual: boolean;
  source: null;
  createdAt: string;
  updatedAt: string;
}

function val(indicatorId: number, period: string, value: number): FakeValue {
  return {
    id: indicatorId * 100 + Number(period),
    indicatorId,
    period,
    value,
    note: null,
    manual: true,
    source: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

const INDICATOR_IDS = [1, 2, 3, 4, 5, 6];

function indicatorTitle(id: number): string {
  return `Indicatore ${id}`;
}

const INDICATOR_DETAILS = Object.fromEntries(
  INDICATOR_IDS.map((id) => [
    id,
    {
      id,
      title: indicatorTitle(id),
      unit: id % 2 === 0 ? "%" : "n.",
      values: [
        val(id, "2021", 100 + id),
        val(id, "2022", 110 + id * 2),
        val(id, "2023", 120 + id * 3),
      ],
    },
  ]),
);

const CATEGORIES = [
  {
    id: 1,
    name: "Categoria Test",
    indicators: INDICATOR_IDS.map((id) => ({
      id,
      title: indicatorTitle(id),
      unit: id % 2 === 0 ? "%" : "n.",
    })),
  },
];

vi.mock("@workspace/api-client-react", () => ({
  useListPerformanceCategories: () => ({
    data: CATEGORIES,
    isLoading: false,
  }),
  useGetPerformanceIndicator: (
    id: string,
    opts?: { query?: { enabled?: boolean } },
  ) => {
    const enabled = opts?.query?.enabled ?? true;
    const numeric = Number.parseInt(id, 10);
    const detail = INDICATOR_DETAILS[numeric];
    if (!enabled || !detail) {
      return { data: undefined, isLoading: false };
    }
    return { data: detail, isLoading: false };
  },
  getGetPerformanceIndicatorQueryKey: (id: string) => [
    `/api/performance/indicators/${id}`,
  ],
}));

// recharts' ResponsiveContainer measures its parent via layout APIs that jsdom
// does not implement (it would report 0×0 and render nothing). Replace it with a
// pass-through that injects a fixed size so the chart renders synchronously.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 800, height: 320 }),
  };
});

import { PerformanceCompare } from "@/pages/PerformanceCompare";

beforeAll(() => {
  // Radix Popover / cmdk rely on these pointer + scroll APIs that jsdom lacks.
  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.scrollIntoView = vi.fn();
  proto.hasPointerCapture = vi.fn(() => false);
  proto.setPointerCapture = vi.fn();
  proto.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  // Each test starts from a clean URL (no ?ids / ?mode preselection).
  window.history.replaceState({}, "", "/");
});

function renderCompare() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter>
            <PerformanceCompare />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

/**
 * Select the indicator with the given `id` from the picker. The popover stays
 * open after a selection (cmdk does not auto-close it), so we only open it when
 * the option list is not already visible — re-clicking the trigger would toggle
 * it shut.
 */
function pickIndicator(id: number) {
  if (screen.queryAllByRole("listbox").length === 0) {
    const trigger = screen.getByRole("button", {
      name: /Aggiungi indicatore/,
    });
    fireEvent.pointerDown(trigger, { button: 0 });
    fireEvent.click(trigger);
  }
  const option = screen.getByRole("option", {
    name: new RegExp(indicatorTitle(id)),
  });
  fireEvent.click(option);
}

describe("PerformanceCompare interactive flow", () => {
  it("shows the empty state until at least two indicators are selected", () => {
    renderCompare();

    // With nothing selected, the empty-state prompt is visible and no chart.
    expect(
      screen.getByText(/per visualizzarne le serie storiche affiancate/),
    ).toBeInTheDocument();

    // Selecting a single indicator is still below the threshold.
    pickIndicator(1);
    expect(
      screen.getByText(/per visualizzarne le serie storiche affiancate/),
    ).toBeInTheDocument();

    // The "Doppio asse" toggle stays disabled with fewer than two indicators.
    expect(
      screen.getByRole("radio", { name: /Doppio asse/ }),
    ).toBeDisabled();
  });

  it("renders the chart once two indicators are selected", async () => {
    const { container } = renderCompare();

    pickIndicator(1);
    pickIndicator(2);

    // The empty-state prompt is gone…
    expect(
      screen.queryByText(/per visualizzarne le serie storiche affiancate/),
    ).not.toBeInTheDocument();

    // …and the chart renders one line per selected indicator.
    await waitFor(() => {
      expect(container.querySelectorAll(".recharts-line").length).toBe(2);
    });
  });

  it("toggles to 'Doppio asse' and renders both Y axes", async () => {
    const { container } = renderCompare();

    pickIndicator(1);
    pickIndicator(2);

    // Default normalized view uses a single (left) Y axis.
    await waitFor(() => {
      expect(container.querySelectorAll(".recharts-line").length).toBe(2);
    });
    expect(container.querySelectorAll(".recharts-yAxis").length).toBe(1);

    const dualToggle = screen.getByRole("radio", { name: /Doppio asse/ });
    expect(dualToggle).not.toBeDisabled();
    fireEvent.click(dualToggle);

    // Absolute / dual-axis view exposes a left and a right Y axis.
    await waitFor(() => {
      expect(container.querySelectorAll(".recharts-yAxis").length).toBe(2);
    });
  });

  it("removing a chip drops back below the threshold and re-shows the empty state", async () => {
    const { container } = renderCompare();

    pickIndicator(1);
    pickIndicator(2);
    await waitFor(() => {
      expect(container.querySelectorAll(".recharts-line").length).toBe(2);
    });

    // Remove one of the two selected indicators via its chip.
    const removeButtons = screen.getAllByRole("button", { name: /^Rimuovi/ });
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[0]);

    // One indicator left → empty state returns.
    expect(
      screen.getByText(/per visualizzarne le serie storiche affiancate/),
    ).toBeInTheDocument();
  });

  it("caps the selection at five indicators", () => {
    renderCompare();

    // Select the maximum number of indicators.
    [1, 2, 3, 4, 5].forEach(pickIndicator);

    // The picker badge reports 5/5 and there are five chips.
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Rimuovi/ }).length).toBe(5);

    // The picker is still open from selecting; the sixth indicator's option is
    // disabled and cannot be added.
    const sixth = screen.getByRole("option", {
      name: new RegExp(indicatorTitle(6)),
    });
    expect(sixth).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(sixth);
    // Still capped at five — no sixth chip appeared.
    expect(screen.getAllByRole("button", { name: /^Rimuovi/ }).length).toBe(5);
  });
});
