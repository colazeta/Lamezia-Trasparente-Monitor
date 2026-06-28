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

describe("Navbar contracts access", () => {
  it("keeps contracts visible as a primary navigation entry", () => {
    const { container } = renderNavbar("/contratti/42");

    const contractsLink = screen.getByRole("link", { name: /^Contratti$/i });

    expect(contractsLink).toHaveAttribute("href", "/contratti");
    expect(container.querySelector("header nav")).toHaveClass("lg:flex");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass(
      "lg:hidden",
    );
  });
});
