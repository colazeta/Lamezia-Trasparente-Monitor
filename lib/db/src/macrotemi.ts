// Macrotemi di spesa: gli ambiti in cui il Comune spende (ambiente, scuole,
// strade, sociale, …). Ogni contratto viene classificato in un macrotema, così
// che i totali della sezione "In cosa spende il Comune" siano autorevoli e non
// dipendano da una classificazione lato client.
//
// La logica vive nel package del database (unica fonte di verità) perché viene
// usata sia dall'ingestione ANAC sia dal seeding dei dati di esempio.

export const MACROTEMA_KEYS = [
  "ambiente",
  "scuole",
  "strade",
  "sociale",
  "cultura",
  "mobilita",
  "altro",
] as const;

export type MacrotemaKey = (typeof MACROTEMA_KEYS)[number];

// Chiave di fallback per i contratti che non rientrano in nessun ambito noto.
export const MACROTEMA_FALLBACK: MacrotemaKey = "altro";

export function isMacrotemaKey(value: unknown): value is MacrotemaKey {
  return (
    typeof value === "string" &&
    (MACROTEMA_KEYS as readonly string[]).includes(value)
  );
}

// Regole euristiche, valutate in ordine: la prima che combacia vince. L'ordine
// privilegia gli ambiti più specifici prima di quelli generici.
const MACROTEMA_RULES: { key: MacrotemaKey; match: RegExp }[] = [
  {
    key: "ambiente",
    match:
      /rifiut|ambient|ecolog|verde\b|igiene|raccolta|differenziat|spazzament|depurazione|fogna|idric/i,
  },
  {
    key: "scuole",
    match: /scuol|istruz|educ|asilo|mensa|student|formazione|didatt|nido/i,
  },
  {
    key: "strade",
    match:
      /strad|lavori pubblici|manutenz|asfalt|marciapied|illuminaz|edili|infrastruttur|opere|ponte|riqualificaz|pavimentaz|cantier/i,
  },
  {
    key: "sociale",
    match:
      /social|assistenz|anzian|disabil|famigli|minor|sanit|inclusione|povert|welfare|domiciliar/i,
  },
  {
    key: "cultura",
    match: /cultur|sport|turism|bibliotec|event|spettacol|museo|teatro|festa/i,
  },
  {
    key: "mobilita",
    match: /trasport|mobilit|parcheggi|\bbus\b|sosta|autobus|navetta/i,
  },
];

// Assegna il macrotema di miglior approssimazione a partire dal testo del
// contratto (oggetto/descrizione, ed eventualmente titolo).
export function classifyMacrotema(text: string): MacrotemaKey {
  const haystack = (text ?? "").toLowerCase();
  for (const rule of MACROTEMA_RULES) {
    if (rule.match.test(haystack)) return rule.key;
  }
  return MACROTEMA_FALLBACK;
}
