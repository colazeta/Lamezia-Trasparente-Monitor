// Geocoding automatico degli interventi (Mappa GIS).
//
// In fase di ingestione ANAC proviamo a ricavare una posizione dal testo del
// contratto (oggetto/descrizione): estraiamo vie/luoghi e li geocodifichiamo
// tramite Nominatim/OSM, limitando l'area al Comune di Lamezia Terme. Quando
// non troviamo un riscontro affidabile, marchiamo la posizione come "da
// verificare" (geoVerify) lasciando che la redazione la corregga a mano.
//
// Nota: Nominatim impone un rate limit di ~1 richiesta/secondo e un User-Agent
// identificativo. Rispettiamo entrambi e limitiamo il numero di geocoding per
// run per non sovraccaricare il servizio durante l'ingestione.

import { quartieriGeoJson } from "../data/gis";
import { logger } from "./logger";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "LameziaTrasparente/1.0 (civic monitoring; +https://lameziatrasparente.it)";

// Bounding box del territorio comunale (lon/lat) per vincolare la ricerca.
// Ordine viewbox Nominatim: left,top,right,bottom (lon_min,lat_max,lon_max,lat_min).
const COMUNE_VIEWBOX = "16.2151485,39.0235388,16.3685711,38.8492654";

export type GeoResult = {
  latitude: number;
  longitude: number;
  geoAddress: string;
  geoQuartiere: string | null;
  // True quando la posizione è solo approssimativa (es. centroide di una
  // frazione, senza una via precisa): va comunque verificata dalla redazione.
  approximate: boolean;
};

type QuartiereCentroid = { key: string; name: string; lat: number; lon: number };

const QUARTIERI: QuartiereCentroid[] = quartieriGeoJson.features.map((f) => ({
  key: f.properties.key,
  name: f.properties.name,
  lat: f.geometry.coordinates[1],
  lon: f.geometry.coordinates[0],
}));

// Tipi di odonimo italiani che introducono un nome di via/luogo.
const STREET_PREFIX =
  "via|viale|v\\.le|corso|c\\.so|piazza|p\\.zza|piazzale|largo|vico|vicolo|strada|s\\.da|località|localita|contrada|c\\.da|lungomare|salita|traversa|borgo|rione";

// Estrae i candidati "via/luogo" dal testo: il prefisso odonimo seguito dal
// nome proprio (parole con iniziale maiuscola, numeri civici inclusi).
function extractStreetCandidates(text: string): string[] {
  const out: string[] = [];
  const re = new RegExp(
    `\\b(${STREET_PREFIX})\\s+([A-Za-zÀ-ÿ0-9'’.\\-]+(?:\\s+(?:di|del|della|dei|degli|delle|d['’]|[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'’.\\-]+)){0,3})`,
    "gi",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const prefix = m[1].replace(/\s+/g, " ").trim();
    const name = m[2].replace(/[.,;:]+$/, "").trim();
    if (name.length >= 3) out.push(`${prefix} ${name}`);
  }
  return Array.from(new Set(out));
}

// Riconosce il riferimento a una frazione/quartiere citato esplicitamente nel
// testo (es. "Nicastro", "Sambiase", "Sant'Eufemia", "Marinella").
const FRAZIONE_HINTS: { re: RegExp; key: string }[] = [
  { re: /\bnicastro\b/i, key: "nicastro" },
  { re: /\bsambiase\b/i, key: "sambiase" },
  { re: /\b(sant['’\s]?eufemia|s\.\s?eufemia)\b/i, key: "santeufemia" },
  { re: /\bmarinella\b/i, key: "santeufemia" },
];

function quartiereHintFromText(text: string): string | null {
  for (const h of FRAZIONE_HINTS) if (h.re.test(text)) return h.key;
  return null;
}

function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Assegna il quartiere/circoscrizione storica più vicino a una coordinata.
export function nearestQuartiere(lat: number, lon: number): string | null {
  let best: { key: string; dist: number } | null = null;
  for (const q of QUARTIERI) {
    const d = haversineKm(lat, lon, q.lat, q.lon);
    if (!best || d < best.dist) best = { key: q.key, dist: d };
  }
  return best ? best.key : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type NominatimHit = {
  lat: string;
  lon: string;
  display_name: string;
  importance?: number;
};

async function nominatimSearch(query: string): Promise<NominatimHit | null> {
  const params = new URLSearchParams({
    q: `${query}, Lamezia Terme`,
    format: "json",
    limit: "1",
    countrycodes: "it",
    viewbox: COMUNE_VIEWBOX,
    bounded: "1",
    addressdetails: "0",
  });
  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimHit[];
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    logger.warn({ err, query }, "Nominatim geocoding request failed");
    return null;
  }
}

// Geocodifica il testo di un contratto. Restituisce una posizione quando trova
// un riscontro affidabile, altrimenti null (→ la redazione dovrà verificare).
export async function geocodeContractText(
  title: string,
  description: string,
): Promise<GeoResult | null> {
  const text = `${title} ${description}`;
  const candidates = extractStreetCandidates(text);
  const hintKey = quartiereHintFromText(text);

  for (const candidate of candidates) {
    const hit = await nominatimSearch(candidate);
    await sleep(1100); // rispetta il rate limit di Nominatim (~1 req/s)
    if (hit) {
      const latitude = Number(hit.lat);
      const longitude = Number(hit.lon);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return {
          latitude,
          longitude,
          geoAddress: candidate,
          geoQuartiere: nearestQuartiere(latitude, longitude),
          approximate: false,
        };
      }
    }
  }

  // Nessuna via riconosciuta: se il testo cita una frazione, usiamo il suo
  // centroide come posizione approssimata (resterà "da verificare").
  if (hintKey) {
    const q = QUARTIERI.find((x) => x.key === hintKey);
    if (q) {
      return {
        latitude: q.lat,
        longitude: q.lon,
        geoAddress: q.name,
        geoQuartiere: q.key,
        approximate: true,
      };
    }
  }

  return null;
}
