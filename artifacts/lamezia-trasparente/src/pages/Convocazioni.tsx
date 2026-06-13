import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListSedute } from "@workspace/api-client-react";
import { useListPublications } from "@workspace/api-client-react";
import type { Seduta } from "@workspace/api-client-react";
import {
  CalendarClock,
  Calendar,
  ChevronRight,
  Building2,
  Layers,
  FileText,
  Vote,
  Link2,
  ClipboardList,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  MACROTEMA_LABELS,
  MACROTEMA_OPTS,
  MacrotemaBadge,
} from "@/lib/macrotema";
import {
  getSedutaCoverageFlags,
  matchesCoverageFilter,
  summarizeConvocazioniCoverage,
  type CoverageFilter,
  type SedutaPublication,
} from "@/lib/convocazioniCoverage";
import {
  CouncilSessionV0DemoNotice,
  CouncilSessionV0DemoSummaryCard,
} from "@/components/launch/CouncilSessionV0DemoCard";
import { councilSessionV0DemoFixture } from "@/data/councilSessionV0";

function MacrotemasRow({ macrotemi }: { macrotemi: string[] }) {
  const unique = Array.from(new Set(macrotemi)).filter((m) => m !== "altro");
  if (unique.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {unique.slice(0, 4).map((m) => (
        <MacrotemaBadge key={m} macrotema={m} />
      ))}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

const UNGROUPED = "Altre sedute";
const ALL_ORGANI = "all";

type CoverageFilterKey = "report" | "votes" | "acts";

const COVERAGE_FILTER_LABELS: Record<CoverageFilter, string> = {
  all: "Tutte",
  present: "Presenti",
  missing: "Da verificare",
};

const SUMMARY_CARDS = [
  { key: "total", label: "Sedute caricate", icon: CalendarClock },
  { key: "withOdg", label: "Con ordine del giorno", icon: ClipboardList },
  { key: "withReport", label: "Con resoconto", icon: FileText },
  { key: "withVotes", label: "Con votazioni", icon: Vote },
  { key: "withLinkedActs", label: "Con atti collegati", icon: Link2 },
  { key: "withContractsOrPnrr", label: "Contratti o PNRR", icon: Layers },
] as const;

function CoverageBadge({
  present,
  label,
}: {
  present: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        present
          ? "border-brand/30 bg-brand/10 text-brand"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      {present ? label : `${label}: da verificare`}
    </span>
  );
}

function coverageFilterLabel(key: CoverageFilterKey, value: CoverageFilter) {
  const names: Record<CoverageFilterKey, string> = {
    report: "resoconto",
    votes: "votazioni",
    acts: "atti collegati",
  };
  return `${names[key]}: ${COVERAGE_FILTER_LABELS[value]}`;
}

function groupByOrgano(sedute: Seduta[]) {
  const groups = new Map<
    string,
    { name: string; slug: string | null; items: Seduta[] }
  >();
  for (const s of sedute) {
    const key = s.organo ? s.organo.slug : UNGROUPED;
    const name = s.organo ? s.organo.name : UNGROUPED;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(s);
    } else {
      groups.set(key, { name, slug: s.organo?.slug ?? null, items: [s] });
    }
  }
  return Array.from(groups.values());
}

export function Convocazioni() {
  const { data: sedute, isLoading, isError } = useListSedute();
  const [organoFilter, setOrganoFilter] = useState<string>(ALL_ORGANI);
  const [macrotemaFilter, setMacrotemaFilter] = useState<string>("all");
  const [reportFilter, setReportFilter] = useState<CoverageFilter>("all");
  const [votesFilter, setVotesFilter] = useState<CoverageFilter>("all");
  const [actsFilter, setActsFilter] = useState<CoverageFilter>("all");

  // Load convocazione publications to get macrotema and PNRR/CUP metadata per publicationId.
  const { data: convocazioniPubs } = useListPublications({
    category: "convocazione",
  });

  // Build a map publicationId -> odgMacrotemi (multi-theme array from ODG points).
  // Falls back to the publication-level macrotema if no ODG points are found.
  const publicationsById = useMemo(() => {
    const m = new Map<number, SedutaPublication>();
    for (const p of convocazioniPubs ?? []) m.set(p.id, p);
    return m;
  }, [convocazioniPubs]);

  const macrotemiByPubId = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const p of convocazioniPubs ?? []) {
      const odg = p.odgMacrotemi ?? [];
      const themes =
        odg.length > 0
          ? odg
          : p.macrotema && p.macrotema !== "altro"
            ? [p.macrotema]
            : [];
      if (themes.length > 0) m.set(p.id, themes);
    }
    return m;
  }, [convocazioniPubs]);

  const organoOptions = useMemo(() => {
    const options = new Map<string, string>();
    for (const s of sedute ?? []) {
      if (s.organo) options.set(s.organo.slug, s.organo.name);
    }
    return Array.from(options.entries()).map(([slug, name]) => ({
      slug,
      name,
    }));
  }, [sedute]);

  const coverageSummary = useMemo(
    () => summarizeConvocazioniCoverage(sedute ?? [], publicationsById),
    [sedute, publicationsById],
  );

  // Filter sedute by organo, macrotema and coverage flags if filters are active.
  const filteredSedute = useMemo(() => {
    return (sedute ?? []).filter((s) => {
      if (organoFilter !== ALL_ORGANI && s.organo?.slug !== organoFilter) {
        return false;
      }

      const macrotemi =
        s.publicationId != null
          ? (macrotemiByPubId.get(s.publicationId) ?? [])
          : [];
      if (macrotemaFilter !== "all" && !macrotemi.includes(macrotemaFilter)) {
        return false;
      }

      const publication =
        s.publicationId != null
          ? publicationsById.get(s.publicationId)
          : undefined;
      const flags = getSedutaCoverageFlags(s, publication);
      return (
        matchesCoverageFilter(flags.hasReport, reportFilter) &&
        matchesCoverageFilter(flags.hasVotes, votesFilter) &&
        matchesCoverageFilter(flags.hasLinkedActs, actsFilter)
      );
    });
  }, [
    sedute,
    organoFilter,
    macrotemiByPubId,
    macrotemaFilter,
    publicationsById,
    reportFilter,
    votesFilter,
    actsFilter,
  ]);

  const groups = useMemo(() => groupByOrgano(filteredSedute), [filteredSedute]);
  const hasActiveFilters =
    organoFilter !== ALL_ORGANI ||
    macrotemaFilter !== "all" ||
    reportFilter !== "all" ||
    votesFilter !== "all" ||
    actsFilter !== "all";
  const shouldShowDemoFallback =
    !isLoading &&
    (isError || ((sedute?.length ?? 0) === 0 && !hasActiveFilters));

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <CalendarClock className="h-3.5 w-3.5" />
            Sedute e ordini del giorno
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
            Convocazioni
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
            Primo output civico v0: orientamento prudente su sedute e
            convocazioni del Consiglio comunale, con stati del dato, limiti
            dichiarati e rinvio alle fonti quando disponibili.
          </p>
        </div>
      </div>

      <section
        className="mb-8 rounded-2xl border border-brand/25 bg-brand/5 p-4 md:p-5"
        aria-labelledby="convocazioni-v0-path-title"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Percorso pubblico minimo v0
            </span>
            <h2
              id="convocazioni-v0-path-title"
              className="mt-2 font-display text-xl font-bold tracking-tight"
            >
              Home → Convocazioni → scheda seduta → fonti e limiti
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Questa pagina è il primo punto di consultazione pubblicabile. I
              badge “da verificare” segnalano campi non presenti nella base
              locale o da controllare sulla fonte originaria, senza implicare
              irregolarità o completezza della documentazione amministrativa.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row md:flex-col md:items-end">
            <Link
              href={`/convocazioni/${councilSessionV0DemoFixture.id}`}
              className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Apri scheda demo v0
            </Link>
            <Link
              href="/fonti-dati"
              className="inline-flex text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Leggi fonti e limiti
            </Link>
          </div>
        </div>
      </section>

      {shouldShowDemoFallback && (
        <div className="mb-8 space-y-4">
          <CouncilSessionV0DemoNotice compact />
          <CouncilSessionV0DemoSummaryCard />
        </div>
      )}

      <section
        className="mb-8 rounded-2xl border border-border bg-card/70 p-4 md:p-5"
        aria-labelledby="convocazioni-dashboard-title"
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2
              id="convocazioni-dashboard-title"
              className="font-display text-xl font-bold tracking-tight"
            >
              Copertura documentale delle sedute
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicatori calcolati sulla base locale: ordine del giorno,
              resoconti, votazioni, atti collegati e segnali di collegamento a
              contratti o PNRR.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            {filteredSedute.length} sedute visibili
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY_CARDS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">
                {coverageSummary[key]}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Nota metodologica: un dato non presente nel portale indica assenza
          nella base locale o elemento da verificare sulle fonti, non una
          conclusione sull'ente né sulla completezza della documentazione
          amministrativa originale.
        </p>
      </section>

      <section
        className="mb-8 rounded-2xl border border-border bg-muted/20 p-4"
        aria-label="Filtri convocazioni"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Select value={organoFilter} onValueChange={setOrganoFilter}>
            <SelectTrigger
              className="h-10 bg-background"
              aria-label="Filtra per organo"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm">
                  {organoFilter === ALL_ORGANI
                    ? "Tutti gli organi"
                    : (organoOptions.find((o) => o.slug === organoFilter)
                        ?.name ?? organoFilter)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ORGANI}>Tutti gli organi</SelectItem>
              {organoOptions.map((opt) => (
                <SelectItem key={opt.slug} value={opt.slug}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={macrotemaFilter} onValueChange={setMacrotemaFilter}>
            <SelectTrigger
              className="h-10 bg-background"
              aria-label="Filtra per tema"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm">
                  {macrotemaFilter === "all"
                    ? "Tutti i temi"
                    : (MACROTEMA_LABELS[macrotemaFilter] ?? macrotemaFilter)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {MACROTEMA_OPTS.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {[
            ["report", reportFilter, setReportFilter],
            ["votes", votesFilter, setVotesFilter],
            ["acts", actsFilter, setActsFilter],
          ].map(([key, value, setter]) => (
            <Select
              key={key as string}
              value={value as CoverageFilter}
              onValueChange={(next) =>
                (setter as (value: CoverageFilter) => void)(
                  next as CoverageFilter,
                )
              }
            >
              <SelectTrigger
                className="h-10 bg-background"
                aria-label={`Filtra per ${key}`}
              >
                <span className="truncate text-sm">
                  {coverageFilterLabel(
                    key as CoverageFilterKey,
                    value as CoverageFilter,
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {coverageFilterLabel(key as CoverageFilterKey, "all")}
                </SelectItem>
                <SelectItem value="present">
                  {coverageFilterLabel(key as CoverageFilterKey, "present")}
                </SelectItem>
                <SelectItem value="missing">
                  {coverageFilterLabel(key as CoverageFilterKey, "missing")}
                </SelectItem>
              </SelectContent>
            </Select>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.slug ?? g.name}>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Building2 className="h-4 w-4" />
                </span>
                {g.slug ? (
                  <Link
                    href={`/organi/${g.slug}`}
                    className="text-xl md:text-2xl font-display font-bold tracking-tight hover:text-brand transition-colors"
                  >
                    {g.name}
                  </Link>
                ) : (
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                    {g.name}
                  </h2>
                )}
              </div>

              <div className="space-y-3">
                {g.items.map((s) => {
                  const macrotemi =
                    s.publicationId != null
                      ? (macrotemiByPubId.get(s.publicationId) ?? [])
                      : [];
                  return (
                    <Link
                      key={s.id}
                      href={
                        s.publicationId != null
                          ? `/convocazioni/${s.publicationId}`
                          : "#"
                      }
                      className="block"
                    >
                      <Card className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand mb-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(s.date)}
                        </div>
                        {s.agenda && (
                          <h3 className="font-display font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
                            {s.agenda}
                          </h3>
                        )}
                        {macrotemi.length > 0 && (
                          <MacrotemasRow macrotemi={macrotemi} />
                        )}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(() => {
                            const flags = getSedutaCoverageFlags(
                              s,
                              s.publicationId != null
                                ? publicationsById.get(s.publicationId)
                                : undefined,
                            );
                            return (
                              <>
                                <CoverageBadge
                                  present={flags.hasReport}
                                  label="Resoconto"
                                />
                                <CoverageBadge
                                  present={flags.hasVotes}
                                  label="Votazioni"
                                />
                                <CoverageBadge
                                  present={flags.hasLinkedActs}
                                  label="Atti collegati"
                                />
                              </>
                            );
                          })()}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-brand transition-colors">
                            Apri scheda seduta
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : shouldShowDemoFallback ? null : (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>Nessuna convocazione disponibile</EmptyTitle>
            <EmptyDescription>
              {macrotemaFilter !== "all" ||
              organoFilter !== ALL_ORGANI ||
              reportFilter !== "all" ||
              votesFilter !== "all" ||
              actsFilter !== "all"
                ? "Nessuna convocazione trovata con i filtri selezionati. Prova ad ampliare la ricerca."
                : "Al momento non risultano convocazioni pubblicate. Torna più tardi per aggiornamenti."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
