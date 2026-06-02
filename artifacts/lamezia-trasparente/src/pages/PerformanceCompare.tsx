import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  useListPerformanceCategories,
  useGetPerformanceIndicator,
  type PerformanceCategoryWithIndicators,
} from "@workspace/api-client-react";
import {
  Gauge,
  ChevronLeft,
  GitCompare,
  Plus,
  X,
  Check,
  Layers,
  Download,
  Link2,
  ImageDown,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  buildComparisonSeries,
  formatIndicatorValue,
  RAW_SUFFIX,
  type ComparisonMode,
} from "@/lib/performanceFormat";

const MAX_SERIES = 5;

const SERIES_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface IndicatorMeta {
  id: number;
  title: string;
  unit: string;
  categoryName: string;
}

/** Legge l'eventuale parametro `?ids=1,2` per preselezionare gli indicatori. */
function readInitialIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = new URLSearchParams(window.location.search).get("ids");
  if (!raw) return [];
  const ids = raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n));
  return Array.from(new Set(ids)).slice(0, MAX_SERIES);
}

/** Legge l'eventuale parametro `?mode=absolute|normalized`. */
function readInitialMode(): ComparisonMode {
  if (typeof window === "undefined") return "normalized";
  return new URLSearchParams(window.location.search).get("mode") === "absolute"
    ? "absolute"
    : "normalized";
}

