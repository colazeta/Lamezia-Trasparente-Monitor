import { useEffect, useState } from "react";
import { useListActs } from "@workspace/api-client-react";
import { Search, Filter, ShieldAlert, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function Albo() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: acts, isLoading } = useListActs({
    search: debouncedSearch || undefined,
    type: type !== "all" ? type : undefined,
    from: from || undefined,
    to: to || undefined
  });

  // Extract unique types from data for the filter (if real API, this might come from a separate endpoint)
  const uniqueTypes = acts ? Array.from(new Set(acts.map(a => a.type))) : ["Delibera", "Determina", "Avviso", "Ordinanza", "Bando"];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive mb-2">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Estrazione Indipendente
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Albo Pretorio Civico</h1>
        <p className="text-muted-foreground text-lg">
          Un archivio navigabile e permanente degli atti pubblicati dal Comune. 
          A differenza dell'albo ufficiale, qui i documenti non scompaiono dopo 15 giorni.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cerca numero o testo dell'atto..." 
            className="pl-9 h-11 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-56">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11 bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{type === "all" ? "Tutti i tipi" : type}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="albo-from">Dal</label>
            <Input
              id="albo-from"
              type="date"
              aria-label="Data inizio"
              className="h-11 bg-background w-full md:w-[150px]"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <span className="text-muted-foreground text-sm">–</span>
          <div className="relative">
            <label className="sr-only" htmlFor="albo-to">Al</label>
            <Input
              id="albo-to"
              type="date"
              aria-label="Data fine"
              className="h-11 bg-background w-full md:w-[150px]"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border/0 before:via-border before:to-border/0">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))
        ) : acts && acts.length > 0 ? (
          acts.map((act) => (
            <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/10 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs shadow-none bg-muted/30">
                    {act.type} N. {act.number}
                  </Badge>
                  <div className="text-xs font-mono text-muted-foreground font-medium">
                    {format(new Date(act.publishDate), 'dd MMM yy', { locale: it })}
                  </div>
                </div>
                
                <h3 className="font-bold text-foreground text-lg leading-tight mb-2">
                  {act.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {act.summary}
                </p>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Scadenza: {format(new Date(act.endDate), 'dd/MM/yyyy')}
                  </span>
                  {act.themeId && (
                    <a href={`/temi/${act.themeId}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                      Tema collegato &rarr;
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed z-10 w-full">
            Nessun atto trovato con questi criteri.
          </div>
        )}
      </div>
    </div>
  );
}
