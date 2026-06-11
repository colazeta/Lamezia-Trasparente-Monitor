export function dedupeStable<T>(items: readonly T[]): T[];
export function dedupeStable<T, K>(
  items: readonly T[],
  selector: (item: T) => K,
): T[];

export function dedupeStable<T, K>(
  items: readonly T[],
  selector?: (item: T) => K,
): T[] {
  const seen = new Set<T | K>();
  const deduped: T[] = [];

  for (const item of items) {
    const key = selector ? selector(item) : item;

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}
