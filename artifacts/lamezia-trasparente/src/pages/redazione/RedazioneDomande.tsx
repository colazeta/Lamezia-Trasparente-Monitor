/**
 * Domande section — migrated from /admin/domande, inside /redazione panel.
 * Uses Clerk session cookie auth (no bearer token needed).
 */
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
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/questions/QuestionCard";

const DESTINATION_SUGGESTIONS = [
  "/contratti", "/pnrr", "/albo", "/delibere", "/amministratori",
  "/convocazioni", "/temi", "/segnalazioni", "/legalita", "/bandi",
  "/monitoraggio", "/accesso-civico", "/organi", "/statistiche", "/opendata",
];

const emptyForm = {
  text: "",
  teaser: "",
  destinationPath: "",
  ctaLabel: "",
  topic: "",
  featured: false,
  status: "draft" as "draft" | "published",
};

export function RedazioneDomande() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showPreview, setShowPreview] = useState(false);

  const { data: questions, isLoading } = useListAllQuestions({
    query: { queryKey: getListAllQuestionsQueryKey() },
  });

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of questions ?? []) {
      const list = map.get(q.topic) ?? [];
      list.push(q);
      map.set(q.topic, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "it"));
  }, [questions]);

  // Coverage check: topics with 0 published questions
  const uncoveredTopics = useMemo(() => {
    const publishedTopics = new Set((questions ?? []).filter((q) => q.status === "published").map((q) => q.topic));
    const uniqueTopics = new Set((questions ?? []).map((q) => q.topic));
    return Array.from(uniqueTopics).filter((t) => !publishedTopics.has(t));
  }, [questions]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListAllQuestionsQueryKey() });
    qc.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
  };

  const resetForm = () => { setEditingId(null); setForm({ ...emptyForm }); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = form.text.trim();
    const destinationPath = form.destinationPath.trim();
    const ctaLabel = form.ctaLabel.trim();
    const topic = form.topic.trim();
    if (!text || !destinationPath || !ctaLabel || !topic) {
      toast.error("Compila testo, destinazione, pulsante e argomento.");
      return;
    }
    const teaser = form.teaser.trim();
    try {
      if (editingId != null) {
        await updateQuestion.mutateAsync({ id: editingId, data: { text, teaser: teaser || null, destinationPath, ctaLabel, topic, featured: form.featured, status: form.status } });
        toast.success("Domanda aggiornata.");
      } else {
        const count = questions?.length ?? 0;
        await createQuestion.mutateAsync({ data: { text, ...(teaser ? { teaser } : {}), destinationPath, ctaLabel, topic, featured: form.featured, status: form.status, sortOrder: count } });
        toast.success("Domanda creata.");
      }
      invalidate();
      resetForm();
    } catch { toast.error("Operazione non riuscita."); }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({ text: q.text, teaser: q.teaser ?? "", destinationPath: q.destinationPath, ctaLabel: q.ctaLabel, topic: q.topic, featured: q.featured, status: q.status === "published" ? "published" : "draft" });
    setShowPreview(false);
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm("Eliminare definitivamente questa domanda?")) return;
    try {
      await deleteQuestion.mutateAsync({ id: q.id });
      toast.success("Domanda eliminata.");
      if (editingId === q.id) resetForm();
      invalidate();
    } catch { toast.error("Eliminazione non riuscita."); }
  };

  const patchQuestion = async (q: Question, data: Parameters<typeof updateQuestion.mutateAsync>[0]["data"]) => {
    try { await updateQuestion.mutateAsync({ id: q.id, data }); invalidate(); }
    catch { toast.error("Operazione non riuscita."); }
  };

  const move = async (q: Question, dir: -1 | 1) => {
    const list = [...(questions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const index = list.findIndex((item) => item.id === q.id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= list.length) return;
    const other = list[target];
    try {
      await Promise.all([
        updateQuestion.mutateAsync({ id: q.id, data: { sortOrder: other.sortOrder } }),
        updateQuestion.mutateAsync({ id: other.id, data: { sortOrder: q.sortOrder } }),
      ]);
      invalidate();
    } catch { toast.error("Riordino non riuscito."); }
  };

  const saving = createQuestion.isPending || updateQuestion.isPending;

  const previewQuestion: Question | null = editingId
    ? null
    : form.text
    ? {
        id: -1,
        text: form.text,
        teaser: form.teaser || null,
        destinationPath: form.destinationPath,
        ctaLabel: form.ctaLabel || "Scopri",
        topic: form.topic,
        featured: form.featured,
        status: form.status,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Domande</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le voci "Cosa puoi scoprire?". Ogni sezione del sito dovrebbe avere almeno una Domanda pubblicata.
        </p>
      </div>

      {/* Coverage alert */}
      {uncoveredTopics.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Copertura mancante:</strong>{" "}
            {uncoveredTopics.join(", ")} — nessuna Domanda pubblicata per questi argomenti.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {editingId != null ? <><Pencil className="h-4 w-4 text-brand" /> Modifica domanda</> : <><Plus className="h-4 w-4 text-brand" /> Nuova domanda</>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Testo della domanda</Label>
                <Textarea value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="Es. Quanto ha speso il Comune in appalti?" className="min-h-[70px]" />
              </div>
              <div className="space-y-1.5">
                <Label>Risposta breve / teaser (opzionale)</Label>
                <Textarea value={form.teaser} onChange={(e) => setForm((f) => ({ ...f, teaser: e.target.value }))} placeholder="Una frase che anticipa la risposta." className="min-h-[60px]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Argomento</Label>
                  <Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="Es. Soldi pubblici" />
                </div>
                <div className="space-y-1.5">
                  <Label>Etichetta pulsante</Label>
                  <Input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="Es. Vai agli appalti" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Destinazione (percorso)</Label>
                <Input list="dest-suggestions" value={form.destinationPath} onChange={(e) => setForm((f) => ({ ...f, destinationPath: e.target.value }))} placeholder="Es. /contratti" />
                <datalist id="dest-suggestions">{DESTINATION_SUGGESTIONS.map((d) => <option key={d} value={d} />)}</datalist>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="q-featured" checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
                  <Label htmlFor="q-featured" className="text-sm cursor-pointer">In evidenza</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="q-status" checked={form.status === "published"} onCheckedChange={(v) => setForm((f) => ({ ...f, status: v ? "published" : "draft" }))} />
                  <Label htmlFor="q-status" className="text-sm cursor-pointer">Pubblicata</Label>
                </div>
              </div>
              {previewQuestion && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Anteprima card</p>
                  <QuestionCard question={previewQuestion} />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="brand" className="gap-2" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId != null ? "Salva" : "Crea"}
                </Button>
                {editingId != null && <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-1" />Annulla</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : (
            grouped.map(([topic, items]) => (
              <div key={topic}>
                <h3 className="flex items-center gap-2 font-semibold text-sm mb-2">
                  <HelpCircle className="h-4 w-4 text-brand" />
                  {topic}
                  <span className="text-xs text-muted-foreground font-normal">({items.length})</span>
                </h3>
                <div className="space-y-2">
                  {[...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id).map((q) => (
                    <Card key={q.id} className={`overflow-hidden ${editingId === q.id ? "border-brand/50" : ""}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(q, -1)}><ArrowUp className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(q, 1)}><ArrowDown className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug line-clamp-2">{q.text}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-xs text-muted-foreground">→ {q.destinationPath}</span>
                              {q.featured && <Badge variant="secondary" className="text-[10px] gap-1"><Star className="h-2.5 w-2.5" />Evidenza</Badge>}
                              <Badge variant={q.status === "published" ? "success" : "outline"} className="text-[10px]">
                                {q.status === "published" ? "Pubbl." : "Bozza"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="icon" variant="ghost" className="h-7 w-7" title={q.status === "published" ? "Bozza" : "Pubblica"} onClick={() => patchQuestion(q, { status: q.status === "published" ? "draft" : "published" })}>
                              {q.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(q)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
