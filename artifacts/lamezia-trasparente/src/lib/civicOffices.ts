export const CIVIC_OFFICE_SOURCE_STATUSES = [
  "ufficiale",
  "estratto",
  "da_verificare",
] as const;

export type CivicOfficeSourceStatus =
  (typeof CIVIC_OFFICE_SOURCE_STATUSES)[number];

export type CivicOfficeKind = "ufficio" | "settore" | "servizio";

export type CivicOfficeRecord = Readonly<{
  id: string;
  label: string;
  kind: CivicOfficeKind;
  aliases: readonly string[];
  description: string;
  sourceStatus: CivicOfficeSourceStatus;
  sourceNote: string;
  avoidsPersonalData: true;
}>;

export type CivicOfficeMatch = Readonly<{
  status: "known";
  office: CivicOfficeRecord;
  matchedAlias: string;
  normalizedInput: string;
}>;

export type CivicOfficeUnknownMatch = Readonly<{
  status: "unknown";
  office: null;
  matchedAlias: null;
  normalizedInput: string;
  fallbackLabel: "Da verificare";
  reason: "empty_input" | "no_strong_match" | "ambiguous_match";
}>;

export type CivicOfficeNormalizationResult =
  | CivicOfficeMatch
  | CivicOfficeUnknownMatch;

const CIVIC_OFFICE_DATASET_NOTE =
  "Tassonomia v0 prudente costruita da etichette aggregate già presenti nei moduli dimostrativi del repository; non è un organigramma ufficiale completo e richiede confronto con fonti comunali aggiornate prima di usi informativi esterni.";

export const CIVIC_OFFICES: readonly CivicOfficeRecord[] = [
  {
    id: "affari-generali-segreteria",
    label: "Affari generali e segreteria",
    kind: "settore",
    aliases: [
      "affari generali",
      "segreteria generale",
      "supporto agli organi",
      "ufficio segreteria",
    ],
    description:
      "Aggrega riferimenti civici a segreteria, atti generali e supporto agli organi, senza attribuire responsabilità individuali.",
    sourceStatus: "estratto",
    sourceNote: CIVIC_OFFICE_DATASET_NOTE,
    avoidsPersonalData: true,
  },
  {
    id: "servizi-finanziari-ragioneria",
    label: "Servizi finanziari e ragioneria",
    kind: "settore",
    aliases: [
      "servizi finanziari",
      "ragioneria",
      "bilancio",
      "programmazione economica",
      "ufficio bilancio",
    ],
    description:
      "Raggruppa testi relativi a bilancio, ragioneria e programmazione economica come indicazione amministrativa aggregata.",
    sourceStatus: "estratto",
    sourceNote: CIVIC_OFFICE_DATASET_NOTE,
    avoidsPersonalData: true,
  },
  {
    id: "lavori-pubblici-manutenzioni",
    label: "Lavori pubblici e manutenzioni",
    kind: "settore",
    aliases: [
      "lavori pubblici",
      "manutenzioni",
      "manutenzione urbana",
      "cantieri",
      "programmazione lavori",
    ],
    description:
      "Raccoglie riferimenti a lavori, manutenzioni e cantieri come area tematica da verificare sui documenti di fonte.",
    sourceStatus: "estratto",
    sourceNote: CIVIC_OFFICE_DATASET_NOTE,
    avoidsPersonalData: true,
  },
  {
    id: "servizi-sociali-welfare",
    label: "Servizi sociali e welfare",
    kind: "settore",
    aliases: [
      "servizi sociali",
      "welfare",
      "servizi alla persona",
      "misure di sostegno",
      "politiche sociali",
    ],
    description:
      "Normalizza riferimenti generali a servizi alla persona e misure di sostegno, mantenendo una lettura non individuale.",
    sourceStatus: "estratto",
    sourceNote: CIVIC_OFFICE_DATASET_NOTE,
    avoidsPersonalData: true,
  },
  {
    id: "urbanistica-edilizia-privata",
    label: "Urbanistica ed edilizia privata",
    kind: "settore",
    aliases: [
      "urbanistica",
      "edilizia privata",
      "sportello edilizia",
      "istruttorie urbanistiche",
      "sue",
    ],
    description:
      "Raggruppa testi su pratiche urbanistiche e sportello edilizia come collegamento tassonomico prudente.",
    sourceStatus: "estratto",
    sourceNote: CIVIC_OFFICE_DATASET_NOTE,
    avoidsPersonalData: true,
  },
  {
    id: "ufficio-competente-da-verificare",
    label: "Ufficio competente da verificare",
    kind: "ufficio",
    aliases: [
      "ufficio competente",
      "responsabile della trasparenza / ufficio competente",
      "settore competente",
      "da verificare",
    ],
    description:
      "Fallback esplicito per bozze o testi che indicano un destinatario da verificare senza identificare con certezza un settore.",
    sourceStatus: "da_verificare",
    sourceNote:
      "Voce tecnica di fallback per preservare testo libero e ridurre associazioni deboli o non documentate.",
    avoidsPersonalData: true,
  },
] as const;

