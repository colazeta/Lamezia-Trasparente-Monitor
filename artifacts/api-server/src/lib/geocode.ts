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

// Centro geografico del Comune di Lamezia Terme: usato come ultima risorsa
// (suggerimento a bassissima confidenza) quando dal testo non emerge alcun
// riferimento di luogo, così che la redazione apra comunque la mappa già
// centrata su un punto trascinabile invece che su una mappa vuota.
const COMUNE_CENTER = { lat: 38.965, lon: 16.31 };

export type GeoResult = {
  latitude: number;
  longitude: number;
  geoAddress: string;
  geoQuartiere: string | null;
  // True quando la posizione è solo approssimativa (es. centroide di una
  // frazione, suggerimento da un toponimo/POI o centro comunale, senza una via
  // precisa): va comunque verificata dalla redazione.
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

// Tipi di luogo/POI civici che, pur senza un odonimo (via/piazza), individuano
// un punto preciso sul territorio (es. "Scuola Borrello", "Stadio Guido D'Ippolito",
// "Cimitero di Sambiase"). Geocodifichiamo l'intera espressione come toponimo:
// il riscontro è meno affidabile di una via, quindi resta "da verificare".
const POI_PREFIX =
  "scuola|istituto|plesso|asilo|nido|liceo|palestra|stadio|piscina|parco|villa\\s+comunale|cimitero|mercato|chiesa|santuario|convento|ospedale|poliambulatorio|biblioteca|museo|teatro|auditorium|stazione|porto|aeroporto|caserma|municipio|palazzo|castello|fontana|monumento|impianto\\s+sportivo|campo\\s+sportivo|centro\\s+sportivo|centro\\s+sociale|centro\\s+polifunzionale|centro\\s+anziani|centro\\s+diurno";

// Connettori italiani che legano un nome proprio di luogo (es. "Cimitero DI
// Sambiase", "Scuola DELLA frazione"). Servono a includere la frazione nel
// candidato, rendendo la geocodifica più precisa.
const PLACE_CONNECTOR = "di|del|della|dei|delle|d['’]";

// Estrae i candidati "toponimo/POI" dal testo: il prefisso (case-insensitive)
// seguito, quando presente, dal nome proprio (parole con iniziale maiuscola,
// eventualmente legate da connettori). I POI compositi senza nome restano da
// soli (es. "villa comunale"). Il prefisso è abbinato in modo insensibile alle
// maiuscole, mentre il nome richiede iniziali maiuscole per evitare di
// trascinare parole comuni nel candidato.
export function extractPlaceCandidates(text: string): string[] {
  const out: string[] = [];
  const prefixRe = new RegExp(`\\b(${POI_PREFIX})\\b`, "gi");
  const nameRe = new RegExp(
    `^\\s+((?:(?:${PLACE_CONNECTOR})\\s+)?[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'’.\\-]+(?:\\s+(?:${PLACE_CONNECTOR})?\\s*[A-ZÀ-Ý][A-Za-zÀ-ÿ0-9'’.\\-]+){0,2})`,
  );
  let m: RegExpExecArray | null;
  while ((m = prefixRe.exec(text))) {
    const prefix = m[1].replace(/\s+/g, " ").trim();
    const nameMatch = nameRe.exec(text.slice(prefixRe.lastIndex));
    const name = nameMatch
      ? nameMatch[1].replace(/[.,;:]+$/, "").replace(/\s+/g, " ").trim()
      : "";
    out.push(name ? `${prefix} ${name}` : prefix);
  }
  return Array.from(new Set(out));
}

// Riconosce il riferimento a una frazione/quartiere o contrada citato
// esplicitamente nel testo. Le frazioni puntano alla circoscrizione storica
// (nicastro / sambiase / santeufemia); le contrade meno note ricadono sulla
// frazione di riferimento più plausibile.
const FRAZIONE_HINTS: { re: RegExp; key: string }[] = [
  { re: /\bnicastro\b/i, key: "nicastro" },
  { re: /\bsambiase\b/i, key: "sambiase" },
  { re: /\b(sant['’\s]?eufemia|s\.\s?eufemia)\b/i, key: "santeufemia" },
  { re: /\bmarinella\b/i, key: "santeufemia" },
  { re: /\bbella\b/i, key: "nicastro" },
  { re: /\bcaronte\b/i, key: "nicastro" },
  { re: /\bsavutano\b/i, key: "nicastro" },
  { re: /\bcapizzaglie\b/i, key: "nicastro" },
  { re: /\bzangarona\b/i, key: "sambiase" },
  { re: /\bgabella\b/i, key: "sambiase" },
  { re: /\b(acquafredda|aquafredda)\b/i, key: "sambiase" },
  { re: /\bmagolà\b/i, key: "sambiase" },
  { re: /\bsan\s+pietro\s+(a\s+)?maida\b/i, key: "santeufemia" },
  { re: /\bficarella\b/i, key: "santeufemia" },
];

export function quartiereHintFromText(text: string): string | null {
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

async function geocodeQuery(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const hit = await nominatimSearch(query);
  await sleep(1100); // rispetta il rate limit di Nominatim (~1 req/s)
  if (!hit) return null;
  const latitude = Number(hit.lat);
  const longitude = Number(hit.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

// Geocodifica il testo di un contratto producendo sempre, quando possibile, un
// "miglior tentativo" di posizione da far rivedere alla redazione. La confidenza
// decresce lungo la cascata e, tranne per le vie riconosciute, il risultato
// resta sempre "da verificare" (approximate=true):
//   1. Via/odonimo riconosciuto e geocodificato → confidenza alta (verificato).
//   2. Toponimo/POI civico (scuola, stadio, cimitero…) geocodificato → da verificare.
//   3. Frazione/contrada citata → centroide della circoscrizione → da verificare.
//   4. Nessun segnale: centro del Comune come pre-fill a bassissima confidenza.
// Il parametro `cup` è accettato per arricchire i candidati di indirizzo quando
// in futuro sarà disponibile un dizionario CUP→localizzazione; oggi il codice
// CUP non contiene testo geocodificabile, quindi i candidati derivano da
// titolo e descrizione.
export async function geocodeContractText(
  title: string,
  description: string,
  cup?: string | null,
): Promise<GeoResult | null> {
  const text = `${title} ${description}${cup ? ` ${cup}` : ""}`;
  const hintKey = quartiereHintFromText(text);

  // 1. Vie/odonimi: posizione affidabile (non "da verificare").
  for (const candidate of extractStreetCandidates(text)) {
    const point = await geocodeQuery(candidate);
    if (point) {
      return {
        ...point,
        geoAddress: candidate,
        geoQuartiere: nearestQuartiere(point.latitude, point.longitude),
        approximate: false,
      };
    }
  }

  // 2. Toponimi/POI civici: posizione plausibile ma da verificare.
  for (const candidate of extractPlaceCandidates(text)) {
    const point = await geocodeQuery(candidate);
    if (point) {
      return {
        ...point,
        geoAddress: candidate,
        geoQuartiere: nearestQuartiere(point.latitude, point.longitude),
        approximate: true,
      };
    }
  }

  // 3. Frazione/contrada citata: centroide della circoscrizione storica.
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

  // 4. Nessun riferimento di luogo: centro del Comune come suggerimento a
  // bassissima confidenza, così la redazione apre la mappa già centrata su un
  // punto trascinabile. Resta "da verificare" e senza etichetta indirizzo.
  return {
    latitude: COMUNE_CENTER.lat,
    longitude: COMUNE_CENTER.lon,
    geoAddress: "",
    geoQuartiere: nearestQuartiere(COMUNE_CENTER.lat, COMUNE_CENTER.lon),
    approximate: true,
  };
}
