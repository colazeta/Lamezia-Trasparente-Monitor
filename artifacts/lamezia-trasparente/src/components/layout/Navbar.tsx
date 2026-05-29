import { Link, useLocation } from "wouter";
import { Menu, X, ShieldAlert, BarChart3, FileText, FileSearch, Megaphone, Home, Gavel, CalendarClock, Landmark, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/temi", label: "Temi", icon: FileSearch },
  { href: "/albo", label: "Albo Pretorio", icon: ShieldAlert },
  { href: "/delibere", label: "Delibere", icon: Gavel },
  { href: "/convocazioni", label: "Convocazioni", icon: CalendarClock },
  { href: "/amministratori", label: "Amministratori", icon: Users },
  { href: "/pnrr", label: "PNRR", icon: Landmark },
  { href: "/contratti", label: "Contratti", icon: FileText },
  { href: "/statistiche", label: "Statistiche", icon: BarChart3 },
  { href: "/segnalazioni", label: "Segnalazioni", icon: Megaphone },
];

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold leading-none text-lg text-primary tracking-tight">
              rendiamoLameziaTrasparente
            </span>
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Iniziativa Civica Indipendente
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-b bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-sm font-medium transition-colors p-2 rounded-md",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
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
