import { ExternalLink, FileText, Download } from "lucide-react";
import type { PublicationAttachment } from "@workspace/api-client-react";
import { ALBO_PORTAL_URL } from "@/lib/albo";
import { cn } from "@/lib/utils";

function attachmentHref(att: PublicationAttachment): string {
  // Prefer the permanently-archived local copy; fall back to the official
  // direct download link to the specific document.
  return att.storagePath ?? att.officialUrl;
}

function sourceNote(att: PublicationAttachment): string {
  return att.storagePath
    ? "Fonte puntuale: copia archiviata dell'allegato."
    : "Fonte pubblicazione Albo: link diretto all'allegato ufficiale.";
}

export function AlboLink({
  attachments,
  className,
}: {
  attachments?: PublicationAttachment[];
  className?: string;
}) {
  const files = attachments ?? [];

  if (files.length > 0) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Documenti dell'atto · fonte puntuale
        </span>
        <div className="flex flex-col gap-1.5">
          {files.map((att, i) => (
            <a
              key={`${att.officialUrl}-${i}`}
              href={attachmentHref(att)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-start gap-2 text-xs font-medium text-primary hover:text-brand transition-colors"
              title={`${att.name} — ${sourceNote(att)}`}
            >
              {att.storagePath ? (
                <Download className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className="block truncate">{att.name}</span>
                <span className="block text-[11px] font-normal text-muted-foreground">
                  {sourceNote(att)}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={ALBO_PORTAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-brand transition-colors",
        className,
      )}
      title="Fonte non puntuale: fallback al portale Albo ufficiale."
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      Apri portale Albo · fonte non puntuale
    </a>
  );
}
