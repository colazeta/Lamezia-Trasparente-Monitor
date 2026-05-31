import { useEffect, useMemo, useState } from "react";
import {
  useListContracts,
  useGetContractsAnalytics,
  useGetContractsFeedStatus,
  useListThemes,
  type Contract,
  type ContractAnalytics,
} from "@workspace/api-client-react";
import {
  Search,
  Filter,
  FileText,
  ExternalLink,
  RefreshCw,
  Landmark,
  Euro,
  Gavel,
  ShoppingCart,
  Users,
  Repeat,
  Hash,
  Building2,
  Calendar,
  X,
  Leaf,
  GraduationCap,
  HardHat,
  HeartHandshake,
  Palette,
  Bus,
  Package,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const ANAC_PORTAL_URL = "https://dati.anticorruzione.it/superset/dashboard/appalti/";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatEuro(value: number, compact = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy, HH:mm", { locale: it });
}

export function Contracts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [procedureType, setProcedureType] = useState("all");
  const [acquisitionTool, setAcquisitionTool] = useState("all");
  const [themeId, setThemeId] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Contract | null>(null);

  const { data: themes, isLoading: themesLoading } = useListThemes();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const filters = useMemo(() => {
    const f: Record<string, string | number> = {};
    if (debouncedSearch) f.search = debouncedSearch;
    if (procedureType !== "all") f.procedureType = procedureType;
    if (acquisitionTool !== "all") f.acquisitionTool = acquisitionTool;
    if (themeId !== "all") f.themeId = Number(themeId);
    if (minAmount && !Number.isNaN(Number(minAmount)))
      f.minAmount = Number(minAmount);
    if (maxAmount && !Number.isNaN(Number(maxAmount)))
      f.maxAmount = Number(maxAmount);
    if (from) f.from = from;
    if (to) f.to = to;
    return f;
  }, [debouncedSearch, procedureType, acquisitionTool, themeId, minAmount, maxAmount, from, to]);

  const { data: contracts, isLoading } = useListContracts(filters);
  const { data: analytics, isLoading: analyticsLoading } =
    useGetContractsAnalytics(filters);
  const { data: feedStatus } = useGetContractsFeedStatus();

  // Build distinct option lists from the full (unfiltered) list is not available;
  // derive options from the current data plus known seed values.
  const { procedures, tools } = useMemo(() => {
    const p = new Set<string>();
    const t = new Set<string>();
    (contracts ?? []).forEach((c) => {
      if (c.procedureType) p.add(c.procedureType);
      if (c.acquisitionTool) t.add(c.acquisitionTool);
    });
    return {
      procedures: Array.from(p).sort(),
      tools: Array.from(t).sort(),
    };
  }, [contracts]);

  const hasActiveFilters =
    debouncedSearch ||
    procedureType !== "all" ||
    acquisitionTool !== "all" ||
    themeId !== "all" ||
    minAmount ||
    maxAmount ||
    from ||
    to;

  const resetFilters = () => {
    setSearch("");
    setProcedureType("all");
    setAcquisitionTool("all");
    setThemeId("all");
    setMinAmount("");
    setMaxAmount("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <span className="eyebrow text-brand">
          <FileText className="h-3.5 w-3.5" />
          Soldi pubblici sotto controllo
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Appalti Pubblici
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Contratti e affidamenti pubblici della stazione appaltante{" "}
          <span className="font-medium text-foreground">
            Comune di Lamezia Terme
          </span>{" "}
          (CF 00301390795), basati sui dati ANAC. Monitoriamo dove vengono spesi
          i soldi della comunità e chi esegue lavori, servizi e forniture.
        </p>
      </div>

      {/* Last updated + ANAC portal link */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-brand" />
          <span>
            Ultimo aggiornamento dati:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(feedStatus?.lastUpdatedAt)}
            </span>
            {feedStatus?.itemsTotal ? (
              <>
                {" "}· {feedStatus.itemsTotal} contratti monitorati
              </>
            ) : null}
          </span>
        </div>
        <a
          href={feedStatus?.url || ANAC_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Landmark className="h-4 w-4" />
          Portale ANAC – Dati Appalti
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* In cosa spende il Comune — spesa per macrotemi */}
      <SpendingByMacrotema
        contracts={contracts}
        loading={isLoading}
      />

      {/* Analytics */}
      <Analytics loading={analyticsLoading} analytics={analytics} />

      {/* Filters */}
      <div className="mt-10 mb-4 grid gap-3 rounded-xl border border-border bg-muted/40 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3">
        <div className="relative md:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca oggetto, beneficiario, CIG..."
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-72">
          <Select value={themeId} onValueChange={setThemeId}>
            <SelectTrigger className="h-11 bg-background" aria-label="Filtra per tema">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {themeId === "all" ? "Tutti i Temi" : themes?.find(t => t.id.toString() === themeId)?.title || "Tema"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Temi</SelectItem>
              {!themesLoading && themes?.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={procedureType} onValueChange={setProcedureType}>
          <SelectTrigger className="h-11 bg-background" aria-label="Filtra per procedura">
            <div className="flex items-center gap-2 truncate">
              <Gavel className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {procedureType === "all" ? "Tutte le procedure" : procedureType}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le procedure</SelectItem>
            {procedures.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={acquisitionTool} onValueChange={setAcquisitionTool}>
          <SelectTrigger className="h-11 bg-background" aria-label="Filtra per strumento">
            <div className="flex items-center gap-2 truncate">
              <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {acquisitionTool === "all"
                  ? "Tutti gli strumenti"
                  : acquisitionTool}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli strumenti</SelectItem>
            {tools.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Importo min €"
            className="h-11 bg-background"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Importo max €"
            className="h-11 bg-background"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label
              htmlFor="contracts-from"
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Dal
            </label>
            <Input
              id="contracts-from"
              type="date"
              aria-label="Data dal"
              className="h-9 bg-background"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="contracts-to"
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Al
            </label>
            <Input
              id="contracts-to"
              type="date"
              aria-label="Data al"
              className="h-9 bg-background"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            {contracts ? (
              <>
                <span className="font-display font-bold text-foreground tabular-nums">
                  {contracts.length}
                </span>{" "}
                {contracts.length === 1 ? "risultato" : "risultati"}
              </>
            ) : (
              "—"
            )}
          </span>
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Azzera filtri
            </Button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[300px] font-display uppercase text-[11px] tracking-wider">
                  Oggetto
                </TableHead>
                <TableHead className="font-display uppercase text-[11px] tracking-wider">
                  Beneficiario
                </TableHead>
                <TableHead className="text-right font-display uppercase text-[11px] tracking-wider">
                  Importo
                </TableHead>
                <TableHead className="hidden md:table-cell font-display uppercase text-[11px] tracking-wider">
                  Procedura
                </TableHead>
                <TableHead className="hidden lg:table-cell font-display uppercase text-[11px] tracking-wider">
                  Data
                </TableHead>
                <TableHead className="text-center font-display uppercase text-[11px] tracking-wider">
                  Dettaglio
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-24 ml-auto" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : contracts && contracts.length > 0 ? (
                contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="group hover-elevate cursor-pointer"
                    onClick={() => setSelected(contract)}
                  >
                    <TableCell>
                      <div className="font-display font-bold text-foreground">
                        {contract.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {contract.cig ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] shadow-none"
                          >
                            CIG {contract.cig}
                          </Badge>
                        ) : null}
                        {contract.withoutTender ? (
                          <Badge className="border-transparent bg-amber-100 text-amber-800 text-[10px] shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                            Senza gara
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {contract.supplier}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-display font-bold tabular-nums whitespace-nowrap text-foreground">
                        {contract.amount > 0 ? formatEuro(contract.amount) : "—"}
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] font-normal leading-none shadow-none"
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {contract.procedureType}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {format(new Date(contract.awardDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(contract);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="font-display font-bold text-foreground">
                        Nessun appalto trovato
                      </div>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Nessun contratto corrisponde ai filtri attuali. Prova a
                        modificare la ricerca o ad azzerare i filtri.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ContractDetail
        contract={selected}
        onClose={() => setSelected(null)}
        themes={themes}
      />
    </div>
  );
}

function Analytics({
  loading,
  analytics,
}: {
  loading: boolean;
  analytics: ContractAnalytics | undefined;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-card-border bg-card shadow-sm"
            >
              <Skeleton className="h-9 w-9 rounded-lg mb-4" />
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
      </div>
    );
  }

  if (!analytics || analytics.totalCount === 0) {
    return null;
  }

  const procedureConfig: ChartConfig = {
    count: { label: "Contratti" },
  };
  const toolConfig: ChartConfig = {
    count: { label: "Contratti" },
  };
  const timeConfig: ChartConfig = {
    amount: { label: "Importo", color: "hsl(var(--chart-1))" },
  };
  const beneficiaryConfig: ChartConfig = {
    value: { label: "Importo", color: "hsl(var(--chart-2))" },
  };

  const procedureData = analytics.byProcedure.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const toolData = analytics.byAcquisitionTool.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const beneficiaryData = analytics.topBeneficiaries.map((d) => ({
    name: d.name.length > 24 ? `${d.name.slice(0, 22)}…` : d.name,
    fullName: d.name,
    value: d.value,
  }));
  const timeData = analytics.amountOverTime.map((d) => ({
    period: d.period,
    amount: d.amount,
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Valore totale (filtrato)"
          value={formatEuro(analytics.totalAmount, true)}
          icon={Euro}
          highlight
        />
        <StatCard
          label="Contratti"
          value={String(analytics.totalCount)}
          icon={FileText}
        />
        <StatCard
          label="Affidati senza gara"
          value={`${analytics.withoutTenderPct.toFixed(0)}%`}
          sub={`${analytics.withoutTenderCount} contratti`}
          icon={Gavel}
        />
        <StatCard
          label="Fuori dal MePA"
          value={`${analytics.withoutMepaPct.toFixed(0)}%`}
          sub={`${analytics.withoutMepaCount} contratti`}
          icon={ShoppingCart}
        />
      </div>

      {/* Recurrent beneficiary highlight */}
      {analytics.mostRecurrentBeneficiary ? (
        <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Beneficiario più ricorrente
            </div>
            <div className="font-display font-bold text-foreground">
              {analytics.mostRecurrentBeneficiary.name}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {analytics.mostRecurrentBeneficiary.count} contratti
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top beneficiaries by amount */}
        <ChartCard title="Top beneficiari per importo" icon={Users}>
          <ChartContainer
            config={beneficiaryConfig}
            className="h-[280px] w-full"
          >
            <BarChart
              data={beneficiaryData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => formatEuro(Number(v), true)}
                fontSize={11}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => formatEuro(Number(value))}
                  />
                }
              />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        {/* Amount over time */}
        <ChartCard title="Importi nel tempo" icon={Calendar}>
          <ChartContainer config={timeConfig} className="h-[280px] w-full">
            <LineChart data={timeData} margin={{ left: 8, right: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="period" fontSize={11} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => formatEuro(Number(v), true)}
                fontSize={11}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => formatEuro(Number(value))}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        {/* Distribution by procedure */}
        <ChartCard title="Distribuzione per procedura" icon={Gavel}>
          <ChartContainer
            config={procedureConfig}
            className="h-[280px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={procedureData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                isAnimationActive={false}
              >
                {procedureData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <Legend data={procedureData} />
        </ChartCard>

        {/* Distribution by acquisition tool */}
        <ChartCard title="Distribuzione per strumento" icon={ShoppingCart}>
          <ChartContainer config={toolConfig} className="h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={toolData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                isAnimationActive={false}
              >
                {toolData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <Legend data={toolData} />
        </ChartCard>
      </div>
    </div>
  );
}

function Legend({
  data,
}: {
  data: { name: string; count: number; fill: string }[];
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-1.5 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: d.fill }}
          />
          <span className="text-muted-foreground">{d.name}</span>
          <span className="font-medium text-foreground tabular-nums">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand" />
        <h3 className="font-display font-bold tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm ${
        highlight ? "border-brand/40" : "border-card-border"
      }`}
    >
      {highlight && (
        <span className="absolute left-0 top-0 h-full w-1 bg-brand" />
      )}
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${
          highlight ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div
        className={`text-2xl md:text-3xl font-display font-bold tracking-tight tabular-nums ${
          highlight ? "text-brand" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 eyebrow text-muted-foreground">{label}</div>
      {sub ? (
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}

const MACROTEMI: {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: RegExp;
}[] = [
  {
    key: "ambiente",
    label: "Ambiente e rifiuti",
    icon: Leaf,
    match:
      /rifiut|ambient|ecolog|verde\b|igiene|raccolta|differenziat|spazzament|depurazione|fogna|idric/i,
  },
  {
    key: "scuole",
    label: "Scuole e istruzione",
    icon: GraduationCap,
    match: /scuol|istruz|educ|asilo|mensa|student|formazione|didatt|nido/i,
  },
  {
    key: "strade",
    label: "Strade e lavori pubblici",
    icon: HardHat,
    match:
      /strad|lavori pubblici|manutenz|asfalt|marciapied|illuminaz|edili|infrastruttur|opere|ponte|riqualificaz|pavimentaz|cantier/i,
  },
  {
    key: "sociale",
    label: "Sociale e servizi alla persona",
    icon: HeartHandshake,
    match:
      /social|assistenz|anzian|disabil|famigli|minor|sanit|inclusione|povert|welfare|domiciliar/i,
  },
  {
    key: "cultura",
    label: "Cultura, sport e turismo",
    icon: Palette,
    match: /cultur|sport|turism|bibliotec|event|spettacol|museo|teatro|festa/i,
  },
  {
    key: "mobilita",
    label: "Mobilità e trasporti",
    icon: Bus,
    match: /trasport|mobilit|parcheggi|\bbus\b|sosta|autobus|navetta/i,
  },
];

const MACROTEMA_FALLBACK = {
  key: "altro",
  label: "Altri servizi e forniture",
  icon: Package,
};

function classifyMacrotema(c: Contract) {
  const haystack = `${c.title ?? ""} ${c.description ?? ""}`.toLowerCase();
  for (const m of MACROTEMI) {
    if (m.match.test(haystack)) return m;
  }
  return MACROTEMA_FALLBACK;
}

function SpendingByMacrotema({
  contracts,
  loading,
}: {
  contracts: Contract[] | undefined;
  loading: boolean;
}) {
  const { groups, total, recent } = useMemo(() => {
    const list = contracts ?? [];
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        amount: number;
        count: number;
      }
    >();
    let total = 0;
    for (const c of list) {
      const m = classifyMacrotema(c);
      const amount = c.amount > 0 ? c.amount : 0;
      total += amount;
      const prev = map.get(m.key);
      if (prev) {
        prev.amount += amount;
        prev.count += 1;
      } else {
        map.set(m.key, {
          key: m.key,
          label: m.label,
          icon: m.icon,
          amount,
          count: 1,
        });
      }
    }
    const groups = Array.from(map.values()).sort(
      (a, b) => b.amount - a.amount || b.count - a.count,
    );
    const recent = [...list]
      .sort(
        (a, b) =>
          new Date(b.awardDate).getTime() - new Date(a.awardDate).getTime(),
      )
      .slice(0, 6);
    return { groups, total, recent };
  }, [contracts]);

  if (loading) {
    return (
      <section id="spesa" className="mb-10 scroll-mt-24">
        <Skeleton className="mb-4 h-7 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
        </div>
      </section>
    );
  }

  if (!contracts || contracts.length === 0) {
    return null;
  }

  return (
    <section id="spesa" className="mb-10 scroll-mt-24">
      <div className="mb-5">
        <span className="eyebrow text-brand">
          <Wallet className="h-3.5 w-3.5" />
          In cosa spende il Comune
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
          La spesa per macrotemi
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Gli appalti raggruppati per ambito di spesa — ambiente, scuole,
          strade, sociale e altro — con i relativi totali e l'elenco delle
          ultime spese registrate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => {
          const Icon = g.icon;
          const pct = total > 0 ? (g.amount / total) * 100 : 0;
          return (
            <div
              key={g.key}
              className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold tabular-nums text-foreground">
                    {formatEuro(g.amount, true)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.count} {g.count === 1 ? "appalto" : "appalti"}
                  </div>
                </div>
              </div>
              <div className="mt-3 font-display font-bold tracking-tight text-foreground">
                {g.label}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {pct.toFixed(1)}% della spesa
              </div>
            </div>
          );
        })}
      </div>

      {/* Ultime spese registrate */}
      <div className="mt-6 rounded-xl border border-card-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-brand" />
          <h3 className="font-display font-bold tracking-tight">
            Ultime spese registrate
          </h3>
        </div>
        <div className="divide-y divide-border">
          {recent.map((c) => {
            const m = classifyMacrotema(c);
            const Icon = m.icon;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {c.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{m.label}</span>
                    <span>·</span>
                    <span>{formatDate(c.awardDate)}</span>
                  </div>
                </div>
                <div className="shrink-0 font-display font-bold tabular-nums text-foreground">
                  {c.amount > 0 ? formatEuro(c.amount, true) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContractDetail({
  contract,
  onClose,
  themes,
}: {
  contract: Contract | null;
  onClose: () => void;
  themes: { id: number; title: string }[] | undefined;
}) {
  const theme = themes?.find((t) => t.id === contract?.themeId);
  return (
    <Dialog open={!!contract} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {contract ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5">
                {contract.cig ? (
                  <Badge
                    variant="brand"
                    className="font-mono text-xs shadow-none"
                  >
                    CIG {contract.cig}
                  </Badge>
                ) : null}
                {contract.cup ? (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs shadow-none"
                  >
                    CUP {contract.cup}
                  </Badge>
                ) : null}
                {contract.withoutTender ? (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 text-xs shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                    Senza gara
                  </Badge>
                ) : null}
                {contract.withoutMepa ? (
                  <Badge variant="outline" className="text-xs shadow-none">
                    Fuori MePA
                  </Badge>
                ) : null}
              </div>
              <DialogTitle className="mt-2 font-display leading-snug">
                {contract.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {contract.description}
              </p>

              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
                <MetaRow
                  icon={Euro}
                  label="Importo"
                  value={
                    contract.amount > 0
                      ? formatEuro(contract.amount)
                      : "Non disponibile"
                  }
                />
                <MetaRow
                  icon={Building2}
                  label="Beneficiario"
                  value={contract.supplier}
                />
                <MetaRow
                  icon={Gavel}
                  label="Modalità di scelta"
                  value={contract.procedureType}
                />
                <MetaRow
                  icon={ShoppingCart}
                  label="Strumento di acquisto"
                  value={contract.acquisitionTool ?? "Non specificato"}
                />
                <MetaRow
                  icon={Landmark}
                  label="Stazione appaltante"
                  value={contract.stazioneAppaltante ?? "Comune di Lamezia Terme"}
                />
                <MetaRow
                  icon={Calendar}
                  label="Data"
                  value={formatDate(contract.awardDate)}
                />
                <MetaRow icon={Hash} label="Stato" value={contract.status} />
                {theme ? (
                  <MetaRow icon={FileText} label="Tema" value={theme.title} />
                ) : null}
              </dl>

              {contract.anacUrl ? (
                <a
                  href={contract.anacUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Scheda ufficiale su ANAC
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
