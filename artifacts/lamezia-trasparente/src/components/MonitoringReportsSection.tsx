import { Link } from "wouter";
import {
  useListMonitoringReports,
  getListMonitoringReportsQueryKey,
  type ListMonitoringReportsParams,
  type MonitoringReport,
} from "@workspace/api-client-react";
import {
  Telescope,
  ArrowRight,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Paperclip,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export function MonitoringReportsSection({
  subjectType,
  contractId,
  pnrrProjectId,
}: {
  subjectType: "contract" | "pnrr";
  contractId?: number;
  pnrrProjectId?: number;
}) {
  const params: ListMonitoringReportsParams =
    subjectType === "contract" ? { contractId } : { pnrrProjectId };

  const { data, isLoading } = useListMonitoringReports(params, {
    query: { queryKey: getListMonitoringReportsQueryKey(params) },
  });

  const reports = data ?? [];
  const newReportHref =
    subjectType === "contract"
      ? `/monitoraggio/nuovo?contractId=${contractId}`
      : `/monitoraggio/nuovo?pnrrProjectId=${pnrrProjectId}`;

  if (isLoading) return null;
  if (reports.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Telescope className="h-5 w-5 text-brand" />
          Report di monitoraggio civico
        </h2>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href={newReportHref}>
            <Telescope className="h-3.5 w-3.5" />
            Aggiungi il tuo
          </Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Cosa dicono cittadini e associazioni che hanno monitorato questo
        progetto.
      </p>
      <ul className="mt-4 space-y-2">
        {reports.map((report) => {
          const assessment = ASSESSMENT_META[report.overallAssessment];
          const AssessmentIcon = assessment.icon;
          return (
            <li key={report.id}>
              <Link
                href={`/monitoraggio/${report.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/50"
                data-testid={`link-report-${report.id}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      className={`gap-1 text-xs shadow-none ${assessment.className}`}
                    >
                      <AssessmentIcon className="h-3 w-3" />
                      {assessment.label}
                    </Badge>
                    {report.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        {report.attachments.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">
                    {report.title}
                  </p>
                  {report.authorName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {report.authorName}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
