import { useEffect, useMemo, useState } from "react";
import { useListDelibere, type Publication } from "@workspace/api-client-react";
import {
  Calendar,
  ChevronRight,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Gavel,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "wouter";

import { AlboLink } from "@/components/AlboLink";
import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DELIBERE_ARCHIVE_ITEMS,
  DELIBERE_ARCHIVE_SUMMARY,
} from "@/data/delibereArchive";
import { ALBO_VERIFICATION_LABELS } from "@/data/alboStatus";
import { asApiList } from "@/lib/apiList";
import {
  filterDelibere,
  mergeDelibere,
  type DeliberaOrgan,
} from "@/lib/delibereView";
import { MacrotemaBadge } from "@/lib/macrotema";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Tutte" },
  { value: "giunta", label: "Giunta" },
  { value: "consiglio", label: "Consiglio" },
] as const;

const PAGE_SIZE = 20;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMM yyyy", { locale: it });
}

function organLabel(organ: DeliberaOrgan) {
  if (organ === "giunta") return "Giunta comunale";
  if (organ === "consiglio") return "Consiglio comunale";
  return "Deliberazione";
}

export function Delibere() {
  const [tipo, setTipo] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, tipo]);

  const {
    data: delibereData,
    isLoading,
    isError,
  } = useListDelibere({
    tipo: tipo !== "all" ? tipo : undefined,
    q: debouncedSearch || undefined,
  });

  const delibere = useMemo(
    () =>
      mergeDelibere(
        DELIBERE_ARCHIVE_ITEMS,
        asApiList<Publication>(delibereData),
      ),
    [delibereData],
  );
  const filteredDelibere = useMemo(
    () => filterDelibere(delibere, tipo, debouncedSearch),
    [debouncedSearch, delibere, tipo],
  );
  const visibleDelibere = filteredDelibere.slice(0, visibleCount);
  const remaining = Math.max(0, filteredDelibere.length - visibleCount);
  const showLoadingState = isLoading && DELIBERE_ARCHIVE_ITEMS.length === 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <span className="eyebrow text-primary">
          <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
          Atti deliberativi
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Archivio delle delibere
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          Deliberazioni di Giunta e Consiglio osservate nelle fonti monitorate,
          con numero, data, oggetto e documenti disponibili.
        </p>
        <CivicMonitorReturn context="Le delibere sono fonti primarie per verificare promesse, criticità pubbliche e atti collegati senza trarre conclusioni autonome." />
      </div>

      <section
        aria-label="Copertura dell'archivio"
        className="mb-6 grid gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileArchive className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-foreground">
              {DELIBERE_ARCHIVE_SUMMARY.counts.total} atti osservati
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {DELIBERE_ARCHIVE_SUMMARY.counts.giunta} Giunta ·{" "}
              {DELIBERE_ARCHIVE_SUMMARY.counts.consiglio} Consiglio ·{" "}
              {DELIBERE_ARCHIVE_SUMMARY.counts.archived_documents} PDF
              {DELIBERE_ARCHIVE_SUMMARY.counts.archived_documents === 1
                ? " archiviato"
                : " archiviati"}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <div>
            Copertura{" "}
            {formatDate(DELIBERE_ARCHIVE_SUMMARY.coverage.first_act_date)} –{" "}
            {formatDate(DELIBERE_ARCHIVE_SUMMARY.coverage.last_act_date)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
            <span>Storico osservato, non completo.</span>
            <a
              href={DELIBERE_ARCHIVE_SUMMARY.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:text-brand"
            >
              Fonte ufficiale
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          {isError && (
            <p className="mt-1 text-xs">
              API non disponibile: resta consultabile l&apos;archivio statico.
            </p>
          )}
        </div>
      </section>

      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={tipo === tab.value}
              onClick={() => setTipo(tab.value)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                tipo === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover-elevate",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Cerca per oggetto, numero o pubblicazione Albo..."
            aria-label="Cerca nell'archivio delle delibere"
            className="h-11 bg-background pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {!showLoadingState && filteredDelibere.length > 0 && (
        <div
          aria-live="polite"
          className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
        >
          <span className="font-semibold">
            {filteredDelibere.length}{" "}
            {filteredDelibere.length === 1 ? "atto trovato" : "atti trovati"}
          </span>
          <span>Ordinati per data dell&apos;atto, dal più recente</span>
        </div>
      )}

      <div className="space-y-3">
        {showLoadingState ? (
          Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="mb-3 h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </Card>
          ))
        ) : visibleDelibere.length > 0 ? (
          visibleDelibere.map((delibera) => (
            <Card
              key={delibera.dedupeKey}
              data-testid="delibera-card"
              className="group p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {organLabel(delibera.organ)}
                  </Badge>
                  {delibera.actNumber && (
                    <span className="font-mono text-xs font-semibold text-foreground">
                      Delibera n. {delibera.actNumber}
                    </span>
                  )}
                  <MacrotemaBadge macrotema={delibera.macrotema} />
                  {delibera.isNew && (
                    <Badge variant="brand" className="text-xs">
                      NUOVO
                    </Badge>
                  )}
                  {delibera.publicNote && (
                    <Badge variant="outline" className="text-xs">
                      {delibera.publicVisibility === "metadata_only"
                        ? "Solo metadati"
                        : "Dati minimizzati"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(delibera.actDate ?? delibera.publicationStart)}
                </div>
              </div>

              <h2 className="font-display font-bold leading-snug text-foreground transition-colors group-hover:text-brand">
                {delibera.subject}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {delibera.publicationNumber && (
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    Pubblicazione Albo {delibera.publicationNumber}
                  </span>
                )}
                {delibera.office && <span>Provenienza: {delibera.office}</span>}
                {delibera.verificationStatus && (
                  <span>
                    Stato:{" "}
                    {ALBO_VERIFICATION_LABELS[delibera.verificationStatus]}
                  </span>
                )}
                {delibera.lastObservedAt && (
                  <span>
                    Ultima osservazione: {formatDate(delibera.lastObservedAt)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {delibera.internalHref && (
                    <Link
                      href={delibera.internalHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-brand"
                    >
                      Apri la scheda dell&apos;atto
                      <ChevronRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                  {delibera.archivedDocumentPath && (
                    <a
                      href={delibera.archivedDocumentPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-brand"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Documento archiviato
                    </a>
                  )}
                  {delibera.sourceUrl && (
                    <a
                      href={delibera.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-brand"
                    >
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Apri l&apos;Albo ufficiale
                    </a>
                  )}
                </div>
                {(delibera.attachments.length > 0 ||
                  delibera.origin === "api") && (
                  <AlboLink
                    attachments={delibera.attachments}
                    className="sm:max-w-[55%]"
                  />
                )}
              </div>
            </Card>
          ))
        ) : (
          <Empty className="border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Gavel />
              </EmptyMedia>
              <EmptyTitle>Nessuna delibera trovata</EmptyTitle>
              <EmptyDescription>
                Nessuna deliberazione corrisponde ai criteri selezionati. Prova
                a cambiare organo o a modificare la ricerca.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Mostra altri {Math.min(PAGE_SIZE, remaining)} atti
          </Button>
        </div>
      )}
    </div>
  );
}
