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

vi.mock("@/components/layout/SectionHeader", () => ({
  SectionHeader: () => <div data-testid="section-scaffold" />,
}));

vi.mock("@/components/admin/MigrationStatusBanner", () => ({
  MigrationStatusBanner: () => null,
}));

vi.mock("@/components/helper/CivicHelperFAB", () => ({
  CivicHelperFAB: () => <div data-testid="civic-helper-fab" />,
}));

vi.mock("@/components/helper/CivicAssistant", () => ({
  CivicAssistant: () => <div data-testid="civic-assistant" />,
}));

vi.mock("@/components/helper/CivicWelcome", () => ({
  CivicWelcome: () => <div data-testid="civic-welcome" />,
}));

function renderLayoutAt(path: string) {
  window.history.pushState({}, "", path);

  return render(
    <WouterRouter>
      <MainLayout>
        <div>Pagina pubblica</div>
      </MainLayout>
    </WouterRouter>,
  );
}

describe("MainLayout Atlante route", () => {
  it("lets Atlante territoriale start from its explorer instead of the diagnostic scaffold", () => {
    renderLayoutAt("/atlante-territoriale");

    expect(screen.queryByTestId("section-scaffold")).not.toBeInTheDocument();
    expect(screen.queryByTestId("civic-helper-fab")).not.toBeInTheDocument();
    expect(screen.queryByTestId("civic-assistant")).not.toBeInTheDocument();
    expect(screen.queryByTestId("civic-welcome")).not.toBeInTheDocument();
    expect(screen.getByText("Pagina pubblica")).toBeInTheDocument();
  });

  it("keeps the civic scaffold on ordinary public routes", () => {
    renderLayoutAt("/contratti");

    expect(screen.getByTestId("section-scaffold")).toBeInTheDocument();
    expect(screen.getByTestId("civic-helper-fab")).toBeInTheDocument();
    expect(screen.getByTestId("civic-assistant")).toBeInTheDocument();
    expect(screen.getByTestId("civic-welcome")).toBeInTheDocument();
  });
});
