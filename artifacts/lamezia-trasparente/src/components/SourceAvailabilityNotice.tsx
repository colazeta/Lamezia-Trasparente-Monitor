import { AlertTriangle, ExternalLink } from "lucide-react";

type SourceAvailabilityNoticeProps = {
  title?: string;
  description: string;
  sourceHref?: string;
  sourceLabel?: string;
};

export function SourceAvailabilityNotice({
  title = "Fonte in attivazione",
  description,
  sourceHref,
  sourceLabel = "Consulta la fonte ufficiale",
}: SourceAvailabilityNoticeProps) {
  return (
    <section
      className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
      aria-labelledby="source-availability-title"
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <h2
            id="source-availability-title"
            className="font-display text-lg font-bold"
          >
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6">{description}</p>
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
            >
              {sourceLabel}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
