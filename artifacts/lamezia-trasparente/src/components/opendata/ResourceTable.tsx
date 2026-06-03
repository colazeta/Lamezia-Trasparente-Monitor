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
  Download,
  History,
  Settings2,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
import { SnapshotHistory } from "./SnapshotHistory";

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

function csvEscape(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(
  columns: OpendataColumn[],
  rows: OpendataTableRowsItem[],
  fileName: string,
): void {
  const header = columns.map((c) => csvEscape(c.name)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c.name])).join(","))
    .join("\r\n");
  const csv = `${header}\r\n${body}`;
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Chart types and config
// ---------------------------------------------------------------------------

type ChartType = "bar" | "line" | "area" | "pie";

type ChartSeries = { yKey: string; color: string };

type ChartSpec = {
  type: ChartType;
  xKey: string;
  series: ChartSeries[];
  data: Array<Record<string, string | number>>;
  isPie: boolean;
  // pie data: { name, value }[]
  pieData?: Array<{ name: string; value: number }>;
};

const MAX_CHART_POINTS = 50;
const MAX_PIE_SLICES = 8;
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Heuristic: count distinct non-null string values in a column.
function countDistinct(rows: OpendataTableRowsItem[], colName: string): number {
  const set = new Set<string>();
  for (const row of rows) {
    const v = row[colName];
    if (v !== null && v !== undefined) set.add(String(v));
  }
  return set.size;
}

