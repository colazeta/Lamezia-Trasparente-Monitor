import { useMemo } from "react";
import { Link } from "wouter";
import {
  useListMonitoringReports,
  getListMonitoringReportsQueryKey,
  type MonitoringReport,
} from "@workspace/api-client-react";
import {
  Telescope,
  Plus,
  FileText,
  Landmark,
  ArrowRight,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Paperclip,
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
    label: "Positivo",
    icon: ThumbsUp,
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  neutro: {
    label: "Neutro",
    icon: Minus,
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  },
  critico: {
    label: "Critico",
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

export function Monitoraggio() {
  const { data, isLoading } = useListMonitoringReports(undefined, {
    query: { queryKey: getListMonitoringReportsQueryKey() },
  });

  const reports = useMemo(() => data ?? [], [data]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div data-tour="monitoring-intro" className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand">
            <Telescope className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Monitoraggio civico
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Report di Monitoraggio Civico
          </h1>
          <p data-tour="monitoring-phases" className="max-w-3xl text-muted-foreground">
            Cittadini e associazioni raccontano com'è andato un progetto
            finanziato con denaro pubblico: un'analisi in tre fasi — analisi
            desk, valutazione di efficacia e impatto sui risultati — ispirata al
            metodo Monithon.
          </p>
        </div>
        <Button data-tour="monitoring-new" asChild variant="brand" className="gap-2">
          <Link href="/monitoraggio/nuovo">
            <Plus className="h-4 w-4" />
            Crea un report
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Telescope className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Ancora nessun report pubblicato</EmptyTitle>
            <EmptyDescription>
              Sii il primo a monitorare un progetto: scegli un appalto o un
              progetto PNRR e racconta com'è andato.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: MonitoringReport }) {
  const assessment = ASSESSMENT_META[report.overallAssessment];
  const AssessmentIcon = assessment.icon;
  const SubjectIcon = report.subjectType === "pnrr" ? Landmark : FileText;

  return (
    <Link
      href={`/monitoraggio/${report.id}`}
      className="group"
      data-testid={`card-monitoraggio-${report.id}`}
    >
      <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={`gap-1 text-xs shadow-none ${assessment.className}`}>
            <AssessmentIcon className="h-3 w-3" />
            {assessment.label}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs shadow-none">
            <SubjectIcon className="h-3 w-3" />
            {report.subjectType === "pnrr" ? "PNRR" : "Appalto"}
          </Badge>
          {report.cig ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CIG {report.cig}
            </Badge>
          ) : report.cup ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CUP {report.cup}
            </Badge>
          ) : null}
        </div>

        <h2 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight">
          {report.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {report.subjectTitle}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
          <span>
            {report.authorName ? `${report.authorName} · ` : ""}
            {formatDate(report.publishedAt ?? report.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            {report.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {report.attachments.length}
              </span>
            )}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </span>
        </div>
      </article>
    </Link>
  );
}
