import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { Megaphone, CheckCircle2, Clock, AlertCircle, Archive, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; variant: "success" | "brand" | "warning" | "secondary" | "outline" }> = {
  ricevuta:       { label: "Ricevuta",         icon: Clock,         variant: "secondary" },
  in_valutazione: { label: "In Valutazione",   icon: AlertCircle,   variant: "warning" },
  presa_in_carico:{ label: "Presa in carico",  icon: CheckCircle2,  variant: "brand" },
  archiviata:     { label: "Archiviata",        icon: Archive,       variant: "outline" },
};

type EditorialReport = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  citizenName?: string | null;
  createdAt: string;
};

const editorialReportsQueryKey = ["redazioneReports"] as const;

async function fetchEditorialReports(): Promise<EditorialReport[]> {
  const res = await fetch(`${basePath}/api/redazione/reports`, { credentials: "include" });
  if (!res.ok) throw new Error("Errore nel caricamento delle segnalazioni");
  return res.json();
}

const MODERATION_ACTIONS: { to: string; label: string }[] = [
  { to: "in_valutazione",  label: "In valutazione" },
  { to: "presa_in_carico", label: "Prendi in carico" },
  { to: "archiviata",      label: "Archivia" },
];

export function RedazioneSegnalazioni() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pending, setPending] = useState<number | null>(null);
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: editorialReportsQueryKey,
    queryFn: fetchEditorialReports,
  });
  const queryClient = useQueryClient();

  const filtered = (reports ?? []).filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function moderate(id: number, status: string) {
    setPending(id);
    try {
      const res = await fetch(`${basePath}/api/redazione/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore di rete");
      await queryClient.invalidateQueries({ queryKey: editorialReportsQueryKey });
      await refetch();
      toast.success("Stato aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento dello stato");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Segnalazioni</h1>
        <p className="text-muted-foreground mt-1">
          Elenco delle segnalazioni inviate dai cittadini. Modifica lo stato per aggiornare il flusso di lavoro.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Cerca segnalazione…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tutti gli stati</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Aggiorna
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>Nessuna segnalazione trovata.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const statusInfo = STATUS_MAP[report.status] ?? { label: report.status, icon: Clock, variant: "secondary" as const };
            const Icon = statusInfo.icon;
            const isPending = pending === report.id;
            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold truncate">{report.title}</h3>
                        <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                        {report.category && <Badge variant="outline" className="text-[10px]">{report.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {report.location && <span>{report.location}</span>}
                        {report.citizenName && <span>— {report.citizenName}</span>}
                        <span>{format(new Date(report.createdAt), "dd MMM yyyy", { locale: it })}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {MODERATION_ACTIONS.filter((a) => a.to !== report.status).map((action) => (
                          <Button
                            key={action.to}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            disabled={isPending}
                            onClick={() => moderate(report.id, action.to)}
                          >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
