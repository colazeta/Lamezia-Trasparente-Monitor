import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Router as WouterRouter } from "wouter";

const { CATEGORIES } = vi.hoisted(() => ({
  CATEGORIES: [
    {
      id: 1,
      name: "Servizi",
      description: "Indicatori di prova",
      indicators: [
        {
          id: 1,
          title: "Indicatore completo",
          unit: "%",
          source: "ISTAT",
          updateMode: "automatic",
          polarity: "higher_better",
          latestValue: { value: 120, period: "2025" },
          previousValue: { value: 110, period: "2024" },
          recentValues: [
            { value: 100, period: "2023" },
            { value: 110, period: "2024" },
            { value: 120, period: "2025" },
          ],
        },
        {
          id: 2,
          title: "Indicatore puntuale",
          unit: "n.",
          source: "Comune di Lamezia Terme",
          updateMode: "manual",
          polarity: "neutral",
          latestValue: { value: 50, period: "2025" },
          previousValue: null,
          recentValues: [{ value: 50, period: "2025" }],
        },
        {
          id: 3,
          title: "Indicatore senza dato",
          unit: "n.",
          source: "",
          updateMode: "manual",
          polarity: "neutral",
          latestValue: null,
          previousValue: null,
          recentValues: [],
        },
      ],
    },
  ],
}));

vi.mock("@workspace/api-client-react", () => ({
  useListPerformanceCategories: () => ({
    data: CATEGORIES,
    isLoading: false,
  }),
  useListPerformanceFeedStatus: () => ({
    data: [{ lastUpdatedAt: "2026-09-02T12:00:00.000Z" }],
  }),
}));

import { Performance } from "@/pages/Performance";

function renderPerformance() {
  return render(
    <WouterRouter>
      <Performance />
    </WouterRouter>,
  );
}

function metricValue(label: string) {
  const labelNode = screen.getByText(label);
  const card = labelNode.closest("div.rounded-xl");
  if (!card) throw new Error(`Card non trovata per ${label}`);
  return within(card as HTMLElement);
}

describe("Performance evidence-first landing", () => {
  it("derives observable coverage from the indicators without inventing a score", () => {
    renderPerformance();

    expect(
      screen.getByRole("heading", {
        name: /Dai dati pubblicati ai risultati verificabili/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/non assegna un voto al Comune/i)).toBeInTheDocument();

    expect(metricValue("Indicatori censiti").getByText("3")).toBeInTheDocument();
    expect(metricValue("Con valore pubblicato").getByText("2")).toBeInTheDocument();
    expect(metricValue("Con serie recente").getByText("1")).toBeInTheDocument();
    expect(metricValue("Con fonte dichiarata").getByText("2")).toBeInTheDocument();
  });

  it("marks the objective-to-OIV layer as documentary work still to acquire", () => {
    renderPerformance();

    expect(screen.getByText("Obiettivo")).toBeInTheDocument();
    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getByText("Validazione OIV")).toBeInTheDocument();
    expect(screen.getAllByText("Da acquisire").length).toBeGreaterThanOrEqual(3);
    expect(
      screen.getByText(/non dimostra da solo il raggiungimento di un obiettivo/i),
    ).toBeInTheDocument();
  });

  it("keeps verified source metadata separate from verified objective records", () => {
    renderPerformance();

    expect(
      screen.getByRole("heading", { name: "Le fonti prima degli obiettivi" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Metadati verificati")).toHaveLength(4);
    expect(screen.getAllByText("Estrazione pending")).toHaveLength(4);
    expect(
      screen.getByText(/fonti pertinenti censite · estrazione pending/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/trattino sopra indica quindi.*non ancora verificato/i),
    ).toBeInTheDocument();
    expect(metricValue("Obiettivi verificati").getByText("—")).toBeInTheDocument();
  });

  it("exposes coverage bars as accessible progress indicators", () => {
    renderPerformance();

    expect(
      screen.getByRole("progressbar", { name: "Valore più recente" }),
    ).toHaveAttribute("aria-valuenow", "67");
    expect(
      screen.getByRole("progressbar", { name: "Serie recente" }),
    ).toHaveAttribute("aria-valuenow", "33");
    expect(
      screen.getByRole("progressbar", { name: "Fonte dichiarata" }),
    ).toHaveAttribute("aria-valuenow", "67");
  });
});
