import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  ShieldAlert,
  BarChart3,
  FileText,
  FileSearch,
  Megaphone,
  Home,
  Gavel,
  CalendarClock,
  Landmark,
  Users,
  Building2,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  LayoutGrid,
  Database,
  Gauge,
  ScrollText,
  Scale,
  HandCoins,
  ShieldOff,
  Telescope,
  Rss,
  Code2,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iconForTopic } from "@/lib/questionTopics";

const sectionItems = [
  { href: "/temi", label: "Temi", icon: FileSearch },
  { href: "/albo", label: "Albo Pretorio", icon: ShieldAlert },
  { href: "/atti-fondamentali", label: "Atti fondamentali", icon: ScrollText },
  { href: "/bandi", label: "Bandi e finanziamenti", icon: HandCoins },
  { href: "/beni-confiscati", label: "Beni confiscati", icon: ShieldOff },
  { href: "/accesso-civico", label: "Accesso Civico", icon: FileSearch },
  { href: "/monitoraggio", label: "Monitoraggio civico", icon: Telescope },
  { href: "/legalita", label: "Legalità e Trasparenza", icon: Scale },
  { href: "/delibere", label: "Delibere", icon: Gavel },
  { href: "/convocazioni", label: "Convocazioni", icon: CalendarClock },
  { href: "/organi", label: "Organi", icon: Building2 },
  { href: "/amministratori", label: "Amministratori", icon: Users },
  { href: "/pnrr", label: "PNRR", icon: Landmark },
  { href: "/pareri", label: "Pareri di Vigilanza", icon: ShieldCheck },
  { href: "/contratti", label: "Contratti", icon: FileText },
  { href: "/opendata", label: "Opendata", icon: Database },
  { href: "/sviluppatori", label: "API e sviluppatori", icon: Code2 },
  { href: "/feeds", label: "Feed e abbonamenti", icon: Rss },
  { href: "/performance", label: "Performance", icon: Gauge },
  { href: "/statistiche", label: "Statistiche", icon: BarChart3 },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone },
];

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

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  const linkClass = (active: boolean) =>
    cn(
      "relative flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-colors hover-elevate",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
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

          {/* Argomenti: porta agli elenchi di domande per argomento */}
          {topics.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className={linkClass(false)}>
                <LayoutGrid className="h-4 w-4" />
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

          {/* Sezioni: accesso diretto a tutte le pagine esistenti */}
          <DropdownMenu>
            <DropdownMenuTrigger className={linkClass(false)}>
              <FileSearch className="h-4 w-4" />
              Sezioni
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
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

            <div>
              <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Sezioni
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sectionItems.map((item) => (
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
          </nav>
        </div>
      )}
    </header>
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
  icon: typeof Home;
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
