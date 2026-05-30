import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListAllQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  getListAllQuestionsQueryKey,
  getListQuestionsQueryKey,
  type Question,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Loader2,
  Save,
  Pencil,
  Trash2,
  X,
  Star,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

const DESTINATION_SUGGESTIONS = [
  "/contratti",
  "/pnrr",
  "/albo",
  "/delibere",
  "/amministratori",
  "/convocazioni",
  "/temi",
  "/segnalazioni",
];

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminDomande() {
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
              Inserisci il token di accesso per curare le Domande del cittadino.
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

const emptyForm = {
  text: "",
  teaser: "",
  destinationPath: "",
  ctaLabel: "",
  topic: "",
  featured: false,
  status: "draft" as "draft" | "published",
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const { data: questions, isLoading } = useListAllQuestions({
    ...authRequest,
    query: { queryKey: getListAllQuestionsQueryKey() },
  });

  const createQuestion = useCreateQuestion(authRequest);
  const updateQuestion = useUpdateQuestion(authRequest);
  const deleteQuestion = useDeleteQuestion(authRequest);

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of questions ?? []) {
      const list = map.get(q.topic) ?? [];
      list.push(q);
      map.set(q.topic, list);
    }
    return Array.from(map.entries());
  }, [questions]);

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListAllQuestionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = form.text.trim();
    const destinationPath = form.destinationPath.trim();
    const ctaLabel = form.ctaLabel.trim();
    const topic = form.topic.trim();
    if (!text || !destinationPath || !ctaLabel || !topic) {
      toast.error(
        "Compila testo, destinazione, etichetta del pulsante e argomento.",
      );
      return;
    }
    const teaser = form.teaser.trim();

    try {
      if (editingId != null) {
        await updateQuestion.mutateAsync({
          id: editingId,
          data: {
            text,
            teaser: teaser ? teaser : null,
            destinationPath,
            ctaLabel,
            topic,
            featured: form.featured,
            status: form.status,
          },
        });
        toast.success("Domanda aggiornata.");
      } else {
        const count = questions?.length ?? 0;
        await createQuestion.mutateAsync({
          data: {
            text,
            ...(teaser ? { teaser } : {}),
            destinationPath,
            ctaLabel,
            topic,
            featured: form.featured,
            status: form.status,
            sortOrder: count,
          },
        });
        toast.success("Domanda creata.");
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

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      text: q.text,
      teaser: q.teaser ?? "",
      destinationPath: q.destinationPath,
      ctaLabel: q.ctaLabel,
      topic: q.topic,
      featured: q.featured,
      status: q.status === "published" ? "published" : "draft",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm("Eliminare definitivamente questa domanda?")) {
      return;
    }
    try {
      await deleteQuestion.mutateAsync({ id: q.id });
      toast.success("Domanda eliminata.");
      if (editingId === q.id) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const patchQuestion = async (
    q: Question,
    data: Parameters<typeof updateQuestion.mutateAsync>[0]["data"],
  ) => {
    try {
      await updateQuestion.mutateAsync({ id: q.id, data });
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita.");
    }
  };

  const toggleFeatured = (q: Question) =>
    patchQuestion(q, { featured: !q.featured });

  const togglePublished = (q: Question) =>
    patchQuestion(q, {
      status: q.status === "published" ? "draft" : "published",
    });

  // Riordino: scambia il sortOrder con il vicino nella stessa lista completa.
  const move = async (q: Question, direction: -1 | 1) => {
    const list = [...(questions ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
    );
    const index = list.findIndex((item) => item.id === q.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    const other = list[target];
    try {
      await Promise.all([
        updateQuestion.mutateAsync({
          id: q.id,
          data: { sortOrder: other.sortOrder },
        }),
        updateQuestion.mutateAsync({
          id: other.id,
          data: { sortOrder: q.sortOrder },
        }),
      ]);
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Riordino non riuscito.");
    }
  };

  const saving = createQuestion.isPending || updateQuestion.isPending;
  const orderedAll = [...(questions ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  );

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
            Gestione Domande
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Le Domande traducono i dati del sito in domande chiare del cittadino
            ("Cosa puoi scoprire?") e portano alla sezione che contiene la
            risposta. Ogni nuova integrazione di dati deve dichiarare almeno una
            Domanda prima di essere mostrata.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              {editingId != null ? (
                <>
                  <Pencil className="h-5 w-5 text-brand" /> Modifica domanda
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 text-brand" /> Nuova domanda
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingId != null
                ? "Stai modificando una domanda esistente."
                : "Compila i campi per creare una nuova domanda curata."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="q-text">Testo della domanda</Label>
                <Textarea
                  id="q-text"
                  value={form.text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, text: e.target.value }))
                  }
                  placeholder="Es. Quanto ha speso il Comune in appalti?"
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-teaser">Risposta breve / teaser (opzionale)</Label>
                <Textarea
                  id="q-teaser"
                  value={form.teaser}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, teaser: e.target.value }))
                  }
                  placeholder="Una frase che anticipa la risposta."
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="q-topic">Argomento</Label>
                  <Input
                    id="q-topic"
                    value={form.topic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    placeholder="Es. Soldi pubblici / Appalti"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-cta">Etichetta del pulsante</Label>
                  <Input
                    id="q-cta"
                    value={form.ctaLabel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                    }
                    placeholder="Es. Vai agli appalti"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="q-dest">Destinazione (percorso interno)</Label>
                <Input
                  id="q-dest"
                  list="dest-suggestions"
                  value={form.destinationPath}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destinationPath: e.target.value }))
                  }
                  placeholder="Es. /contratti oppure /temi?sort=relevance"
                />
                <datalist id="dest-suggestions">
                  {DESTINATION_SUGGESTIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  Il percorso (con eventuali filtri) della sezione che risponde
                  alla domanda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="q-featured"
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, featured: checked }))
                    }
                  />
                  <Label htmlFor="q-featured" className="cursor-pointer">
                    In evidenza
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="q-published"
                    checked={form.status === "published"}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        status: checked ? "published" : "draft",
                      }))
                    }
                  />
                  <Label htmlFor="q-published" className="cursor-pointer">
                    Pubblicata
                  </Label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  variant="brand"
                  className="gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingId != null ? "Salva modifiche" : "Crea domanda"}
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
              <HelpCircle className="h-5 w-5 text-brand" /> Domande esistenti
            </CardTitle>
            <CardDescription>
              Riordina, metti in evidenza, pubblica o elimina le domande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : grouped.length > 0 ? (
              <div className="space-y-6">
                {grouped.map(([topic, items]) => (
                  <div key={topic} className="space-y-3">
                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {topic}
                    </div>
                    {items.map((q) => {
                      const globalIndex = orderedAll.findIndex(
                        (item) => item.id === q.id,
                      );
                      return (
                        <div
                          key={q.id}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {q.featured && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 border-brand/40 text-brand"
                                  >
                                    <Star className="h-3 w-3 fill-current" />
                                    In evidenza
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    q.status === "published"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {q.status === "published"
                                    ? "Pubblicata"
                                    : "Bozza"}
                                </Badge>
                              </div>
                              <div className="font-semibold leading-tight">
                                {q.text}
                              </div>
                              {q.teaser && (
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {q.teaser}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-mono">
                                  {q.destinationPath}
                                </span>
                                <span>·</span>
                                <span>{q.ctaLabel}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Sposta su"
                                  disabled={globalIndex <= 0}
                                  onClick={() => move(q, -1)}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Sposta giù"
                                  disabled={
                                    globalIndex >= orderedAll.length - 1
                                  }
                                  onClick={() => move(q, 1)}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label={
                                    q.featured
                                      ? "Rimuovi dall'evidenza"
                                      : "Metti in evidenza"
                                  }
                                  className={
                                    q.featured ? "text-brand" : undefined
                                  }
                                  onClick={() => toggleFeatured(q)}
                                >
                                  <Star
                                    className={`h-4 w-4 ${q.featured ? "fill-current" : ""}`}
                                  />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label={
                                    q.status === "published"
                                      ? "Metti in bozza"
                                      : "Pubblica"
                                  }
                                  onClick={() => togglePublished(q)}
                                >
                                  {q.status === "published" ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Modifica domanda"
                                  onClick={() => handleEdit(q)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Elimina domanda"
                                  className="text-destructive hover:text-destructive"
                                  disabled={deleteQuestion.isPending}
                                  onClick={() => handleDelete(q)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessuna domanda ancora. Creane una con il modulo a fianco.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
