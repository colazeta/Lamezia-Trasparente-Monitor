import { render, screen, within } from "@testing-library/react";
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
  it("keeps public spending visible through the active Spesa macro-area", () => {
    const { container } = renderNavbar("/contratti/42");
    const primaryNav = screen.getByRole("navigation", {
      name: "Navigazione principale",
    });
    const spendingTrigger = within(primaryNav).getByRole("button", {
      name: /^Spesa$/i,
    });

    expect(spendingTrigger).toHaveAttribute("aria-expanded", "false");
    expect(spendingTrigger).toHaveClass("bg-primary/10", "text-primary");
    expect(container.querySelector("header nav")).toHaveClass("xl:flex");
    expect(screen.getByRole("button", { name: "Apri menu" })).toHaveClass(
      "xl:hidden",
    );
  });

  it("keeps the current civic macro-areas visible in primary navigation", () => {
    renderNavbar("/");
    const primaryNav = screen.getByRole("navigation", {
      name: "Navigazione principale",
    });

    for (const label of [
      "Atti",
      "Comune",
      "Spesa",
      "Territorio",
      "Legalità",
      "Dati",
      "Partecipa",
    ]) {
      expect(
        within(primaryNav).getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
  });
});
