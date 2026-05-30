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
  ShieldCheck,
  LogOut,
  ImagePlus,
  Loader2,
  Save,
  Pencil,
  Trash2,
  X,
  Eye,
  History,
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

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Resolve an image source embedded in a Cronistoria post body for previewing.
 * Mirrors the rendering logic used on the public theme page: only images hosted
 * in our own object storage are shown.
 */
function resolvePostImageSrc(src: string | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("/objects/")) return `/api/storage${src}`;
  if (
    src.startsWith("/api/storage/objects/") ||
    src.startsWith("/api/storage/public-objects/")
  ) {
    return src;
  }
  return null;
}

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminCronistoria() {
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
              Inserisci il token di accesso per pubblicare e modificare la
              Cronistoria dei temi.
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

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: themes, isLoading: themesLoading } = useListThemes();
  const { data: posts, isLoading: postsLoading } = useListThemePosts(
    selectedThemeId ?? 0,
    {
      query: {
        enabled: selectedThemeId != null,
        queryKey: getListThemePostsQueryKey(selectedThemeId ?? 0),
      },
    },
  );

  const requestUploadUrl = useRequestUploadUrl(authRequest);
  const createPost = useCreateThemePost(authRequest);
  const updatePost = useUpdateThemePost(authRequest);
  const deletePost = useDeleteThemePost(authRequest);

  const [uploading, setUploading] = useState(false);

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

  const resetForm = () => {
    setEditingPostId(null);
    setTitle("");
    setEventDate("");
    setBody("");
  };

  const insertAtCursor = (snippet: string) => {
    const textarea = bodyRef.current;
    if (!textarea) {
      setBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
      return;
    }
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const needsLeadingBreak = before && !before.endsWith("\n");
    const insertion = `${needsLeadingBreak ? "\n\n" : ""}${snippet}\n`;
    const next = `${before}${insertion}${after}`;
    setBody(next);
    requestAnimationFrame(() => {
      const pos = before.length + insertion.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Tipo di immagine non supportato", {
        description: "Usa JPEG, PNG, GIF, WebP o AVIF.",
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Immagine troppo grande", {
        description: "La dimensione massima è 10 MB.",
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

      const altText = file.name.replace(/\.[^.]+$/, "");
      insertAtCursor(`![${altText}](${objectPath})`);
      toast.success("Immagine caricata", {
        description: "Il markdown è stato inserito nel testo.",
      });
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Caricamento non riuscito", {
        description: "Non è stato possibile caricare l'immagine. Riprova.",
      });
    } finally {
      setUploading(false);
    }
  };

  const invalidateTheme = (themeId: number) => {
    queryClient.invalidateQueries({
      queryKey: getListThemePostsQueryKey(themeId),
    });
    queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedThemeId == null) {
      toast.error("Seleziona un tema.");
      return;
    }
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      toast.error("Il testo del post è obbligatorio.");
      return;
    }

    const eventDateIso = eventDate
      ? new Date(`${eventDate}T12:00:00`).toISOString()
      : undefined;
    const normalizedTitle = title.trim() ? title.trim() : null;

    try {
      if (editingPostId != null) {
        await updatePost.mutateAsync({
          id: selectedThemeId,
          postId: editingPostId,
          data: {
            title: normalizedTitle,
            body: trimmedBody,
            ...(eventDateIso ? { eventDate: eventDateIso } : {}),
          },
        });
        toast.success("Post aggiornato.");
      } else {
        await createPost.mutateAsync({
          id: selectedThemeId,
          data: {
            ...(normalizedTitle ? { title: normalizedTitle } : {}),
            body: trimmedBody,
            ...(eventDateIso ? { eventDate: eventDateIso } : {}),
          },
        });
        toast.success("Post pubblicato.");
      }
      invalidateTheme(selectedThemeId);
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

  const handleEdit = (post: ThemePost) => {
    setEditingPostId(post.id);
    setTitle(post.title ?? "");
    setEventDate(post.eventDate ? post.eventDate.slice(0, 10) : "");
    setBody(post.body);
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (post: ThemePost) => {
    if (selectedThemeId == null) return;
    if (
      !window.confirm(
        "Eliminare definitivamente questo post della Cronistoria?",
      )
    ) {
      return;
    }
    try {
      await deletePost.mutateAsync({ id: selectedThemeId, postId: post.id });
      toast.success("Post eliminato.");
      if (editingPostId === post.id) resetForm();
      invalidateTheme(selectedThemeId);
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const saving = createPost.isPending || updatePost.isPending;

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
            Gestione Cronistoria
          </h1>
          <p className="text-muted-foreground">
            Carica immagini e pubblica o modifica gli aggiornamenti narrativi
            dei temi.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="theme-select">Tema</Label>
          {themesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedThemeId != null ? String(selectedThemeId) : ""}
              onValueChange={(value) => {
                setSelectedThemeId(Number(value));
                resetForm();
              }}
            >
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="Seleziona un tema da aggiornare" />
              </SelectTrigger>
              <SelectContent>
                {(themes ?? []).map((theme) => (
                  <SelectItem key={theme.id} value={String(theme.id)}>
                    {theme.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {selectedThemeId != null && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                {editingPostId != null ? (
                  <>
                    <Pencil className="h-5 w-5 text-brand" /> Modifica post
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 text-brand" /> Nuovo post
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {editingPostId != null
                  ? "Stai modificando un post esistente."
                  : "Compila i campi per pubblicare un nuovo aggiornamento."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="post-title">Titolo (opzionale)</Label>
                  <Input
                    id="post-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Es. Approvata la delibera di giunta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-date">Data evento (opzionale)</Label>
                  <Input
                    id="post-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-body">Testo (Markdown)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(",")}
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
                          <ImagePlus className="h-3.5 w-3.5" />
                        )}
                        {uploading ? "Caricamento…" : "Inserisci immagine"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="post-body"
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Scrivi l'aggiornamento. Puoi usare Markdown e inserire immagini."
                    className="min-h-[220px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'immagine caricata viene inserita automaticamente come
                    markdown nel punto del cursore.
                  </p>
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
                    {editingPostId != null ? "Salva modifiche" : "Pubblica"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowPreview((v) => !v)}
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Nascondi anteprima" : "Anteprima"}
                  </Button>
                  {editingPostId != null && (
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

              {showPreview && (
                <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Anteprima
                  </div>
                  <div className="prose prose-slate dark:prose-invert prose-sm max-w-none prose-a:text-primary">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        img: ({ node, src, alt, ...props }) => {
                          const resolved = resolvePostImageSrc(src);
                          if (!resolved) return null;
                          return (
                            <img
                              {...props}
                              src={resolved}
                              alt={typeof alt === "string" ? alt : ""}
                              loading="lazy"
                              className="mx-auto my-4 h-auto max-w-full rounded-lg border border-border"
                            />
                          );
                        },
                      }}
                    >
                      {body || "_Niente da mostrare._"}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <History className="h-5 w-5 text-brand" /> Cronistoria esistente
              </CardTitle>
              <CardDescription>
                Modifica o elimina i post già pubblicati.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {format(new Date(post.eventDate), "dd MMM yyyy", {
                              locale: it,
                            })}
                          </Badge>
                          {post.title && (
                            <div className="font-semibold leading-tight">
                              {post.title}
                            </div>
                          )}
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {post.body}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Modifica post"
                            onClick={() => handleEdit(post)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Elimina post"
                            className="text-destructive hover:text-destructive"
                            disabled={deletePost.isPending}
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessun post pubblicato per questo tema.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
