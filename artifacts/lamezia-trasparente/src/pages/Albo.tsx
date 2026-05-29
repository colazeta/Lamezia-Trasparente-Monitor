import { useEffect, useMemo, useState } from "react";
import {
  useListPublications,
  useGetFeedStatus,
} from "@workspace/api-client-react";
import { Search, Filter, ShieldAlert, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  albo: "Albo",
  delibera: "Delibere",
  convocazione: "Convocazioni",
};

function formatDate(value: string | null | undefined, pattern = "dd MMM yyyy") {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, pattern, { locale: it });
}

export function Albo() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tipologia, setTipologia] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: feed } = useGetFeedStatus();

  const { data: publications, isLoading } = useListPublications({
    q: debouncedSearch || undefined,
    category: category !== "all" ? category : undefined,
    tipologia: tipologia !== "all" ? tipologia : undefined,
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-6 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Estrazione Indipendente in tempo reale
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Albo Pretorio Civico
        </h1>
        <p className="text-muted-foreground text-lg">
          Un archivio navigabile e permanente degli atti pubblicati dal Comune.
          A differenza dell'albo ufficiale, qui i documenti non scompaiono dopo
          15 giorni.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <RefreshCw className="h-4 w-4 text-primary" />
          Ultimo aggiornamento:{" "}
          <span className="text-primary">
            {feed?.lastUpdatedAt
              ? formatDate(feed.lastUpdatedAt, "dd MMMM yyyy 'alle' HH:mm")
              : "in corso…"}
          </span>
        </span>
        {feed && (
          <span className="text-muted-foreground">
            {feed.itemsTotal} atti monitorati
          </span>
        )}
        <span className="text-muted-foreground">
          Aggiornamento automatico ogni 3 ore
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 p-4 bg-muted/30 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca nell'oggetto dell'atto..."
            aria-label="Cerca nell'oggetto dell'atto"
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-44">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
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
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select value={tipologia} onValueChange={setTipologia}>
            <SelectTrigger className="h-11 bg-background">
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

      <div className="space-y-3">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border bg-card shadow-sm"
              >
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
        ) : publications && publications.length > 0 ? (
          publications.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-transparent shadow-none text-xs">
                    {p.tipologia}
                  </Badge>
                  {p.isNew && (
                    <Badge className="bg-primary text-primary-foreground border-transparent shadow-none text-xs">
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
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(p.pubStart)}
                </div>
              </div>

              <h3 className="font-semibold text-foreground leading-snug mb-2">
                {p.oggetto}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {p.provenienza && <span>{p.provenienza}</span>}
                {p.pubEnd && (
                  <span>Pubblicato fino al {formatDate(p.pubEnd, "dd/MM/yyyy")}</span>
                )}
                {p.isPnrr && (
                  <span className="font-medium text-primary">PNRR</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Nessun atto trovato con questi criteri.
          </div>
        )}
      </div>
    </div>
  );
}
