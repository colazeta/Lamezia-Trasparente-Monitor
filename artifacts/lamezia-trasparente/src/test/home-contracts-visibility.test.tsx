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

function renderLayout(path = "/") {
  window.history.pushState({}, "", path);

  return render(
    <WouterRouter>
      <MainLayout>
        <div>Contenuto pagina</div>
      </MainLayout>
    </WouterRouter>,
  );
}

describe("Main layout public front door", () => {
  it("does not inject a competing contracts banner before home content", () => {
    renderLayout("/");

    expect(
      screen.queryByRole("link", { name: /apri sezione contratti/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Evidenze dati della piattaforma"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Contenuto pagina")).toBeInTheDocument();
  });

  it("keeps shared page content unchanged on non-home routes", () => {
    renderLayout("/contratti");

    expect(
      screen.queryByRole("link", { name: /apri sezione contratti/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Contenuto pagina")).toBeInTheDocument();
  });
});
