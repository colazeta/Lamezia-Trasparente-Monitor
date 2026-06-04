import {
  Bot,
  BookOpen,
  X,
  FileText,
  TrendingUp,
  Shield,
  AlertTriangle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { useCivicHelper } from "./CivicHelperContext";
import { Button } from "@/components/ui/button";

// Mappa nome icona (dal backend) -> componente Lucide. Le icone non mappate
// usano un'icona di default, così l'editor può scegliere fra un set noto senza
// rischiare di rompere la card.
const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Shield,
  Sparkles,
};

const DEFAULT_ICON: LucideIcon = Sparkles;

// Fallback usato quando l'API /api/helper/guide non è disponibile o non
// restituisce i punti della card. Tenuto allineato a helperContent.ts.
const FALLBACK_HIGHLIGHTS: { icon: string; text: string }[] = [
  {
    icon: "FileText",
    text: "Contratti e appalti pubblici con importi e aggiudicatari (fonte ANAC)",
  },
  {
    icon: "BookOpen",
    text: "Atti fondamentali, delibere e albo pretorio del Comune",
  },
  {
    icon: "TrendingUp",
    text: "Progetti PNRR: avanzamento lavori e risorse assegnate",
  },
  {
    icon: "AlertTriangle",
    text: "Segnalazioni civiche collegate ai dati — la tua voce conta",
  },
  {
    icon: "Shield",
    text: "Legalità e trasparenza: obblighi di pubblicazione e anticorruzione",
  },
];

export function CivicWelcome() {
  const { welcomeOpen, openAssistant, dismissWelcome, guideContents } =
    useCivicHelper();

  const highlights =
    guideContents?.welcomeHighlights && guideContents.welcomeHighlights.length > 0
      ? guideContents.welcomeHighlights
      : FALLBACK_HIGHLIGHTS;

  if (!welcomeOpen) return null;

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-[161] mx-auto max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl sm:inset-x-auto sm:right-4 sm:left-auto sm:w-[420px]">
        <button
          onClick={dismissWelcome}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold leading-tight">
            Benvenuto/a su rendiamoLameziaTrasparente
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Osservatorio civico indipendente sui dati pubblici del Comune di
            Lamezia Terme. Cosa trovi qui:
          </p>
        </div>

        <ul className="mb-5 space-y-2.5">
          {highlights.map(({ icon, text }) => {
            const Icon = ICON_MAP[icon] ?? DEFAULT_ICON;
            return (
              <li key={text} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3 w-3" />
                </span>
                <span className="text-sm leading-snug text-foreground">
                  {text}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={openAssistant}
          >
            <Bot className="h-4 w-4 shrink-0" />
            Chatta con l'assistente
          </Button>
          <Link href="/guida" onClick={dismissWelcome}>
            <Button className="w-full justify-start gap-3">
              <BookOpen className="h-4 w-4 shrink-0" />
              Scopri il progetto
            </Button>
          </Link>
        </div>

        <button
          onClick={dismissWelcome}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Esplora da solo, grazie
        </button>
      </div>
    </>
  );
}
