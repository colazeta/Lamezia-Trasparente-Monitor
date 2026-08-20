import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OpenDataThemeLibrary } from "@/components/opendata/OpenDataThemeLibrary";

describe("Open Data freshness surface", () => {
  it("shows source freshness before thematic browsing", () => {
    render(
      <OpenDataThemeLibrary
        onSelectTheme={vi.fn()}
        selectedThemeId={null}
      />,
    );

    const statusRegion = screen.getByRole("region", {
      name: "Dati disponibili e aggiornamento",
    });

    expect(
      within(statusRegion).getByRole("heading", {
        name: "Dati disponibili e aggiornamento",
      }),
    ).toBeInTheDocument();
    expect(within(statusRegion).getByText("5 serie")).toBeInTheDocument();
    expect(
      within(statusRegion).getByText("Controllo automatico giornaliero"),
    ).toBeInTheDocument();
    expect(
      within(statusRegion).getAllByText("Aggiornamento automatico"),
    ).toHaveLength(5);
    expect(
      within(statusRegion).getAllByRole("link", { name: "Apri serie" }),
    ).toHaveLength(5);
    expect(within(statusRegion).getByText("19 ago 2026")).toBeInTheDocument();
    expect(within(statusRegion).getByText("giu 2026")).toBeInTheDocument();
    expect(within(statusRegion).getByText("Risorsa corrente")).toBeInTheDocument();
    expect(
      within(statusRegion).getByText(/non espone un anno di riferimento/i),
    ).toBeInTheDocument();
  });

  it("keeps category exploration directly below freshness status", () => {
    render(
      <OpenDataThemeLibrary
        onSelectTheme={vi.fn()}
        selectedThemeId={null}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Esplora per categoria" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tutti i dataset/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
