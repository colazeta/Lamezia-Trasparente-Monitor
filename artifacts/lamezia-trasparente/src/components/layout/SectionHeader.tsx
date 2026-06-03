import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { findSectionByPath } from "./navSections";

/**
 * Slim breadcrumb + section header rendered on list pages so visitors always
 * know where they are after jumping via the command palette or quick-access
 * grid. Title, icon and description are sourced from the shared NAV_GROUPS
 * definition. Renders nothing on pages that are not top-level sections.
 */
export function SectionHeader() {
  const [location] = useLocation();
  const active = findSectionByPath(location);

  if (!active) return null;

  const { group, item } = active;
  const Icon = item.icon;

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <nav
          aria-label="Percorso di navigazione"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          <span>{group.label}</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          <span
            aria-current="page"
            className="flex items-center gap-1.5 font-semibold text-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            {item.label}
          </span>
        </nav>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );
}
