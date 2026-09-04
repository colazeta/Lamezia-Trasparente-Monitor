import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

const clerkHarness = vi.hoisted(() => ({
  listener: null as
    | ((snapshot: { user: { id: string } | null }) => void)
    | null,
}));

vi.mock("@clerk/react", () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => children,
  SignIn: ({
    forceRedirectUrl,
    path,
    signUpUrl,
  }: {
    forceRedirectUrl: string;
    path: string;
    signUpUrl: string;
  }) => (
    <div
      data-force-redirect-url={forceRedirectUrl}
      data-path={path}
      data-sign-up-url={signUpUrl}
      data-testid="clerk-sign-in"
    />
  ),
  SignUp: ({
    forceRedirectUrl,
    path,
    signInUrl,
  }: {
    forceRedirectUrl: string;
    path: string;
    signInUrl: string;
  }) => (
    <div
      data-force-redirect-url={forceRedirectUrl}
      data-path={path}
      data-sign-in-url={signInUrl}
      data-testid="clerk-sign-up"
    />
  ),
  useClerk: () => ({
    addListener: (
      listener: (snapshot: { user: { id: string } | null }) => void,
    ) => {
      clerkHarness.listener = listener;
      return () => {
        if (clerkHarness.listener === listener) clerkHarness.listener = null;
      };
    },
  }),
}));

vi.mock("@clerk/themes", () => ({ shadcn: {} }));

vi.mock("@/Router", () => ({
  Router: () => <div data-testid="public-router" />,
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

import ClerkApp from "@/ClerkApp";

function renderClerkApp(path: string, queryClient: QueryClient) {
  window.history.replaceState({}, "", path);

  return render(
    <WouterRouter>
      <ClerkApp
        basePath=""
        publishableKey="test-publishable-key"
        queryClient={queryClient}
      />
    </WouterRouter>,
  );
}

function emitUser(id: string | null) {
  expect(clerkHarness.listener).not.toBeNull();
  clerkHarness.listener?.({ user: id ? { id } : null });
}

describe("ClerkApp auth routes and session cache isolation", () => {
  beforeEach(() => {
    clerkHarness.listener = null;
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    clerkHarness.listener = null;
    vi.restoreAllMocks();
  });

  it("renders an explicit sign-up route linked back to sign-in", () => {
    const queryClient = new QueryClient();

    renderClerkApp("/sign-up", queryClient);

    const signUp = screen.getByTestId("clerk-sign-up");
    expect(signUp).toHaveAttribute("data-path", "/sign-up");
    expect(signUp).toHaveAttribute("data-sign-in-url", "/sign-in");
    expect(signUp).toHaveAttribute("data-force-redirect-url", "/redazione");
    expect(screen.queryByTestId("clerk-sign-in")).not.toBeInTheDocument();
  });

  it("keeps sign-in linked to the explicit sign-up route", () => {
    const queryClient = new QueryClient();

    renderClerkApp("/sign-in", queryClient);

    const signIn = screen.getByTestId("clerk-sign-in");
    expect(signIn).toHaveAttribute("data-path", "/sign-in");
    expect(signIn).toHaveAttribute("data-sign-up-url", "/sign-up");
    expect(signIn).toHaveAttribute("data-force-redirect-url", "/redazione");
  });

  it("does not clear the query cache for the first observed user", () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    renderClerkApp("/redazione", queryClient);
    emitUser("user-a");

    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("clears the query cache when the user changes during one mount", () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    renderClerkApp("/redazione", queryClient);
    emitUser("user-a");
    emitUser("user-b");

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("clears the query cache when user identity changes after auth remount", () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    const firstMount = renderClerkApp("/redazione", queryClient);
    emitUser("user-a");
    firstMount.unmount();

    renderClerkApp("/redazione", queryClient);
    emitUser("user-b");

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("does not clear the query cache when the same user returns after remount", () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    const firstMount = renderClerkApp("/redazione", queryClient);
    emitUser("user-a");
    firstMount.unmount();

    renderClerkApp("/redazione", queryClient);
    emitUser("user-a");

    expect(clearSpy).not.toHaveBeenCalled();
  });
});
