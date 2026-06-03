import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListSedute } from "@workspace/api-client-react";
import { useListPublications } from "@workspace/api-client-react";
import type { Seduta } from "@workspace/api-client-react";
import type { MacrotemaKey } from "@workspace/api-client-react";
import {
  CalendarClock,
  Calendar,
  ChevronRight,
  Building2,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const MACROTEMA_LABELS: Record<string, string> = {
  ambiente: "Ambiente e rifiuti",
  scuole: "Scuole e istruzione",
  strade: "Strade e lavori pubblici",
  sociale: "Sociale e servizi alla persona",
  cultura: "Cultura, sport e turismo",
  mobilita: "Mobilità e trasporti",
  altro: "Altri servizi e forniture",
};

const MACROTEMA_COLORS: Record<string, string> = {
  ambiente:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  scuole:
    "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  strade:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  sociale:
    "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  cultura:
    "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  mobilita:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300",
  altro: "bg-muted text-muted-foreground",
};

const MACROTEMA_OPTS: { key: string; label: string }[] = [
  { key: "all", label: "Tutti i temi" },
  { key: "ambiente", label: "Ambiente e rifiuti" },
  { key: "scuole", label: "Scuole e istruzione" },
  { key: "strade", label: "Strade e lavori pubblici" },
  { key: "sociale", label: "Sociale e servizi" },
  { key: "cultura", label: "Cultura, sport e turismo" },
  { key: "mobilita", label: "Mobilità e trasporti" },
  { key: "altro", label: "Altri servizi e forniture" },
];

function MacrotemasRow({ macrotemi }: { macrotemi: string[] }) {
  const unique = Array.from(new Set(macrotemi)).filter((m) => m !== "altro");
  if (unique.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {unique.slice(0, 4).map((m) => (
        <span
          key={m}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${MACROTEMA_COLORS[m] ?? MACROTEMA_COLORS.altro}`}
        >
          <Layers className="h-3 w-3" />
          {MACROTEMA_LABELS[m] ?? m}
        </span>
      ))}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

const UNGROUPED = "Altre sedute";

function groupByOrgano(sedute: Seduta[]) {
  const groups = new Map<string, { name: string; slug: string | null; items: Seduta[] }>();
  for (const s of sedute) {
    const key = s.organo ? s.organo.slug : UNGROUPED;
    const name = s.organo ? s.organo.name : UNGROUPED;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(s);
    } else {
      groups.set(key, { name, slug: s.organo?.slug ?? null, items: [s] });
    }
  }
  return Array.from(groups.values());
}

export function Convocazioni() {
  const { data: sedute, isLoading } = useListSedute();
  const [macrotemaFilter, setMacrotemaFilter] = useState<string>("all");

  // Load convocazione publications to get macrotema per publicationId.
  const { data: convocazioniPubs } = useListPublications({
    category: "convocazione",
    macrotema: macrotemaFilter !== "all" ? (macrotemaFilter as MacrotemaKey) : undefined,
  });

  // Build a map publicationId -> odgMacrotemi (multi-theme array from ODG points).
  // Falls back to the publication-level macrotema if no ODG points are found.
  const macrotemiByPubId = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const p of convocazioniPubs ?? []) {
      const odg = p.odgMacrotemi ?? [];
      const themes =
        odg.length > 0
          ? odg
          : p.macrotema && p.macrotema !== "altro"
            ? [p.macrotema]
            : [];
      if (themes.length > 0) m.set(p.id, themes);
    }
    return m;
  }, [convocazioniPubs]);

  // Filter sedute by macrotema if a filter is active.
  const filteredSedute = useMemo(() => {
    const all = sedute ?? [];
    if (macrotemaFilter === "all") return all;
    // Keep only sedute whose linked publication matches the macrotema filter.
    const matchingPubIds = new Set(
      (convocazioniPubs ?? []).map((p) => p.id),
    );
    return all.filter(
      (s) => s.publicationId != null && matchingPubIds.has(s.publicationId),
    );
  }, [sedute, convocazioniPubs, macrotemaFilter]);

  const groups = useMemo(() => groupByOrgano(filteredSedute), [filteredSedute]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <CalendarClock className="h-3.5 w-3.5" />
            Sedute e ordini del giorno
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
            Convocazioni
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
            Le sedute del Consiglio Comunale e delle Commissioni Consiliari,
            raggruppate per organo, con data e argomenti all'ordine del giorno.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-56">
          <Select value={macrotemaFilter} onValueChange={setMacrotemaFilter}>
            <SelectTrigger className="h-10 bg-background" aria-label="Filtra per tema">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-sm">
                  {macrotemaFilter === "all"
                    ? "Tutti i temi"
                    : MACROTEMA_LABELS[macrotemaFilter] ?? macrotemaFilter}
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-full" />
              </Card>
            ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.slug ?? g.name}>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Building2 className="h-4 w-4" />
                </span>
                {g.slug ? (
                  <Link
                    href={`/organi/${g.slug}`}
                    className="text-xl md:text-2xl font-display font-bold tracking-tight hover:text-brand transition-colors"
                  >
                    {g.name}
                  </Link>
                ) : (
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                    {g.name}
                  </h2>
                )}
              </div>

              <div className="space-y-3">
                {g.items.map((s) => {
                  const macrotemi =
                    s.publicationId != null
                      ? (macrotemiByPubId.get(s.publicationId) ?? [])
                      : [];
                  return (
                    <Link
                      key={s.id}
                      href={
                        s.publicationId != null
                          ? `/convocazioni/${s.publicationId}`
                          : "#"
                      }
                      className="block"
                    >
                      <Card className="group p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand mb-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(s.date)}
                        </div>
                        {s.agenda && (
                          <h3 className="font-display font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
                            {s.agenda}
                          </h3>
                        )}
                        {macrotemi.length > 0 && (
                          <MacrotemasRow macrotemi={macrotemi} />
                        )}
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-brand transition-colors">
                            Vedi resoconto stenografico
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>Nessuna convocazione disponibile</EmptyTitle>
            <EmptyDescription>
              {macrotemaFilter !== "all"
                ? "Nessuna convocazione trovata per il tema selezionato. Prova a cambiare il filtro."
                : "Al momento non risultano convocazioni pubblicate. Torna più tardi per aggiornamenti."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
