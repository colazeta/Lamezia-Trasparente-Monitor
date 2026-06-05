/**
 * Cronistoria section — migrated from /admin/cronistoria, now inside the
 * unified /redazione panel. Uses Clerk session auth (cookie), not bearer token.
 */
import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  useListThemes,
  useListThemePosts,
  useCreateThemePost,
  useUpdateThemePost,
  useDeleteThemePost,
  useRequestUploadUrl,
  getListThemePostsQueryKey,
  getGetThemeQueryKey,
  type ThemePost,
} from "@workspace/api-client-react";
import {
  ImagePlus,
  Loader2,
  Save,
  Pencil,
  Trash2,
  X,
  Eye,
  History,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function resolvePostImageSrc(src: string | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("/objects/")) return `/api/storage${src}`;
  if (src.startsWith("/api/storage/objects/") || src.startsWith("/api/storage/public-objects/")) return src;
  return null;
}

export function RedazioneCronistoria() {
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: themes, isLoading: themesLoading } = useListThemes();
  const { data: posts, isLoading: postsLoading } = useListThemePosts(
    selectedThemeId ?? 0,
    { query: { enabled: selectedThemeId != null, queryKey: getListThemePostsQueryKey(selectedThemeId ?? 0) } },
  );

  // Clerk session cookie is sent automatically — no need for auth headers
  const requestUploadUrl = useRequestUploadUrl();
  const createPost = useCreateThemePost();
  const updatePost = useUpdateThemePost();
  const deletePost = useDeleteThemePost();

  const invalidateTheme = (themeId: number) => {
    queryClient.invalidateQueries({ queryKey: getListThemePostsQueryKey(themeId) });
    queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });
  };

  const resetForm = () => {
    setEditingPostId(null);
    setTitle("");
    setEventDate("");
    setBody("");
  };

  const insertAtCursor = (snippet: string) => {
    const textarea = bodyRef.current;
    if (!textarea) { setBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet)); return; }
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const needsBreak = before && !before.endsWith("\n");
    const insertion = `${needsBreak ? "\n\n" : ""}${snippet}\n`;
    setBody(`${before}${insertion}${after}`);
    requestAnimationFrame(() => { const pos = before.length + insertion.length; textarea.focus(); textarea.setSelectionRange(pos, pos); });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { toast.error("Tipo di immagine non supportato"); return; }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { toast.error("Immagine troppo grande (max 10 MB)"); return; }
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type } });
      const putRes = await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) throw new Error(`Upload failed ${putRes.status}`);
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${objectPath})`);
      toast.success("Immagine caricata");
    } catch { toast.error("Caricamento non riuscito"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedThemeId == null) { toast.error("Seleziona un tema."); return; }
    const trimmedBody = body.trim();
    if (!trimmedBody) { toast.error("Il testo è obbligatorio."); return; }
    const eventDateIso = eventDate ? new Date(`${eventDate}T12:00:00`).toISOString() : undefined;
    const normalizedTitle = title.trim() ? title.trim() : null;
    try {
      if (editingPostId != null) {
        await updatePost.mutateAsync({ id: selectedThemeId, postId: editingPostId, data: { title: normalizedTitle, body: trimmedBody, ...(eventDateIso ? { eventDate: eventDateIso } : {}) } });
        toast.success("Post aggiornato.");
      } else {
        await createPost.mutateAsync({ id: selectedThemeId, data: { ...(normalizedTitle ? { title: normalizedTitle } : {}), body: trimmedBody, ...(eventDateIso ? { eventDate: eventDateIso } : {}) } });
        toast.success("Post pubblicato.");
      }
      invalidateTheme(selectedThemeId);
      resetForm();
    } catch { toast.error("Operazione non riuscita."); }
  };

  const handleEdit = (post: ThemePost) => {
    setEditingPostId(post.id);
    setTitle(post.title ?? "");
    setEventDate(post.eventDate ? post.eventDate.slice(0, 10) : "");
    setBody(post.body);
    setShowPreview(false);
  };

  const handleDelete = async (post: ThemePost) => {
    if (selectedThemeId == null) return;
    if (!window.confirm("Eliminare definitivamente questo post?")) return;
    try {
      await deletePost.mutateAsync({ id: selectedThemeId, postId: post.id });
      toast.success("Post eliminato.");
      if (editingPostId === post.id) resetForm();
      invalidateTheme(selectedThemeId);
    } catch { toast.error("Eliminazione non riuscita."); }
  };

  const saving = createPost.isPending || updatePost.isPending;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Cronistoria</h1>
        <p className="text-muted-foreground mt-1">
          Scrivi, modifica ed elimina gli aggiornamenti narrativi dei Temi.
        </p>
      </div>

      <div className="max-w-sm">
        <Label htmlFor="theme-select">Tema</Label>
        {themesLoading ? <Skeleton className="h-10 w-full mt-1" /> : (
          <Select value={selectedThemeId != null ? String(selectedThemeId) : ""} onValueChange={(v) => { setSelectedThemeId(Number(v)); resetForm(); }}>
            <SelectTrigger id="theme-select" className="mt-1">
              <SelectValue placeholder="Seleziona un tema" />
            </SelectTrigger>
            <SelectContent>
              {(themes ?? []).map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedThemeId != null && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingPostId != null ? <><Pencil className="h-4 w-4 text-brand" /> Modifica post</> : <><Plus className="h-4 w-4 text-brand" /> Nuovo post</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="post-title">Titolo (opzionale)</Label>
                  <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Approvata la delibera di giunta" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="post-date">Data evento (opzionale)</Label>
                  <Input id="post-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-body">Testo (Markdown)</Label>
                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" onChange={handleFileSelected} />
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                        Immagine
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowPreview(!showPreview)}>
                        <Eye className="h-3.5 w-3.5" />
                        {showPreview ? "Scrivi" : "Anteprima"}
                      </Button>
                    </div>
                  </div>
                  {showPreview ? (
                    <div className="min-h-[200px] rounded-md border border-border p-3 prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{body || "*Nessun testo ancora.*"}</ReactMarkdown>
                    </div>
                  ) : (
                    <Textarea ref={bodyRef} id="post-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Scrivi l'aggiornamento narrativo in Markdown…" className="min-h-[200px] font-mono text-sm" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="brand" className="gap-2" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {editingPostId != null ? "Salva modifiche" : "Pubblica"}
                  </Button>
                  {editingPostId != null && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-1.5" /> Annulla
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Post list */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-brand" /> Post pubblicati
            </h3>
            {postsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : (posts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nessun post ancora.</p>
            ) : (
              (posts ?? []).map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {post.title && <p className="font-semibold text-sm truncate">{post.title}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {post.eventDate
                            ? format(new Date(post.eventDate), "dd MMM yyyy", { locale: it })
                            : format(new Date(post.createdAt), "dd MMM yyyy", { locale: it })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{post.body}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(post)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(post)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
