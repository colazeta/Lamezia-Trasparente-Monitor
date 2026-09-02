import { useEffect, useMemo, useState } from "react";
import {
  useGetContractsFeedStatus,
  useListContracts,
  useListThemes,
  type Contract,
  type Theme,
} from "@workspace/api-client-react";
import {
  ChevronDown,
  FileText,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { InterventionsMap } from "@/components/InterventionsMap";
import { SourceAvailabilityNotice } from "@/components/SourceAvailabilityNotice";
import { asApiList } from "@/lib/apiList";
import { BDNCP_APPALTI_URL } from "@/lib/bdncp";
import { buildContractDossier } from "@/lib/contractDossier";
import { quartiereLabel } from "@/lib/gis";
import {
  attentionSignals,
  buildSignalContext,
  matchesDossierFilters,
} from "./contractCitizenSignals";
import {
  AttentionContracts,
  CitizenSummary,
  ContractsList,
  FilterGroup,
} from "./ContractsCitizenSections";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMM yyyy, HH:mm", { locale: it });
}

export function Contracts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [procedureType, setProcedureType] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [themeId, setThemeId] = useState("all");
  const [quartiere, setQuartiere] = useState("all");
  const [acquisitionTool, setAcquisitionTool] = useState("all");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [identifierFilter, setIdentifierFilter] = useState("all");
  const [mapOpen, setMapOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: themesData, isLoading: themesLoading } = useListThemes();
  const themes = asApiList<Theme>(themesData);

  const filters = useMemo(() => {
    const next: Record<string, string | number> = {};
    if (debouncedSearch) next.search = debouncedSearch;
    if (procedureType !== "all") next.procedureType = procedureType;
    if (minAmount && !Number.isNaN(Number(minAmount))) next.minAmount = Number(minAmount);
    if (maxAmount && !Number.isNaN(Number(maxAmount))) next.maxAmount = Number(maxAmount);
    if (from) next.from = from;
    if (to) next.to = to;
    if (themeId !== "all") next.themeId = Number(themeId);
    if (quartiere !== "all") next.quartiere = quartiere;
    if (acquisitionTool !== "all") next.acquisitionTool = acquisitionTool;
    return next;
  }, [
    acquisitionTool,
    debouncedSearch,
    from,
    maxAmount,
    minAmount,
    procedureType,
    quartiere,
    themeId,
    to,
  ]);

  const {
    data: contractsData,
    isLoading,
    isError: contractsUnavailable,
  } = useListContracts(filters);
  const contracts = asApiList<Contract>(contractsData);
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
        matchesDossierFilters(dossierByContractId.get(contract.id), {
          lifecycleFilter,
          identifierFilter,
        }),
      ),
    [contracts, dossierByContractId, identifierFilter, lifecycleFilter],
  );

  const signalContext = useMemo(() => buildSignalContext(contracts), [contracts]);
  const signalsByContractId = useMemo(
    () =>
      new Map(
        contracts.map((contract) => [
          contract.id,
          attentionSignals(contract, signalContext),
        ]),
      ),
    [contracts, signalContext],
  );
  const attentionContracts = useMemo(
    () =>
      contracts
        .map((contract) => ({
          contract,
          signals: signalsByContractId.get(contract.id) ?? [],
        }))
        .filter((item) => item.signals.length > 0)
        .sort(
          (a, b) =>
            b.signals.length - a.signals.length ||
            Math.max(0, b.contract.amount) - Math.max(0, a.contract.amount),
        )
        .slice(0, 4),
    [contracts, signalsByContractId],
  );

  const { procedures, tools } = useMemo(() => {
    const procedureSet = new Set<string>();
    const toolSet = new Set<string>();
    for (const contract of contracts) {
      if (contract.procedureType) procedureSet.add(contract.procedureType);
      if (contract.acquisitionTool) toolSet.add(contract.acquisitionTool);
    }
    return {
      procedures: Array.from(procedureSet).sort(),
      tools: Array.from(toolSet).sort(),
    };
  }, [contracts]);

  const locatedContracts = useMemo(
    () =>
      visibleContracts.filter(
        (contract) =>
          typeof contract.latitude === "number" &&
          typeof contract.longitude === "number",
      ),
    [visibleContracts],
  );

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      procedureType !== "all" ||
      minAmount ||
      maxAmount ||
      from ||
      to ||
      themeId !== "all" ||
      quartiere !== "all" ||
      acquisitionTool !== "all" ||
      lifecycleFilter !== "all" ||
      identifierFilter !== "all",
  );

  const resetFilters = () => {
    setSearch("");
    setProcedureType("all");
    setMinAmount("");
    setMaxAmount("");
    setFrom("");
    setTo("");
    setThemeId("all");
    setQuartiere("all");
    setAcquisitionTool("all");
    setLifecycleFilter("all");
    setIdentifierFilter("all");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <span className="eyebrow text-primary">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Contratti pubblici
        </span>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight md:text-4xl">
              Cosa affida il Comune, a chi e per quanto
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Parti dalle informazioni essenziali e apri il singolo contratto
              per seguirne gli atti nel tempo. Codici, provenienza e dettagli
              tecnici restano disponibili quando servono per verificare.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <a href="#contratti-elenco">Esplora i contratti</a>
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Ultimo aggiornamento: {formatDateTime(feedStatus?.lastUpdatedAt)}</span>
          <span>I dati mancanti non sono trattati come zero e non indicano irregolarità.</span>
        </div>
      </header>

      {contractsUnavailable ? (
        <SourceAvailabilityNotice
          description="Il servizio dati dei contratti non risponde con un payload verificabile. La pagina non mostra valori sostitutivi: il collegamento può essere verificato dalla fonte istituzionale."
          sourceHref={BDNCP_APPALTI_URL}
          sourceLabel="Verifica su BDNCP ANAC"
        />
      ) : (
        <>
          <CitizenSummary contracts={contracts} loading={isLoading} />
          <AttentionContracts
            items={attentionContracts}
            loading={isLoading}
            onOpen={(contract) => navigate(`/contratti/${contract.id}`)}
          />

          <section id="contratti-elenco" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow text-primary">Archivio</span>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Esplora tutti i contratti
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Cerca per oggetto o operatore e restringi periodo, importo o
                  procedura. I filtri specialistici sono separati dalla ricerca
                  principale.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong className="font-display text-lg text-foreground tabular-nums">
                  {visibleContracts.length}
                </strong>{" "}
                {visibleContracts.length === 1 ? "risultato" : "risultati"}
              </div>
            </div>

            <div data-tour="contracts-search" className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-2">
                <FilterGroup label="Cerca">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Oggetto, operatore o CIG" className="h-11 bg-background pl-9" />
                  </div>
                </FilterGroup>

                <FilterGroup label="Procedura">
                  <Select value={procedureType} onValueChange={setProcedureType}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per procedura">
                      <span className="truncate">{procedureType === "all" ? "Tutte le procedure" : procedureType}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le procedure</SelectItem>
                      {procedures.map((procedure) => <SelectItem key={procedure} value={procedure}>{procedure}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterGroup>

                <FilterGroup label="Periodo">
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" aria-label="Data iniziale" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 bg-background" />
                    <Input type="date" aria-label="Data finale" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 bg-background" />
                  </div>
                </FilterGroup>

                <FilterGroup label="Importo">
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" inputMode="numeric" placeholder="Min €" aria-label="Importo minimo" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} className="h-11 bg-background" />
                    <Input type="number" inputMode="numeric" placeholder="Max €" aria-label="Importo massimo" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} className="h-11 bg-background" />
                  </div>
                </FilterGroup>
              </div>

              <details className="group mt-4 border-t border-border pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                  <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Filtri avanzati</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Select value={themeId} onValueChange={setThemeId}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per tema"><span className="truncate">{themeId === "all" ? "Tutti i temi" : themes.find((theme) => theme.id.toString() === themeId)?.title ?? "Tema"}</span></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i temi</SelectItem>
                      {!themesLoading && themes.map((theme) => <SelectItem key={theme.id} value={theme.id.toString()}>{theme.title}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={quartiere} onValueChange={setQuartiere}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per quartiere"><span className="truncate">{quartiere === "all" ? "Tutti i quartieri" : quartiereLabel(quartiere)}</span></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i quartieri</SelectItem>
                      <SelectItem value="nicastro">Nicastro</SelectItem>
                      <SelectItem value="sambiase">Sambiase</SelectItem>
                      <SelectItem value="santeufemia">Sant&apos;Eufemia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={acquisitionTool} onValueChange={setAcquisitionTool}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per strumento di acquisto"><span className="truncate">{acquisitionTool === "all" ? "Tutti gli strumenti" : acquisitionTool}</span></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli strumenti</SelectItem>
                      {tools.map((tool) => <SelectItem key={tool} value={tool}>{tool}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per completezza della cronologia"><span className="truncate">{lifecycleFilter === "all" ? "Qualsiasi cronologia" : lifecycleFilter === "complete" ? "Fasi documentate" : lifecycleFilter === "missing-execution" ? "Esecuzione da integrare" : lifecycleFilter === "missing-evaluation" ? "Valutazione da integrare" : "Da verificare"}</span></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualsiasi cronologia</SelectItem>
                      <SelectItem value="complete">Fasi documentate</SelectItem>
                      <SelectItem value="needs-review">Da verificare</SelectItem>
                      <SelectItem value="missing-execution">Esecuzione da integrare</SelectItem>
                      <SelectItem value="missing-evaluation">Valutazione da integrare</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={identifierFilter} onValueChange={setIdentifierFilter}>
                    <SelectTrigger className="h-11 bg-background" aria-label="Filtra per identificativo"><span className="truncate">{identifierFilter === "all" ? "Qualsiasi identificativo" : identifierFilter === "with-cig" ? "Con CIG" : identifierFilter === "without-cig" ? "Senza CIG" : identifierFilter === "with-cup" ? "Con CUP" : "Senza CUP"}</span></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualsiasi identificativo</SelectItem>
                      <SelectItem value="with-cig">Con CIG</SelectItem>
                      <SelectItem value="without-cig">Senza CIG</SelectItem>
                      <SelectItem value="with-cup">Con CUP</SelectItem>
                      <SelectItem value="without-cup">Senza CUP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </details>

              {hasActiveFilters ? (
                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground"><X className="mr-1 h-4 w-4" />Azzera filtri</Button>
                </div>
              ) : null}
            </div>

            <ContractsList contracts={visibleContracts} signalsByContractId={signalsByContractId} loading={isLoading} onOpen={(contract) => navigate(`/contratti/${contract.id}`)} />

            {locatedContracts.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
                <button type="button" aria-expanded={mapOpen} onClick={() => setMapOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold text-foreground sm:p-5">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Vedi gli interventi localizzati sulla mappa</span>
                  <span className="inline-flex items-center gap-2 text-xs font-normal text-muted-foreground">{locatedContracts.length} localizzati<ChevronDown className={`h-4 w-4 transition-transform ${mapOpen ? "rotate-180" : ""}`} /></span>
                </button>
                {mapOpen ? (
                  <div className="border-t border-border p-4 sm:p-5">
                    <p className="mb-4 text-sm text-muted-foreground">La mappa include soltanto i contratti per cui è disponibile una localizzazione riconoscibile. Non è quindi una vista completa dell’archivio.</p>
                    <InterventionsMap contracts={locatedContracts} onSelect={(contract) => navigate(`/contratti/${contract.id}`)} className="h-[420px] w-full" />
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
