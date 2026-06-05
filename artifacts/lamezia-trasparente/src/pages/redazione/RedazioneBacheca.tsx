import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  Activity,
  HelpCircle,
  Link2Off,
  Rss,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

type FeedStatus = {
  id: number;
  source: string;
  label: string;
  url: string;
  status: string;
  error: string | null;
  itemsTotal: number;
  itemsNew: number;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
};

const INGESTION_SOURCES = [
  { source: "albo", label: "Albo Pretorio (Tinn)" },
  { source: "anac", label: "Contratti & Appalti (ANAC)" },
  { source: "pnrr", label: "Attuazione PNRR" },
  { source: "organi", label: "Organi Istituzionali" },
];

function fetchFeedStatus(): Promise<FeedStatus[]> {
  return fetch("/api/redazione/bacheca/feed-status", {
    credentials: "include",
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<FeedStatus[]>;
  });
}

function triggerIngestion(source: string): Promise<{ ok: boolean; feedStatus: FeedStatus[] }> {
  return fetch(`/api/redazione/bacheca/trigger/${source}`, {
    method: "POST",
    credentials: "include",
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });
}

function statusIcon(status: string) {
  switch (status) {
    case "ok":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "ok":
      return <Badge variant="success">OK</Badge>;
    case "error":
      return <Badge variant="destructive">Errore</Badge>;
    case "running":
      return <Badge variant="brand">In corso</Badge>;
    default:
      return <Badge variant="secondary">In attesa</Badge>;
  }
}

export function RedazioneBacheca() {
  const qc = useQueryClient();
  const [triggering, setTriggering] = useState<string | null>(null);

  const { data: feedStatus, isLoading } = useQuery({
    queryKey: ["redazione", "feed-status"],
    queryFn: fetchFeedStatus,
    refetchInterval: 30_000,
  });

  const trigger = useMutation({
    mutationFn: (source: string) => triggerIngestion(source),
    onMutate: (source) => setTriggering(source),
    onSuccess: (data) => {
      toast.success("Aggiornamento avviato con successo.");
      qc.setQueryData(["redazione", "feed-status"], data.feedStatus);
    },
    onError: () => toast.error("Aggiornamento non riuscito. Riprova."),
    onSettled: () => setTriggering(null),
  });

  // Compute alerts
  const alerts: string[] = [];
  if (feedStatus) {
    for (const fs of feedStatus) {
      if (fs.status === "error") {
        alerts.push(`⚠️ ${fs.label}: errore nell'ultimo aggiornamento.`);
      }
      if (fs.lastCheckedAt) {
        const hours = (Date.now() - new Date(fs.lastCheckedAt).getTime()) / 3_600_000;
        if (hours > 48) {
          alerts.push(`⏰ ${fs.label}: non si aggiorna da più di 2 giorni.`);
        }
      }
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Bacheca</h1>
        <p className="text-muted-foreground mt-1">
          Stato delle fonti dati e avvisi per la redazione.
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
              <AlertTriangle className="h-4 w-4" />
              Avvisi ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {alerts.map((a, i) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-300">
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Feed Status */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-base">Fonti dati</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
            : INGESTION_SOURCES.map(({ source, label }) => {
                const fs = feedStatus?.find((f) => f.source === source);
                const isTriggering = triggering === source;
                return (
                  <Card key={source} className="overflow-hidden">
                    <CardHeader className="pb-3 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                            {fs ? statusIcon(fs.status) : <Clock className="h-4 w-4 text-muted-foreground" />}
                            {label}
                          </CardTitle>
                          {fs && (
                            <CardDescription className="text-xs">
                              {fs.lastCheckedAt
                                ? `Aggiornato ${formatDistanceToNow(new Date(fs.lastCheckedAt), { addSuffix: true, locale: it })}`
                                : "Mai aggiornato"}
                            </CardDescription>
                          )}
                        </div>
                        {fs ? statusBadge(fs.status) : <Badge variant="secondary">Sconosciuto</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      {fs?.error && (
                        <p className="text-xs text-red-500 mb-3 font-mono line-clamp-2">{fs.error}</p>
                      )}
                      {fs && (
                        <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                          <span>{fs.itemsTotal.toLocaleString("it")} record totali</span>
                          {fs.itemsNew > 0 && (
                            <span className="text-green-600 font-semibold">+{fs.itemsNew} nuovi</span>
                          )}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        disabled={isTriggering}
                        onClick={() => trigger.mutate(source)}
                      >
                        {isTriggering ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Aggiorna ora
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
          <Rss className="h-4 w-4 text-brand" />
          Strumenti rapidi
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-brand shrink-0" />
              <div>
                <div className="text-sm font-semibold">Copertura Domande</div>
                <div className="text-xs text-muted-foreground">
                  Assicurati che ogni sezione abbia almeno una Domanda associata nella sezione "Domande".
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Link2Off className="h-5 w-5 text-brand shrink-0" />
              <div>
                <div className="text-sm font-semibold">Verifica destinazioni</div>
                <div className="text-xs text-muted-foreground">
                  Controlla nella sezione "Domande" che nessuna voce punti a una pagina non più valida.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
