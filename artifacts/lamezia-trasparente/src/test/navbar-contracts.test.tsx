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
  it("keeps public spending visible as a primary navigation entry", () => {
    const { container } = renderNavbar("/contratti/42");

    const spendingLink = screen.getByRole("link", { name: /^Spesa$/i });

    expect(spendingLink).toHaveAttribute("href", "/contratti");
    expect(container.querySelector("header nav")).toHaveClass("lg:flex");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass(
      "lg:hidden",
    );
  });

  it("keeps the three civic entry points visible in primary navigation", () => {
    renderNavbar("/");

    expect(screen.getByRole("link", { name: /^Oggi$/i })).toHaveAttribute(
      "href",
      "/albo/",
    );
    expect(screen.getByRole("link", { name: /^Spesa$/i })).toHaveAttribute(
      "href",
      "/contratti",
    );
    expect(screen.getByRole("link", { name: /^Partecipa$/i })).toHaveAttribute(
      "href",
      "/accesso-civico",
    );
  });
});
