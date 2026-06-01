import { useEffect, useMemo, useState } from "react";
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
  MapPin,
  Search,
  Trash2,
  Save,
  Loader2,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { useUpdateContractLocation, type Contract } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  LAMEZIA_CENTER,
  quartiereLabel,
  useComuneBoundary,
} from "@/lib/gis";

type LatLng = { lat: number; lng: number };

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

type NominatimHit = { lat: string; lon: string; display_name: string };

export function LocationEditor({
  contract,
  token,
  onClose,
  onSaved,
  onAuthError,
  queue,
}: {
  contract: Contract | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
  onAuthError: () => void;
  queue?: { position: number; total: number; onNext: () => void } | null;
}) {
  const { data: comune } = useComuneBoundary();
  const updateLocation = useUpdateContractLocation({
    request: { headers: { Authorization: `Bearer ${token}` } },
  });

  const [point, setPoint] = useState<LatLng | null>(null);
  const [address, setAddress] = useState("");
  const [quartiere, setQuartiere] = useState<string>("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!contract) return;
    setPoint(
      typeof contract.latitude === "number" &&
        typeof contract.longitude === "number"
        ? { lat: contract.latitude, lng: contract.longitude }
        : null,
    );
    setAddress(contract.geoAddress ?? "");
    setQuartiere(contract.geoQuartiere ?? "auto");
    setSearchQuery("");
  }, [contract]);

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
    if (!contract) return;
    if (!point) {
      toast.error("Posiziona un punto sulla mappa o cerca un indirizzo.");
      return;
    }
    updateLocation.mutate(
      {
        id: contract.id,
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
          if (queue) queue.onNext();
          else onClose();
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
    if (!contract) return;
    updateLocation.mutate(
      {
        id: contract.id,
        data: { latitude: null, longitude: null, geoAddress: null },
      },
      {
        onSuccess: () => {
          toast.success("Posizione rimossa");
          onSaved();
          if (queue) queue.onNext();
          else onClose();
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
    <Dialog open={!!contract} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {contract ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                Posizione dell'intervento
                {queue ? (
                  <span className="ml-auto rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                    Da posizionare {queue.position} di {queue.total}
                  </span>
                ) : null}
              </DialogTitle>
              <DialogDescription className="line-clamp-2">
                {contract.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {contract.geoVerify && typeof contract.latitude === "number" ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Posizione suggerita automaticamente. Conferma se è corretta o
                    correggila cliccando sulla mappa, poi salva.
                  </span>
                </div>
              ) : null}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca un indirizzo (es. Corso Numistrano)"
                    className="pl-9 h-11 bg-background"
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
                  disabled={
                    saving || typeof contract.latitude !== "number"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Rimuovi posizione
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  {queue ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={queue.onNext}
                      disabled={saving}
                    >
                      <SkipForward className="h-4 w-4" />
                      Salta
                    </Button>
                  ) : null}
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
                    {queue ? "Salva e prosegui" : "Salva posizione"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
