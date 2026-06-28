import { cn } from "@/lib/utils";

/**
 * "Sentinella" mark — a watchful civic eye. The almond reads as an eye / lens
 * (transparency, scrutiny) while the vermilion iris signals activist urgency.
 * Recognizable at 32px. Uses theme tokens so it adapts to light/dark.
 */
export function LogoMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <path
        d="M2 16C5.6 8.8 10.4 5.2 16 5.2C21.6 5.2 26.4 8.8 30 16C26.4 23.2 21.6 26.8 16 26.8C10.4 26.8 5.6 23.2 2 16Z"
        className={mono ? "fill-current" : "fill-primary"}
      />
      <circle
        cx="16"
        cy="16"
        r="5.4"
        className={mono ? "fill-background" : "fill-brand"}
      />
      <circle
        cx="16"
        cy="16"
        r="2.1"
        className={mono ? "fill-current" : "fill-background"}
      />
    </svg>
  );
}

export function Logo({
  className,
  textClassName,
  subtitle = true,
}: {
  className?: string;
  textClassName?: string;
  subtitle?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "whitespace-nowrap font-display font-bold tracking-tight text-foreground",
            textClassName,
          )}
        >
          rendiamo<span className="text-brand">Lamezia</span>Trasparente
        </span>
        {subtitle && (
          <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">
            Osservatorio Civico Indipendente
          </span>
        )}
      </span>
    </span>
  );
}
