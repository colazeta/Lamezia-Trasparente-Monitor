import { useEffect, useState, type FormEvent } from "react";
import { SignIn, useAuth, useClerk, useUser } from "@clerk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Database, RefreshCw, LogOut, Folder, FileSearch } from "lucide-react";
import type {
  DatabaseInspectionCatalog as Catalog,
  DatabaseInspectionTable as DbTable,
  DatabaseInspectionRow as DbRow,
  DatabaseInspectionPage as DbPage,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiUrl, configuredApiBaseUrl } from "@/lib/apiBaseUrl";
import { databaseAdminDeployment } from "@/lib/databaseAdminDeployment";
import "./admin-database.css";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const adminApiBaseUrl =
  configuredApiBaseUrl ?? databaseAdminDeployment?.apiBaseUrl ?? null;
const number = (value: number) => value.toLocaleString("it-IT");
const size = (bytes: number) => `${number(Math.round(bytes / 1024))} KiB`;
const shown = (value: string | null) =>
  value === null ? "NULL" : value === "" ? '"" (stringa vuota)' : value;

function useDatabaseRequest() {
  const { getToken } = useAuth();
  return async <T,>(path: string, signal: AbortSignal): Promise<T> => {
    const token = await getToken();
    if (!token) throw new Error("La sessione è scaduta. Accedi nuovamente.");
    const response = await fetch(
      apiUrl(
        `${adminApiBaseUrl ? "" : basePath}/api/admin/database${path}`,
        adminApiBaseUrl,
      ),
      {
        signal,
        cache: "no-store",
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new Error("Il servizio database non è raggiungibile.");
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error ?? "La console database non è disponibile.");
    return result as T;
  };
}

function Message({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <p
      className={error ? "db-message db-error" : "db-message"}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export function AdminDatabase() {
  const { isLoaded, user } = useUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Database — Lamezia Trasparente";
    const existing = document.head.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const previousRobots = existing?.content;
    const robots = existing ?? document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    if (!existing) document.head.append(robots);
    return () => {
      document.title = previousTitle;
      if (existing) existing.content = previousRobots ?? "";
      else robots.remove();
      void queryClient.cancelQueries({ queryKey: ["database-admin"] });
      queryClient.removeQueries({ queryKey: ["database-admin"] });
    };
  }, [queryClient]);
  return (
    <main className="db-desktop">
      {!isLoaded ? (
        <Message>Verifica della sessione…</Message>
      ) : !user ? (
        <section className="db-login">
          <h1>Archivio riservato</h1>
          <SignIn
            routing="hash"
            forceRedirectUrl={`${basePath}/admin/database`}
          />
        </section>
      ) : (
        <DatabaseSession key={user.id} userId={user.id} />
      )}
    </main>
  );
}

function DatabaseSession({ userId }: { userId: string }) {
  const request = useDatabaseRequest();
  const { signOut } = useClerk();
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<string | null>(null);
  const catalog = useQuery({
    queryKey: ["database-admin", userId, "catalog"],
    queryFn: ({ signal }) => request<Catalog>("/catalog", signal),
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });
  const tables = catalog.data?.tables ?? [];
  const table = tables.find((item) => item.name === selection);
  const issues =
    (catalog.data?.missingTables.length ?? 0) +
    tables.reduce(
      (n, item) =>
        n + item.issues.length + item.indexes.filter((i) => !i.valid).length,
      0,
    );
  const logout = async () => {
    await cache.cancelQueries({ queryKey: ["database-admin"] });
    cache.removeQueries({ queryKey: ["database-admin"] });
    await signOut({ redirectUrl: basePath || "/" });
  };
  return (
    <section className="db-window" aria-label="Gestione database">
      <header className="db-titlebar">
        <Database size={20} aria-hidden="true" />
        <h1>Lamezia Trasparente · Archivio interno</h1>
        <span>Consultazione</span>
      </header>
      <div className="db-toolbar">
        <Button asChild variant="ghost">
          <Link href="/redazione">Redazione</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            void cache.invalidateQueries({
              queryKey: ["database-admin", userId],
            });
          }}
          disabled={catalog.isFetching}
        >
          <RefreshCw size={16} /> Aggiorna
        </Button>
        <Button variant="ghost" onClick={() => void logout()}>
          <LogOut size={16} /> Esci
        </Button>
      </div>
      {catalog.isPending ? (
        <Message>Lettura del catalogo PostgreSQL…</Message>
      ) : catalog.error ? (
        <Message error>{catalog.error.message}</Message>
      ) : (
        catalog.data && (
          <>
            <div className="db-summary">
              <div>
                <strong>{number(tables.length)}</strong>
                <span>Tabelle</span>
              </div>
              <div>
                <strong>{catalog.data.version}</strong>
                <span>PostgreSQL</span>
              </div>
              <div>
                <strong>{catalog.data.migrationCount ?? "—"}</strong>
                <span>Migrazioni registrate</span>
              </div>
              <div>
                <strong>{size(catalog.data.bytes)}</strong>
                <span>Database</span>
              </div>
              <div>
                <strong>{issues}</strong>
                <span>Difformità rilevate</span>
              </div>
            </div>
            <div className="db-workspace">
              <aside className="db-tree">
                <label htmlFor="db-table-search">
                  Tabelle di {catalog.data.database}
                </label>
                <Input
                  id="db-table-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Trova una tabella"
                />
                <nav aria-label="Tabelle del database">
                  <button
                    className={!selection ? "db-selected" : ""}
                    onClick={() => setSelection(null)}
                  >
                    <Folder size={16} /> Catalogo e controlli
                  </button>
                  {tables
                    .filter((item) => item.name.includes(search.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.name}
                        className={selection === item.name ? "db-selected" : ""}
                        onClick={() => setSelection(item.name)}
                      >
                        <Database size={14} />
                        <span>{item.name}</span>
                      </button>
                    ))}
                </nav>
              </aside>
              <div className="db-mainpane">
                {table ? (
                  <TablePane
                    key={`${userId}:${table.name}`}
                    table={table}
                    userId={userId}
                    onTable={setSelection}
                  />
                ) : (
                  <CatalogPane catalog={catalog.data} onTable={setSelection} />
                )}
              </div>
            </div>
            <footer className="db-statusbar">
              <span>Sola lettura</span>
              <span>
                Catalogo:{" "}
                {new Date(catalog.data.capturedAt).toLocaleString("it-IT")}
              </span>
              <span>Le stime non certificano la completezza</span>
            </footer>
          </>
        )
      )}
    </section>
  );
}

