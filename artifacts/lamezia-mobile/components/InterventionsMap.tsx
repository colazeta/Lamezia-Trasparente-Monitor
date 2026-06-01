import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from "react-native-maps";

import { useColors } from "@/hooks/useColors";
import {
  LAMEZIA_REGION,
  macrotemaColor,
  polygonCoordinates,
  useComuneBoundary,
} from "@/lib/gis";
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

  const rings = useMemo(
    () => (showBoundary ? polygonCoordinates(comune) : []),
    [comune, showBoundary],
  );

  const region = useMemo(() => {
    if (located.length === 0) return LAMEZIA_REGION;
    if (located.length === 1) {
      return {
        latitude: located[0].latitude,
        longitude: located[0].longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }
    const lats = located.map((c) => c.latitude);
    const lons = located.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(0.04, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.04, (maxLon - minLon) * 1.5),
    };
  }, [located]);

  return (
    <View
      style={[
        styles.wrap,
        { height, borderColor: colors.border, borderRadius: colors.radius + 2 },
      ]}
    >
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        region={region}
      >
        {rings.map((ring, i) => (
          <Polygon
            key={`ring-${i}`}
            coordinates={ring}
            strokeColor={colors.primary}
            strokeWidth={2}
            fillColor="rgba(37,99,235,0.06)"
          />
        ))}
        {located.map((c) => (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.latitude, longitude: c.longitude }}
            title={c.title}
            description={
              c.geoVerify ? "Posizione approssimata, da verificare" : undefined
            }
            pinColor={c.geoVerify ? "#d97706" : macrotemaColor(c.macrotema)}
            onCalloutPress={() => onMarkerPress?.(c)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
