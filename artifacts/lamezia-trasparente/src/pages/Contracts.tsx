import { useEffect, useMemo, useState } from "react";
import {
  useListContracts,
  useGetContractsAnalytics,
  useGetContractsFeedStatus,
  useListThemes,
  type Contract,
  type ContractAnalytics,
  type Theme,
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
  CheckCircle2,
  ClipboardList,
  X,
  Leaf,
  GraduationCap,
  HardHat,
  HeartHandshake,
  Palette,
  Bus,
  Package,
  Wallet,
  Info,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { MONITORING_DOCS_NOTICE } from "@/lib/monitoring";
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
import { InterventionsMap } from "@/components/InterventionsMap";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import { V0SectionLanding } from "@/components/launch/V0SectionLanding";
import { ContractSourcePipelinePanel } from "@/components/contracts";
import { quartiereLabel } from "@/lib/gis";
import { asApiList } from "@/lib/apiList";
import { BDNCP_APPALTI_URL, preferredBdncpUrl } from "@/lib/bdncp";
import {
  buildContractDossier,
  summarizeContractDossiers,
  type ContractDossier,
} from "@/lib/contractDossier";
import { MapPin } from "lucide-react";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const BDNCP_FLOW_STEPS = [
  {
    label: "Programmazione",
    detail: "bisogno pubblico, CUP e atti preliminari quando presenti",
    icon: ClipboardList,
  },
  {
    label: "Progettazione",
    detail: "quadro tecnico, importi, luogo e documenti collegabili",
    icon: HardHat,
  },
  {
    label: "Gara / pubblicazione",
    detail: "CIG, pubblicita legale e scheda nazionale BDNCP",
    icon: Landmark,
  },
  {
    label: "Affidamento",
    detail: "aggiudicatario, procedura, importo e stazione appaltante",
    icon: Gavel,
  },
  {
    label: "Esecuzione",
    detail: "contratto, varianti, liquidazioni e avanzamento documentale",
    icon: RefreshCw,
  },
  {
    label: "Valutazione",
    detail: "collaudo, chiusura, dati mancanti e verifica civica",
    icon: CheckCircle2,
  },
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
  const [quartiere, setQuartiere] = useState("all");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [identifierFilter, setIdentifierFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<Contract | null>(null);
  const [, navigate] = useLocation();

  const { data: themesData, isLoading: themesLoading } = useListThemes();
  const themes = asApiList<Theme>(themesData);

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
    if (quartiere !== "all") f.quartiere = quartiere;
    return f;
  }, [
    debouncedSearch,
    procedureType,
    acquisitionTool,
    themeId,
    minAmount,
    maxAmount,
    from,
    to,
    quartiere,
  ]);

  const { data: contractsData, isLoading } = useListContracts(filters);
  const contracts = asApiList<Contract>(contractsData);
  const { data: analytics, isLoading: analyticsLoading } =
    useGetContractsAnalytics(filters);
  const { data: feedStatus } = useGetContractsFeedStatus();
  const dossierByContractId = useMemo(
    () =>
      new Map(
        contracts.map((contract) => [
          contract.id,
          buildContractDossier({ contract }),
        ]),
      ),
    [contracts],
  );
  const visibleContracts = useMemo(
    () =>
      contracts.filter((contract) =>
        matchesDossierFilters(contract, dossierByContractId.get(contract.id), {
          lifecycleFilter,
          identifierFilter,
          sourceFilter,
        }),
      ),
    [
      contracts,
      dossierByContractId,
      lifecycleFilter,
      identifierFilter,
      sourceFilter,
    ],
  );

  // Build distinct option lists from the full (unfiltered) list is not available;
  // derive options from the current data plus known seed values.
  const { procedures, tools } = useMemo(() => {
    const p = new Set<string>();
    const t = new Set<string>();
    contracts.forEach((c) => {
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
    to ||
    quartiere !== "all" ||
    lifecycleFilter !== "all" ||
    identifierFilter !== "all" ||
    sourceFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setProcedureType("all");
    setAcquisitionTool("all");
    setThemeId("all");
    setMinAmount("");
    setMaxAmount("");
    setFrom("");
    setTo("");
    setQuartiere("all");
    setLifecycleFilter("all");
    setIdentifierFilter("all");
    setSourceFilter("all");
  };

  const locatedContracts = useMemo(
    () =>
      visibleContracts.filter(
        (c) =>
          typeof c.latitude === "number" && typeof c.longitude === "number",
      ),
    [visibleContracts],
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <V0SectionLanding
        eyebrow="Contratti pubblici"
        icon={FileText}
        title="Contratti pubblici sotto osservazione"
        subtitle={
          <>
            Contratti e affidamenti della stazione appaltante{" "}
            <span className="font-medium text-foreground">
              Comune di Lamezia Terme
            </span>{" "}
            (CF 00301390795), letti come documenti amministrativi da consultare
            con fonti e limiti espliciti.
          </>
        }
        stateLabel="Pubblicabile"
        stateDescription="Sezione consultabile nella versione pubblica, con copertura e aggiornamenti da verificare sulle fonti."
        findItems={[
          "Elenco, filtri e mappe dei contratti disponibili nel perimetro locale.",
          "Importi, oggetti, operatori economici e collegamenti documentali quando presenti.",
          "Indicatori di lettura trattati come segnali documentali, non come conclusioni.",
        ]}
        missingItems={[
          "Dichiarazioni di sincronizzazione con tutte le fonti contrattuali.",
          "Schede di dettaglio consolidate da dataset ufficiali per ogni affidamento e storico.",
          "Verifica puntuale dei dati mancanti sui documenti originari.",
        ]}
        sourceLimit={
          <>
            La base usa dataset locale, collegamenti ANAC/BDNCP e atti
            disponibili nel sistema. Non dichiara una sincronizzazione ANAC:
            dati mancanti o incompleti indicano una necessita di verifica
            documentale e non implicano irregolarita.
          </>
        }
        cta={{ label: "Consulta i contratti", href: "#contratti-elenco" }}
        secondaryLink={{ label: "Metodo", href: "/metodologia" }}
        actions={
          <FeedSubscribeButton
            feedPath="/feeds/contratti.xml"
            title="Appalti Pubblici — Lamezia Trasparente"
            className="shrink-0"
          />
        }
      />

      {/* Last updated + ANAC portal link */}
      <div
        id="contratti-elenco"
        className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-brand" />
          <span>
            Ultimo aggiornamento dati:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(feedStatus?.lastUpdatedAt)}
            </span>
            {feedStatus?.itemsTotal ? (
              <> · {feedStatus.itemsTotal} contratti monitorati</>
            ) : null}
          </span>
        </div>
        <a
          href={feedStatus?.url || BDNCP_APPALTI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Landmark className="h-4 w-4" />
          Portale BDNCP ANAC - dati appalti
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Avviso data inizio monitoraggio */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          {MONITORING_DOCS_NOTICE}{" "}
          <Link
            href="/metodologia"
            className="font-medium text-foreground underline underline-offset-2 hover:text-brand transition-colors"
          >
            Scopri di più
          </Link>
        </p>
      </div>

      {/* In cosa spende il Comune — spesa per macrotemi */}
      <ContractSourcePipelinePanel />

      <BdncpBridge
        contracts={contracts}
        loading={isLoading}
        portalUrl={feedStatus?.url || BDNCP_APPALTI_URL}
      />

      <SpendingByMacrotema contracts={contracts} loading={isLoading} />

      {/* Analytics */}
      <Analytics loading={analyticsLoading} analytics={analytics} />

      {/* Filters */}
      <div
        data-tour="contracts-search"
        className="mt-10 mb-4 grid gap-3 rounded-xl border border-border bg-muted/40 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
      >
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
            <SelectTrigger
              className="h-11 bg-background"
              aria-label="Filtra per tema"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {themeId === "all"
                    ? "Tutti i Temi"
                    : themes?.find((t) => t.id.toString() === themeId)?.title ||
                      "Tema"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Temi</SelectItem>
              {!themesLoading &&
                themes.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={quartiere} onValueChange={setQuartiere}>
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per quartiere"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {quartiere === "all"
                  ? "Tutti i quartieri"
                  : quartiereLabel(quartiere)}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i quartieri</SelectItem>
            <SelectItem value="nicastro">Nicastro</SelectItem>
            <SelectItem value="sambiase">Sambiase</SelectItem>
            <SelectItem value="santeufemia">Sant'Eufemia</SelectItem>
          </SelectContent>
        </Select>

        <Select value={procedureType} onValueChange={setProcedureType}>
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per procedura"
          >
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
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per strumento"
          >
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

        <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per ciclo di vita"
          >
            <div className="flex items-center gap-2 truncate">
              <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {lifecycleFilter === "all"
                  ? "Tutte le fasi"
                  : lifecycleFilter === "missing-execution"
                    ? "Esecuzione da integrare"
                    : lifecycleFilter === "missing-evaluation"
                      ? "Valutazione da integrare"
                      : lifecycleFilter === "complete"
                        ? "Fasi documentate"
                        : "Da verificare"}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le fasi</SelectItem>
            <SelectItem value="complete">Fasi documentate</SelectItem>
            <SelectItem value="needs-review">Da verificare</SelectItem>
            <SelectItem value="missing-execution">
              Esecuzione da integrare
            </SelectItem>
            <SelectItem value="missing-evaluation">
              Valutazione da integrare
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={identifierFilter} onValueChange={setIdentifierFilter}>
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per identificativo"
          >
            <div className="flex items-center gap-2 truncate">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {identifierFilter === "all"
                  ? "Tutti gli identificativi"
                  : identifierFilter === "with-cig"
                    ? "Con CIG"
                    : identifierFilter === "without-cig"
                      ? "Senza CIG"
                      : identifierFilter === "with-cup"
                        ? "Con CUP"
                        : "Senza CUP"}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli identificativi</SelectItem>
            <SelectItem value="with-cig">Con CIG</SelectItem>
            <SelectItem value="without-cig">Senza CIG</SelectItem>
            <SelectItem value="with-cup">Con CUP</SelectItem>
            <SelectItem value="without-cup">Senza CUP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger
            className="h-11 bg-background"
            aria-label="Filtra per stato fonte"
          >
            <div className="flex items-center gap-2 truncate">
              <Landmark className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {sourceFilter === "all"
                  ? "Tutte le fonti"
                  : sourceFilter === "bdncp-bridge"
                    ? "Ponte BDNCP"
                    : "Fonte mancante"}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le fonti</SelectItem>
            <SelectItem value="bdncp-bridge">Ponte BDNCP</SelectItem>
            <SelectItem value="missing-source">Fonte mancante</SelectItem>
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
            {visibleContracts ? (
              <>
                <span className="font-display font-bold text-foreground tabular-nums">
                  {visibleContracts.length}
                </span>{" "}
                {visibleContracts.length === 1 ? "risultato" : "risultati"}
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

      {/* Mappa degli interventi (GIS) */}
      <div className="mb-8 rounded-xl border border-card-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" />
            <h3 className="font-display font-bold tracking-tight">
              Mappa degli interventi
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {locatedContracts.length} su {visibleContracts.length} appalti
            geolocalizzati
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Solo gli appalti con un luogo riconoscibile (lavori, opere, interventi
          su strade ed edifici) compaiono sulla mappa: la maggior parte degli
          atti amministrativi non indica una posizione fisica. I punti
          tratteggiati in ambra hanno una posizione approssimata, da verificare.
        </p>
        {isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-xl" />
        ) : locatedContracts.length > 0 ? (
          <InterventionsMap
            contracts={locatedContracts}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nessun appalto geolocalizzato per i filtri attuali.
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div
        data-tour="contracts-list"
        className="border border-border rounded-xl bg-card overflow-hidden shadow-sm"
      >
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
              ) : visibleContracts.length > 0 ? (
                visibleContracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="group hover-elevate cursor-pointer"
                    onClick={() => navigate(`/contratti/${contract.id}`)}
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
                        {contract.cup ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] shadow-none"
                          >
                            CUP {contract.cup}
                          </Badge>
                        ) : null}
                        {preferredBdncpUrl(contract.anacUrl, contract.cig) ? (
                          <a
                            href={
                              preferredBdncpUrl(
                                contract.anacUrl,
                                contract.cig,
                              ) ?? undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Apri ricerca BDNCP per il contratto ${contract.title}`}
                          >
                            BDNCP/PVL
                            <ExternalLink className="h-3 w-3" />
                          </a>
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
                        {contract.amount > 0
                          ? formatEuro(contract.amount)
                          : "—"}
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
                          navigate(`/contratti/${contract.id}`);
                        }}
                        aria-label="Apri la storyline dell'appalto"
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

function BdncpBridge({
  contracts,
  loading,
  portalUrl,
}: {
  contracts: Contract[] | undefined;
  loading: boolean;
  portalUrl: string;
}) {
  const list = asApiList<Contract>(contracts);
  const summary = summarizeContractDossiers(list);

  return (
    <section className="mb-10 rounded-2xl border border-card-border bg-card p-5 shadow-sm md:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.2fr]">
        <div className="space-y-4">
          <span className="eyebrow text-primary">
            <Landmark className="h-3.5 w-3.5" />
            Ponte BDNCP
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Fascicoli civici CIG/CUP
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Il CIG apre il ponte verso BDNCP/PCP, mentre il CUP rende
              leggibile l'asse opera/progetto per i lavori pubblici. La
              piattaforma locale affianca questi identificativi con atti Albo,
              localizzazione e stato del ciclo di vita quando le fonti sono
              disponibili.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <BdncpMetric
                icon={Hash}
                label="Contratti con CIG"
                value={`${summary.withCig}/${summary.total}`}
                sub="chiave procedura da verificare in BDNCP"
              />
              <BdncpMetric
                icon={FileText}
                label="Contratti con CUP"
                value={`${summary.withCup}/${summary.total}`}
                sub="asse progetto/opera quando disponibile"
              />
              <BdncpMetric
                icon={ExternalLink}
                label="Ponti BDNCP"
                value={`${summary.withBdncpSearchBridge}/${summary.total}`}
                sub="ponte di ricerca, non ingestione diretta"
              />
              <BdncpMetric
                icon={HardHat}
                label="Lavori pubblici nel perimetro"
                value={String(summary.publicWorks)}
                sub="contratti con ambito o testo compatibile"
              />
              <BdncpMetric
                icon={RefreshCw}
                label="Esecuzione da integrare"
                value={String(summary.missingExecutionEvidence)}
                sub="fase non documentata o solo parziale"
              />
              <BdncpMetric
                icon={CheckCircle2}
                label="Valutazione da integrare"
                value={String(summary.missingEvaluationEvidence)}
                sub="collaudo/esito non documentati"
              />
            </div>
          )}

          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Apri il cruscotto BDNCP ANAC
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {BDNCP_FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.label}
                className="rounded-xl border border-border bg-muted/25 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Fase {index + 1}
                    </div>
                    <div className="mt-0.5 font-display font-bold tracking-tight text-foreground">
                      {step.label}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function BdncpMetric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="font-display text-xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function matchesDossierFilters(
  _contract: Contract,
  dossier: ContractDossier | undefined,
  filters: {
    lifecycleFilter: string;
    identifierFilter: string;
    sourceFilter: string;
  },
): boolean {
  if (!dossier) {
    return true;
  }

  if (filters.lifecycleFilter === "complete") {
    if (dossier.lifecycleCompleteness !== "complete") return false;
  } else if (filters.lifecycleFilter === "needs-review") {
    if (dossier.lifecycleCompleteness !== "needs-review") return false;
  } else if (filters.lifecycleFilter === "missing-execution") {
    if (!dossier.missingExecutionEvidence) return false;
  } else if (filters.lifecycleFilter === "missing-evaluation") {
    if (!dossier.missingEvaluationEvidence) return false;
  }

  const cig = dossier.identifiers.find(
    (identifier) => identifier.kind === "cig",
  );
  const cup = dossier.identifiers.find(
    (identifier) => identifier.kind === "cup",
  );
  const hasCig = cig?.formalStatus === "formal-only";
  const hasCup = cup?.formalStatus === "formal-only";

  if (filters.identifierFilter === "with-cig" && !hasCig) return false;
  if (filters.identifierFilter === "without-cig" && hasCig) return false;
  if (filters.identifierFilter === "with-cup" && !hasCup) return false;
  if (filters.identifierFilter === "without-cup" && hasCup) return false;

  const hasBdncpBridge = dossier.evidence.some(
    (evidence) =>
      evidence.sourceKind === "bdncp" &&
      evidence.sourceStatus === "search-bridge",
  );
  const hasMissingSource = dossier.evidence.some(
    (evidence) => evidence.sourceStatus === "missing-source",
  );

  if (filters.sourceFilter === "bdncp-bridge" && !hasBdncpBridge) return false;
  if (filters.sourceFilter === "missing-source" && !hasMissingSource)
    return false;

  return true;
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

  if (!analytics || typeof analytics !== "object") {
    return null;
  }

  const totalCount =
    typeof analytics.totalCount === "number" ? analytics.totalCount : 0;
  const totalAmount =
    typeof analytics.totalAmount === "number" ? analytics.totalAmount : 0;
  const withoutTenderPct =
    typeof analytics.withoutTenderPct === "number"
      ? analytics.withoutTenderPct
      : 0;
  const withoutTenderCount =
    typeof analytics.withoutTenderCount === "number"
      ? analytics.withoutTenderCount
      : 0;
  const withoutMepaPct =
    typeof analytics.withoutMepaPct === "number"
      ? analytics.withoutMepaPct
      : 0;
  const withoutMepaCount =
    typeof analytics.withoutMepaCount === "number"
      ? analytics.withoutMepaCount
      : 0;
  const mostRecurrentBeneficiary =
    analytics.mostRecurrentBeneficiary &&
    typeof analytics.mostRecurrentBeneficiary.name === "string" &&
    typeof analytics.mostRecurrentBeneficiary.count === "number"
      ? analytics.mostRecurrentBeneficiary
      : null;

  if (totalCount === 0) {
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

  const procedureData = asApiList<
    NonNullable<ContractAnalytics["byProcedure"]>[number]
  >(analytics.byProcedure).map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const toolData = asApiList<
    NonNullable<ContractAnalytics["byAcquisitionTool"]>[number]
  >(analytics.byAcquisitionTool).map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const beneficiaryData = asApiList<
    NonNullable<ContractAnalytics["topBeneficiaries"]>[number]
  >(analytics.topBeneficiaries).map((d) => ({
    name: d.name.length > 24 ? `${d.name.slice(0, 22)}…` : d.name,
    fullName: d.name,
    value: d.value,
  }));
  const timeData = asApiList<
    NonNullable<ContractAnalytics["amountOverTime"]>[number]
  >(analytics.amountOverTime).map((d) => ({
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
          value={formatEuro(totalAmount, true)}
          icon={Euro}
          highlight
        />
        <StatCard
          label="Contratti"
          value={String(totalCount)}
          icon={FileText}
        />
        <StatCard
          label="Affidati senza gara"
          value={`${withoutTenderPct.toFixed(0)}%`}
          sub={`${withoutTenderCount} contratti`}
          icon={Gavel}
        />
        <StatCard
          label="Fuori dal MePA"
          value={`${withoutMepaPct.toFixed(0)}%`}
          sub={`${withoutMepaCount} contratti`}
          icon={ShoppingCart}
        />
      </div>

      {/* Recurrent beneficiary highlight */}
      {mostRecurrentBeneficiary ? (
        <div className="flex items-center gap-3 rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Beneficiario più ricorrente
            </div>
            <div className="font-display font-bold text-foreground">
              {mostRecurrentBeneficiary.name}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {mostRecurrentBeneficiary.count} contratti
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
          <ChartContainer config={procedureConfig} className="h-[280px] w-full">
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
          highlight
            ? "bg-brand/15 text-brand"
            : "bg-muted text-muted-foreground"
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

// Presentazione dei macrotemi (etichetta + icona). La classificazione è
// persistita sul contratto (campo `macrotema`, assegnato dall'ingestione e
// correggibile dalla redazione): qui mappiamo solo la chiave alla sua resa
// grafica.
const MACROTEMA_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ambiente: { label: "Ambiente e rifiuti", icon: Leaf },
  scuole: { label: "Scuole e istruzione", icon: GraduationCap },
  strade: { label: "Strade e lavori pubblici", icon: HardHat },
  sociale: { label: "Sociale e servizi alla persona", icon: HeartHandshake },
  cultura: { label: "Cultura, sport e turismo", icon: Palette },
  mobilita: { label: "Mobilità e trasporti", icon: Bus },
  altro: { label: "Altri servizi e forniture", icon: Package },
};

const MACROTEMA_FALLBACK_KEY = "altro";

function macrotemaOf(c: Contract) {
  const key =
    c.macrotema && MACROTEMA_META[c.macrotema]
      ? c.macrotema
      : MACROTEMA_FALLBACK_KEY;
  return { key, ...MACROTEMA_META[key] };
}

function SpendingByMacrotema({
  contracts,
  loading,
}: {
  contracts: Contract[] | undefined;
  loading: boolean;
}) {
  const { groups, total, recent } = useMemo(() => {
    const list = asApiList<Contract>(contracts);
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
      const m = macrotemaOf(c);
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
        <span className="eyebrow text-primary">
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
            const m = macrotemaOf(c);
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
                  value={
                    contract.stazioneAppaltante ?? "Comune di Lamezia Terme"
                  }
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
                {typeof contract.latitude === "number" ? (
                  <MetaRow
                    icon={MapPin}
                    label="Luogo dell'intervento"
                    value={
                      [
                        contract.geoAddress,
                        quartiereLabel(contract.geoQuartiere),
                      ]
                        .filter((v) => v && v !== "—")
                        .join(" · ") || "Posizione disponibile"
                    }
                  />
                ) : null}
              </dl>

              {typeof contract.latitude === "number" ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <InterventionsMap
                    contracts={[contract]}
                    selectedId={contract.id}
                    showBaseLayers={false}
                    className="h-[240px] w-full"
                  />
                  {contract.geoVerify ? (
                    <div className="bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      Posizione approssimata, in attesa di verifica redazionale.
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/contratti/${contract.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Vedi il fascicolo
                </Link>
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
