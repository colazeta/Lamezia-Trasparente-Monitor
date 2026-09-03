import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

vi.mock("@/Router", () => ({
  Router: () => <h1>Router pubblico</h1>,
}));

vi.mock("@/ClerkApp", () => ({
  default: ({ publishableKey }: { publishableKey: string }) => (
    <h1>Boundary auth {publishableKey}</h1>
  ),
}));

vi.mock("@/components/helper/CivicHelperContext", () => ({
  CivicHelperProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/theme/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("sonner", () => ({ Toaster: () => null }));

import { AppRoutes } from "@/App";

function renderRoutesAt(path: string, clerkPubKey = "configured-test-key") {
  window.history.replaceState({}, "", path);

  return render(
    <WouterRouter>
      <AppRoutes clerkPubKey={clerkPubKey} />
    </WouterRouter>,
  );
}

describe("App authentication boundary", () => {
  it.each(["/", "/opendata", "/amministratori/32", "/redazione-civica"])(
    "keeps %s on the public shell when authentication is configured",
    (path) => {
      renderRoutesAt(path);

      expect(
        screen.getByRole("heading", { name: "Router pubblico" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /Boundary auth/ }),
      ).not.toBeInTheDocument();
    },
  );

  it("loads the authentication boundary on a protected route", async () => {
    renderRoutesAt("/redazione");

    expect(
      await screen.findByRole("heading", {
        name: "Boundary auth configured-test-key",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Router pubblico" }),
    ).not.toBeInTheDocument();
  });

  it("fails closed on a protected route when authentication is unavailable", () => {
    renderRoutesAt("/admin/pareri", "");

    expect(
      screen.getByRole("heading", {
        name: "Redazione non disponibile in questa anteprima",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Router pubblico" }),
    ).not.toBeInTheDocument();
  });
});
