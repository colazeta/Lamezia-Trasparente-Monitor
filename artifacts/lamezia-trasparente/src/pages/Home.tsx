import { Link } from "wouter";
import {
  useGetStatsOverview,
  useListPnrrProjects,
} from "@workspace/api-client-react";
import {
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Gavel,
  Landmark,
  MapPinned,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  ALBO_PUBLIC_DIFF_CHANGED_ITEMS,
  ALBO_PUBLIC_DIFF_NEW_ITEMS,
  ALBO_PUBLIC_DIFF_REMOVED_ITEMS,
  ALBO_PUBLIC_DIFF_SUMMARY,
  ALBO_PUBLIC_RUN_ITEMS,
  type AlboPublicRunItem,
} from "@/data/alboPublicRun";
import { ALBO_OPERATIONAL_STATUS } from "@/data/alboStatus";
import { councilSessionV0ReviewedRecords } from "@/data/councilSessionV0Reviewed";
import { councilSessionV0StatusLabels } from "@/data/councilSessionV0";
import { asApiList } from "@/lib/apiList";
import { PUBLIC_NUMBER_PLACEHOLDER } from "@/lib/publicNumbers";
import {
  selectHomeSessions,
  sessionDate,
  sessionDateLabel,
  sessionIsUpcoming,
  sessionOrgan,
} from "@/lib/sessionAgenda";

type PulseKind = "new" | "changed" | "removed" | "context";

type PulseItem = {
  kind: PulseKind;
  item: AlboPublicRunItem;
};

const PULSE_LABELS: Record<PulseKind, string> = {
  new: "Nuovo",
  changed: "Aggiornato",
  removed: "Non più presente",
  context: "Recente",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data non disponibile"
    : format(date, "dd MMM yyyy", { locale: it });
}

function formatMonitoredAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return PUBLIC_NUMBER_PLACEHOLDER;
  }

  return `€ ${(value / 1_000_000).toFixed(1)}M`;
}

function formatCivicTime(value: string | null | undefined) {
  if (!value) return "Non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non disponibile";

  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function sortByPublication(items: AlboPublicRunItem[]) {
  return [...items].sort((a, b) => {
    const left = `${a.publication_start ?? ""}-${a.publication_number ?? ""}`;
    const right = `${b.publication_start ?? ""}-${b.publication_number ?? ""}`;
    return right.localeCompare(left, "it");
  });
}

function buildPulseItems(): PulseItem[] {
  const changed: PulseItem[] = [
    ...ALBO_PUBLIC_DIFF_NEW_ITEMS.map((item) => ({
      kind: "new" as const,
      item,
    })),
    ...ALBO_PUBLIC_DIFF_CHANGED_ITEMS.map((entry) => ({
      kind: "changed" as const,
      item: entry.after,
    })),
    ...ALBO_PUBLIC_DIFF_REMOVED_ITEMS.map((item) => ({
      kind: "removed" as const,
      item,
    })),
  ];

  if (changed.length > 0) return changed.slice(0, 5);

  return sortByPublication(ALBO_PUBLIC_RUN_ITEMS)
    .slice(0, 5)
    .map((item) => ({ kind: "context" as const, item }));
}

export const HOME_PRIMARY_GATEWAYS = [
  {
    title: "Decisioni",
    description: "Sedute, delibere, Albo e atti fondamentali del Comune.",
    href: "/convocazioni",
    icon: Gavel,
  },
  {
    title: "Spesa e progetti",
    description: "Contratti, PNRR, incarichi e risorse pubbliche documentate.",
    href: "/contratti",
    icon: Landmark,
  },
  {
    title: "Comune e risultati",
    description: "Organi, amministratori, macchina comunale e performance.",
    href: "/organi",
    icon: Users,
  },
  {
    title: "Territorio e legalità",
    description:
      "Mappe, criticità, monitoraggio civico, memoria e beni confiscati.",
    href: "/atlante-territoriale",
    icon: MapPinned,
  },
  {
    title: "Dati e fonti",
    description:
      "Dataset, copertura, freschezza e metodo delle fonti pubbliche.",
    href: "/opendata",
    icon: Database,
  },
] as const;

export function openGlobalSearch() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "/", bubbles: true }),
  );
}