export function PerformanceCompare() {
  const { data: categories, isLoading } = useListPerformanceCategories();
  const [selected, setSelected] = useState<number[]>(() => readInitialIds());
  const [mode, setMode] = useState<ComparisonMode>(() => readInitialMode());

  // Mappa id -> metadati indicatore (titolo, unità, categoria).
  const metaById = useMemo(() => {
    const map = new Map<number, IndicatorMeta>();
    for (const cat of (categories ?? []) as PerformanceCategoryWithIndicators[]) {
      for (const ind of cat.indicators) {
        map.set(ind.id, {
          id: ind.id,
          title: ind.title,
          unit: ind.unit,
          categoryName: cat.name,
        });
      }
    }
    return map;
  }, [categories]);

  // Rimuove eventuali id preselezionati che non esistono più, una volta caricati.
  useEffect(() => {
    if (!categories) return;
    setSelected((prev) => {
      const valid = prev.filter((id) => metaById.has(id));
      return valid.length === prev.length ? prev : valid;
    });
  }, [categories, metaById]);

  // Con più di due serie il doppio asse perde di senso: si normalizza sempre.
  useEffect(() => {
    if (selected.length > 2 && mode === "absolute") setMode("normalized");
  }, [selected.length, mode]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Stringa di query che rispecchia lo stato corrente (id + modalità).
  const searchString = useMemo(() => {
    const params = new URLSearchParams();
    if (selected.length) params.set("ids", selected.join(","));
    params.set("mode", mode);
    return params.toString();
  }, [selected, mode]);

  // Mantiene la URL del browser allineata allo stato così che sia condivisibile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = `${window.location.pathname}${searchString ? `?${searchString}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [searchString]);

  // Fino a MAX_SERIES query per gli indicatori selezionati (numero di hook fisso).
  const q0 = useGetPerformanceIndicator(slotId(selected, 0), {
    query: { enabled: hasSlot(selected, 0) },
  });
  const q1 = useGetPerformanceIndicator(slotId(selected, 1), {
    query: { enabled: hasSlot(selected, 1) },
  });
  const q2 = useGetPerformanceIndicator(slotId(selected, 2), {
    query: { enabled: hasSlot(selected, 2) },
  });
  const q3 = useGetPerformanceIndicator(slotId(selected, 3), {
    query: { enabled: hasSlot(selected, 3) },
  });
  const q4 = useGetPerformanceIndicator(slotId(selected, 4), {
    query: { enabled: hasSlot(selected, 4) },
  });
  const queries = [q0, q1, q2, q3, q4];

  const series = useMemo(() => {
    return selected
      .map((id, i) => {
        const detail = queries[i]?.data;
        if (!detail) return null;
        const meta = metaById.get(id);
        return {
          key: String(id),
          id,
          title: meta?.title ?? detail.title,
          unit: meta?.unit ?? detail.unit,
          color: SERIES_COLORS[i % SERIES_COLORS.length],
          values: detail.values ?? [],
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, metaById, q0.data, q1.data, q2.data, q3.data, q4.data]);

  const isFetchingSeries = selected.some((_, i) => queries[i]?.isLoading);

  const dualAxis = mode === "absolute" && series.length === 2;

  const chartData = useMemo(
    () =>
      buildComparisonSeries(
        series.map((s) => ({ key: s.key, values: s.values })),
        mode,
      ),
    [series, mode],
  );

  const colorByKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of series) map[s.key] = s.color;
    return map;
  }, [series]);

  const metaByKey = useMemo(() => {
    const map: Record<string, { title: string; unit: string }> = {};
    for (const s of series) map[s.key] = { title: s.title, unit: s.unit };
    return map;
  }, [series]);

  function toggleIndicator(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SERIES) return prev;
      return [...prev, id];
    });
  }

  const canExport = series.length >= 2 && chartData.length > 0;

  async function handleCopyLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}${searchString ? `?${searchString}` : ""}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const area = document.createElement("textarea");
        area.value = url;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      toast.success("Link copiato negli appunti", {
        description: "Condividi questo confronto incollando il link.",
      });
    } catch {
      toast.error("Impossibile copiare il link", {
        description: "Copia manualmente la URL dalla barra del browser.",
      });
    }
  }

  function handleDownloadCsv() {
    if (!canExport) return;
    const headers = [
      "Periodo",
      ...series.map((s) => (s.unit ? `${s.title} (${s.unit})` : s.title)),
    ];
    const rows = chartData.map((point) => {
      const cells = [String(point.period ?? "")];
      for (const s of series) {
        const raw = point[`${s.key}${RAW_SUFFIX}`];
        cells.push(typeof raw === "number" ? String(raw) : "");
      }
      return cells;
    });
    const escape = (v: string) =>
      /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = [headers, ...rows]
      .map((r) => r.map(escape).join(","))
      .join("\r\n");
    // BOM per la corretta lettura dei caratteri accentati in Excel.
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    downloadBlob(blob, `confronto-indicatori-${exportStamp()}.csv`);
    toast.success("CSV scaricato");
  }

  async function handleDownloadPng() {
    if (!canExport) return;
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) {
      toast.error("Grafico non disponibile per l'esportazione");
      return;
    }
    try {
      const blob = await svgToPngBlob(svg);
      downloadBlob(blob, `confronto-indicatori-${exportStamp()}.png`);
      toast.success("Immagine scaricata");
    } catch {
      toast.error("Impossibile esportare l'immagine del grafico");
    }
  }

  const visibleCategories = ((categories ?? []) as PerformanceCategoryWithIndicators[]).filter(
    (c) => c.indicators.length > 0,
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <Link
        href="/performance"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Torna agli indicatori
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="eyebrow text-brand">
          <GitCompare className="h-3.5 w-3.5" />
          Confronto indicatori
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Confronta gli indicatori
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Seleziona due o più indicatori (fino a {MAX_SERIES}) per sovrapporne le
          serie storiche. Usa la vista{" "}
          <span className="font-medium text-foreground">normalizzata</span> per
          confrontare grandezze con unità diverse, oppure il{" "}
          <span className="font-medium text-foreground">doppio asse</span> per
          due indicatori a confronto diretto.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <IndicatorPicker
            categories={visibleCategories}
            selected={selected}
            isLoading={isLoading}
            max={MAX_SERIES}
            onToggle={toggleIndicator}
          />
          {selected.map((id) => {
            const meta = metaById.get(id);
            const color =
              SERIES_COLORS[selected.indexOf(id) % SERIES_COLORS.length];
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card py-1 pl-2.5 pr-1 text-sm shadow-sm"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="max-w-[12rem] truncate">
                  {meta?.title ?? `Indicatore ${id}`}
                </span>
                <button
                  type="button"
                  onClick={() => toggleIndicator(id)}
                  aria-label={`Rimuovi ${meta?.title ?? "indicatore"}`}
                  className="rounded-full p-0.5 text-muted-foreground hover-elevate"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => {
            if (v === "normalized" || v === "absolute") setMode(v);
          }}
          className="shrink-0"
        >
          <ToggleGroupItem value="normalized" className="text-xs">
            Normalizzato
          </ToggleGroupItem>
          <ToggleGroupItem
            value="absolute"
            disabled={selected.length !== 2}
            title={
              selected.length !== 2
                ? "Il doppio asse è disponibile con due indicatori"
                : undefined
            }
            className="text-xs"
          >
            Doppio asse
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-tight">
                <Gauge className="h-5 w-5 text-brand" />
                Serie storiche a confronto
              </CardTitle>
              <CardDescription className="mt-1.5">
                {mode === "normalized"
                  ? "Valori indicizzati a 100 sul primo periodo disponibile di ciascun indicatore."
                  : "Valori assoluti su doppio asse (sinistra / destra)."}
              </CardDescription>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleCopyLink}
              >
                <Link2 className="h-4 w-4" />
                Copia link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleDownloadCsv}
                disabled={!canExport}
              >
                <Download className="h-4 w-4" />
                Scarica CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleDownloadPng}
                disabled={!canExport}
              >
                <ImageDown className="h-4 w-4" />
                Scarica PNG
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {selected.length < 2 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <GitCompare className="h-7 w-7" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Seleziona almeno{" "}
                <span className="font-medium text-foreground">
                  due indicatori
                </span>{" "}
                per visualizzarne le serie storiche affiancate.
              </p>
            </div>
          ) : isFetchingSeries && chartData.length === 0 ? (
            <Skeleton className="h-80 w-full" />
          ) : chartData.length > 0 ? (
            <div ref={chartRef} className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fontSize: 11,
                      fill: dualAxis
                        ? series[0]?.color
                        : "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                  />
                  {dualAxis ? (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fontSize: 11,
                        fill: series[1]?.color,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={52}
                    />
                  ) : null}
                  <Tooltip
                    content={
                      <ComparisonTooltip
                        mode={mode}
                        colorByKey={colorByKey}
                        metaByKey={metaByKey}
                      />
                    }
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.8rem", paddingTop: 8 }}
                    formatter={(value: string) =>
                      metaByKey[value]?.title ?? value
                    }
                  />
                  {series.map((s, i) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.key}
                      yAxisId={dualAxis && i === 1 ? "right" : "left"}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Gli indicatori selezionati non hanno serie storiche da confrontare.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function slotId(selected: number[], index: number): string {
  const id = selected[index];
  return id != null ? String(id) : "";
}

function hasSlot(selected: number[], index: number): boolean {
  return selected[index] != null;
}

/** Avvia il download di un Blob con il nome indicato. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Marca temporale compatta (YYYY-MM-DD) per i nomi file esportati. */
function exportStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Proprietà di stile da inlineare per rendere l'SVG autonomo. */
const SVG_STYLE_PROPS = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-opacity",
  "opacity",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
] as const;

/** Copia gli stili calcolati dall'albero originale al clone (stessa struttura). */
function inlineComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  let inline = "";
  for (const prop of SVG_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) inline += `${prop}:${value};`;
  }
  target.setAttribute("style", inline);
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    const t = targetChildren[i];
    if (t) inlineComputedStyles(sourceChildren[i], t);
  }
}

