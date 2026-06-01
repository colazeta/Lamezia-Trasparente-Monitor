import { useQuery } from "@tanstack/react-query";

// Livelli GIS di base serviti dall'API (dati aperti OpenStreetMap).
// Il client API orval usa baseUrl "/api"; usiamo la stessa convenzione qui.

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: unknown;
    };
  }>;
};

async function fetchGeoJson(path: string): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(`/api${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`GIS fetch failed: ${res.status}`);
  }
  return (await res.json()) as GeoJsonFeatureCollection;
}

export function useComuneBoundary() {
  return useQuery({
    queryKey: ["gis", "comune"],
    queryFn: () => fetchGeoJson("/gis/comune"),
    staleTime: Infinity,
  });
}

export function useQuartieri() {
  return useQuery({
    queryKey: ["gis", "quartieri"],
    queryFn: () => fetchGeoJson("/gis/quartieri"),
    staleTime: Infinity,
  });
}

// Centro approssimato del territorio comunale (per inquadrare la mappa).
export const LAMEZIA_CENTER: [number, number] = [38.965, 16.31];

// Etichette leggibili dei quartieri/circoscrizioni storiche.
export const QUARTIERE_LABELS: Record<string, string> = {
  nicastro: "Nicastro",
  sambiase: "Sambiase",
  santeufemia: "Sant'Eufemia",
};

export function quartiereLabel(key: string | null | undefined): string {
  if (!key) return "—";
  return QUARTIERE_LABELS[key] ?? key;
}

// Colore (HSL theme var) per ambito di spesa, coerente con il resto della UI.
export const MACROTEMA_COLOR: Record<string, string> = {
  ambiente: "hsl(142 70% 38%)",
  scuole: "hsl(219 89% 50%)",
  strade: "hsl(36 92% 48%)",
  sociale: "hsl(330 75% 52%)",
  cultura: "hsl(266 70% 58%)",
  mobilita: "hsl(186 80% 38%)",
  altro: "hsl(220 9% 46%)",
};

export function macrotemaColor(key: string | null | undefined): string {
  if (!key) return MACROTEMA_COLOR.altro;
  return MACROTEMA_COLOR[key] ?? MACROTEMA_COLOR.altro;
}
