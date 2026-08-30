import { useEffect, useState } from "react";
import { CircleMarker, Popup, Tooltip } from "react-leaflet";
import {
  loadConfiscatedAssetsSpatialLayer,
  type ConfiscatedAssetsSpatialCollection,
} from "@/data/spatialLayers";

export type ConfiscatedAssetsAtlasLayerState =
  | { status: "idle"; collection: null; message: null }
  | { status: "loading"; collection: null; message: null }
  | {
      status: "ready";
      collection: ConfiscatedAssetsSpatialCollection;
      message: null;
    }
  | { status: "error"; collection: null; message: string };

export function useConfiscatedAssetsAtlasLayer(
  enabled: boolean,
): ConfiscatedAssetsAtlasLayerState {
  const [state, setState] = useState<ConfiscatedAssetsAtlasLayerState>({
    status: "idle",
    collection: null,
    message: null,
  });

  useEffect(() => {
    if (!enabled || state.status === "ready" || state.status === "loading") {
      return;
    }

    let cancelled = false;
    setState({ status: "loading", collection: null, message: null });

    loadConfiscatedAssetsSpatialLayer()
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
            message: "Il layer dei beni confiscati non è disponibile.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, state.status]);

  return state;
}

export function ConfiscatedAssetsAtlasLayer({
  state,
}: {
  state: ConfiscatedAssetsAtlasLayerState;
}) {
  if (state.status !== "ready") return null;

  return (
    <>
      {state.collection.features.map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const properties = feature.properties;

        return (
          <CircleMarker
            center={[latitude, longitude]}
            key={feature.id}
            pathOptions={{
              color: "hsl(24 74% 42%)",
              fillColor: "hsl(24 74% 52%)",
              fillOpacity: 0.84,
              opacity: 1,
              weight: 2,
            }}
            radius={7}
          >
            <Tooltip direction="top" opacity={0.96}>
              {properties.title}
            </Tooltip>
            <Popup maxWidth={320} minWidth={240}>
              <article className="space-y-2 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Bene confiscato
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">
                    {properties.title}
                  </h3>
                  {properties.address ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {properties.address}
                    </p>
                  ) : null}
                </div>

                <dl className="grid gap-1 border-t border-border pt-2 text-xs">
                  <div className="grid grid-cols-[88px_1fr] gap-2">
                    <dt className="text-muted-foreground">Stato</dt>
                    <dd className="font-medium text-foreground">
                      {formatAssetStatus(properties.status)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[88px_1fr] gap-2">
                    <dt className="text-muted-foreground">Posizione</dt>
                    <dd className="font-medium text-foreground">
                      {formatSpatialQuality(
                        properties.spatial_precision,
                        properties.verification_status,
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[88px_1fr] gap-2">
                    <dt className="text-muted-foreground">Origine</dt>
                    <dd className="font-medium text-foreground">
                      {formatSpatialMethod(properties.spatial_method)}
                    </dd>
                  </div>
                </dl>

                <p className="border-t border-border pt-2 text-[11px] leading-4 text-muted-foreground">
                  {properties.public_note}
                </p>

                <a
                  className="inline-flex font-semibold text-primary hover:underline"
                  href={properties.public_url}
                >
                  Apri la scheda completa
                </a>
              </article>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function getConfiscatedAssetsCoverageLabel(
  state: ConfiscatedAssetsAtlasLayerState,
): string | null {
  if (state.status === "loading") return "Caricamento beni confiscati…";
  if (state.status === "error") return state.message;
  if (state.status !== "ready") return null;

  const { input_records, published_features, excluded_records } =
    state.collection.metadata;
  if (input_records === 0) return "Nessun bene disponibile";

  return `${published_features} in mappa su ${input_records}; ${excluded_records} esclusi perché la localizzazione non supera ancora i criteri di pubblicazione`;
}

function formatAssetStatus(
  status: "sequestrato" | "confiscato" | "assegnato" | "riutilizzato",
): string {
  const labels = {
    sequestrato: "Sequestrato",
    confiscato: "Confiscato",
    assegnato: "Assegnato",
    riutilizzato: "Riutilizzato",
  } as const;
  return labels[status];
}

function formatSpatialQuality(
  precision: "street" | "unknown",
  verification: "verified" | "machine_geocoded",
): string {
  if (verification === "verified") {
    return precision === "unknown"
      ? "Posizione editoriale verificata; precisione non qualificata"
      : "Posizione verificata";
  }
  return precision === "street"
    ? "Livello strada; geocodifica automatica"
    : "Geocodifica automatica";
}

function formatSpatialMethod(
  method:
    | "official_address_geocoded"
    | "other_address_geocoded"
    | "manual_coordinates",
): string {
  if (method === "manual_coordinates") return "Coordinate fissate dalla redazione";
  if (method === "official_address_geocoded") {
    return "Indirizzo della fonte ufficiale geocodificato";
  }
  return "Indirizzo geocodificato";
}
