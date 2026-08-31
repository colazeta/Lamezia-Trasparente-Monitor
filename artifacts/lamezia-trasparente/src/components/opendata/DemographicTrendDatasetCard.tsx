import { ExternalLink, FileJson, Info, Users } from "lucide-react";
import { PopulationHistoryPanel } from "@/components/demographics/PopulationHistoryPanel";
import { PopulationStructurePanel } from "@/components/demographics/PopulationStructurePanel";
import { PopulationCitizenshipPanel } from "@/components/demographics/PopulationCitizenshipPanel";
import { ChangeDriversPanel } from "@/components/demographics/ChangeDriversPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const POPULATION_API = "/api/demographics/series/population-resident-jan1";
const STRUCTURE_API = "/api/demographics/structure";
const CITIZENSHIP_API = "/api/demographics/citizenship";
const CHANGE_DRIVERS_API = "/api/demographics/change-drivers?granularity=annual";
const ISTAT_DEMO_URL = "https://demo.istat.it/";

export function DemographicTrendDatasetCard() {
  return (
    <section
      aria-labelledby="trend-demografico-title"
      className="space-y-8"
      id="trend-demografico-lamezia"
    >
      <header className="rounded-xl border border-card-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow text-primary">
              <Users className="h-3.5 w-3.5" />
              Popolazione e società
            </span>
            <h2
              className="mt-2 text-2xl font-display font-bold text-foreground"
              id="trend-demografico-title"
            >
              Osservatorio demografico · Lamezia Terme
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Questa vista usa direttamente l'archivio demografico versionato di
              LameziaTrasparente. Popolazione, struttura per età e sesso,
              cittadinanza, release della fonte e bilancio demografico sono quindi
              gli stessi dati utilizzati nelle altre sezioni del sito: non esiste
              più una copia statica separata per Open Data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={POPULATION_API} target="_blank" rel="noreferrer">
                <FileJson className="h-4 w-4" />
                API popolazione
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={STRUCTURE_API} target="_blank" rel="noreferrer">
                <FileJson className="h-4 w-4" />
                API struttura
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={CITIZENSHIP_API} target="_blank" rel="noreferrer">
                <FileJson className="h-4 w-4" />
                API cittadinanza
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={CHANGE_DRIVERS_API} target="_blank" rel="noreferrer">
                <FileJson className="h-4 w-4" />
                API bilancio
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="shadow-none">
            Fonte canonica: ISTAT
          </Badge>
          <Badge variant="outline" className="shadow-none">
            Release versionate
          </Badge>
          <Badge variant="outline" className="shadow-none">
            Dati aggregati comunali
          </Badge>
          <a
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            href={ISTAT_DEMO_URL}
            target="_blank"
            rel="noreferrer"
          >
            Fonte ISTAT
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <PopulationHistoryPanel />
      <PopulationStructurePanel />
      <PopulationCitizenshipPanel />
      <ChangeDriversPanel />

      <Card className="border-dashed">
        <CardContent className="flex gap-3 p-5 text-sm leading-6 text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            La precedente serie generata dal CSV del Portale OpenData comunale e
            la precedente distribuzione statica degli stranieri per età e sesso
            restano fonti di confronto e provenienza documentale, ma non
            alimentano più l'Osservatorio. Per la lettura corrente vengono usate
            le serie ISTAT versionate; le ricostruzioni storiche 2002–2018 restano
            qualificate esplicitamente come ricostruite e mantengono una cesura
            metodologica visibile rispetto al 2019+.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
