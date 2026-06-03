import { Map, Bot, BookOpen, X } from "lucide-react";
import { Link } from "wouter";
import { useCivicHelper } from "./CivicHelperContext";
import { Button } from "@/components/ui/button";

export function CivicWelcome() {
  const { welcomeOpen, startTour, openAssistant, dismissWelcome } =
    useCivicHelper();

  if (!welcomeOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[160] backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={dismissWelcome}
      />
      <div className="fixed inset-x-4 bottom-4 z-[161] mx-auto max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl sm:inset-x-auto sm:right-4 sm:left-auto sm:w-[400px]">
        <button
          onClick={dismissWelcome}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold leading-tight">
            Benvenuto/a su rendiamoLameziaTrasparente
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Questo è un osservatorio civico indipendente sui dati pubblici del
            Comune di Lamezia Terme. Vuoi un tour guidato delle sezioni?
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <Button
            className="w-full justify-start gap-3"
            onClick={startTour}
          >
            <Map className="h-4 w-4 shrink-0" />
            Fai il tour guidato
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={openAssistant}
          >
            <Bot className="h-4 w-4 shrink-0" />
            Chatta con l'assistente
          </Button>
          <Link href="/guida" onClick={dismissWelcome}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Scopri il progetto
            </Button>
          </Link>
        </div>

        <button
          onClick={dismissWelcome}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Esplora da solo, grazie
        </button>
      </div>
    </>
  );
}
