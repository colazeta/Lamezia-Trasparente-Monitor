import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";

import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function renderNavbar(path = "/") {
  window.history.pushState({}, "", path);

  return render(
    <ThemeProvider>
      <WouterRouter>
        <Navbar />
      </WouterRouter>
    </ThemeProvider>,
  );
}

describe("Navbar public front door", () => {
  it("keeps public spending visible as the active primary macro-area", () => {
    const { container } = renderNavbar("/contratti/42");

    const spendingMenu = screen.getByRole("button", {
      name: /^Spesa e progetti$/i,
    });

    expect(spendingMenu).toHaveClass("bg-primary/10", "text-primary");
    expect(container.querySelector("header nav")).toHaveClass("xl:flex");
    expect(screen.getByRole("button", { name: "Apri menu" })).toHaveClass(
      "xl:hidden",
    );
  });

  it("exposes five information domains plus a separate participation action", () => {
    renderNavbar("/");

    for (const label of [
      "Decisioni",
      "Spesa e progetti",
      "Comune e risultati",
      "Territorio e legalità",
      "Dati e fonti",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByRole("button", { name: "Partecipa" })).toBeInTheDocument();
    for (const oldLabel of ["Atti", "Comune", "Spesa", "Territorio", "Legalità", "Dati"]) {
      expect(screen.queryByRole("button", { name: oldLabel })).not.toBeInTheDocument();
    }
  });

  it("opens the current mobile domain and wires the accordion as an accessible region", () => {
    renderNavbar("/sviluppatori");

    const menuToggle = screen.getByRole("button", { name: "Apri menu" });
    expect(menuToggle).toHaveAttribute("type", "button");
    fireEvent.click(menuToggle);

    const mobileDomain = screen
      .getAllByRole("button", { name: "Dati e fonti" })
      .find((button) => button.hasAttribute("aria-controls"));

    expect(mobileDomain).toBeDefined();
    expect(mobileDomain).toHaveAttribute("aria-expanded", "true");

    const panelId = mobileDomain?.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);

    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", mobileDomain?.id);
    expect(panel).not.toHaveAttribute("hidden");
    expect(screen.getByRole("button", { name: "Cerca nel sito" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
