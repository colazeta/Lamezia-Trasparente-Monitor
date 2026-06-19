import { useRoute, Link } from "wouter";
import {
  useGetSeduta,
  useGetPublicationStoria,
  getGetSedutaQueryKey,
  getGetPublicationStoriaQueryKey,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Building2,
  Vote,
  Layers,
  GitMerge,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  MacrotemaBadge,
  macrotemaColors,
  macrotemaLabel,
} from "@/lib/macrotema";
import { CouncilSessionV0DemoDetail } from "@/components/launch/CouncilSessionV0DemoCard";
import { councilSessionV0DemoFixture } from "@/data/councilSessionV0";

const VOTE_VARIANTS: Record<
  string,
  "success" | "destructive" | "warning" | "outline"
> = {
  favorevole: "success",
  contrario: "destructive",
  astenuto: "warning",
  assente: "outline",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

export function SedutaDetail() {
  const [, params] = useRoute("/convocazioni/:id");
  const routeId = params?.id ?? "";
  const isDemoRoute = routeId === councilSessionV0DemoFixture.id;
  const id = routeId && !isDemoRoute ? Number(routeId) : NaN;

  const {
    data: seduta,
    isLoading,
    isError,
  } = useGetSeduta(id, {
    query: {
      enabled: !Number.isNaN(id) && !isDemoRoute,
      queryKey: getGetSedutaQueryKey(id),
    },
  });

  const { data: storia } = useGetPublicationStoria(id, {
    query: {
      enabled: !Number.isNaN(id) && !isDemoRoute && !!seduta,
      queryKey: getGetPublicationStoriaQueryKey(id),
    },
  });

  const storiaContracts = Array.isArray(storia?.contracts)
    ? storia.contracts
    : [];
  const storiaPnrrProjects = Array.isArray(storia?.pnrrProjects)
    ? storia.pnrrProjects
    : [];
  const storiaSiblings = Array.isArray(storia?.siblings) ? storia.siblings : [];
  const sedutaOdgPoints = Array.isArray(seduta?.odgPoints)
    ? seduta.odgPoints
    : [];
  const sedutaVotes = Array.isArray(seduta?.votes) ? seduta.votes : [];
  const sedutaInterventions = Array.isArray(seduta?.interventions)
    ? seduta.interventions
    : [];
  const storiaDelibere = storiaSiblings.filter(
    (s) => s.category === "delibera",
  );
  const storiaAltriAtti = storiaSiblings.filter(
    (s) => s.category !== "delibera",
  );

  const hasStoria =
    storia &&
    (storiaContracts.length > 0 ||
      storiaPnrrProjects.length > 0 ||
      storiaSiblings.length > 0 ||
      storia.originatingSeduta !== null);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/convocazioni"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle convocazioni
      </Link>

      {isDemoRoute ? (
        <>
          <PageMeta
            title="Scheda demo v0 convocazione"
            description="Fixture dimostrativa per verificare il formato minimo di una scheda seduta: fonti, limiti del dato e stato di verifica. Non rappresenta una convocazione reale."
            path={`/convocazioni/${councilSessionV0DemoFixture.id}`}
            type="article"
          />
          <CouncilSessionV0DemoDetail />
        </>
      ) : isLoading ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : isError || !seduta ? (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle className="font-display">Seduta non trovata</EmptyTitle>
            <EmptyDescription>
              La convocazione richiesta non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <header className="mb-10 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="eyebrow text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(seduta.dataAtto ?? seduta.pubStart)}
                </span>
                {seduta.organo ? (
                  <Link href={`/organi/${seduta.organo.slug}`}>
                    <Badge
                      variant="secondary"
                      className="uppercase tracking-wide gap-1.5 hover:bg-secondary/80 transition-colors"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {seduta.organo.name}
                    </Badge>
                  </Link>
                ) : (
                  seduta.subcategory && (
                    <Badge
                      variant="secondary"
                      className="uppercase tracking-wide"
                    >
                      {seduta.subcategory === "consiglio"
                        ? "Consiglio Comunale"
                        : seduta.subcategory === "commissione"
                          ? "Commissione"
                          : seduta.subcategory}
                    </Badge>
                  )
                )}
                {seduta.isNew && <Badge variant="brand">Nuovo</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight">
                {seduta.oggetto}
              </h1>
              {seduta.provenienza && (
                <p className="text-sm text-muted-foreground">
                  {seduta.provenienza}
                </p>
              )}
              {seduta.macrotema && seduta.macrotema !== "altro" && (
                <MacrotemaBadge macrotema={seduta.macrotema} size="lg" />
              )}
              <div className="pt-1">
                <AlboLink />
              </div>
            </div>
          </header>

          {/* Ordine del giorno — punti con macrotema per punto */}
          {sedutaOdgPoints.length > 0 && (
            <>
              <div className="mb-6 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Layers className="h-4 w-4" />
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                  Ordine del giorno
                </h2>
              </div>
              <ol className="mb-10 space-y-3">
                {sedutaOdgPoints.map((punto) => (
                  <li
                    key={punto.index}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {punto.index}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug text-foreground">
                          {punto.text}
                        </p>
                        {punto.macrotema && punto.macrotema !== "altro" && (
                          <span
                            className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${macrotemaColors(punto.macrotema)}`}
                          >
                            {macrotemaLabel(punto.macrotema)}
                          </span>
                        )}
                      </div>
                    </div>
                    {Array.isArray(punto.outcomes) &&
                      punto.outcomes.length > 0 && (
                        <div className="mt-3 ml-10 space-y-1.5">
                          {punto.outcomes.map((out, oi) => (
                            <Link
                              key={oi}
                              href={
                                out.type === "contract"
                                  ? `/contratti/${out.id}`
                                  : `/albo/${out.id}`
                              }
                              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              <span className="shrink-0 rounded border px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                {out.type === "contract"
                                  ? "Contratto"
                                  : out.type === "delibera"
                                    ? "Delibera"
                                    : "Atto"}
                              </span>
                              <span className="flex-1 truncate">
                                {out.title}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                  </li>
                ))}
              </ol>
            </>
          )}

          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
              <MessageSquare className="h-4 w-4" />
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
              Resoconto stenografico
            </h2>
          </div>

          {seduta.summary && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4 md:p-5 text-sm text-foreground/90 whitespace-pre-line">
              {seduta.summary}
            </div>
          )}

          {sedutaInterventions.length > 0 ? (
            <ol className="relative space-y-6 border-l-2 border-border pl-6">
              {sedutaInterventions.map((intervento) => (
                <li key={intervento.id} className="relative">
                  <span className="absolute -left-[2.05rem] flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-brand/10 text-brand">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-sm transition-all hover-elevate">
                    <div className="mb-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display font-bold text-foreground">
                        {intervento.speakerName}
                      </span>
                      {intervento.speakerRole && (
                        <span className="text-xs text-muted-foreground">
                          {intervento.speakerRole}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {intervento.content}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Empty className="border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle className="font-display">
                  Resoconto non disponibile
                </EmptyTitle>
                <EmptyDescription>
                  Il resoconto stenografico non è ancora stato pubblicato per
                  questa seduta.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {sedutaVotes.length > 0 && (
            <>
              <div className="mt-10 mb-6 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Vote className="h-4 w-4" />
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                  Esito delle votazioni
                </h2>
              </div>
              <ul className="space-y-2">
                {sedutaVotes.map((v) => (
                  <li key={v.officialId}>
                    <Link
                      href={`/amministratori/${v.officialId}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-brand/40"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {v.name}
                      </span>
                      <Badge
                        variant={VOTE_VARIANTS[v.vote] ?? "outline"}
                        className="capitalize shrink-0"
                      >
                        {v.vote}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Storia collegata — contratti, PNRR e atti fratelli */}
          {hasStoria && (
            <>
              <div className="mt-10 mb-6 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <GitMerge className="h-4 w-4" />
                </span>
                <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                  Storia collegata
                </h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Contratti e atti collegati a questa seduta tramite CIG o CUP.
              </p>

              <div className="space-y-6">
                {storiaContracts.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      Appalti collegati ({storiaContracts.length})
                    </h3>
                    <div className="space-y-2">
                      {storiaContracts.map((c) => (
                        <Link
                          key={c.id}
                          href={`/contratti/${c.id}`}
                          className="block"
                        >
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2 flex-1">
                                {c.title}
                              </p>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            {c.cig && (
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                CIG {c.cig}
                              </p>
                            )}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {storiaPnrrProjects.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Progetti PNRR collegati ({storiaPnrrProjects.length})
                    </h3>
                    <div className="space-y-2">
                      {storiaPnrrProjects.map((p) => (
                        <Link key={p.id} href="/pnrr" className="block">
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors">
                              {p.title}
                            </p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              CUP {p.cup}
                            </p>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delibere: esiti della seduta */}
                {storiaDelibere.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Delibere approvate ({storiaDelibere.length})
                    </h3>
                    <div className="space-y-2">
                      {storiaDelibere.map((s) => (
                        <Link
                          key={s.id}
                          href={`/albo/${s.id}`}
                          className="block"
                        >
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2 flex-1">
                                {s.oggetto}
                              </p>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Altri atti collegati */}
                {storiaAltriAtti.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <GitMerge className="h-3.5 w-3.5" />
                      Altri atti collegati ({storiaAltriAtti.length})
                    </h3>
                    <div className="space-y-2">
                      {storiaAltriAtti.map((s) => (
                        <Link
                          key={s.id}
                          href={`/albo/${s.id}`}
                          className="block"
                        >
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2 flex-1">
                                {s.oggetto}
                              </p>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {s.tipologia}
                            </p>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
