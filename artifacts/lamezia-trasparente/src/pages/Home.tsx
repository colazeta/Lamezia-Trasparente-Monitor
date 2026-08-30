import { Link } from "wouter";
import {
  useGetStatsOverview,
  useListPnrrProjects,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileSearch,
  FileText,
  Landmark,
  Megaphone,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  Users,
  Video,
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

const gateways = [
  {
    title: "Consiglio e Commissioni",
    description:
      "Convocazioni, date, ordini del giorno e documenti collegati alle fonti disponibili.",
    href: "/convocazioni",
    cta: "Segui i lavori",
    icon: Users,
  },
  {
    title: "Dove vanno i soldi",
    description:
      "Contratti, affidamenti, importi e progetti PNRR collegati alle fonti disponibili.",
    href: "/contratti",
    cta: "Segui la spesa pubblica",
    icon: FileText,
  },
  {
    title: "Come partecipare",
    description:
      "Accesso civico, proposte e segnalazioni per chiedere dati o contribuire con elementi verificabili.",
    href: "/accesso-civico",
    cta: "Scopri gli strumenti civici",
    icon: Megaphone,
  },
] as const;

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
  const hasDiff =
    pulseCounts.new + pulseCounts.changed + pulseCounts.removed > 0;

  return (
    <div className="flex flex-col">
      <PageMeta
        title="Lamezia Trasparente — atti, spesa e partecipazione civica"
        description="Capire cosa decide, spende e realizza il Comune di Lamezia Terme attraverso atti, sedute, contratti e progetti collegati alle fonti pubbliche."
        path="/"
      />

      <section
        data-tour="home-hero"
        className="relative overflow-hidden bg-sidebar text-sidebar-foreground"
      >
        <div className="absolute inset-0 pointer-events-none civic-hero-grid opacity-40" />
        <div className="container relative z-10 mx-auto max-w-6xl px-4 py-14 sm:py-18 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="eyebrow inline-flex rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-brand">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Lamezia Terme · dati pubblici
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.03] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Capire cosa decide, spende e realizza il Comune.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-sidebar-foreground/80 sm:text-lg md:text-xl">
              Atti, sedute, contratti e progetti pubblici collegati alle fonti,
              in un solo posto. Il monitor aiuta a capire cosa cambia e rende
              visibili anche limiti e stato dei dati.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="brand" size="lg" className="font-bold">
                <a href="#oggi">
                  Vedi cosa c&apos;è di nuovo
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/5 font-bold text-white hover:bg-white/10"
              >
                <Link href="/contratti">Segui la spesa pubblica</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sidebar-foreground/65">
              <Link href="/metodologia" className="hover:text-white">
                Come leggiamo i dati
              </Link>
              <Link href="/stato-monitoraggio" className="hover:text-white">
                Stato delle fonti
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {gateways.map((gateway) => {
              const Icon = gateway.icon;
              return (
                <Link
                  key={gateway.title}
                  href={gateway.href}
                  className="group rounded-xl border border-card-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/35 hover:bg-primary/5 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold tracking-tight">
                        {gateway.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {gateway.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {gateway.cta}
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <HomeInstitutionalSessions />

      <section id="oggi" className="scroll-mt-24 bg-muted/25 py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 max-w-3xl">
            <span className="eyebrow text-primary">Il punto rapido</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Oggi a Lamezia
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
              Cosa è cambiato nelle fonti collegate dall&apos;ultimo controllo e
              quali appuntamenti pubblici risultano disponibili.
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-card py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Cosa è cambiato dall&apos;ultimo controllo
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Albo Pretorio · Ultimo controllo{" "}
                      {formatCivicTime(ALBO_OPERATIONAL_STATUS.last_update)}
                    </p>
                  </div>
                  <Link
                    href="/albo"
                    className="shrink-0 text-sm font-semibold text-primary hover:underline"
                  >
                    Apri l&apos;Albo civico
                  </Link>
                </div>

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

                <div className="flex flex-col gap-1 border-t border-border bg-muted/25 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {hasDiff
                      ? "Confronto effettuato sulla baseline pubblica precedente."
                      : "Nessuna variazione rilevata: sono mostrati gli atti correnti più recenti."}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Prossimo controllo{" "}
                    {formatCivicTime(
                      ALBO_OPERATIONAL_STATUS.next_scheduled_check,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <span className="eyebrow text-primary">In numeri</span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Cosa è già consultabile
              </h2>
            </div>
            <Link
              href="/stato-monitoraggio"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Verifica copertura e freschezza
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

      <section className="bg-muted/20 py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="max-w-xl">
              <span className="eyebrow text-primary">Partecipazione</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Non solo leggere: puoi anche chiedere, proporre e correggere.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Il progetto privilegia contributi documentati e verificabili. Le
                segnalazioni non vengono trasformate automaticamente in fatti:
                fonte, contesto e stato di verifica restano distinti.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <ParticipationCard
                title="Chiedi un dato"
                description="Usa l'accesso civico per richiedere documenti o informazioni pubbliche."
                href="/accesso-civico"
              />
              <ParticipationCard
                title="Proponi"
                description="Consulta o suggerisci proposte civiche con fonte e stato espliciti."
                href="/proposte-civiche"
              />
              <ParticipationCard
                title="Segnala"
                description="Indica un dato, un atto o un elemento documentale che merita verifica."
                href="/segnalazioni"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Vuoi capire quanto è affidabile un dato?
            </h2>
            <p className="mt-2 max-w-2xl text-brand-foreground">
              Ogni lettura va ricondotta alla fonte, alla data di aggiornamento
              e ai limiti dichiarati. Il metodo è parte del prodotto, non una
              nota a margine.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button asChild variant="secondary">
              <Link href="/metodologia">Leggi la metodologia</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-brand-foreground/30 bg-transparent text-brand-foreground hover:bg-brand-foreground/10"
            >
              <Link href="/stato-monitoraggio">Stato delle fonti</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const councilHomeSessions = councilSessionV0ReviewedRecords.filter(
  (session) => session.kind === "council",
);
const commissionHomeSessions = councilSessionV0ReviewedRecords.filter(
  (session) => session.kind === "commission",
);

export function HomeInstitutionalSessions() {
  return (
    <section
      id="consiglio-commissioni"
      aria-labelledby="consiglio-commissioni-title"
      className="scroll-mt-24 border-b border-border bg-background py-14 md:py-20"
    >
      <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="max-w-xl">
          <span className="eyebrow text-primary">Lavori degli organi</span>
          <h2
            id="consiglio-commissioni-title"
            className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl"
          >
            Segui Consiglio comunale e Commissioni
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Consulta convocazioni, date e ordini del giorno collegati alle fonti
            istituzionali disponibili, insieme ad articoli, dirette e video
            trovati e revisionati con una ricerca di contesto. Ogni scheda
            distingue i dati verificati da quelli ancora da controllare.
          </p>

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Copertura iniziale</p>
            <p className="mt-1">
              Sono mostrate le prime pubblicazioni revisionate. Lo svolgimento
              viene indicato solo quando una fonte istituzionale successiva lo
              conferma.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button asChild>
              <Link href="/convocazioni">
                Apri l&apos;archivio delle sedute
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/metodologia">Fonti e limiti</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <InstitutionalSessionsHomeCard
            title="Consiglio comunale"
            description="La data e lo svolgimento sono confermati da una fonte istituzionale successiva. Orario e ordine del giorno completo restano da verificare."
            icon={Users}
            sessions={councilHomeSessions}
          />
          <InstitutionalSessionsHomeCard
            title="Commissioni consiliari"
            description="Due sedute della II Commissione trascritte dallo stesso allegato ufficiale, con data, ora e ordine del giorno controllati."
            icon={CalendarClock}
            sessions={commissionHomeSessions}
          />
        </div>
      </div>
    </section>
  );
}

function InstitutionalSessionsHomeCard({
  title,
  description,
  icon: Icon,
  sessions,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  sessions: readonly CouncilSessionV0[];
}) {
  const attachmentReviewed = sessions.some(
    (session) =>
      session.provenance?.sourceReviewStatus ===
      "reviewed_against_official_attachment",
  );
  const laterOfficialSourceReviewed = sessions.some(
    (session) =>
      session.provenance?.sourceReviewStatus ===
      "reviewed_against_later_official_source",
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden border-primary/20">
      <CardHeader className="border-b border-border bg-muted/25 py-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            {attachmentReviewed
              ? "Allegato controllato"
              : laterOfficialSourceReviewed
                ? "Fonte successiva controllata"
                : "Metadati ufficiali"}
          </span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        <div className="divide-y divide-border">
          {sessions.map((session) => {
            const agendaCount = session.agenda.value?.length ?? 0;
            const contextArticleCount = session.contextResearch.articles.length;
            const contextMediaCount = session.contextResearch.media.length;
            const contextCountSummary = [
              contextArticleCount > 0
                ? `${contextArticleCount} ${contextArticleCount === 1 ? "articolo" : "articoli"}`
                : null,
              contextMediaCount > 0
                ? `${contextMediaCount} ${contextMediaCount === 1 ? "video" : "video"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ");
            const contextStatusSummary =
              contextCountSummary ||
              (session.contextResearch.status === "checked_no_match"
                ? "Ricerca eseguita · nessun collegamento preciso"
                : "Ricerca da completare");
            const sameSessionCount = session.contextResearch.articles.filter(
              (article) => article.relationship === "same_session",
            ).length;
            const possibleSessionCount =
              session.contextResearch.articles.filter(
                (article) => article.relationship === "possible_same_session",
              ).length;
            const agendaItemCount = session.contextResearch.articles.filter(
              (article) => article.relationship === "agenda_item",
            ).length;
            const contextRelationshipSummary = [
              sameSessionCount > 0 ? `${sameSessionCount} stessa seduta` : null,
              possibleSessionCount > 0
                ? `${possibleSessionCount} ${possibleSessionCount === 1 ? "possibile" : "possibili"}`
                : null,
              agendaItemCount > 0
                ? `${agendaItemCount} sui temi in agenda`
                : null,
            ]
              .filter(Boolean)
              .join(" · ");
            const sessionStatusSummary =
              councilSessionV0StatusLabels[
                session.sessionStatus.value ?? "non_verificata"
              ];
            return (
              <Link
                key={session.id}
                href={`/convocazioni/${session.id}`}
                className="group block p-4 transition-colors hover:bg-muted/45"
              >
                <div className="flex items-start gap-3">
                  <Calendar
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary">
                      {formatSessionDate(session.scheduledAt.value)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {agendaCount > 0
                        ? `${agendaCount} punti all'ordine del giorno · ${sessionStatusSummary}`
                        : `Ordine del giorno da verificare · ${sessionStatusSummary}`}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {contextMediaCount > 0 ? (
                        <Video
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Newspaper
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {contextStatusSummary}
                      {contextArticleCount > 0
                        ? ` · ${contextRelationshipSummary}`
                        : ""}
                    </p>
                  </div>
                  <ArrowRight
                    className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-border bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground">
          {sessions.length > 0
            ? `Fonte: Albo Pretorio · pubblicazione ${sessions[0].provenance?.publicationNumber}`
            : "Nessuna scheda revisionata disponibile."}
        </div>
      </CardContent>
    </Card>
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
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Apri
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
