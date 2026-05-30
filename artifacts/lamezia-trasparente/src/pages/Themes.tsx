import { useListThemes } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Compass, FileSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeCard, ThemeCardSkeleton } from "@/components/theme/ThemeCard";

export function Themes() {
  const { data: themes, isLoading } = useListThemes();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <span className="eyebrow text-brand">Osservatorio civico</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Temi Monitorati
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Le questioni pubbliche sotto osservazione. Ogni tema raccoglie
          documenti, atti e contratti per fare chiarezza su una vicenda della
          città.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <ThemeCardSkeleton key={i} />
            ))}
        </div>
      ) : themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-display font-bold tracking-tight mb-3">
            I temi sono in fase di curatela
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Stiamo selezionando con cura le vicende pubbliche da seguire passo
            dopo passo, collegando atti, delibere e contratti. Presto qui
            troverai approfondimenti dedicati. Nel frattempo puoi consultare
            tutti gli atti pubblicati in tempo reale.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/albo">
              <Button className="gap-2">
                <FileSearch className="h-4 w-4" />
                Esplora l'Albo Pretorio
              </Button>
            </Link>
            <Link href="/delibere">
              <Button variant="outline" className="gap-2">
                Vai alle delibere
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
