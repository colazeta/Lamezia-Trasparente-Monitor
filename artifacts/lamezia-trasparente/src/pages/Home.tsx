import { Link } from "wouter";
import {
  useGetStatsOverview,
  useListConvocazioni,
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
  RefreshCw,
  ShieldAlert,
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
import { asApiList } from "@/lib/apiList";
import { PUBLIC_NUMBER_PLACEHOLDER } from "@/lib/publicNumbers";

type ConvocazioneItem = {
  id: number;
  oggetto: string;
  dataAtto?: string | null;
  pubStart?: string | null;
};

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
    ...ALBO_PUBLIC_DIFF_NEW_ITEMS.map((item) => ({ kind: "new" as const, item })),
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
    title: "Cosa sta succedendo",
    description:
      "Ultimi atti e variazioni dell'Albo, insieme a sedute e appuntamenti pubblici.",
    href: "/albo",
    cta: "Vedi cosa è cambiato",
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
  const { data: pnrrProjects } = useListPnrrProjects();
  const { data: consiglio, isLoading: consiglioLoading } = useListConvocazioni({
    tipo: "consiglio",
  });
  const { data: commissioni, isLoading: commissioniLoading } =
    useListConvocazioni({ tipo: "commissione" });

  const pnrrProjectCount = asApiList(pnrrProjects?.projects).length;
  const pulseItems = buildPulseItems();
  const pulseCounts = ALBO_PUBLIC_DIFF_SUMMARY.counts;
  const hasDiff = pulseCounts.new + pulseCounts.changed + pulseCounts.removed > 0;

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

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-card py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Cosa è cambiato dall&apos;ultimo controllo
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Albo Pretorio · ultimo controllo {formatCivicTime(ALBO_OPERATIONAL_STATUS.last_update)}
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
                  <PulseCount label="Non più presenti" value={pulseCounts.removed} />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pulseItems.length > 0 ? (
                    pulseItems.map((pulse) => (
                      <AlboPulseRow key={`${pulse.kind}-${pulse.item.id}`} pulse={pulse} />
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
                      ? "Confronto effettuato sulla baseline pubblica precedente."
                      : "Nessuna variazione rilevata: sono mostrati gli atti correnti più recenti."}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Prossimo controllo {formatCivicTime(ALBO_OPERATIONAL_STATUS.next_scheduled_check)}
                  </span>
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
              value={stats?.acts ?? ALBO_OPERATIONAL_STATUS.counts.acquired}
              loading={statsLoading}
              href="/albo"
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
    <Link href="/albo" className="group block p-4 transition-colors hover:bg-muted/45">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {PULSE_LABELS[kind]}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {item.classification.act_category.label}
        </span>
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {item.subject}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{item.classification.sector.label}</span>
        <span>·</span>
        <span>{publication}</span>
      </div>
    </Link>
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
      {highlight ? <span className="absolute left-0 top-0 h-full w-1 bg-brand" /> : null}
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
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Apri
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
