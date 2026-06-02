import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import {
  useListConfiscatedAssetsAdmin,
  useCreateConfiscatedAsset,
  useUpdateConfiscatedAsset,
  useDeleteConfiscatedAsset,
  useUpdateConfiscatedAssetLocation,
  getListConfiscatedAssetsAdminQueryKey,
  getListConfiscatedAssetsQueryKey,
  getGetConfiscatedAssetsSummaryQueryKey,
  type ConfiscatedAssetAdmin,
  type ConfiscatedAssetStatus,
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
  ShieldOff,
  MapPin,
  Search,
  Sparkles,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { STATUS_LABEL } from "@/components/ConfiscatedAssetsMap";
import { LAMEZIA_CENTER, quartiereLabel, useComuneBoundary } from "@/lib/gis";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const STATUSES: ConfiscatedAssetStatus[] = [
  "sequestrato",
  "confiscato",
  "assegnato",
  "riutilizzato",
];

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminBeniConfiscati() {
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
              Inserisci il token di accesso per gestire i beni confiscati.
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
  denominazione: string;
  tipologia: string;
  status: string;
  description: string;
  indirizzo: string;
  assegnatario: string;
  destinazioneUso: string;
  datiCatastali: string;
  officialUrl: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  denominazione: "",
  tipologia: "",
  status: "confiscato",
  description: "",
  indirizzo: "",
  assegnatario: "",
  destinazioneUso: "",
  datiCatastali: "",
  officialUrl: "",
  notes: "",
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

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingLocation, setEditingLocation] =
    useState<ConfiscatedAssetAdmin | null>(null);

  const {
    data: assets,
    isLoading,
    error: listError,
  } = useListConfiscatedAssetsAdmin({
    ...authRequest,
    query: { queryKey: getListConfiscatedAssetsAdminQueryKey() },
  });

  const createAsset = useCreateConfiscatedAsset(authRequest);
  const updateAsset = useUpdateConfiscatedAsset(authRequest);
  const deleteAsset = useDeleteConfiscatedAsset(authRequest);

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
      queryKey: getListConfiscatedAssetsAdminQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getListConfiscatedAssetsQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getGetConfiscatedAssetsSummaryQueryKey(),
    });
  };

  const resetForm = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (a: ConfiscatedAssetAdmin) => {
    setEditingSlug(a.slug);
    setForm({
      slug: a.slug,
      denominazione: a.denominazione,
      tipologia: a.tipologia,
      status: a.status,
      description: a.description,
      indirizzo: a.indirizzo,
      assegnatario: a.assegnatario,
      destinazioneUso: a.destinazioneUso,
      datiCatastali: a.datiCatastali,
      officialUrl: a.officialUrl ?? "",
      notes: a.notes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    denominazione: form.denominazione.trim(),
    tipologia: form.tipologia.trim(),
    status: form.status as ConfiscatedAssetStatus,
    description: form.description.trim(),
    indirizzo: form.indirizzo.trim(),
    assegnatario: form.assegnatario.trim(),
    destinazioneUso: form.destinazioneUso.trim(),
    datiCatastali: form.datiCatastali.trim(),
    officialUrl: form.officialUrl.trim() || null,
    notes: form.notes.trim(),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim();
    const denominazione = form.denominazione.trim();
    if (!denominazione) {
      toast.error("La denominazione è obbligatoria.");
      return;
    }
    if (editingSlug == null && !slug) {
      toast.error("Lo slug è obbligatorio.");
      return;
    }

    try {
      const payload = buildPayload();
      if (editingSlug != null) {
        await updateAsset.mutateAsync({ slug: editingSlug, data: payload });
        toast.success("Bene aggiornato.");
      } else {
        await createAsset.mutateAsync({ data: { slug, ...payload } });
        toast.success("Bene creato.");
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

  const handleDelete = async (a: ConfiscatedAssetAdmin) => {
    if (
      !window.confirm(`Eliminare definitivamente il bene "${a.denominazione}"?`)
    ) {
      return;
    }
    try {
      await deleteAsset.mutateAsync({ slug: a.slug });
      toast.success("Bene eliminato.");
      if (editingSlug === a.slug) resetForm();
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const saving = createAsset.isPending || updateAsset.isPending;

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
            Gestione Beni Confiscati
          </h1>
          <p className="text-muted-foreground">
            Cura il catalogo dei beni sequestrati e confiscati. Le voci create o
            modificate a mano hanno la precedenza e non vengono sovrascritte
            dall'importazione automatica dei dati aperti ANBSC.
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
                  <Pencil className="h-5 w-5 text-brand" /> Modifica bene
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-brand" /> Nuovo bene
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingSlug != null
                ? "Stai modificando un bene esistente. Lo slug non è modificabile."
                : "Aggiungi un nuovo bene confiscato al catalogo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset-slug">Slug (identificativo)</Label>
                <Input
                  id="asset-slug"
                  value={form.slug}
                  disabled={editingSlug != null}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="es. villa-confiscata-via-roma"
                  data-testid="input-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-denominazione">Denominazione</Label>
                <Input
                  id="asset-denominazione"
                  value={form.denominazione}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, denominazione: e.target.value }))
                  }
                  placeholder="es. Appartamento in via Roma"
                  data-testid="input-denominazione"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="asset-tipologia">Tipologia</Label>
                  <Input
                    id="asset-tipologia"
                    value={form.tipologia}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tipologia: e.target.value }))
                    }
                    placeholder="es. Appartamento, Terreno, Villa"
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
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-description">Descrizione</Label>
                <Textarea
                  id="asset-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Storia e caratteristiche del bene."
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-indirizzo">Indirizzo</Label>
                <Input
                  id="asset-indirizzo"
                  value={form.indirizzo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, indirizzo: e.target.value }))
                  }
                  placeholder="es. Via Roma 12, Lamezia Terme"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-assegnatario">Assegnatario</Label>
                <Input
                  id="asset-assegnatario"
                  value={form.assegnatario}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assegnatario: e.target.value }))
                  }
                  placeholder="es. Comune di Lamezia Terme, Cooperativa…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-destinazione">Destinazione d'uso</Label>
                <Input
                  id="asset-destinazione"
                  value={form.destinazioneUso}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, destinazioneUso: e.target.value }))
                  }
                  placeholder="es. Centro antiviolenza, alloggi sociali…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-catasto">Dati catastali</Label>
                <Input
                  id="asset-catasto"
                  value={form.datiCatastali}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, datiCatastali: e.target.value }))
                  }
                  placeholder="es. Foglio 12, Particella 345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-url">Link ufficiale (opzionale)</Label>
                <Input
                  id="asset-url"
                  value={form.officialUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, officialUrl: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-notes">Note interne (opzionale)</Label>
                <Textarea
                  id="asset-notes"
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
                  {editingSlug != null ? "Salva modifiche" : "Crea bene"}
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
              <ShieldOff className="h-5 w-5 text-brand" /> Beni configurati
            </CardTitle>
            <CardDescription>
              Gestisci i beni e correggi la posizione sulla mappa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : assets && assets.length > 0 ? (
              <div className="space-y-3">
                {assets.map((a) => (
                  <AssetRow
                    key={a.id}
                    asset={a}
                    onEdit={() => handleEdit(a)}
                    onDelete={() => handleDelete(a)}
                    onLocation={() => setEditingLocation(a)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessun bene configurato. Aggiungi il primo dal modulo a fianco.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <LocationEditor
        asset={editingLocation}
        token={token}
        onClose={() => setEditingLocation(null)}
        onSaved={invalidate}
        onAuthError={handleAuthError}
      />
    </div>
  );
}

function AssetRow({
  asset,
  onEdit,
  onDelete,
  onLocation,
}: {
  asset: ConfiscatedAssetAdmin;
  onEdit: () => void;
  onDelete: () => void;
  onLocation: () => void;
}) {
  const hasLocation = asset.latitude != null && asset.longitude != null;
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABEL[asset.status] ?? asset.status}
            </Badge>
            {asset.tipologia && (
              <Badge variant="secondary" className="text-[10px]">
                {asset.tipologia}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] ${
                asset.source === "manual"
                  ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  : "border-sky-500/40 text-sky-700 dark:text-sky-400"
              }`}
            >
              {asset.source === "manual" ? "Manuale" : "Automatico"}
            </Badge>
          </div>
          <p className="truncate text-sm font-semibold">{asset.denominazione}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {hasLocation
              ? asset.geoAddress || asset.indirizzo || "Posizionato"
              : "Posizione mancante"}
            {asset.geoVerify && hasLocation ? " · da verificare" : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onLocation}
            title="Posizione"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            title="Modifica"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Elimina"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type LatLng = { lat: number; lng: number };

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

type NominatimHit = { lat: string; lon: string; display_name: string };

function LocationEditor({
  asset,
  token,
  onClose,
  onSaved,
  onAuthError,
}: {
  asset: ConfiscatedAssetAdmin | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
  onAuthError: () => void;
}) {
  const { data: comune } = useComuneBoundary();
  const updateLocation = useUpdateConfiscatedAssetLocation({
    request: { headers: { Authorization: `Bearer ${token}` } },
  });

  const [point, setPoint] = useState<LatLng | null>(null);
  const [address, setAddress] = useState("");
  const [quartiere, setQuartiere] = useState<string>("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setPoint(
      asset.latitude != null && asset.longitude != null
        ? { lat: Number(asset.latitude), lng: Number(asset.longitude) }
        : null,
    );
    setAddress(asset.geoAddress ?? "");
    setQuartiere(asset.geoQuartiere ?? "auto");
    setSearchQuery("");
  }, [asset]);

  const center = useMemo<[number, number]>(
    () => (point ? [point.lat, point.lng] : LAMEZIA_CENTER),
    [point],
  );

  const isAuthError = (error: unknown): boolean => {
    const status = (error as { status?: number } | null)?.status;
    return status === 401 || status === 403;
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const params = new URLSearchParams({
        q: `${q}, Lamezia Terme`,
        format: "json",
        limit: "1",
        countrycodes: "it",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { Accept: "application/json" } },
      );
      const data = (await res.json()) as NominatimHit[];
      if (data.length === 0) {
        toast.error("Indirizzo non trovato", {
          description: "Prova a precisare la via o clicca sulla mappa.",
        });
        return;
      }
      const hit = data[0];
      setPoint({ lat: Number(hit.lat), lng: Number(hit.lon) });
      if (!address.trim()) setAddress(q);
    } catch {
      toast.error("Ricerca indirizzo non riuscita");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    if (!asset) return;
    if (!point) {
      toast.error("Posiziona un punto sulla mappa o cerca un indirizzo.");
      return;
    }
    updateLocation.mutate(
      {
        id: asset.id,
        data: {
          latitude: point.lat,
          longitude: point.lng,
          geoAddress: address.trim() || null,
          geoQuartiere: quartiere === "auto" ? null : quartiere,
          geoVerify: false,
        },
      },
      {
        onSuccess: () => {
          toast.success("Posizione salvata", {
            description: "La correzione manuale non verrà sovrascritta.",
          });
          onSaved();
          onClose();
        },
        onError: (error) => {
          if (isAuthError(error)) {
            onAuthError();
            return;
          }
          toast.error("Impossibile salvare la posizione");
        },
      },
    );
  };

  const handleClear = () => {
    if (!asset) return;
    updateLocation.mutate(
      {
        id: asset.id,
        data: { latitude: null, longitude: null, geoAddress: null },
      },
      {
        onSuccess: () => {
          toast.success("Posizione rimossa");
          onSaved();
          onClose();
        },
        onError: (error) => {
          if (isAuthError(error)) {
            onAuthError();
            return;
          }
          toast.error("Impossibile rimuovere la posizione");
        },
      },
    );
  };

  const saving = updateLocation.isPending;

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {asset ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display">
                <MapPin className="h-5 w-5 text-brand" />
                Posizione del bene
              </DialogTitle>
              <DialogDescription className="line-clamp-2">
                {asset.denominazione}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {asset.geoVerify &&
              asset.latitude != null &&
              asset.longitude != null ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Posizione suggerita automaticamente. Conferma se è corretta
                    o correggila cliccando sulla mappa, poi salva.
                  </span>
                </div>
              ) : null}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca un indirizzo (es. Corso Numistrano)"
                    className="h-11 bg-background pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleSearch();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 gap-2"
                  onClick={() => void handleSearch()}
                  disabled={searching}
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Cerca
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Clicca sulla mappa per posizionare o spostare il punto.
              </p>

              <div className="overflow-hidden rounded-xl border border-border">
                <MapContainer
                  center={center}
                  zoom={point ? 15 : 12}
                  scrollWheelZoom
                  className="h-[320px] w-full"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {comune ? (
                    <GeoJSON
                      data={comune as GeoJSON.GeoJsonObject}
                      style={{
                        color: "hsl(219 89% 46%)",
                        weight: 2,
                        fillOpacity: 0.04,
                      }}
                    />
                  ) : null}
                  <ClickToPlace onPick={setPoint} />
                  {point ? (
                    <CircleMarker
                      center={[point.lat, point.lng]}
                      radius={10}
                      pathOptions={{
                        color: "hsl(14 88% 48%)",
                        fillColor: "hsl(14 88% 48%)",
                        fillOpacity: 0.85,
                        weight: 2,
                      }}
                    />
                  ) : null}
                </MapContainer>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loc-address">Etichetta luogo</Label>
                  <Input
                    id="loc-address"
                    placeholder="es. Corso Numistrano"
                    className="h-11 bg-background"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc-quartiere">Quartiere</Label>
                  <Select value={quartiere} onValueChange={setQuartiere}>
                    <SelectTrigger
                      id="loc-quartiere"
                      className="h-11 bg-background"
                    >
                      <span>
                        {quartiere === "auto"
                          ? "Automatico (più vicino)"
                          : quartiereLabel(quartiere)}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        Automatico (più vicino)
                      </SelectItem>
                      <SelectItem value="nicastro">Nicastro</SelectItem>
                      <SelectItem value="sambiase">Sambiase</SelectItem>
                      <SelectItem value="santeufemia">Sant'Eufemia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {point ? (
                <div className="rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleClear}
                  disabled={saving || asset.latitude == null}
                >
                  <Trash2 className="h-4 w-4" />
                  Rimuovi posizione
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  className="gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salva posizione
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
