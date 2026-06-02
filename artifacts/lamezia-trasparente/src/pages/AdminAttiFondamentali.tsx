import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useListFundamentalActsAdmin,
  useCreateFundamentalAct,
  useUpdateFundamentalAct,
  useDeleteFundamentalAct,
  useConfirmFundamentalActSuggestion,
  useRequestDocumentUploadUrl,
  getListFundamentalActsAdminQueryKey,
  getListFundamentalActsQueryKey,
  type FundamentalActAdmin,
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
  FileUp,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  FileText,
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

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];
const MAX_DOCUMENT_SIZE_BYTES = 30 * 1024 * 1024;

type ManualFile = {
  name: string;
  storagePath: string;
  contentType: string | null;
  size: number | null;
};

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminAttiFondamentali() {
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
              Inserisci il token di accesso per gestire gli atti fondamentali.
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
  label: string;
  keywords: string;
  title: string;
  description: string;
  manualOfficialUrl: string;
  manualFile: ManualFile | null;
};

const EMPTY_FORM: FormState = {
  slug: "",
  label: "",
  keywords: "",
  title: "",
  description: "",
  manualOfficialUrl: "",
  manualFile: null,
};

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const {
    data: acts,
    isLoading,
    error: listError,
  } = useListFundamentalActsAdmin({
    ...authRequest,
    query: { queryKey: getListFundamentalActsAdminQueryKey() },
  });

  const requestUploadUrl = useRequestDocumentUploadUrl(authRequest);
  const createAct = useCreateFundamentalAct(authRequest);
  const updateAct = useUpdateFundamentalAct(authRequest);
  const deleteAct = useDeleteFundamentalAct(authRequest);
  const confirmSuggestion = useConfirmFundamentalActSuggestion(authRequest);

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
    queryClient.invalidateQueries({
      queryKey: getListFundamentalActsAdminQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getListFundamentalActsQueryKey(),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (act: FundamentalActAdmin) => {
    setEditingId(act.id);
    setForm({
      slug: act.slug,
      label: act.label,
      keywords: (act.keywords ?? []).join(", "),
      title: act.title ?? "",
      description: act.description ?? "",
      manualOfficialUrl: act.manualOfficialUrl ?? "",
      manualFile: act.manualFile,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      toast.error("Tipo di documento non supportato", {
        description: "Usa PDF o file Office (Word, Excel, PowerPoint).",
      });
      return;
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      toast.error("Documento troppo grande", {
        description: "La dimensione massima è 30 MB.",
      });
      return;
    }

    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed with status ${putRes.status}`);
      }

      // The object is served via /api/storage<objectPath> (see storage route).
      const storagePath = `/api/storage${objectPath}`;
      setForm((prev) => ({
        ...prev,
        manualFile: {
          name: file.name,
          storagePath,
          contentType: file.type,
          size: file.size,
        },
      }));
      toast.success("Documento caricato", {
        description: "Salva l'atto per pubblicarlo.",
      });
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Caricamento non riuscito", {
        description: "Non è stato possibile caricare il documento. Riprova.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim();
    const label = form.label.trim();
    if (!label) {
      toast.error("L'etichetta è obbligatoria.");
      return;
    }
    if (editingId == null && !slug) {
      toast.error("Lo slug è obbligatorio.");
      return;
    }

    const keywords = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    const title = form.title.trim() ? form.title.trim() : null;
    const description = form.description.trim()
      ? form.description.trim()
      : null;
    const manualOfficialUrl = form.manualOfficialUrl.trim()
      ? form.manualOfficialUrl.trim()
      : null;

    try {
      if (editingId != null) {
        await updateAct.mutateAsync({
          id: editingId,
          data: {
            label,
            keywords,
            title,
            description,
            manualOfficialUrl,
            manualFile: form.manualFile,
          },
        });
        toast.success("Atto aggiornato.");
      } else {
        await createAct.mutateAsync({
          data: {
            slug,
            label,
            keywords,
            title,
            description,
            manualOfficialUrl,
            manualFile: form.manualFile,
          },
        });
        toast.success("Atto creato.");
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

  const handleDelete = async (act: FundamentalActAdmin) => {
    if (
      !window.confirm(
        `Eliminare definitivamente il tipo di atto "${act.label}"?`,
      )
    ) {
      return;
    }
    try {
      await deleteAct.mutateAsync({ id: act.id });
      toast.success("Atto eliminato.");
      if (editingId === act.id) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const handleConfirmSuggestion = async (act: FundamentalActAdmin) => {
    try {
      await confirmSuggestion.mutateAsync({ id: act.id });
      toast.success("Suggerimento confermato.", {
        description: "L'atto ora punta alla pubblicazione collegata.",
      });
      if (editingId === act.id) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Conferma non riuscita.");
    }
  };

  const saving = createAct.isPending || updateAct.isPending;

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
            Gestione Atti fondamentali
          </h1>
          <p className="text-muted-foreground">
            Definisci i tipi di atto, carica file o link ufficiali e conferma i
            suggerimenti trovati automaticamente tra le pubblicazioni.
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
              {editingId != null ? (
                <>
                  <Pencil className="h-5 w-5 text-brand" /> Modifica atto
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-brand" /> Nuovo atto
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingId != null
                ? "Stai modificando un atto esistente. Lo slug non è modificabile."
                : "Aggiungi un nuovo tipo di atto fondamentale."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="act-slug">Slug (identificativo)</Label>
                <Input
                  id="act-slug"
                  value={form.slug}
                  disabled={editingId != null}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="es. piao, dup, bilancio-previsione"
                  data-testid="input-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-label">Etichetta</Label>
                <Input
                  id="act-label"
                  value={form.label}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, label: e.target.value }))
                  }
                  placeholder="es. PIAO – Piano Integrato di Attività e Organizzazione"
                  data-testid="input-label"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-keywords">
                  Parole chiave (separate da virgola)
                </Label>
                <Input
                  id="act-keywords"
                  value={form.keywords}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, keywords: e.target.value }))
                  }
                  placeholder="piao, piano integrato di attività"
                />
                <p className="text-xs text-muted-foreground">
                  Usate per trovare automaticamente l'atto più recente tra le
                  pubblicazioni.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-title">Titolo della versione corrente</Label>
                <Input
                  id="act-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="es. PIAO 2025-2027"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-description">Descrizione breve</Label>
                <Textarea
                  id="act-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Breve descrizione del documento."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="act-url">Link ufficiale (opzionale)</Label>
                <Input
                  id="act-url"
                  value={form.manualOfficialUrl}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      manualOfficialUrl: e.target.value,
                    }))
                  }
                  placeholder="https://…"
                />
              </div>

              <div className="space-y-2">
                <Label>Documento (copia archiviata)</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_DOCUMENT_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileUp className="h-3.5 w-3.5" />
                    )}
                    {uploading ? "Caricamento…" : "Carica documento"}
                  </Button>
                  {form.manualFile && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="max-w-[180px] truncate">
                        {form.manualFile.name}
                      </span>
                      <button
                        type="button"
                        className="text-destructive hover:underline"
                        onClick={() =>
                          setForm((p) => ({ ...p, manualFile: null }))
                        }
                      >
                        rimuovi
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF o file Office, max 30 MB. Caricando un file o inserendo un
                  link la fonte diventa manuale.
                </p>
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
                  {editingId != null ? "Salva modifiche" : "Crea atto"}
                </Button>
                {editingId != null && (
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
              <FileText className="h-5 w-5 text-brand" /> Atti configurati
            </CardTitle>
            <CardDescription>
              Modifica, elimina o conferma i suggerimenti automatici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : acts && acts.length > 0 ? (
              <div className="space-y-3">
                {acts.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-lg border border-border p-4"
                    data-testid={`row-atto-${act.slug}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold leading-tight">
                            {act.label}
                          </span>
                          <SourceBadge source={act.source} />
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {act.slug}
                        </p>
                        {act.title && (
                          <p className="text-sm">{act.title}</p>
                        )}
                        {act.manualOfficialUrl && (
                          <a
                            href={act.manualOfficialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Link ufficiale
                          </a>
                        )}
                        {act.manualFile && (
                          <a
                            href={act.manualFile.storagePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" />{" "}
                            {act.manualFile.name}
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Modifica atto"
                          onClick={() => handleEdit(act)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Elimina atto"
                          className="text-destructive hover:text-destructive"
                          disabled={deleteAct.isPending}
                          onClick={() => handleDelete(act)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {act.suggestedPublication && (
                      <div className="mt-3 rounded-md border border-dashed border-brand/40 bg-brand/5 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                          <Sparkles className="h-3.5 w-3.5" />
                          Suggerimento automatico
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm">
                          {act.suggestedPublication.oggetto}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px]"
                          >
                            {act.suggestedPublication.tipologia}
                          </Badge>
                          {act.suggestedPublication.pubStart && (
                            <span>
                              {format(
                                new Date(act.suggestedPublication.pubStart),
                                "dd MMM yyyy",
                                { locale: it },
                              )}
                            </span>
                          )}
                        </div>
                        {act.linkedPublication?.id !==
                          act.suggestedPublication.id && (
                          <Button
                            type="button"
                            size="sm"
                            variant="brand"
                            className="mt-2 gap-1.5"
                            disabled={confirmSuggestion.isPending}
                            onClick={() => handleConfirmSuggestion(act)}
                            data-testid={`button-confirm-${act.slug}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Conferma come versione corrente
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun atto configurato. Creane uno con il modulo a fianco.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  if (source === "manual") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Manuale
      </Badge>
    );
  }
  if (source === "auto") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Da Albo
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px]">
      Non pubblicato
    </Badge>
  );
}
