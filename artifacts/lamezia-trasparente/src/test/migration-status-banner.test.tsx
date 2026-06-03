import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";

import { MigrationStatusBanner } from "@/components/admin/MigrationStatusBanner";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function renderAt(path: string) {
  window.history.replaceState(null, "", path);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <MigrationStatusBanner />
      </WouterRouter>
    </QueryClientProvider>,
  );
}

describe("MigrationStatusBanner", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not render outside the admin area", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "pending", migration: { pendingTags: ["0007_x"] } }),
    );

    renderAt("/contratti");

    await Promise.resolve();
    expect(
      screen.queryByTestId("banner-migration-status"),
    ).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the banner and names pending migrations in the admin area", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "pending",
        migration: {
          lastAppliedTag: "0006_prev",
          appliedCount: 6,
          journalCount: 8,
          pendingTags: ["0007_alpha", "0008_beta"],
        },
      }),
    );

    renderAt("/admin/cronistoria");

    expect(
      await screen.findByTestId("banner-migration-status"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("text-pending-migrations")).toHaveTextContent(
      "0007_alpha, 0008_beta",
    );
    expect(
      screen.getByText(/pnpm --filter @workspace\/db run migrate/),
    ).toBeInTheDocument();
  });

  it("stays hidden when the database is up to date", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "ok",
        migration: { lastAppliedTag: "0008_beta", pendingTags: [] },
      }),
    );

    renderAt("/admin");

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(
      screen.queryByTestId("banner-migration-status"),
    ).not.toBeInTheDocument();
  });

  it("shows an error banner when the status cannot be read", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "error", error: "Could not read migration status." }, 503),
    );

    renderAt("/admin");

    expect(
      await screen.findByTestId("banner-migration-status"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Stato del database non verificabile/),
    ).toBeInTheDocument();
  });
});
