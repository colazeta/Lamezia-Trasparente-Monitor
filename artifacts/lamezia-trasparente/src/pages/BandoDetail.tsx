import { useParams, Link } from "wouter";
import {
  useGetBando,
  type BandoMatch,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Megaphone,
  Building2,
  CalendarClock,
  TrendingDown,
  Trophy,
  CheckCircle2,
  CircleSlash,
  CircleHelp,
  ExternalLink,
  FileText,
  FileSignature,
  Landmark,
  Info,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const SETTORE_LABELS: Record<string, string> = {
  ambiente: "Ambiente",
  scuole: "Scuole",
  strade: "Strade e opere",
  sociale: "Sociale",
  cultura: "Cultura",
  mobilita: "Mobilità",
  altro: "Altro",
};

const STATUS_LABELS: Record<string, string> = {
  aperto: "Aperto",
  "in-scadenza": "In scadenza",
  concluso: "Concluso",
};

const ESITO_META: Record<
  string,
  { label: string; className: string; icon: typeof Trophy; description: string }
> = {
  vinto: {
    label: "Vinto",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: Trophy,
    description:
      "Il Comune ha ottenuto il finanziamento: esiste un contratto o un progetto PNRR collegato e confermato.",
  },
  partecipato: {
    label: "Partecipato",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    icon: CheckCircle2,
    description:
      "Il Comune ha partecipato al bando: esiste un atto collegato e confermato.",
  },
  "non-partecipato": {
    label: "Non partecipato",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: CircleSlash,
    description:
      "Bando concluso senza alcun riscontro di partecipazione confermato.",
  },
  "da-verificare": {
    label: "Da verificare",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: CircleHelp,
    description:
      "Non risultano ancora riscontri confermati di partecipazione per questo bando.",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

function formatCurrency(value: number | string | null | undefined) {
  if (value == null) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const MATCH_META: Record<
  string,
  { label: string; icon: typeof FileText; href: (m: BandoMatch) => string | null }
> = {
  publication: {
    label: "Atto / Pubblicazione",
    icon: FileText,
    href: () => null,
  },
  contract: {
    label: "Contratto",
    icon: FileSignature,
    href: (m) => (m.contractId != null ? `/contratti/${m.contractId}` : null),
  },
  pnrr: {
    label: "Progetto PNRR",
    icon: Landmark,
    href: () => "/pnrr",
  },
};

export function BandoDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const { data: bando, isLoading, error } = useGetBando(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error || !bando) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Bando non trovato</EmptyTitle>
            <EmptyDescription>
              Il bando richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const esitoMeta = ESITO_META[bando.esito];
  const EsitoIcon = esitoMeta.icon;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/bandi">
        <Button variant="ghost" className="mb-4 gap-2 px-2" data-testid="link-back">
          <ArrowLeft className="h-4 w-4" /> Tutti i bandi
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand">
              <Megaphone className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Bando / Finanziamento
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {bando.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{STATUS_LABELS[bando.status]}</Badge>
              {bando.settore && (
                <Badge variant="secondary">
                  {SETTORE_LABELS[bando.settore] ?? bando.settore}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" /> {bando.enteErogatore}
            </div>
          </div>

          {bando.description?.trim() && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-lg font-semibold">
                Descrizione
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bando.description}
              </p>
            </Card>
          )}

          {bando.eligibility?.trim() && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-lg font-semibold">
                Requisiti di partecipazione
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bando.eligibility}
              </p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-1 font-display text-lg font-semibold">
              Riscontri di partecipazione
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Collegamenti confermati con atti, contratti e progetti PNRR già
              pubblicati che attestano la partecipazione del Comune.
            </p>
            {bando.matches.length > 0 ? (
              <div className="space-y-3">
                {bando.matches.map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Nessun riscontro di partecipazione confermato per questo bando.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className={`border p-5 ${esitoMeta.className}`}>
            <div className="flex items-center gap-2">
              <EsitoIcon className="h-5 w-5" />
              <span className="font-display text-lg font-semibold">
                {esitoMeta.label}
              </span>
            </div>
            <p className="mt-2 text-sm opacity-90">{esitoMeta.description}</p>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Importo stanziato
              </span>
              <span className="font-semibold">
                {formatCurrency(bando.importoStanziato)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Importo medio aggiudicato
              </span>
              <span className="font-semibold">
                {formatCurrency(bando.importoMedioAggiudicato)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" /> Scadenza
              </span>
              <span className="font-semibold">{formatDate(bando.scadenza)}</span>
            </div>
            {bando.lostAmount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <TrendingDown className="h-4 w-4" /> Risorse perse (stima)
                </span>
                <span className="font-bold text-destructive">
                  {formatCurrency(bando.lostAmount)}
                </span>
              </div>
            )}
          </Card>

          {bando.officialUrl && (
            <a
              href={bando.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="brand" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" /> Pagina ufficiale del bando
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: BandoMatch }) {
  const meta = MATCH_META[match.targetType] ?? MATCH_META.publication;
  const Icon = meta.icon;
  const internalHref = meta.href(match);

  const content = (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:border-brand/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {meta.label}
          </Badge>
          {match.reference && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {match.reference}
            </span>
          )}
        </div>
        <p className="text-sm font-medium leading-tight">{match.title || "—"}</p>
        <p className="text-xs text-muted-foreground">{match.matchReason}</p>
      </div>
      {(internalHref || match.url) && (
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  );

  if (internalHref) {
    return <Link href={internalHref}>{content}</Link>;
  }
  if (match.url) {
    return (
      <a href={match.url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}
