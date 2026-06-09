export type ProcurementIdentifierType = "cig" | "cup" | "unknown" | "empty";

export type ProcurementIdentifierReason =
  | "empty-input"
  | "invalid-characters"
  | "formal-cig"
  | "formal-cup"
  | "unsupported-length";

export interface ProcurementIdentifierClassification {
  original: string;
  normalized: string;
  type: ProcurementIdentifierType;
  formallyValid: boolean;
  reason: ProcurementIdentifierReason;
}

const CIG_LENGTH = 10;
const CUP_LENGTH = 15;
const SIMPLE_SEPARATORS_RE = /[\s-]+/g;
const ALPHANUMERIC_RE = /^[A-Z0-9]+$/;

/**
 * Normalizza meccanicamente un candidato CIG rimuovendo solo spazi e trattini
 * semplici e portando il valore in uppercase. Non verifica registri esterni,
 * esistenza del contratto o collegamenti fra record.
 */
export function normalizeCigCandidate(value: string | null | undefined): string {
  return normalizeProcurementIdentifierCandidate(value);
}

/**
 * Normalizza meccanicamente un candidato CUP rimuovendo solo spazi e trattini
 * semplici e portando il valore in uppercase. Non verifica registri esterni,
 * esistenza del progetto o collegamenti fra record.
 */
export function normalizeCupCandidate(value: string | null | undefined): string {
  return normalizeProcurementIdentifierCandidate(value);
}

/**
 * Classificazione solo formale di un token CIG/CUP candidato.
 *
 * La funzione applica esclusivamente controlli minimi di formato: 10 caratteri
 * alfanumerici per CIG, 15 per CUP, dopo rimozione di spazi e trattini
 * semplici. Non fa lookup ANAC/BDNCP o su altri registri, non dichiara
 * l'esistenza sostanziale di contratti/progetti e non produce matching fra
 * record amministrativi.
 */
export function classifyProcurementIdentifier(
  value: string | null | undefined,
): ProcurementIdentifierClassification {
  const original = value ?? "";
  const normalized = normalizeProcurementIdentifierCandidate(value);

  if (original.trim().length === 0 || normalized.length === 0) {
    return buildResult(original, normalized, "empty", false, "empty-input");
  }

  if (!ALPHANUMERIC_RE.test(normalized)) {
    return buildResult(original, normalized, "unknown", false, "invalid-characters");
  }

  if (normalized.length === CIG_LENGTH) {
    return buildResult(original, normalized, "cig", true, "formal-cig");
  }

  if (normalized.length === CUP_LENGTH) {
    return buildResult(original, normalized, "cup", true, "formal-cup");
  }

  return buildResult(original, normalized, "unknown", false, "unsupported-length");
}

function normalizeProcurementIdentifierCandidate(value: string | null | undefined): string {
  return (value ?? "").replace(SIMPLE_SEPARATORS_RE, "").toUpperCase();
}

function buildResult(
  original: string,
  normalized: string,
  type: ProcurementIdentifierType,
  formallyValid: boolean,
  reason: ProcurementIdentifierReason,
): ProcurementIdentifierClassification {
  return {
    original,
    normalized,
    type,
    formallyValid,
    reason,
  };
}
