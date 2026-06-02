import { useParams, Link } from "wouter";
import {
  useGetOversightOpinion,
  getGetOversightOpinionQueryKey,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertTriangle,
  ChevronLeft,
  Calendar,
  CalendarRange,
  Building2,
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PareriVigilanzaDetail() {
  const { id } = useParams();
  const opinionId = id ? parseInt(id, 10) : 0;

  const {
    data: opinion,
    isLoading,
    error,
  } = useGetOversightOpinion(opinionId, {
    query: {
      enabled: !!opinionId,
      queryKey: getGetOversightOpinionQueryKey(opinionId),
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Skeleton className="h-4 w-44 mb-6" />
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-5">
          <div className="flex gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !opinion) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
            Parere non trovato
          </h1>
          <p className="text-muted-foreground mb-6">
            Il parere richiesto non esiste o non è più disponibile.
          </p>
          <Link href="/pareri">
            <Button variant="brand">Torna ai Pareri</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/pareri"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Torna ai Pareri di Vigilanza
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 mb-8">
        <span className="block h-1.5 w-full bg-brand" />
        <div className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {opinion.issuingBody}
            </Badge>
            <Badge variant="outline">{opinion.opinionType}</Badge>
            {opinion.referenceYear != null && (
              <Badge variant="outline" className="gap-1.5 font-mono">
                <CalendarRange className="h-3.5 w-3.5" />
                Rif. {opinion.referenceYear}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-[1.15] text-foreground">
            {opinion.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(opinion.opinionDate), "dd MMMM yyyy", {
                locale: it,
              })}
            </div>
            {opinion.outcome && (
              <>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-brand">
                  <CheckCircle2 className="h-4 w-4" />
                  {opinion.outcome}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Oggetto
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              {opinion.subject}
            </p>
          </section>

          {opinion.body && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" /> Testo / Sintesi
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {opinion.body.split("\n").map((paragraph, i) =>
                  paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
                )}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" /> Documenti allegati
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opinion.documents && opinion.documents.length > 0 ? (
                <div className="space-y-3">
                  {opinion.documents.map((doc) => {
                    const inner = (
                      <div className="flex items-start gap-3">
                        <div className="bg-brand/10 p-2 rounded-md text-brand shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-brand transition-colors">
                            {doc.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase font-mono bg-muted px-1.5 py-0.5 rounded">
                              {doc.type}
                            </span>
                            <span className="font-mono">
                              {format(new Date(doc.date), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                        {doc.url && (
                          <Download className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-brand transition-colors" />
                        )}
                      </div>
                    );
                    return doc.url ? (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg border border-border p-3 hover-elevate transition-all hover:border-brand/40"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        key={doc.id}
                        className="rounded-lg border border-border p-3 opacity-90"
                      >
                        {inner}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessun documento allegato a questo parere.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
