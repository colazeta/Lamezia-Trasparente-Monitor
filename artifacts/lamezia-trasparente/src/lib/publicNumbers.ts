export const PUBLIC_NUMBER_PLACEHOLDER = "—";

export type PublicNumberValue = number | null | undefined;

export interface PublicNumberFormatOptions {
  locale?: string;
  placeholder?: string;
}

export interface PublicDecimalFormatOptions extends PublicNumberFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const DEFAULT_LOCALE = "it-IT";

function hasFinitePublicValue(value: PublicNumberValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function missingPublicNumber(options: PublicNumberFormatOptions = {}): string {
  return options.placeholder ?? PUBLIC_NUMBER_PLACEHOLDER;
}

function numberFormatter(
  options: PublicDecimalFormatOptions = {},
): Intl.NumberFormat {
  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
    useGrouping: true,
  });
}

/**
 * Formats a public numeric value while preserving `0` as a real value.
 * Absent (`null`/`undefined`) and non-finite values return a deterministic placeholder.
 */
export function formatPublicNumber(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!hasFinitePublicValue(value)) {
    return missingPublicNumber(options);
  }

  return numberFormatter(options).format(value);
}

/** Formats a public count with no decimal digits. */
export function formatPublicCount(
  value: PublicNumberValue,
  options: PublicNumberFormatOptions = {},
): string {
  return formatPublicNumber(value, {
    ...options,
    maximumFractionDigits: 0,
  });
}

/** Formats a percentage value expressed in percentage points, e.g. `12.5` -> `12,5%`. */
export function formatPublicPercentage(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!hasFinitePublicValue(value)) {
    return missingPublicNumber(options);
  }

  const maximumFractionDigits =
    options.maximumFractionDigits ?? Math.max(options.minimumFractionDigits ?? 0, 1);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits,
    style: "percent",
    useGrouping: true,
  }).format(value / 100);
}

/** Formats a public euro amount with the default Italian locale. */
export function formatPublicEuro(
  value: PublicNumberValue,
  options: PublicDecimalFormatOptions = {},
): string {
  if (!hasFinitePublicValue(value)) {
    return missingPublicNumber(options);
  }

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    currency: "EUR",
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    style: "currency",
    useGrouping: true,
  }).format(value);
}
