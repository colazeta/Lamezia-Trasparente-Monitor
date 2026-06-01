import "leaflet/dist/leaflet.css";

import L from "leaflet";
import React, { useMemo } from "react";
import { View } from "react-native";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import { useColors } from "@/hooks/useColors";
import { LAMEZIA_CENTER, macrotemaColor, useComuneBoundary } from "@/lib/gis";
import type { Contract } from "@workspace/api-client-react";

type LocatedContract = Contract & { latitude: number; longitude: number };

function isLocated(c: Contract): c is LocatedContract {
  return typeof c.latitude === "number" && typeof c.longitude === "number";
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
        {located.map((c) => {
          const color = c.geoVerify ? "#d97706" : macrotemaColor(c.macrotema);
          return (
            <CircleMarker
              key={c.id}
              center={[c.latitude, c.longitude] as L.LatLngTuple}
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
      </MapContainer>
    </View>
  );
}
