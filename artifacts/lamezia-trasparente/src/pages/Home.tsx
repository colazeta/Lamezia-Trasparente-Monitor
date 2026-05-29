import { Link } from "wouter";
import { 
  useGetStatsOverview, 
  useGetTopThemes, 
  useGetRecentActivity,
  getGetStatsOverviewQueryKey,
  getGetTopThemesQueryKey,
  getGetRecentActivityQueryKey
} from "@workspace/api-client-react";
import { ShieldAlert, ArrowRight, Eye, FileText, Megaphone, CheckCircle2, AlertTriangle, FileSearch, ArrowUpRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeCard, ThemeCardSkeleton } from "@/components/theme/ThemeCard";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: topThemes, isLoading: topThemesLoading } = useGetTopThemes();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-sidebar border-b border-sidebar-border text-sidebar-foreground overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar to-transparent opacity-80 pointer-events-none"></div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Osservatorio Civico Indipendente
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            La trasparenza è un diritto.<br className="hidden md:inline" />
            <span className="text-primary">Il controllo è un dovere.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-sidebar-foreground/80 mb-10 max-w-2xl text-balance">
            Monitoriamo gli atti, gli appalti e le decisioni del Comune di Lamezia Terme. 
            Uno strumento fatto dai cittadini, per i cittadini, per pretendere chiarezza sull'uso delle risorse pubbliche.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/temi" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base h-12 px-8">
                Esplora i Temi <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/segnalazioni" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base h-12 px-8 bg-sidebar-foreground/5 text-white border-sidebar-foreground/20 hover:bg-sidebar-foreground/10 hover:text-white">
                Invia una Segnalazione
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard 
              title="Temi Monitorati" 
              value={stats?.themes} 
              loading={statsLoading} 
              icon={Eye} 
            />
            <StatCard 
              title="Appalti" 
              value={stats?.contracts} 
              loading={statsLoading} 
              icon={FileText} 
            />
            <StatCard 
              title="Atti Analizzati" 
              value={stats?.acts} 
              loading={statsLoading} 
              icon={FileSearch} 
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

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Top Themes */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Temi in Evidenza</h2>
                  <p className="text-muted-foreground">Le questioni di maggiore rilevanza pubblica al momento.</p>
                </div>
                <Link href="/temi" className="hidden md:flex">
                  <Button variant="ghost" className="gap-2">
                    Vedi tutti <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {topThemesLoading ? (
                  Array(4).fill(0).map((_, i) => <ThemeCardSkeleton key={i} />)
                ) : (
                  topThemes?.byRelevance.slice(0, 4).map(theme => (
                    <ThemeCard key={theme.id} theme={theme} />
                  ))
                )}
              </div>
              
              <Link href="/temi" className="md:hidden block mt-6">
                <Button variant="outline" className="w-full">
                  Vedi tutti i temi
                </Button>
              </Link>
            </div>

            {/* Sidebar Activity */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Attività Recente</h2>
                <p className="text-muted-foreground">Ultimi aggiornamenti dalla piattaforma.</p>
              </div>

              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y">
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
                <CardHeader className="p-4 border-t bg-muted/10">
                  <Link href="/albo" className="w-full">
                    <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
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
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <Megaphone className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Hai notato un'anomalia?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 text-balance">
            La trasparenza si costruisce insieme. Segnala lavori interrotti, bandi sospetti o sprechi di denaro pubblico. Il nostro team verificherà la segnalazione.
          </p>
          <Link href="/segnalazioni">
            <Button size="lg" variant="secondary" className="text-base h-12 px-8 font-semibold">
              Invia una Segnalazione
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, loading, icon: Icon, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-xl border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50 shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className={`text-3xl font-serif font-bold tracking-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value || 0}
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
      case 'theme': return <Eye className="h-4 w-4" />;
      case 'report': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case 'act': return 'Nuovo Atto';
      case 'contract': return 'Nuovo Appalto';
      case 'theme': return 'Aggiornamento Tema';
      case 'report': return 'Nuova Segnalazione';
      default: return 'Aggiornamento';
    }
  };

  return (
    <div className="p-4 flex gap-4 hover:bg-muted/30 transition-colors group">
      <div className="mt-0.5 bg-background border shadow-sm p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
        {getIcon()}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
            {getLabel()}
          </span>
          <span className="text-[10px] text-muted-foreground/60">•</span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(item.date), 'dd MMM', { locale: it })}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {item.themeId ? (
            <Link href={`/temi/${item.themeId}`} className="hover:text-primary hover:underline">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </p>
      </div>
    </div>
  );
}
