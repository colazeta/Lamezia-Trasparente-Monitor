import { useMemo, useState } from "react";
import {
  useGetOpendataResourceContent,
  type OpendataColumn,
  type OpendataTableRowsItem,
} from "@workspace/api-client-react";
import {
  Search,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  Table2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const PAGE_SIZE = 25;

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 4,
});

function formatCell(value: string | number | null, type: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "number" && typeof value === "number") {
    return numberFormatter.format(value);
  }
  return String(value);
}

type SortState = { column: string; dir: "asc" | "desc" } | null;

export function ResourceTable({ resourceId }: { resourceId: number }) {
  const { data, isLoading, isError } = useGetOpendataResourceContent(resourceId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);
  const [showChart, setShowChart] = useState(true);

  const columns: OpendataColumn[] = data?.columns ?? [];
  const rows: OpendataTableRowsItem[] = data?.rows ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      columns.some((c) => {
        const v = row[c.name];
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.name === sort.column);
    const numeric = col?.type === "number";
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.column];
      const bv = b[sort.column];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (numeric) return (Number(av) - Number(bv)) * dir;
      return String(av).localeCompare(String(bv), "it") * dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const toggleSort = (column: string) => {
    setPage(0);
    setSort((prev) => {
      if (!prev || prev.column !== column) return { column, dir: "asc" };
      if (prev.dir === "asc") return { column, dir: "desc" };
      return null;
    });
  };

  // Pick a chart spec: a temporal/categorical X axis + the first numeric column.
  const chart = useMemo(
    () => pickChart(columns, sorted),
    [columns, sorted],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-300/60 bg-amber-50/60 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>
          Impossibile caricare l'anteprima di questa risorsa. Puoi comunque
          scaricare il file originale dal pulsante di download.
        </span>
      </div>
    );
  }

  if (columns.length === 0 || rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Nessun dato tabellare disponibile per l'anteprima di questa risorsa.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca nella tabella..."
            className="pl-9 h-10 bg-background"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            <span className="font-display font-bold text-foreground">
              {sorted.length}
            </span>{" "}
            {sorted.length === 1 ? "riga" : "righe"}
            {data.truncated ? (
              <span className="ml-1 text-xs">(anteprima limitata)</span>
            ) : null}
          </span>
          {chart ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChart((v) => !v)}
            >
              <BarChart3 className="mr-1.5 h-4 w-4" />
              {showChart ? "Nascondi grafico" : "Mostra grafico"}
            </Button>
          ) : null}
        </div>
      </div>

      {data.truncated ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-brand" />
          L'anteprima mostra le prime {numberFormatter.format(data.rowCount)}{" "}
          righe del file. Scarica la risorsa originale per il dataset completo.
        </div>
      ) : null}

      {/* Auto chart */}
      {chart && showChart ? (
        <ResourceChart chart={chart} />
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                {columns.map((c) => {
                  const active = sort?.column === c.name;
                  return (
                    <TableHead
                      key={c.name}
                      className={`whitespace-nowrap font-display uppercase text-[11px] tracking-wider ${
                        c.type === "number" ? "text-right" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.name)}
                        className={`inline-flex items-center gap-1 hover:text-foreground ${
                          c.type === "number" ? "flex-row-reverse" : ""
                        } ${active ? "text-foreground" : ""}`}
                      >
                        <span>{c.name}</span>
                        {active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length > 0 ? (
                pageRows.map((row, i) => (
                  <TableRow key={safePage * PAGE_SIZE + i}>
                    {columns.map((c) => (
                      <TableCell
                        key={c.name}
                        className={`whitespace-nowrap text-sm ${
                          c.type === "number"
                            ? "text-right tabular-nums font-mono"
                            : ""
                        }`}
                      >
                        {formatCell(row[c.name], c.type)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
                      <Table2 className="h-6 w-6" />
                      <span className="text-sm">
                        Nessuna riga corrisponde alla ricerca.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground tabular-nums">
            Pagina {safePage + 1} di {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Successiva
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ChartSpec = {
  type: "bar" | "line";
  xKey: string;
  yKey: string;
  data: Array<{ label: string; value: number }>;
};

const MAX_CHART_POINTS = 50;

function pickChart(
  columns: OpendataColumn[],
  rows: OpendataTableRowsItem[],
): ChartSpec | null {
  if (rows.length < 2) return null;
  const numericCols = columns.filter((c) => c.type === "number");
  const dateCols = columns.filter((c) => c.type === "date");
  const stringCols = columns.filter((c) => c.type === "string");
  if (numericCols.length === 0) return null;

  const yCol = numericCols[0];
  // Prefer a temporal axis; otherwise a categorical (string) axis; otherwise a
  // second numeric column. Skip if nothing sensible to plot against.
  const xCol =
    dateCols[0] ??
    stringCols[0] ??
    numericCols.find((c) => c.name !== yCol.name) ??
    null;
  if (!xCol) return null;

  const type: "bar" | "line" = dateCols[0] ? "line" : "bar";

  const points = rows
    .map((row) => {
      const rawY = row[yCol.name];
      const rawX = row[xCol.name];
      if (rawY == null || rawX == null) return null;
      const value = Number(rawY);
      if (Number.isNaN(value)) return null;
      return { label: String(rawX), value };
    })
    .filter((p): p is { label: string; value: number } => p !== null);

  if (points.length < 2) return null;

  // Cap the number of plotted points so large tables stay readable.
  const data =
    points.length > MAX_CHART_POINTS
      ? points.slice(0, MAX_CHART_POINTS)
      : points;

  return { type, xKey: xCol.name, yKey: yCol.name, data };
}

function ResourceChart({ chart }: { chart: ChartSpec }) {
  const config: ChartConfig = {
    value: { label: chart.yKey, color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-brand" />
        <h4 className="text-sm font-display font-bold">
          {chart.yKey}
          <span className="font-normal text-muted-foreground">
            {" "}
            per {chart.xKey}
          </span>
        </h4>
        {chart.data.length === MAX_CHART_POINTS ? (
          <Badge variant="outline" className="text-[10px] shadow-none">
            primi {MAX_CHART_POINTS} valori
          </Badge>
        ) : null}
      </div>
      <ChartContainer config={config} className="h-[260px] w-full">
        {chart.type === "line" ? (
          <LineChart data={chart.data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <BarChart data={chart.data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}
