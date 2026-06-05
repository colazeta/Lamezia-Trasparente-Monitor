/**
 * Pagine & Zone — block-based page builder inside /redazione panel.
 * Allows editors to add, reorder, enable/disable, and edit blocks
 * for the site's configurable pages.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Globe,
  LayoutDashboard,
  Type,
  Image,
  ArrowRight,
  BarChart3,
  HelpCircle,
  Activity,
  Grid,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PageBlock = {
  id: number;
  pageSlug: string;
  blockType: string;
  position: number;
  enabled: boolean;
  status: string;
  content: Record<string, unknown>;
  draftContent: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

const PAGE_OPTIONS = [
  { slug: "home", label: "Home" },
  { slug: "temi", label: "Temi" },
  { slug: "domande", label: "Domande" },
  { slug: "contratti", label: "Contratti" },
  { slug: "pnrr", label: "PNRR" },
  { slug: "albo", label: "Albo" },
];

const BLOCK_CATALOG: { type: string; label: string; description: string; icon: React.ElementType }[] = [
  { type: "hero", label: "Hero / Intro", description: "Sezione introduttiva con titolo e sottotitolo", icon: LayoutDashboard },
  { type: "stats", label: "Statistiche", description: "Contatori principali (atti, contratti, ecc.)", icon: BarChart3 },
  { type: "quick_links", label: "Accesso rapido", description: "Griglia di link alle sezioni", icon: Grid },
  { type: "questions_featured", label: "Domande in evidenza", description: "Schede delle domande in evidenza", icon: HelpCircle },
  { type: "recent_activity", label: "Attività recente", description: "Ultimi aggiornamenti dalla piattaforma", icon: Activity },
  { type: "themes_grid", label: "Temi", description: "Griglia di temi di monitoraggio", icon: Layers },
  { type: "convocazioni", label: "Convocazioni", description: "Prossime sedute istituzionali", icon: Globe },
  { type: "cta_banner", label: "CTA Banner", description: "Invito all'azione (segnalazione, ecc.)", icon: Megaphone },
  { type: "rich_text", label: "Testo libero", description: "Paragrafo editoriale con Markdown", icon: Type },
  { type: "image", label: "Immagine", description: "Immagine con didascalia opzionale", icon: Image },
  { type: "call_to_action", label: "Call to Action", description: "Pulsante con testo e link", icon: ArrowRight },
  { type: "section_embed", label: "Sezione dati", description: "Incorpora una sezione dati esistente", icon: Globe },
];

function fetchBlocks(pageSlug: string): Promise<PageBlock[]> {
  return fetch(`/api/redazione/pages/${pageSlug}/blocks/draft`, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<PageBlock[]>;
  });
}

function addBlock(pageSlug: string, blockType: string, position: number): Promise<PageBlock> {
  return fetch(`/api/redazione/pages/${pageSlug}/blocks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blockType, position, status: "draft" }),
  }).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
}

function patchBlock(pageSlug: string, id: number, data: Partial<PageBlock>): Promise<PageBlock> {
  return fetch(`/api/redazione/pages/${pageSlug}/blocks/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
}

function deleteBlock(pageSlug: string, id: number): Promise<void> {
  return fetch(`/api/redazione/pages/${pageSlug}/blocks/${id}`, { method: "DELETE", credentials: "include" }).then((r) => { if (!r.ok) throw new Error(`${r.status}`); });
}

function reorderBlocks(pageSlug: string, order: { id: number; position: number }[]): Promise<void> {
  return fetch(`/api/redazione/pages/${pageSlug}/blocks/reorder`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  }).then((r) => { if (!r.ok) throw new Error(`${r.status}`); });
}

export function RedazionePagine() {
  const [pageSlug, setPageSlug] = useState("home");
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const qc = useQueryClient();

  const queryKey = ["redazione", "pages", pageSlug, "blocks"];
  const { data: blocks, isLoading } = useQuery({ queryKey, queryFn: () => fetchBlocks(pageSlug) });

  const sorted = [...(blocks ?? [])].sort((a, b) => a.position - b.position);

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const addMutation = useMutation({
    mutationFn: ({ type }: { type: string }) => addBlock(pageSlug, type, (sorted.at(-1)?.position ?? -1) + 1),
    onSuccess: () => { invalidate(); setShowCatalog(false); toast.success("Blocco aggiunto."); },
    onError: () => toast.error("Aggiunta non riuscita."),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PageBlock> }) => patchBlock(pageSlug, id, data),
    onSuccess: () => { invalidate(); toast.success("Blocco aggiornato."); },
    onError: () => toast.error("Aggiornamento non riuscito."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBlock(pageSlug, id),
    onSuccess: () => { invalidate(); toast.success("Blocco rimosso."); },
    onError: () => toast.error("Rimozione non riuscita."),
  });

  const move = (block: PageBlock, dir: -1 | 1) => {
    const idx = sorted.findIndex((b) => b.id === block.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) return;
    const other = sorted[target];
    reorderBlocks(pageSlug, [
      { id: block.id, position: other.position },
      { id: other.id, position: block.position },
    ]).then(invalidate).catch(() => toast.error("Riordino non riuscito."));
  };

  const publish = (block: PageBlock) => {
    patchMutation.mutate({
      id: block.id,
      data: { status: "published", content: block.draftContent ?? block.content, draftContent: null },
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Pagine & Zone</h1>
        <p className="text-muted-foreground mt-1">
          Componi le pagine scegliendo blocchi da un catalogo predefinito.
          I cittadini vedono sempre la versione pubblicata.
        </p>
      </div>

      {/* Page picker */}
      <div className="flex flex-wrap gap-2">
        {PAGE_OPTIONS.map((p) => (
          <button
            key={p.slug}
            onClick={() => { setPageSlug(p.slug); setEditingId(null); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors border ${
              pageSlug === p.slug
                ? "bg-brand/10 border-brand/30 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Block list */}
      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl">
          <Layers className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nessun blocco configurato per questa pagina.</p>
          <p className="text-xs mt-1">Aggiungi blocchi dal catalogo per comporre il layout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((block) => {
            const catalogEntry = BLOCK_CATALOG.find((c) => c.type === block.blockType);
            const Icon = catalogEntry?.icon ?? Layers;
            const isEditing = editingId === block.id;
            const hasDraft = block.draftContent !== null;
            return (
              <Card key={block.id} className={`overflow-hidden transition-all ${!block.enabled ? "opacity-50" : ""} ${isEditing ? "border-brand/50 ring-1 ring-brand/20" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Reorder */}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => move(block, -1)} className="text-muted-foreground hover:text-foreground"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => move(block, 1)} className="text-muted-foreground hover:text-foreground"><ArrowDown className="h-3.5 w-3.5" /></button>
                    </div>
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-4 w-4" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{catalogEntry?.label ?? block.blockType}</span>
                        <Badge variant={block.status === "published" ? "success" : "secondary"} className="text-[10px]">
                          {block.status === "published" ? "Pubbl." : "Bozza"}
                        </Badge>
                        {hasDraft && <Badge variant="warning" className="text-[10px]">Bozza in attesa</Badge>}
                        {!block.enabled && <Badge variant="outline" className="text-[10px]">Disabilitato</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{catalogEntry?.description}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={block.enabled ? "Disabilita" : "Abilita"} onClick={() => patchMutation.mutate({ id: block.id, data: { enabled: !block.enabled } })}>
                        {block.enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      {hasDraft && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-brand" title="Pubblica bozza" onClick={() => publish(block)}>
                          <Globe className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(isEditing ? null : block.id)}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (window.confirm("Rimuovere questo blocco?")) deleteMutation.mutate(block.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline content editor */}
                  {isEditing && (
                    <BlockContentEditor
                      block={block}
                      onSave={(content) => {
                        patchMutation.mutate({ id: block.id, data: { draftContent: content } });
                        setEditingId(null);
                      }}
                      onPublish={(content) => {
                        patchMutation.mutate({ id: block.id, data: { content, draftContent: null, status: "published" } });
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add block */}
      {showCatalog ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Catalogo blocchi</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCatalog(false)}>Chiudi</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BLOCK_CATALOG.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.type}
                  onClick={() => addMutation.mutate({ type: c.type })}
                  disabled={addMutation.isPending}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-brand/40 hover:bg-brand/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setShowCatalog(true)}>
          <Plus className="h-4 w-4" />
          Aggiungi blocco
        </Button>
      )}
    </div>
  );
}

function BlockContentEditor({
  block,
  onSave,
  onPublish,
  onCancel,
}: {
  block: PageBlock;
  onSave: (content: Record<string, unknown>) => void;
  onPublish: (content: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const currentContent = block.draftContent ?? block.content;
  const [title, setTitle] = useState((currentContent.title as string) ?? "");
  const [subtitle, setSubtitle] = useState((currentContent.subtitle as string) ?? "");
  const [body, setBody] = useState((currentContent.body as string) ?? "");
  const [ctaLabel, setCtaLabel] = useState((currentContent.ctaLabel as string) ?? "");
  const [ctaUrl, setCtaUrl] = useState((currentContent.ctaUrl as string) ?? "");

  const buildContent = (): Record<string, unknown> => ({
    ...(title && { title }),
    ...(subtitle && { subtitle }),
    ...(body && { body }),
    ...(ctaLabel && { ctaLabel }),
    ...(ctaUrl && { ctaUrl }),
  });

  const showTitle = !["stats", "quick_links", "recent_activity", "convocazioni", "section_embed"].includes(block.blockType);
  const showSubtitle = ["hero", "cta_banner", "rich_text"].includes(block.blockType);
  const showBody = ["hero", "rich_text", "cta_banner"].includes(block.blockType);
  const showCta = ["cta_banner", "call_to_action"].includes(block.blockType);

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4">
      {showTitle && (
        <div className="space-y-1.5">
          <Label className="text-xs">Titolo</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo del blocco…" className="h-8 text-sm" />
        </div>
      )}
      {showSubtitle && (
        <div className="space-y-1.5">
          <Label className="text-xs">Sottotitolo</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sottotitolo…" className="h-8 text-sm" />
        </div>
      )}
      {showBody && (
        <div className="space-y-1.5">
          <Label className="text-xs">Testo (Markdown)</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Testo…" className="min-h-[80px] text-sm font-mono" />
        </div>
      )}
      {showCta && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Etichetta pulsante</Label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Es. Invia segnalazione" className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL / percorso</Label>
            <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="Es. /segnalazioni" className="h-8 text-sm" />
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onSave(buildContent())}>
          <Save className="h-3.5 w-3.5" /> Salva bozza
        </Button>
        <Button size="sm" variant="brand" className="gap-1.5 text-xs" onClick={() => onPublish(buildContent())}>
          <Globe className="h-3.5 w-3.5" /> Pubblica
        </Button>
        <Button size="sm" variant="ghost" className="text-xs" onClick={onCancel}>Annulla</Button>
      </div>
    </div>
  );
}