function pickChartAuto(
  columns: OpendataColumn[],
  rows: OpendataTableRowsItem[],
): ChartSpec | null {
  if (rows.length < 2) return null;

  const numericCols = columns.filter((c) => c.type === "number");
  const dateCols = columns.filter((c) => c.type === "date");
  const stringCols = columns.filter((c) => c.type === "string");

  if (numericCols.length === 0) return null;

  // Determine X axis: prefer date > string > another numeric.
  const xCol = dateCols[0] ?? stringCols[0] ?? null;
  if (!xCol) {
    // Only numeric columns — use index as label.
    const yCol = numericCols[0];
    const data = rows.slice(0, MAX_CHART_POINTS).map((row, i) => {
      const v = row[yCol.name];
      return { label: String(i + 1), [yCol.name]: typeof v === "number" ? v : 0 };
    });
    if (data.length < 2) return null;
    return {
      type: "bar",
      xKey: "label",
      series: [{ yKey: yCol.name, color: CHART_COLORS[0] }],
      data,
      isPie: false,
    };
  }

  // Time-series: date x-axis → line/area.
  if (dateCols.length > 0) {
    const yCols = numericCols.slice(0, 3); // up to 3 series
    const points = rows
      .map((row) => {
        const x = row[xCol.name];
        if (x == null) return null;
        const entry: Record<string, string | number> = { label: String(x) };
        for (const yc of yCols) {
          const v = row[yc.name];
          entry[yc.name] = typeof v === "number" ? v : 0;
        }
        return entry;
      })
      .filter((p): p is Record<string, string | number> => p !== null);

    if (points.length < 2) return null;
    const data = points.slice(0, MAX_CHART_POINTS);
    return {
      type: yCols.length > 1 ? "line" : "area",
      xKey: "label",
      series: yCols.map((yc, i) => ({
        yKey: yc.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
      data,
      isPie: false,
    };
  }

  // Categorical x-axis.
  const distinct = countDistinct(rows, xCol.name);
  const yCol = numericCols[0];
  const yCols = numericCols.slice(0, 3);

  // Proportions: few categories → pie.
  if (numericCols.length === 1 && distinct <= MAX_PIE_SLICES && rows.length <= MAX_PIE_SLICES) {
    const pieData = rows
      .map((row) => {
        const name = String(row[xCol.name] ?? "");
        const v = row[yCol.name];
        const value = typeof v === "number" ? v : 0;
        return { name, value };
      })
      .filter((p) => p.value > 0)
      .slice(0, MAX_PIE_SLICES);

    if (pieData.length >= 2) {
      return { type: "pie", xKey: xCol.name, series: [{ yKey: yCol.name, color: CHART_COLORS[0] }], data: [], isPie: true, pieData };
    }
  }

  // Bar chart (categories).
  const points = rows
    .map((row) => {
      const x = row[xCol.name];
      if (x == null) return null;
      const entry: Record<string, string | number> = { label: String(x) };
      for (const yc of yCols) {
        const v = row[yc.name];
        entry[yc.name] = typeof v === "number" ? v : 0;
      }
      return entry;
    })
    .filter((p): p is Record<string, string | number> => p !== null);

  if (points.length < 2) return null;
  const data = points.slice(0, MAX_CHART_POINTS);

  return {
    type: "bar",
    xKey: "label",
    series: yCols.map((yc, i) => ({
      yKey: yc.name,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    data,
    isPie: false,
  };
}

function buildUserChart(
  columns: OpendataColumn[],
  rows: OpendataTableRowsItem[],
  chartType: ChartType,
  xKey: string,
  yKeys: string[],
): ChartSpec | null {
  if (rows.length < 2 || !xKey || yKeys.length === 0) return null;

  if (chartType === "pie") {
    const yKey = yKeys[0];
    const pieData = rows
      .map((row) => {
        const name = String(row[xKey] ?? "");
        const v = row[yKey];
        const value = typeof v === "number" ? v : 0;
        return { name, value };
      })
      .filter((p) => p.value > 0)
      .slice(0, MAX_PIE_SLICES);
    if (pieData.length < 2) return null;
    return { type: "pie", xKey, series: [{ yKey, color: CHART_COLORS[0] }], data: [], isPie: true, pieData };
  }

  const points = rows
    .map((row) => {
      const x = row[xKey];
      if (x == null) return null;
      const entry: Record<string, string | number> = { label: String(x) };
      for (const yk of yKeys) {
        const v = row[yk];
        entry[yk] = typeof v === "number" ? v : 0;
      }
      return entry;
    })
    .filter((p): p is Record<string, string | number> => p !== null)
    .slice(0, MAX_CHART_POINTS);

  if (points.length < 2) return null;

  return {
    type: chartType,
    xKey: "label",
    series: yKeys.map((yk, i) => ({
      yKey: yk,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    data: points,
    isPie: false,
  };
}

// ---------------------------------------------------------------------------
// Chart controls panel
// ---------------------------------------------------------------------------

function ChartControls({
  columns,
  chartType,
  setChartType,
  xKey,
  setXKey,
  yKeys,
  setYKeys,
  isAuto,
  setIsAuto,
}: {
  columns: OpendataColumn[];
  chartType: ChartType;
  setChartType: (t: ChartType) => void;
  xKey: string;
  setXKey: (k: string) => void;
  yKeys: string[];
  setYKeys: (ks: string[]) => void;
  isAuto: boolean;
  setIsAuto: (v: boolean) => void;
}) {
  const numericCols = columns.filter((c) => c.type === "number");

  return (
    <div className="rounded-xl border border-card-border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-brand" />
          <span className="text-sm font-display font-bold">Grafico</span>
        </div>
        <Button
          variant={isAuto ? "brand" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setIsAuto(true)}
        >
          Automatico
        </Button>
        <Button
          variant={!isAuto ? "brand" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setIsAuto(false)}
        >
          Manuale
        </Button>
      </div>

      {!isAuto && (
        <div className="grid gap-2 sm:grid-cols-3">
          {/* Chart type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
              Tipo
            </label>
            <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="h-8 text-xs">
                <span>{chartType === "bar" ? "Barre" : chartType === "line" ? "Linea" : chartType === "area" ? "Area" : "Torta"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barre</SelectItem>
                <SelectItem value="line">Linea</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="pie">Torta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* X axis */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
              Asse X / etichetta
            </label>
            <Select value={xKey} onValueChange={setXKey}>
              <SelectTrigger className="h-8 text-xs">
                <span className="truncate">{xKey || "—"}</span>
              </SelectTrigger>
              <SelectContent>
                {columns.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Y axis */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
              Asse Y (valore)
            </label>
            <Select
              value={yKeys[0] ?? ""}
              onValueChange={(v) => setYKeys([v])}
            >
              <SelectTrigger className="h-8 text-xs">
                <span className="truncate">{yKeys[0] || "—"}</span>
              </SelectTrigger>
              <SelectContent>
                {numericCols.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resource chart renderer
// ---------------------------------------------------------------------------

function ResourceChart({ chart }: { chart: ChartSpec }) {
  const config: ChartConfig = Object.fromEntries(
    chart.series.map((s) => [s.yKey, { label: s.yKey, color: s.color }]),
  );

  if (chart.isPie && chart.pieData) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-display font-bold">
            {chart.series[0]?.yKey ?? ""}
            <span className="font-normal text-muted-foreground">
              {" "}per {chart.xKey}
            </span>
          </h4>
        </div>
        <ChartContainer config={config} className="h-[260px] w-full">
          <PieChart>
            <Pie
              data={chart.pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              isAnimationActive={false}
            >
              {chart.pieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </div>
    );
  }

  const isTruncated = chart.data.length === MAX_CHART_POINTS;

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <BarChart3 className="h-4 w-4 text-brand" />
        <h4 className="text-sm font-display font-bold">
          {chart.series.length === 1 ? (
            <>
              {chart.series[0].yKey}
              <span className="font-normal text-muted-foreground">
                {" "}per {chart.xKey === "label" ? "…" : chart.xKey}
              </span>
            </>
          ) : (
            chart.series.map((s) => s.yKey).join(", ")
          )}
        </h4>
        {isTruncated && (
          <Badge variant="outline" className="text-[10px] shadow-none">
            primi {MAX_CHART_POINTS} valori
          </Badge>
        )}
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
            {chart.series.length > 1 && <Legend />}
            {chart.series.map((s) => (
              <Line
                key={s.yKey}
                type="monotone"
                dataKey={s.yKey}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : chart.type === "area" ? (
          <AreaChart data={chart.data} margin={{ left: 8, right: 8 }}>
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
            {chart.series.map((s) => (
              <Area
                key={s.yKey}
                type="monotone"
                dataKey={s.yKey}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
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
            {chart.series.length > 1 && <Legend />}
            {chart.series.map((s) => (
              <Bar
                key={s.yKey}
                dataKey={s.yKey}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ResourceTable component
// ---------------------------------------------------------------------------

type TabView = "table" | "chart" | "history";

export function ResourceTable({ resourceId }: { resourceId: number }) {
  const { data, isLoading, isError } = useGetOpendataResourceContent(resourceId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabView>("table");

  // Chart controls state.
  const [isAutoChart, setIsAutoChart] = useState(true);
  const [userChartType, setUserChartType] = useState<ChartType>("bar");
  const [userXKey, setUserXKey] = useState("");
  const [userYKeys, setUserYKeys] = useState<string[]>([]);

  const columns: OpendataColumn[] = data?.columns ?? [];
  const rows: OpendataTableRowsItem[] = data?.rows ?? [];

  // Initialize user chart defaults when data loads.
  const numericCols = useMemo(
    () => columns.filter((c) => c.type === "number"),
    [columns],
  );
  const nonNumericCols = useMemo(
    () => columns.filter((c) => c.type !== "number"),
    [columns],
  );

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

  // Compute chart spec.
  const autoChart = useMemo(
    () => pickChartAuto(columns, sorted),
    [columns, sorted],
  );

  const userChart = useMemo(() => {
    const effectiveX = userXKey || nonNumericCols[0]?.name || columns[0]?.name || "";
    const effectiveY = userYKeys.length > 0 ? userYKeys : [numericCols[0]?.name ?? ""].filter(Boolean);
    if (!effectiveX || effectiveY.length === 0) return null;
    return buildUserChart(columns, sorted, userChartType, effectiveX, effectiveY);
  }, [columns, sorted, userChartType, userXKey, userYKeys, numericCols, nonNumericCols]);

  const activeChart = isAutoChart ? autoChart : userChart;
  const hasChart = activeChart !== null;

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
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">
            <span className="font-display font-bold text-foreground">
              {sorted.length}
            </span>{" "}
            {sorted.length === 1 ? "riga" : "righe"}
            {data.truncated ? (
              <span className="ml-1 text-xs">(anteprima limitata)</span>
            ) : null}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={sorted.length === 0}
            onClick={() =>
              downloadCsv(columns, sorted, `risorsa-${resourceId}.csv`)
            }
          >
            <Download className="mr-1.5 h-4 w-4" />
            Scarica CSV
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        <TabButton
          active={activeTab === "table"}
          onClick={() => setActiveTab("table")}
          icon={<Table2 className="h-4 w-4" />}
          label="Tabella"
        />
        <TabButton
          active={activeTab === "chart"}
          onClick={() => setActiveTab("chart")}
          icon={<BarChart3 className="h-4 w-4" />}
          label="Grafico"
          disabled={!hasChart && isAutoChart}
        />
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          icon={<History className="h-4 w-4" />}
          label="Storico"
        />
      </div>

      {data.truncated ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-brand" />
          L'anteprima mostra le prime {numberFormatter.format(data.rowCount)}{" "}
          righe del file. Scarica la risorsa originale per il dataset completo.
        </div>
      ) : null}

      {/* Tab content */}
      {activeTab === "chart" && (
        <div className="space-y-4">
          <ChartControls
            columns={columns}
            chartType={userChartType}
            setChartType={setUserChartType}
            xKey={userXKey || nonNumericCols[0]?.name || columns[0]?.name || ""}
            setXKey={setUserXKey}
            yKeys={userYKeys.length > 0 ? userYKeys : [numericCols[0]?.name ?? ""].filter(Boolean)}
            setYKeys={setUserYKeys}
            isAuto={isAutoChart}
            setIsAuto={setIsAutoChart}
          />
          {activeChart ? (
            <ResourceChart chart={activeChart} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Impossibile generare un grafico automatico per questa risorsa.
              Seleziona manualmente le colonne da visualizzare.
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <SnapshotHistory
          resourceId={resourceId}
          numericCols={numericCols.map((c) => c.name)}
        />
      )}

      {activeTab === "table" && (
        <>
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
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}
