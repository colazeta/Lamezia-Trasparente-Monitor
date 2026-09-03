import {
  ALL_NAV_GROUPS,
  NAV_GROUPS,
  isSectionActive,
  type NavItem,
  type NavSection,
} from "./navSections";

function normalizePath(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

function findExactInventoryItem(location: string): NavItem | null {
  const normalizedLocation = normalizePath(location);

  for (const group of ALL_NAV_GROUPS) {
    for (const item of group.items) {
      if (normalizePath(item.href) === normalizedLocation) {
        return item;
      }
    }
  }

  return null;
}

function resolveCanonicalLocation(location: string): string {
  const exactItem = findExactInventoryItem(location);
  if (!exactItem?.canonicalHref) return location;

  const normalizedCanonical = normalizePath(exactItem.canonicalHref);
  if (normalizedCanonical === normalizePath(location)) return location;

  return exactItem.canonicalHref;
}

/**
 * Resolve the user-facing macro-area for any known public route.
 *
 * Search-only pages still activate their conceptual macro-area, while project
 * support pages remain outside the seven primary areas. Legacy aliases are
 * resolved through their canonical destination before the area is selected.
 */
export function findPrimaryNavGroupByPath(
  location: string,
): NavSection | null {
  const resolvedLocation = resolveCanonicalLocation(location);

  for (const primaryGroup of NAV_GROUPS) {
    const inventoryGroup = ALL_NAV_GROUPS.find(
      (group) => group.label === primaryGroup.label,
    );

    if (
      inventoryGroup?.items.some((item) =>
        isSectionActive(item.href, resolvedLocation),
      )
    ) {
      return primaryGroup;
    }
  }

  return null;
}
