import "leaflet/dist/leaflet.css";

import L from "leaflet";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  Tooltip,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Supercluster from "supercluster";

import { useColors } from "@/hooks/useColors";
import { LAMEZIA_CENTER, macrotemaColor, useComuneBoundary } from "@/lib/gis";
import type { Contract } from "@workspace/api-client-react";

type LocatedContract = Contract & { latitude: number; longitude: number };

function isLocated(c: Contract): c is LocatedContract {
  return typeof c.latitude === "number" && typeof c.longitude === "number";
}

type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type LeafProps = { cluster?: false; contractId: number };
type MarkerIcon = NonNullable<React.ComponentProps<typeof Marker>["icon"]>;

function clusterIcon(count: number, color: string): MarkerIcon {
  const size = count < 10 ? 34 : count < 50 ? 42 : count < 100 ? 50 : 58;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      border-radius:9999px;
      background:${color};
      color:#fff;font-weight:700;font-size:13px;
      border:3px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  }) as unknown as MarkerIcon;
}

function ClusteredMarkers({
  located,
  onMarkerPress,
}: {
  located: LocatedContract[];
  onMarkerPress?: (contract: Contract) => void;
}) {
  const colors = useColors();
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
              icon={clusterIcon(count, colors.primary)}
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
                {count} interventi
              </Tooltip>
            </Marker>
          );
        }

        const c = byId.get((props as LeafProps).contractId);
        if (!c) return null;
        const color = c.geoVerify ? "#d97706" : macrotemaColor(c.macrotema);
        return (
          <CircleMarker
            key={c.id}
            center={[lat, lng] as L.LatLngTuple}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: color,
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onMarkerPress?.(c) }}
          >
            <Popup>{c.title}</Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function InterventionsMap({
  contracts,
  height = 260,
  onMarkerPress,
  showBoundary = true,
}: {
  contracts: Contract[];
  height?: number;
  onMarkerPress?: (contract: Contract) => void;
  showBoundary?: boolean;
}) {
  const colors = useColors();
  const { data: comune } = useComuneBoundary();

  const located = useMemo(() => contracts.filter(isLocated), [contracts]);

  const center = useMemo<[number, number]>(() => {
    if (located.length === 0)
      return [LAMEZIA_CENTER.latitude, LAMEZIA_CENTER.longitude];
    if (located.length === 1)
      return [located[0].latitude, located[0].longitude];
    const lats = located.map((c) => c.latitude);
    const lons = located.map((c) => c.longitude);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2,
    ];
  }, [located]);

  const zoom = located.length <= 1 ? 13 : 12;

  return (
    <View
      style={{
        height,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: colors.radius + 2,
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showBoundary && comune ? (
          <GeoJSON
            data={comune}
            style={{
              color: colors.primary,
              weight: 2,
              fillColor: colors.primary,
              fillOpacity: 0.06,
            }}
          />
        ) : null}
        <ClusteredMarkers located={located} onMarkerPress={onMarkerPress} />
      </MapContainer>
    </View>
  );
}
