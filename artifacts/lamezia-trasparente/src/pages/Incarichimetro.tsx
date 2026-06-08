import { useMemo } from "react";
import {
  useListContracts,
  useListPublications,
  type Contract,
  type Publication,
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

import { PageMeta } from "@/components/seo/PageMeta";
import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const INCARICHI_KEYWORDS = [
  "incarico",
  "incarichi",
  "affidamento",
  "affidamenti",
  "servizio professionale",
  "servizi professionali",
  "prestazione professionale",
  "prestazioni professionali",
  "consulenza",
  "consulenze",
  "legale",
  "avvocato",
  "patrocinio",
  "tecnico",
  "progettazione",
  "direzione lavori",
  "collaudo",
  "supporto al rup",
  "esperto",
];

const COMPARATIVE_KEYWORDS = [
  "procedura comparativa",
  "comparazione",
  "confronto",
  "manifestazione di interesse",
  "avviso pubblico",
  "selezione pubblica",
  "gara",
  "aperta",
  "negoziata",
  "indagine di mercato",
];

const DIRECT_PROCEDURE_KEYWORDS = [
  "affidamento diretto",
  "diretto",
  "senza previa pubblicazione",
];

const CIG_RE = /\b(?:CIG|SMART\s+CIG)[:\s-]*([A-Z0-9]{10})\b/gi;
const CUP_RE = /\bCUP[:\s-]*([A-Z0-9]{15})\b/gi;
const OPERATOR_PATTERNS = [
  /(?:affidatari[oa]|beneficiari[oa]|operatore\s+economico|professionista|ditta|societ[aà]|impresa|avv\.?|ing\.?|arch\.?)\s+(?:individuat[oa]\s+)?(?:in\s+)?(?:favore\s+di\s+)?([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&.,\- ]{3,80})/i,
  /(?:alla|al)\s+(?:ditta|societ[aà]|professionista|avv\.?|ing\.?|arch\.?)\s+([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&.,\- ]{3,80})/i,
];

interface MonitoredRecord {
  id: string;
  source: "Contratti ANAC" | "Albo Pretorio";
  title: string;
  operator: string;
  amount: number | null;
  date: string | null;
  cig: string | null;
  cup: string | null;
  procedure: string | null;
  sourceHref: string;
  sourceStatus: "ufficiale" | "estratto" | "da verificare";
  flags: string[];
}

interface OperatorAggregate {
  operator: string;
  records: number;
  totalAmount: number;
  directCount: number;
  missingCigCount: number;
  missingComparativeCount: number;
  sourceStatuses: Set<MonitoredRecord["sourceStatus"]>;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toLocaleLowerCase("it");
}

function includesAny(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function extractFirst(regex: RegExp, text: string): string | null {
  regex.lastIndex = 0;
  const match = regex.exec(text);
  return match?.[1]?.toUpperCase() ?? null;
}

function extractOperator(text: string): string | null {
  for (const pattern of OPERATOR_PATTERNS) {
    const match = pattern.exec(text);
    const candidate = match?.[1]
      ?.replace(
        /\s+(?:per|con|relativo|relativa|inerente|mediante|ai sensi).*$/i,
        "",
      )
      .replace(/[.;:,\-–]+$/g, "")
      .trim();
    if (candidate && candidate.length >= 4) return candidate;
  }
  return null;
}

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

function buildContractRecord(contract: Contract): MonitoredRecord | null {
  const text = [contract.title, contract.description, contract.procedureType]
    .filter(Boolean)
    .join(" ");
  if (!includesAny(text, INCARICHI_KEYWORDS)) return null;

  const hasComparative = includesAny(text, COMPARATIVE_KEYWORDS);
  const isDirect =
    contract.withoutTender ||
    includesAny(contract.procedureType, DIRECT_PROCEDURE_KEYWORDS);
  const flags = [
    !contract.cig ? "CIG non presente nel dato" : null,
    !contract.cup ? "CUP non presente nel dato" : null,
    !hasComparative ? "Procedura comparativa non rilevata" : null,
    isDirect ? "Possibile affidamento diretto" : null,
  ].filter((flag): flag is string => Boolean(flag));

  return {
    id: `contract-${contract.id}`,
    source: "Contratti ANAC",
    title: contract.title,
    operator: contract.supplier?.trim() || "Operatore non indicato",
    amount: contract.amount,
    date: contract.awardDate,
    cig: contract.cig ?? null,
    cup: contract.cup ?? null,
    procedure: contract.procedureType || null,
    sourceHref: `/contratti/${contract.id}`,
    sourceStatus: "ufficiale",
    flags,
  };
}

function buildPublicationRecord(
  publication: Publication,
): MonitoredRecord | null {
  const text = [
    publication.oggetto,
    publication.brief,
    publication.tipologia,
    publication.provenienza,
  ]
    .filter(Boolean)
    .join(" ");
  if (!includesAny(text, INCARICHI_KEYWORDS)) return null;

  const cig = extractFirst(CIG_RE, text);
  const cup = publication.cups?.[0] ?? extractFirst(CUP_RE, text);
  const hasComparative = includesAny(text, COMPARATIVE_KEYWORDS);
  const isDirect = includesAny(text, DIRECT_PROCEDURE_KEYWORDS);
  const operator = extractOperator(text);
  const flags = [
    !operator ? "Operatore da verificare nell'atto" : null,
    !cig ? "CIG non rilevato" : null,
    !cup ? "CUP non rilevato" : null,
    !hasComparative ? "Procedura comparativa non rilevata" : null,
    isDirect ? "Possibile affidamento diretto" : null,
  ].filter((flag): flag is string => Boolean(flag));

  return {
    id: `publication-${publication.id}`,
    source: "Albo Pretorio",
    title: publication.oggetto,
    operator: operator ?? "Da verificare nell'atto",
    amount: null,
    date:
      publication.dataAtto ?? publication.pubStart ?? publication.firstSeenAt,
    cig,
    cup,
    procedure: hasComparative
      ? "Elementi comparativi rilevati nel testo"
      : isDirect
        ? "Affidamento diretto rilevato nel testo"
        : null,
    sourceHref: `/albo/${publication.id}`,
    sourceStatus: operator ? "estratto" : "da verificare",
    flags,
  };
}

function buildOperatorAggregates(
  records: MonitoredRecord[],
): OperatorAggregate[] {
  const map = new Map<string, OperatorAggregate>();
  for (const record of records) {
    const key = record.operator.toLocaleLowerCase("it");
    const current = map.get(key) ?? {
      operator: record.operator,
      records: 0,
      totalAmount: 0,
      directCount: 0,
      missingCigCount: 0,
      missingComparativeCount: 0,
      sourceStatuses: new Set<MonitoredRecord["sourceStatus"]>(),
    };
    current.records += 1;
    current.totalAmount += record.amount ?? 0;
    if (record.flags.some((flag) => flag.includes("affidamento diretto"))) {
      current.directCount += 1;
    }
    if (record.flags.some((flag) => flag.includes("CIG"))) {
      current.missingCigCount += 1;
    }
    if (record.flags.some((flag) => flag.includes("comparativa"))) {
      current.missingComparativeCount += 1;
    }
    current.sourceStatuses.add(record.sourceStatus);
    map.set(key, current);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (b.records !== a.records) return b.records - a.records;
    return b.totalAmount - a.totalAmount;
  });
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

export function Incarichimetro() {
  const { data: contracts, isLoading: contractsLoading } = useListContracts();
  const { data: publications, isLoading: publicationsLoading } =
    useListPublications();

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

  const aggregates = useMemo(() => buildOperatorAggregates(records), [records]);
  const loading = contractsLoading || publicationsLoading;
  const repeatedOperators = aggregates.filter((item) => item.records > 1);
  const knownAmount = records.reduce(
    (sum, record) => sum + (record.amount ?? 0),
    0,
  );
  const missingCig = records.filter((record) =>
    record.flags.some((flag) => flag.includes("CIG")),
  ).length;
  const missingComparative = records.filter((record) =>
    record.flags.some((flag) => flag.includes("comparativa")),
  ).length;

  return (
    <>
      <PageMeta
        title="Incarichimetro v0"
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
            Incarichimetro v0
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
                I dati dei contratti sono trattati come fonte ufficiale ANAC
                esposta dal progetto; le informazioni estratte dagli atti
                dell'Albo sono da leggere come arricchimenti automatici o
                elementi da verificare nel documento.
              </p>
            </div>
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
                value={String(records.length)}
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
            ) : records.length > 0 ? (
              records.slice(0, 30).map((record) => (
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
                regole v0.
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
              Metodo v0
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
