import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useListBandiAdmin,
  useCreateBando,
  useUpdateBando,
  useDeleteBando,
  useConfirmBandoSuggestion,
  useConfirmBandoMatch,
  useDismissBandoMatch,
  getListBandiAdminQueryKey,
  getListBandiQueryKey,
  getGetBandiSummaryQueryKey,
  type BandoAdmin,
  type BandoMatch,
  type BandoStatus,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Loader2,
  Save,
  Pencil,
  Trash2,
  X,
  Plus,
  Sparkles,
  CheckCircle2,
  CircleSlash,
  ExternalLink,
  Megaphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const SETTORI = [
  "ambiente",
  "scuole",
  "strade",
  "sociale",
  "cultura",
  "mobilita",
  "altro",
];

const STATUS_LABELS: Record<string, string> = {
  aperto: "Aperto",
  "in-scadenza": "In scadenza",
  concluso: "Concluso",
};

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminBandi() {
  const [token, setToken] = useState<string>(() => readStoredToken());

  if (!token) {
    return (
      <TokenGate
        onAuthenticated={(value) => {
          try {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, value);
          } catch {
            /* sessionStorage unavailable — keep in-memory only */
          }
          setToken(value);
        }}
      />
    );
  }

  return (
    <AdminEditor
      token={token}
      onSignOut={() => {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setToken("");
      }}
    />
  );
}

