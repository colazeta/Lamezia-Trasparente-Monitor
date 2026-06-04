import type {
  AccessoCivicoStato,
  AccessoCivicoTipo,
} from "@workspace/api-client-react";

// Una riga normalizzata pronta per l'import nel registro accessi.
export interface ParsedImportRow {
  oggetto: string;
  tipo?: AccessoCivicoTipo;
  ente?: string | null;
  requestDate?: string | null;
  stato?: AccessoCivicoStato;
  esitoNote?: string | null;
  responseDate?: string | null;
  responseUrl?: string | null;
  fonteUrl?: string | null;
  // Numero di riga nel file sorgente (1-based, intestazione inclusa come riga 1).
  // Serve a ricondurre gli scarti lato server alla riga reale del file, dato
  // che le righe inviate sono già filtrate dalle invalidRows dell'anteprima.
  sourceRiga?: number;
}

// Una riga del file che non può essere importata, con la riga sorgente
// (1-based, intestazione esclusa) e il motivo dello scarto.
export interface InvalidImportRow {
  riga: number;
  oggetto: string;
  motivi: string[];
}

export interface ImportParseResult {
  rows: ParsedImportRow[];
  headers: string[];
  // Intestazioni del file che non sono state riconosciute (ignorate).
  unmappedHeaders: string[];
  // Errori bloccanti (es. colonna "oggetto" assente).
  errors: string[];
  // Righe scartate in fase di anteprima, con motivo (non vengono importate).
  invalidRows: InvalidImportRow[];
}

type FieldKey =
  | "oggetto"
  | "tipo"
  | "ente"
  | "requestDate"
  | "stato"
  | "esitoNote"
  | "responseDate"
  | "responseUrl"
  | "fonteUrl";

// Normalizza un'intestazione: minuscolo, senza accenti, spazi e punteggiatura.
function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Alias accettati per ogni colonna (già normalizzati).
const HEADER_ALIASES: Record<FieldKey, string[]> = {
  oggetto: ["oggetto", "object", "subject", "oggettorichiesta", "richiesta"],
  tipo: ["tipo", "type", "tipoaccesso", "tipologia", "tipodiaccesso"],
  ente: [
    "ente",
    "destinatario",
    "recipient",
    "amministrazione",
    "entedestinatario",
    "ufficio",
  ],
  requestDate: [
    "datapresentazione",
    "datarichiesta",
    "datainvio",
    "requestdate",
    "data",
    "datapresentazionerichiesta",
    "dataistanza",
  ],
  stato: ["stato", "esito", "outcome", "statorichiesta", "esitorichiesta"],
  esitoNote: [
    "noteesito",
    "esitonote",
    "motivazione",
    "note",
    "dettagli",
    "esitorisposta",
    "notes",
    "noterisposta",
  ],
  responseDate: [
    "datadecisione",
    "datarisposta",
    "responsedate",
    "datariscontro",
    "datachiusura",
  ],
  responseUrl: [
    "linkrisposta",
    "responseurl",
    "documento",
    "urlrisposta",
    "allegato",
    "documentorisposta",
    "linkdocumento",
  ],
  fonteUrl: [
    "fonte",
    "fonteurl",
    "linkfonte",
    "urlfonte",
    "fonteufficiale",
    "source",
  ],
};

const TIPO_VALUES: Array<{ match: string[]; value: AccessoCivicoTipo }> = [
  { match: ["generalizzato", "foia", "generalizzata"], value: "generalizzato" },
  { match: ["semplice"], value: "semplice" },
  { match: ["documentale", "241", "documenti", "242"], value: "documentale" },
];

const STATO_VALUES: Array<{ match: string[]; value: AccessoCivicoStato }> = [
  {
    match: [
      "accolta",
      "accolto",
      "accoglimento",
      "positivo",
      "positiva",
      "concesso",
      "concessa",
      "evasa",
      "evaso",
    ],
    value: "accolta",
  },
  {
    match: [
      "rifiutata",
      "rifiutato",
      "respinta",
      "respinto",
      "diniego",
      "negato",
      "negata",
      "negativo",
      "negativa",
      "rigettata",
      "rigettato",
    ],
    value: "rifiutata",
  },
  {
    match: ["inattesa", "incorso", "pendente", "pending", "aperta", "aperto"],
    value: "in-attesa",
  },
];

