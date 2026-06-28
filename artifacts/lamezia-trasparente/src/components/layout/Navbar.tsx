import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  FileText,
  FileSearch,
  Home,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandPalette,
  SearchTrigger,
  useCommandPalette,
} from "@/components/search/CommandPalette";
import {
  NAV_GROUPS,
  getNavItemStateLabel,
  isNavItemUnavailable,
  isSectionActive,
} from "./navSections";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  const isActive = (href: string) => isSectionActive(href, location);

  const sezioniActive = NAV_GROUPS.some((group) =>
    group.items.some((item) => isActive(item.href)),
  );

  const linkClass = (active: boolean) =>
    cn(
      "relative flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-colors hover-elevate",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-3 sm:px-4 md:gap-4 md:px-6">
          <Link href="/" className="min-w-0 shrink">
            <Logo textClassName="text-sm leading-none sm:text-lg" subtitle />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 xl:flex">
            <Link href="/" className={linkClass(location === "/")}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
              {location === "/" && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>

            <Link href="/guida" className={linkClass(isActive("/guida"))}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Guida
              {isActive("/guida") && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>

            {/* Sezioni — grouped mega-menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={linkClass(sezioniActive)}>
                <FileText className="h-4 w-4" aria-hidden="true" />
                Sezioni
                <ChevronDown
                  className="h-3.5 w-3.5 opacity-70"
                  aria-hidden="true"
                />
                {sezioniActive && (
                  <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {NAV_GROUPS.map((group, gi) => (
                  <div key={group.label}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                      {group.label}
                    </DropdownMenuLabel>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      const unavailable = isNavItemUnavailable(item);
                      if (unavailable) {
                        return (
                          <DropdownMenuItem key={item.href} disabled>
                            <span
                              className="flex w-full cursor-not-allowed items-center gap-2 opacity-70 grayscale"
                              aria-disabled="true"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                <span className="truncate">{item.label}</span>
                                {item.state !== "available" ? (
                                  <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {getNavItemStateLabel(item)}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        );
                      }
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex cursor-pointer items-center gap-2",
                              active && "font-semibold text-primary",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                active
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                              <span className="truncate">{item.label}</span>
                              {item.state !== "available" ? (
                                <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {getNavItemStateLabel(item)}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search trigger */}
            <SearchTrigger onClick={() => setPaletteOpen(true)} />
            <ThemeToggle />
            {/* Mobile Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="xl:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="border-t border-border bg-background xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <nav className="container mx-auto space-y-5 px-4 py-4">
              {/* Search shortcut on mobile */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setPaletteOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground"
                aria-label="Cerca"
              >
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                Cerca una sezione…
              </button>

              <div className="grid grid-cols-2 gap-2">
                <MobileLink
                  href="/"
                  label="Home"
                  icon={Home}
                  active={location === "/"}
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/guida"
                  label="Guida"
                  icon={BookOpen}
                  active={isActive("/guida")}
                  onClick={() => setIsOpen(false)}
                />
              </div>

              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <MobileLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={isActive(item.href)}
                        onClick={() => setIsOpen(false)}
                        disabled={isNavItemUnavailable(item)}
                        statusLabel={
                          item.state !== "available"
                            ? getNavItemStateLabel(item)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  statusLabel,
  disabled = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  statusLabel?: string;
  disabled?: boolean;
}) {
  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {statusLabel ? (
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {statusLabel}
          </span>
        ) : null}
      </span>
    </>
  );
  const className = cn(
    "flex items-center gap-3 rounded-md border p-3 text-sm font-semibold transition-colors hover-elevate",
    active
      ? "border-primary/20 bg-primary/10 text-primary"
      : "border-transparent text-muted-foreground",
    disabled && "cursor-not-allowed border-dashed bg-muted/40 opacity-70 grayscale",
  );

  return disabled ? (
    <div className={className} aria-disabled="true">
      {content}
    </div>
  ) : (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  );
}