const EXTRA_LATIN_REPLACEMENTS: Readonly<Record<string, string>> = {
  ß: "ss",
  æ: "ae",
  œ: "oe",
  ø: "o",
  đ: "d",
  ł: "l",
  þ: "th",
};

function transliterateToAscii(value: string): string {
  return value
    .replace(/[ßæœøđłþ]/g, (match) => EXTRA_LATIN_REPLACEMENTS[match] ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeCivicOfficeText(value: string): string {
  return transliterateToAscii(value.toLowerCase())
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function aliasHasStrongSignal(alias: string): boolean {
  const normalizedAlias = normalizeCivicOfficeText(alias);
  const tokens = normalizedAlias.split(" ").filter(Boolean);

  return (
    normalizedAlias.length >= 3 && (tokens.length > 1 || tokens[0].length >= 4)
  );
}

function textContainsAlias(
  normalizedText: string,
  normalizedAlias: string,
): boolean {
  return ` ${normalizedText} `.includes(` ${normalizedAlias} `);
}

export function findDuplicateCivicOfficeAliases(
  records: readonly CivicOfficeRecord[] = CIVIC_OFFICES,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    for (const alias of [record.label, ...record.aliases]) {
      const normalizedAlias = normalizeCivicOfficeText(alias);
      if (normalizedAlias.length === 0) continue;
      if (seen.has(normalizedAlias)) {
        duplicates.add(normalizedAlias);
      }
      seen.add(normalizedAlias);
    }
  }

  return [...duplicates].sort();
}

export function normalizeCivicOffice(
  value: string,
  records: readonly CivicOfficeRecord[] = CIVIC_OFFICES,
): CivicOfficeNormalizationResult {
  const normalizedInput = normalizeCivicOfficeText(value);

  if (normalizedInput.length === 0) {
    return {
      status: "unknown",
      office: null,
      matchedAlias: null,
      normalizedInput,
      fallbackLabel: "Da verificare",
      reason: "empty_input",
    };
  }

  const matches: CivicOfficeMatch[] = [];

  for (const office of records) {
    const aliases = [office.label, ...office.aliases].sort(
      (left, right) =>
        normalizeCivicOfficeText(right).length -
        normalizeCivicOfficeText(left).length,
    );
    const matchedAlias = aliases.find((alias) => {
      if (!aliasHasStrongSignal(alias)) return false;
      return textContainsAlias(
        normalizedInput,
        normalizeCivicOfficeText(alias),
      );
    });

    if (matchedAlias) {
      matches.push({
        status: "known",
        office,
        matchedAlias,
        normalizedInput,
      });
    }
  }

  if (matches.length === 1) {
    return matches[0];
  }

  return {
    status: "unknown",
    office: null,
    matchedAlias: null,
    normalizedInput,
    fallbackLabel: "Da verificare",
    reason: matches.length > 1 ? "ambiguous_match" : "no_strong_match",
  };
}
