import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-sidebar text-sidebar-foreground">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, hsl(216 92% 58% / 0.22), transparent 45%), radial-gradient(circle at 90% 90%, hsl(14 88% 52% / 0.18), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6 py-20 flex flex-col items-center text-center max-w-2xl">
        <div className="eyebrow rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-brand">
          <ShieldAlert className="h-3.5 w-3.5" />
          Errore 404
        </div>

        <h1 className="font-display text-7xl md:text-9xl font-bold tracking-[-0.03em] text-white mt-7 leading-none">
          <span className="text-gradient-brand">404</span>
        </h1>

        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mt-6">
          Pagina non trovata
        </h2>

        <p className="text-lg text-sidebar-foreground/75 mt-4 max-w-md text-balance">
          La pagina che cerchi non esiste o è stata spostata. Ma la
          trasparenza non si ferma: continua a esplorare la piattaforma.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-9 w-full sm:w-auto">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="brand" size="lg" className="w-full text-base h-12 px-7 font-bold">
              <Home className="mr-1 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
          <Link href="/temi" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base h-12 px-7 font-bold bg-white/5 text-white border-white/25 hover:bg-white/10"
            >
              <Compass className="mr-1 h-4 w-4" />
              Esplora i Temi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
