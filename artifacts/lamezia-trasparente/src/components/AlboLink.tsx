import { ExternalLink, FileText, Download } from "lucide-react";
import type { PublicationAttachment } from "@workspace/api-client-react";
import { ALBO_PORTAL_URL } from "@/lib/albo";
import { cn } from "@/lib/utils";

function attachmentHref(att: PublicationAttachment): string {
  // Prefer the permanently-archived local copy; fall back to the official
  // direct download link to the specific document.
  return att.storagePath ?? att.officialUrl;
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
          Documenti dell'atto
        </span>
        <div className="flex flex-col gap-1.5">
          {files.map((att, i) => (
            <a
              key={`${att.officialUrl}-${i}`}
              href={attachmentHref(att)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-brand transition-colors"
              title={att.name}
            >
              {att.storagePath ? (
                <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{att.name}</span>
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
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      Consulta sull'Albo ufficiale
    </a>
  );
}
