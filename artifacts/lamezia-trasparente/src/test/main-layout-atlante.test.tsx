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
  CivicHelperFAB: () => null,
}));

vi.mock("@/components/helper/CivicAssistant", () => ({
  CivicAssistant: () => null,
}));

vi.mock("@/components/helper/CivicWelcome", () => ({
  CivicWelcome: () => null,
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

const INTERNAL_PUBLIC_ROUTES = [
  "/convocazioni",
  "/delibere",
  "/albo",
  "/contratti",
  "/incarichimetro",
  "/pnrr",
  "/organi",
  "/amministratori",
  "/monitoraggio",
  "/criticita-pubbliche",
  "/segnalazioni",
  "/fonti-dati",
  "/stato-monitoraggio",
  "/metodologia",
  "/atlante-territoriale",
  "/legalita",
  "/legalita/timeline",
  "/legalita/trame-festival",
] as const;

describe("MainLayout public route content", () => {
  it.each(INTERNAL_PUBLIC_ROUTES)(
    "lets %s start from its own page body",
    (route) => {
      renderLayoutAt(route);

      expect(screen.queryByTestId("section-scaffold")).not.toBeInTheDocument();
      expect(screen.getByText("Pagina pubblica")).toBeInTheDocument();
    },
  );
});
