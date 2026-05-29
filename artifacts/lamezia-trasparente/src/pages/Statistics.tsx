import { 
  useGetStatsOverview, 
  useGetTopThemes, 
  useGetShareStats, 
  useGetRecentActivity 
} from "@workspace/api-client-react";
import { BarChart3, TrendingUp, HandCoins, Share2, Activity, PieChart, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function Statistics() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: topThemes, isLoading: themesLoading } = useGetTopThemes();
  const { data: shareStats, isLoading: shareLoading } = useGetShareStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-muted/10 min-h-screen">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Dati & Statistiche
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
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
          primary
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Rankings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top by Relevance */}
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-primary" /> Temi Più Rilevanti per i Cittadini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {themesLoading ? (
                  Array(5).fill(0).map((_, i) => <RankRowSkeleton key={i} />)
                ) : topThemes?.byRelevance.map((theme, i) => (
                  <div key={theme.id} className="flex items-center p-4 gap-4 hover:bg-muted/10 transition-colors">
                    <div className="font-serif font-bold text-2xl text-muted-foreground/40 w-6 text-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{theme.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {theme.categoryName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-primary">{theme.relevanceCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Voti</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top by Shares */}
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-secondary-foreground" /> Temi Più Condivisi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {themesLoading ? (
                  Array(5).fill(0).map((_, i) => <RankRowSkeleton key={i} />)
                ) : topThemes?.byShares.map((theme, i) => (
                  <div key={theme.id} className="flex items-center p-4 gap-4 hover:bg-muted/10 transition-colors">
                    <div className="font-serif font-bold text-2xl text-muted-foreground/40 w-6 text-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{theme.title}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-secondary-foreground">{theme.shareCount}</div>
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
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Canali di Diffusione</CardTitle>
              <CardDescription>Come circolano le informazioni</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {shareLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : shareStats && shareStats.length > 0 ? (
                <div className="space-y-4">
                  {shareStats.map(stat => (
                    <div key={stat.channel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{stat.channel}</span>
                        <span className="text-muted-foreground font-mono">{stat.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(stat.count / Math.max(...shareStats.map(s => s.count))) * 100}%` }}
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
          <Card>
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" /> Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-sm">
                {activityLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                ) : activity?.slice(0, 8).map(item => (
                  <div key={item.id} className="p-4 hover:bg-muted/10">
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

function KpiCard({ title, value, loading, icon: Icon, desc, primary = false }: any) {
  return (
    <Card className={primary ? 'border-primary shadow-sm bg-primary/5' : 'shadow-sm'}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className={`text-3xl font-serif font-bold tracking-tight ${primary ? 'text-primary' : 'text-foreground'}`}>
                {value || 0}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-md ${primary ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-5 w-5" />
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
