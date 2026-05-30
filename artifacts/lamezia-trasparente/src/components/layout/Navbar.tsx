import { Link, useLocation } from "wouter";
import { Menu, X, ShieldAlert, BarChart3, FileText, FileSearch, Megaphone, Home, Gavel, CalendarClock, Landmark, Users, Building2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/temi", label: "Temi", icon: FileSearch },
  { href: "/albo", label: "Albo Pretorio", icon: ShieldAlert },
  { href: "/delibere", label: "Delibere", icon: Gavel },
  { href: "/convocazioni", label: "Convocazioni", icon: CalendarClock },
  { href: "/organi", label: "Organi", icon: Building2 },
  { href: "/amministratori", label: "Amministratori", icon: Users },
  { href: "/pnrr", label: "PNRR", icon: Landmark },
  { href: "/pareri", label: "Pareri di Vigilanza", icon: ShieldCheck },
  { href: "/contratti", label: "Contratti", icon: FileText },
  { href: "/statistiche", label: "Statistiche", icon: BarChart3 },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone },
];

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo
            textClassName="text-base sm:text-lg leading-none"
            subtitle
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-colors hover-elevate",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            );
          })}
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
        <div className="xl:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-sm font-semibold transition-colors p-3 rounded-md border hover-elevate",
                    isActive
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
