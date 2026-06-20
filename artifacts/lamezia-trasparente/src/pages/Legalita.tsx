import { Link } from "wouter";
import {
  useGetLegalitySection,
  type LegalityRequirement,
  type LegalityRequirementStatus,
  type LegalityAreaWithRequirements,
} from "@workspace/api-client-react";
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CircleDashed,
  MinusCircle,
  ExternalLink,
  FileText,
  Quote,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

type StatusMeta = {
  label: string;
  icon: typeof CheckCircle2;
  badgeClass: string;
  dotClass: string;
};

const STATUS_META: Record<LegalityRequirementStatus, StatusMeta> = {
  present: {
    label: "Presente",
    icon: CheckCircle2,
    badgeClass: "border-success/30 bg-success/10 text-success",
    dotClass: "bg-success",
  },
  absent: {
    label: "Assente",
    icon: XCircle,
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    dotClass: "bg-destructive",
  },
  partial: {
    label: "Parziale",
    icon: CircleDashed,
    badgeClass: "border-warning/30 bg-warning/10 text-warning",
    dotClass: "bg-warning",
  },
  not_applicable: {
    label: "Non applicabile",
    icon: MinusCircle,
    badgeClass: "border-border bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
};

function statusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as LegalityRequirementStatus] ??
    STATUS_META.not_applicable
  );
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : format(d, "dd MMM yyyy, HH:mm", { locale: it });
}

export function Legalita() {
  const { data, isLoading } = useGetLegalitySection();

  const areas = Array.isArray(data?.areas) ? data.areas : [];
  const overallJudgment =
    typeof data?.overallJudgment === "string" ? data.overallJudgment : "";
  const hasContent = areas.length > 0 || Boolean(overallJudgment.trim());
  const updatedAt = formatDateTime(data?.updatedAt);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <Scale className="h-3.5 w-3.5" />
          Monitoraggio civico
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Legalità e Trasparenza
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Monitoriamo l'impegno del{" "}
          <span className="font-medium text-foreground">
            Comune di Lamezia Terme
          </span>{" "}
          su trasparenza, partecipazione democratica, antiriciclaggio e
          contrasto alla criminalità organizzata. Per ogni area indichiamo i
          requisiti che il Comune dovrebbe soddisfare, il loro stato, gli atti
          collegati e un giudizio scritto dalla Redazione.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Tutte le valutazioni sono redazionali e non sono il frutto di un
          punteggio calcolato automaticamente.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/legalita/trame-festival"
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-sm font-semibold text-brand transition-colors hover:border-brand/60 hover:bg-brand/10"
          >
            <FileText className="h-4 w-4" />
            Trame - Festival
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-10">
          <Skeleton className="h-32 w-full rounded-2xl" />
          {Array(2)
            .fill(0)
            .map((_, s) => (
              <div key={s}>
                <Skeleton className="mb-4 h-7 w-56" />
                <div className="grid gap-4 md:grid-cols-2">
                  {Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : !hasContent ? (
        <Empty className="border border-dashed border-border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
              <Scale className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-display">
              Sezione in preparazione
            </EmptyTitle>
            <EmptyDescription>
              Il monitoraggio su legalità e trasparenza non è ancora stato
              pubblicato. Torna a trovarci: la Redazione lo aggiorna nel tempo.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div data-tour="legality-areas" className="space-y-12">
          {overallJudgment.trim() ? (
            <OverallJudgment
              text={overallJudgment}
              updatedAt={updatedAt}
            />
          ) : null}

          {areas.map((area) => (
            <AreaSection key={area.id} area={area} />
          ))}
        </div>
      )}
    </div>
  );
}

function OverallJudgment({
  text,
  updatedAt,
}: {
  text: string;
  updatedAt: string | null;
}) {
  return (
    <section
      data-tour="legality-overview"
      className="rounded-2xl border border-brand/30 bg-brand/5 p-6 md:p-8"
    >
      <div className="flex items-center gap-2 text-brand">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="font-display text-lg font-bold tracking-tight">
          Giudizio complessivo della Redazione
        </h2>
      </div>
      <p className="mt-3 whitespace-pre-line text-foreground/90 leading-relaxed">
        {text}
      </p>
      {updatedAt ? (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Aggiornato il {updatedAt}
        </div>
      ) : null}
    </section>
  );
}

function AreaSection({ area }: { area: LegalityAreaWithRequirements }) {
  const requirements = area.requirements;

  return (
    <section>
      <div className="mb-4 border-l-2 border-brand pl-3">
        <h2 className="flex items-center gap-2 text-xl font-display font-bold tracking-tight">
          <Scale className="h-5 w-5 text-brand" />
          {area.title}
        </h2>
        {area.description ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground whitespace-pre-line">
            {area.description}
          </p>
        ) : null}
      </div>

      {requirements.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {requirements.map((req) => (
            <RequirementCard key={req.id} requirement={req} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Nessun requisito ancora pubblicato per quest'area.
        </p>
      )}

      {area.finalJudgment.trim() ? (
        <div className="mt-4 rounded-xl border border-card-border bg-muted/30 p-5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Quote className="h-4 w-4 text-brand" />
            Giudizio della Redazione su quest'area
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {area.finalJudgment}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function RequirementCard({
  requirement,
}: {
  requirement: LegalityRequirement;
}) {
  const meta = statusMeta(requirement.status);
  const StatusIcon = meta.icon;

  return (
    <div className="flex flex-col rounded-xl border border-card-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-bold leading-snug text-foreground">
          {requirement.title}
        </h3>
        <Badge
          variant="outline"
          className={`shrink-0 gap-1 ${meta.badgeClass}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </Badge>
      </div>

      {requirement.description ? (
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
          {requirement.description}
        </p>
      ) : null}

      {requirement.comment.trim() ? (
        <p className="mt-3 border-l-2 border-border pl-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
          {requirement.comment}
        </p>
      ) : null}

      {requirement.linkedActs.length > 0 ? (
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Atti collegati
          </div>
          <ul className="space-y-1">
            {requirement.linkedActs.map((act, i) => (
              <li key={`${act.url}-${i}`}>
                <ActLink label={act.label} url={act.url} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ActLink({ label, url }: { label: string; url: string }) {
  const isInternal = url.startsWith("/") && !url.startsWith("//");

  if (isInternal) {
    return (
      <Link
        href={url}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <FileText className="h-3.5 w-3.5 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      {label}
    </a>
  );
}
