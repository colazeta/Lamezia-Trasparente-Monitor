import { useEffect, useMemo, useState } from "react";
import {
  useListPublications,
  useGetFeedStatus,
  useGetPublicationsCategories,
} from "@workspace/api-client-react";
import type { MacrotemaKey } from "@workspace/api-client-react";
import {
  Search,
  Filter,
  ShieldAlert,
  Calendar,
  RefreshCw,
  Info,
  Paperclip,
  Layers,
  ChevronRight,
  BadgeEuro,
  Landmark,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "wouter";
import { MONITORING_DOCS_NOTICE } from "@/lib/monitoring";
import {
  alboExtractionText,
  extractAlboCigs,
  hasAlboBeneficiarySignal,
  hasAlboDetectedAmount,
} from "@/lib/albo";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import {
  MACROTEMA_LABELS,
  MACROTEMA_OPTS,
  MacrotemaBadge,
} from "@/lib/macrotema";
import { PageMeta } from "@/components/seo/PageMeta";

const CATEGORY_LABELS: Record<string, string> = {
  albo: "Albo",
  delibera: "Delibere",
  convocazione: "Convocazioni",
  ordinanza: "Ordinanze",
};

function formatDate(value: string | null | undefined, pattern = "dd MMM yyyy") {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, pattern, { locale: it });
}

function matchesPresence(value: boolean, filter: string): boolean {
  return filter === "all" || (filter === "yes" ? value : !value);
}

