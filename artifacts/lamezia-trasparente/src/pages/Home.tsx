import { Link } from "wouter";
import {
  useGetStatsOverview,
  useListPnrrProjects,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Landmark,
  MapPinned,
  Megaphone,
  RefreshCw,
  ShieldCheck,
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
import {
  councilSessionV0StatusLabels,
  type CouncilSessionV0,
} from "@/data/councilSessionV0";
import { asApiList } from "@/lib/apiList";
import { PUBLIC_NUMBER_PLACEHOLDER } from "@/lib/publicNumbers";
import { PRIMARY_NAV_GROUPS } from "@/components/layout/primaryNavigation";
import type { NavSection } from "@/components/layout/navSections";

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

const HOME_DOMAIN_META: Record<
  string,
  { prompt: string; icon: React.ElementType }
> = {
  Decisioni: {
    prompt: "Cosa ha deciso il Comune?",
    icon: Landmark,
  },
  "Spesa e progetti": {
    prompt: "Dove vanno risorse e progetti?",
    icon: FileText,
  },
  "Comune e risultati": {
    prompt: "Chi amministra e come sta funzionando l'ente?",
    icon: Building2,
  },
  "Territorio e legalità": {
    prompt: "Cosa succede nei luoghi della città?",
    icon: MapPinned,
  },
  "Dati e fonti": {
    prompt: "Da dove arrivano i dati e quanto sono completi?",
    icon: Database,
  },
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

function formatSessionDate(value: string | null) {
  if (!value) return "Data e ora da verificare";

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Data e ora da verificare";

  return new Intl.DateTimeFormat("it-IT", {
    timeZone: isDateOnly ? "UTC" : "Europe/Rome",
    dateStyle: "long",
    ...(isDateOnly ? {} : { timeStyle: "short" as const }),
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

const homeSessions = [...councilSessionV0ReviewedRecords]
  .sort((a, b) =>
    (b.scheduledAt.value ?? "").localeCompare(a.scheduledAt.value ?? "", "it"),
  )
  .slice(0, 4);

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

  return (
    <div className="flex flex-col">
      <PageMeta
        title="Lamezia Trasparente — decisioni, spesa, territorio e dati"
        description="Atti, sedute, contratti, progetti, territorio e dati del Comune di Lamezia Terme collegati alle fonti pubbliche, con copertura e limiti espliciti."
        path="/"
      />

      <section
        data-tour="home-hero"
        className="bg-sidebar text-sidebar-foreground"
      >
        <div className="container mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-5xl">
            <h1 className="max-w-5xl font-display text-4xl font-bold leading-[1.03] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Seguire il Comune, dai documenti ai risultati.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-sidebar-foreground/80 sm:text-lg md:text-xl">
              Decisioni, spesa, progetti, territorio e dati pubblici collegati
              alle fonti originali, con copertura e limiti visibili.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="brand" size="lg" className="font-bold">
                <a href="#oggi">
                  Cosa è cambiato
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/5 font-bold text-white hover:bg-white/10"
              >
                <a href="#esplora">Esplora il sito</a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-sidebar-foreground/65">
              <span>
                Albo: ultimo controllo{" "}
                {formatCivicTime(ALBO_OPERATIONAL_STATUS.last_update)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                prossimo{" "}
                {formatCivicTime(ALBO_OPERATIONAL_STATUS.next_scheduled_check)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-8 md:py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Quadro civico
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
                I dati disponibili adesso
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
              title="Atti acquisiti"
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

      <section id="oggi" className="scroll-mt-24 bg-muted/25 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Attività recente
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Cosa è cambiato
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Aggiornamenti dell&apos;Albo e sedute istituzionali, con il percorso
              verso la fonte pubblica sempre disponibile.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <AlboUpdatesPanel />
            <HomeInstitutionalSessions />
          </div>
        </div>
      </section>

      <section
        id="esplora"
        className="scroll-mt-24 border-y border-border bg-background py-12 md:py-16"
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Struttura del sito
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Esplora per domanda
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Le sezioni sono raggruppate per ciò che vuoi capire, non per come
              sono organizzati internamente i dati.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PRIMARY_NAV_GROUPS.map((group) => (
              <DomainCard key={group.label} group={group} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/20 py-10 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-2xl border border-card-border bg-card p-6 shadow-[var(--shadow-card)] md:p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex max-w-3xl items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    Copertura e provenienza
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Controlla quali fonti sono attive, quando sono state
                    aggiornate e quali limiti hanno prima di interpretare un
                    numero o un&apos;assenza informativa.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/stato-monitoraggio">Stato delle fonti</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/fonti-dati">Indice fonti</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/metodologia">Metodologia</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-primary">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">
                  Partecipa
                </span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Chiedi, proponi, segnala.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                I contributi restano distinti dai fatti verificati: fonte,
                contesto e stato di verifica sono sempre espliciti.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ParticipationCard
                title="Chiedi un dato"
                description="Richiedi documenti o informazioni pubbliche."
                href="/accesso-civico"
              />
              <ParticipationCard
                title="Proponi"
                description="Suggerisci una proposta civica documentata."
                href="/proposte-civiche"
              />
              <ParticipationCard
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

function AlboUpdatesPanel() {
  const pulseItems = buildPulseItems();
  const pulseCounts = ALBO_PUBLIC_DIFF_SUMMARY.counts;
  const hasDiff =
    pulseCounts.new + pulseCounts.changed + pulseCounts.removed > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-card py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              Ultimi aggiornamenti dell&apos;Albo
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ultimo controllo {formatCivicTime(ALBO_OPERATIONAL_STATUS.last_update)}
            </p>
          </div>
          <Link
            href="/albo"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Apri l&apos;Albo civico
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <PulseCount label="Nuovi" value={pulseCounts.new} />
          <PulseCount label="Aggiornati" value={pulseCounts.changed} />
          <PulseCount label="Non più presenti" value={pulseCounts.removed} />
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
              Non risultano record pubblici disponibili nello snapshot corrente.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-border bg-muted/25 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            {hasDiff
              ? "Confronto con la baseline pubblica precedente."
              : "Nessuna variazione rilevata: sono mostrati gli atti correnti più recenti."}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Prossimo controllo{" "}
            {formatCivicTime(ALBO_OPERATIONAL_STATUS.next_scheduled_check)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeInstitutionalSessions() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-card py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              Consiglio e Commissioni
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Sedute revisionate con stato della fonte esplicito.
            </p>
          </div>
          <Link
            href="/convocazioni"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Tutte le sedute
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {homeSessions.length > 0 ? (
            homeSessions.map((session) => (
              <InstitutionalSessionRow key={session.id} session={session} />
            ))
          ) : (
            <div className="p-8 text-sm leading-6 text-muted-foreground">
              Nessuna seduta revisionata disponibile.
            </div>
          )}
        </div>
        <div className="border-t border-border bg-muted/25 px-4 py-3 text-xs text-muted-foreground">
          Fonte: Albo Pretorio. Lo svolgimento è indicato solo quando una fonte
          istituzionale successiva lo conferma.
        </div>
      </CardContent>
    </Card>
  );
}

function InstitutionalSessionRow({ session }: { session: CouncilSessionV0 }) {
  const agendaCount = session.agenda.value?.length ?? 0;
  const sessionStatus =
    councilSessionV0StatusLabels[
      session.sessionStatus.value ?? "non_verificata"
    ];
  const kindLabel =
    session.kind === "council" ? "Consiglio comunale" : "Commissione";
  const publicationNumber = session.provenance?.publicationNumber;

  return (
    <Link
      href={`/convocazioni/${session.id}`}
      className="group block p-4 transition-colors hover:bg-muted/45"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Calendar className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {kindLabel}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {sourceReviewLabel(session)}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-foreground group-hover:text-primary">
            {formatSessionDate(session.scheduledAt.value)}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {agendaCount > 0
              ? `${agendaCount} punti all'ordine del giorno · ${sessionStatus}`
              : `Ordine del giorno da verificare · ${sessionStatus}`}
          </p>
          {publicationNumber ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Albo Pretorio · pubblicazione {publicationNumber}
            </p>
          ) : null}
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

function sourceReviewLabel(session: CouncilSessionV0) {
  switch (session.provenance?.sourceReviewStatus) {
    case "reviewed_against_official_attachment":
      return "Allegato controllato";
    case "reviewed_against_later_official_source":
      return "Fonte successiva controllata";
    default:
      return "Metadati ufficiali";
  }
}

function DomainCard({ group }: { group: NavSection }) {
  const meta = HOME_DOMAIN_META[group.label] ?? {
    prompt: group.description,
    icon: FileSearch,
  };
  const Icon = meta.icon;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {group.label}
          </span>
        </div>

        <h3 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight">
          {meta.prompt}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {group.description}
        </p>

        <div className="mt-5 border-t border-border pt-2">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group/link flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/45 hover:text-primary"
            >
              <span>{item.label}</span>
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-primary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </article>
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
      className={`relative block overflow-hidden rounded-xl border border-card-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/35 hover:bg-primary/5 ${highlight ? "ring-1 ring-brand/20" : ""}`}
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
            Nessun totale viene mostrato finché il collegamento non è verificato.
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

function ParticipationCard({
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