/**
 * Rasterizza un grafico SVG in un PNG con sfondo opaco. Gli stili (che usano
 * variabili CSS) vengono inlineati prima della serializzazione, altrimenti i
 * colori non sarebbero risolti nell'immagine autonoma.
 */
function svgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    // Sfondo coerente col tema corrente (token --card), così l'immagine
    // esportata resta leggibile sia in chiaro sia in scuro.
    const cardToken = getComputedStyle(document.documentElement)
      .getPropertyValue("--card")
      .trim();
    const background = cardToken ? `hsl(${cardToken})` : "white";

    const clone = svg.cloneNode(true) as SVGSVGElement;
    inlineComputedStyles(svg, clone);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas non disponibile"));
          return;
        }
        ctx.scale(scale, scale);
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Esportazione PNG non riuscita"));
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err instanceof Error ? err : new Error("Errore esportazione"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossibile caricare l'SVG"));
    };
    img.src = url;
  });
}

function IndicatorPicker({
  categories,
  selected,
  isLoading,
  max,
  onToggle,
}: {
  categories: PerformanceCategoryWithIndicators[];
  selected: number[];
  isLoading: boolean;
  max: number;
  onToggle: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const atMax = selected.length >= max;

  if (isLoading) {
    return <Skeleton className="h-9 w-44 rounded-md" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9">
          <Plus className="h-4 w-4" />
          Aggiungi indicatore
          <Badge variant="secondary" className="ml-1 tabular-nums">
            {selected.length}/{max}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cerca un indicatore…" />
          <CommandList>
            <CommandEmpty>Nessun indicatore trovato.</CommandEmpty>
            {categories.map((cat) => (
              <CommandGroup
                key={cat.id}
                heading={
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {cat.name}
                  </span>
                }
              >
                {cat.indicators.map((ind) => {
                  const isSelected = selected.includes(ind.id);
                  const disabled = !isSelected && atMax;
                  return (
                    <CommandItem
                      key={ind.id}
                      value={`${ind.title} ${cat.name}`}
                      disabled={disabled}
                      onSelect={() => onToggle(ind.id)}
                      className={cn(disabled && "opacity-50")}
                    >
                      <span
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-input",
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className="flex-1 truncate">{ind.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {ind.unit}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface TooltipPayloadEntry {
  dataKey?: string | number;
  value?: number | string | null;
  payload?: Record<string, number | string | null>;
}

function ComparisonTooltip({
  active,
  payload,
  label,
  mode,
  colorByKey,
  metaByKey,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  mode: ComparisonMode;
  colorByKey: Record<string, string>;
  metaByKey: Record<string, { title: string; unit: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-md">
      <p className="mb-2 font-mono text-muted-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? "");
          const meta = metaByKey[key];
          const raw = entry.payload?.[`${key}${RAW_SUFFIX}`];
          const plotted = entry.value;
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorByKey[key] }}
              />
              <span className="flex-1 truncate text-foreground">
                {meta?.title ?? key}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {typeof raw === "number"
                  ? `${formatIndicatorValue(raw)}${meta?.unit ? ` ${meta.unit}` : ""}`
                  : "—"}
                {mode === "normalized" && typeof plotted === "number" ? (
                  <span className="ml-1 text-muted-foreground">
                    ({formatIndicatorValue(plotted)})
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
