import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/Router", () => ({
  Router: () => <h1>Router pubblico</h1>,
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

import App from "@/App";

describe("App authentication boundary without Clerk configuration", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it.each(["/", "/opendata", "/amministratori/32", "/redazione-civica"])(
    "keeps %s on the public application shell",
    (path) => {
      window.history.replaceState({}, "", path);
      render(<App />);

      expect(
        screen.getByRole("heading", { name: "Router pubblico" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Redazione non disponibile in questa anteprima"),
      ).not.toBeInTheDocument();
    },
  );

  it.each(["/redazione", "/admin/pareri", "/sign-in", "/sign-up"])(
    "keeps %s closed when Clerk is not configured",
    (path) => {
      window.history.replaceState({}, "", path);
      render(<App />);

      expect(
        screen.getByRole("heading", {
          name: "Redazione non disponibile in questa anteprima",
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Router pubblico" }),
      ).not.toBeInTheDocument();
    },
  );
});
