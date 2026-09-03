import { Link, useLocation } from "wouter";
import { ChevronDown, FileSearch, Home, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandPalette,
  SearchTrigger,
  useCommandPalette,
} from "@/components/search/CommandPalette";
import { NAV_GROUPS, type NavSection } from "./navSections";
import {
  findPrimaryNavGroupByPath,
  findPrimaryNavItemByPath,
} from "./navState";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();
  const activeNavGroup = findPrimaryNavGroupByPath(location);
  const activeNavItem = findPrimaryNavItemByPath(location);
  const activeNavGroupLabel = activeNavGroup?.label ?? null;
  const activeNavItemHref = activeNavItem?.href ?? null;

  useEffect(() => {
    setIsOpen(false);
    setOpenMobileGroup(activeNavGroupLabel);
  }, [location, activeNavGroupLabel]);

  const isActive = (href: string) => href === activeNavItemHref;
  const isGroupActive = (group: NavSection) =>
    group.label === activeNavGroupLabel;

  const groupTriggerClass = (active: boolean) =>
    cn(
      "relative flex items-center gap-1 rounded-md px-2 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    );

  const toggleMobileMenu = () => {
    if (!isOpen) {
      setOpenMobileGroup(activeNavGroupLabel);
    }
    setIsOpen((open) => !open);
  };

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/92 shadow-[var(--shadow-nav)] backdrop-blur supports-[backdrop-filter]:bg-background/78">
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-3 sm:px-4 md:gap-3 md:px-6">
          <Link
            href="/"
            aria-label="Lamezia Trasparente — home"
            className="min-w-0 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Logo textClassName="text-sm leading-none sm:text-lg" subtitle />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex"
            aria-label="Navigazione principale"
          >
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group);
              return (
                <DropdownMenu key={group.label} modal={false}>
                  <DropdownMenuTrigger className={groupTriggerClass(active)}>
                    {group.label}
                    <ChevronDown
                      className="h-3.5 w-3.5 opacity-70"
                      aria-hidden="true"
                    />
                    {active ? (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                    ) : null}
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="w-[21rem] p-1.5"
                    sideOffset={8}
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-bold text-foreground">
                        {group.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                    <DropdownMenuSeparator />

                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const itemActive = isActive(item.href);
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            aria-current={itemActive ? "page" : undefined}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2",
                              itemActive && "bg-primary/10 text-primary",
                            )}
                          >
                            <Icon
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0",
                                itemActive
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                              aria-hidden="true"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold leading-5">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SearchTrigger onClick={() => setPaletteOpen(true)} />
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="xl:hidden"
              onClick={toggleMobileMenu}
              aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {isOpen ? (
          <div
            id="mobile-navigation"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background/98 shadow-[var(--shadow-nav)] xl:hidden"
          >
            <nav
              className="container mx-auto space-y-3 px-4 py-4"
              aria-label="Navigazione mobile"
            >
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setPaletteOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-muted/45"
                aria-label="Cerca nel sito"
              >
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                Cerca persone, dati o sezioni…
              </button>

              <Link
                href="/"
                aria-current={location === "/" ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-semibold transition-colors",
                  location === "/"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-card-border bg-card/80 text-foreground hover:bg-muted/45",
                )}
              >
                <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
                Home
              </Link>

              <div className="space-y-2 pt-1">
                {NAV_GROUPS.map((group, index) => {
                  const active = isGroupActive(group);
                  const expanded = openMobileGroup === group.label;
                  const triggerId = `mobile-nav-trigger-${index}`;
                  const panelId = `mobile-nav-panel-${index}`;

                  return (
                    <div
                      key={group.label}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-card/70",
                        active ? "border-primary/30" : "border-card-border",
                      )}
                    >
                      <button
                        id={triggerId}
                        type="button"
                        onClick={() =>
                          setOpenMobileGroup((current) =>
                            current === group.label ? null : group.label,
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/40",
                          active && "text-primary",
                        )}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-bold">
                            {group.label}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-xs font-normal text-muted-foreground">
                            {group.description}
                          </span>
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            expanded && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        hidden={!expanded}
                        className="border-t border-border/70 px-2 py-2"
                      >
                        {group.items.map((item) => (
                          <MobileSectionLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            description={item.description}
                            icon={item.icon}
                            active={isActive(item.href)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}

function MobileSectionLink({
  href,
  label,
  description,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/50",
        active ? "bg-primary/10 text-primary" : "text-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}
