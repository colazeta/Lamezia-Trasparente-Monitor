import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { AdminDatabase } from "@/pages/AdminDatabase";

const auth = vi.hoisted(() => ({
  user: { id: "user_test" } as { id: string } | null,
  token: vi.fn(async () => "test-session"),
  signOut: vi.fn(),
}));
vi.mock("@clerk/react", () => ({
  useUser: () => ({ isLoaded: true, user: auth.user }),
  useAuth: () => ({ getToken: auth.token }),
  useClerk: () => ({ signOut: auth.signOut }),
  SignIn: () => <div>Accesso Clerk</div>,
}));

const catalog = {
  capturedAt: "2026-09-07T12:00:00Z",
  database: "test",
  version: "18",
  bytes: 8192,
  migrationCount: 19,
  missingTables: [],
  tables: [
    {
      name: "categories",
      schema: "public",
      estimatedRows: null,
      bytes: 8192,
      rls: false,
      registered: true,
      issues: [],
      relations: [],
      constraints: [],
      indexes: [],
      columns: [
        {
          name: "id",
          type: "integer",
          nullable: false,
          default: null,
          primaryKey: true,
          ordinal: 1,
          redacted: false,
        },
        {
          name: "name",
          type: "text",
          nullable: true,
          default: null,
          primaryKey: false,
          ordinal: 2,
          redacted: false,
        },
      ],
    },
  ],
};
function view() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const component = render(
    <Router>
      <QueryClientProvider client={client}>
        <AdminDatabase />
      </QueryClientProvider>
    </Router>,
  );
  return { ...component, client };
}
beforeEach(() => {
  auth.user = { id: "user_test" };
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("private database console", () => {
  it("requires sign-in and makes no data request before authentication", () => {
    auth.user = null;
    view();
    expect(screen.getByText("Accesso Clerk")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not show a catalog when the server rejects the account", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Accesso non consentito" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );
    view();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Accesso non consentito",
    );
    expect(screen.queryByText("categories")).toBeNull();
  });
  it("distinguishes estimates from exact counts and displays an empty table honestly", async () => {
    vi.mocked(fetch).mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).endsWith("/catalog")
              ? catalog
              : {
                  table: "categories",
                  rows: [],
                  total: 0,
                  page: 1,
                  pageSize: 50,
                  capturedAt: catalog.capturedAt,
                },
          ),
          { headers: { "Content-Type": "application/json" } },
        ),
    );
    const component = view();
    expect(await screen.findByText("Non disponibile")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "categories" })[0]);
    expect(
      await screen.findByText("Questa tabella non contiene record."),
    ).toBeTruthy();
    expect(screen.getByText(/0 record nella tabella/)).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({
      cache: "no-store",
      credentials: "omit",
      headers: { Authorization: "Bearer test-session" },
    });
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
    ).toBe("noindex, nofollow");
    component.unmount();
    await waitFor(() =>
      expect(
        component.client
          .getQueryCache()
          .findAll({ queryKey: ["database-admin"] }),
      ).toHaveLength(0),
    );
  });
});
