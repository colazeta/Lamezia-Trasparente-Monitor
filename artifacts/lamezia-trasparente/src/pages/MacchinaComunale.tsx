import { useMemo, useState, type ElementType } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Database,
  ExternalLink,
  FileSearch,
  Filter,
  Info,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DATA_STATUS,
  MACCHINA_COMUNALE_DATASET_NOTE,
  getVacancyRate,
  getVacantPositions,
  macchinaComunaleRecords,
  publicAdministrativeSignals,
  summarizeMacchinaComunale,
  type DataStatus,
} from "@/data/macchinaComunale";

const ALL_AREAS = "__all_areas__";
const ALL_STATUSES = "__all_statuses__";

type AreaFilter = typeof ALL_AREAS | string;
type StatusFilter = typeof ALL_STATUSES | DataStatus;

const STATUS_LABELS: Record<DataStatus, string> = {
  ufficiale: "Ufficiale",
  estratto: "Estratto",
  arricchito: "Arricchito",
  "da verificare": "Da verificare",
  "non rintracciato": "Non rintracciato",
};

const STATUS_BADGE_CLASS: Record<DataStatus, string> = {
  ufficiale:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  estratto: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  arricchito:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "da verificare":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "non rintracciato":
    "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

function formatNumber(value: number | null) {
  return value == null ? "—" : value.toLocaleString("it-IT");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRate(value: number | null) {
  if (value == null) return "Non calcolabile";
  return new Intl.NumberFormat("it-IT", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function MacchinaComunale() {
  const [areaFilter, setAreaFilter] = useState<AreaFilter>(ALL_AREAS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);

  const areas = useMemo(
    () => Array.from(new Set(macchinaComunaleRecords.map((item) => item.area))),
    [],
  );
  const summary = useMemo(
    () => summarizeMacchinaComunale(macchinaComunaleRecords),
    [],
  );
  const filteredRecords = useMemo(
    () =>
      macchinaComunaleRecords.filter((record) => {
        const areaMatches =
          areaFilter === ALL_AREAS || record.area === areaFilter;
        const statusMatches =
          statusFilter === ALL_STATUSES || record.dataStatus === statusFilter;
        return areaMatches && statusMatches;
      }),
    [areaFilter, statusFilter],
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-8 space-y-5">
        <span className="eyebrow text-primary">
          <Building2 className="h-3.5 w-3.5" />
          Capacità amministrativa
        </span>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight md:text-5xl">
              Macchina comunale
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Una v0 pubblica per leggere settore, servizio, organico previsto,
              personale disponibile, scoperture e stato delle fonti. Gli
              indicatori sono segnali di monitoraggio aggregato e non valutano
              produttività individuale, responsabilità personali o correttezza
              degli uffici.
            </p>
          </div>
          <Card className="border-amber-500/30 bg-amber-500/10 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                Dataset dimostrativo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-amber-900/90 dark:text-amber-100/90">
              {MACCHINA_COMUNALE_DATASET_NOTE}
            </CardContent>
          </Card>
        </div>
      </header>

      <section
        aria-label="Sintesi degli indicatori"
        className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          icon={Building2}
          label="Aree censite"
          value={formatNumber(summary.totalAreas)}
          description="Conteggio delle aree presenti nel seed, non elenco ufficiale completo."
        />
        <SummaryCard
          icon={Users}
          label="Servizi con scopertura"
          value={formatNumber(summary.servicesWithDocumentedGap)}
          description="Calcolato solo dove posti vacanti o dati equivalenti sono disponibili."
        />
        <SummaryCard
          icon={BarChart3}
          label="Scopertura media"
          value={formatRate(summary.averageVacancyRate)}
          description="Media dei soli record con numeratore e denominatore presenti."
        />
        <SummaryCard
          icon={Database}
          label="Dati incompleti"
          value={formatNumber(summary.missingOrIncompleteData)}
          description="Dato non rintracciato o campo necessario mancante: richiede verifica fonte."
        />
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5 text-primary" />
              Filtra tabella
            </CardTitle>
            <CardDescription>
              I filtri aiutano a distinguere area organizzativa e stato del dato
              senza attribuire giudizi o responsabilità.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="area-filter">
                Area / settore
              </label>
              <Select
                value={areaFilter}
                onValueChange={(value) => setAreaFilter(value)}
              >
                <SelectTrigger id="area-filter" aria-label="Filtra per area">
                  <SelectValue placeholder="Tutte le aree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_AREAS}>Tutte le aree</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status-filter">
                Stato del dato
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger
                  id="status-filter"
                  aria-label="Filtra per stato del dato"
                >
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>Tutti gli stati</SelectItem>
                  {DATA_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileSearch className="h-5 w-5 text-primary" />
              Collegamenti prudenti
            </CardTitle>
            <CardDescription>
              Link interni utili per verifiche future, senza relazioni
              automatiche o fonti fittizie.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/accesso-civico">FOIA / Accesso civico</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/monitoraggio">Monitor civico</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/fonti-dati">Fonti dati</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="segnali-pubblici" className="mb-8">
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardHeader>
            <CardTitle
              id="segnali-pubblici"
              className="flex items-center gap-2"
            >
              <FileSearch className="h-5 w-5 text-amber-600" />
              Segnali pubblici da verificare
            </CardTitle>
            <CardDescription>
              Fonti secondarie utili a orientare richieste documentali. Questi
              elementi non alimentano i conteggi sull'organico finché non sono
              confermati da fonti ufficiali o atti pubblici pertinenti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {publicAdministrativeSignals.map((signal) => (
              <article
                key={signal.id}
                className="rounded-lg border bg-background/80 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    >
                      Da verificare con fonte primaria
                    </Badge>
                    <h3 className="font-semibold">{signal.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {signal.documentedFact}
                    </p>
                  </div>
                  <a
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href={signal.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Fonte giornalistica
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Elementi riportati
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                      {signal.reportedElements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">
                      Verifiche proporzionate
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                      {signal.verificationNeeds.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">
                      Uso civico prudente
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {signal.civicUse}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {signal.source.label}. Stato: {signal.source.sourceType};
                      pubblicazione del {formatDate(signal.source.publishedAt)}.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="tabella-organico" className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle id="tabella-organico">
              Organico, scoperture e stato delle fonti
            </CardTitle>
            <CardDescription>
              {filteredRecords.length} record visualizzati su{" "}
              {summary.totalServices}. Il tasso di scopertura è mostrato solo
              quando il dato previsto e i posti vacanti sono disponibili.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area / settore</TableHead>
                  <TableHead>Servizio</TableHead>
                  <TableHead className="text-right">Previsto</TableHead>
                  <TableHead className="text-right">Disponibile</TableHead>
                  <TableHead className="text-right">Vacanti</TableHead>
                  <TableHead>Tasso</TableHead>
                  <TableHead>Fonte e stato</TableHead>
                  <TableHead>Aggiornamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const vacancies = getVacantPositions(record);
                  const rate = getVacancyRate(record);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="min-w-52 font-medium">
                        {record.area}
                      </TableCell>
                      <TableCell className="min-w-56">
                        <div>{record.service}</div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {record.caveat}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(record.plannedStaff)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(record.availableStaff)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(vacancies)}
                      </TableCell>
                      <TableCell className="min-w-36">
                        {formatRate(rate)}
                      </TableCell>
                      <TableCell className="min-w-72">
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant="outline"
                            className={STATUS_BADGE_CLASS[record.dataStatus]}
                          >
                            {STATUS_LABELS[record.dataStatus]}
                          </Badge>
                          {record.source.url ? (
                            <a
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                              href={record.source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {record.source.label}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-sm font-medium">
                              {record.source.label}
                            </span>
                          )}
                          <span className="text-xs leading-5 text-muted-foreground">
                            {record.source.note}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(record.lastUpdated)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="metodologia-macchina-comunale">
        <Card className="border-primary/30 bg-primary/5 shadow-none">
          <CardHeader>
            <CardTitle
              id="metodologia-macchina-comunale"
              className="flex items-center gap-2"
            >
              <Info className="h-5 w-5 text-primary" />
              Nota metodologica e limiti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              Il modulo descrive capacità amministrativa, organico e stato delle
              fonti a livello aggregato. Un dato mancante, non rintracciato o da
              verificare indica una esigenza di documentazione e non costituisce
              prova di negligenza, illecito, inefficienza individuale o
              responsabilità personale.
            </p>
            <p>
              Il tasso di scopertura è calcolato come posti vacanti diviso
              organico previsto solo quando entrambi i dati sono presenti. In
              assenza di campi necessari, l'indicatore resta non calcolabile per
              evitare inferenze non supportate.
            </p>
            <p>
              La sostituzione del seed dovrà documentare fonte, data di
              aggiornamento, metodo di estrazione e limiti d'uso pubblico per
              ogni record, privilegiando PIAO, dotazione organica, piano dei
              fabbisogni, Amministrazione Trasparente e atti ufficiali
              pubblicati. Fonti giornalistiche o segnalazioni pubbliche possono
              orientare verifiche e richieste di accesso, ma restano escluse dai
              conteggi finché non sono riscontrate con documenti primari.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ElementType;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </CardDescription>
        <CardTitle className="text-3xl font-display">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}
