import { render, screen } from "@testing-library/react";
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

    expect(
      screen.getByRole("heading", { name: "Dati disponibili e aggiornamento" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 serie")).toBeInTheDocument();
    expect(
      screen.getByText("Controllo automatico giornaliero"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Aggiornamento automatico")).toHaveLength(5);
    expect(screen.getAllByRole("link", { name: "Apri serie" })).toHaveLength(5);
    expect(screen.getByText("19 ago 2026")).toBeInTheDocument();
    expect(screen.getByText("giu 2026")).toBeInTheDocument();
    expect(screen.getByText("Risorsa corrente")).toBeInTheDocument();
    expect(
      screen.getByText(/non espone un anno di riferimento/i),
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
