import { Calendar, ExternalLink, Info, Landmark, RefreshCw, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeedSubscribeButton } from "@/components/FeedSubscribeButton";
import { PageMeta } from "@/components/seo/PageMeta";
import { MONITORING_DOCS_NOTICE } from "@/lib/monitoring";
import { formatPublicTimeField } from "@/lib/time";
import {
  ALBO_PRIVACY_RISK_LABELS,
  ALBO_PUBLIC_RUN_ITEMS,
  ALBO_PUBLIC_RUN_SUMMARY,
  ALBO_PUBLIC_VISIBILITY_LABELS,
  type AlboPublicRunItem,
  type AlboPublicVisibility,
} from "@/data/alboPublicRun";

function shortDate(value: string | null): string {
  return value ? formatPublicTimeField(value, "dd/MM/yyyy") : "Data non disponibile";
}

function visibilityClass(visibility: AlboPublicVisibility): string {
  if (visibility === "publishable") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (visibility === "publishable_with_minimisation") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function AlboPublicItemCard({ item }: { item: AlboPublicRunItem }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.act_type ?? "Atto Albo"}
            </Badge>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${visibilityClass(item.public_visibility)}`}>
              {ALBO_PUBLIC_VISIBILITY_LABELS[item.public_visibility]}
            </span>
            <span className="text-xs text-muted-foreground">{ALBO_PRIVACY_RISK_LABELS[item.privacy_risk]}</span>
          </div>

          <h3 className="font-display text-base font-bold leading-snug text-foreground">{item.subject}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {item.publication_number && <span className="font-mono">Pubbl. {item.publication_number}</span>}
            {item.act_number && <span className="font-mono">Atto {item.act_number}</span>}
            {item.office && (
              <span className="inline-flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                {item.office}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Dal {shortDate(item.publication_start)}
            </span>
            {item.publication_end && <span>fino al {shortDate(item.publication_end)}</span>}
          </div>

          {item.public_note && <p className="mt-2 text-xs text-muted-foreground">{item.public_note}</p>}
        </div>

        <a
          href={item.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand sm:w-auto sm:shrink-0"
        >
          Verifica fonte
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </Card>
  );
}

export function Albo() {
  const firstLimit = ALBO_PUBLIC_RUN_SUMMARY.known_limits[0];
  const baselineLimit = ALBO_PUBLIC_RUN_SUMMARY.known_limits.find((limit) =>
    limit.toLowerCase().includes("first-run diff"),
  );

  return (
    <>
      <PageMeta
        title="Albo Pretorio civico navigabile"
        description="Archivio civico consultabile degli atti pubblici dell'Albo Pretorio di Lamezia Terme, con limiti e fonte ufficiale dichiarati."
        path="/albo"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="eyebrow text-primary">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Fonte ufficiale acquisita
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Albo Pretorio Civico</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Atti correnti acquisiti dalla fonte pubblica Albo, mostrati con minimizzazione prudente e rinvio alla fonte
              ufficiale per la verifica.
            </p>
          </div>
          <FeedSubscribeButton
            feedPath="/feeds/albo.xml"
            title="Albo Pretorio Civico - Lamezia Trasparente"
            className="w-full justify-center md:w-auto md:shrink-0"
          />
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
            Ultimo aggiornamento:{" "}
            <span className="font-mono text-primary">
              {formatPublicTimeField(ALBO_PUBLIC_RUN_SUMMARY.retrieved_at, "dd MMMM yyyy 'alle' HH:mm")}
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-display font-bold tabular-nums text-foreground">
              {ALBO_PUBLIC_RUN_SUMMARY.counts.acquired}
            </span>{" "}
            atti acquisiti dalla fonte ufficiale
          </span>
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <p>
            {MONITORING_DOCS_NOTICE} Questa vista non sostituisce l'Albo Pretorio ufficiale e non espone URL diretti
            agli allegati.
          </p>
        </div>

        <section
          aria-labelledby="albo-run-ufficiale"
          className="mb-8 rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="eyebrow text-primary">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Fonte ufficiale acquisita
              </span>
              <h2 id="albo-run-ufficiale" className="mt-2 font-display text-xl font-bold tracking-tight">
                Atti correnti dalla fonte pubblica Albo
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {ALBO_PUBLIC_RUN_SUMMARY.official_albo_disclaimer}
              </p>
            </div>
            <a
              href={ALBO_PUBLIC_RUN_SUMMARY.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              Fonte ufficiale
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Acquisiti", ALBO_PUBLIC_RUN_SUMMARY.counts.acquired],
              ["In lista pubblica", ALBO_PUBLIC_RUN_ITEMS.length],
              ["Minimizzati", ALBO_PUBLIC_RUN_SUMMARY.counts.minimised],
              ["Solo metadato", ALBO_PUBLIC_RUN_SUMMARY.counts.metadata_only],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {firstLimit && <p>{firstLimit}</p>}
            {baselineLimit && <p>{baselineLimit}</p>}
            {ALBO_PUBLIC_RUN_SUMMARY.counts.excluded > 0 && (
              <p>
                {ALBO_PUBLIC_RUN_SUMMARY.counts.excluded} record esclusi non vengono mostrati nella lista civica per
                prudenza privacy.
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {ALBO_PUBLIC_RUN_ITEMS.length} record pubblici mostrati
          </div>
        </section>

        <div className="space-y-3">
          {ALBO_PUBLIC_RUN_ITEMS.map((item) => (
            <AlboPublicItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
