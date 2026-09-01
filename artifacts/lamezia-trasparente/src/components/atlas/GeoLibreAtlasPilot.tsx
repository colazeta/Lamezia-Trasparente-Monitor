import {
  AlertTriangle,
  ExternalLink,
  FlaskConical,
  Info,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getActiveAtlasSpatialLayers } from "@/lib/spatial";
import {
  buildGeoLibreViewerUrl,
  checkGeoLibreLayerAvailability,
  type GeoLibreLayerAvailability,
} from "@/lib/spatial/geoLibrePilot";

const DEFAULT_GEOLIBRE_VIEWER_URL = "https://web.geolibre.app/";

export function GeoLibreAtlasPilot() {
  const activeLayers = useMemo(() => getActiveAtlasSpatialLayers(), []);
  const siteOrigin =
    typeof window === "undefined" ? null : window.location.origin;
  const [availability, setAvailability] = useState<
    GeoLibreLayerAvailability[] | null
  >(null);

  useEffect(() => {
    if (!siteOrigin) return;

    const controller = new AbortController();
    void checkGeoLibreLayerAvailability({
      layers: activeLayers,
      siteOrigin,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      signal: controller.signal,
    }).then((result) => {
      if (!controller.signal.aborted) setAvailability(result);
    });

    return () => controller.abort();
  }, [activeLayers, siteOrigin]);

  const readyLayers = useMemo(
    () =>
      availability
        ?.filter((item) => item.status === "ready")
        .map((item) => item.layer) ?? [],
    [availability],
  );
  const unavailableLayers = useMemo(
    () => availability?.filter((item) => item.status === "unavailable") ?? [],
    [availability],
  );
  const viewerUrl = useMemo(() => {
    if (!siteOrigin || readyLayers.length === 0) return null;

    return buildGeoLibreViewerUrl({
      viewerBaseUrl:
        import.meta.env.VITE_ATLAS_GEOLIBRE_URL?.trim() ||
        DEFAULT_GEOLIBRE_VIEWER_URL,
      layers: readyLayers,
      siteOrigin,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    });
  }, [readyLayers, siteOrigin]);

  if (!siteOrigin) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Atlante territoriale
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-1 text-xs font-semibold text-foreground">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              GeoLibre sperimentale
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Viewer alternativo alimentato dagli stessi layer canonici
            dell’Atlante. Leaflet resta la versione pubblica di riferimento
            durante la fase di validazione.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] space-y-3 px-2 py-3 sm:px-4 lg:px-6">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          <Info
            className="mt-0.5 h-4 w-4 flex-none text-primary"
            aria-hidden="true"
          />
          <p>
            Prima di aprire GeoLibre, il pilot verifica i feed dei layer attivi
            e inoltra al viewer soltanto quelli disponibili e in formato
            GeoJSON. Un feed non raggiungibile resta dichiarato come
            indisponibile: non viene sostituito con un insieme vuoto.
          </p>
        </div>

        {availability === null ? (
          <div
            aria-live="polite"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-3 text-sm text-muted-foreground"
            role="status"
          >
            <LoaderCircle
              className="h-4 w-4 animate-spin text-primary"
              aria-hidden="true"
            />
            Verifica dei {activeLayers.length} feed territoriali in corso…
          </div>
        ) : (
          <div
            aria-live="polite"
            className="rounded-lg border border-border bg-card px-3 py-3 text-sm"
            role="status"
          >
            <p className="font-semibold text-foreground">
              Copertura GeoLibre: {readyLayers.length} di {activeLayers.length}{" "}
              layer disponibili
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              La copertura indica la disponibilità tecnica rilevata ora, non la
              completezza informativa dei singoli dataset.
            </p>
          </div>
        )}

        {availability !== null && unavailableLayers.length > 0 ? (
          <div
            className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-xs leading-5 text-foreground"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 flex-none text-warning"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">Layer temporaneamente esclusi</p>
              <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                {unavailableLayers.map((item) => (
                  <li key={item.layer.id}>
                    {item.layer.title} — {unavailableLayerReason(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {viewerUrl ? (
          <section
            aria-label="Viewer GeoLibre sperimentale dell’Atlante territoriale"
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg"
          >
            <iframe
              allow="fullscreen"
              className="h-[78svh] min-h-[620px] w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={viewerUrl}
              title="Atlante territoriale — viewer GeoLibre sperimentale"
            />
          </section>
        ) : availability !== null ? (
          <section
            aria-label="GeoLibre temporaneamente non disponibile"
            className="rounded-2xl border border-border/80 bg-card px-4 py-10 text-center shadow-sm"
          >
            <p className="font-semibold text-foreground">
              Nessun feed territoriale è raggiungibile da GeoLibre in questo
              momento.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Puoi tornare al viewer Leaflet con il selettore in alto.
            </p>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Pilot read-only: nessuna modifica ai dati canonici viene effettuata
            da GeoLibre.
          </span>
          {viewerUrl ? (
            <a
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              href={viewerUrl}
              rel="noreferrer"
              target="_blank"
            >
              Apri il pilot in una nuova scheda
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function unavailableLayerReason(item: GeoLibreLayerAvailability): string {
  if (item.reason === "timeout") return "tempo di risposta scaduto";
  if (item.reason === "invalid_content_type") return "formato non GeoJSON";
  if (item.reason === "missing_data_path") return "feed non configurato";
  if (item.httpStatus !== null) return `HTTP ${item.httpStatus}`;
  return "rete/CORS";
}
