import { Link } from "wouter";
import {
  BookOpen,
  Bot,
  Info,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCivicHelper } from "@/components/helper/CivicHelperContext";
import { Button } from "@/components/ui/button";
import { NAV_GROUPS } from "@/components/layout/navSections";

function iconForRoute(route: string): React.ElementType {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === route) return item.icon;
    }
  }
  return BookOpen;
}

/** Returns true when the route is handled by the SPA router.
 *  Routes starting with /api or containing :// are treated as external. */
function isAppRoute(route: string): boolean {
  if (!route.startsWith("/")) return false;
  if (route.startsWith("/api/")) return false;
  return true;
}

export function Guida() {
  const {
    guideContents,
    guideLoading,
    openIntro,
    openAssistant,
    isSectionVisited,
  } = useCivicHelper();

  const chapters = (guideContents?.storyChapters ?? []).slice().sort(
    (a, b) => a.order - b.order,
  );

  const sections = guideContents?.sections ?? [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="mb-10">
        <span className="eyebrow text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          Cittadinanza Civica
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Centro Guida
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Scopri il progetto, come è nato e cosa puoi fare su questo sito.
          Riapri l'introduzione o chatta con l'assistente in qualsiasi momento.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <Button onClick={openIntro} className="gap-2">
          <Info className="h-4 w-4" />
          Riapri l'introduzione
        </Button>
        <Button variant="outline" onClick={openAssistant} className="gap-2">
          <Bot className="h-4 w-4" />
          Chatta con l'assistente
        </Button>
      </div>

      {guideLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Caricamento contenuti…</span>
        </div>
      ) : !guideContents ? (
        <div className="flex items-center gap-2 text-destructive rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 mb-10">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            Impossibile caricare i contenuti. Riprova tra qualche istante.
          </span>
        </div>
      ) : (
        <>
          {chapters.length > 0 && (
            <section className="mb-14">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
                La storia del progetto
              </h2>
              <div className="space-y-8">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="rounded-2xl border border-border bg-card px-6 py-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {chapter.order}
                      </span>
                      <h3 className="font-display text-lg font-bold">
                        {chapter.title}
                      </h3>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                      <ReactMarkdown>{chapter.body}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
                Le sezioni del sito
              </h2>
              <p className="text-muted-foreground mb-6">
                Un indice di tutte le funzionalità disponibili su rendiamoLameziaTrasparente.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sections.map((section) => {
                  const Icon = iconForRoute(section.route);
                  const appRoute = isAppRoute(section.route);
                  const visited = isSectionVisited(section.route);
                  const cardClass =
                    "group flex items-start gap-3.5 rounded-xl border border-border bg-card px-4 py-4 hover-elevate transition-all";
                  const inner = (
                    <>
                      <div
                        className={
                          visited
                            ? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors"
                            : "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors"
                        }
                      >
                        {visited ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="font-semibold text-sm leading-snug">
                            {section.title}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {visited && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Esplorata
                              </span>
                            )}
                            {appRoute ? (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            ) : (
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {section.description}
                        </p>
                      </div>
                    </>
                  );
                  return appRoute ? (
                    <Link key={section.id} href={section.route} className={cardClass}>
                      {inner}
                    </Link>
                  ) : (
                    <a
                      key={section.id}
                      href={section.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {inner}
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-14 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm">Hai dubbi o domande?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            L'assistente civico risponde alle tue domande in italiano con dati reali.
          </p>
        </div>
        <Button variant="outline" onClick={openAssistant} className="gap-2 shrink-0">
          <Bot className="h-4 w-4" />
          Chiedi all'assistente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
