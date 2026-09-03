import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PerformanceProcessChainPanel } from "@/components/performance/PerformanceProcessChainPanel";
import {
  getPerformanceProcessStats,
  performance2024ProcessEvents,
  validatePerformanceProcessChain,
} from "@/data/performanceProcessChain";

describe("performance 2024 process chain", () => {
  it("keeps verified, metadata-only and pending evidence distinct", () => {
    expect(validatePerformanceProcessChain()).toEqual([]);
    expect(getPerformanceProcessStats()).toEqual({
      total: 7,
      pageVerified: 2,
      metadataOnly: 2,
      pending: 3,
    });

    const pending = performance2024ProcessEvents.filter(
      (event) => event.evidenceStatus === "pending-document",
    );
    expect(pending.map((event) => event.stage)).toEqual([
      "oiv-validation",
      "giunta-approval",
      "permanent-publication",
    ]);
    for (const event of pending) {
      expect(event.officialUrl).toBeNull();
      expect(event.sourceLocator).toBeNull();
    }
  });

  it("renders the seven-stage chain without presenting pending stages as failures", () => {
    render(<PerformanceProcessChainPanel />);

    expect(
      screen.getByRole("heading", {
        name: "Dove siamo nella catena di rendicontazione",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Catena Performance 2024" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(7);

    expect(screen.getAllByText("PDF · pagina verificata")).toHaveLength(2);
    expect(screen.getAllByText("Registro ufficiale · metadati")).toHaveLength(2);
    expect(screen.getAllByText("Documento da acquisire")).toHaveLength(3);
    expect(screen.getAllByText("Nessun link verificato")).toHaveLength(3);
    expect(screen.getByText(/pendente non equivale a un esito negativo/i)).toBeInTheDocument();
  });

  it("shows OIV, Giunta and permanent publication as separate future documentary gates", () => {
    render(<PerformanceProcessChainPanel />);

    const list = screen.getByRole("list", { name: "Catena Performance 2024" });
    expect(within(list).getByText("Validazione OIV della Relazione 2024")).toBeInTheDocument();
    expect(
      within(list).getByText("Approvazione della Relazione 2024 da parte della Giunta"),
    ).toBeInTheDocument();
    expect(
      within(list).getByText("Pubblicazione permanente della Relazione 2024"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/validazione OIV → approvazione della Giunta → pubblicazione permanente/i),
    ).toBeInTheDocument();
  });
});
