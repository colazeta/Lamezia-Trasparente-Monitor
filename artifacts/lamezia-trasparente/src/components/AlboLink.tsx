import { ExternalLink } from "lucide-react";
import { ALBO_PORTAL_URL } from "@/lib/albo";
import { cn } from "@/lib/utils";

export function AlboLink({ className }: { className?: string }) {
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
      <ExternalLink className="h-3.5 w-3.5" />
      Consulta sull'Albo ufficiale
    </a>
  );
}
