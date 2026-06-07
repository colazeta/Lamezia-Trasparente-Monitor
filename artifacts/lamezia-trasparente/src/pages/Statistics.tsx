import { 
  useGetStatsOverview, 
  useGetTopThemes, 
  useGetShareStats, 
  useGetRecentActivity,
  useGetPublicationsTimeline
} from "@workspace/api-client-react";
import { BarChart3, TrendingUp, HandCoins, Share2, Activity, PieChart, Users, FileClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TIMELINE_DAYS = 90;

export function Statistics() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: topThemes, isLoading: themesLoading } = useGetTopThemes();
  const { data: shareStats, isLoading: shareLoading } = useGetShareStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: timeline, isLoading: timelineLoading } = useGetPublicationsTimeline({
    days: TIMELINE_DAYS,
  });

  const timelineData = (timeline?.points ?? []).map((p) => ({
    day: p.day,
    count: p.count,
    label: format(parseISO(p.day), "dd MMM", { locale: it }),
  }));
  const timelineTotal = timelineData.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          Osservatorio in cifre
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Dati & Statistiche
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Quadro riassuntivo dell'attività dell'osservatorio civico e del coinvolgimento della cittadinanza.
        </p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Totale Rilevanze" 
          value={stats?.totalRelevance} 
          loading={statsLoading} 
          icon={HandCoins}
          desc="Voti civici espressi"
        />
        <KpiCard 
          title="Condivisioni" 
          value={stats?.totalShares} 
          loading={statsLoading} 
          icon={Share2}
          desc="Volano di informazione"
        />
        <KpiCard 
          title="Appalti Monitorati" 
          value={stats?.contracts} 
          loading={statsLoading} 
          icon={PieChart}
          desc="Contratti nel database"
        />
        <KpiCard 
          title="Valore Sotto Lente" 
          value={stats ? `€ ${(stats.monitoredAmount / 1000000).toFixed(2)}M` : undefined} 
          loading={statsLoading} 
          icon={TrendingUp}
          desc="Soldi pubblici seguiti"
          highlight
        />
      </div>

      {/* Publications timeline */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="border-b border-border bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-tight">
                <FileClock className="h-5 w-5 text-brand" aria-hidden="true" /> Atti pubblicati all'Albo
                Pretorio
              </CardTitle>
              <CardDescription>
                Andamento delle pubblicazioni negli ultimi {TIMELINE_DAYS} giorni
              </CardDescription>
            </div>
            {!timelineLoading && (
              <div className="text-right">
                <div className="text-2xl font-display font-bold tabular-nums text-brand">
                  {timelineTotal}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  atti nel periodo
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {timelineLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : timelineData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="alboTimeline" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={32}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${value}`, "Atti pubblicati"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#alboTimeline)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-12">
              Nessuna pubblicazione registrata nel periodo selezionato.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Rankings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top by Relevance */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-tight">
                <HandCoins className="h-5 w-5 text-brand" aria-hidden="true" /> Temi Più Rilevanti per i Cittadini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {themesLoading ? (
                  Array(5).fill(0).map((_, i) => <RankRowSkeleton key={i} />)
                ) : topThemes?.byRelevance.map((theme, i) => (
                  <div key={theme.id} className="flex items-center p-4 gap-4 hover-elevate transition-colors">
                    <div className="font-display font-bold text-2xl tabular-nums text-muted-foreground/40 w-6 text-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{theme.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-2">
                        <span>{theme.categoryName}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" aria-hidden="true" /> {theme.followerCount} follower
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-display font-bold tabular-nums text-brand">{theme.relevanceCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Voti</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top by Shares */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-tight">
                <Share2 className="h-5 w-5 text-primary" aria-hidden="true" /> Temi Più Condivisi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {themesLoading ? (
                  Array(5).fill(0).map((_, i) => <RankRowSkeleton key={i} />)
                ) : topThemes?.byShares.map((theme, i) => (
                  <div key={theme.id} className="flex items-center p-4 gap-4 hover-elevate transition-colors">
                    <div className="font-display font-bold text-2xl tabular-nums text-muted-foreground/40 w-6 text-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{theme.title}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-display font-bold tabular-nums text-primary">{theme.shareCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Share</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Distributions & Feed */}
        <div className="space-y-8">
          
          {/* Share Channels */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-display font-bold tracking-tight">Canali di Diffusione</CardTitle>
              <CardDescription>Come circolano le informazioni</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {shareLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : shareStats && shareStats.length > 0 ? (
                <div className="space-y-4">
                  {shareStats.map((stat, i) => (
                    <div key={stat.channel}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="capitalize font-medium">{stat.channel}</span>
                        <span className="text-muted-foreground font-display font-bold tabular-nums">{stat.count}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(stat.count / Math.max(...shareStats.map(s => s.count))) * 100}%`,
                            backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">Nessun dato disponibile</div>
              )}
            </CardContent>
          </Card>

          {/* Mini Activity Feed */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="text-base flex items-center gap-2 font-display font-bold tracking-tight">
                <Activity className="h-4 w-4 text-brand" aria-hidden="true" /> Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border text-sm">
                {activityLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                ) : activity?.slice(0, 8).map(item => (
                  <div key={item.id} className="p-4 hover-elevate transition-colors">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      {format(new Date(item.date), 'dd MMM', { locale: it })} • {item.type}
                    </div>
                    <div className="font-medium line-clamp-2 leading-snug">{item.title}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, loading, icon: Icon, desc, highlight = false }: any) {
  return (
    <Card className={`relative overflow-hidden ${highlight ? 'border-brand/40 bg-brand/5' : ''}`}>
      {highlight && <span className="absolute left-0 top-0 h-full w-1 bg-brand" />}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="eyebrow text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className={`text-3xl font-display font-bold tracking-tight tabular-nums ${highlight ? 'text-brand' : 'text-foreground'}`}>
                {value || 0}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${highlight ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{desc}</p>
      </CardContent>
    </Card>
  );
}

function RankRowSkeleton() {
  return (
    <div className="flex items-center p-4 gap-4">
      <Skeleton className="h-8 w-6" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-6 w-12 ml-auto" />
        <Skeleton className="h-3 w-8 ml-auto" />
      </div>
    </div>
  );
}
