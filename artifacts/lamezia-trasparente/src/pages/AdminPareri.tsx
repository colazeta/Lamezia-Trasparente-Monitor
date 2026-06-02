import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useListAllOversightOpinions,
  useCreateOversightOpinion,
  useUpdateOversightOpinion,
  useDeleteOversightOpinion,
  useAddOversightOpinionDocument,
  useDeleteOversightOpinionDocument,
  getListAllOversightOpinionsQueryKey,
  getListOversightOpinionsQueryKey,
  type OversightOpinionDetail,
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
  FileText,
  ExternalLink,
  Calendar,
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

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminPareri() {
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
              Inserisci il token di accesso per gestire i pareri degli organi di
              vigilanza.
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
  title: string;
  issuingBody: string;
  opinionType: string;
  subject: string;
  outcome: string;
  body: string;
  referenceYear: string;
  status: "pubblicato" | "bozza";
  opinionDate: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  issuingBody: "",
  opinionType: "",
  subject: "",
  outcome: "",
  body: "",
  referenceYear: "",
  status: "pubblicato",
  opinionDate: "",
};

type DocFormState = {
  title: string;
  type: string;
  url: string;
  date: string;
};

const EMPTY_DOC_FORM: DocFormState = {
  title: "",
  type: "PDF",
  url: "",
  date: "",
};

