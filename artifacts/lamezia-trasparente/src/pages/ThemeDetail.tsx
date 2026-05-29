import { useParams, Link } from "wouter";
import { 
  useGetTheme, 
  useMarkThemeRelevant, 
  useShareTheme,
  getGetThemeQueryKey
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  BookOpen, 
  Info, 
  TrendingUp, 
  ShieldAlert, 
  HandCoins, 
  Share2, 
  Calendar, 
  FileText, 
  Mail, 
  BarChart3, 
  FileSearch,
  ExternalLink,
  ChevronLeft,
  Facebook,
  Twitter,
  MessageCircle,
  Link as LinkIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
  aperto: { label: "Aperto", variant: "destructive", icon: AlertTriangle },
  in_corso: { label: "In Corso", variant: "default", icon: TrendingUp },
  monitoraggio: { label: "In Monitoraggio", variant: "secondary", icon: BookOpen },
  chiuso: { label: "Risolto/Chiuso", variant: "outline", icon: ShieldAlert },
};

export function ThemeDetail() {
  const { id } = useParams();
  const themeId = id ? parseInt(id, 10) : 0;
  
  const queryClient = useQueryClient();
  const { data: theme, isLoading, error } = useGetTheme(themeId, { 
    query: { enabled: !!themeId, queryKey: getGetThemeQueryKey(themeId) } 
  });
  
  const markRelevant = useMarkThemeRelevant();
  const shareTheme = useShareTheme();

  const handleRelevant = () => {
    if (!theme) return;
    markRelevant.mutate({ id: themeId }, {
      onSuccess: () => {
        toast.success("Segnato come rilevante", {
          description: "Il tuo interesse aiuta a stabilire le priorità civiche."
        });
        queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });
      },
      onError: () => {
        toast.error("Errore", { description: "Non è stato possibile segnare il tema." });
      }
    });
  };

  const handleShare = (channel: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link') => {
    if (!theme) return;
    shareTheme.mutate({ id: themeId, data: { channel } }, {
      onSuccess: () => {
        toast.success("Condiviso con successo!");
        queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });
      }
    });
    
    // In a real app, actually open the share dialog
    const url = window.location.href;
    if (channel === 'link') {
      navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-12 w-3/4 max-w-3xl" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <Skeleton className="h-6 w-5/6 max-w-2xl" />
        <div className="flex gap-4 mt-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-px w-full my-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tema non trovato</h1>
        <p className="text-muted-foreground mb-6">Il tema richiesto non esiste o è stato rimosso.</p>
        <Link href="/temi">
          <Button>Torna ai Temi</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = statusMap[theme.status] || { label: theme.status, variant: "outline", icon: Info };
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/temi" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Torna ai Temi
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider bg-muted/30">
              {theme.categoryName}
            </Badge>
            <Badge variant={statusInfo.variant as any} className="gap-1.5 shadow-none px-3 py-1">
              <StatusIcon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] text-foreground">
            {theme.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Ultimo agg. {format(new Date(theme.updatedAt), 'dd MMMM yyyy', { locale: it })}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <HandCoins className="h-4 w-4" />
              {theme.relevanceCount} rilevante
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              {theme.shareCount} condivisioni
            </div>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
            {theme.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-80 shrink-0 space-y-4 sticky top-24">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg">Sostieni il Monitoraggio</CardTitle>
              <CardDescription>Più cittadini partecipano, maggiore è la pressione civica.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Button 
                onClick={handleRelevant} 
                disabled={markRelevant.isPending}
                className="w-full gap-2 h-12 text-base font-semibold"
              >
                <HandCoins className="h-5 w-5" />
                Segna come Rilevante
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <Share2 className="h-4 w-4" />
                    Condividi
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2 cursor-pointer">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')} className="gap-2 cursor-pointer">
                    <Twitter className="h-4 w-4 text-sky-500" /> Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="gap-2 cursor-pointer">
                    <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  <DropdownMenuItem onClick={() => handleShare('link')} className="gap-2 cursor-pointer">
                    <LinkIcon className="h-4 w-4" /> Copia Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
          
          {theme.metrics && theme.metrics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Dati Chiave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {theme.metrics.map(metric => (
                  <div key={metric.id}>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-2xl font-serif font-bold text-foreground">
                      {metric.value} <span className="text-base font-sans text-muted-foreground ml-1">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div className="max-w-5xl">
        <Tabs defaultValue="docs" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2">
              <FileText className="h-4 w-4" /> Documenti ({theme.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="acts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2">
              <FileSearch className="h-4 w-4" /> Atti Albo ({theme.acts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2">
              <BookOpen className="h-4 w-4" /> Appalti ({theme.contracts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2">
              <Mail className="h-4 w-4" /> Carteggio ({theme.emails?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="docs" className="space-y-4 mt-0 outline-none">
            {theme.documents?.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {theme.documents.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground line-clamp-2 mb-1">{doc.title}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span className="bg-muted px-2 py-0.5 rounded uppercase font-mono">{doc.type}</span>
                          <span>{format(new Date(doc.date), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      {doc.url && (
                        <Button variant="ghost" size="icon" className="shrink-0" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileText} text="Nessun documento disponibile per questo tema." />
            )}
          </TabsContent>
          
          <TabsContent value="acts" className="space-y-4 mt-0 outline-none">
            {theme.acts?.length > 0 ? (
              <div className="space-y-4">
                {theme.acts.map(act => (
                  <Card key={act.id}>
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">{act.type}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">Atto N. {act.number}</span>
                        </div>
                        <h4 className="font-medium text-lg leading-tight mb-2">{act.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{act.summary}</p>
                      </div>
                      <div className="shrink-0 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-xs text-muted-foreground font-mono mb-1">Pubblicazione</div>
                        <div className="font-medium">{format(new Date(act.publishDate), 'dd MMM yyyy', { locale: it })}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileSearch} text="Nessun atto dell'albo pretorio collegato." />
            )}
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4 mt-0 outline-none">
            {theme.contracts?.length > 0 ? (
              <div className="space-y-4">
                {theme.contracts.map(contract => (
                  <Card key={contract.id}>
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-6 sm:items-center">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-lg leading-tight mb-2">{contract.title}</h4>
                        <div className="text-sm text-muted-foreground mb-3">{contract.description}</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">{contract.procedureType}</Badge>
                          <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md border text-muted-foreground">
                            <strong>Fornitore:</strong> {contract.supplier}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 sm:text-right bg-muted/20 p-4 rounded-lg border">
                        <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Importo</div>
                        <div className="text-2xl font-serif font-bold text-foreground mb-2">
                          € {contract.amount.toLocaleString('it-IT')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Aggiudicato: {format(new Date(contract.awardDate), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={BookOpen} text="Nessun appalto pubblico collegato a questo tema." />
            )}
          </TabsContent>

          <TabsContent value="emails" className="space-y-4 mt-0 outline-none">
            {theme.emails?.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-8 py-4">
                {theme.emails.map((email, i) => (
                  <div key={email.id} className="relative">
                    <div className={`absolute -left-[35px] top-1 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center
                      ${email.direction === 'inviata' ? 'bg-primary' : 'bg-secondary-foreground'}
                    `}></div>
                    <Card className={email.direction === 'inviata' ? 'border-primary/20' : ''}>
                      <CardHeader className={`p-4 pb-2 ${email.direction === 'inviata' ? 'bg-primary/5' : 'bg-muted/30'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Badge variant="outline" className="mb-2 uppercase text-[10px] font-mono">
                              {email.direction === 'inviata' ? 'Inviata (Civica)' : 'Ricevuta (Comune)'}
                            </Badge>
                            <CardTitle className="text-base">{email.subject}</CardTitle>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono shrink-0 whitespace-nowrap">
                            {format(new Date(email.date), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium text-foreground">Da:</span> {email.sender} <br/>
                          <span className="font-medium text-foreground">A:</span> {email.recipient}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-3 border-t bg-card">
                        <div className="text-sm whitespace-pre-wrap font-serif leading-relaxed text-card-foreground/90">
                          {email.body}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Mail} text="Nessuna corrispondenza o PEC registrata per questo tema." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
      <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
