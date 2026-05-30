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
  Euro,
  Building2,
  ExternalLink,
  Paperclip,
  AlertTriangle,
} from "lucide-react";
import { PnrrProject, Publication } from "@workspace/api-client-react";
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

export function Pnrr() {
  const { data, isLoading } = useListPnrrProjects();

  const projects: PnrrProject[] | undefined = data?.projects;
  const uncensored: Publication[] | undefined = data?.uncensored;

  const census = useMemo(() => {
    if (!projects) {
      return {
        projectsCount: 0,
        matchedDocsCount: 0,
        uncensoredCount: 0,
        totalImporto: 0,
        missionCount: 0,
        missions: [] as { mission: string; count: number }[],
      };
    }

    const missionMap = new Map<string, number>();
    let totalImporto = 0;

    for (const p of projects) {
      if (p.mission) {
        const code = p.mission.split(" ")[0];
        missionMap.set(code, (missionMap.get(code) ?? 0) + 1);
      }
      if (p.importoFinanziato) {
        const numeric = Number(
          p.importoFinanziato
            .replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );
        if (!Number.isNaN(numeric)) totalImporto += numeric;
      }
    }

    return {
      projectsCount: projects.length,
      matchedDocsCount: projects.reduce(
        (s: number, p: PnrrProject) => s + p.documentsCount,
        0,
      ),
      uncensoredCount: uncensored?.length ?? 0,
      totalImporto,
      missionCount: missionMap.size,
      missions: Array.from(missionMap.entries())
        .map(([mission, count]) => ({ mission, count }))
        .sort((a, b) => a.mission.localeCompare(b.mission)),
    };
  }, [projects, uncensored]);

  const importoLabel =
    census.totalImporto > 0
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(census.totalImporto)
      : "—";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <span className="eyebrow text-brand">
          <Landmark className="h-3.5 w-3.5" />
          Piano Nazionale di Ripresa e Resilienza
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Censimento PNRR
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Il censimento madre è la sezione ufficiale{" "}
          <a
            href="https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Attuazione Misure PNRR
          </a>{" "}
          del Comune. Per ogni progetto censito mostriamo i metadati ufficiali e
          i documenti dell'Albo Pretorio che vi corrispondono per CUP. I
          documenti PNRR dell'Albo senza corrispondenza sono segnalati come{" "}
          <span className="font-medium text-foreground">
            non censiti in Attuazione
          </span>
          .
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-card-border bg-card shadow-sm"
              >
                <Skeleton className="h-9 w-9 rounded-lg mb-4" />
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <>
          {/* Census totals */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
            <StatCard
              label="Progetti censiti"
              value={String(census.projectsCount)}
              icon={FolderKanban}
              highlight
            />
            <StatCard
              label="Importo finanziato"
              value={importoLabel}
              icon={Euro}
            />
            <StatCard
              label="Documenti Albo collegati"
              value={String(census.matchedDocsCount)}
              icon={FileText}
            />
            <StatCard
              label="Non censiti in Attuazione"
              value={String(census.uncensoredCount)}
              icon={AlertTriangle}
            />
          </div>

          {/* Mission breakdown */}
          {census.missions.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-display font-bold tracking-tight">
                  Ripartizione per Missione
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {census.missions.map((m) => (
                  <div
                    key={m.mission}
                    className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 shadow-sm hover-elevate"
                  >
                    <Badge
                      variant="brand"
                      className="font-mono text-xs shadow-none"
                    >
                      {m.mission}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-display font-bold tabular-nums text-foreground">
                        {m.count}
                      </span>{" "}
                      {m.count === 1 ? "progetto" : "progetti"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-display font-bold tracking-tight">
              Progetti censiti in Attuazione PNRR
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3 mb-12">
            {projects.map((project: PnrrProject) => (
              <AccordionItem
                key={project.key}
                value={project.key}
                className="rounded-xl border border-card-border bg-card px-5 shadow-sm transition-colors data-[state=open]:border-brand/40"
              >
                <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
                  <div className="flex w-full items-start justify-between gap-4 text-left">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {project.cup && (
                          <Badge
                            variant="brand"
                            className="font-mono text-xs shadow-none"
                          >
                            CUP {project.cup}
                          </Badge>
                        )}
                        {project.mission && (
                          <Badge
                            variant="outline"
                            className="text-xs shadow-none"
                          >
                            {project.mission.split(" ")[0]}
                          </Badge>
                        )}
                        {project.component && (
                          <Badge
                            variant="outline"
                            className="text-xs shadow-none font-mono"
                          >
                            {project.component.split(" ")[0]}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-foreground leading-snug">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {project.importoFinanziato && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Euro className="h-3 w-3" />
                            <span className="tabular-nums">{project.importoFinanziato}</span>
                          </span>
                        )}
                        {project.attuatore && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {project.attuatore}
                          </span>
                        )}
                        <span>
                          <span className="font-display font-bold tabular-nums text-foreground">
                            {project.documentsCount}
                          </span>{" "}
                          {project.documentsCount === 1
                            ? "documento Albo"
                            : "documenti Albo"}{" "}
                          · ultimo atto {formatDate(project.lastPublication)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 border-t border-border/60 pt-4">
                    {/* Official metadata grid */}
                    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
                      <MetaRow label="Missione" value={project.mission} />
                      <MetaRow label="Componente" value={project.component} />
                      <MetaRow label="Investimento" value={project.investment} />
                      <MetaRow label="Intervento" value={project.intervention} />
                      <MetaRow label="Titolare" value={project.holder} />
                      <MetaRow
                        label="Soggetto Attuatore"
                        value={project.attuatore}
                      />
                      <MetaRow
                        label="Importo Finanziato"
                        value={project.importoFinanziato}
                      />
                      <MetaRow
                        label="Stato di avanzamento"
                        value={project.status}
                      />
                      {project.startDate && (
                        <MetaRow
                          label="Data avvio"
                          value={formatDate(project.startDate)}
                        />
                      )}
                      {project.endDate && (
                        <MetaRow
                          label="Data fine"
                          value={formatDate(project.endDate)}
                        />
                      )}
                      <MetaRow
                        label="Pubblicato sul sito"
                        value={formatDate(project.publishedAt)}
                      />
                    </dl>

                    {/* Official links */}
                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Scheda ufficiale Attuazione
                      </a>
                    </div>

                    {/* Official attachments */}
                    {project.attachments.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" />
                          Allegati ufficiali
                        </h4>
                        <ul className="space-y-1.5">
                          {project.attachments.map((att: any) => (
                            <li key={att.url}>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-start gap-1.5 text-sm text-primary hover:underline"
                              >
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="break-all">{att.title}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Matched Albo documents */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Documenti Albo Pretorio collegati (per CUP)
                      </h4>
                      {project.documents.length > 0 ? (
                        <div className="space-y-2">
                          {project.documents.map((doc: Publication) => (
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
                                    <span className="flex items-center gap-1 font-mono">
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
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Nessun documento dell'Albo Pretorio collegato a questo
                          progetto.
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Uncensored Albo documents */}
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <h2 className="text-xl font-serif font-bold mb-1 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Documenti Albo non censiti in Attuazione
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Documenti PNRR rilevati sull'Albo Pretorio il cui CUP non risulta
              in alcun progetto della sezione ufficiale Attuazione Misure PNRR.
            </p>
            {uncensored && uncensored.length > 0 ? (
              <div className="space-y-2">
                {uncensored.map((doc: Publication) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-amber-200/60 bg-card p-3 dark:border-amber-500/20"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-amber-100 text-amber-800 shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                        Non censito in Attuazione
                      </Badge>
                      {doc.cups?.map((c: string) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="font-mono text-xs shadow-none"
                        >
                          <Hash className="mr-1 h-3 w-3" />
                          {c}
                        </Badge>
                      ))}
                      {doc.pnrrMission && (
                        <Badge
                          variant="outline"
                          className="text-xs shadow-none"
                        >
                          {doc.pnrrMission}
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
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Tutti i documenti PNRR dell'Albo risultano censiti in Attuazione.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                <Landmark className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle className="font-display">
                Nessun progetto PNRR rilevato
              </EmptyTitle>
              <EmptyDescription>
                Al momento non risultano progetti PNRR censiti. Continueremo a
                monitorare l'Albo Pretorio per nuovi atti e finanziamenti.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </>
      )}
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm ${
        highlight ? "border-brand/40" : "border-card-border"
      }`}
    >
      {highlight && (
        <span className="absolute left-0 top-0 h-full w-1 bg-brand" />
      )}
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${
          highlight
            ? "bg-brand/15 text-brand"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div
        className={`text-3xl font-display font-bold tracking-tight tabular-nums ${
          highlight ? "text-brand" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 eyebrow text-muted-foreground">{label}</div>
    </div>
  );
}
