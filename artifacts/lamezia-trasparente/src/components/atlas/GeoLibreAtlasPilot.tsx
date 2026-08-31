import { ExternalLink, FlaskConical, Info } from "lucide-react";
import { useMemo } from "react";

import { getActiveAtlasSpatialLayers } from "@/lib/spatial";
import { buildGeoLibreViewerUrl } from "@/lib/spatial/geoLibrePilot";

const DEFAULT_GEOLIBRE_VIEWER_URL = "https://web.geolibre.app/";

export function GeoLibreAtlasPilot() {
  const viewerUrl = useMemo(() => {
    if (typeof window === "undefined") return null;

    return buildGeoLibreViewerUrl({
      viewerBaseUrl:
        import.meta.env.VITE_ATLAS_GEOLIBRE_URL?.trim() ||
        DEFAULT_GEOLIBRE_VIEWER_URL,
      layers: getActiveAtlasSpatialLayers(),
      siteOrigin: window.location.origin,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    });
  }, []);

  if (!viewerUrl) return null;

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
            Viewer alternativo alimentato dagli stessi layer canonici dell’Atlante.
            Leaflet resta la versione pubblica di riferimento durante la fase di
            validazione.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] space-y-3 px-2 py-3 sm:px-4 lg:px-6">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden="true" />
          <p>
            Il pilot carica direttamente i `dataPath` dei layer con
            `atlasStatus=active`. Se il viewer è ospitato su un’origine diversa,
            i relativi endpoint devono consentire richieste CORS. La
            sincronizzazione bidirezionale con schede, filtri e selezioni verrà
            attivata solo su un deployment GeoLibre configurato per l’embed API.
          </p>
        </div>

        <section
          aria-label="Viewer GeoLibre sperimentale dell’Atlante territoriale"
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg"
        >
          <iframe
            allow="fullscreen; geolocation"
            className="h-[78svh] min-h-[620px] w-full border-0"
            loading="lazy"
            src={viewerUrl}
            title="Atlante territoriale — viewer GeoLibre sperimentale"
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Pilot read-only: nessuna modifica ai dati canonici viene effettuata
            da GeoLibre.
          </span>
          <a
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            href={viewerUrl}
            rel="noreferrer"
            target="_blank"
          >
            Apri il pilot in una nuova scheda
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </main>
  );
}
