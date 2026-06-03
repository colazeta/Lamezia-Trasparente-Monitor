import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  FileText,
  FileSearch,
  Home,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useListQuestions } from "@workspace/api-client-react";
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
import { iconForTopic } from "@/lib/questionTopics";
import {
  CommandPalette,
  SearchTrigger,
  useCommandPalette,
} from "@/components/search/CommandPalette";
import { NAV_GROUPS, isSectionActive } from "./navSections";

function useTopics(): string[] {
  const { data: questions } = useListQuestions();
  const set = new Set<string>();
  for (const q of questions ?? []) set.add(q.topic);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
}

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const topics = useTopics();
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
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="shrink-0">
            <Logo textClassName="text-base sm:text-lg leading-none" subtitle />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 xl:flex">
            <Link href="/" className={linkClass(location === "/")}>
              <Home className="h-4 w-4" />
              Home
              {location === "/" && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>

            <Link href="/domande" className={linkClass(isActive("/domande"))}>
              <HelpCircle className="h-4 w-4" />
              Domande
              {isActive("/domande") && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </Link>

            {/* Argomenti */}
            {topics.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className={linkClass(false)}>
                  <FileSearch className="h-4 w-4" />
                  Argomenti
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {topics.map((topic) => {
                    const Icon = iconForTopic(topic);
                    return (
                      <DropdownMenuItem key={topic} asChild>
                        <Link
                          href={`/domande?topic=${encodeURIComponent(topic)}`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {topic}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sezioni — grouped mega-menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className={linkClass(sezioniActive)}>
                <FileText className="h-4 w-4" />
                Sezioni
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
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
                                active ? "text-primary" : "text-muted-foreground",
                              )}
                            />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2">
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
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="border-t border-border bg-background xl:hidden">
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
                <FileSearch className="h-4 w-4" />
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
                  href="/domande"
                  label="Domande"
                  icon={HelpCircle}
                  active={isActive("/domande")}
                  onClick={() => setIsOpen(false)}
                />
              </div>

              {topics.length > 0 && (
                <div>
                  <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Argomenti
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {topics.map((topic) => (
                      <MobileLink
                        key={topic}
                        href={`/domande?topic=${encodeURIComponent(topic)}`}
                        label={topic}
                        icon={iconForTopic(topic)}
                        active={false}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}

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
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 text-sm font-semibold transition-colors hover-elevate",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-transparent text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}
