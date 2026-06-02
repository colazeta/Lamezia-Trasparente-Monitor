import { Link } from "wouter";
import {
  ShieldCheck,
  CalendarClock,
  MessageSquare,
  FileSignature,
  Landmark,
  Scale,
  Gavel,
  FileSearch,
  Telescope,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminPanel = {
  href: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
};

const ADMIN_PANELS: AdminPanel[] = [
  {
    href: "/admin/cronistoria",
    title: "Cronistoria",
    description: "Pubblica e modifica gli aggiornamenti della cronistoria.",
    icon: CalendarClock,
  },
  {
    href: "/admin/domande",
    title: "Domande",
    description: "Gestisci le domande inviate dai cittadini.",
    icon: MessageSquare,
  },
  {
    href: "/admin/appalti",
    title: "Appalti",
    description: "Classifica gli ambiti di spesa degli appalti.",
    icon: FileSignature,
  },
  {
    href: "/admin/atti-fondamentali",
    title: "Atti fondamentali",
    description: "Gestisci gli atti fondamentali dell'amministrazione.",
    icon: Landmark,
  },
  {
    href: "/admin/accesso-civico",
    title: "Accesso Civico",
    description: "Modera le richieste di accesso civico e i loro esiti.",
    icon: FileSearch,
  },
  {
    href: "/admin/legalita",
    title: "Legalità e Trasparenza",
    description: "Aggiorna le aree e i requisiti di legalità.",
    icon: Scale,
  },
  {
    href: "/admin/monitoraggio",
    title: "Monitoraggio Civico",
    description: "Modera i report di monitoraggio inviati dai cittadini.",
    icon: Telescope,
  },
  {
    href: "/admin/pareri",
    title: "Pareri di Vigilanza",
    description: "Gestisci i pareri degli organi di vigilanza.",
    icon: Gavel,
  },
];

export function AdminIndex() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2 text-brand">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Area Redazione
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Pannelli di Redazione
        </h1>
        <p className="text-muted-foreground">
          Accedi agli strumenti editoriali. Ogni pannello richiede il token di
          accesso della redazione.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_PANELS.map((panel) => {
          const Icon = panel.icon;
          return (
            <Link
              key={panel.href}
              href={panel.href}
              data-testid={`link-admin-${panel.href.split("/").pop()}`}
              className="group"
            >
              <Card className="h-full transition-colors hover:border-brand/50">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex items-center justify-between gap-2 font-display text-lg">
                    {panel.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </CardTitle>
                  <CardDescription>{panel.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
