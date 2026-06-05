/**
 * Testi del sito — micro-copy editor.
 * Renders all site strings grouped by namespace with inline editing.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Globe, Loader2, Type, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type SiteString = {
  id: number;
  key: string;
  namespace: string;
  defaultValue: string;
  publishedValue: string | null;
  draftValue: string | null;
  richText: boolean;
  updatedAt: string;
};

const NAMESPACE_LABELS: Record<string, string> = {
  navbar: "Navigazione (Navbar)",
  footer: "Footer",
  home: "Home",
  helper: "Guida/Helper Civico",
  general: "Generali",
};

function fetchSiteStrings(): Promise<SiteString[]> {
  return fetch("/api/redazione/site-strings", { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<SiteString[]>;
  });
}

function upsertSiteString(key: string, payload: Partial<SiteString>): Promise<SiteString> {
  return fetch(`/api/redazione/site-strings/${encodeURIComponent(key)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<SiteString>;
  });
}

function publishSiteString(key: string): Promise<SiteString> {
  return fetch(`/api/redazione/site-strings/${encodeURIComponent(key)}/publish`, {
    method: "POST",
    credentials: "include",
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<SiteString>;
  });
}

function StringEditor({ str }: { str: SiteString }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState(str.draftValue ?? str.publishedValue ?? str.defaultValue);
  const [editing, setEditing] = useState(false);

  const upsert = useMutation({
    mutationFn: (draftValue: string) => upsertSiteString(str.key, { draftValue }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["redazione", "site-strings"] }); toast.success("Bozza salvata."); },
    onError: () => toast.error("Salvataggio non riuscito."),
  });

  const publish = useMutation({
    mutationFn: () => publishSiteString(str.key),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["redazione", "site-strings"] }); toast.success("Testo pubblicato."); },
    onError: () => toast.error("Pubblicazione non riuscita."),
  });

  const effectiveValue = str.publishedValue ?? str.defaultValue;
  const hasDraft = str.draftValue !== null && str.draftValue !== effectiveValue;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <code className="text-xs font-mono text-muted-foreground">{str.key}</code>
          {hasDraft && <Badge variant="warning" className="ml-2 text-[10px]">Bozza in attesa</Badge>}
        </div>
        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setEditing(false)}>
                Annulla
              </Button>
              <Button size="sm" variant="outline" className="text-xs gap-1.5" disabled={upsert.isPending} onClick={() => upsert.mutate(draft)}>
                {upsert.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Salva bozza
              </Button>
              <Button size="sm" variant="brand" className="text-xs gap-1.5" disabled={publish.isPending} onClick={async () => { await upsert.mutateAsync(draft); await publish.mutateAsync(); setEditing(false); }}>
                {publish.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                Pubblica
              </Button>
            </>
          ) : (
            <>
              {hasDraft && (
                <Button size="sm" variant="brand" className="text-xs gap-1.5" disabled={publish.isPending} onClick={() => publish.mutate()}>
                  <Globe className="h-3 w-3" />
                  Pubblica bozza
                </Button>
              )}
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setEditing(true)}>
                Modifica
              </Button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[80px] font-mono text-sm"
          placeholder="Testo…"
        />
      ) : (
        <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-3">
          {effectiveValue || <span className="text-muted-foreground italic">(vuoto — usa il default)</span>}
        </p>
      )}
      {str.defaultValue && str.defaultValue !== effectiveValue && (
        <p className="text-[10px] text-muted-foreground">
          Default: <span className="font-mono">{str.defaultValue.slice(0, 80)}{str.defaultValue.length > 80 ? "…" : ""}</span>
        </p>
      )}
    </div>
  );
}

export function RedazioneTesti() {
  const { data: strings, isLoading } = useQuery({
    queryKey: ["redazione", "site-strings"],
    queryFn: fetchSiteStrings,
  });

  const grouped = strings
    ? Object.entries(
        strings.reduce<Record<string, SiteString[]>>((acc, s) => {
          (acc[s.namespace] ??= []).push(s);
          return acc;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Testi del sito</h1>
        <p className="text-muted-foreground mt-1">
          Modifica tutti i testi statici visibili ai cittadini — navbar, footer, home, guida — senza mai fare un deploy.
          Le bozze non sono visibili agli utenti finché non vengono pubblicate.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : grouped.length === 0 ? (
        <Card className="p-8 text-center">
          <Type className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm">
            Nessun testo configurato ancora.
            I testi del sito vengono aggiunti man mano che le sezioni vengono predisposte.
          </p>
        </Card>
      ) : (
        grouped.map(([namespace, items]) => (
          <section key={namespace}>
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-4 w-4 text-brand" />
              <h2 className="font-semibold text-base">{NAMESPACE_LABELS[namespace] ?? namespace}</h2>
              <span className="text-xs text-muted-foreground">({items.length} voci)</span>
            </div>
            <div className="space-y-3">
              {items.map((s) => <StringEditor key={s.key} str={s} />)}
            </div>
          </section>
        ))
      )}

      {/* Note about helper content */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Contenuti della Guida Civica</p>
              <p className="text-sm text-muted-foreground">
                I contenuti della Guida/Helper (capitoli della storia e passi del tour) sono gestiti
                tramite l'API <code className="font-mono text-xs">/api/redazione/helper-override</code>.
                La modifica da pannello è disponibile nella prossima versione del pannello redazione.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
