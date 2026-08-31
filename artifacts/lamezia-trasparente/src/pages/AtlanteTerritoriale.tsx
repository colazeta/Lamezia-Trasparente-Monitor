import { FlaskConical, Map } from "lucide-react";
import { useState, type ReactNode } from "react";

import { GeoLibreAtlasPilot } from "@/components/atlas/GeoLibreAtlasPilot";
import { isGeoLibrePilotEnabled } from "@/lib/spatial/geoLibrePilot";
import { AtlanteTerritoriale as LeafletAtlanteTerritoriale } from "./AtlanteTerritorialeExplorer";

type AtlasViewer = "leaflet" | "geolibre";

const geoLibrePilotEnabled = isGeoLibrePilotEnabled(
  import.meta.env.VITE_ATLAS_GEOLIBRE_ENABLED,
);

export function AtlanteTerritoriale() {
  const [viewer, setViewer] = useState<AtlasViewer>(() => {
    if (!geoLibrePilotEnabled || typeof window === "undefined") return "leaflet";
    return new URLSearchParams(window.location.search).get("viewer") === "geolibre"
      ? "geolibre"
      : "leaflet";
  });

  if (!geoLibrePilotEnabled) {
    return <LeafletAtlanteTerritoriale />;
  }

  return (
    <>
      <div className="sticky top-0 z-[90] border-b border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <div
          aria-label="Seleziona il viewer cartografico"
          className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2"
          role="group"
        >
          <div>
            <p className="text-xs font-semibold text-foreground">Viewer Atlante</p>
            <p className="text-[11px] text-muted-foreground">
              Leaflet resta il riferimento; GeoLibre è in validazione.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <ViewerButton
              active={viewer === "leaflet"}
              label="Leaflet"
              onClick={() => setViewer("leaflet")}
            >
              <Map className="h-3.5 w-3.5" aria-hidden="true" />
            </ViewerButton>
            <ViewerButton
              active={viewer === "geolibre"}
              label="GeoLibre"
              onClick={() => setViewer("geolibre")}
            >
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            </ViewerButton>
          </div>
        </div>
      </div>

      {viewer === "geolibre" ? (
        <GeoLibreAtlasPilot />
      ) : (
        <LeafletAtlanteTerritoriale />
      )}
    </>
  );
}

function ViewerButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  );
}
