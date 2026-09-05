import {
  ALL_NAV_GROUPS,
  isSectionActive,
  type NavItem,
  type NavSection,
} from "./navSections";
import {
  findPrimaryNavGroupBySourceLabel,
  PARTICIPATION_ACTIONS,
} from "./primaryNavigation";

function normalizePath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

function matchingInventoryEntries(location: string): Array<{
  group: NavSection;
  item: NavItem;
}> {
  const normalizedLocation = normalizePath(location);
  const matches: Array<{ group: NavSection; item: NavItem }> = [];

  for (const group of ALL_NAV_GROUPS) {
    for (const item of group.items) {
      if (isSectionActive(item.href, normalizedLocation)) {
        matches.push({ group, item });
      }
    }
  }

  return matches.sort(
    (left, right) =>
      normalizePath(right.item.href).length -
      normalizePath(left.item.href).length,
  );
}

function bestInventoryEntry(location: string): {
  group: NavSection;
  item: NavItem;
} | null {
  return matchingInventoryEntries(location)[0] ?? null;
}

function resolveCanonicalLocation(location: string): string {
  let resolved = normalizePath(location);
  const visited = new Set<string>();

  for (let depth = 0; depth < 5; depth += 1) {
    if (visited.has(resolved)) break;
    visited.add(resolved);

    const match = bestInventoryEntry(resolved);
    if (!match?.item.canonicalHref) break;

    const matchedHref = normalizePath(match.item.href);
    const canonicalHref = normalizePath(match.item.canonicalHref);
    const suffix = resolved.slice(matchedHref.length);
    const next = normalizePath(`${canonicalHref}${suffix}`);

    if (next === resolved) break;
    resolved = next;
  }

  return resolved;
}

function sourceGroupByPath(location: string): NavSection | null {
  const resolvedLocation = resolveCanonicalLocation(location);
  return bestInventoryEntry(resolvedLocation)?.group ?? null;
}

function mostSpecificItem(
  items: NavItem[],
  location: string,
): NavItem | null {
  const resolvedLocation = resolveCanonicalLocation(location);
  const candidates = items.filter((item) =>
    isSectionActive(item.href, resolvedLocation),
  );

  return (
    [...candidates].sort(
      (left, right) =>
        normalizePath(right.href).length - normalizePath(left.href).length,
    )[0] ?? null
  );
}

/** Resolve any known public route to its current five-domain primary group. */
export function findPrimaryNavGroupByPath(
  location: string,
): NavSection | null {
  const sourceGroup = sourceGroupByPath(location);
  if (!sourceGroup || sourceGroup.label === "Partecipa") return null;

  return findPrimaryNavGroupBySourceLabel(sourceGroup.label);
}

/**
 * Resolve the single visible primary destination that best represents the
 * route. Search-only routes can activate a domain without inventing an active
 * child item.
 */
export function findPrimaryNavItemByPath(location: string): NavItem | null {
  const group = findPrimaryNavGroupByPath(location);
  return group ? mostSpecificItem(group.items, location) : null;
}

/** Return true for visible, search-only and canonicalized participation routes. */
export function isParticipationPath(location: string): boolean {
  return sourceGroupByPath(location)?.label === "Partecipa";
}

/** Resolve a visible participation action when the route maps to one. */
export function findParticipationNavItemByPath(
  location: string,
): NavItem | null {
  if (!isParticipationPath(location)) return null;
  return mostSpecificItem(PARTICIPATION_ACTIONS, location);
}
