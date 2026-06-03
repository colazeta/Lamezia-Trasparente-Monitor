import { useQuery } from "@tanstack/react-query";

export const LAMEZIA_CENTER = { latitude: 38.9667, longitude: 16.3 };

export const LAMEZIA_REGION = {
  latitude: 38.9667,
  longitude: 16.3,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const QUARTIERE_LABELS: Record<string, string> = {
  nicastro: "Nicastro",
  sambiase: "Sambiase",
  santeufemia: "Sant'Eufemia",
};

export function quartiereLabel(key?: string | null): string {
  if (!key) return "Lamezia Terme";
  return QUARTIERE_LABELS[key] ?? key;
}

const MACROTEMA_COLORS: Record<string, string> = {
  ambiente: "#16a34a",
  scuole: "#d97706",
  strade: "#dc2626",
  sociale: "#db2777",
  cultura: "#7c3aed",
  mobilita: "#0891b2",
  altro: "#2563eb",
};

export function macrotemaColor(key?: string | null): string {
  if (!key) return MACROTEMA_COLORS.altro;
  return MACROTEMA_COLORS[key] ?? MACROTEMA_COLORS.altro;
}

const MACROTEMA_LABELS: Record<string, string> = {
  ambiente: "Ambiente e rifiuti",
  scuole: "Scuole e istruzione",
  strade: "Strade e lavori pubblici",
  sociale: "Sociale e servizi alla persona",
  cultura: "Cultura, sport e turismo",
  mobilita: "Mobilità e trasporti",
  altro: "Altri servizi e forniture",
};

export function macrotemaLabel(key?: string | null): string {
  if (!key) return MACROTEMA_LABELS.altro;
  return MACROTEMA_LABELS[key] ?? key;
}

function apiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

export type ComuneBoundary = GeoJSON.FeatureCollection;
export type QuartieriCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { name?: string; key?: string };
  }[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export function useComuneBoundary() {
  return useQuery({
    queryKey: ["gis", "comune"],
    queryFn: () => fetchJson<ComuneBoundary>("/api/gis/comune"),
    staleTime: 1000 * 60 * 60,
  });
}

export function useQuartieri() {
  return useQuery({
    queryKey: ["gis", "quartieri"],
    queryFn: () => fetchJson<QuartieriCollection>("/api/gis/quartieri"),
    staleTime: 1000 * 60 * 60,
  });
}

export function polygonCoordinates(
  boundary?: ComuneBoundary,
): { latitude: number; longitude: number }[][] {
  if (!boundary) return [];
  const rings: { latitude: number; longitude: number }[][] = [];
  for (const feature of boundary.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates) {
        rings.push(ring.map((c) => ({ latitude: c[1], longitude: c[0] })));
      }
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          rings.push(ring.map((c) => ({ latitude: c[1], longitude: c[0] })));
        }
      }
    }
  }
  return rings;
}
