import { Link } from "wouter";
import {
  useGetRecentActivity,
  useGetStatsOverview,
  useListConvocazioni,
  useListPnrrProjects,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileSearch,
  FileText,
  Info,
  Landmark,
  Megaphone,
  ShieldAlert,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageMeta } from "@/components/seo/PageMeta";
import { asApiList } from "@/lib/apiList";
import { PUBLIC_NUMBER_PLACEHOLDER } from "@/lib/publicNumbers";

type ActivityItem = {
  id: string | number;
  type?: string;
  title?: string;
  date?: string;
};

type ConvocazioneItem = {
  id: number;
  oggetto: string;
  dataAtto?: string | null;
  pubStart?: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data non disponibile"
    : format(date, "dd MMM yyyy", { locale: it });
}

function formatActivityDate(value: string | undefined) {
  if (!value) return "Data non disponibile";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data non disponibile"
    : format(date, "dd MMM", { locale: it });
}

function formatMonitoredAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return PUBLIC_NUMBER_PLACEHOLDER;
  }

  return `€ ${(value / 1_000_000).toFixed(1)}M`;
}

const gateways = [
  {
    title: "Cosa sta succedendo",
    description:
      "Ultimi atti, pubblicazioni e sedute: il punto di partenza per capire cosa si muove nel Comune.",
    href: "/albo/",
    cta: "Vedi gli ultimi atti",
    icon: FileSearch,
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
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: pnrrProjects } = useListPnrrProjects();
  const { data: consiglio, isLoading: consiglioLoading } = useListConvocazioni({
    tipo: "consiglio",
  });
  const { data: commissioni, isLoading: commissioniLoading } =
    useListConvocazioni({ tipo: "commissione" });

  const recentActivity = asApiList<ActivityItem>(activity).slice(0, 5);
  const pnrrProjectCount = asApiList(pnrrProjects?.projects).length;

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
              in un solo posto. Il monitor aiuta a orientarsi nei documenti e
              rende visibili anche limiti e stato dei dati.
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

      <section id="oggi" className="scroll-mt-24 bg-muted/25 py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 max-w-3xl">
            <span className="eyebrow text-primary">Il punto rapido</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Oggi a Lamezia
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
              Le novità che le fonti collegate rendono disponibili in questo
              momento: aggiornamenti documentali e agenda pubblica, senza
              confondere assenza di dati con assenza di attività.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-card py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Ultimi aggiornamenti disponibili
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Atti, contratti e altri movimenti esposti dalle fonti
                      collegate.
                    </p>
                  </div>
                  <Link
                    href="/albo/"
                    className="shrink-0 text-sm font-semibold text-primary hover:underline"
                  >
                    Albo
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {activityLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-4 p-4">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                        <div className="w-full space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="p-8 text-sm leading-6 text-muted-foreground">
                      Non risultano aggiornamenti recenti dalla fonte collegata.
                      Consulta l&apos;Albo Pretorio per la fonte ufficiale e lo
                      stato delle fonti per i limiti di copertura.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <AgendaCard
                title="Consiglio comunale"
                icon={Users}
                items={consiglio}
                loading={consiglioLoading}
              />
              <AgendaCard
                title="Commissioni"
                icon={CalendarClock}
                items={commissioni}
                loading={commissioniLoading}
              />
            </div>
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
              value={stats?.acts}
              loading={statsLoading}
              href="/albo/"
              icon={FileSearch}
            />
            <StatCard
              title="Contratti censiti"
              value={stats?.contracts}
              loading={statsLoading}
              href="/contratti"
              icon={FileText}
            />
            <StatCard
              title="Progetti PNRR"
              value={pnrrProjectCount}
              loading={!pnrrProjects}
              href="/pnrr"
              icon={Landmark}
            />
            <StatCard
              title="Importi disponibili"
              value={stats ? formatMonitoredAmount(stats.monitoredAmount) : undefined}
              loading={statsLoading}
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
                Il progetto privilegia contributi documentati e verificabili.
                Le segnalazioni non vengono trasformate automaticamente in
                fatti: fonte, contesto e stato di verifica restano distinti.
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
            <p className="mt-2 max-w-2xl text-brand-foreground/80">
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

function AgendaCard({
  title,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  items: ConvocazioneItem[] | undefined;
  loading: boolean;
}) {
  const safeItems = asApiList<ConvocazioneItem>(items).slice(0, 2);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border bg-card py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="font-display text-sm font-bold">{title}</h3>
        </div>
        <Link
          href="/convocazioni"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Agenda
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2 p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : safeItems.length > 0 ? (
            safeItems.map((item) => (
              <Link
                key={item.id}
                href={`/convocazioni/${item.id}`}
                className="block p-4 transition-colors hover:bg-muted/45"
              >
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(item.dataAtto ?? item.pubStart)}
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {item.oggetto}
                </p>
              </Link>
            ))
          ) : (
            <div className="p-5 text-sm leading-6 text-muted-foreground">
              Non risultano sedute disponibili nella fonte collegata.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const href = (() => {
    switch (item.type) {
      case "act":
        return "/albo/";
      case "contract": {
        const numericId = String(item.id).replace(/^contract-/, "");
        return `/contratti/${numericId}`;
      }
      case "report":
        return "/segnalazioni";
      default:
        return "/stato-monitoraggio";
    }
  })();

  const label = (() => {
    switch (item.type) {
      case "act":
        return "Atto";
      case "contract":
        return "Contratto";
      case "report":
        return "Segnalazione";
      default:
        return "Aggiornamento";
    }
  })();

  const icon = (() => {
    switch (item.type) {
      case "act":
        return <FileSearch className="h-4 w-4" aria-hidden="true" />;
      case "contract":
        return <FileText className="h-4 w-4" aria-hidden="true" />;
      case "report":
        return <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Info className="h-4 w-4" aria-hidden="true" />;
    }
  })();

  return (
    <Link
      href={href}
      className="group flex gap-4 p-4 transition-colors hover:bg-muted/45"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground/60">•</span>
          <span className="text-[10px] text-muted-foreground">
            {formatActivityDate(item.date)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {item.title || "Aggiornamento dalla fonte collegata"}
        </p>
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  loading,
  href,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  value?: string | number;
  loading: boolean;
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
      {loading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <div
          className={`font-display text-3xl font-bold tracking-tight tabular-nums ${highlight ? "text-brand" : "text-foreground"}`}
        >
          {value ?? 0}
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
