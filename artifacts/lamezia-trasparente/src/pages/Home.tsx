import { Link } from "wouter";
import {
  useGetStatsOverview,
  useGetRecentActivity,
  useListConvocazioni,
  useListPnrrProjects,
  useListQuestions,
  type Question,
} from "@workspace/api-client-react";
import {
  ShieldAlert,
  ArrowRight,
  FileText,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  ArrowUpRight,
  Info,
  Landmark,
  Users,
  CalendarClock,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { iconForTopic } from "@/lib/questionTopics";
import { format } from "date-fns";
import { it } from "date-fns/locale";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy", { locale: it });
}

export function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: pnrrProjects } = useListPnrrProjects();
  const { data: questions, isLoading: questionsLoading } = useListQuestions();
  const { data: consiglio, isLoading: consiglioLoading } = useListConvocazioni({
    tipo: "consiglio",
  });
  const { data: commissioni, isLoading: commissioniLoading } =
    useListConvocazioni({ tipo: "commissione" });

  const { featured, topics } = useMemo(() => {
    const list = questions ?? [];
    const featured = list
      .filter((q) => q.featured)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 6);
    const topicMap = new Map<string, Question[]>();
    for (const q of list) {
      const arr = topicMap.get(q.topic);
      if (arr) arr.push(q);
      else topicMap.set(q.topic, [q]);
    }
    const topics = Array.from(topicMap.entries())
      .map(([topic, items]) => ({
        topic,
        count: items.length,
      }))
      .sort((a, b) => a.topic.localeCompare(b.topic, "it"));
    return { featured, topics };
  }, [questions]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-sidebar text-sidebar-foreground overflow-hidden">
        {/* background texture */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.07] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 10%, hsl(216 92% 58% / 0.22), transparent 45%), radial-gradient(circle at 90% 90%, hsl(14 88% 52% / 0.18), transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container relative z-10 mx-auto px-4 md:px-6 py-20 md:py-28 flex flex-col items-start max-w-4xl">
          <div className="eyebrow rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-brand">
            <ShieldAlert className="h-3.5 w-3.5" />
            Osservatorio Civico Indipendente
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.25rem] font-bold tracking-[-0.03em] text-white mt-7 mb-6 leading-[0.95]">
            La trasparenza<br className="hidden sm:inline" /> è un diritto.
            <br />
            <span className="text-gradient-brand">Il controllo è un dovere.</span>
          </h1>

          <p className="text-lg md:text-xl text-sidebar-foreground/75 mb-9 max-w-2xl text-balance">
            Monitoriamo gli atti, gli appalti e le decisioni del Comune di Lamezia Terme.
            Uno strumento fatto dai cittadini, per i cittadini, per pretendere chiarezza
            sull'uso delle risorse pubbliche.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/albo" className="w-full sm:w-auto">
              <Button variant="brand" size="lg" className="w-full text-base h-12 px-7 font-bold">
                Esplora l'Albo Pretorio <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/segnalazioni" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base h-12 px-7 font-bold bg-white/5 text-white border-white/25 hover:bg-white/10"
              >
                <Megaphone className="mr-1 h-4 w-4" />
                Invia una Segnalazione
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            <StatCard
              title="Atti Pubblicati"
              value={stats?.acts}
              loading={statsLoading}
              icon={FileSearch}
            />
            <StatCard
              title="Appalti"
              value={stats?.contracts}
              loading={statsLoading}
              icon={FileText}
            />
            <StatCard
              title="Progetti PNRR"
              value={pnrrProjects?.projects.length}
              loading={!pnrrProjects}
              icon={Landmark}
            />
            <StatCard
              title="Valore Monitorato"
              value={stats ? `€ ${(stats.monitoredAmount / 1000000).toFixed(1)}M` : undefined}
              loading={statsLoading}
              icon={CheckCircle2}
              highlight
            />
          </div>
        </div>
      </section>

      {/* Questions Section — Cosa vuoi scoprire? */}
      <section className="border-b border-border bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center text-brand">
              <HelpCircle className="h-3.5 w-3.5" />
              Parti da una domanda
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Cosa vuoi scoprire?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Abbiamo organizzato i dati pubblici del Comune attorno alle domande
              che contano. Scegli un punto di partenza e ti guidiamo alle risposte.
            </p>
          </div>

          {/* Topic chips */}
          {topics.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {topics.map((t) => {
                const Icon = iconForTopic(t.topic);
                return (
                  <Link
                    key={t.topic}
                    href={`/domande?topic=${encodeURIComponent(t.topic)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover-elevate"
                  >
                    <Icon className="h-4 w-4 text-brand" />
                    {t.topic}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Featured questions */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {questionsLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))
              : featured.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/domande">
              <Button variant="brand" size="lg" className="h-12 px-7 font-bold">
                Esplora tutte le domande <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Convocazioni */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="eyebrow text-brand mb-2">Agenda pubblica</span>
                  <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-2">
                    Prossime Convocazioni
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Sedute del Consiglio Comunale e delle Commissioni Consiliari.
                  </p>
                </div>
                <Link href="/convocazioni" className="hidden md:flex shrink-0">
                  <Button variant="ghost" className="gap-2 font-semibold">
                    Vedi tutte <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <ConvocazioniColumn
                  title="Consiglio Comunale"
                  icon={Users}
                  items={consiglio}
                  loading={consiglioLoading}
                />
                <ConvocazioniColumn
                  title="Commissioni Consiliari"
                  icon={CalendarClock}
                  items={commissioni}
                  loading={commissioniLoading}
                />
              </div>

              <Link href="/convocazioni" className="md:hidden block mt-6">
                <Button variant="outline" className="w-full font-semibold">
                  Vedi tutte le convocazioni
                </Button>
              </Link>
            </div>

            {/* Sidebar Activity */}
            <div className="space-y-8">
              <div>
                <span className="eyebrow text-brand mb-2">In tempo reale</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-2">
                  Attività Recente
                </h2>
                <p className="text-muted-foreground mt-2">Ultimi aggiornamenti dalla piattaforma.</p>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {activityLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i} className="p-4 flex gap-4">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))
                    ) : activity && activity.length > 0 ? (
                      activity.slice(0, 6).map(item => (
                        <ActivityRow key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Nessuna attività recente.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardHeader className="p-3 border-t border-border bg-muted/30">
                  <Link href="/albo" className="w-full">
                    <Button variant="ghost" className="w-full justify-between font-semibold text-muted-foreground hover:text-foreground">
                      Vai all'Albo Pretorio <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 0% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 0% / 0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative mx-auto px-4 md:px-6 py-20 text-center max-w-3xl">
          <Megaphone className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Hai notato un'anomalia?
          </h2>
          <p className="text-brand-foreground/85 text-lg mb-8 text-balance">
            La trasparenza si costruisce insieme. Segnala lavori interrotti, bandi sospetti o
            sprechi di denaro pubblico. Il nostro team verificherà la segnalazione.
          </p>
          <Link href="/segnalazioni">
            <Button size="lg" variant="secondary" className="text-base h-12 px-8 font-bold">
              Invia una Segnalazione <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ConvocazioniColumn({
  title,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  icon: any;
  items: { id: number; oggetto: string; dataAtto?: string | null; pubStart?: string | null }[] | undefined;
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2.5 space-y-0 border-b border-border bg-muted/30 py-3.5">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-display font-bold text-sm tracking-tight">{title}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : items && items.length > 0 ? (
            items.slice(0, 3).map((c) => (
              <Link key={c.id} href="/convocazioni" className="block p-4 hover-elevate transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(c.dataAtto ?? c.pubStart)}
                </div>
                <p className="text-sm font-medium leading-snug line-clamp-2">{c.oggetto}</p>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nessuna convocazione disponibile.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, loading, icon: Icon, highlight = false }: any) {
  return (
    <div className={`relative p-6 md:p-8 ${highlight ? "bg-primary/5" : ""}`}>
      {highlight && <span className="absolute left-0 top-0 h-full w-1 bg-brand" />}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${highlight ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="eyebrow text-muted-foreground">{title}</h3>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className={`text-4xl font-display font-bold tracking-tight tabular-nums ${highlight ? "text-brand" : "text-foreground"}`}>
            {value ?? 0}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: any }) {
  const getIcon = () => {
    switch (item.type) {
      case 'act': return <FileSearch className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'report': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case 'act': return 'Nuovo Atto';
      case 'contract': return 'Nuovo Appalto';
      case 'report': return 'Nuova Segnalazione';
      default: return 'Aggiornamento';
    }
  };

  return (
    <div className="p-4 flex gap-4 hover-elevate transition-colors group">
      <div className="mt-0.5 bg-background border border-border p-2 rounded-full h-9 w-9 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-brand group-hover:border-brand/40 transition-colors">
        {getIcon()}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
            {getLabel()}
          </span>
          <span className="text-[10px] text-muted-foreground/60">•</span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(item.date), 'dd MMM', { locale: it })}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {item.title}
        </p>
      </div>
    </div>
  );
}