function TokenGate({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Inserisci il token di accesso.");
      return;
    }
    onAuthenticated(trimmed);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <Card className="border-brand/30 shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl">
              Area Redazione
            </CardTitle>
            <CardDescription>
              Inserisci il token di accesso per gestire i bandi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingest-token">Token di accesso</Label>
                <Input
                  id="ingest-token"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••••••"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-label="Token di accesso redazione"
                />
              </div>
              <Button type="submit" variant="brand" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type FormState = {
  slug: string;
  title: string;
  enteErogatore: string;
  description: string;
  eligibility: string;
  importoStanziato: string;
  importoMedioAggiudicato: string;
  scadenza: string;
  status: string;
  settore: string;
  officialUrl: string;
  keywords: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  enteErogatore: "",
  description: "",
  eligibility: "",
  importoStanziato: "",
  importoMedioAggiudicato: "",
  scadenza: "",
  status: "aperto",
  settore: "altro",
  officialUrl: "",
  keywords: "",
  notes: "",
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function AdminEditor({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const queryClient = useQueryClient();
  const authRequest = {
    request: { headers: { Authorization: `Bearer ${token}` } },
  };

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const {
    data: bandi,
    isLoading,
    error: listError,
  } = useListBandiAdmin({
    ...authRequest,
    query: { queryKey: getListBandiAdminQueryKey() },
  });

  const createBando = useCreateBando(authRequest);
  const updateBando = useUpdateBando(authRequest);
  const deleteBando = useDeleteBando(authRequest);
  const confirmSuggestion = useConfirmBandoSuggestion(authRequest);
  const confirmMatch = useConfirmBandoMatch(authRequest);
  const dismissMatch = useDismissBandoMatch(authRequest);

  const isAuthError = (error: unknown): boolean => {
    const status = (error as { status?: number } | null)?.status;
    return status === 401 || status === 403;
  };

  const handleAuthError = () => {
    toast.error("Sessione scaduta o token non valido", {
      description: "Effettua di nuovo l'accesso.",
    });
    onSignOut();
  };

  if (listError && isAuthError(listError)) {
    handleAuthError();
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListBandiAdminQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListBandiQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetBandiSummaryQueryKey() });
  };

  const resetForm = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (b: BandoAdmin) => {
    setEditingSlug(b.slug);
    setForm({
      slug: b.slug,
      title: b.title,
      enteErogatore: b.enteErogatore,
      description: b.description,
      eligibility: b.eligibility,
      importoStanziato: b.importoStanziato ?? "",
      importoMedioAggiudicato: b.importoMedioAggiudicato ?? "",
      scadenza: toDateInput(b.scadenza),
      status: b.status,
      settore: b.settore ?? "altro",
      officialUrl: b.officialUrl ?? "",
      keywords: (b.keywords ?? []).join(", "),
      notes: b.notes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => {
    const keywords = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    return {
      title: form.title.trim(),
      enteErogatore: form.enteErogatore.trim(),
      description: form.description.trim(),
      eligibility: form.eligibility.trim(),
      importoStanziato: form.importoStanziato.trim() || null,
      importoMedioAggiudicato: form.importoMedioAggiudicato.trim() || null,
      scadenza: form.scadenza ? new Date(form.scadenza).toISOString() : null,
      status: form.status as BandoStatus,
      settore: form.settore || null,
      officialUrl: form.officialUrl.trim() || null,
      keywords,
      notes: form.notes.trim(),
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim();
    const title = form.title.trim();
    if (!title) {
      toast.error("Il titolo è obbligatorio.");
      return;
    }
    if (editingSlug == null && !slug) {
      toast.error("Lo slug è obbligatorio.");
      return;
    }

    try {
      const payload = buildPayload();
      if (editingSlug != null) {
        await updateBando.mutateAsync({ slug: editingSlug, data: payload });
        toast.success("Bando aggiornato.");
      } else {
        await createBando.mutateAsync({ data: { slug, ...payload } });
        toast.success("Bando creato.");
      }
      invalidate();
      resetForm();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita", {
        description: "Controlla i dati e riprova.",
      });
    }
  };

  const handleDelete = async (b: BandoAdmin) => {
    if (!window.confirm(`Eliminare definitivamente il bando "${b.title}"?`)) {
      return;
    }
    try {
      await deleteBando.mutateAsync({ slug: b.slug });
      toast.success("Bando eliminato.");
      if (editingSlug === b.slug) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const handleConfirmSuggestion = async (b: BandoAdmin) => {
    try {
      await confirmSuggestion.mutateAsync({ slug: b.slug });
      toast.success("Candidato confermato.", {
        description: "Il bando è ora pubblicato nel catalogo.",
      });
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Conferma non riuscita.");
    }
  };

  const handleConfirmMatch = async (matchId: number) => {
    try {
      await confirmMatch.mutateAsync({ matchId });
      toast.success("Riscontro confermato.");
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita.");
    }
  };

  const handleDismissMatch = async (matchId: number) => {
    try {
      await dismissMatch.mutateAsync({ matchId });
      toast.success("Riscontro scartato.");
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita.");
    }
  };

  const saving = createBando.isPending || updateBando.isPending;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Area Redazione
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Gestione Bandi
          </h1>
          <p className="text-muted-foreground">
            Cura il catalogo dei bandi, conferma i candidati proposti
            automaticamente e valida i riscontri di partecipazione trovati tra
            atti, contratti e progetti PNRR.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              {editingSlug != null ? (
                <>
                  <Pencil className="h-5 w-5 text-brand" /> Modifica bando
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-brand" /> Nuovo bando
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingSlug != null
                ? "Stai modificando un bando esistente. Lo slug non è modificabile."
                : "Aggiungi un nuovo bando al catalogo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bando-slug">Slug (identificativo)</Label>
                <Input
                  id="bando-slug"
                  value={form.slug}
                  disabled={editingSlug != null}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="es. pnrr-rigenerazione-urbana-2026"
                  data-testid="input-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-title">Titolo</Label>
                <Input
                  id="bando-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="es. PNRR – Rigenerazione urbana"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-ente">Ente erogatore</Label>
                <Input
                  id="bando-ente"
                  value={form.enteErogatore}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, enteErogatore: e.target.value }))
                  }
                  placeholder="es. Regione Calabria, Ministero dell'Interno"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-description">Descrizione</Label>
                <Textarea
                  id="bando-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Oggetto e finalità del bando."
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-eligibility">
                  Requisiti di partecipazione
                </Label>
                <Textarea
                  id="bando-eligibility"
                  value={form.eligibility}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, eligibility: e.target.value }))
                  }
                  placeholder="Chi può partecipare e a quali condizioni."
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bando-stanziato">Importo stanziato (€)</Label>
                  <Input
                    id="bando-stanziato"
                    inputMode="decimal"
                    value={form.importoStanziato}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        importoStanziato: e.target.value,
                      }))
                    }
                    placeholder="5000000.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bando-medio">
                    Importo medio aggiudicato (€)
                  </Label>
                  <Input
                    id="bando-medio"
                    inputMode="decimal"
                    value={form.importoMedioAggiudicato}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        importoMedioAggiudicato: e.target.value,
                      }))
                    }
                    placeholder="1200000.00"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bando-scadenza">Scadenza</Label>
                  <Input
                    id="bando-scadenza"
                    type="date"
                    value={form.scadenza}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, scadenza: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stato</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, status: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aperto">Aperto</SelectItem>
                      <SelectItem value="in-scadenza">In scadenza</SelectItem>
                      <SelectItem value="concluso">Concluso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Settore</Label>
                <Select
                  value={form.settore}
                  onValueChange={(v) => setForm((p) => ({ ...p, settore: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SETTORI.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-url">Link ufficiale (opzionale)</Label>
                <Input
                  id="bando-url"
                  value={form.officialUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, officialUrl: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-keywords">
                  Parole chiave (separate da virgola)
                </Label>
                <Input
                  id="bando-keywords"
                  value={form.keywords}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, keywords: e.target.value }))
                  }
                  placeholder="rigenerazione urbana, riqualificazione"
                />
                <p className="text-xs text-muted-foreground">
                  Usate per incrociare automaticamente atti, contratti e PNRR e
                  rilevare la partecipazione. Puoi inserire anche CUP o CIG.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bando-notes">Note interne (opzionale)</Label>
                <Textarea
                  id="bando-notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="min-h-[50px]"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  variant="brand"
                  className="gap-2"
                  disabled={saving}
                  data-testid="button-save"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingSlug != null ? "Salva modifiche" : "Crea bando"}
                </Button>
                {editingSlug != null && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                    Annulla
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Megaphone className="h-5 w-5 text-brand" /> Bandi configurati
            </CardTitle>
            <CardDescription>
              Gestisci i bandi, conferma i candidati e valida i riscontri di
              partecipazione.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : bandi && bandi.length > 0 ? (
              <div className="space-y-3">
                {bandi.map((b) => (
                  <BandoRow
                    key={b.id}
                    bando={b}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onConfirmSuggestion={handleConfirmSuggestion}
                    onConfirmMatch={handleConfirmMatch}
                    onDismissMatch={handleDismissMatch}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun bando configurato. Creane uno con il modulo a fianco.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BandoRow({
  bando,
  onEdit,
  onDelete,
  onConfirmSuggestion,
  onConfirmMatch,
  onDismissMatch,
}: {
  bando: BandoAdmin;
  onEdit: (b: BandoAdmin) => void;
  onDelete: (b: BandoAdmin) => void;
  onConfirmSuggestion: (b: BandoAdmin) => void;
  onConfirmMatch: (matchId: number) => void;
  onDismissMatch: (matchId: number) => void;
}) {
  const pending = bando.matches.filter((m) => !m.confirmed && !m.dismissed);
  const confirmed = bando.matches.filter((m) => m.confirmed && !m.dismissed);

  return (
    <div
      className="rounded-lg border border-border p-4"
      data-testid={`row-bando-${bando.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold leading-tight">{bando.title}</span>
            {bando.source === "suggested" ? (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" /> Candidato
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Pubblicato
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABELS[bando.status]}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {bando.esito.replace("-", " ")}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{bando.slug}</p>
          <p className="text-xs text-muted-foreground">{bando.enteErogatore}</p>
          {bando.officialUrl && (
            <a
              href={bando.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Link ufficiale
            </a>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {bando.source === "suggested" && (
            <Button
              size="sm"
              variant="brand"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => onConfirmSuggestion(bando)}
              data-testid={`button-confirm-suggestion-${bando.slug}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Conferma
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => onEdit(bando)}
          >
            <Pencil className="h-3.5 w-3.5" /> Modifica
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(bando)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Elimina
          </Button>
        </div>
      </div>

      {(pending.length > 0 || confirmed.length > 0) && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Riscontri di partecipazione
          </p>
          {confirmed.map((m) => (
            <MatchAdminRow
              key={m.id}
              match={m}
              confirmed
              onConfirm={onConfirmMatch}
              onDismiss={onDismissMatch}
            />
          ))}
          {pending.map((m) => (
            <MatchAdminRow
              key={m.id}
              match={m}
              confirmed={false}
              onConfirm={onConfirmMatch}
              onDismiss={onDismissMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TARGET_LABELS: Record<string, string> = {
  publication: "Atto",
  contract: "Contratto",
  pnrr: "PNRR",
};

function MatchAdminRow({
  match,
  confirmed,
  onConfirm,
  onDismiss,
}: {
  match: BandoMatch;
  confirmed: boolean;
  onConfirm: (matchId: number) => void;
  onDismiss: (matchId: number) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md bg-muted/40 p-2">
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[9px]">
            {TARGET_LABELS[match.targetType] ?? match.targetType}
          </Badge>
          {confirmed && (
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-[9px] text-emerald-700 dark:text-emerald-400"
            >
              Confermato
            </Badge>
          )}
          {match.reference && (
            <span className="font-mono text-[9px] text-muted-foreground">
              {match.reference}
            </span>
          )}
        </div>
        <p className="line-clamp-1 text-xs">{match.title || "—"}</p>
        <p className="text-[10px] text-muted-foreground">{match.matchReason}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        {!confirmed && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-600"
            onClick={() => onConfirm(match.id)}
            aria-label="Conferma riscontro"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={() => onDismiss(match.id)}
          aria-label="Scarta riscontro"
        >
          <CircleSlash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
