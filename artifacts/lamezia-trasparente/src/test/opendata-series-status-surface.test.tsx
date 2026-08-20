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

    const statusHeading = screen.getByRole("heading", {
      name: "Dati disponibili e aggiornamento",
    });
    const statusSection = statusHeading.closest("section");

    expect(statusSection).not.toBeNull();
    const statusScope = within(statusSection as HTMLElement);

    expect(statusHeading).toBeInTheDocument();
    expect(statusScope.getByText("5 serie")).toBeInTheDocument();
    expect(
      statusScope.getByText("Controllo automatico giornaliero"),
    ).toBeInTheDocument();
    expect(statusScope.getAllByText("Aggiornamento automatico")).toHaveLength(5);
    expect(
      statusScope.getAllByRole("link", { name: "Apri serie" }),
    ).toHaveLength(5);
    expect(statusScope.getByText("19 ago 2026")).toBeInTheDocument();
    expect(statusScope.getByText("giu 2026")).toBeInTheDocument();
    expect(statusScope.getByText("Risorsa corrente")).toBeInTheDocument();
    expect(
      statusScope.getByText(/non espone un anno di riferimento/i),
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
