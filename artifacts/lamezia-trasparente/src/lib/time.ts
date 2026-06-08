import { format } from "date-fns";
import { it } from "date-fns/locale";

const EMPTY_TIME_FIELD = "—";

export function formatPublicTimeField(
  value: string | number | Date | null | undefined,
  pattern = "dd MMM yyyy",
): string {
  if (!value) return EMPTY_TIME_FIELD;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime())
    ? EMPTY_TIME_FIELD
    : format(date, pattern, { locale: it });
}
