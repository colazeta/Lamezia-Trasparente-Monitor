import { useListPnrrProjects } from "@workspace/api-client-react";
import { Landmark, FileText, ChevronDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

export function Pnrr() {
  const { data: projects, isLoading } = useListPnrrProjects();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <Landmark className="mr-2 h-4 w-4" />
          Piano Nazionale di Ripresa e Resilienza
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Progetti PNRR
        </h1>
        <p className="text-muted-foreground text-lg">
          I progetti finanziati dal PNRR sul territorio comunale, identificati
          dal codice CUP, con i relativi atti e documenti pubblicati.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-5 rounded-xl border bg-card shadow-sm">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <StatCard label="Progetti" value={projects.length} />
            <StatCard
              label="Documenti collegati"
              value={projects.reduce((s, p) => s + p.documentsCount, 0)}
            />
            <StatCard
              label="Codici CUP"
              value={projects.filter((p) => p.cup).length}
            />
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {projects.map((project) => (
              <AccordionItem
                key={project.key}
                value={project.key}
                className="rounded-xl border border-border/60 bg-card px-5 shadow-sm data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
                  <div className="flex w-full items-start justify-between gap-4 text-left">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {project.cup && (
                          <Badge className="bg-primary/10 text-primary border-transparent shadow-none font-mono text-xs">
                            CUP {project.cup}
                          </Badge>
                        )}
                        {project.mission && (
                          <Badge
                            variant="outline"
                            className="text-xs shadow-none"
                          >
                            {project.mission}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {project.documentsCount} documenti · ultimo atto{" "}
                        {formatDate(project.lastPublication)}
                      </p>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    {project.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
                      >
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">
                            {doc.oggetto}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{doc.tipologia}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(doc.pubStart)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Nessun progetto PNRR rilevato al momento.
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
