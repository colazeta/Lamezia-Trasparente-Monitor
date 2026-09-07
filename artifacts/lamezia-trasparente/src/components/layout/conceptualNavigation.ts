import navigation from "./generatedConceptualNavigation.json";

const groupByRoute: Record<string, string> = navigation;

/** Small generated projection keeps the physical database catalog out of public navigation. */
export function navigationSubgroups<T extends { href: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const route = item.href.replace(/\/+$/, "") || "/";
    const label = groupByRoute[route] ?? "Altri percorsi";
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return [...groups].map(([label, entries]) => ({ label, items: entries }));
}
