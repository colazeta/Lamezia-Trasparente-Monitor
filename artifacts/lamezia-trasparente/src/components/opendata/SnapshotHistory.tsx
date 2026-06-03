import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  useListOpendataResourceSnapshots,
  useGetOpendataSnapshot,
  getGetOpendataSnapshotQueryKey,
  getGetOpendataSnapshotQueryOptions,
  type OpendataSnapshotMeta,
  type OpendataColumn,
  type OpendataTableRowsItem,
} from "@workspace/api-client-react";
import {
  History,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  Clock,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 4,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : format(d, "dd MMM yyyy, HH:mm", { locale: it });
}

function csvEscape(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function downloadSnapshotCsv(
  columns: OpendataColumn[],
  rows: OpendataTableRowsItem[],
  snapshotId: number,
  capturedAt: string,
) {
  const date = capturedAt.slice(0, 10);
  const header = columns.map((c) => csvEscape(c.name)).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c.name])).join(","))
    .join("\r\n");
  const csv = `\uFEFF${header}\r\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `snapshot-${snapshotId}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type TrendPoint = { label: string; value: number };

// Maximum number of snapshots to load for per-column trend (avoids too many parallel fetches).
const MAX_TREND_SNAPSHOTS = 20;

function sumColumnInRows(
  rows: OpendataTableRowsItem[],
  col: string,
): number {
  return rows.reduce((acc, row) => {
    const v = row[col];
    return acc + (typeof v === "number" ? v : 0);
  }, 0);
}

// SnapshotRow — expandable row showing a single snapshot detail.
function SnapshotRow({
  snap,
  resourceId,
  isLatest,
}: {
  snap: OpendataSnapshotMeta;
  resourceId: number;
  isLatest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: detail, isLoading } = useGetOpendataSnapshot(
    resourceId,
    snap.id,
    {
      query: {
        enabled: open,
        queryKey: getGetOpendataSnapshotQueryKey(resourceId, snap.id),
      },
    },
  );

  return (
    <div className="border-b border-border/60 last:border-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-expanded={open}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {formatDate(snap.capturedAt)}
              </span>
              {isLatest && (
                <Badge variant="brand" className="text-[10px] shadow-none">
                  Attuale
                </Badge>
              )}
              {snap.changed && !isLatest && (
                <Badge variant="outline" className="text-[10px] shadow-none text-amber-600 border-amber-300">
                  Variato
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {numberFormatter.format(snap.rowCount)} righe
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Chiudi" : "Anteprima"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-muted/20 px-4 pb-4 pt-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : detail ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Versione del {formatDate(detail.capturedAt)} ·{" "}
                  <span className="font-medium text-foreground">
                    {numberFormatter.format(detail.rowCount)} righe
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    downloadSnapshotCsv(
                      detail.columns,
                      detail.rows,
                      detail.id,
                      detail.capturedAt,
                    )
                  }
                >
                  <Download className="mr-1 h-3 w-3" />
                  Scarica CSV
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      {detail.columns.slice(0, 8).map((c) => (
                        <TableHead
                          key={c.name}
                          className="whitespace-nowrap font-display uppercase text-[10px] tracking-wider"
                        >
                          {c.name}
                        </TableHead>
                      ))}
                      {detail.columns.length > 8 && (
                        <TableHead className="text-[10px] text-muted-foreground">
                          +{detail.columns.length - 8} colonne
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {detail.columns.slice(0, 8).map((c) => (
                          <TableCell
                            key={c.name}
                            className="whitespace-nowrap text-xs"
                          >
                            {row[c.name] !== null && row[c.name] !== undefined
                              ? c.type === "number" && typeof row[c.name] === "number"
                                ? numberFormatter.format(row[c.name] as number)
                                : String(row[c.name])
                              : "—"}
                          </TableCell>
                        ))}
                        {detail.columns.length > 8 && <TableCell />}
                      </TableRow>
                    ))}
                    {detail.rows.length > 5 && (
                      <TableRow>
                        <TableCell
                          colSpan={Math.min(detail.columns.length, 9)}
                          className="text-center text-xs text-muted-foreground"
                        >
                          … altre {numberFormatter.format(detail.rows.length - 5)} righe. Scarica il CSV per il dataset completo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Impossibile caricare i dati di questo snapshot.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Trend chart built from snapshot row counts or a selected numeric column sum.
function TrendChart({
  snapshots,
  resourceId,
  numericCols,
}: {
  snapshots: OpendataSnapshotMeta[];
  resourceId: number;
  numericCols: string[];
}) {
  const [trendCol, setTrendCol] = useState<string>("__rowcount__");

  const needsDetail = trendCol !== "__rowcount__";

  // Pick the most recent snapshots for the column trend (cap to avoid too many calls).
  const trendSnapshots = [...snapshots].slice(0, MAX_TREND_SNAPSHOTS).reverse();

  // Load snapshot details in parallel when a numeric column is selected.
  const detailQueries = useQueries({
    queries: needsDetail
      ? trendSnapshots.map((s) =>
          getGetOpendataSnapshotQueryOptions(resourceId, s.id),
        )
      : [],
  });

  const detailsLoading = needsDetail && detailQueries.some((q) => q.isLoading);

  // Build time-series data.
  const trendData: TrendPoint[] = trendSnapshots.map((s, i) => {
    const label = format(new Date(s.capturedAt), "dd/MM/yy", { locale: it });
    if (!needsDetail) {
      return { label, value: s.rowCount };
    }
    const detail = detailQueries[i]?.data;
    if (!detail) return { label, value: 0 };
    return { label, value: sumColumnInRows(detail.rows, trendCol) };
  });

  const config: ChartConfig = {
    value: {
      label: trendCol === "__rowcount__" ? "Righe" : `${trendCol} (somma)`,
      color: "hsl(var(--chart-2))",
    },
  };

  if (snapshots.length < 2) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-display font-bold">
            Andamento nel tempo
          </h4>
          <Badge variant="outline" className="text-[10px] shadow-none">
            {snapshots.length} versioni
          </Badge>
        </div>
        {numericCols.length > 0 && (
          <Select value={trendCol} onValueChange={setTrendCol}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <span className="truncate">
                {trendCol === "__rowcount__" ? "Conteggio righe" : trendCol}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__rowcount__">Conteggio righe</SelectItem>
              {numericCols.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} (somma)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {detailsLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Skeleton className="h-[180px] w-full" />
        </div>
      ) : (
        <ChartContainer config={config} className="h-[200px] w-full">
          <LineChart data={trendData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} fontSize={10} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--chart-2))" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  );
}

export function SnapshotHistory({
  resourceId,
  numericCols,
}: {
  resourceId: number;
  numericCols: string[];
}) {
  const { data: snapshots, isLoading } = useListOpendataResourceSnapshots(resourceId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nessuno storico disponibile per questa risorsa.
          Lo storico viene popolato ad ogni esecuzione dell'ingestione dei dati.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trend chart (only when ≥2 snapshots) */}
      {snapshots.length >= 2 && (
        <TrendChart
          snapshots={snapshots}
          resourceId={resourceId}
          numericCols={numericCols}
        />
      )}

      {/* Snapshot list */}
      <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <History className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-display font-bold">
            Versioni salvate
          </h4>
          <Badge variant="outline" className="text-[10px] shadow-none">
            {snapshots.length}
          </Badge>
        </div>
        {snapshots.map((snap, idx) => (
          <SnapshotRow
            key={snap.id}
            snap={snap}
            resourceId={resourceId}
            isLatest={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}
