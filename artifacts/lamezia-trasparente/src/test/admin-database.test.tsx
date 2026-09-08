import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
  within,
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
  it("shows exact reconciliation counts and opens the supporting field decisions", async () => {
    const reconciliation = {
      status: "verified",
      sourceSnapshotAt: "2026-09-03T11:10:38.924Z",
      sourceRecords: 41,
      projectRecords: 30,
      canonicalProjects: 30,
      resolvedCandidates: 71,
      unresolvedCandidates: 0,
      unprocessedRecords: 0,
      currentFieldDecisions: 510,
      fieldsWithAlternatives: 30,
      typedValueMismatches: 0,
      unmappedLegacyRows: 0,
      legacyValueMismatches: 0,
    };
    vi.mocked(fetch).mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).endsWith("/catalog")
              ? {
                  ...catalog,
                  projectReconciliation: reconciliation,
                  tables: [
                    ...catalog.tables,
                    { ...catalog.tables[0], name: "project_field_resolutions" },
                  ],
                }
              : {
                  table: "project_field_resolutions",
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
    view();
    const summary = await screen.findByRole("region", {
      name: "Riconciliazione PNRR",
    });
    expect(within(summary).getByText("71", { selector: "dd" })).toBeVisible();
    expect(within(summary).getByText("510", { selector: "dd" })).toBeVisible();
    expect(summary).toHaveTextContent("non certifica la validità");
    fireEvent.click(
      within(summary).getByRole("button", { name: "Scelte e varianti" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "public.project_field_resolutions",
      }),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        vi
          .mocked(fetch)
          .mock.calls.some(([url]) =>
            String(url).includes("/tables/project_field_resolutions"),
          ),
      ).toBe(true),
    );
  });

  function navigationResponses(
    malformed = false,
    extraTables: typeof catalog.tables = [],
  ) {
    const parent = { ...catalog.tables[0], name: "parents" };
    const child = {
      ...catalog.tables[0],
      relations: [
        {
          name: "parent_fk",
          columns: malformed ? "{id}" : ["id"],
          targetSchema: "public",
          targetTable: "parents",
          targetColumns: ["id"],
          definition: "FOREIGN KEY (id) REFERENCES parents(id)",
          validated: true,
        },
      ],
    };
    vi.mocked(fetch).mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).endsWith("/catalog")
              ? { ...catalog, tables: [child, parent, ...extraTables] }
              : {
                  table: "categories",
                  rows: [
                    { values: { id: "1", name: "Example" }, truncated: [] },
                  ],
                  total: 1,
                  page: 1,
                  pageSize: 50,
                  capturedAt: catalog.capturedAt,
                },
          ),
          { headers: { "Content-Type": "application/json" } },
        ),
    );
  }

  it("opens populated tables, structure, record details and related tables", async () => {
    navigationResponses();
    view();
    await screen.findByText("Catalogo e controlli", { selector: "h2" });
    fireEvent.click(screen.getAllByRole("button", { name: /categories/ })[0]);
    expect(await screen.findByText("Example")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Apri", exact: true }));
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Scheda · categories",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close", exact: true }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Struttura" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(await screen.findByText("Tipo PostgreSQL")).toBeVisible();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Relazioni (1)" }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "public.parents" }),
    );
    expect(
      await screen.findByRole("heading", { name: "public.parents" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Catalogo e controlli" }),
    );
    expect(
      screen.getByRole("heading", { name: "Catalogo e controlli" }),
    ).toBeVisible();
  });

  it("contains a malformed relation rendering error and lets the owner recover", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      navigationResponses(true);
      view();
      await screen.findByText("Catalogo e controlli", { selector: "h2" });
      fireEvent.click(screen.getAllByRole("button", { name: /categories/ })[0]);
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Impossibile visualizzare questa tabella",
      );
      expect(
        screen.getByRole("heading", { name: /Lamezia Trasparente/ }),
      ).toBeVisible();
      fireEvent.click(
        screen.getByRole("button", { name: "Torna al catalogo" }),
      );
      expect(
        screen.getByRole("heading", { name: "Catalogo e controlli" }),
      ).toBeVisible();
      fireEvent.click(
        screen.getAllByRole("button", { name: "parents", exact: true })[0],
      );
      expect(await screen.findByText("Example")).toBeVisible();
    } finally {
      log.mockRestore();
    }
  });
  it("searches concepts, keeps unknown tables visible and links the model to physical records", async () => {
    navigationResponses(false, [
      { ...catalog.tables[0], name: "attuazione_pnrr_projects" },
    ]);
    view();
    await screen.findByRole("heading", { name: "Catalogo e controlli" });
    const navigation = within(
      screen.getByRole("navigation", { name: "Tabelle del database" }),
    );
    expect(navigation.getByRole("button", { name: "parents" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Tabelle di test"), {
      target: { value: "Progetto pubblico" },
    });
    expect(
      navigation.getByRole("button", { name: /attuazione_pnrr_projects/ }),
    ).toBeVisible();
    expect(navigation.queryByRole("button", { name: /categories/ })).toBeNull();
    fireEvent.click(
      navigation.getByRole("button", { name: "Modello concettuale" }),
    );
    const model = within(
      screen.getByRole("region", { name: "Modello concettuale" }),
    );
    expect(
      model.getByText(
        /CUP qualificato con fonte, emittente e controllo di formato/,
      ),
    ).toBeVisible();
    expect(model.getAllByText("Da realizzare").length).toBeGreaterThan(0);
    fireEvent.click(
      model.getByRole("button", { name: "Progetti dalla fonte comunale" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "public.attuazione_pnrr_projects",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Una riga rappresenta:/)).toBeVisible();
  });

  it("shows file-only content and labels mappings without pretending the records are imported", async () => {
    navigationResponses();
    view();
    await screen.findByRole("heading", { name: "Catalogo e controlli" });
    fireEvent.click(screen.getByRole("button", { name: "Sito e copertura" }));
    const coverage = within(
      screen.getByRole("region", { name: "Sito e copertura" }),
    );
    expect(
      coverage.getByText(/non misura in tempo reale il popolamento/),
    ).toBeVisible();
    fireEvent.click(
      coverage.getByRole("button", {
        name: "Solo file senza tabella dedicata",
      }),
    );
    expect(
      coverage.getAllByText("File; nessuna tabella dedicata").length,
    ).toBeGreaterThan(0);
    expect(coverage.queryByText("API e file")).toBeNull();
    fireEvent.change(coverage.getByLabelText("Cerca una sezione del sito"), {
      target: { value: "non-esiste" },
    });
    expect(
      coverage.getByText("Nessuna sezione corrisponde al filtro."),
    ).toBeVisible();
  });

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
    fireEvent.click(screen.getAllByRole("button", { name: /categories/ })[0]);
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