function CatalogPane({
  catalog,
  onTable,
}: {
  catalog: Catalog;
  onTable: (name: string) => void;
}) {
  return (
    <section>
      <h2>Catalogo e controlli</h2>
      <p className="db-note">
        Apri una tabella per leggere i record e ottenere il conteggio esatto. La
        presenza dello schema e delle migrazioni non dimostra che i flussi siano
        completi.
      </p>
      {catalog.missingTables.length > 0 && (
        <Message error>
          Tabelle previste assenti: {catalog.missingTables.join(", ")}
        </Message>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tabella</TableHead>
            <TableHead>Righe stimate</TableHead>
            <TableHead>Dimensione</TableHead>
            <TableHead>Colonne</TableHead>
            <TableHead>Controlli</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalog.tables.map((table) => (
            <TableRow key={table.name}>
              <TableCell>
                <button className="db-link" onClick={() => onTable(table.name)}>
                  {table.name}
                </button>
              </TableCell>
              <TableCell>
                {table.estimatedRows === null
                  ? "Non disponibile"
                  : number(table.estimatedRows)}
              </TableCell>
              <TableCell>{size(table.bytes)}</TableCell>
              <TableCell>{table.columns.length}</TableCell>
              <TableCell>
                {table.issues.length
                  ? table.issues.join("; ")
                  : "Nessuna difformità di presenza/nullabilità"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="db-note">
        Il catalogo mostra vincoli e indici effettivi. I controlli automatici
        qui indicati confrontano presenza e nullabilità delle colonne: la
        verifica dei tipi, dei vincoli e dei flussi è documentata nell’audit.
      </p>
    </section>
  );
}

function TablePane({
  table,
  userId,
  onTable,
}: {
  table: DbTable;
  userId: string;
  onTable: (name: string) => void;
}) {
  const request = useDatabaseRequest();
  const [page, setPage] = useState(1);
  const [column, setColumn] = useState(
    table.columns.find((c) => !c.redacted)?.name ?? "",
  );
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<{
    column: string;
    value: string;
  } | null>(null);
  const [sort, setSort] = useState(
    table.columns.find((c) => c.primaryKey)?.name ?? column,
  );
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [key, setKey] = useState<Record<string, string> | null>(null);
  const [tab, setTab] = useState("data");
  const params = new URLSearchParams({
    page: String(page),
    pageSize: "50",
    sort,
    direction,
  });
  if (filter) {
    params.set("column", filter.column);
    params.set("value", filter.value);
  }
  const rows = useQuery({
    queryKey: ["database-admin", userId, table.name, params.toString()],
    queryFn: ({ signal }) =>
      request<DbPage>(
        `/tables/${encodeURIComponent(table.name)}?${params}`,
        signal,
      ),
    enabled: table.registered && tab === "data",
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });
  const detail = useQuery({
    queryKey: ["database-admin", userId, table.name, "record", key],
    queryFn: ({ signal }) =>
      request<DbPage>(
        `/tables/${encodeURIComponent(table.name)}/record?${new URLSearchParams({ key: JSON.stringify(key) })}`,
        signal,
      ),
    enabled: Boolean(key) && table.registered,
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setFilter(text ? { column, value: text } : null);
    setPage(1);
    setKey(null);
  };
  const open = (row: DbRow) => {
    const result: Record<string, string> = {};
    for (const c of table.columns.filter((c) => c.primaryKey)) {
      if (
        row.values[c.name] === null ||
        row.values[c.name] === undefined ||
        row.truncated.includes(c.name)
      )
        return;
      result[c.name] = row.values[c.name]!;
    }
    if (Object.keys(result).length) setKey(result);
  };
  return (
    <section>
      <h2>
        {table.schema}.{table.name}
      </h2>
      {table.issues.map((issue) => (
        <Message key={issue} error>
          {issue}
        </Message>
      ))}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="db-tabs">
          <TabsTrigger value="data">Dati</TabsTrigger>
          <TabsTrigger value="structure">Struttura</TabsTrigger>
          <TabsTrigger value="relations">
            Relazioni ({table.relations.length})
          </TabsTrigger>
          <TabsTrigger value="indexes">
            Indici ({table.indexes.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="data">
          {table.registered ? (
            <>
              <form className="db-filter" onSubmit={apply}>
                <div>
                  <label htmlFor="db-column">Cerca nella colonna</label>
                  <Select value={column} onValueChange={setColumn}>
                    <SelectTrigger id="db-column">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {table.columns
                        .filter((c) => !c.redacted)
                        .map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="db-search-value">Contiene</label>
                  <Input
                    id="db-search-value"
                    value={text}
                    maxLength={200}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <Button type="submit">
                  <FileSearch size={16} /> Cerca
                </Button>
                {filter && (
                  <Button
                    type="button"
                    onClick={() => {
                      setFilter(null);
                      setText("");
                      setPage(1);
                    }}
                  >
                    Azzera
                  </Button>
                )}
              </form>
              {rows.isPending ? (
                <Message>Lettura dei record…</Message>
              ) : rows.error ? (
                <Message error>{rows.error.message}</Message>
              ) : (
                rows.data && (
                  <>
                    <div className="db-pagebar">
                      <span>
                        {number(rows.data.total)} record
                        {filter ? " nel filtro" : " nella tabella"} · pagina{" "}
                        {page} di {Math.max(1, Math.ceil(rows.data.total / 50))}
                      </span>
                      <Button
                        disabled={page === 1 || rows.isFetching}
                        onClick={() => {
                          setPage(page - 1);
                          setKey(null);
                        }}
                      >
                        Precedente
                      </Button>
                      <Button
                        disabled={
                          page >= 1000 ||
                          page * 50 >= rows.data.total ||
                          rows.isFetching
                        }
                        onClick={() => {
                          setPage(page + 1);
                          setKey(null);
                        }}
                      >
                        Successiva
                      </Button>
                    </div>
                    {rows.data.rows.length === 0 ? (
                      <Message>
                        {filter
                          ? "Nessun record corrisponde al filtro."
                          : "Questa tabella non contiene record."}
                      </Message>
                    ) : (
                      <Table className="db-data-grid">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Scheda</TableHead>
                            {table.columns.map((c) => (
                              <TableHead key={c.name}>
                                <button
                                  disabled={c.redacted}
                                  onClick={() => {
                                    setSort(c.name);
                                    setDirection(
                                      sort === c.name && direction === "asc"
                                        ? "desc"
                                        : "asc",
                                    );
                                    setPage(1);
                                  }}
                                >
                                  {c.name}
                                  {sort === c.name
                                    ? direction === "asc"
                                      ? " ↑"
                                      : " ↓"
                                    : ""}
                                </button>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.data.rows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Button size="sm" onClick={() => open(row)}>
                                  Apri
                                </Button>
                              </TableCell>
                              {table.columns.map((c) => (
                                <TableCell key={c.name}>
                                  <span
                                    className="db-cell"
                                    title={shown(row.values[c.name])}
                                  >
                                    {shown(row.values[c.name])}
                                    {row.truncated.includes(c.name) &&
                                      " … [anteprima]"}
                                  </span>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {page === 1000 && rows.data.total > page * 50 && (
                      <Message>
                        Limite di navigazione raggiunto: restringi la ricerca
                        per consultare gli altri record.
                      </Message>
                    )}
                  </>
                )
              )}
            </>
          ) : (
            <Message error>
              La tabella non è registrata nello schema applicativo. Il catalogo
              resta consultabile; la lettura dei record è disabilitata.
            </Message>
          )}
        </TabsContent>
        <TabsContent value="structure">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colonna</TableHead>
                <TableHead>Tipo PostgreSQL</TableHead>
                <TableHead>NULL</TableHead>
                <TableHead>Valore predefinito</TableHead>
                <TableHead>Chiave / accesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.columns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.nullable ? "Ammesso" : "Vietato"}</TableCell>
                  <TableCell>{c.default ?? "—"}</TableCell>
                  <TableCell>
                    {c.primaryKey ? "PK" : ""}
                    {c.redacted ? " · oscurato" : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <h3>Vincoli</h3>
          {table.constraints.map((c) => (
            <div className="db-definition" key={c.name}>
              <strong>{c.name}</strong>
              <pre>{c.definition}</pre>
              <span>{c.validated ? "Validato" : "Da validare"}</span>
            </div>
          ))}
          <p className="db-note">
            Row-level security: {table.rls ? "attiva" : "non attiva"}. L’accesso
            a questa console è controllato dall’API.
          </p>
        </TabsContent>
        <TabsContent value="relations">
          {table.relations.length === 0 ? (
            <Message>Nessuna chiave esterna dichiarata.</Message>
          ) : (
            table.relations.map((r) => (
              <div className="db-definition" key={r.name}>
                <strong>
                  {r.columns.join(", ")} →{" "}
                  <button
                    className="db-link"
                    disabled={r.targetSchema !== "public"}
                    onClick={() => onTable(r.targetTable)}
                  >
                    {r.targetSchema}.{r.targetTable}
                  </button>{" "}
                  ({r.targetColumns.join(", ")})
                </strong>
                <pre>{r.definition}</pre>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="indexes">
          {table.indexes.map((index) => (
            <div className="db-definition" key={index.name}>
              <strong>
                {index.name} · {index.valid ? "Valido" : "NON VALIDO"}
              </strong>
              <pre>{index.definition}</pre>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      <Sheet
        open={Boolean(key)}
        onOpenChange={(open) => {
          if (!open) setKey(null);
        }}
      >
        <SheetContent className="db-record-sheet">
          <SheetHeader>
            <SheetTitle>Scheda · {table.name}</SheetTitle>
            <SheetDescription>
              Record interno. I valori NULL e le stringhe vuote sono distinti;
              gli eventuali limiti di lettura sono indicati per campo.
            </SheetDescription>
          </SheetHeader>
          {detail.isPending ? (
            <Message>Lettura della scheda…</Message>
          ) : detail.error ? (
            <Message error>{detail.error.message}</Message>
          ) : !detail.data?.rows.length ? (
            <Message>Record non più presente.</Message>
          ) : (
            <dl>
              {table.columns.map((c) => (
                <div className="db-field" key={c.name}>
                  <dt>
                    {c.name}
                    <span>{c.type}</span>
                  </dt>
                  <dd>
                    <pre>{shown(detail.data!.rows[0].values[c.name])}</pre>
                    {detail.data!.rows[0].truncated.includes(c.name) && (
                      <strong>
                        Campo oltre il limite di 65.536 caratteri: contenuto
                        parziale.
                      </strong>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
