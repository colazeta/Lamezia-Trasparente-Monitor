import { useRoute, Link } from "wouter";
import {
  useGetMonitoringReport,
  getGetMonitoringReportQueryKey,
  type MonitoringReport,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Telescope,
  FileText,
  Landmark,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Paperclip,
  ExternalLink,
  Search,
  Gauge,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const ASSESSMENT_META: Record<
  MonitoringReport["overallAssessment"],
  { label: string; icon: typeof ThumbsUp; className: string }
> = {
  positivo: {
    label: "Giudizio positivo",
    icon: ThumbsUp,
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  neutro: {
    label: "Giudizio neutro",
    icon: Minus,
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  },
  critico: {
    label: "Giudizio critico",
    icon: ThumbsDown,
    className:
      "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMMM yyyy", { locale: it });
}

export function MonitoraggioDetail() {
  const [, params] = useRoute("/monitoraggio/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data, isLoading, isError } = useGetMonitoringReport(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetMonitoringReportQueryKey(id),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Link
        href="/monitoraggio"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai report
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Telescope className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Report non trovato</EmptyTitle>
            <EmptyDescription>
              Il report richiesto non esiste o non è ancora stato pubblicato.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ReportContent report={data} />
      )}
    </div>
  );
}

function ReportContent({ report }: { report: MonitoringReport }) {
  const assessment = ASSESSMENT_META[report.overallAssessment];
  const AssessmentIcon = assessment.icon;
  const projectHref =
    report.subjectType === "contract" && report.contractId != null
      ? `/contratti/${report.contractId}`
      : report.subjectType === "pnrr"
        ? "/pnrr"
        : null;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={`gap-1 text-xs shadow-none ${assessment.className}`}>
            <AssessmentIcon className="h-3 w-3" />
            {assessment.label}
          </Badge>
          {report.cig ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CIG {report.cig}
            </Badge>
          ) : null}
          {report.cup ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CUP {report.cup}
            </Badge>
          ) : null}
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
          {report.title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {report.authorName ? `Report di ${report.authorName} · ` : ""}
          {formatDate(report.publishedAt ?? report.createdAt)}
        </p>

        {/* Progetto monitorato, con link bidirezionale alla scheda. */}
        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {report.subjectType === "pnrr" ? (
              <Landmark className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Progetto monitorato
          </div>
          <p className="mt-1.5 text-sm font-medium">{report.subjectTitle}</p>
          {projectHref && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
            >
              <Link href={projectHref}>
                <ExternalLink className="h-3.5 w-3.5" />
                {report.subjectType === "pnrr"
                  ? "Vai ai progetti PNRR"
                  : "Vai alla scheda dell'appalto"}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <Phase
        icon={Search}
        index={1}
        title="Analisi desk"
        description="Cosa prevedeva il progetto e cosa risulta dai documenti ufficiali."
        body={report.deskAnalysis}
      />
      <Phase
        icon={Gauge}
        index={2}
        title="Valutazione di efficacia"
        description="Il progetto sta rispondendo ai bisogni per cui era stato pensato?"
        body={report.effectivenessEvaluation}
      />
      <Phase
        icon={Sparkles}
        index={3}
        title="Impatto e risultati"
        description="Quali effetti concreti si vedono sul territorio e sulle persone."
        body={report.impactResults}
      />

      {report.attachments.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <Paperclip className="h-5 w-5 text-brand" />
            Allegati
          </h2>
          <ul className="mt-4 space-y-2">
            {report.attachments.map((att, i) => (
              <li key={`${att.url}-${i}`}>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {att.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Phase({
  icon: Icon,
  index,
  title,
  description,
  body,
}: {
  icon: typeof Search;
  index: number;
  title: string;
  description: string;
  body: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Fase {index}
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
        {body}
      </p>
    </section>
  );
}
