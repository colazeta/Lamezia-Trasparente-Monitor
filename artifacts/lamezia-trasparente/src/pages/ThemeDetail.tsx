import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetTheme, 
  useMarkThemeRelevant, 
  useWithdrawThemeRelevant,
  useShareTheme,
  useFollowTheme,
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
  Bell,
  Users,
  Link as LinkIcon,
  History
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import { resolvePostImageSrc } from "@/lib/postImages";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "brand" | "success" | "warning", icon: any }> = {
  aperto: { label: "Aperto", variant: "destructive", icon: AlertTriangle },
  in_corso: { label: "In Corso", variant: "brand", icon: TrendingUp },
  monitoraggio: { label: "In Monitoraggio", variant: "warning", icon: BookOpen },
  chiuso: { label: "Risolto/Chiuso", variant: "success", icon: ShieldAlert },
};

export function ThemeDetail() {
  const { id } = useParams();
  const themeId = id ? parseInt(id, 10) : 0;
  
  const queryClient = useQueryClient();
  const { data: theme, isLoading, error } = useGetTheme(themeId, { 
    query: { enabled: !!themeId, queryKey: getGetThemeQueryKey(themeId) } 
  });
  
  const markRelevant = useMarkThemeRelevant();
  const withdrawRelevant = useWithdrawThemeRelevant();
  const shareTheme = useShareTheme();
  const followTheme = useFollowTheme();
  const relevantPending = markRelevant.isPending || withdrawRelevant.isPending;

  const [followEmail, setFollowEmail] = useState("");
  const [followed, setFollowed] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const handleFollow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;
    const email = followEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email non valida", { description: "Inserisci un indirizzo email corretto." });
      return;
    }
    followTheme.mutate({ id: themeId, data: { email } }, {
      onSuccess: () => {
        setFollowed(true);
        setFollowEmail("");
        toast.success("Iscrizione confermata", {
          description: "Riceverai un'email ad ogni aggiornamento di questo tema."
        });
        queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });
      },
      onError: () => {
        toast.error("Errore", { description: "Non è stato possibile completare l'iscrizione." });
      }
    });
  };

  const invalidateTheme = () =>
    queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });

  const handleRelevant = () => {
    if (!theme) return;

    if (theme.signalled) {
      setConfirmWithdraw(true);
      return;
    }

    markRelevant.mutate({ id: themeId }, {
      onSuccess: () => {
        toast.success("Segnato come rilevante", {
          description: "Il tuo interesse aiuta a stabilire le priorità civiche."
        });
        invalidateTheme();
      },
      onError: () => {
        toast.error("Errore", { description: "Non è stato possibile segnare il tema." });
      }
    });
  };

  const performWithdraw = () => {
    withdrawRelevant.mutate({ id: themeId }, {
      onSuccess: () => {
        toast.success("Segnale ritirato", {
          description: "Hai ritirato il tuo segnale di rilevanza per questo tema."
        });
        invalidateTheme();
      },
      onError: () => {
        toast.error("Errore", { description: "Non è stato possibile ritirare il segnale." });
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
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-4 w-28 mb-6" />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-5">
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </div>
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">Tema non trovato</h1>
          <p className="text-muted-foreground mb-6">Il tema richiesto non esiste o è stato rimosso.</p>
          <Link href="/temi">
            <Button variant="brand">Torna ai Temi</Button>
          </Link>
        </div>
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
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider bg-muted/40">
                  {theme.categoryName}
                </Badge>
                <Badge variant={statusInfo.variant as any} className="gap-1.5 shadow-none px-3 py-1">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusInfo.label}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.1] text-foreground">
                {theme.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Ultimo agg. {format(new Date(theme.updatedAt), 'dd MMMM yyyy', { locale: it })}
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <HandCoins className="h-4 w-4 text-brand" />
                  <span className="tabular-nums">{theme.relevanceCount}</span> rilevante
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Share2 className="h-4 w-4" />
                  <span className="tabular-nums">{theme.shareCount}</span> condivisioni
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="tabular-nums">{theme.followerCount}</span> follower
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
            {theme.description.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-80 shrink-0 space-y-4 sticky top-24">
          <Card className="border-brand/30 shadow-md">
            <CardHeader className="bg-brand/5 pb-4">
              <CardTitle className="text-lg font-display">Sostieni il Monitoraggio</CardTitle>
              <CardDescription>Più cittadini partecipano, maggiore è la pressione civica.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Button 
                onClick={handleRelevant} 
                disabled={relevantPending}
                variant={theme.signalled ? "outline" : "brand"}
                className="w-full gap-2 h-12 text-base font-semibold"
                aria-pressed={theme.signalled}
              >
                <HandCoins className={`h-5 w-5 ${theme.signalled ? "fill-current" : ""}`} />
                {theme.signalled ? "Ritira Rilevanza" : "Segna come Rilevante"}
              </Button>

              <AlertDialog open={confirmWithdraw} onOpenChange={setConfirmWithdraw}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ritirare il segnale di rilevanza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Stai per ritirare il tuo segnale di rilevanza per “{theme.title}”. Puoi sempre
                      segnarlo di nuovo come rilevante in seguito.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={withdrawRelevant.isPending}>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={withdrawRelevant.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        performWithdraw();
                      }}
                    >
                      Ritira segnale
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12">
                    <Share2 className="h-4 w-4" />
                    Condividi
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2 cursor-pointer">
                    <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')} className="gap-2 cursor-pointer">
                    <Twitter className="h-4 w-4 text-muted-foreground" /> Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="gap-2 cursor-pointer">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" /> WhatsApp
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  <DropdownMenuItem onClick={() => handleShare('link')} className="gap-2 cursor-pointer">
                    <LinkIcon className="h-4 w-4" /> Copia Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Segui questo tema
              </CardTitle>
              <CardDescription>
                Ricevi un'email quando vengono aggiunti nuovi documenti, atti o corrispondenza.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followed ? (
                <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-3 text-sm">
                  <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Iscrizione attiva. Ti avviseremo via email ad ogni aggiornamento.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFollow} className="space-y-3">
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder="La tua email"
                    value={followEmail}
                    onChange={(e) => setFollowEmail(e.target.value)}
                    aria-label="Indirizzo email per seguire il tema"
                    required
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={followTheme.isPending}
                    className="w-full gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    {followTheme.isPending ? "Iscrizione…" : "Seguimi via email"}
                  </Button>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {theme.followerCount} cittadini seguono questo tema
                  </p>
                </form>
              )}
              <Separator className="my-4" />
              <FeedSubscribeButton
                feedPath={`/feeds/temi/${themeId}.xml`}
                title={`Tema: ${theme.title} — Lamezia Trasparente`}
                label="Abbonati al feed RSS"
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
              />
            </CardContent>
          </Card>
          
          {theme.metrics && theme.metrics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" /> Dati Chiave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {theme.metrics.map(metric => (
                  <div key={metric.id}>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-2xl font-display font-bold tabular-nums text-foreground">
                      {metric.value} <span className="text-base font-sans font-normal text-muted-foreground ml-1">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div className="max-w-5xl">
        <Tabs defaultValue="cronistoria" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="cronistoria" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent font-display px-4 py-3 gap-2">
              <History className="h-4 w-4" /> Cronistoria ({theme.posts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent font-display px-4 py-3 gap-2">
              <FileText className="h-4 w-4" /> Documenti ({theme.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="acts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent font-display px-4 py-3 gap-2">
              <FileSearch className="h-4 w-4" /> Atti Albo ({theme.acts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent font-display px-4 py-3 gap-2">
              <BookOpen className="h-4 w-4" /> Appalti ({theme.contracts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent font-display px-4 py-3 gap-2">
              <Mail className="h-4 w-4" /> Carteggio ({theme.emails?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cronistoria" className="mt-0 outline-none">
            {theme.posts?.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-8 py-4">
                {theme.posts.map(post => (
                  <div key={post.id} className="relative">
                    <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-full border-4 border-background bg-primary flex items-center justify-center"></div>
                    <Card className="border-primary/20">
                      <CardHeader className="p-4 pb-3 bg-primary/5">
                        <div className="flex items-center gap-1.5 text-xs text-primary font-mono uppercase tracking-wider mb-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(post.eventDate), 'dd MMMM yyyy', { locale: it })}
                        </div>
                        {post.title && (
                          <CardTitle className="text-lg font-serif leading-tight">{post.title}</CardTitle>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-3 border-t">
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-a:text-primary leading-relaxed">
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" />
                              ),
                              img: ({ node, src, alt, ...props }) => {
                                const resolved = resolvePostImageSrc(src);
                                if (!resolved) return null;
                                return (
                                  <img
                                    {...props}
                                    src={resolved}
                                    alt={typeof alt === "string" ? alt : ""}
                                    loading="lazy"
                                    className="rounded-lg border border-border my-4 max-w-full h-auto mx-auto"
                                  />
                                );
                              },
                            }}
                          >
                            {post.body}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={History} text="Nessuna cronistoria pubblicata per questo tema. Gli aggiornamenti narrativi appariranno qui." />
            )}
          </TabsContent>

          <TabsContent value="docs" className="space-y-4 mt-0 outline-none">
            {theme.documents?.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {theme.documents.map(doc => (
                  <Card key={doc.id} className="group transition-all hover-elevate hover:shadow-lg hover:border-brand/40">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <div className="bg-brand/10 p-3 rounded-lg text-brand shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-brand transition-colors">{doc.title}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span className="bg-muted px-2 py-0.5 rounded uppercase font-mono">{doc.type}</span>
                          <span className="font-mono">{format(new Date(doc.date), 'dd/MM/yyyy')}</span>
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
                  <Card key={act.id} className="transition-all hover-elevate hover:border-brand/40">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">{act.type}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">Atto N. {act.number}</span>
                        </div>
                        <h4 className="font-display font-bold text-lg leading-tight mb-2">{act.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{act.summary}</p>
                      </div>
                      <div className="shrink-0 sm:text-right border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                        <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Pubblicazione</div>
                        <div className="font-medium font-mono">{format(new Date(act.publishDate), 'dd MMM yyyy', { locale: it })}</div>
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
                  <Card key={contract.id} className="transition-all hover-elevate hover:border-brand/40">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-6 sm:items-center">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-lg leading-tight mb-2">{contract.title}</h4>
                        <div className="text-sm text-muted-foreground mb-3">{contract.description}</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary">{contract.procedureType}</Badge>
                          <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md border border-border text-muted-foreground">
                            <strong className="text-foreground">Fornitore:</strong> {contract.supplier}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 sm:text-right bg-brand/5 p-4 rounded-lg border border-brand/20">
                        <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Importo</div>
                        <div className="text-2xl font-display font-bold tabular-nums text-brand mb-2">
                          € {contract.amount.toLocaleString('it-IT')}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
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
              <div className="relative border-l-2 border-border ml-3 pl-6 space-y-8 py-4">
                {theme.emails.map((email, i) => (
                  <div key={email.id} className="relative">
                    <div className={`absolute -left-[35px] top-1 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center
                      ${email.direction === 'inviata' ? 'bg-brand' : 'bg-primary'}
                    `}></div>
                    <Card className={email.direction === 'inviata' ? 'border-brand/30' : ''}>
                      <CardHeader className={`p-4 pb-2 ${email.direction === 'inviata' ? 'bg-brand/5' : 'bg-muted/30'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Badge variant={email.direction === 'inviata' ? 'brand' : 'outline'} className="mb-2 uppercase text-[10px] font-mono">
                              {email.direction === 'inviata' ? 'Inviata (Civica)' : 'Ricevuta (Comune)'}
                            </Badge>
                            <CardTitle className="text-base font-display">{email.subject}</CardTitle>
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
                      <CardContent className="p-4 pt-3 border-t border-border bg-card">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed text-card-foreground/90">
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
    <div className="flex flex-col items-center text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-muted-foreground max-w-sm">{text}</p>
    </div>
  );
}
