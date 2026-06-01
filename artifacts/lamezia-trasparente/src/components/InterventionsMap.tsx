import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Tooltip,
  Popup,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Contract } from "@workspace/api-client-react";
import {
  LAMEZIA_CENTER,
  macrotemaColor,
  quartiereLabel,
  useComuneBoundary,
  useQuartieri,
} from "@/lib/gis";

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export type InterventionsMapProps = {
  contracts: Contract[];
  selectedId?: number | null;
  onSelect?: (contract: Contract) => void;
  className?: string;
  // Mostra i confini comunali e i centroidi dei quartieri come livelli di base.
  showBaseLayers?: boolean;
};

export function InterventionsMap({
  contracts,
  selectedId,
  onSelect,
  className,
  showBaseLayers = true,
}: InterventionsMapProps) {
  const { data: comune } = useComuneBoundary();
  const { data: quartieri } = useQuartieri();

  const located = useMemo(
    () =>
      contracts.filter(
        (c) =>
          typeof c.latitude === "number" && typeof c.longitude === "number",
      ),
    [contracts],
  );

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (located.length === 0) return undefined;
    const lats = located.map((c) => c.latitude as number);
    const lons = located.map((c) => c.longitude as number);
    return [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)],
    ];
  }, [located]);

  return (
    <MapContainer
      center={LAMEZIA_CENTER}
      zoom={12}
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

      {located.map((c) => {
        const isSelected = selectedId === c.id;
        const color = macrotemaColor(c.macrotema);
        return (
          <CircleMarker
            key={c.id}
            center={[c.latitude as number, c.longitude as number]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: c.geoVerify ? "hsl(36 92% 40%)" : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: c.geoVerify ? 3 : isSelected ? 3 : 1.5,
              dashArray: c.geoVerify ? "3 3" : undefined,
            }}
            eventHandlers={{
              click: () => onSelect?.(c),
            }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <div className="font-semibold leading-snug">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c.geoAddress ? `${c.geoAddress} · ` : ""}
                  {quartiereLabel(c.geoQuartiere)}
                </div>
                <div className="text-sm font-bold">
                  {c.amount > 0 ? formatEuro(c.amount) : "—"}
                </div>
                {c.geoVerify ? (
                  <div className="text-xs font-medium text-amber-600">
                    Posizione da verificare
                  </div>
                ) : null}
                {onSelect ? (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-primary underline"
                    onClick={() => onSelect(c)}
                  >
                    Apri dettaglio
                  </button>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
