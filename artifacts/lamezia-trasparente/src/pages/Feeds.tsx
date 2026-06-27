import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListThemes } from "@workspace/api-client-react";
import {
  Rss,
  Check,
  Copy,
  Info,
  ShieldAlert,
  Gavel,
  FileText,
  FileSearch,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";

type StaticFeed = {
  path: string;
  title: string;
  description: string;
  icon: typeof Rss;
};

const STATIC_FEEDS: StaticFeed[] = [
  {
    path: "/feeds/albo.xml",
    title: "Albo Pretorio",
    description:
      "Tutti gli atti pubblicati più recenti all'Albo Pretorio del Comune: delibere, determine, ordinanze e convocazioni.",
    icon: ShieldAlert,
  },
  {
    path: "/feeds/delibere.xml",
    title: "Delibere",
    description:
      "Solo le delibere comunali più recenti, man mano che vengono pubblicate all'Albo Pretorio.",
    icon: Gavel,
  },
  {
    path: "/feeds/contratti.xml",
    title: "Appalti e contratti",
    description:
      "Contratti e affidamenti pubblici nel perimetro locale dichiarato, con limiti di fonte e collegamenti documentali.",
    icon: FileText,
  },
];

/** URL assoluto di un feed sulla stessa origine del sito. */
function absoluteFeedUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return `/api${clean}`;
  return `${window.location.origin}/api${clean}`;
}

function CopyableUrl({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteFeedUrl(path);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {url}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={copy}
        aria-label={copied ? "Copiato" : "Copia indirizzo del feed"}
        className="h-7 w-7 shrink-0 text-muted-foreground"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

function FeedRow({
  title,
  description,
  path,
  icon: Icon,
}: {
  title: string;
  description: string;
  path: string;
  icon: typeof Rss;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-bold leading-snug text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <CopyableUrl path={path} />
      <div className="flex">
        <FeedSubscribeButton feedPath={path} title={title} />
      </div>
    </div>
  );
}

export function Feeds() {
  const { data: themes, isLoading } = useListThemes();

  const sortedThemes = useMemo(
    () =>
      [...(themes ?? [])].sort((a, b) => a.title.localeCompare(b.title, "it")),
    [themes],
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-6">
        <span className="eyebrow text-primary">
          <Rss className="h-3.5 w-3.5" />
          Abbonamenti
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Feed e abbonamenti
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Resta aggiornato in automatico sugli atti, le delibere, i contratti e
          i temi che ti interessano. Ogni feed ha un indirizzo stabile che puoi
          aggiungere al tuo lettore RSS preferito.
        </p>
      </div>

      {/* RSS explainer */}
      <div className="mb-8 flex gap-3 rounded-xl border border-card-border bg-muted/30 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Cos'è un feed RSS?
          </span>{" "}
          È un modo per ricevere gli aggiornamenti di un sito senza doverlo
          visitare ogni giorno. Copia l'indirizzo di un feed e incollalo in un
          lettore RSS (come Feedly, NetNewsWire, Thunderbird o le estensioni del
          browser): vedrai comparire le nuove pubblicazioni appena escono. In
          alternativa, il pulsante{" "}
          <span className="font-medium">«Abbonati al feed»</span> apre il feed
          direttamente nel browser.
        </div>
      </div>

      {/* Feed principali */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Feed principali
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_FEEDS.map((f) => (
            <FeedRow
              key={f.path}
              title={f.title}
              description={f.description}
              path={f.path}
              icon={f.icon}
            />
          ))}
        </div>
      </section>

      {/* Feed per tema */}
      <section>
        <h2 className="mb-2 font-display text-xl font-bold tracking-tight">
          Feed per tema di monitoraggio
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Ogni tema di monitoraggio civico ha un proprio feed con documenti,
          atti, corrispondenza e aggiornamenti della cronistoria. Abbonati solo
          ai temi che segui.
        </p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
                >
                  <Skeleton className="mb-3 h-6 w-2/3" />
                  <Skeleton className="mb-2 h-8 w-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
          </div>
        ) : sortedThemes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedThemes.map((theme) => {
              const path = `/feeds/temi/${theme.id}.xml`;
              return (
                <div
                  key={theme.id}
                  className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileSearch className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/temi/${theme.id}`}
                        className="font-display font-bold leading-snug text-foreground hover:text-primary"
                      >
                        {theme.title}
                      </Link>
                    </div>
                  </div>
                  <CopyableUrl path={path} />
                  <div className="flex">
                    <FeedSubscribeButton
                      feedPath={path}
                      title={`Tema: ${theme.title}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Al momento non ci sono temi di monitoraggio attivi.
          </p>
        )}
      </section>

      {/* Link alle altre risorse aperte */}
      <div className="mt-10 flex flex-col gap-2 rounded-xl border border-card-border bg-muted/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Cerchi dati strutturati o un'API? Esplora il catalogo aperto e la
          documentazione per sviluppatori.
        </span>
        <div className="flex flex-wrap gap-2">
          <Link href="/opendata">
            <Button variant="outline" size="sm">
              Catalogo Opendata
            </Button>
          </Link>
          <Link href="/sviluppatori">
            <Button variant="outline" size="sm">
              API e sviluppatori
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