export function Home() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsUnavailable,
  } = useGetStatsOverview();
  const {
    data: pnrrProjects,
    isLoading: pnrrLoading,
    isError: pnrrUnavailable,
  } = useListPnrrProjects();

  const pnrrProjectCount = asApiList(pnrrProjects?.projects).length;
  const pulseItems = buildPulseItems();
  const pulseCounts = ALBO_PUBLIC_DIFF_SUMMARY.counts;
  const lastAlboCheck = Date.parse(ALBO_OPERATIONAL_STATUS.last_update ?? "");
  const alboSnapshotStale =
    !Number.isFinite(lastAlboCheck) ||
    Date.now() - lastAlboCheck > 24 * 60 * 60 * 1000;
  const nextAlboCheck = Date.parse(
    ALBO_OPERATIONAL_STATUS.next_scheduled_check ?? "",
  );
  const alboScheduleOverdue =
    Number.isFinite(nextAlboCheck) && nextAlboCheck < Date.now();
  const hasDiff =
    pulseCounts.new + pulseCounts.changed + pulseCounts.removed > 0;

  return (
    <div className="flex flex-col">
      <PageMeta
        title="Lamezia Trasparente — decisioni, spesa, territorio e dati"
        description="Decisioni, spesa, risultati, territorio e dati del Comune di Lamezia Terme collegati alle fonti pubbliche, con stato e limiti espliciti."
        path="/"
      />

      <section
        data-tour="home-hero"
        className="bg-sidebar text-sidebar-foreground"
      >
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="max-w-4xl">
            <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Capire cosa decide, spende e realizza il Comune.
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-sidebar-foreground/80 sm:text-lg">
              Convocazioni, atti e risorse pubbliche di Lamezia Terme, con le
              fonti per approfondire.
            </p>

            <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="brand" size="lg" className="font-bold">
                <a href="#oggi">Cosa è cambiato</a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/5 font-bold text-white hover:bg-white/10"
                onClick={openGlobalSearch}
                aria-keyshortcuts="Control+K Meta+K"
              >
                <Search className="mr-1 h-4 w-4" aria-hidden="true" />
                Cerca nel sito
              </Button>
            </div>
          </div>
        </div>
      </section>

      <HomeInstitutionalSessions />

      <section className="border-y border-border bg-background py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="eyebrow text-primary">Quadro civico</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Il Comune nei dati disponibili
              </h2>
            </div>
            <Link
              href="/stato-monitoraggio"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Copertura e freschezza
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Atti dalla fonte"
              value={stats?.acts ?? ALBO_OPERATIONAL_STATUS.counts.acquired}
              loading={statsLoading}
              href="/albo"
              icon={FileSearch}
            />
            <StatCard
              title="Contratti censiti"
              value={stats?.contracts}
              loading={statsLoading}
              unavailable={statsUnavailable}
              href="/contratti"
              icon={FileText}
            />
            <StatCard
              title="Progetti PNRR"
              value={pnrrProjectCount}
              loading={pnrrLoading}
              unavailable={pnrrUnavailable}
              href="/pnrr"
              icon={Landmark}
            />
            <StatCard
              title="Importi disponibili"
              value={
                stats ? formatMonitoredAmount(stats.monitoredAmount) : undefined
              }
              loading={statsLoading}
              unavailable={statsUnavailable}
              href="/contratti"
              icon={CheckCircle2}
              highlight
            />
          </div>
        </div>
      </section>

      <section id="oggi" className="scroll-mt-24 bg-muted/25 py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow text-primary">
                {alboSnapshotStale
                  ? "Ultime variazioni disponibili"
                  : "Attività recente"}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Cosa è cambiato nell&apos;Albo
              </h2>
            </div>
            <Link
              href="/albo"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Apri l&apos;Albo civico
            </Link>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-card py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Ultimo controllo{" "}
                  {formatCivicTime(ALBO_OPERATIONAL_STATUS.last_update)}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {alboScheduleOverdue
                    ? "Controllo previsto, esecuzione non confermata"
                    : "Prossimo controllo"}{" "}
                  {formatCivicTime(
                    ALBO_OPERATIONAL_STATUS.next_scheduled_check,
                  )}
                </span>
              </div>

              {alboSnapshotStale && (
                <p role="status" className="mt-3 text-sm text-muted-foreground">
                  Lo snapshot disponibile non ha un controllo confermato nelle
                  ultime 24 ore. Le variazioni sotto riportate si riferiscono
                  all'ultimo confronto disponibile; l'assenza di novità non
                  prova l'assenza di nuovi atti nella fonte ufficiale.
                </p>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2">
                <PulseCount label="Nuovi" value={pulseCounts.new} />
                <PulseCount label="Aggiornati" value={pulseCounts.changed} />
                <PulseCount
                  label="Non più presenti"
                  value={pulseCounts.removed}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pulseItems.length > 0 ? (
                  pulseItems.map((pulse) => (
                    <AlboPulseRow
                      key={`${pulse.kind}-${pulse.item.id}`}
                      pulse={pulse}
                    />
                  ))
                ) : (
                  <div className="p-8 text-sm leading-6 text-muted-foreground">
                    Non risultano record pubblici disponibili nello snapshot
                    corrente.
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-muted/25 px-4 py-3 text-xs text-muted-foreground">
                {hasDiff
                  ? "Confronto con la baseline pubblica precedente."
                  : "Nessuna variazione rilevata: sono mostrati gli atti correnti più recenti."}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        data-tour="home-themes"
        className="border-b border-border bg-background py-10 md:py-12"
        aria-labelledby="home-primary-domains"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 max-w-3xl">
            <span className="eyebrow text-primary">Esplora</span>
            <h2
              id="home-primary-domains"
              className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              Esplora il Comune
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Decisioni, risorse pubbliche, persone, territorio e fonti.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {HOME_PRIMARY_GATEWAYS.map((gateway) => {
              const Icon = gateway.icon;
              return (
                <Link
                  key={gateway.title}
                  href={gateway.href}
                  className="group rounded-xl border border-card-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary/35 hover:bg-primary/5 md:p-5"
                >
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary w-fit">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                    {gateway.title}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {gateway.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20 py-8 md:py-10">
        <div className="container mx-auto grid gap-7 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="max-w-xl">
            <span className="eyebrow text-primary">Risorse pubbliche</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Spesa e progetti
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Segui affidamenti, progetti finanziati e incarichi senza perdere
              il collegamento alle fonti e ai limiti di copertura.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <HomeLinkCard
              title="Contratti pubblici"
              description="Gare, affidamenti, CIG, importi e operatori."
              href="/contratti"
            />
            <HomeLinkCard
              title="PNRR"
              description="Progetti, CUP, finanziamenti e luoghi degli interventi."
              href="/pnrr"
            />
            <HomeLinkCard
              title="Incarichi e consulenze"
              description="Incarichi, consulenze e ricorrenze documentali."
              href="/incarichimetro"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-8 md:py-10">
        <div className="container mx-auto grid gap-7 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="max-w-xl">
            <span className="eyebrow text-primary">
              Trasparenza del monitoraggio
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Qualità e copertura delle fonti
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Ogni numero va letto insieme a fonte, freschezza, copertura e
              cautele metodologiche.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <HomeLinkCard
              title="Stato delle fonti"
              description="Copertura e freschezza dei collegamenti monitorati."
              href="/stato-monitoraggio"
            />
            <HomeLinkCard
              title="Fonti dati"
              description="Indice delle fonti pubbliche e dei relativi limiti."
              href="/fonti-dati"
            />
            <HomeLinkCard
              title="Metodologia"
              description="Criteri e cautele per leggere dati e indicatori."
              href="/metodologia"
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/20 py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Chiedi, proponi, segnala.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                I contributi restano distinti dai fatti verificati: fonte,
                contesto e stato di verifica sono sempre espliciti.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HomeLinkCard
                title="Chiedi un dato"
                description="Richiedi documenti o informazioni pubbliche."
                href="/accesso-civico"
              />
              <HomeLinkCard
                title="Proponi"
                description="Suggerisci una proposta civica documentata."
                href="/proposte-civiche"
              />
              <HomeLinkCard
                title="Segnala"
                description="Indica un dato o un atto da verificare."
                href="/segnalazioni"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HomeInstitutionalSessions() {
  const sessions = selectHomeSessions(councilSessionV0ReviewedRecords);
  const hasUpcoming = sessions.some((session) => sessionIsUpcoming(session));
  return (
    <section
      id="consiglio-commissioni"
      aria-labelledby="consiglio-commissioni-title"
      className="scroll-mt-24 border-b border-border bg-background py-8 md:py-10"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">
              Consiglio e Commissioni
            </span>
            <h2
              id="consiglio-commissioni-title"
              className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {hasUpcoming ? "In agenda" : "Ultime convocazioni"}
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/convocazioni">
              Tutte le sedute · agenda e archivio
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {sessions.map((session) => {
            const scheduled = sessionDate(session.scheduledAt.value);
            const dateNumber = scheduled
              ? new Intl.DateTimeFormat("it-IT", {
                  timeZone: scheduled.timezone,
                  day: "2-digit",
                }).format(scheduled.date)
              : "—";
            const dateMonth = scheduled
              ? new Intl.DateTimeFormat("it-IT", {
                  timeZone: scheduled.timezone,
                  month: "short",
                }).format(scheduled.date)
              : "Data";
            return (
              <Link
                key={session.id}
                href={`/convocazioni/${session.id}`}
                data-session-id={session.id}
                className="group flex min-w-0 gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span
                  aria-hidden="true"
                  className="flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/5 text-primary"
                >
                  <span className="font-display text-3xl font-bold leading-none tabular-nums">
                    {dateNumber}
                  </span>
                  <span className="mt-1 text-sm font-semibold capitalize">
                    {dateMonth}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-primary">
                    {sessionOrgan(session)}
                  </span>
                  <span className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug group-hover:text-primary">
                    {session.agenda.value?.[0] ||
                      "Convocazione e documenti della seduta"}
                  </span>
                  <time
                    dateTime={
                      scheduled ? session.scheduledAt.value! : undefined
                    }
                    className="mt-2 block text-sm text-muted-foreground"
                  >
                    {sessionDateLabel(session)}
                  </time>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {
                      councilSessionV0StatusLabels[
                        session.sessionStatus.value ?? "non_verificata"
                      ]
                    }
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nessuna convocazione disponibile nello snapshot corrente.
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Fonte: Albo Pretorio e documenti istituzionali.{" "}
          {hasUpcoming
            ? "Date in arrivo e convocazioni recenti."
            : "Le convocazioni più recenti disponibili; nessuna data futura risulta nell'archivio acquisito."}{" "}
          Lo svolgimento è indicato solo se confermato da una fonte
          istituzionale. L'archivio non copre tutte le sedute.
        </p>
      </div>
    </section>
  );
}

function PulseCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function AlboPulseRow({ pulse }: { pulse: PulseItem }) {
  const { item, kind } = pulse;
  const publication = item.publication_number
    ? `Pubbl. ${item.publication_number}`
    : formatDate(item.publication_start);

  return (
    <Link
      href={`/albo?atto=${encodeURIComponent(item.id)}`}
      className="group block p-4 transition-colors hover:bg-muted/45"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {PULSE_LABELS[kind]}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {item.classification.act_category.label}
        </span>
        {item.presentation.labels.slice(0, 1).map((label) => (
          <span key={label} className="text-[10px] font-semibold text-primary">
            {label}
          </span>
        ))}
      </div>
      <p
        className="line-clamp-3 text-sm font-semibold leading-snug text-foreground"
        data-long-title={
          item.presentation.flags.includes("display_title_too_long") ||
          undefined
        }
      >
        {item.presentation.display_title}
      </p>
      {item.presentation.summary && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.presentation.summary}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{item.classification.sector.label}</span>
        <span>·</span>
        <span>{publication}</span>
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  loading,
  unavailable = false,
  href,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  value?: string | number;
  loading: boolean;
  unavailable?: boolean;
  href: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative block overflow-hidden rounded-lg border border-card-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/35 hover:bg-primary/5 ${highlight ? "ring-1 ring-brand/20" : ""}`}
    >
      {highlight ? (
        <span className="absolute left-0 top-0 h-full w-1 bg-brand" />
      ) : null}
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`rounded-md p-2 ${highlight ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      {unavailable ? (
        <div>
          <div className="font-display text-lg font-bold text-foreground">
            Fonte in attivazione
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Nessun totale viene mostrato finché il collegamento non è
            verificato.
          </p>
        </div>
      ) : loading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <div
          className={`font-display text-3xl font-bold tracking-tight tabular-nums ${highlight ? "text-brand" : "text-foreground"}`}
        >
          {value ?? "Non disponibile"}
        </div>
      )}
    </Link>
  );
}

function HomeLinkCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-card-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/35 hover:bg-primary/5"
    >
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
