export const PUBLIC_NUMBER_PLACEHOLDER = "—";

export type PublicNumberValue = number | null | undefined;

export interface PublicNumberFormatOptions {
  /** Locale BCP 47 usato da Intl.NumberFormat. */
  locale?: string;
  /** Segnaposto prudente per valori assenti o non finiti. */
  placeholder?: string;
}

export interface PublicDecimalFormatOptions extends PublicNumberFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const DEFAULT_LOCALE = "it-IT";
const DEFAULT_DECIMAL_MAX_FRACTION_DIGITS = 2;

function isPublicFiniteNumber(value: PublicNumberValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function publicPlaceholder(options: PublicNumberFormatOptions): string {
  return options.placeholder ?? PUBLIC_NUMBER_PLACEHOLDER;
}

function normalizedFractionDigits(
  options: PublicDecimalFormatOptions,
  defaultMaximumFractionDigits: number,
  defaultMinimumFractionDigits?: number,
) {
  const minimumFractionDigits =
    options.minimumFractionDigits ?? defaultMinimumFractionDigits;
  const requestedMaximumFractionDigits =
    options.maximumFractionDigits ?? defaultMaximumFractionDigits;

  return {
    minimumFractionDigits,
    maximumFractionDigits:
      minimumFractionDigits === undefined
        ? requestedMaximumFractionDigits
        : Math.max(requestedMaximumFractionDigits, minimumFractionDigits),
  };
}

/**
 * Formatta un numero pubblico generico preservando `0` come valore reale.
 * Valori assenti o non finiti restituiscono sempre un segnaposto deterministico.
 */
export function formatPublicNumber(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!isPublicFiniteNumber(value)) return publicPlaceholder(options);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    useGrouping: true,
    ...normalizedFractionDigits(options, DEFAULT_DECIMAL_MAX_FRACTION_DIGITS),
  }).format(value);
}

/** Formatta conteggi interi pubblici senza inventare decimali. */
export function formatPublicCount(
  value: PublicNumberValue,
  options: PublicNumberFormatOptions = {},
): string {
  if (!isPublicFiniteNumber(value)) return publicPlaceholder(options);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

/**
 * Formatta percentuali espresse in punti percentuali: `12.5` diventa `12,5%`.
 */
export function formatPublicPercentage(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!isPublicFiniteNumber(value)) return publicPlaceholder(options);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: "percent",
    useGrouping: true,
    ...normalizedFractionDigits(options, DEFAULT_DECIMAL_MAX_FRACTION_DIGITS),
  }).format(value / 100);
}

/** Formatta importi pubblici in euro con locale italiano predefinito. */
export function formatPublicEuro(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!isPublicFiniteNumber(value)) return publicPlaceholder(options);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: "currency",
    currency: "EUR",
    useGrouping: true,
    ...normalizedFractionDigits(options, 2, 2),
  }).format(value);
}