export function Albo() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tipologia, setTipologia] = useState<string>("all");
  const [macrotema, setMacrotema] = useState<string>("all");
  const [office, setOffice] = useState<string>("all");
  const [hasCig, setHasCig] = useState<string>("all");
  const [hasCup, setHasCup] = useState<string>("all");
  const [hasAmount, setHasAmount] = useState<string>("all");
  const [hasBeneficiary, setHasBeneficiary] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: feed } = useGetFeedStatus();
  const { data: categoryStats } = useGetPublicationsCategories();

  const { data: publications, isLoading } = useListPublications({
    category: category !== "all" ? category : undefined,
    tipologia: tipologia !== "all" ? tipologia : undefined,
    macrotema: macrotema !== "all" ? (macrotema as MacrotemaKey) : undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const uniqueTipologie = useMemo(
    () =>
      publications
        ? Array.from(new Set(publications.map((p) => p.tipologia))).sort()
        : [],
    [publications],
  );

  const uniqueOffices = useMemo(
    () =>
      publications
        ? Array.from(
            new Set(
              publications
                .map((p) => p.provenienza?.trim())
                .filter((value): value is string => Boolean(value)),
            ),
          ).sort((a, b) => a.localeCompare(b, "it"))
        : [],
    [publications],
  );

  const filteredPublications = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return (publications ?? []).filter((p) => {
      const searchable = [p.oggetto, p.brief, p.provenienza, p.tipologia, p.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const textForDetections = alboExtractionText([p.oggetto, p.brief, p.provenienza]);
      const cigs = extractAlboCigs(textForDetections);

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (office === "all" || p.provenienza === office) &&
        matchesPresence(cigs.length > 0, hasCig) &&
        matchesPresence((p.cups ?? []).length > 0, hasCup) &&
        matchesPresence(hasAlboDetectedAmount(textForDetections), hasAmount) &&
        matchesPresence(hasAlboBeneficiarySignal(textForDetections), hasBeneficiary)
      );
    });
  }, [debouncedSearch, hasAmount, hasBeneficiary, hasCig, hasCup, office, publications]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    for (const row of categoryStats ?? []) {
      map[row.category] = row.count;
      total += row.count;
    }
    return { map, total };
  }, [categoryStats]);

  const MACRO_CATEGORIES: { key: string; label: string }[] = [
    { key: "all", label: "Tutte" },
    { key: "albo", label: "Albo" },
    { key: "delibera", label: "Delibere" },
    { key: "convocazione", label: "Convocazioni" },
    { key: "ordinanza", label: "Ordinanze" },
  ];

  return (
    <>
      <PageMeta
        title="Albo Pretorio civico navigabile"
        description="Archivio civico consultabile degli atti pubblicati all'Albo Pretorio di Lamezia Terme, con filtri per categoria, periodo e macrotema."
        path="/albo"
      />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <ShieldAlert className="h-3.5 w-3.5"  aria-hidden="true"/>
            Estrazione indipendente in tempo reale
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
            Albo Pretorio Civico
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
            Un archivio navigabile e permanente degli atti pubblicati dal
            Comune. A differenza dell'albo ufficiale, qui i documenti non
            scompaiono dopo 15 giorni.
          </p>
        </div>
        <FeedSubscribeButton
          feedPath="/feeds/albo.xml"
          title="Albo Pretorio Civico — Lamezia Trasparente"
          className="shrink-0"
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <RefreshCw className="h-4 w-4 text-primary"  aria-hidden="true"/>
          Ultimo aggiornamento:{" "}
          <span className="text-primary font-mono">
            {feed?.lastUpdatedAt
              ? formatDate(feed.lastUpdatedAt, "dd MMMM yyyy 'alle' HH:mm")
              : "in corso…"}
          </span>
        </span>
        {feed && (
          <span className="text-muted-foreground">
            <span className="font-display font-bold tabular-nums text-foreground">
              {feed.itemsTotal}
            </span>{" "}
            atti monitorati
          </span>
        )}
        <span className="text-muted-foreground">
          Aggiornamento automatico ogni 3 ore
        </span>
      </div>

      <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand"  aria-hidden="true"/>
        <p>
          {MONITORING_DOCS_NOTICE}{" "}
          <Link
            href="/metodologia"
            className="font-medium text-foreground underline underline-offset-2 hover:text-brand transition-colors"
          >
            Scopri di più
          </Link>
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MACRO_CATEGORIES.map((mc) => {
          const active = category === mc.key;
          const count =
            mc.key === "all"
              ? categoryCounts.total
              : (categoryCounts.map[mc.key] ?? 0);
          return (
            <button
              key={mc.key}
              type="button"
              onClick={() => setCategory(mc.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground"
              }`}
            >
              {mc.label}
              {categoryStats && (
                <span
                  className={`rounded-full px-1.5 text-xs font-display font-bold tabular-nums ${
                    active
                      ? "bg-brand-foreground/20 text-brand-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div data-tour="albo-filter" className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 p-4 bg-muted/40 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Cerca in oggetto, descrizione, tipologia o ufficio..."
            aria-label="Cerca in oggetto, descrizione, tipologia o ufficio"
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-44">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 bg-background" aria-label="Filtra per sezione">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0"  aria-hidden="true"/>
                <span>
                  {category === "all"
                    ? "Tutte le sezioni"
                    : CATEGORY_LABELS[category]}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le sezioni</SelectItem>
              <SelectItem value="albo">Albo</SelectItem>
              <SelectItem value="delibera">Delibere</SelectItem>
              <SelectItem value="convocazione">Convocazioni</SelectItem>
              <SelectItem value="ordinanza">Ordinanze</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select value={macrotema} onValueChange={setMacrotema}>
            <SelectTrigger className="h-11 bg-background" aria-label="Filtra per tema">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0"  aria-hidden="true"/>
                <span className="truncate">
                  {macrotema === "all"
                    ? "Tutti i temi"
                    : MACROTEMA_LABELS[macrotema] ?? macrotema}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {MACROTEMA_OPTS.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select value={tipologia} onValueChange={setTipologia}>
            <SelectTrigger className="h-11 bg-background" aria-label="Filtra per tipologia">
              <span className="truncate">
                {tipologia === "all" ? "Tutte le tipologie" : tipologia}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le tipologie</SelectItem>
              {uniqueTipologie.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {uniqueOffices.length > 0 && (
          <div className="w-full md:w-56">
            <Select value={office} onValueChange={setOffice}>
              <SelectTrigger className="h-11 bg-background" aria-label="Filtra per settore o ufficio">
                <span className="truncate">
                  {office === "all" ? "Tutti gli uffici" : office}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli uffici</SelectItem>
                {uniqueOffices.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["CIG", hasCig, setHasCig],
            ["CUP", hasCup, setHasCup],
            ["importo", hasAmount, setHasAmount],
            ["beneficiario/operatore", hasBeneficiary, setHasBeneficiary],
          ].map(([label, value, setter]) => (
            <Select key={label as string} value={value as string} onValueChange={setter as (next: string) => void}>
              <SelectTrigger className="h-11 bg-background" aria-label={`Filtra per presenza ${label}`}>
                <span className="truncate">{`Presenza ${label}`}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`Qualsiasi ${label}`}</SelectItem>
                <SelectItem value="yes">Segnale rilevato</SelectItem>
                <SelectItem value="no">Non rilevato</SelectItem>
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Data inizio"
            className="h-11 bg-background w-full md:w-[150px]"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="date"
            aria-label="Data fine"
            className="h-11 bg-background w-full md:w-[150px]"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div data-tour="albo-list" className="space-y-3">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
        ) : filteredPublications.length > 0 ? (
          filteredPublications.map((p) => (
            <Link key={p.id} href={`/albo/${p.id}`} className="block">
              <Card className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40 cursor-pointer">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {p.tipologia}
                    </Badge>
                    <MacrotemaBadge macrotema={p.macrotema} />
                    {p.isNew && (
                      <Badge variant="brand" className="text-xs">
                        NUOVO
                      </Badge>
                    )}
                    {p.numRegGen && (
                      <span className="font-mono text-xs text-muted-foreground">
                        Reg. gen. {p.numRegGen}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5"  aria-hidden="true"/>
                    {formatDate(p.pubStart)}
                  </div>
                </div>

                <h3 className="font-display font-bold text-foreground leading-snug mb-2 group-hover:text-brand transition-colors">
                  {p.oggetto}
                </h3>

                {p.brief && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                    {p.brief}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>ID interno {p.id}</span>
                  {p.provenienza && (
                    <span className="inline-flex items-center gap-1">
                      <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                      {p.provenienza}
                    </span>
                  )}
                  {p.pubEnd && (
                    <span>Pubblicato fino al {formatDate(p.pubEnd, "dd/MM/yyyy")}</span>
                  )}
                  {p.isPnrr && (
                    <Badge variant="warning" className="text-[10px]">
                      PNRR
                    </Badge>
                  )}
                  {(p.cups ?? []).length > 0 && (
                    <span className="font-mono">CUP {p.cups.join(", ")}</span>
                  )}
                  {extractAlboCigs(alboExtractionText([p.oggetto, p.brief])).map((cig) => (
                    <span key={cig} className="font-mono">CIG {cig}</span>
                  ))}
                  {hasAlboDetectedAmount(alboExtractionText([p.oggetto, p.brief])) && (
                    <span className="inline-flex items-center gap-1">
                      <BadgeEuro className="h-3.5 w-3.5" aria-hidden="true" />
                      importo: segnale testuale
                    </span>
                  )}
                  {hasAlboBeneficiarySignal(alboExtractionText([p.oggetto, p.brief])) && (
                    <span>beneficiario/operatore: segnale testuale</span>
                  )}
                  {p.attachments && p.attachments.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-brand">
                      <Paperclip className="h-3.5 w-3.5"  aria-hidden="true"/>
                      {p.attachments.length}{" "}
                      {p.attachments.length === 1 ? "documento" : "documenti"}
                    </span>
                  )}
                </div>

                <div data-tour="albo-markdown" className="mt-3 border-t border-border pt-3 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-brand transition-colors">
                    Vedi dettaglio e allegati
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"  aria-hidden="true"/>
                  </span>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert  aria-hidden="true"/>
              </EmptyMedia>
              <EmptyTitle>Nessun atto trovato</EmptyTitle>
              <EmptyDescription>
                Nessun atto corrisponde ai criteri di ricerca selezionati. Prova
                a modificare i filtri o ad ampliare l'intervallo di date.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
      </div>
    </>
  );
}
