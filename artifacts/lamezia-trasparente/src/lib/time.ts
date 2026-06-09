import { format } from "date-fns";
import { it } from "date-fns/locale";

const EMPTY_TIME_FIELD = "—";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseCivilDate(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : new Date(Number.NaN);
}

export function formatPublicTimeField(
  value: string | number | Date | null | undefined,
  pattern = "dd MMM yyyy",
): string {
  if (!value) return EMPTY_TIME_FIELD;

  const date =
    typeof value === "string"
      ? parseCivilDate(value) ?? new Date(value)
      : value instanceof Date
        ? value
        : new Date(value);

  return Number.isNaN(date.getTime())
    ? EMPTY_TIME_FIELD
    : format(date, pattern, { locale: it });
}
