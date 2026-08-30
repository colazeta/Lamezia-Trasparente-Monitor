import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

import {
  loadMunicipalBoundarySpatialLayer,
  type MunicipalBoundarySpatialCollection,
} from "@/data/spatialLayers";

export type MunicipalBoundaryAtlasLayerState =
  | { status: "loading"; collection: null; message: null }
  | {
      status: "ready";
      collection: MunicipalBoundarySpatialCollection;
      message: null;
    }
  | { status: "error"; collection: null; message: string };

export function useMunicipalBoundaryAtlasLayer(): MunicipalBoundaryAtlasLayerState {
  const [state, setState] = useState<MunicipalBoundaryAtlasLayerState>({
    status: "loading",
    collection: null,
    message: null,
  });

  useEffect(() => {
    let cancelled = false;

    loadMunicipalBoundarySpatialLayer()
      .then((collection) => {
        if (!cancelled) {
          setState({ status: "ready", collection, message: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            collection: null,
            message: "Il confine comunale non è disponibile.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function MunicipalBoundaryAtlasLayer({
  state,
}: {
  state: MunicipalBoundaryAtlasLayerState;
}) {
  if (state.status !== "ready") return null;

  return (
    <GeoJSON
      data={state.collection as unknown as GeoJSON.GeoJsonObject}
      interactive={false}
      style={{
        color: "hsl(24 74% 42%)",
        fill: false,
        opacity: 0.9,
        weight: 2.4,
      }}
    />
  );
}
