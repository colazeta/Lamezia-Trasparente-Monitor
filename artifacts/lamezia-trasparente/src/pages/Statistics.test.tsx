import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Statistics } from "./Statistics";

const state = vi.hoisted(() => ({ stats: undefined as unknown, failed: true }));
vi.mock("@workspace/api-client-react", () => {
  const unavailable = () => ({ data: undefined, isLoading: false, isError: state.failed });
  return {
    useGetStatsOverview: () => ({ ...unavailable(), data: state.stats }),
    useGetTopThemes: unavailable,
    useGetShareStats: unavailable,
    useGetRecentActivity: unavailable,
    useGetPublicationsTimeline: unavailable,
  };
});

describe("Statistics source availability", () => {
  it("does not present a failed API as observed zero activity", () => {
    state.stats = undefined;
    state.failed = true;
    render(<Statistics />);
    expect(screen.getByRole("status")).toHaveTextContent("Alcune statistiche non sono disponibili");
    expect(screen.getAllByText("Non disponibile")).toHaveLength(5);
    expect(screen.queryByText("Nessuna pubblicazione registrata nel periodo selezionato.")).not.toBeInTheDocument();
    expect(screen.getByText("Serie delle pubblicazioni non disponibile.")).toBeInTheDocument();
  });

  it("retains genuine observed zero values", () => {
    state.stats = { totalRelevance: 0, totalShares: 0, contracts: 0, monitoredAmount: 0 };
    state.failed = false;
    render(<Statistics />);
    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getByText("€ 0.00M")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
