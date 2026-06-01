import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Marker,
  Tooltip,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Supercluster from "supercluster";
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

type LocatedContract = Contract & { latitude: number; longitude: number };

type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type LeafProps = { cluster?: false; contractId: number };

function clusterIcon(count: number): L.DivIcon {
  // La dimensione cresce in modo discreto con il numero di interventi raggruppati.
  const size = count < 10 ? 36 : count < 50 ? 44 : count < 100 ? 52 : 60;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      border-radius:9999px;
      background:hsl(219 89% 46% / 0.9);
      color:hsl(0 0% 100%);font-weight:700;font-size:13px;
      border:3px solid hsl(0 0% 100%);
      box-shadow:0 1px 4px hsl(0 0% 0% / 0.35);
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function ClusteredMarkers({
  located,
  selectedId,
  onSelect,
}: {
  located: LocatedContract[];
  selectedId?: number | null;
  onSelect?: (contract: Contract) => void;
}) {
  const map = useMap();
  const [clusters, setClusters] = useState<
    Supercluster.PointFeature<ClusterProps | LeafProps>[]
  >([]);

  const byId = useMemo(() => {
    const m = new Map<number, LocatedContract>();
    for (const c of located) m.set(c.id, c);
    return m;
  }, [located]);

  const index = useMemo(() => {
    const sc = new Supercluster<LeafProps, ClusterProps>({
      radius: 60,
      maxZoom: 17,
    });
    sc.load(
      located.map((c) => ({
        type: "Feature" as const,
        properties: { cluster: false as const, contractId: c.id },
        geometry: {
          type: "Point" as const,
          coordinates: [c.longitude, c.latitude],
        },
      })),
    );
    return sc;
  }, [located]);

  const refresh = useCallback(() => {
    const b = map.getBounds();
    const bbox: [number, number, number, number] = [
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ];
    const zoom = Math.round(map.getZoom());
    setClusters(
      index.getClusters(bbox, zoom) as Supercluster.PointFeature<
        ClusterProps | LeafProps
      >[],
    );
  }, [index, map]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useMapEvents({
    moveend: refresh,
    zoomend: refresh,
  });

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        if ("cluster" in props && props.cluster) {
          const count = props.point_count;
          return (
            <Marker
              key={`cluster-${props.cluster_id}`}
              position={[lat, lng]}
              icon={clusterIcon(count)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    index.getClusterExpansionZoom(props.cluster_id),
                    17,
                  );
                  map.setView([lat, lng], expansionZoom, { animate: true });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {count} interventi · clicca per espandere
              </Tooltip>
            </Marker>
          );
        }

        const c = byId.get((props as LeafProps).contractId);
        if (!c) return null;
        const isSelected = selectedId === c.id;
        const color = macrotemaColor(c.macrotema);
        return (
          <CircleMarker
            key={c.id}
            center={[lat, lng]}
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
    </>
  );
}

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
        (c): c is LocatedContract =>
          typeof c.latitude === "number" && typeof c.longitude === "number",
      ),
    [contracts],
  );

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    if (located.length === 0) return undefined;
    const lats = located.map((c) => c.latitude);
    const lons = located.map((c) => c.longitude);
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

      <ClusteredMarkers
        located={located}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </MapContainer>
  );
}
