import { useMemo } from "react";
import { useListPnrrProjects } from "@workspace/api-client-react";
import {
  Landmark,
  FileText,
  ChevronDown,
  Calendar,
  Hash,
  Layers,
  FolderKanban,
  Clock,
} from "lucide-react";
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
import { AlboLink } from "@/components/AlboLink";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

export function Pnrr() {
  const { data: projects, isLoading } = useListPnrrProjects();

  const census = useMemo(() => {
    if (!projects)
      return {
        projectsCount: 0,
        documentsCount: 0,
        cupCount: 0,
        missionCount: 0,
        missions: [] as { mission: string; count: number }[],
        latestDocs: [] as {
          id: number;
          oggetto: string;
          tipologia: string;
          pubStart: string | null;
          firstSeenAt: string;
          cup: string | null;
          mission: string | null;
        }[],
      };

    const cups = new Set<string>();
    const missionMap = new Map<string, number>();

    for (const p of projects) {
      for (const c of p.documents.flatMap((d) => d.cups)) cups.add(c);
      if (p.mission) {
        missionMap.set(p.mission, (missionMap.get(p.mission) ?? 0) + 1);
      }
    }

    const latestDocs = projects
      .flatMap((p) =>
        p.documents.map((d) => ({
          id: d.id,
          oggetto: d.oggetto,
          tipologia: d.tipologia,
          pubStart: d.pubStart,
          firstSeenAt: d.firstSeenAt,
          cup: d.cups.length ? d.cups[0] : p.cup,
          mission: d.pnrrMission ?? p.mission,
        })),
      )
      .sort((a, b) => {
        const fs = b.firstSeenAt.localeCompare(a.firstSeenAt);
        if (fs !== 0) return fs;
        return (b.pubStart ?? "").localeCompare(a.pubStart ?? "");
      })
      .slice(0, 8);

    return {
      projectsCount: projects.length,
      documentsCount: projects.reduce((s, p) => s + p.documentsCount, 0),
      cupCount: cups.size,
      missionCount: missionMap.size,
      missions: Array.from(missionMap.entries())
        .map(([mission, count]) => ({ mission, count }))
        .sort((a, b) => a.mission.localeCompare(b.mission)),
      latestDocs,
    };
  }, [projects]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
          <Landmark className="mr-2 h-4 w-4" />
          Piano Nazionale di Ripresa e Resilienza
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
          Censimento PNRR
        </h1>
        <p className="text-muted-foreground text-lg">
          L'inventario completo dei progetti finanziati dal PNRR sul territorio
          comunale, identificati dal codice CUP e aggregati per progetto, con
          tutti gli atti e i documenti pubblicati sull'Albo Pretorio.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-5 rounded-xl border bg-card shadow-sm">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <>
          {/* Census totals */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Progetti"
              value={census.projectsCount}
              icon={FolderKanban}
            />
            <StatCard
              label="Documenti"
              value={census.documentsCount}
              icon={FileText}
            />
            <StatCard label="Codici CUP" value={census.cupCount} icon={Hash} />
            <StatCard
              label="Missioni"
              value={census.missionCount}
              icon={Layers}
            />
          </div>

          {/* Mission breakdown */}
          {census.missions.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-serif font-bold mb-3 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Ripartizione per Missione
              </h2>
              <div className="flex flex-wrap gap-2">
                {census.missions.map((m) => (
                  <div
                    key={m.mission}
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 shadow-sm"
                  >
                    <Badge className="bg-primary/10 text-primary border-transparent shadow-none font-mono text-xs">
                      {m.mission}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {m.count} {m.count === 1 ? "progetto" : "progetti"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest added documents */}
          <div className="mb-10">
            <h2 className="text-xl font-serif font-bold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Ultimi documenti aggiunti
            </h2>
            <div className="space-y-2">
              {census.latestDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {doc.cup && (
                      <Badge className="bg-primary/10 text-primary border-transparent shadow-none font-mono text-xs">
                        CUP {doc.cup}
                      </Badge>
                    )}
                    {doc.mission && (
                      <Badge variant="outline" className="text-xs shadow-none">
                        {doc.mission}
                      </Badge>
                    )}
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.pubStart)}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    {doc.oggetto}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {doc.tipologia}
                    </span>
                    <AlboLink />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects aggregated by CUP */}
          <h2 className="text-xl font-serif font-bold mb-3 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            Tutti i progetti
          </h2>
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
                        {project.documentsCount}{" "}
                        {project.documentsCount === 1
                          ? "documento"
                          : "documenti"}{" "}
                        · ultimo atto {formatDate(project.lastPublication)}
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
                        className="rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex items-start gap-3">
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
                        <div className="mt-2 pl-7">
                          <AlboLink />
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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
