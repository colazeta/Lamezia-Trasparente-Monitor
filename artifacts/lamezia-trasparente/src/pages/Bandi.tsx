import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useListBandi,
  useGetBandiSummary,
  type Bando,
  type BandoEsito,
  type BandoStatus,
  type ListBandiParams,
} from "@workspace/api-client-react";
import {
  Megaphone,
  Info,
  TrendingDown,
  Target,
  Trophy,
  CircleHelp,
  CircleSlash,
  CheckCircle2,
  ArrowRight,
  Building2,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATUS_LABELS: Record<BandoStatus, string> = {
  aperto: "Aperto",
  "in-scadenza": "In scadenza",
  concluso: "Concluso",
};

const ESITO_META: Record<
  BandoEsito,
  { label: string; className: string; icon: typeof Trophy }
> = {
  vinto: {
    label: "Vinto",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: Trophy,
  },
  partecipato: {
    label: "Partecipato",
    className:
      "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    icon: CheckCircle2,
  },
  "non-partecipato": {
    label: "Non partecipato",
    className:
      "border-destructive/40 bg-destructive/10 text-destructive",
    icon: CircleSlash,
  },
  "da-verificare": {
    label: "Da verificare",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: CircleHelp,
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy", { locale: it });
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

function EsitoBadge({ esito }: { esito: BandoEsito }) {
  const meta = ESITO_META[esito];
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] ${meta.className}`}
      data-testid={`badge-esito-${esito}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

function SummaryCards() {
  const { data: summary, isLoading } = useGetBandiSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  if (!summary) return null;

  const cards = [
    {
      label: "Bandi mappati",
      value: String(summary.totaleMappati),
      hint: `${summary.aperti} aperti · ${summary.conclusi} conclusi`,
      icon: Target,
      tone: "text-brand",
    },
    {
      label: "Tasso di partecipazione",
      value: `${Math.round(summary.tassoPartecipazione * 100)}%`,
      hint: `${summary.partecipati + summary.vinti} su ${summary.totaleMappati}`,
      icon: CheckCircle2,
      tone: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Bandi vinti",
      value: String(summary.vinti),
      hint: `${summary.daVerificare} da verificare`,
      icon: Trophy,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Stima risorse perse",
      value: formatCurrency(summary.risorsePerseTotale),
      hint: `${summary.nonPartecipati} bandi conclusi senza partecipazione`,
      icon: TrendingDown,
      tone: "text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="flex flex-col gap-2 p-5">
            <div className={`flex items-center gap-2 ${c.tone}`}>
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                {c.label}
              </span>
            </div>
            <div className="font-display text-2xl font-bold tracking-tight">
              {c.value}
            </div>
            <p className="text-xs text-muted-foreground">{c.hint}</p>
          </Card>
        );
      })}
    </div>
  );
}

export function Bandi() {
  const [status, setStatus] = useState<string>("all");
  const [settore, setSettore] = useState<string>("all");
  const [esito, setEsito] = useState<string>("all");
  const [ente, setEnte] = useState<string>("");
  const [enteQuery, setEnteQuery] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setEnteQuery(ente.trim()), 300);
    return () => clearTimeout(t);
  }, [ente]);

  const params = useMemo(() => {
    const p: ListBandiParams = {};
    if (status !== "all") p.status = status as BandoStatus;
    if (settore !== "all") p.settore = settore;
    if (esito !== "all") p.esito = esito as BandoEsito;
    if (enteQuery) p.ente = enteQuery;
    return p;
  }, [status, settore, esito, enteQuery]);

  const { data: bandi, isLoading } = useListBandi(params);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <Megaphone className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Opportunità di finanziamento
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Bandi e finanziamenti
        </h1>
        <p className="text-muted-foreground">
          I bandi e i finanziamenti pubblici per cui il Comune di Lamezia Terme
          è potenzialmente eligibile. Per ciascuno è indicato se il Comune ha
          partecipato — incrociando automaticamente atti, contratti e progetti
          PNRR già pubblicati — e, per i bandi conclusi senza partecipazione,
          una stima delle risorse potenzialmente perse.
        </p>
      </div>

      <div data-tour="bandi-match" className="mb-8">
        <SummaryCards />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]" data-testid="filter-status">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="aperto">Aperti</SelectItem>
            <SelectItem value="in-scadenza">In scadenza</SelectItem>
            <SelectItem value="concluso">Conclusi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={settore} onValueChange={setSettore}>
          <SelectTrigger className="w-[180px]" data-testid="filter-settore">
            <SelectValue placeholder="Settore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i settori</SelectItem>
            {Object.entries(SETTORE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={esito} onValueChange={setEsito}>
          <SelectTrigger className="w-[180px]" data-testid="filter-esito">
            <SelectValue placeholder="Esito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli esiti</SelectItem>
            <SelectItem value="vinto">Vinto</SelectItem>
            <SelectItem value="partecipato">Partecipato</SelectItem>
            <SelectItem value="non-partecipato">Non partecipato</SelectItem>
            <SelectItem value="da-verificare">Da verificare</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={ente}
          onChange={(e) => setEnte(e.target.value)}
          placeholder="Filtra per ente erogatore"
          className="w-[220px]"
          data-testid="filter-ente"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : bandi && bandi.length > 0 ? (
        <div data-tour="bandi-list" className="grid gap-4 md:grid-cols-2">
          {bandi.map((b) => (
            <BandoCard key={b.id} bando={b} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessun bando trovato</EmptyTitle>
            <EmptyDescription>
              Non ci sono bandi che corrispondono ai filtri selezionati.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

function BandoCard({ bando }: { bando: Bando }) {
  return (
    <Link href={`/bandi/${bando.slug}`}>
      <Card
        className="flex h-full cursor-pointer flex-col gap-3 p-5 transition-colors hover:border-brand/50"
        data-testid={`card-bando-${bando.slug}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABELS[bando.status]}
            </Badge>
            <EsitoBadge esito={bando.esito} />
          </div>
          {bando.settore && (
            <Badge variant="secondary" className="text-[10px]">
              {SETTORE_LABELS[bando.settore] ?? bando.settore}
            </Badge>
          )}
        </div>

        <h2 className="font-display text-base font-semibold leading-tight">
          {bando.title}
        </h2>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{bando.enteErogatore}</span>
        </div>

        {bando.description?.trim() && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {bando.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Importo stanziato</span>
            <span className="font-medium">
              {formatCurrency(bando.importoStanziato)}
            </span>
          </div>
          {bando.scadenza && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Scadenza
              </span>
              <span className="font-medium">{formatDate(bando.scadenza)}</span>
            </div>
          )}
          {bando.lostAmount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-destructive">
                <TrendingDown className="h-3.5 w-3.5" /> Risorse perse (stima)
              </span>
              <span className="font-semibold text-destructive">
                {formatCurrency(bando.lostAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 pt-1 text-xs font-medium text-brand">
            Dettagli <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
