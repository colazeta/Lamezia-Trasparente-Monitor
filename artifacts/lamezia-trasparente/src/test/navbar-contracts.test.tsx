import { render, screen } from "@testing-library/react";
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

    const spendingTrigger = screen.getByRole("button", { name: /^Spesa$/i });

    expect(spendingTrigger).toHaveClass("bg-primary/10");
    expect(container.querySelector("header nav")).toHaveClass("xl:flex");
    expect(screen.getByRole("button", { name: "Apri menu" })).toHaveClass(
      "xl:hidden",
    );
  });

  it("keeps the seven civic macro-areas visible in primary navigation", () => {
    renderNavbar("/");

    for (const label of [
      "Atti",
      "Comune",
      "Spesa",
      "Territorio",
      "Legalità",
      "Dati",
      "Partecipa",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(
      screen.queryByRole("link", { name: /^Oggi$/i }),
    ).not.toBeInTheDocument();
  });
});