// Rileva il delimitatore più probabile guardando la prima riga.
function detectDelimiter(firstLine: string): string {
  const candidates = [";", "\t", ","];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

// Parser CSV/TSV che gestisce campi tra virgolette con delimitatori e a capo.
export function parseDelimited(text: string, delimiter?: string): string[][] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLineEnd = clean.indexOf("\n");
  const firstLine = firstLineEnd === -1 ? clean : clean.slice(0, firstLineEnd);
  const delim = delimiter ?? detectDelimiter(firstLine);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  // Ultimo campo/riga.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Scarta righe completamente vuote.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Valida i componenti di una data e restituisce yyyy-mm-dd solo se la data
// esiste realmente nel calendario (rifiuta 31/02, 29/02 negli anni non
// bisestili, mese/giorno fuori intervallo, ecc.). Restituisce null altrimenti.
function buildIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  // Round-trip: costruiamo la data in UTC e verifichiamo che i componenti
  // corrispondano, intercettando la normalizzazione automatica di JS Date
  // (es. 31/02 -> 2 marzo).
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// Converte una data in formato ISO (yyyy-mm-dd). Supporta dd/mm/yyyy,
// dd-mm-yyyy, yyyy-mm-dd. Restituisce null se non interpretabile o se la data
// non esiste nel calendario (nessun import silenzioso di date errate).
export function normalizeDate(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  // yyyy-mm-dd (eventualmente con orario).
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return buildIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  // dd/mm/yyyy o dd-mm-yyyy o dd.mm.yyyy
  const dmy = v.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (dmy[3].length === 2) year = 2000 + year;
    return buildIsoDate(year, Number(dmy[2]), Number(dmy[1]));
  }
  return null;
}

function matchEnum<T>(
  raw: string,
  table: Array<{ match: string[]; value: T }>,
): T | undefined {
  const n = normalizeHeader(raw);
  if (!n) return undefined;
  for (const entry of table) {
    if (entry.match.some((m) => n === m || n.includes(m))) {
      return entry.value;
    }
  }
  return undefined;
}

// Mappa le intestazioni del file alle chiavi note.
function mapHeaders(headers: string[]): {
  mapping: Map<number, FieldKey>;
  unmapped: string[];
} {
  const mapping = new Map<number, FieldKey>();
  const unmapped: string[] = [];
  const used = new Set<FieldKey>();
  headers.forEach((h, idx) => {
    const norm = normalizeHeader(h);
    let matched: FieldKey | null = null;
    for (const key of Object.keys(HEADER_ALIASES) as FieldKey[]) {
      if (used.has(key)) continue;
      if (HEADER_ALIASES[key].includes(norm)) {
        matched = key;
        break;
      }
    }
    if (matched) {
      mapping.set(idx, matched);
      used.add(matched);
    } else if (h.trim()) {
      unmapped.push(h.trim());
    }
  });
  return { mapping, unmapped };
}

// Interpreta il testo di un file CSV/Excel-esportato e restituisce righe
// normalizzate pronte per l'import. La prima riga è trattata come intestazione.
export function parseAccessoCivicoImport(
  text: string,
  delimiter?: string,
): ImportParseResult {
  const matrix = parseDelimited(text, delimiter);
  if (matrix.length === 0) {
    return {
      rows: [],
      headers: [],
      unmappedHeaders: [],
      errors: ["Il file è vuoto."],
      invalidRows: [],
    };
  }

  const headers = matrix[0].map((h) => h.trim());
  const { mapping, unmapped } = mapHeaders(headers);

  const hasOggetto = Array.from(mapping.values()).includes("oggetto");
  const errors: string[] = [];
  if (!hasOggetto) {
    errors.push(
      "Colonna 'oggetto' non trovata: aggiungi un'intestazione 'Oggetto'.",
    );
    return {
      rows: [],
      headers,
      unmappedHeaders: unmapped,
      errors,
      invalidRows: [],
    };
  }

  const rows: ParsedImportRow[] = [];
  const invalidRows: InvalidImportRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r];
    const record: Partial<Record<FieldKey, string>> = {};
    mapping.forEach((key, idx) => {
      record[key] = (cells[idx] ?? "").trim();
    });

    const oggetto = (record.oggetto ?? "").trim();
    const motivi: string[] = [];
    // Numero di riga sorgente per l'utente (1-based, intestazione esclusa).
    const riga = r;

    if (!oggetto) {
      motivi.push("Oggetto mancante");
    }
    // Date non interpretabili: segnalate invece di essere silenziosamente vuote.
    if (record.requestDate && normalizeDate(record.requestDate) === null) {
      motivi.push(`Data presentazione non valida: "${record.requestDate}"`);
    }
    if (record.responseDate && normalizeDate(record.responseDate) === null) {
      motivi.push(`Data risposta non valida: "${record.responseDate}"`);
    }

    if (motivi.length > 0) {
      invalidRows.push({ riga, oggetto, motivi });
      continue;
    }

    // riga = r (indice nella matrice, intestazione = 0). La riga sorgente
    // mostrata all'utente è r + 1 (intestazione = riga 1).
    const parsed: ParsedImportRow = { oggetto, sourceRiga: riga + 1 };
    if (record.tipo) parsed.tipo = matchEnum(record.tipo, TIPO_VALUES);
    if (record.ente) parsed.ente = record.ente;
    if (record.requestDate) parsed.requestDate = normalizeDate(record.requestDate);
    if (record.stato) parsed.stato = matchEnum(record.stato, STATO_VALUES);
    if (record.esitoNote) parsed.esitoNote = record.esitoNote;
    if (record.responseDate)
      parsed.responseDate = normalizeDate(record.responseDate);
    if (record.responseUrl) parsed.responseUrl = record.responseUrl;
    if (record.fonteUrl) parsed.fonteUrl = record.fonteUrl;
    rows.push(parsed);
  }

  return { rows, headers, unmappedHeaders: unmapped, errors, invalidRows };
}
