import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

import { MainLayout } from "@/components/layout/MainLayout";

vi.mock("@/components/layout/Navbar", () => ({
  Navbar: () => <nav aria-label="Navigazione principale" />,
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <footer />,
}));

vi.mock("@/components/admin/MigrationStatusBanner", () => ({
  MigrationStatusBanner: () => null,
}));

vi.mock("@/components/helper/CivicHelperFAB", () => ({
  CivicHelperFAB: () => null,
}));

vi.mock("@/components/helper/CivicHelperOverlays", () => ({
  CivicHelperOverlays: () => null,
}));

function renderHomeLayout(path = "/") {
  window.history.pushState({}, "", path);

  return render(
    <WouterRouter>
      <MainLayout>
        <div>Pagina home</div>
      </MainLayout>
    </WouterRouter>,
  );
}

describe("Home contracts visibility", () => {
  it("exposes contracts from the shared home layout before page content", () => {
    renderHomeLayout("/");

    expect(
      screen.getByRole("link", { name: /apri sezione contratti/i }),
    ).toHaveAttribute("href", "/contratti");
    expect(screen.getByText("Contratti pubblici")).toBeInTheDocument();
  });

  it("keeps the home contracts access out of non-home pages", () => {
    renderHomeLayout("/contratti");

    expect(
      screen.queryByRole("link", { name: /apri sezione contratti/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Pagina home")).toBeInTheDocument();
  });
});
