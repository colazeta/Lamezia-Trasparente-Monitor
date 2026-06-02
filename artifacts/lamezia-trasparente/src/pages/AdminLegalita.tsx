import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetLegalitySection,
  useUpdateLegalityOverview,
  useCreateLegalityArea,
  useUpdateLegalityArea,
  useDeleteLegalityArea,
  useCreateLegalityRequirement,
  useUpdateLegalityRequirement,
  useDeleteLegalityRequirement,
  getGetLegalitySectionQueryKey,
  type LegalityActLink,
  type LegalityAreaWithRequirements,
  type LegalityRequirement,
  type LegalityRequirementStatus,
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
  ChevronUp,
  ChevronDown,
  Scale,
  Link2,
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

const STATUS_OPTIONS: { value: LegalityRequirementStatus; label: string }[] = [
  { value: "present", label: "Presente" },
  { value: "absent", label: "Assente" },
  { value: "partial", label: "Parziale" },
  { value: "not_applicable", label: "Non applicabile" },
];

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminLegalita() {
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
              Inserisci il token di accesso per gestire il monitoraggio su
              legalità e trasparenza.
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

  const { data, isLoading, error: listError } = useGetLegalitySection();

  const updateOverview = useUpdateLegalityOverview(authRequest);
  const createArea = useCreateLegalityArea(authRequest);
  const updateArea = useUpdateLegalityArea(authRequest);
  const deleteArea = useDeleteLegalityArea(authRequest);
  const createRequirement = useCreateLegalityRequirement(authRequest);
  const updateRequirement = useUpdateLegalityRequirement(authRequest);
  const deleteRequirement = useDeleteLegalityRequirement(authRequest);

  const isAuthError = (err: unknown): boolean => {
    const status = (err as { status?: number } | null)?.status;
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
      queryKey: getGetLegalitySectionQueryKey(),
    });
  };

  const areas = data?.areas ?? [];

  // --- Giudizio complessivo ---
  const [overall, setOverall] = useState<string | null>(null);
  const overallValue = overall ?? data?.overallJudgment ?? "";

  const handleSaveOverall = async () => {
    try {
      await updateOverview.mutateAsync({
        data: { overallJudgment: overallValue.trim() },
      });
      toast.success("Giudizio complessivo aggiornato.");
      setOverall(null);
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Operazione non riuscita.");
    }
  };

  // --- Form nuova area ---
  const [newAreaOpen, setNewAreaOpen] = useState(false);
  const [newArea, setNewArea] = useState({ slug: "", title: "" });

  const handleCreateArea = async (e: FormEvent) => {
    e.preventDefault();
    const slug = newArea.slug.trim();
    const title = newArea.title.trim();
    if (!slug || !title) {
      toast.error("Slug e titolo sono obbligatori.");
      return;
    }
    try {
      await createArea.mutateAsync({
        data: { slug, title, position: areas.length },
      });
      toast.success("Area creata.");
      setNewArea({ slug: "", title: "" });
      setNewAreaOpen(false);
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      const status = (err as { status?: number } | null)?.status;
      toast.error(
        status === 409 ? "Slug già in uso." : "Operazione non riuscita.",
      );
    }
  };

  const handleMoveArea = async (index: number, dir: -1 | 1) => {
    const target = areas[index];
    const swap = areas[index + dir];
    if (!target || !swap) return;
    try {
      await Promise.all([
        updateArea.mutateAsync({
          id: target.id,
          data: { position: swap.position },
        }),
        updateArea.mutateAsync({
          id: swap.id,
          data: { position: target.position },
        }),
      ]);
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Riordino non riuscito.");
    }
  };

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
            Gestione Legalità e Trasparenza
          </h1>
          <p className="text-muted-foreground">
            Crea aree e requisiti, imposta lo stato, scrivi commenti e giudizi e
            collega manualmente gli atti.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      {/* Giudizio complessivo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <ShieldCheck className="h-5 w-5 text-brand" />
            Giudizio complessivo della sezione
          </CardTitle>
          <CardDescription>
            Una valutazione di sintesi su tutta la sezione. Mostrata in cima alla
            pagina pubblica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <>
              <Textarea
                value={overallValue}
                onChange={(e) => setOverall(e.target.value)}
                placeholder="Scrivi il giudizio complessivo della Redazione…"
                className="min-h-[120px]"
              />
              <Button
                type="button"
                variant="brand"
                className="gap-2"
                disabled={updateOverview.isPending}
                onClick={handleSaveOverall}
              >
                {updateOverview.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salva giudizio complessivo
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Aree */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Aree di monitoraggio
        </h2>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setNewAreaOpen((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          Nuova area
        </Button>
      </div>

      {newAreaOpen && (
        <Card className="mb-6 border-brand/30">
          <CardContent className="pt-6">
            <form
              onSubmit={handleCreateArea}
              className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="new-area-slug">Slug</Label>
                <Input
                  id="new-area-slug"
                  value={newArea.slug}
                  onChange={(e) =>
                    setNewArea((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="es. trasparenza, antiriciclaggio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-area-title">Titolo</Label>
                <Input
                  id="new-area-title"
                  value={newArea.title}
                  onChange={(e) =>
                    setNewArea((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="es. Trasparenza"
                />
              </div>
              <Button
                type="submit"
                variant="brand"
                className="gap-2"
                disabled={createArea.isPending}
              >
                {createArea.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Crea
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : areas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-muted-foreground">
          Nessuna area ancora creata. Aggiungi la prima area di monitoraggio.
        </p>
      ) : (
        <div className="space-y-6">
          {areas.map((area, index) => (
            <AreaEditor
              key={area.id}
              area={area}
              isFirst={index === 0}
              isLast={index === areas.length - 1}
              onMove={(dir) => handleMoveArea(index, dir)}
              updateArea={updateArea}
              deleteArea={deleteArea}
              createRequirement={createRequirement}
              updateRequirement={updateRequirement}
              deleteRequirement={deleteRequirement}
              isAuthError={isAuthError}
              handleAuthError={handleAuthError}
              invalidate={invalidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type Mutation<TVars> = {
  mutateAsync: (vars: TVars) => Promise<unknown>;
  isPending: boolean;
};

function AreaEditor({
  area,
  isFirst,
  isLast,
  onMove,
  updateArea,
  deleteArea,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  isAuthError,
  handleAuthError,
  invalidate,
}: {
  area: LegalityAreaWithRequirements;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  updateArea: Mutation<{
    id: number;
    data: {
      title?: string;
      description?: string;
      finalJudgment?: string;
      position?: number;
    };
  }>;
  deleteArea: Mutation<{ id: number }>;
  createRequirement: Mutation<{
    id: number;
    data: { title: string; position?: number };
  }>;
  updateRequirement: Mutation<{
    id: number;
    data: Partial<{
      title: string;
      description: string;
      status: LegalityRequirementStatus;
      comment: string;
      linkedActs: LegalityActLink[];
      position: number;
    }>;
  }>;
  deleteRequirement: Mutation<{ id: number }>;
  isAuthError: (err: unknown) => boolean;
  handleAuthError: () => void;
  invalidate: () => void;
}) {
  const [title, setTitle] = useState(area.title);
  const [description, setDescription] = useState(area.description);
  const [finalJudgment, setFinalJudgment] = useState(area.finalJudgment);
  const [newReqTitle, setNewReqTitle] = useState("");

  const dirty =
    title !== area.title ||
    description !== area.description ||
    finalJudgment !== area.finalJudgment;

  const handleSaveArea = async () => {
    if (!title.trim()) {
      toast.error("Il titolo dell'area è obbligatorio.");
      return;
    }
    try {
      await updateArea.mutateAsync({
        id: area.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          finalJudgment: finalJudgment.trim(),
        },
      });
      toast.success("Area aggiornata.");
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Operazione non riuscita.");
    }
  };

  const handleDeleteArea = async () => {
    if (
      !window.confirm(
        `Eliminare l'area "${area.title}" e tutti i suoi requisiti?`,
      )
    ) {
      return;
    }
    try {
      await deleteArea.mutateAsync({ id: area.id });
      toast.success("Area eliminata.");
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Eliminazione non riuscita.");
    }
  };

  const handleAddRequirement = async (e: FormEvent) => {
    e.preventDefault();
    const reqTitle = newReqTitle.trim();
    if (!reqTitle) {
      toast.error("Inserisci il titolo del requisito.");
      return;
    }
    try {
      await createRequirement.mutateAsync({
        id: area.id,
        data: { title: reqTitle, position: area.requirements.length },
      });
      toast.success("Requisito aggiunto.");
      setNewReqTitle("");
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Operazione non riuscita.");
    }
  };

  const handleMoveRequirement = async (index: number, dir: -1 | 1) => {
    const target = area.requirements[index];
    const swap = area.requirements[index + dir];
    if (!target || !swap) return;
    try {
      await Promise.all([
        updateRequirement.mutateAsync({
          id: target.id,
          data: { position: swap.position },
        }),
        updateRequirement.mutateAsync({
          id: swap.id,
          data: { position: target.position },
        }),
      ]);
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Riordino non riuscito.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand" />
            <div>
              <CardTitle className="font-display text-xl">
                {area.title}
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground">
                {area.slug} · {area.requirements.length} requisiti
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isFirst}
              onClick={() => onMove(-1)}
              aria-label="Sposta su"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isLast}
              onClick={() => onMove(1)}
              aria-label="Sposta giù"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={handleDeleteArea}
              aria-label="Elimina area"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Titolo area</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrizione (opzionale)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrizione dell'area"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Giudizio finale dell'area</Label>
          <Textarea
            value={finalJudgment}
            onChange={(e) => setFinalJudgment(e.target.value)}
            placeholder="Giudizio della Redazione su quest'area…"
            className="min-h-[90px]"
          />
        </div>
        {dirty && (
          <Button
            type="button"
            variant="brand"
            className="gap-2"
            disabled={updateArea.isPending}
            onClick={handleSaveArea}
          >
            {updateArea.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salva area
          </Button>
        )}

        {/* Requisiti */}
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="font-display text-lg font-bold">Requisiti</h3>
          {area.requirements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessun requisito in quest'area.
            </p>
          ) : (
            <div className="space-y-3">
              {area.requirements.map((req, index) => (
                <RequirementEditor
                  key={req.id}
                  requirement={req}
                  isFirst={index === 0}
                  isLast={index === area.requirements.length - 1}
                  onMove={(dir) => handleMoveRequirement(index, dir)}
                  updateRequirement={updateRequirement}
                  deleteRequirement={deleteRequirement}
                  isAuthError={isAuthError}
                  handleAuthError={handleAuthError}
                  invalidate={invalidate}
                />
              ))}
            </div>
          )}

          <form
            onSubmit={handleAddRequirement}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor={`new-req-${area.id}`}>Nuovo requisito</Label>
              <Input
                id={`new-req-${area.id}`}
                value={newReqTitle}
                onChange={(e) => setNewReqTitle(e.target.value)}
                placeholder="Titolo del requisito"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="gap-2"
              disabled={createRequirement.isPending}
            >
              <Plus className="h-4 w-4" />
              Aggiungi
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementEditor({
  requirement,
  isFirst,
  isLast,
  onMove,
  updateRequirement,
  deleteRequirement,
  isAuthError,
  handleAuthError,
  invalidate,
}: {
  requirement: LegalityRequirement;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  updateRequirement: Mutation<{
    id: number;
    data: Partial<{
      title: string;
      description: string;
      status: LegalityRequirementStatus;
      comment: string;
      linkedActs: LegalityActLink[];
      position: number;
    }>;
  }>;
  deleteRequirement: Mutation<{ id: number }>;
  isAuthError: (err: unknown) => boolean;
  handleAuthError: () => void;
  invalidate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(requirement.title);
  const [description, setDescription] = useState(requirement.description);
  const [status, setStatus] = useState<LegalityRequirementStatus>(
    requirement.status,
  );
  const [comment, setComment] = useState(requirement.comment);
  const [linkedActs, setLinkedActs] = useState<LegalityActLink[]>(
    requirement.linkedActs,
  );

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Il titolo del requisito è obbligatorio.");
      return;
    }
    const cleanedActs = linkedActs
      .map((a) => ({ label: a.label.trim(), url: a.url.trim() }))
      .filter((a) => a.label && a.url);
    try {
      await updateRequirement.mutateAsync({
        id: requirement.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          status,
          comment: comment.trim(),
          linkedActs: cleanedActs,
        },
      });
      toast.success("Requisito salvato.");
      setLinkedActs(cleanedActs);
      setOpen(false);
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Operazione non riuscita.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Eliminare il requisito "${requirement.title}"?`)) {
      return;
    }
    try {
      await deleteRequirement.mutateAsync({ id: requirement.id });
      toast.success("Requisito eliminato.");
      invalidate();
    } catch (err) {
      if (isAuthError(err)) return handleAuthError();
      toast.error("Eliminazione non riuscita.");
    }
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold leading-tight">
              {requirement.title}
            </span>
            <Badge variant="outline" className="shrink-0">
              {statusLabel(requirement.status)}
            </Badge>
            {requirement.linkedActs.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                {requirement.linkedActs.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label="Sposta su"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label="Sposta giù"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setOpen((v) => !v)}
            aria-label="Modifica requisito"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={handleDelete}
            aria-label="Elimina requisito"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Titolo</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Stato</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setStatus(v as LegalityRequirementStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrizione (cosa dovrebbe avere il Comune)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione del requisito…"
              className="min-h-[70px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Commento esplicativo</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Commento della Redazione su questo requisito…"
              className="min-h-[70px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Atti collegati</Label>
            <p className="text-xs text-muted-foreground">
              Inserisci un'etichetta e un link. Per gli atti già presenti sul
              sito usa un percorso interno (es. <code>/albo</code>,{" "}
              <code>/delibere</code>); per fonti esterne incolla l'URL completo.
            </p>
            <div className="space-y-2">
              {linkedActs.map((act, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
                >
                  <Input
                    value={act.label}
                    onChange={(e) =>
                      setLinkedActs((prev) =>
                        prev.map((a, j) =>
                          j === i ? { ...a, label: e.target.value } : a,
                        ),
                      )
                    }
                    placeholder="Etichetta (es. Delibera n. 12/2025)"
                    className="sm:flex-1"
                  />
                  <Input
                    value={act.url}
                    onChange={(e) =>
                      setLinkedActs((prev) =>
                        prev.map((a, j) =>
                          j === i ? { ...a, url: e.target.value } : a,
                        ),
                      )
                    }
                    placeholder="/albo oppure https://…"
                    className="sm:flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      setLinkedActs((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Rimuovi atto collegato"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                setLinkedActs((prev) => [...prev, { label: "", url: "" }])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi atto
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="brand"
              className="gap-2"
              disabled={updateRequirement.isPending}
              onClick={handleSave}
            >
              {updateRequirement.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salva requisito
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
