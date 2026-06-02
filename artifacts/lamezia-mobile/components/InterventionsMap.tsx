import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, {
  Marker as MarkerBase,
  Polygon,
  PROVIDER_DEFAULT,
  type Region,
  type MapMarkerProps,
} from "react-native-maps";
import Supercluster from "supercluster";

import { useColors } from "@/hooks/useColors";
import {
  LAMEZIA_REGION,
  macrotemaColor,
  polygonCoordinates,
  useComuneBoundary,
} from "@/lib/gis";
import type { Contract } from "@workspace/api-client-react";

const Marker = MarkerBase as unknown as React.FC<MapMarkerProps>;

type LocatedContract = Contract & { latitude: number; longitude: number };

function isLocated(c: Contract): c is LocatedContract {
  return typeof c.latitude === "number" && typeof c.longitude === "number";
}

type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type LeafProps = { cluster?: false; contractId: number };

function regionToZoom(region: Region): number {
  // Lo zoom equivalente a una vista web si ricava dall'ampiezza in longitudine.
  return Math.round(Math.log2(360 / Math.max(region.longitudeDelta, 1e-6)));
}

function regionToBbox(region: Region): [number, number, number, number] {
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;
  return [west, south, east, north];
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
  const mapRef = useRef<MapView | null>(null);

  const located = useMemo(() => contracts.filter(isLocated), [contracts]);

  const rings = useMemo(
    () => (showBoundary ? polygonCoordinates(comune) : []),
    [comune, showBoundary],
  );

  const initialRegion = useMemo<Region>(() => {
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

  const [region, setRegion] = useState<Region>(initialRegion);

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

  const clusters = useMemo(
    () =>
      index.getClusters(regionToBbox(region), regionToZoom(region)) as
        | Supercluster.PointFeature<ClusterProps | LeafProps>[],
    [index, region],
  );

  const onClusterPress = useCallback(
    (clusterId: number, lat: number, lng: number) => {
      const expansionZoom = Math.min(
        index.getClusterExpansionZoom(clusterId),
        17,
      );
      const longitudeDelta = 360 / Math.pow(2, expansionZoom);
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: longitudeDelta,
          longitudeDelta,
        },
        350,
      );
    },
    [index],
  );

  return (
    <View
      style={[
        styles.wrap,
        { height, borderColor: colors.border, borderRadius: colors.radius + 2 },
      ]}
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
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
        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;

          if ("cluster" in props && props.cluster) {
            const count = props.point_count;
            const size = count < 10 ? 36 : count < 50 ? 44 : 52;
            return (
              <Marker
                key={`cluster-${props.cluster_id}`}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => onClusterPress(props.cluster_id, lat, lng)}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={[
                    styles.cluster,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.clusterText}>{count}</Text>
                </View>
              </Marker>
            );
          }

          const c = byId.get((props as LeafProps).contractId);
          if (!c) return null;
          return (
            <Marker
              key={c.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={c.title}
              description={
                c.geoVerify
                  ? "Posizione approssimata, da verificare"
                  : undefined
              }
              pinColor={c.geoVerify ? "#d97706" : macrotemaColor(c.macrotema)}
              onCalloutPress={() => onMarkerPress?.(c)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cluster: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  clusterText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
