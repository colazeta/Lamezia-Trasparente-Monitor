import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
  Popup,
} from "react-leaflet";
import { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "wouter";
import type { ConfiscatedAsset } from "@workspace/api-client-react";
import {
  LAMEZIA_CENTER,
  quartiereLabel,
  useComuneBoundary,
  useQuartieri,
} from "@/lib/gis";

// Colore per stato del bene, coerente con i badge della sezione.
export const STATUS_COLOR: Record<string, string> = {
  sequestrato: "hsl(36 92% 48%)",
  confiscato: "hsl(219 89% 50%)",
  assegnato: "hsl(142 70% 38%)",
  riutilizzato: "hsl(266 70% 58%)",
};

export const STATUS_LABEL: Record<string, string> = {
  sequestrato: "Sequestrato",
  confiscato: "Confiscato",
  assegnato: "Assegnato",
  riutilizzato: "Riutilizzato",
};

function statusColor(status: string): string {
  return STATUS_COLOR[status] ?? "hsl(220 9% 46%)";
}

type LocatedAsset = ConfiscatedAsset & { lat: number; lon: number };

export type ConfiscatedAssetsMapProps = {
  assets: ConfiscatedAsset[];
  selectedId?: number | null;
  onSelect?: (asset: ConfiscatedAsset) => void;
  className?: string;
  showBaseLayers?: boolean;
  zoom?: number;
};

export function ConfiscatedAssetsMap({
  assets,
  selectedId,
  onSelect,
  className,
  showBaseLayers = true,
  zoom = 12,
}: ConfiscatedAssetsMapProps) {
  const { data: comune } = useComuneBoundary();
  const { data: quartieri } = useQuartieri();

  const located = useMemo<LocatedAsset[]>(
    () =>
      assets
        .map((a) => ({
          ...a,
          lat: a.latitude != null ? Number(a.latitude) : NaN,
          lon: a.longitude != null ? Number(a.longitude) : NaN,
        }))
        .filter(
          (a): a is LocatedAsset =>
            Number.isFinite(a.lat) && Number.isFinite(a.lon),
        ),
    [assets],
  );

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (located.length === 0) return undefined;
    const lats = located.map((a) => a.lat);
    const lons = located.map((a) => a.lon);
    return [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)],
    ];
  }, [located]);

  return (
    <MapContainer
      center={LAMEZIA_CENTER}
      zoom={zoom}
      bounds={bounds}
      scrollWheelZoom={false}
      className={className ?? "h-[420px] w-full rounded-xl"}
      style={{ background: "hsl(var(--muted))" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showBaseLayers && comune ? (
        <GeoJSON
          key="comune"
          data={comune as GeoJSON.GeoJsonObject}
          style={{
            color: "hsl(219 89% 46%)",
            weight: 2,
            fillColor: "hsl(219 89% 46%)",
            fillOpacity: 0.05,
          }}
        />
      ) : null}

      {showBaseLayers && quartieri
        ? quartieri.features.map((f, i) => {
            const coords = f.geometry.coordinates as [number, number];
            return (
              <CircleMarker
                key={`q-${i}`}
                center={[coords[1], coords[0]]}
                radius={5}
                pathOptions={{
                  color: "hsl(220 9% 46%)",
                  fillColor: "hsl(220 9% 70%)",
                  fillOpacity: 0.7,
                  weight: 1,
                }}
              >
                <Tooltip>{String(f.properties.name ?? "")}</Tooltip>
              </CircleMarker>
            );
          })
        : null}

      {located.map((a) => {
        const isSelected = selectedId === a.id;
        const color = statusColor(a.status);
        return (
          <CircleMarker
            key={a.id}
            center={[a.lat, a.lon]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect?.(a) }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <div className="font-semibold leading-snug">
                  {a.denominazione}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.geoAddress || a.indirizzo
                    ? `${a.geoAddress || a.indirizzo} · `
                    : ""}
                  {quartiereLabel(a.geoQuartiere)}
                </div>
                <div className="text-xs font-medium" style={{ color }}>
                  {STATUS_LABEL[a.status] ?? a.status}
                </div>
                <Link
                  href={`/beni-confiscati/${a.slug}`}
                  className="mt-1 inline-block text-xs font-medium text-primary underline"
                >
                  Apri dettaglio
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
