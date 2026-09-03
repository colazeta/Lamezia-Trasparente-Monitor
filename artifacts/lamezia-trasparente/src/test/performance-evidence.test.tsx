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

  it("shows verified objectives and results while keeping target and OIV separate", () => {
    renderPerformance();

    expect(screen.getByText("Obiettivo")).toBeInTheDocument();
    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getAllByText("Validazione OIV").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("3 obiettivi verificati")).toBeInTheDocument();
    expect(screen.getByText("3 risultati collegati")).toBeInTheDocument();
    expect(screen.getAllByText("Da acquisire").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText(/non dimostra da solo il raggiungimento di un obiettivo/i),
    ).toBeInTheDocument();
  });

  it("keeps metadata, indexed PDF verification and visual verification distinct", () => {
    renderPerformance();

    expect(
      screen.getByRole("heading", { name: "Le fonti prima degli obiettivi" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Metadati verificati")).toHaveLength(4);
    expect(screen.getAllByText("Estrazione pending")).toHaveLength(4);
    expect(screen.getByText("PDF indicizzato · pagine verificate")).toBeInTheDocument();
    expect(screen.getByText("Estrazione verificata")).toBeInTheDocument();
    expect(metricValue("Obiettivi verificati").getByText("3")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dal PDF alle fasi dell'obiettivo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Inclusione ed accessibilità dell'Amministrazione",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/I campi non acquisiti restano null/i)).toBeInTheDocument();
  });

  it("renders the derived phase progress without presenting it as OIV validation", () => {
    renderPerformance();

    const objective13 = screen
      .getByRole("heading", {
        name: "Inclusione ed accessibilità dell'Amministrazione",
      })
      .closest("article");
    expect(objective13).not.toBeNull();
    expect(within(objective13 as HTMLElement).getByText("90%")).toBeInTheDocument();
    expect(
      within(objective13 as HTMLElement).getByText(/Calcolo LT sui pesi di fase/i),
    ).toBeInTheDocument();
    expect(
      within(objective13 as HTMLElement).getByText(/finale 0%/i),
    ).toBeInTheDocument();
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
