import { useMemo } from "react";
import { Link } from "wouter";
import { useListPnrrProjects } from "@workspace/api-client-react";
import {
  Landmark,
  FileText,
  Calendar,
  Layers,
  FolderKanban,
  Euro,
  Building2,
  ExternalLink,
  Paperclip,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Hash,
  Telescope,
  RefreshCw,
} from "lucide-react";
import { PnrrProject, Publication } from "@workspace/api-client-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";
import { MonitoringReportsSection } from "@/components/MonitoringReportsSection";
import { PageMeta } from "@/components/seo/PageMeta";

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
  const censusLastUpdatedAt: string | null | undefined =
    data?.censusLastUpdatedAt;

  const census = useMemo(() => {
    if (!projects) {
      return {
        projectsCount: 0,
        transparentCount: 0,
        staleCount: 0,
        totalImporto: 0,
        missionCount: 0,
        missions: [] as { mission: string; count: number }[],
      };
    }

    const missionMap = new Map<string, number>();
    let totalImporto = 0;
    let transparentCount = 0;
    let staleCount = 0;

    for (const p of projects) {
      if (p.mission) {
        const code = p.mission.split(" ")[0];
        missionMap.set(code, (missionMap.get(code) ?? 0) + 1);
      }
      if (p.importoFinanziato != null && !Number.isNaN(p.importoFinanziato)) {
        totalImporto += p.importoFinanziato;
      }
      if (p.trasparenzaCompleta) transparentCount += 1;
      if (p.aggiornamentoVecchio) staleCount += 1;
    }

    return {
      projectsCount: projects.length,
      transparentCount,
      staleCount,
      totalImporto,
      missionCount: missionMap.size,
      missions: Array.from(missionMap.entries())
        .map(([mission, count]) => ({ mission, count }))
        .sort((a, b) => a.mission.localeCompare(b.mission)),
    };
  }, [projects]);

  const importoLabel =
    census.totalImporto > 0
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(census.totalImporto)
      : "—";

  const formatImporto = (value: number | null | undefined): string | null =>
    value != null && !Number.isNaN(value)
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 2,
        }).format(value)
      : null;

  return (
    <>
      <PageMeta
        title="Progetti PNRR a Lamezia Terme"
        description="Consultazione civica dei progetti PNRR collegati a Lamezia Terme, con importi, stati e collegamenti alle fonti ufficiali disponibili."
        path="/pnrr"
      />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <Landmark className="h-3.5 w-3.5" />
          Piano Nazionale di Ripresa e Resilienza
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Censimento PNRR
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Lista master tratta dal censimento ufficiale{" "}
          <a
            href="https://www.italiadomani.gov.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Italia Domani
          </a>
          : tutti i progetti PNRR localizzati nel Comune di Lamezia Terme. Per
          ogni progetto verifichiamo la presenza sulla pagina{" "}
          <a
            href="https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Attuazione Misure PNRR
          </a>{" "}
          del Comune (flag di trasparenza) e colleghiamo i documenti dell'Albo
          Pretorio per CUP.
        </p>
        {censusLastUpdatedAt && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3"  aria-hidden="true"/>
            Censimento aggiornato il {formatDate(censusLastUpdatedAt)}
          </p>
        )}
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
          <div data-tour="pnrr-stats" className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
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
              label="Trasparenza completa"
              value={String(census.transparentCount)}
              icon={ShieldCheck}
            />
            <StatCard
              label="Aggiornamento vecchio"
              value={String(census.staleCount)}
              icon={Clock}
            />
          </div>

          {/* Mission breakdown */}
          {census.missions.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand"  aria-hidden="true"/>
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
            <FolderKanban className="h-5 w-5 text-brand"  aria-hidden="true"/>
            <h2 className="text-xl font-display font-bold tracking-tight">
              Progetti PNRR – Censimento Italia Domani
            </h2>
          </div>

          <div data-tour="pnrr-list" className="space-y-4 mb-12">
            {projects.map((project: PnrrProject) => (
              <PnrrCard
                key={project.key}
                project={project}
                formatImporto={formatImporto}
              />
            ))}
          </div>

          {/* Uncensored Albo documents */}
          {uncensored && uncensored.length > 0 && (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <h2 className="text-xl font-serif font-bold mb-1 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5"  aria-hidden="true"/>
                Documenti Albo non collegati a censimento
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Documenti PNRR rilevati sull'Albo Pretorio il cui CUP non
                corrisponde ad alcun progetto nel censimento Italia Domani.
              </p>
              <div className="space-y-2">
                {uncensored.map((doc: Publication) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-amber-200/60 bg-card p-3 dark:border-amber-500/20"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-amber-100 text-amber-800 shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                        Non censito
                      </Badge>
                      {doc.cups?.map((c: string) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="font-mono text-xs shadow-none"
                        >
                          <Hash className="mr-1 h-3 w-3"  aria-hidden="true"/>
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
                        <Calendar className="h-3 w-3"  aria-hidden="true"/>
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
          )}
        </>
      ) : (
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
              <Landmark className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-display">
              Nessun progetto PNRR nel censimento
            </EmptyTitle>
            <EmptyDescription>
              Il censimento Italia Domani non è ancora stato importato. I
              progetti compariranno al completamento della prima ingestione.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      </div>
    </>
  );
}

function PnrrCard({
  project,
  formatImporto,
}: {
  project: PnrrProject;
  formatImporto: (v: number | null | undefined) => string | null;
}) {
  return (
    <div data-tour="pnrr-detail" className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
      {/* Card header stripe for transparency */}
      <div
        className={`h-1 w-full ${
          project.trasparenzaCompleta ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />

      <div className="p-5">
        {/* Top badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {project.cup && (
            <Badge
              variant="brand"
              className="font-mono text-xs shadow-none"
            >
              CUP {project.cup}
            </Badge>
          )}
          {project.mission && (
            <Badge variant="outline" className="text-xs shadow-none">
              {project.mission.split(" ")[0]}
            </Badge>
          )}
          {project.component && (
            <Badge variant="outline" className="text-xs shadow-none font-mono">
              {project.component.split(" ")[0]}
            </Badge>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {project.trasparenzaCompleta ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                <ShieldCheck className="h-3 w-3"  aria-hidden="true"/>
                Trasparenza completa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30">
                <ShieldAlert className="h-3 w-3"  aria-hidden="true"/>
                Lacuna di trasparenza
              </span>
            )}
            {project.aggiornamentoVecchio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30">
                <Clock className="h-3 w-3"  aria-hidden="true"/>
                Aggiornamento vecchio
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-foreground leading-snug mb-3">
          {project.title}
        </h3>

        {/* Key metadata row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
          {formatImporto(project.importoFinanziato) && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Euro className="h-3.5 w-3.5 text-brand"  aria-hidden="true"/>
              {formatImporto(project.importoFinanziato)}
            </span>
          )}
          {(project.attuatore ?? project.holder) && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5"  aria-hidden="true"/>
              {project.attuatore ?? project.holder}
            </span>
          )}
          {project.status && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary/40" />
              {project.status}
            </span>
          )}
          {project.lastUpdatedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5"  aria-hidden="true"/>
              Aggiornato {formatDate(project.lastUpdatedAt)}
            </span>
          )}
        </div>

        {/* Details grid */}
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm mb-4">
          <MetaRow label="Missione" value={project.mission} />
          <MetaRow label="Componente" value={project.component} />
          <MetaRow label="Investimento" value={project.investment} />
          <MetaRow label="Intervento" value={project.intervention} />
          <MetaRow label="Titolare" value={project.holder} />
          <MetaRow label="Soggetto Attuatore" value={project.attuatore} />
          {project.startDate && (
            <MetaRow label="Data avvio" value={formatDate(project.startDate)} />
          )}
          {project.endDate && (
            <MetaRow label="Data fine" value={formatDate(project.endDate)} />
          )}
        </dl>

        {/* Action links */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5"  aria-hidden="true"/>
              Scheda Attuazione Comune
            </a>
          )}
          <Link
            href={`/monitoraggio/nuovo?pnrrProjectId=${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
            data-testid={`link-monitora-pnrr-${project.id}`}
          >
            <Telescope className="h-3.5 w-3.5"  aria-hidden="true"/>
            Monitora questo progetto
          </Link>
        </div>

        {/* Civic monitoring */}
        <MonitoringReportsSection
          subjectType="pnrr"
          pnrrProjectId={project.id}
        />

        {/* Official attachments from Comune */}
        {project.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5"  aria-hidden="true"/>
              Allegati ufficiali Comune
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
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0"  aria-hidden="true"/>
                    <span className="break-all">{att.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Matched Albo documents */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText className="h-3.5 w-3.5"  aria-hidden="true"/>
            Documenti Albo Pretorio collegati per CUP
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-foreground">
              {project.documentsCount}
            </span>
          </h4>
          {project.documents.length > 0 ? (
            <div className="space-y-2">
              {project.documents.map((doc: Publication) => (
                <div
                  key={doc.id}
                  className="rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary"  aria-hidden="true"/>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {doc.oggetto}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{doc.tipologia}</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3"  aria-hidden="true"/>
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
              Nessun documento dell'Albo Pretorio collegato a questo progetto.
            </p>
          )}
        </div>
      </div>
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