function toDateInput(iso: string): string {
  // Convert an ISO timestamp to a yyyy-MM-dd value for <input type="date">.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
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
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [docTarget, setDocTarget] = useState<number | null>(null);
  const [docForm, setDocForm] = useState<DocFormState>(EMPTY_DOC_FORM);

  const {
    data: opinions,
    isLoading,
    error: listError,
  } = useListAllOversightOpinions({
    ...authRequest,
    query: { queryKey: getListAllOversightOpinionsQueryKey() },
  });

  const createOpinion = useCreateOversightOpinion(authRequest);
  const updateOpinion = useUpdateOversightOpinion(authRequest);
  const deleteOpinion = useDeleteOversightOpinion(authRequest);
  const addDocument = useAddOversightOpinionDocument(authRequest);
  const deleteDocument = useDeleteOversightOpinionDocument(authRequest);

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
      queryKey: getListAllOversightOpinionsQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getListOversightOpinionsQueryKey(),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (opinion: OversightOpinionDetail) => {
    setEditingId(opinion.id);
    setForm({
      title: opinion.title,
      issuingBody: opinion.issuingBody,
      opinionType: opinion.opinionType,
      subject: opinion.subject,
      outcome: opinion.outcome ?? "",
      body: opinion.body ?? "",
      referenceYear:
        opinion.referenceYear != null ? String(opinion.referenceYear) : "",
      status: opinion.status === "bozza" ? "bozza" : "pubblicato",
      opinionDate: toDateInput(opinion.opinionDate),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const parseReferenceYear = (): number | null | undefined => {
    const raw = form.referenceYear.trim();
    if (!raw) return null;
    const year = Number(raw);
    if (!Number.isInteger(year)) return undefined;
    return year;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const issuingBody = form.issuingBody.trim();
    const opinionType = form.opinionType.trim();
    const subject = form.subject.trim();
    if (!title || !issuingBody || !opinionType || !subject) {
      toast.error("Compila titolo, organo, tipologia e oggetto.");
      return;
    }

    const referenceYear = parseReferenceYear();
    if (referenceYear === undefined) {
      toast.error("L'anno di riferimento deve essere un numero valido.");
      return;
    }

    const outcome = form.outcome.trim() ? form.outcome.trim() : null;
    const body = form.body.trim() ? form.body.trim() : null;
    const opinionDate = form.opinionDate
      ? new Date(form.opinionDate).toISOString()
      : undefined;

    try {
      if (editingId != null) {
        await updateOpinion.mutateAsync({
          id: editingId,
          data: {
            title,
            issuingBody,
            opinionType,
            subject,
            outcome,
            body,
            referenceYear,
            status: form.status,
            ...(opinionDate ? { opinionDate } : {}),
          },
        });
        toast.success("Parere aggiornato.");
      } else {
        await createOpinion.mutateAsync({
          data: {
            title,
            issuingBody,
            opinionType,
            subject,
            outcome,
            body,
            referenceYear,
            status: form.status,
            ...(opinionDate ? { opinionDate } : {}),
          },
        });
        toast.success("Parere creato.");
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

  const handleDelete = async (opinion: OversightOpinionDetail) => {
    if (
      !window.confirm(
        `Eliminare definitivamente il parere "${opinion.title}" e i suoi allegati?`,
      )
    ) {
      return;
    }
    try {
      await deleteOpinion.mutateAsync({ id: opinion.id });
      toast.success("Parere eliminato.");
      if (editingId === opinion.id) resetForm();
      if (docTarget === opinion.id) setDocTarget(null);
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const openDocForm = (opinionId: number) => {
    setDocTarget(opinionId);
    setDocForm(EMPTY_DOC_FORM);
  };

  const handleAddDocument = async (e: FormEvent, opinionId: number) => {
    e.preventDefault();
    const title = docForm.title.trim();
    const type = docForm.type.trim();
    if (!title || !type) {
      toast.error("Inserisci titolo e tipo del documento.");
      return;
    }
    const url = docForm.url.trim() ? docForm.url.trim() : null;
    const date = docForm.date
      ? new Date(docForm.date).toISOString()
      : undefined;

    try {
      await addDocument.mutateAsync({
        id: opinionId,
        data: { title, type, url, ...(date ? { date } : {}) },
      });
      toast.success("Documento aggiunto.");
      setDocTarget(null);
      setDocForm(EMPTY_DOC_FORM);
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Impossibile aggiungere il documento.");
    }
  };

  const handleDeleteDocument = async (
    opinionId: number,
    documentId: number,
  ) => {
    try {
      await deleteDocument.mutateAsync({ id: opinionId, documentId });
      toast.success("Documento eliminato.");
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione del documento non riuscita.");
    }
  };

  const saving = createOpinion.isPending || updateOpinion.isPending;

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
            Gestione Pareri di Vigilanza
          </h1>
          <p className="text-muted-foreground">
            Crea, modifica ed elimina i pareri degli organi di vigilanza e i
            loro documenti allegati.
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
                  <Pencil className="h-5 w-5 text-brand" /> Modifica parere
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-brand" /> Nuovo parere
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingId != null
                ? "Stai modificando un parere esistente."
                : "Aggiungi un nuovo parere di un organo di vigilanza."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="op-title">Titolo</Label>
                <Input
                  id="op-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="es. Parere sul bilancio di previsione 2025"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-issuing-body">Organo emittente</Label>
                <Input
                  id="op-issuing-body"
                  value={form.issuingBody}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, issuingBody: e.target.value }))
                  }
                  placeholder="es. Collegio dei Revisori dei Conti"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-type">Tipologia di parere</Label>
                <Input
                  id="op-type"
                  value={form.opinionType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, opinionType: e.target.value }))
                  }
                  placeholder="es. Parere obbligatorio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-subject">Oggetto</Label>
                <Textarea
                  id="op-subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="Breve descrizione dell'oggetto del parere."
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-outcome">Esito (opzionale)</Label>
                <Input
                  id="op-outcome"
                  value={form.outcome}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, outcome: e.target.value }))
                  }
                  placeholder="es. Favorevole"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-body">Testo / Sintesi (opzionale)</Label>
                <Textarea
                  id="op-body"
                  value={form.body}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, body: e.target.value }))
                  }
                  placeholder="Testo esteso o sintesi del parere."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="op-reference-year">Anno di riferimento</Label>
                  <Input
                    id="op-reference-year"
                    type="number"
                    inputMode="numeric"
                    value={form.referenceYear}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        referenceYear: e.target.value,
                      }))
                    }
                    placeholder="es. 2024"
                    data-testid="input-reference-year"
                  />
                  <p className="text-xs text-muted-foreground">
                    Distinto dalla data di emissione.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="op-date">Data di emissione</Label>
                  <Input
                    id="op-date"
                    type="date"
                    value={form.opinionDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, opinionDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="op-status">Stato</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as "pubblicato" | "bozza",
                    }))
                  }
                >
                  <SelectTrigger id="op-status" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pubblicato">Pubblicato</SelectItem>
                    <SelectItem value="bozza">Bozza</SelectItem>
                  </SelectContent>
                </Select>
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
                  {editingId != null ? "Salva modifiche" : "Crea parere"}
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
              <FileText className="h-5 w-5 text-brand" /> Pareri pubblicati e
              bozze
            </CardTitle>
            <CardDescription>
              Modifica o elimina i pareri e gestisci i documenti allegati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : opinions && opinions.length > 0 ? (
              <div className="space-y-3">
                {opinions.map((opinion) => (
                  <div
                    key={opinion.id}
                    className="rounded-lg border border-border p-4"
                    data-testid={`row-parere-${opinion.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold leading-tight">
                            {opinion.title}
                          </span>
                          {opinion.status === "bozza" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] shadow-none"
                            >
                              Bozza
                            </Badge>
                          ) : (
                            <Badge className="border-transparent bg-emerald-100 text-emerald-800 text-[10px] shadow-none dark:bg-emerald-500/20 dark:text-emerald-300">
                              Pubblicato
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">
                            {opinion.issuingBody}
                          </Badge>
                          {opinion.referenceYear != null && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] shadow-none"
                            >
                              Rif. {opinion.referenceYear}
                            </Badge>
                          )}
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(opinion.opinionDate),
                              "dd/MM/yyyy",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Modifica parere"
                          onClick={() => handleEdit(opinion)}
                          data-testid={`button-edit-${opinion.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Elimina parere"
                          onClick={() => handleDelete(opinion)}
                          data-testid={`button-delete-${opinion.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Documenti ({opinion.documents.length})
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => openDocForm(opinion.id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Aggiungi
                        </Button>
                      </div>

                      {opinion.documents.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {opinion.documents.map((doc) => (
                            <li
                              key={doc.id}
                              className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
                            >
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{doc.title}</span>
                                <span className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono uppercase text-[10px]">
                                  {doc.type}
                                </span>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-primary hover:underline"
                                    aria-label="Apri documento"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </span>
                              <button
                                type="button"
                                className="shrink-0 text-destructive hover:underline"
                                onClick={() =>
                                  handleDeleteDocument(opinion.id, doc.id)
                                }
                              >
                                rimuovi
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {docTarget === opinion.id && (
                        <form
                          onSubmit={(e) => handleAddDocument(e, opinion.id)}
                          className="mt-3 space-y-2 rounded-md border border-border p-3"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={docForm.title}
                              onChange={(e) =>
                                setDocForm((p) => ({
                                  ...p,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Titolo documento"
                              aria-label="Titolo documento"
                            />
                            <Input
                              value={docForm.type}
                              onChange={(e) =>
                                setDocForm((p) => ({
                                  ...p,
                                  type: e.target.value,
                                }))
                              }
                              placeholder="Tipo (es. PDF)"
                              aria-label="Tipo documento"
                            />
                          </div>
                          <Input
                            value={docForm.url}
                            onChange={(e) =>
                              setDocForm((p) => ({
                                ...p,
                                url: e.target.value,
                              }))
                            }
                            placeholder="Link al documento (opzionale)"
                            aria-label="Link documento"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              type="date"
                              value={docForm.date}
                              onChange={(e) =>
                                setDocForm((p) => ({
                                  ...p,
                                  date: e.target.value,
                                }))
                              }
                              className="w-auto"
                              aria-label="Data documento"
                            />
                            <Button
                              type="submit"
                              size="sm"
                              variant="brand"
                              className="gap-1.5"
                              disabled={addDocument.isPending}
                            >
                              {addDocument.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                              Salva documento
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setDocTarget(null)}
                            >
                              Annulla
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun parere presente. Creane uno con il modulo a fianco.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
