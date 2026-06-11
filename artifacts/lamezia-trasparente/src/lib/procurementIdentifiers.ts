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

export type ProcurementIdentifierDiagnosticStatus =
  | "formal-only"
  | "invalid-format"
  | "unsupported"
  | "empty";

export interface ProcurementIdentifierDiagnostic {
  label: string;
  summary: string;
  status: ProcurementIdentifierDiagnosticStatus;
  requiresRegistryVerification: boolean;
}

const CIG_LENGTH = 10;
const CUP_LENGTH = 15;
const SIMPLE_SEPARATORS_RE = /[\s-]+/g;
const ALPHANUMERIC_ASCII_RE = /^[A-Za-z0-9]+$/;
const ORDINARY_CIG_RE = /^([0-9]{7})([A-F0-9]{3})$/;
const SMART_CIG_RE = /^[XYZ][A-F0-9]{9}$/;
const UNIFIED_CIG_RE = /^[A-U][A-F0-9]{9}$/;
const CUP_RE = /^[A-Z][0-9]{2}[A-Z][A-Z0-9]{11}$/;

const PROCUREMENT_IDENTIFIER_DIAGNOSTICS = {
  "empty-input": {
    label: "input identificativo assente",
    summary:
      "Nessun token CIG/CUP normalizzabile è disponibile per un controllo formale locale.",
    status: "empty",
    requiresRegistryVerification: false,
  },
  "invalid-characters": {
    label: "caratteri identificativo non ammessi",
    summary:
      "Il token contiene caratteri non ASCII o separatori non supportati dal controllo formale locale.",
    status: "unsupported",
    requiresRegistryVerification: false,
  },
  "formal-cig": {
    label: "formato CIG formalmente coerente",
    summary:
      "Il token rispetta i controlli locali di formato CIG e richiede verifica su fonte ufficiale.",
    status: "formal-only",
    requiresRegistryVerification: true,
  },
  "formal-cup": {
    label: "formato CUP formalmente coerente",
    summary:
      "Il token rispetta i controlli locali di formato CUP e richiede verifica su fonte ufficiale.",
    status: "formal-only",
    requiresRegistryVerification: true,
  },
  "invalid-cig-format": {
    label: "formato CIG non riconosciuto",
    summary:
      "Il token ha lunghezza CIG ma non rispetta i controlli locali di formato previsti.",
    status: "invalid-format",
    requiresRegistryVerification: false,
  },
  "invalid-cup-format": {
    label: "formato CUP non riconosciuto",
    summary:
      "Il token ha lunghezza CUP ma non rispetta i controlli locali di formato previsti.",
    status: "invalid-format",
    requiresRegistryVerification: false,
  },
  "unsupported-length": {
    label: "lunghezza identificativo non supportata",
    summary:
      "Il token normalizzato non ha una lunghezza gestita dai controlli locali CIG/CUP.",
    status: "unsupported",
    requiresRegistryVerification: false,
  },
} as const satisfies Record<
  ProcurementIdentifierReason,
  ProcurementIdentifierDiagnostic
>;

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
 * (7 cifre + 3 caratteri esadecimali di controllo), Smart CIG documentato
 * (X/Y/Z + 9 esadecimali), CIG unificato (A-U + 9 esadecimali) e CUP nella
 * forma lettera + due cifre + lettera + 11 alfanumerici. Non fa lookup
 * ANAC/BDNCP o su altri registri, non dichiara l'esistenza sostanziale di
 * contratti/progetti e non produce matching fra record amministrativi.
 */
export function describeProcurementIdentifierClassification(
  classification: ProcurementIdentifierClassification,
): ProcurementIdentifierDiagnostic {
  return PROCUREMENT_IDENTIFIER_DIAGNOSTICS[classification.reason];
}

export function classifyProcurementIdentifier(
  value: string | null | undefined,
): ProcurementIdentifierClassification {
  const original = value ?? "";
  const stripped = stripSimpleSeparators(original);

  if (original.trim().length === 0 || stripped.length === 0) {
    return buildResult(original, "", "empty", false, "empty-input");
  }

  if (!hasOnlyAsciiCharacters(stripped) || !ALPHANUMERIC_ASCII_RE.test(stripped)) {
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

function hasOnlyAsciiCharacters(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 0x7f);
}

function isFormalCig(value: string): boolean {
  return isFormalOrdinaryCig(value) || SMART_CIG_RE.test(value) || UNIFIED_CIG_RE.test(value);
}

function isFormalOrdinaryCig(value: string): boolean {
  const match = ORDINARY_CIG_RE.exec(value);

  if (!match) {
    return false;
  }

  const numericPart = match[1];
  const checkValue = match[2];

  if (!numericPart || !checkValue || numericPart === "0000000") {
    return false;
  }

  const expectedCheckValue = ((Number(numericPart) * 211) % 4091)
    .toString(16)
    .toUpperCase()
    .padStart(3, "0");

  return checkValue === expectedCheckValue;
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
