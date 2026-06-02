import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useListOversightOpinions } from "@workspace/api-client-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Search,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Building2,
  CalendarDays,
  ArrowDownNarrowWide,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const ALL_BODIES = "__all__";
const ALL_YEARS = "__all__";

export function PareriVigilanza() {
  const [issuingBody, setIssuingBody] = useState<string>(ALL_BODIES);
  const [year, setYear] = useState<string>(ALL_YEARS);
  const [sort, setSort] = useState<"recent" | "oldest" | "referenceYear">(
    "recent",
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Unfiltered fetch to build the list of available issuing bodies.
  const { data: allOpinions } = useListOversightOpinions();

  const issuingBodies = useMemo(() => {
    if (!allOpinions) return [];
    return Array.from(new Set(allOpinions.map((o) => o.issuingBody))).sort(
      (a, b) => a.localeCompare(b, "it"),
    );
  }, [allOpinions]);

  const years = useMemo(() => {
    if (!allOpinions) return [];
    return Array.from(
      new Set(
        allOpinions
          .map((o) => o.referenceYear)
          .filter((y): y is number => y != null),
      ),
    ).sort((a, b) => b - a);
  }, [allOpinions]);

  const { data: opinions, isLoading } = useListOversightOpinions({
    issuingBody: issuingBody !== ALL_BODIES ? issuingBody : undefined,
    year: year !== ALL_YEARS ? Number(year) : undefined,
    search: debouncedSearch || undefined,
    sort,
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <span className="eyebrow text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          Controllo e vigilanza
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Pareri degli Organi di Vigilanza
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          I pareri e gli atti di controllo emessi dagli organi di vigilanza sul
          Comune di Lamezia Terme — Collegio dei Revisori dei Conti, OIV /
          Nucleo di Valutazione, Corte dei Conti e ANAC. Un punto unico,
          consultabile e trasparente.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, oggetto o tipo di parere..."
            aria-label="Cerca pareri"
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={issuingBody} onValueChange={setIssuingBody}>
              <SelectTrigger
                className="h-11 bg-background"
                aria-label="Filtra per organo emittente"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Tutti gli organi" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_BODIES}>Tutti gli organi</SelectItem>
                {issuingBodies.map((body) => (
                  <SelectItem key={body} value={body}>
                    {body}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-44">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                className="h-11 bg-background"
                aria-label="Filtra per anno"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Tutti gli anni" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_YEARS}>Tutti gli anni</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-56">
            <Select
              value={sort}
              onValueChange={(v) =>
                setSort(v as "recent" | "oldest" | "referenceYear")
              }
            >
              <SelectTrigger
                className="h-11 bg-background"
                aria-label="Ordina i pareri"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ArrowDownNarrowWide className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Più recenti</SelectItem>
                <SelectItem value="oldest">Meno recenti</SelectItem>
                <SelectItem value="referenceYear">
                  Anno di riferimento
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
        ) : opinions && opinions.length > 0 ? (
          opinions.map((o) => (
            <Link
              key={o.id}
              href={`/pareri/${o.id}`}
              className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card shadow-sm hover-elevate transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {o.issuingBody}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {o.opinionType}
                  </Badge>
                  {o.referenceYear != null && (
                    <Badge variant="outline" className="text-xs font-mono">
                      Rif. {o.referenceYear}
                    </Badge>
                  )}
                  {o.outcome && (
                    <span className="text-xs text-brand font-medium">
                      {o.outcome}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-brand transition-colors">
                  {o.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                  {o.subject}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(o.opinionDate), "dd MMMM yyyy", {
                    locale: it,
                  })}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground group-hover:text-brand transition-colors" />
            </Link>
          ))
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheck />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                Nessun parere disponibile
              </EmptyTitle>
              <EmptyDescription>
                Non risultano pareri degli organi di vigilanza corrispondenti ai
                criteri selezionati. Nuovi atti di controllo appariranno qui non
                appena pubblicati.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
