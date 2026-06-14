export function asApiList<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}
