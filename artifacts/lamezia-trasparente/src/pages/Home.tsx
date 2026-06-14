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
import { NAV_GROUPS } from "@/components/layout/navSections";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { iconForTopic } from "@/lib/questionTopics";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PageMeta } from "@/components/seo/PageMeta";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const _basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function asArray<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy", { locale: it });
}

const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "/albo":              { color: "text-blue-500",    bg: "bg-blue-500/10" },
  "/atti-fondamentali": { color: "text-sky-500",     bg: "bg-sky-500/10" },
  "/delibere":          { color: "text-amber-500",   bg: "bg-amber-500/10" },
  "/convocazioni":      { color: "text-cyan-500",    bg: "bg-cyan-500/10" },
  "/pareri":            { color: "text-indigo-400",  bg: "bg-indigo-400/10" },
  "/legalita":          { color: "text-teal-500",    bg: "bg-teal-500/10" },
  "/contratti":         { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "/bandi":             { color: "text-lime-500",    bg: "bg-lime-500/10" },
  "/pnrr":              { color: "text-violet-500",  bg: "bg-violet-500/10" },
  "/beni-confiscati":   { color: "text-green-600",   bg: "bg-green-600/10" },
  "/organi":            { color: "text-slate-500",   bg: "bg-slate-500/10" },
  "/amministratori":    { color: "text-indigo-500",  bg: "bg-indigo-500/10" },
  "/temi":              { color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  "/monitoraggio":      { color: "text-rose-500",    bg: "bg-rose-500/10" },
  "/accesso-civico":    { color: "text-red-500",     bg: "bg-red-500/10" },
  "/segnalazioni":      { color: "text-orange-400",  bg: "bg-orange-400/10" },
  "/performance":       { color: "text-orange-500",  bg: "bg-orange-500/10" },
  "/statistiche":       { color: "text-pink-500",    bg: "bg-pink-500/10" },
  "/opendata":          { color: "text-purple-500",  bg: "bg-purple-500/10" },
  "/feeds":             { color: "text-blue-400",    bg: "bg-blue-400/10" },
  "/sviluppatori":      { color: "text-gray-500",    bg: "bg-gray-500/10" },
};

// ---------------------------------------------------------------------------
// Published page-block system
// Fetches blocks from /api/redazione/pages/:slug/blocks (published only).
// When blocks exist they replace the static layout entirely.
// Falls back to the default static layout when no blocks are published.
// ---------------------------------------------------------------------------

type PageBlock = {
  id: number;
  blockType: string;
  position: number;
  content: Record<string, unknown>;
};

function usePublishedBlocks(pageSlug: string) {
  return useQuery<PageBlock[]>({
    queryKey: ["published-blocks", pageSlug],
    queryFn: async () => {
      const res = await fetch(`${_basePath}/api/redazione/pages/${pageSlug}/blocks`);
      if (!res.ok) return [];
      return asArray<PageBlock>(await res.json());
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

// ---- Block renderers -------------------------------------------------------
// Each renderer receives the block's `content` JSON.
// Data-driven blocks (stats, recent_activity, etc.) self-fetch live data —
// React Query deduplicates the requests when the same hooks run in the
// static layout too.

function getStringContent(
  content: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return undefined;
}

function BlockHero({ content }: { content: Record<string, unknown> }) {
  const title = getStringContent(content, "title", "headline");
  const subtitle = getStringContent(content, "subtitle", "subtext");
  const ctaHref = getStringContent(content, "ctaUrl", "ctaHref");
  const ctaLabel = getStringContent(content, "ctaLabel");
  return (
    <section className="bg-sidebar text-sidebar-foreground py-16 px-6 text-center">
      {title && (
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="mt-4 max-w-2xl mx-auto text-lg text-sidebar-foreground/70">
          {subtitle}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function BlockCtaBanner({ content }: { content: Record<string, unknown> }) {
  const title = getStringContent(content, "title", "headline");
  const subtitle = getStringContent(content, "subtitle", "subtext");
  const ctaHref = getStringContent(content, "ctaUrl", "ctaHref");
  const ctaLabel = getStringContent(content, "ctaLabel");
  return (
    <section className="bg-brand/10 border-y border-brand/20 py-10 px-6 text-center">
      {title && (
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      )}
      {ctaLabel && ctaHref && (
        <div className="mt-6">
          <Button asChild variant="default">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function BlockQuickLinks({ content }: { content: Record<string, unknown> }) {
  const links = Array.isArray(content.links)
    ? (content.links as { label: string; href: string }[])
    : [];
  if (links.length === 0) return null;
  return (
    <section className="py-10 px-6 max-w-5xl mx-auto">
      {getStringContent(content, "title") && (
        <h2 className="font-display text-xl font-bold mb-4">{getStringContent(content, "title")}</h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link, i) => (
          <Link key={i} href={link.href}>
            <div className="rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <span className="text-sm font-medium">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BlockRichText({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-10 px-6 max-w-3xl mx-auto">
      {getStringContent(content, "title") && (
        <h2 className="font-display text-xl font-bold mb-4">{getStringContent(content, "title")}</h2>
      )}
      {getStringContent(content, "body") && (
        <div className="prose prose-sm max-w-none text-foreground">
          <p>{getStringContent(content, "body")}</p>
        </div>
      )}
    </section>
  );
}

function BlockCallToAction({ content }: { content: Record<string, unknown> }) {
  const ctaHref = getStringContent(content, "ctaUrl", "ctaHref");
  const ctaLabel = getStringContent(content, "ctaLabel");
  if (!ctaLabel || !ctaHref) return null;
  return (
    <section className="py-10 px-6 text-center">
      {getStringContent(content, "title") && (
        <h2 className="font-display text-xl font-bold mb-4">{getStringContent(content, "title")}</h2>
      )}
      <Button asChild size="lg" variant="brand">
        <Link href={ctaHref}>
          {ctaLabel} <ArrowRight className="ml-1 h-4 w-4"  aria-hidden="true"/>
        </Link>
      </Button>
    </section>
  );
}

function BlockImage({ content }: { content: Record<string, unknown> }) {
  const src = getStringContent(content, "src");
  const caption = getStringContent(content, "caption");
  if (!src) return null;
  return (
    <section className="py-10 px-6 max-w-3xl mx-auto">
      <figure>
        <img
          src={src}
          alt={getStringContent(content, "alt") ?? ""}
          className="rounded-xl w-full object-cover"
        />
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

function BlockSectionEmbed({ content }: { content: Record<string, unknown> }) {
  const href = getStringContent(content, "href");
  const title = getStringContent(content, "title");
  const description = getStringContent(content, "description");
  if (!href) return null;
  return (
    <section className="py-8 px-6 max-w-3xl mx-auto">
      <Link
        href={href}
        className="flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-muted/40 transition-colors group"
      >
        <div>
          {title && (
            <p className="font-semibold text-foreground">{title}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"  aria-hidden="true"/>
      </Link>
    </section>
  );
}

function BlockStats() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: pnrrProjects } = useListPnrrProjects();
  const pnrrProjectCount = asArray(pnrrProjects?.projects).length;
  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          <StatCard title="Atti Pubblicati" value={stats?.acts} loading={statsLoading} href="/albo" icon={FileSearch} />
          <StatCard title="Appalti" value={stats?.contracts} loading={statsLoading} href="/contratti" icon={FileText} />
          <StatCard title="Progetti PNRR" value={pnrrProjectCount} loading={!pnrrProjects} href="/pnrr" icon={Landmark} />
          <StatCard
            title="Valore Monitorato"
            value={stats ? `€ ${(stats.monitoredAmount / 1000000).toFixed(1)}M` : undefined}
            loading={statsLoading}
            href="/statistiche"
            icon={CheckCircle2}
            highlight
          />
        </div>
      </div>
    </section>
  );
}

function BlockThemesGrid({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="border-b border-border bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <span className="eyebrow text-primary mb-2">Accesso rapido</span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            {content.title ? String(content.title) : "Dove vuoi andare?"}
          </h2>
        </div>
        <div className="space-y-10">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const colors = SECTION_COLORS[item.href] ?? { color: "text-primary", bg: "bg-primary/10" };
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover-elevate hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={item.label}
                    >
                      <div className={`rounded-xl p-3 ${colors.bg} transition-transform group-hover:scale-105`}>
                        <Icon className={`h-6 w-6 ${colors.color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-tight text-foreground">
                          {item.label}
                        </div>
                        <div className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground lg:block">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockQuestionsFeatured() {
  const { data: questions, isLoading: questionsLoading } = useListQuestions();

  const { featured, topics } = useMemo(() => {
    const list = asArray<Question>(questions);
    const featured = list.filter((q) => q.featured).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 6);
    const topicMap = new Map<string, Question[]>();
    for (const q of list) {
      const arr = topicMap.get(q.topic);
      if (arr) arr.push(q);
      else topicMap.set(q.topic, [q]);
    }
    const topics = Array.from(topicMap.entries())
      .map(([topic, items]) => ({ topic, count: items.length }))
      .sort((a, b) => a.topic.localeCompare(b.topic, "it"));
    return { featured, topics };
  }, [questions]);

  return (
    <section className="border-b border-border bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow justify-center text-primary">
            <HelpCircle className="h-3.5 w-3.5"  aria-hidden="true"/>
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
                  <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  {t.topic}
                  <span className="text-xs text-muted-foreground tabular-nums">{t.count}</span>
                </Link>
              );
            })}
          </div>
        )}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {questionsLoading
            ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
            : featured.map((q) => <QuestionCard key={q.id} question={q} />)}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/domande">
            <Button variant="brand" size="lg" className="h-12 px-7 font-bold">
              Esplora tutte le domande <ArrowRight className="ml-1 h-4 w-4"  aria-hidden="true"/>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockRecentActivity() {
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <div className="mb-6">
          <span className="eyebrow text-primary mb-2">In tempo reale</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mt-2">Attività Recente</h2>
          <p className="text-muted-foreground mt-1">Ultimi aggiornamenti dalla piattaforma.</p>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activityLoading
                ? Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                : Array.isArray(activity) && activity.length > 0
                ? activity.slice(0, 6).map((item) => <ActivityRow key={item.id} item={item} />)
                : (
                    <div className="p-8 text-center text-muted-foreground">
                      Nessuna attività recente.
                    </div>
                  )}
            </div>
          </CardContent>
          <CardHeader className="p-3 border-t border-border bg-muted/30">
            <Link href="/albo" className="w-full">
              <Button variant="ghost" className="w-full justify-between font-semibold text-muted-foreground hover:text-foreground">
                Vai all'Albo Pretorio <ArrowUpRight className="h-4 w-4"  aria-hidden="true"/>
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}

function BlockConvocazioni() {
  const { data: consiglio, isLoading: consiglioLoading } = useListConvocazioni({ tipo: "consiglio" });
  const { data: commissioni, isLoading: commissioniLoading } = useListConvocazioni({ tipo: "commissione" });
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow text-primary mb-2">Agenda pubblica</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mt-2">Prossime Convocazioni</h2>
            <p className="text-muted-foreground mt-1">Sedute del Consiglio Comunale e delle Commissioni Consiliari.</p>
          </div>
          <Link href="/convocazioni" className="hidden md:flex shrink-0">
            <Button variant="ghost" className="gap-2 font-semibold">
              Vedi tutte <ArrowRight className="h-4 w-4"  aria-hidden="true"/>
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ConvocazioniColumn title="Consiglio Comunale" icon={Users} items={consiglio} loading={consiglioLoading} />
          <ConvocazioniColumn title="Commissioni Consiliari" icon={CalendarClock} items={commissioni} loading={commissioniLoading} />
        </div>
        <Link href="/convocazioni" className="md:hidden block mt-6">
          <Button variant="outline" className="w-full font-semibold">Vedi tutte le convocazioni</Button>
        </Link>
      </div>
    </section>
  );
}

// ---- Block registry --------------------------------------------------------

const BLOCK_RENDERERS: Record<
  string,
  React.ComponentType<{ content: Record<string, unknown> }>
> = {
  hero:                BlockHero,
  cta_banner:          BlockCtaBanner,
  quick_links:         BlockQuickLinks,
  rich_text:           BlockRichText,
  call_to_action:      BlockCallToAction,
  image:               BlockImage,
  section_embed:       BlockSectionEmbed,
  stats:               () => <BlockStats />,
  themes_grid:         BlockThemesGrid,
  questions_featured:  () => <BlockQuestionsFeatured />,
  recent_activity:     () => <BlockRecentActivity />,
  convocazioni:        () => <BlockConvocazioni />,
};

function PublishedBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div className="flex flex-col">
      {blocks.map((block) => {
        const Renderer = BLOCK_RENDERERS[block.blockType];
        if (!Renderer) return null;
        return <Renderer key={block.id} content={block.content} />;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static default layout (shown as fallback when no blocks are published)
// ---------------------------------------------------------------------------

function StaticHomeLayout() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: pnrrProjects } = useListPnrrProjects();
  const { data: questions, isLoading: questionsLoading } = useListQuestions();
  const { data: consiglio, isLoading: consiglioLoading } = useListConvocazioni({ tipo: "consiglio" });
  const { data: commissioni, isLoading: commissioniLoading } = useListConvocazioni({ tipo: "commissione" });
  const pnrrProjectCount = asArray(pnrrProjects?.projects).length;

  const { featured, topics } = useMemo(() => {
    const list = asArray<Question>(questions);
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
      .map(([topic, items]) => ({ topic, count: items.length }))
      .sort((a, b) => a.topic.localeCompare(b.topic, "it"));
    return { featured, topics };
  }, [questions]);

  return (
    <>
      {/* Hero Section */}
      <section data-tour="home-hero" className="relative bg-sidebar text-sidebar-foreground overflow-hidden">
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
            Organizziamo informazioni amministrative di interesse pubblico con un
            approccio documentale e prudente. Nella v0 il percorso principale parte
            dalle convocazioni del Consiglio comunale e dai relativi limiti di verifica.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/convocazioni" className="w-full sm:w-auto">
              <Button variant="brand" size="lg" className="w-full text-base h-12 px-7 font-bold">
                Apri il percorso v0 <ArrowRight className="ml-1 h-4 w-4"  aria-hidden="true"/>
              </Button>
            </Link>
            <Link href="/fonti-dati" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base h-12 px-7 font-bold bg-white/5 text-white border-white/25 hover:bg-white/10"
              >
                <Info className="mr-1 h-4 w-4"  aria-hidden="true"/>
                Fonti e limiti
              </Button>
            </Link>
            <Link href="/segnalazioni" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-base h-12 px-7 font-bold bg-white/5 text-white border-white/25 hover:bg-white/10"
              >
                <Megaphone className="mr-1 h-4 w-4"  aria-hidden="true"/>
                Invia una Segnalazione
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section data-tour="home-stats" className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            <StatCard title="Atti Pubblicati" value={stats?.acts} loading={statsLoading} href="/albo" icon={FileSearch} />
            <StatCard title="Appalti" value={stats?.contracts} loading={statsLoading} href="/contratti" icon={FileText} />
            <StatCard title="Progetti PNRR" value={pnrrProjectCount} loading={!pnrrProjects} href="/pnrr" icon={Landmark} />
            <StatCard
              title="Valore Monitorato"
              value={stats ? `€ ${(stats.monitoredAmount / 1000000).toFixed(1)}M` : undefined}
              loading={statsLoading}
              href="/statistiche"
              icon={CheckCircle2}
              highlight
            />
          </div>
        </div>
      </section>

      {/* Quick Access Grid — grouped by nav category */}
      <section data-tour="home-themes" className="border-b border-border bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10">
            <span className="eyebrow text-primary mb-2">Accesso rapido</span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Dove vuoi andare?
            </h2>
          </div>

          <div className="space-y-10">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const colors = SECTION_COLORS[item.href] ?? { color: "text-primary", bg: "bg-primary/10" };
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover-elevate hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={item.label}
                      >
                        <div className={`rounded-xl p-3 ${colors.bg} transition-transform group-hover:scale-105`}>
                          <Icon className={`h-6 w-6 ${colors.color}`} aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-sm font-bold leading-tight text-foreground">
                            {item.label}
                          </div>
                          <div className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground lg:block">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions Section — Cosa vuoi scoprire? */}
      <section className="border-b border-border bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center text-primary">
              <HelpCircle className="h-3.5 w-3.5"  aria-hidden="true"/>
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
                    <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                    {t.topic}
                    <span className="text-xs text-muted-foreground tabular-nums">{t.count}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {questionsLoading
              ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
              : featured.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/domande">
              <Button variant="brand" size="lg" className="h-12 px-7 font-bold">
                Esplora tutte le domande <ArrowRight className="ml-1 h-4 w-4"  aria-hidden="true"/>
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
                  <span className="eyebrow text-primary mb-2">Agenda pubblica</span>
                  <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mt-2">
                    Prossime Convocazioni
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Sedute del Consiglio Comunale e delle Commissioni Consiliari.
                  </p>
                </div>
                <Link href="/convocazioni" className="hidden md:flex shrink-0">
                  <Button variant="ghost" className="gap-2 font-semibold">
                    Vedi tutte <ArrowRight className="h-4 w-4"  aria-hidden="true"/>
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <ConvocazioniColumn title="Consiglio Comunale" icon={Users} items={consiglio} loading={consiglioLoading} />
                <ConvocazioniColumn title="Commissioni Consiliari" icon={CalendarClock} items={commissioni} loading={commissioniLoading} />
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
                <span className="eyebrow text-primary mb-2">In tempo reale</span>
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
                    ) : Array.isArray(activity) && activity.length > 0 ? (
                      activity.slice(0, 6).map((item) => <ActivityRow key={item.id} item={item} />)
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
                      Vai all'Albo Pretorio <ArrowUpRight className="h-4 w-4"  aria-hidden="true"/>
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
          <Megaphone className="h-12 w-12 mx-auto mb-6"  aria-hidden="true"/>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Hai notato una criticità da verificare?
          </h2>
          <p className="text-brand-foreground/85 text-lg mb-8 text-balance">
            La trasparenza si costruisce insieme. Segnala lavori interrotti, documentazione mancante o
            possibili incoerenze documentali. Il nostro team verificherà la segnalazione.
          </p>
          <Link href="/segnalazioni">
            <Button size="lg" variant="secondary" className="text-base h-12 px-8 font-bold">
              Invia una Segnalazione <ArrowRight className="ml-1 h-4 w-4"  aria-hidden="true"/>
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}


function V0PublicPathBanner() {
  return (
    <section className="border-b border-brand/20 bg-brand/5 py-6" aria-labelledby="v0-public-path-title">
      <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="max-w-3xl">
          <span className="eyebrow text-primary">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            Percorso pubblico minimo v0
          </span>
          <h2 id="v0-public-path-title" className="mt-2 font-display text-2xl font-bold tracking-tight">
            Il primo output civico consultabile sono le convocazioni del Consiglio comunale.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Segui il percorso Home → Convocazioni → scheda seduta → fonti e limiti.
            Dove mancano dati verificati, eventuali esempi sono dichiarati come fixture
            dimostrative e non come informazioni ufficiali complete.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
          <Button asChild>
            <Link href="/convocazioni">Vai alle convocazioni</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/fonti-dati">Fonti e limiti</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Home page entry point
// ---------------------------------------------------------------------------

export function Home() {
  const { data: publishedBlocksData, isLoading: blocksLoading } = usePublishedBlocks("home");
  const publishedBlocks = asArray<PageBlock>(publishedBlocksData);

  // While loading we render nothing (avoids layout flash between states).
  // The static layout will show immediately on next visit thanks to staleTime.
  if (blocksLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-[28rem] bg-sidebar animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageMeta
        title="Home — osservatorio civico su atti, appalti e PNRR"
        description="Osservatorio civico indipendente per consultare atti, contratti, delibere, convocazioni, open data e progetti PNRR del Comune di Lamezia Terme."
        path="/"
      />
      <V0PublicPathBanner />
      {publishedBlocks.length > 0
        ? <PublishedBlocks blocks={publishedBlocks} />
        : <StaticHomeLayout />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function ConvocazioniColumn({
  title,
  icon: Icon,
  items,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  items: { id: number; oggetto: string; dataAtto?: string | null; pubStart?: string | null }[] | undefined;
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2.5 space-y-0 border-b border-border bg-muted/30 py-3.5">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
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
              <Link key={c.id} href={`/convocazioni/${c.id}`} className="block p-4 hover-elevate transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand mb-1.5">
                  <Calendar className="h-3.5 w-3.5"  aria-hidden="true"/>
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
    <Link href={href} className={`relative block p-6 md:p-8 transition-colors hover-elevate ${highlight ? "bg-primary/5" : ""}`}>
      {highlight && <span className="absolute left-0 top-0 h-full w-1 bg-brand" />}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${highlight ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
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
    </Link>
  );
}

function ActivityRow({ item }: { item: any }) {
  const getHref = () => {
    switch (item.type) {
      case "act": return "/albo";
      case "contract": {
        const numericId = String(item.id).replace(/^contract-/, "");
        return `/contratti/${numericId}`;
      }
      case "report": return "/segnalazioni";
      default: return "/statistiche";
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case "act": return <FileSearch className="h-4 w-4"  aria-hidden="true"/>;
      case "contract": return <FileText className="h-4 w-4"  aria-hidden="true"/>;
      case "report": return <AlertTriangle className="h-4 w-4"  aria-hidden="true"/>;
      default: return <Info className="h-4 w-4"  aria-hidden="true"/>;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case "act": return "Nuovo Atto";
      case "contract": return "Nuovo Appalto";
      case "report": return "Nuova Segnalazione";
      default: return "Aggiornamento";
    }
  };

  return (
    <Link href={getHref()} className="block p-4 flex gap-4 hover-elevate transition-colors group">
      <div className="mt-0.5 bg-background border border-border p-2 rounded-full h-9 w-9 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-brand group-hover:border-brand/40 transition-colors">
        {getIcon()}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{getLabel()}</span>
          <span className="text-[10px] text-muted-foreground/60">•</span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(item.date), "dd MMM", { locale: it })}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug line-clamp-2">{item.title}</p>
      </div>
    </Link>
  );
}
