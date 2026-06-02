import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useListAccessoCivicoAdmin,
  useUpdateAccessoCivico,
  useDeleteAccessoCivico,
  usePublishAccessoCivico,
  useRequestDocumentUploadUrl,
  getListAccessoCivicoAdminQueryKey,
  getListAccessoCivicoQueryKey,
  type AccessoCivicoRequestAdmin,
  type AccessoCivicoStato,
  type AccessoCivicoTipo,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Loader2,
  Save,
  Pencil,
  Trash2,
  X,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  Inbox,
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

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_DOCUMENT_SIZE_BYTES = 30 * 1024 * 1024;

const TIPO_LABELS: Record<AccessoCivicoTipo, string> = {
  generalizzato: "Accesso civico generalizzato (FOIA)",
  semplice: "Accesso civico semplice",
  documentale: "Accesso documentale (l. 241/1990)",
};

const STATO_META: Record<
  AccessoCivicoStato,
  { label: string; className: string; icon: typeof Clock }
> = {
  "in-attesa": {
    label: "In attesa",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Clock,
  },
  accolta: {
    label: "Accolta",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rifiutata: {
    label: "Rifiutata",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminAccessoCivico() {
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
              Inserisci il token di accesso per moderare le richieste di accesso
              civico.
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
  oggetto: string;
  tipo: AccessoCivicoTipo;
  ente: string;
  descrizione: string;
  requesterName: string;
  requestDate: string;
  stato: AccessoCivicoStato;
  esitoNote: string;
  responseDate: string;
  responseUrl: string;
  responseLabel: string;
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function fromForm(r: AccessoCivicoRequestAdmin): FormState {
  return {
    oggetto: r.oggetto,
    tipo: r.tipo,
    ente: r.ente,
    descrizione: r.descrizione,
    requesterName: r.requesterName ?? "",
    requestDate: toDateInput(r.requestDate),
    stato: r.stato,
    esitoNote: r.esitoNote,
    responseDate: toDateInput(r.responseDate),
    responseUrl: r.responseUrl ?? "",
    responseLabel: r.responseLabel ?? "",
  };
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: requests,
    isLoading,
    error: listError,
  } = useListAccessoCivicoAdmin({
    ...authRequest,
    query: { queryKey: getListAccessoCivicoAdminQueryKey() },
  });

  const updateRequest = useUpdateAccessoCivico(authRequest);
  const deleteRequest = useDeleteAccessoCivico(authRequest);
  const publishRequest = usePublishAccessoCivico(authRequest);
  const requestUploadUrl = useRequestDocumentUploadUrl(authRequest);

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
      queryKey: getListAccessoCivicoAdminQueryKey(),
    });
    queryClient.invalidateQueries({ queryKey: getListAccessoCivicoQueryKey() });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(null);
  };

  const handleEdit = (r: AccessoCivicoRequestAdmin) => {
    setEditingId(r.id);
    setForm(fromForm(r));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpload = async (file: File) => {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      toast.error("Tipo di documento non supportato", {
        description: "Usa PDF o file Office.",
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
      const storagePath = `/api/storage${objectPath}`;
      setForm((prev) =>
        prev
          ? {
              ...prev,
              responseUrl: storagePath,
              responseLabel: prev.responseLabel.trim() || file.name,
            }
          : prev,
      );
      toast.success("Documento caricato", {
        description: "Salva la richiesta per allegarlo.",
      });
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Caricamento non riuscito.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || editingId == null) return;
    if (!form.oggetto.trim()) {
      toast.error("L'oggetto è obbligatorio.");
      return;
    }
    try {
      await updateRequest.mutateAsync({
        id: editingId,
        data: {
          oggetto: form.oggetto.trim(),
          tipo: form.tipo,
          ente: form.ente.trim() || "Comune di Lamezia Terme",
          descrizione: form.descrizione.trim(),
          requesterName: form.requesterName.trim() || null,
          requestDate: form.requestDate
            ? new Date(form.requestDate).toISOString()
            : null,
          stato: form.stato,
          esitoNote: form.esitoNote.trim(),
          responseDate: form.responseDate
            ? new Date(form.responseDate).toISOString()
            : null,
          responseUrl: form.responseUrl.trim() || null,
          responseLabel: form.responseLabel.trim() || null,
        },
      });
      toast.success("Richiesta aggiornata.");
      invalidate();
      resetForm();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita.");
    }
  };

  const handlePublish = async (r: AccessoCivicoRequestAdmin) => {
    try {
      await publishRequest.mutateAsync({ id: r.id });
      toast.success("Richiesta pubblicata.", {
        description: "Ora è visibile nel registro pubblico.",
      });
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Pubblicazione non riuscita.");
    }
  };

  const handleDelete = async (r: AccessoCivicoRequestAdmin) => {
    if (!window.confirm(`Eliminare definitivamente la richiesta "${r.oggetto}"?`)) {
      return;
    }
    try {
      await deleteRequest.mutateAsync({ id: r.id });
      toast.success("Richiesta eliminata.");
      if (editingId === r.id) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const published = (requests ?? []).filter((r) => r.status === "published");

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
            Accesso Civico
          </h1>
          <p className="text-muted-foreground">
            Modera le richieste inviate dai cittadini, aggiorna l'esito e allega
            il documento di risposta dell'ente.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {form && editingId != null ? (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Pencil className="h-5 w-5 text-brand" /> Modifica richiesta
              </CardTitle>
              <CardDescription>
                Aggiorna i dati, imposta l'esito e allega l'eventuale documento
                di risposta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ac-oggetto">Oggetto</Label>
                  <Input
                    id="ac-oggetto"
                    value={form.oggetto}
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, oggetto: e.target.value } : p))
                    }
                    data-testid="input-oggetto"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.tipo}
                      onValueChange={(v) =>
                        setForm((p) =>
                          p ? { ...p, tipo: v as AccessoCivicoTipo } : p,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TIPO_LABELS) as AccessoCivicoTipo[]).map(
                          (t) => (
                            <SelectItem key={t} value={t}>
                              {TIPO_LABELS[t]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Esito</Label>
                    <Select
                      value={form.stato}
                      onValueChange={(v) =>
                        setForm((p) =>
                          p ? { ...p, stato: v as AccessoCivicoStato } : p,
                        )
                      }
                    >
                      <SelectTrigger data-testid="select-stato">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-attesa">In attesa</SelectItem>
                        <SelectItem value="accolta">Accolta</SelectItem>
                        <SelectItem value="rifiutata">Rifiutata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ac-ente">Ente destinatario</Label>
                  <Input
                    id="ac-ente"
                    value={form.ente}
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, ente: e.target.value } : p))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ac-descrizione">Descrizione</Label>
                  <Textarea
                    id="ac-descrizione"
                    value={form.descrizione}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, descrizione: e.target.value } : p,
                      )
                    }
                    className="min-h-[70px]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ac-requester">Richiedente</Label>
                    <Input
                      id="ac-requester"
                      value={form.requesterName}
                      onChange={(e) =>
                        setForm((p) =>
                          p ? { ...p, requesterName: e.target.value } : p,
                        )
                      }
                      placeholder="Facoltativo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-requestdate">Data invio</Label>
                    <Input
                      id="ac-requestdate"
                      type="date"
                      value={form.requestDate}
                      onChange={(e) =>
                        setForm((p) =>
                          p ? { ...p, requestDate: e.target.value } : p,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ac-esitonote">Note sull'esito</Label>
                  <Textarea
                    id="ac-esitonote"
                    value={form.esitoNote}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, esitoNote: e.target.value } : p,
                      )
                    }
                    placeholder="Motivazione dell'ente, dettagli sull'esito…"
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ac-responsedate">Data risposta</Label>
                  <Input
                    id="ac-responsedate"
                    type="date"
                    value={form.responseDate}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, responseDate: e.target.value } : p,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Documento di risposta</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Carica documento
                    </Button>
                    {form.responseUrl && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        {form.responseLabel || "Documento allegato"}
                        <button
                          type="button"
                          className="ml-1 text-destructive"
                          onClick={() =>
                            setForm((p) =>
                              p
                                ? { ...p, responseUrl: "", responseLabel: "" }
                                : p,
                            )
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                  <Input
                    value={form.responseLabel}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, responseLabel: e.target.value } : p,
                      )
                    }
                    placeholder="Etichetta del documento (opzionale)"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="submit"
                    variant="brand"
                    className="gap-2"
                    disabled={updateRequest.isPending}
                    data-testid="button-save"
                  >
                    {updateRequest.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salva modifiche
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Inbox className="h-5 w-5 text-brand" /> Moderazione
              </CardTitle>
              <CardDescription>
                Seleziona una richiesta dall'elenco per modificarla. Le richieste
                in attesa vanno revisionate e pubblicate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {pending.length > 0
                  ? `Ci sono ${pending.length} richieste in attesa di moderazione.`
                  : "Nessuna richiesta in attesa di moderazione."}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Clock className="h-5 w-5 text-amber-600" /> In attesa di
                moderazione
              </CardTitle>
              <CardDescription>
                Richieste inviate dai cittadini, non ancora pubbliche.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : pending.length > 0 ? (
                <div className="space-y-3">
                  {pending.map((r) => (
                    <RequestRow
                      key={r.id}
                      request={r}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessuna richiesta in attesa.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Pubblicate
              </CardTitle>
              <CardDescription>
                Richieste visibili nel registro pubblico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : published.length > 0 ? (
                <div className="space-y-3">
                  {published.map((r) => (
                    <RequestRow
                      key={r.id}
                      request={r}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessuna richiesta pubblicata.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RequestRow({
  request,
  onEdit,
  onDelete,
  onPublish,
}: {
  request: AccessoCivicoRequestAdmin;
  onEdit: (r: AccessoCivicoRequestAdmin) => void;
  onDelete: (r: AccessoCivicoRequestAdmin) => void;
  onPublish?: (r: AccessoCivicoRequestAdmin) => void;
}) {
  const meta = STATO_META[request.stato];
  const StatoIcon = meta.icon;
  return (
    <div
      className="rounded-lg border p-3"
      data-testid={`row-request-${request.id}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={`gap-1 text-[10px] ${meta.className}`}
        >
          <StatoIcon className="h-3 w-3" />
          {meta.label}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {TIPO_LABELS[request.tipo]}
        </Badge>
      </div>
      <p className="text-sm font-semibold leading-tight">{request.oggetto}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {request.ente}
        {request.requestDate
          ? ` · ${format(new Date(request.requestDate), "dd MMM yyyy", { locale: it })}`
          : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onPublish && (
          <Button
            size="sm"
            variant="brand"
            className="gap-1"
            onClick={() => onPublish(request)}
            data-testid={`button-publish-${request.id}`}
          >
            <Eye className="h-3.5 w-3.5" /> Pubblica
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => onEdit(request)}
          data-testid={`button-edit-${request.id}`}
        >
          <Pencil className="h-3.5 w-3.5" /> Modifica
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1 text-destructive"
          onClick={() => onDelete(request)}
          data-testid={`button-delete-${request.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" /> Elimina
        </Button>
      </div>
    </div>
  );
}
