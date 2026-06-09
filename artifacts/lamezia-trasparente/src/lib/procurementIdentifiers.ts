export type ProcurementIdentifierType = "cig" | "cup" | "unknown" | "empty";

export type ProcurementIdentifierReason =
  | "empty-input"
  | "invalid-characters"
  | "formal-cig"
  | "formal-cup"
  | "invalid-cig-format"
  | "invalid-cup-format"
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
const ASCII_RE = /^[\x00-\x7F]*$/;
const ALPHANUMERIC_ASCII_RE = /^[A-Za-z0-9]+$/;
const ORDINARY_CIG_RE = /^[0-9]{7}[A-F0-9]{3}$/;
const SMART_CIG_RE = /^[V-Z][A-F0-9]{9}$/;
const UNIFIED_CIG_RE = /^[A-U][A-F0-9]{9}$/;
const CUP_RE = /^[A-Z][0-9]{2}[A-Z][A-Z0-9]{11}$/;

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
 * La funzione applica esclusivamente controlli locali di formato: CIG ordinario
 * (7 cifre + 3 caratteri esadecimali), Smart CIG (V-Z + 9 esadecimali), CIG
 * unificato (A-U + 9 esadecimali) e CUP nella forma lettera + due cifre +
 * lettera + 11 alfanumerici. Non fa lookup ANAC/BDNCP o su altri registri,
 * non dichiara l'esistenza sostanziale di contratti/progetti e non produce
 * matching fra record amministrativi.
 */
export function classifyProcurementIdentifier(
  value: string | null | undefined,
): ProcurementIdentifierClassification {
  const original = value ?? "";
  const stripped = stripSimpleSeparators(original);

  if (original.trim().length === 0 || stripped.length === 0) {
    return buildResult(original, "", "empty", false, "empty-input");
  }

  if (!ASCII_RE.test(stripped) || !ALPHANUMERIC_ASCII_RE.test(stripped)) {
    return buildResult(original, stripped, "unknown", false, "invalid-characters");
  }

  const normalized = stripped.toUpperCase();

  if (normalized.length === CIG_LENGTH) {
    if (isFormalCig(normalized)) {
      return buildResult(original, normalized, "cig", true, "formal-cig");
    }

    return buildResult(original, normalized, "cig", false, "invalid-cig-format");
  }

  if (normalized.length === CUP_LENGTH) {
    if (CUP_RE.test(normalized)) {
      return buildResult(original, normalized, "cup", true, "formal-cup");
    }

    return buildResult(original, normalized, "cup", false, "invalid-cup-format");
  }

  return buildResult(original, normalized, "unknown", false, "unsupported-length");
}

function normalizeProcurementIdentifierCandidate(value: string | null | undefined): string {
  return stripSimpleSeparators(value ?? "").toUpperCase();
}

function stripSimpleSeparators(value: string): string {
  return value.replace(SIMPLE_SEPARATORS_RE, "");
}

function isFormalCig(value: string): boolean {
  return ORDINARY_CIG_RE.test(value) || SMART_CIG_RE.test(value) || UNIFIED_CIG_RE.test(value);
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
