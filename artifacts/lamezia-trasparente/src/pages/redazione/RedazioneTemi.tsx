import { useState } from "react";
import {
  useListThemes,
  getListThemesQueryKey,
  type Theme,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, FileText, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_MAP: Record<string, { label: string; variant: "success" | "brand" | "secondary" | "outline" }> = {
  aperto:      { label: "Aperto",      variant: "success" },
  in_corso:    { label: "In corso",    variant: "brand" },
  monitoraggio:{ label: "Monitoraggio",variant: "secondary" },
  chiuso:      { label: "Chiuso",      variant: "outline" },
};

const STATUS_TRANSITIONS: Record<string, { to: string; label: string }[]> = {
  aperto:       [{ to: "in_corso", label: "→ In corso" }, { to: "chiuso", label: "Chiudi" }],
  in_corso:     [{ to: "monitoraggio", label: "→ Monitoraggio" }, { to: "chiuso", label: "Chiudi" }],
  monitoraggio: [{ to: "in_corso", label: "→ In corso" }, { to: "chiuso", label: "Chiudi" }],
  chiuso:       [{ to: "aperto", label: "Riapri" }],
};

export function RedazioneTemi() {
  const [search, setSearch] = useState("");
  const { data: themes, isLoading } = useListThemes({ search: search || undefined });
  const [pending, setPending] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const filtered = (themes ?? []).filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.summary.toLowerCase().includes(search.toLowerCase()),
  );

  async function changeStatus(id: number, status: string) {
    setPending(id);
    try {
      const res = await fetch(`${basePath}/api/redazione/themes/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Errore di rete");
      await queryClient.invalidateQueries({ queryKey: getListThemesQueryKey() });
      toast.success("Stato tema aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento dello stato");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Temi</h1>
        <p className="text-muted-foreground mt-1">
          Visualizza e gestisci i temi di monitoraggio civico. Cambia stato e accedi alla cronistoria direttamente dal pannello.
        </p>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Cerca tema…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)
          : filtered.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} onChangeStatus={changeStatus} pending={pending} />
            ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nessun tema trovato.
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  onChangeStatus,
  pending,
}: {
  theme: Theme;
  onChangeStatus: (id: number, status: string) => Promise<void>;
  pending: number | null;
}) {
  const status = STATUS_MAP[theme.status] ?? { label: theme.status, variant: "secondary" as const };
  const transitions = STATUS_TRANSITIONS[theme.status] ?? [];
  const isPending = pending === theme.id;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2 justify-between">
          <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
            {theme.title}
          </CardTitle>
          <Badge variant={status.variant} className="shrink-0 text-xs">
            {status.label}
          </Badge>
        </div>
        <CardDescription className="text-xs line-clamp-2 mt-1">{theme.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 mt-auto space-y-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {theme.followerCount} follower
          </span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs flex-1" asChild>
            <Link href={`/temi/${theme.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Vedi
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs flex-1" asChild>
            <Link href={`/temi/${theme.id}`}>
              <History className="h-3.5 w-3.5" />
              Cronistoria
            </Link>
          </Button>
        </div>

        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
            {transitions.map((t) => (
              <Button
                key={t.to}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                disabled={isPending}
                onClick={() => onChangeStatus(theme.id, t.to)}
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : t.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
