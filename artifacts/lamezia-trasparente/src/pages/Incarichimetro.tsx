import { useMemo, useState } from "react";
import {
  useListContracts,
  useListPublications,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  BarChart3,
  ExternalLink,
  FileText,
  Hash,
  Info,
  Scale,
  SearchCheck,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import {
  buildContractRecord,
  buildOperatorAggregates,
  buildPublicationRecord,
  DEFAULT_INCARICHIMETRO_FILTERS,
  filterMonitoredRecords,
  type IncarichimetroFilters,
  type MonitoredRecord,
} from "@/lib/incarichimetroFilters";

import { PageMeta } from "@/components/seo/PageMeta";
import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function formatEuro(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
      </div>
    </Card>
  );
}

function FilterSelect<TValue extends string>({
  id,
  label,
  value,
  onValueChange,
  options,
}: {
  id: string;
  label: string;
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: { value: TValue; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as TValue)}
      >
        <SelectTrigger id={id} aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function Incarichimetro() {
  const { data: contracts, isLoading: contractsLoading } = useListContracts();
  const { data: publications, isLoading: publicationsLoading } =
    useListPublications();
  const [filters, setFilters] = useState<IncarichimetroFilters>(
    DEFAULT_INCARICHIMETRO_FILTERS,
  );

  const updateFilter = <TKey extends keyof IncarichimetroFilters>(
    key: TKey,
    value: IncarichimetroFilters[TKey],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const records = useMemo(() => {
    const contractRecords = (contracts ?? [])
      .map(buildContractRecord)
      .filter((record): record is MonitoredRecord => record != null);
    const publicationRecords = (publications ?? [])
      .map(buildPublicationRecord)
      .filter((record): record is MonitoredRecord => record != null);
    return [...contractRecords, ...publicationRecords].sort((a, b) => {
      const ad = a.date ? new Date(a.date).getTime() : 0;
      const bd = b.date ? new Date(b.date).getTime() : 0;
      return bd - ad;
    });
  }, [contracts, publications]);

  const filteredRecords = useMemo(
    () => filterMonitoredRecords(records, filters),
    [records, filters],
  );
  const aggregates = useMemo(
    () => buildOperatorAggregates(filteredRecords),
    [filteredRecords],
  );
  const loading = contractsLoading || publicationsLoading;
  const repeatedOperators = aggregates.filter((item) => item.records > 1);
  const knownAmount = filteredRecords.reduce(
    (sum, record) => sum + (record.amount ?? 0),
    0,
  );
  const missingCig = filteredRecords.filter(
    (record) => !record.signals.hasCig,
  ).length;
  const missingComparative = filteredRecords.filter(
    (record) => !record.signals.hasComparativeProcedureSignal,
  ).length;
  const activeFilters = Object.values(filters).filter(
    (value) => value !== "all",
  ).length;

  return (
    <>
      <PageMeta
        title="Incarichimetro"
        description="Dashboard civica prudente su concentrazione, ricorrenza e rotazione di incarichi, consulenze, servizi professionali e affidamenti ricorrenti."
        path="/incarichimetro"
      />

      <div className="container mx-auto px-4 py-10 md:px-6 lg:py-14">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            Monitoraggio civico sperimentale
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Incarichimetro
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Una vista pubblica e prudente per osservare concentrazione,
            ricorrenza e possibile debole rotazione negli incarichi esterni, nei
            servizi professionali, negli affidamenti tecnici, legali e di
            consulenza.
          </p>
          <CivicMonitorReturn context="Gli indicatori su incarichi e affidamenti rientrano nel Monitor civico come segnali da collegare a fonti, atti e bisogni di verifica." />
        </div>

        <section
          aria-labelledby="incarichimetro-avvertenza"
          className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm"
        >
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h2
                id="incarichimetro-avvertenza"
                className="font-semibold text-foreground"
              >
                Avvertenza metodologica
              </h2>
              <p className="text-muted-foreground">
                Gli indicatori non sono prove di irregolarità, favoritismi o
                illeciti. Mostrano soltanto pattern documentali da verificare
                sulle fonti: concentrazione, ricorrenza, rotazione
                potenzialmente debole, documentazione mancante o riferimenti
                CIG/CUP/procedura comparativa non rilevati automaticamente.
              </p>
              <p className="text-muted-foreground">
                I dati dei contratti sono trattati come dataset locale e fonte
                collegata, non come sincronizzazione ANAC completa; le
                informazioni estratte dagli atti dell'Albo sono da leggere come
                arricchimenti automatici o elementi da verificare nel documento.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="filtri-incarichimetro"
          className="mt-8 rounded-2xl border bg-card p-5"
        >
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2
                id="filtri-incarichimetro"
                className="text-xl font-bold tracking-tight"
              >
                Filtri pubblici
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                I filtri restringono la vista e le aggregazioni senza modificare
                le cautele: ogni selezione mostra segnali documentali da
                verificare sulle fonti.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {filteredRecords.length} di {records.length} record
              </Badge>
              {activeFilters > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(DEFAULT_INCARICHIMETRO_FILTERS)}
                >
                  Reimposta filtri
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect
              id="incarichimetro-source-filter"
              label="Fonte"
              value={filters.source}
              onValueChange={(value) => updateFilter("source", value)}
              options={[
                { value: "all", label: "Tutte le fonti" },
                { value: "Contratti ANAC", label: "Contratti ANAC" },
                { value: "Albo Pretorio", label: "Albo Pretorio" },
              ]}
            />
            <FilterSelect
              id="incarichimetro-cig-filter"
              label="Presenza CIG"
              value={filters.cig}
              onValueChange={(value) => updateFilter("cig", value)}
              options={[
                { value: "all", label: "Tutti" },
                { value: "present", label: "CIG presente" },
                { value: "missing", label: "CIG non presente/rilevato" },
              ]}
            />
            <FilterSelect
              id="incarichimetro-cup-filter"
              label="Presenza CUP"
              value={filters.cup}
              onValueChange={(value) => updateFilter("cup", value)}
              options={[
                { value: "all", label: "Tutti" },
                { value: "present", label: "CUP presente" },
                { value: "missing", label: "CUP non presente/rilevato" },
              ]}
            />
            <FilterSelect
              id="incarichimetro-direct-filter"
              label="Affidamento diretto rilevato"
              value={filters.directProcedure}
              onValueChange={(value) => updateFilter("directProcedure", value)}
              options={[
                { value: "all", label: "Tutti" },
                { value: "present", label: "Segnale presente" },
                { value: "missing", label: "Segnale non rilevato" },
              ]}
            />
            <FilterSelect
              id="incarichimetro-comparative-filter"
              label="Procedura comparativa"
              value={filters.comparativeMissing}
              onValueChange={(value) =>
                updateFilter("comparativeMissing", value)
              }
              options={[
                { value: "all", label: "Tutti" },
                { value: "present", label: "Comparativa non rilevata" },
                { value: "missing", label: "Elementi comparativi rilevati" },
              ]}
            />
            <FilterSelect
              id="incarichimetro-status-filter"
              label="Stato del dato"
              value={filters.sourceStatus}
              onValueChange={(value) => updateFilter("sourceStatus", value)}
              options={[
                { value: "all", label: "Tutti gli stati" },
                { value: "ufficiale", label: "Ufficiale" },
                { value: "estratto", label: "Estratto" },
                { value: "da verificare", label: "Da verificare" },
              ]}
            />
          </div>
        </section>

        <section
          aria-label="Indicatori sintetici"
          className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                icon={FileText}
                label="Record monitorati"
                value={String(filteredRecords.length)}
                note="Contratti e atti filtrati per parole chiave pertinenti."
              />
              <StatCard
                icon={Users}
                label="Operatori ricorrenti"
                value={String(repeatedOperators.length)}
                note="Beneficiari/operatori con più record nello stesso perimetro."
              />
              <StatCard
                icon={Hash}
                label="Senza CIG rilevato"
                value={String(missingCig)}
                note="Dato mancante o non riconosciuto automaticamente."
              />
              <StatCard
                icon={BarChart3}
                label="Importo noto"
                value={formatEuro(knownAmount)}
                note="Somma degli importi disponibili nei contratti."
              />
            </>
          )}
        </section>

        <section aria-labelledby="aggregazioni-operatori" className="mt-10">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                id="aggregazioni-operatori"
                className="text-2xl font-bold tracking-tight"
              >
                Aggregazione per beneficiario/operatore
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ordinata per ricorrenza. Le righe con dati estratti o da
                verificare richiedono controllo sul documento originario.
              </p>
            </div>
            <Badge variant="outline">
              {missingComparative} senza procedura comparativa rilevata
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiario/operatore</TableHead>
                    <TableHead className="text-right">Record</TableHead>
                    <TableHead className="text-right">Importo noto</TableHead>
                    <TableHead>Indicatori</TableHead>
                    <TableHead>Stato dati</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : aggregates.length > 0 ? (
                    aggregates.slice(0, 12).map((item) => (
                      <TableRow key={item.operator}>
                        <TableCell className="max-w-[280px] font-medium">
                          {item.operator}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.records}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatEuro(item.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {item.records > 1 && (
                              <Badge variant="secondary">ricorrenza</Badge>
                            )}
                            {item.records > 1 && (
                              <Badge variant="outline">
                                rotazione da verificare
                              </Badge>
                            )}
                            {item.records > 2 && (
                              <Badge variant="secondary">concentrazione</Badge>
                            )}
                            {item.directCount > 0 && (
                              <Badge variant="outline">
                                affidamenti diretti: {item.directCount}
                              </Badge>
                            )}
                            {item.missingComparativeCount > 0 && (
                              <Badge variant="outline">
                                comparativa non rilevata:{" "}
                                {item.missingComparativeCount}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(item.sourceStatuses).map((status) => (
                              <Badge
                                key={status}
                                variant={
                                  status === "ufficiale" ? "default" : "outline"
                                }
                              >
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Nessun record pertinente rilevato nei dati attualmente
                        caricati.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        <section aria-labelledby="record-monitorati" className="mt-10">
          <div className="mb-4">
            <h2
              id="record-monitorati"
              className="text-2xl font-bold tracking-tight"
            >
              Record monitorati
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ogni riga rimanda alla scheda interna che conserva il collegamento
              alla fonte disponibile.
            </p>
          </div>

          <div className="grid gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))
            ) : filteredRecords.length > 0 ? (
              filteredRecords.slice(0, 30).map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{record.source}</Badge>
                        <Badge
                          variant={
                            record.sourceStatus === "ufficiale"
                              ? "default"
                              : "secondary"
                          }
                        >
                          dato {record.sourceStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <h3 className="font-semibold leading-snug">
                        {record.title}
                      </h3>
                      <dl className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <dt className="font-medium text-foreground">
                            Operatore
                          </dt>
                          <dd>{record.operator}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-foreground">
                            Importo
                          </dt>
                          <dd>{formatEuro(record.amount)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-foreground">
                            CIG/CUP
                          </dt>
                          <dd>
                            {record.cig ?? "CIG —"} / {record.cup ?? "CUP —"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-foreground">
                            Procedura
                          </dt>
                          <dd>{record.procedure ?? "non rilevata"}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-1.5">
                        {record.flags.map((flag) => (
                          <Badge key={flag} variant="outline" className="gap-1">
                            <ShieldAlert
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={record.sourceHref}
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Apri fonte
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                Nessun incarico o affidamento professionale rilevato con le
                regole di lettura.
              </Card>
            )}
          </div>
        </section>

        <section
          aria-labelledby="metodo-v0"
          className="mt-10 grid gap-4 lg:grid-cols-3"
        >
          <Card className="p-5 lg:col-span-2">
            <h2
              id="metodo-v0"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <SearchCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Metodo
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                Include contratti ANAC e pubblicazioni dell'Albo già esposti
                dalle API pubbliche del sito.
              </li>
              <li>
                Filtra parole chiave legate a incarichi, consulenze, servizi
                professionali, incarichi legali e tecnici.
              </li>
              <li>
                Calcola ricorrenza e concentrazione per beneficiario/operatore
                senza formulare giudizi soggettivi.
              </li>
              <li>
                Segnala assenza di CIG, CUP o procedura comparativa solo come
                dato non presente o non rilevato automaticamente.
              </li>
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Info className="h-5 w-5 text-primary" aria-hidden="true" />
              Limiti noti
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              L'estrazione dei beneficiari dagli atti testuali può essere
              incompleta. Prima di trarre conclusioni occorre leggere l'atto,
              gli allegati e il fascicolo amministrativo.
            </p>
          </Card>
        </section>
      </div>
    </>
  );
}
