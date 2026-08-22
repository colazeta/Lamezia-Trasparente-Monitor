import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

let currentUserId: string | null = "user-a";
const clearQueryCache = vi.fn();
const queryClientRef = { current: { clear: clearQueryCache } };
const addListener = vi.fn(
  (
    listener: ({ user }: { user: { id: string } | null }) => void,
  ) => {
    listener({
      user: currentUserId ? { id: currentUserId } : null,
    });
    return vi.fn();
  },
);

vi.mock("@clerk/react", () => ({
  ClerkProvider: ({
    children,
    publishableKey,
    signInUrl,
    signUpUrl,
  }: {
    children: ReactNode;
    publishableKey: string;
    signInUrl: string;
    signUpUrl: string;
  }) => (
    <div
      data-publishable-key={publishableKey}
      data-sign-in-url={signInUrl}
      data-sign-up-url={signUpUrl}
      data-testid="clerk-provider"
    >
      {children}
    </div>
  ),
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
      data-force-redirect={forceRedirectUrl}
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
      data-force-redirect={forceRedirectUrl}
      data-path={path}
      data-sign-in-url={signInUrl}
      data-testid="clerk-sign-up"
    />
  ),
  useClerk: () => ({ addListener }),
}));

vi.mock("@clerk/themes", () => ({ shadcn: {} }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => queryClientRef.current,
}));
vi.mock("@/Router", () => ({
  Router: () => <h1>Redazione protetta</h1>,
}));

import ClerkProtectedRoutes from "@/components/auth/ClerkProtectedRoutes";

function renderProtectedRoutes(path: string) {
  window.history.replaceState({}, "", path);
  return render(
    <WouterRouter>
      <ClerkProtectedRoutes
        basePath=""
        publishableKey="pk_test_civic_monitor"
      />
    </WouterRouter>,
  );
}

describe("ClerkProtectedRoutes", () => {
  beforeEach(() => {
    currentUserId = "user-a";
    clearQueryCache.mockClear();
    queryClientRef.current = { clear: clearQueryCache };
    addListener.mockClear();
  });

  it("configures the protected provider and sign-in route", () => {
    renderProtectedRoutes("/sign-in");

    expect(screen.getByTestId("clerk-provider")).toHaveAttribute(
      "data-publishable-key",
      "pk_test_civic_monitor",
    );
    expect(screen.getByTestId("clerk-sign-in")).toHaveAttribute(
      "data-force-redirect",
      "/redazione",
    );
    expect(screen.getByTestId("clerk-sign-in")).toHaveAttribute(
      "data-sign-up-url",
      "/sign-up",
    );
    expect(addListener).toHaveBeenCalledTimes(1);
  });

  it("clears protected cache when the user changes while routes are unmounted", () => {
    const firstMount = renderProtectedRoutes("/redazione");

    expect(clearQueryCache).not.toHaveBeenCalled();
    firstMount.unmount();

    currentUserId = "user-b";
    renderProtectedRoutes("/redazione");

    expect(clearQueryCache).toHaveBeenCalledTimes(1);
  });

  it("keeps the sign-up flow inside the protected bootstrap", () => {
    renderProtectedRoutes("/sign-up");

    expect(screen.getByTestId("clerk-sign-up")).toHaveAttribute(
      "data-force-redirect",
      "/redazione",
    );
    expect(screen.getByTestId("clerk-sign-up")).toHaveAttribute(
      "data-sign-in-url",
      "/sign-in",
    );
  });

  it("hands protected application routes to the main router", () => {
    renderProtectedRoutes("/redazione/temi");

    expect(
      screen.getByRole("heading", { name: "Redazione protetta" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("clerk-sign-in")).not.toBeInTheDocument();
  });
});
