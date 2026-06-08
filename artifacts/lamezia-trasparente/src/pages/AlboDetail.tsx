import { useState, type ReactNode } from "react";
import { useRoute, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetPublication,
  useGetPublicationStoria,
  useRegeneratePublicationBrief,
  useSetPublicationBrief,
  getGetPublicationQueryKey,
  getGetPublicationStoriaQueryKey,
  type Publication,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  Building2,
  BookOpen,
  GitMerge,
  AlertCircle,
  ChevronRight,
  Vote,
  Sparkles,
  Pencil,
  Loader2,
  Save,
  X,
  RotateCw,
  ShieldCheck,
  Hash,
  Landmark,
  BadgeEuro,
  UserRound,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AlboLink } from "@/components/AlboLink";
import { MacrotemaBadge } from "@/lib/macrotema";
import {
  alboExtractionText,
  describeAlboMatchCriterion,
  extractAlboAmount,
  extractAlboCigs,
  getAlboSourceInfo,
  hasAlboBeneficiarySignal,
  isReliableAlboProgressivo,
} from "@/lib/albo";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

type DataStatus = "official" | "extracted" | "signal" | "enriched" | "to-verify";

const DATA_STATUS_LABELS: Record<DataStatus, string> = {
  official: "ufficiale",
  extracted: "estratto",
  signal: "segnale rilevato",
  enriched: "arricchito",
  "to-verify": "da verificare",
};

function DataStatusBadge({ status }: { status: DataStatus }) {
  const variant = status === "official" ? "secondary" : status === "to-verify" ? "outline" : "warning";
  return (
    <Badge variant={variant} className="text-[10px] uppercase tracking-wide">
      {DATA_STATUS_LABELS[status]}
    </Badge>
  );
}

function unavailable(label = "Non disponibile") {
  return <span className="text-muted-foreground">{label}</span>;
}

function ProfileField({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status: DataStatus;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground">
        {value}
        <DataStatusBadge status={status} />
      </dd>
    </div>
  );
}

export function AlboDetail() {
  const [, params] = useRoute("/albo/:id");
  const id = params?.id ? Number(params.id) : NaN;

  const { data: publication, isLoading, isError } = useGetPublication(id, {
    query: {
      enabled: !Number.isNaN(id),
      queryKey: getGetPublicationQueryKey(id),
    },
  });

  const { data: storia, isLoading: storiaLoading } = useGetPublicationStoria(id, {
    query: {
      enabled: !Number.isNaN(id) && !!publication,
      queryKey: getGetPublicationStoriaQueryKey(id),
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link
        href="/albo"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna all'Albo
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : isError || !publication ? (
        <Empty className="border bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Atto non trovato</EmptyTitle>
            <EmptyDescription>
              L'atto richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <header className="overflow-hidden rounded-2xl border border-border bg-muted/30">
            <span className="block h-1.5 w-full bg-brand" />
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="eyebrow text-primary">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(publication.dataAtto ?? publication.pubStart)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {publication.tipologia}
                </Badge>
                {publication.isNew && (
                  <Badge variant="brand" className="text-xs">
                    NUOVO
                  </Badge>
                )}
                {publication.isPnrr && (
                  <Badge variant="warning" className="text-xs">
                    PNRR
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight leading-tight">
                {publication.oggetto}
              </h1>

              {publication.provenienza && (
                <p className="text-sm text-muted-foreground">
                  {publication.provenienza}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <MacrotemaBadge macrotema={publication.macrotema} size="lg" />
                {publication.numRegGen && (
                  <span className="font-mono text-xs text-muted-foreground">
                    Reg. gen. {publication.numRegGen}
                  </span>
                )}
              </div>

              {publication.pubEnd && (
                <p className="text-xs text-muted-foreground">
                  Pubblicato fino al {formatDate(publication.pubEnd)}
                </p>
              )}
            </div>
          </header>

          {/* In breve */}
          {publication.brief && (
            <section>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-xl font-display font-bold tracking-tight">
                  In breve
                </h2>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/5 px-5 py-4 text-sm leading-relaxed text-foreground">
                {publication.brief}
              </div>
            </section>
          )}


          {/* Scheda strutturata */}
          <StructuredActProfile publication={publication} />

          {/* Redazione: gestione della sintesi "In breve" del singolo atto */}
          <BriefAdmin publication={publication} />

          {/* Allegati e link */}
          <section>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-display font-bold tracking-tight">
                Documenti e allegati
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <AlboLink attachments={publication.attachments} />
            </div>
          </section>

          {/* Storia collegata */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
                <GitMerge className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-display font-bold tracking-tight">
                Storia collegata
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Atti collegati quando esistono dati che permettono un collegamento
              documentale dichiarabile: via CUP, via CIG, via seduta o via
              categoria quando disponibile. Non vengono inventate relazioni non
              presenti nei dati.
            </p>

            {storiaLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </Card>
                ))}
              </div>
            ) : storia &&
              (storia.contracts.length > 0 ||
                storia.pnrrProjects.length > 0 ||
                storia.siblings.length > 0 ||
                storia.originatingSeduta !== null) ? (
              <div className="space-y-6">
                {/* Seduta di origine */}
                {storia.originatingSeduta && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Vote className="h-3.5 w-3.5" aria-hidden="true" />
                      Seduta di origine
                    </h3>
                    <Link href={`/convocazioni/${storia.originatingSeduta.id}`} className="block">
                      <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2">
                              {storia.originatingSeduta.oggetto}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {storia.originatingSeduta.pubStart && (
                                <span>{formatDate(storia.originatingSeduta.pubStart)}</span>
                              )}
                              {storia.originatingSeduta.subcategory && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 capitalize">
                                  {storia.originatingSeduta.subcategory}
                                </Badge>
                              )}
                              <span className="text-[10px] rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                                via seduta
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                )}

                {/* Contratti */}
                {storia.contracts.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Appalti e contratti ({storia.contracts.length})
                    </h3>
                    <div className="space-y-2">
                      {storia.contracts.map((c) => (
                        <Link key={c.id} href={`/contratti/${c.id}`} className="block">
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2">
                                  {c.title}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {c.cig && (
                                    <span className="font-mono">CIG {c.cig}</span>
                                  )}
                                  {c.amount > 0 && (
                                    <span>{formatEuro(c.amount)}</span>
                                  )}
                                  <span className="text-[10px] rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                                    {describeAlboMatchCriterion(c.matchedBy)}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progetti PNRR */}
                {storia.pnrrProjects.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Progetti PNRR ({storia.pnrrProjects.length})
                    </h3>
                    <div className="space-y-2">
                      {storia.pnrrProjects.map((p) => (
                        <Link key={p.id} href="/pnrr" className="block">
                          <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                            <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors">
                              {p.title}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">CUP {p.cup}</span>
                              {p.mission && <span>{p.mission}</span>}
                              <span className="text-[10px] rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                                {describeAlboMatchCriterion(p.matchedBy)}
                              </span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delibere collegate — risultati/esiti */}
                {storia.siblings.filter((s) => s.category === "delibera").length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      Delibere collegate ({storia.siblings.filter((s) => s.category === "delibera").length})
                    </h3>
                    <div className="space-y-2">
                      {storia.siblings
                        .filter((s) => s.category === "delibera")
                        .map((s) => (
                          <Link key={s.id} href={`/albo/${s.id}`} className="block">
                            <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2">
                                    {s.oggetto}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {s.pubStart && <span>{formatDate(s.pubStart)}</span>}
                                    <span className="text-[10px] rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                                      {describeAlboMatchCriterion(s.matchedBy)}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </div>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Altri atti dello stesso filone */}
                {storia.siblings.filter((s) => s.category !== "delibera").length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <GitMerge className="h-3.5 w-3.5" aria-hidden="true" />
                      Altri atti dello stesso filone ({storia.siblings.filter((s) => s.category !== "delibera").length})
                    </h3>
                    <div className="space-y-2">
                      {storia.siblings
                        .filter((s) => s.category !== "delibera")
                        .map((s) => (
                          <Link key={s.id} href={`/albo/${s.id}`} className="block">
                            <Card className="group p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand/40">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm leading-snug group-hover:text-brand transition-colors line-clamp-2">
                                    {s.oggetto}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                      {s.tipologia}
                                    </Badge>
                                    {s.pubStart && (
                                      <span>{formatDate(s.pubStart)}</span>
                                    )}
                                    <span className="text-[10px] rounded border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                                      {describeAlboMatchCriterion(s.matchedBy)}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </div>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Empty className="border border-dashed bg-muted/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AlertCircle aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>Nessun collegamento trovato</EmptyTitle>
                  <EmptyDescription>
                    Non sono stati trovati atti collegabili a questa pubblicazione
                    con i dati oggi disponibili. Nelle prossime versioni il
                    collegamento degli atti potrà unire deliberazioni, determinazioni,
                    liquidazioni e documenti collegati senza inventare relazioni.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </section>
        </div>
      )}
    </div>
  );
}


function StructuredActProfile({ publication }: { publication: Publication }) {
  const extractionText = alboExtractionText([
    publication.oggetto,
    publication.brief,
    publication.provenienza,
  ]);
  const cigs = extractAlboCigs(extractionText);
  const amount = extractAlboAmount(extractionText);
  const hasBeneficiary = hasAlboBeneficiarySignal(extractionText);
  const source = getAlboSourceInfo(publication.attachments);
  const hasReliableProgressivo = isReliableAlboProgressivo(publication.progressivo);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-brand">
          <Hash className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-display font-bold tracking-tight">
          Scheda strutturata dell'atto
        </h2>
      </div>

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        I campi marcati come estratti, segnali rilevati, arricchiti o da verificare
        derivano dal testo della pubblicazione, da classificazioni automatiche o
        da dati incompleti: devono essere controllati sulla fonte prima di usarli
        come certezza ufficiale.
      </div>

      <dl className="grid gap-3 md:grid-cols-2">
        <ProfileField label="ID interno" value={<span className="font-mono">{publication.id}</span>} status="official" />
        <ProfileField
          label="Numero pubblicazione Albo"
          value={
            publication.progressivo ? (
              <span className="font-mono">{publication.progressivo}</span>
            ) : (
              unavailable("Da verificare")
            )
          }
          status={hasReliableProgressivo ? "official" : "to-verify"}
        />
        <ProfileField label="Tipo / categoria atto" value={`${publication.tipologia} · ${publication.category}`} status="official" />
        <ProfileField label="Numero atto" value={publication.numRegGen ? <span className="font-mono">Reg. gen. {publication.numRegGen}</span> : unavailable()} status={publication.numRegGen ? "official" : "to-verify"} />
        <ProfileField label="Data atto" value={publication.dataAtto ? formatDate(publication.dataAtto) : unavailable()} status={publication.dataAtto ? "official" : "to-verify"} />
        <ProfileField label="Inizio pubblicazione" value={publication.pubStart ? formatDate(publication.pubStart) : unavailable()} status={publication.pubStart ? "official" : "to-verify"} />
        <ProfileField label="Fine pubblicazione" value={publication.pubEnd ? formatDate(publication.pubEnd) : unavailable()} status={publication.pubEnd ? "official" : "to-verify"} />
        <ProfileField label="Settore / ufficio competente" value={publication.provenienza ? <span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5" aria-hidden="true" />{publication.provenienza}</span> : unavailable()} status={publication.provenienza ? "official" : "to-verify"} />
        <ProfileField label="Oggetto" value={publication.oggetto} status="official" />
        <ProfileField label="Tema civico" value={<MacrotemaBadge macrotema={publication.macrotema} />} status="enriched" />
        <ProfileField label="CIG" value={cigs.length ? <span className="font-mono">{cigs.join(", ")}</span> : unavailable("Non rilevato")} status={cigs.length ? "extracted" : "to-verify"} />
        <ProfileField label="CUP" value={(publication.cups ?? []).length ? <span className="font-mono">{publication.cups.join(", ")}</span> : unavailable("Non rilevato")} status={(publication.cups ?? []).length ? "extracted" : "to-verify"} />
        <ProfileField label="Importo" value={amount ? <span className="inline-flex items-center gap-1"><BadgeEuro className="h-3.5 w-3.5" aria-hidden="true" />{amount}</span> : unavailable("Non rilevato")} status={amount ? "extracted" : "to-verify"} />
        <ProfileField label="Beneficiario / operatore" value={hasBeneficiary ? <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" aria-hidden="true" />segnale testuale, non identificazione certa</span> : unavailable("Non rilevato")} status={hasBeneficiary ? "signal" : "to-verify"} />
        <ProfileField
          label={source.isPunctual ? "Fonte puntuale" : "Fonte Albo"}
          value={
            <span className="flex flex-col gap-1">
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2 hover:text-brand">
                {source.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <span className="text-xs text-muted-foreground">{source.description}</span>
            </span>
          }
          status={source.isPunctual ? "official" : "to-verify"}
        />
      </dl>
    </section>
  );
}

function isAuthError(error: unknown): boolean {
  const s = (error as { status?: number } | null)?.status;
  return s === 401 || s === 403;
}

// Pannello di redazione per la sintesi "In breve" del singolo atto. Visibile solo
// a chi ha già effettuato l'accesso all'area redazione (token in sessionStorage,
// la stessa chiave usata dalle altre pagine Admin). Permette di rigenerare la
// sintesi AI o di scriverla/sostituirla a mano.
function BriefAdmin({ publication }: { publication: Publication }) {
  const token = readStoredToken();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(publication.brief ?? "");

  const authRequest = {
    request: { headers: { Authorization: `Bearer ${token}` } },
  };

  const regenerate = useRegeneratePublicationBrief(authRequest);
  const save = useSetPublicationBrief(authRequest);

  if (!token) return null;

  const id = publication.id;
  const busy = regenerate.isPending || save.isPending;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetPublicationQueryKey(id) });
  };

  const handleAuthError = () => {
    toast.error("Sessione scaduta o token non valido", {
      description: "Effettua di nuovo l'accesso dall'area redazione.",
    });
  };

  const handleRegenerate = () => {
    regenerate.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Sintesi rigenerata");
          setEditing(false);
          refresh();
        },
        onError: (error) => {
          if (isAuthError(error)) {
            handleAuthError();
            return;
          }
          const s = (error as { status?: number } | null)?.status;
          if (s === 409) {
            toast.error("Generazione già in corso per questo atto", {
              description: "Attendi qualche istante e riprova.",
            });
            return;
          }
          if (s === 503) {
            toast.error("Generazione AI non configurata", {
              description:
                "Le chiavi del servizio AI non sono impostate sul server.",
            });
            return;
          }
          if (s === 502) {
            toast.error("Il servizio AI non ha restituito una sintesi", {
              description: "Riprova più tardi.",
            });
            return;
          }
          toast.error("Impossibile rigenerare la sintesi");
        },
      },
    );
  };

  const handleSave = () => {
    save.mutate(
      { id, data: { brief: draft } },
      {
        onSuccess: (updated) => {
          toast.success(
            updated.brief
              ? "Sintesi salvata a mano"
              : "Sintesi azzerata (tornerà automatica)",
          );
          setEditing(false);
          refresh();
        },
        onError: (error) => {
          if (isAuthError(error)) {
            handleAuthError();
            return;
          }
          toast.error("Impossibile salvare la sintesi");
        },
      },
    );
  };

  return (
    <section
      className="rounded-xl border border-dashed border-brand/30 bg-muted/20 p-4 md:p-5"
      data-testid="brief-admin"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-display font-bold text-foreground">
          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
          Redazione · Sintesi “In breve”
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {publication.brief ? (
            <Badge
              variant={publication.briefManual ? "secondary" : "outline"}
              className="text-[10px]"
              data-testid="badge-brief-source"
            >
              {publication.briefManual ? "Scritta a mano" : "Generata AI"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Nessuna sintesi
            </Badge>
          )}
          {publication.briefGeneratedAt && (
            <span>agg. {formatDate(publication.briefGeneratedAt)}</span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Scrivi una sintesi in linguaggio semplice (2-3 frasi). Lascia vuoto per tornare alla generazione automatica."
            aria-label="Testo della sintesi In breve"
            data-testid="textarea-brief"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="brand"
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={busy}
              data-testid="button-save-brief"
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Salva a mano
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                setDraft(publication.brief ?? "");
                setEditing(false);
              }}
              disabled={busy}
              data-testid="button-cancel-brief"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Annulla
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Salvando un testo la sintesi viene marcata come “scritta a mano” e la
            generazione automatica non la sovrascrive. Salva un testo vuoto per
            tornare alla sintesi automatica.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRegenerate}
            disabled={busy}
            data-testid="button-regenerate-brief"
          >
            {regenerate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            )}
            Rigenera con l'AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              setDraft(publication.brief ?? "");
              setEditing(true);
            }}
            disabled={busy}
            data-testid="button-edit-brief"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {publication.brief ? "Modifica a mano" : "Scrivi a mano"}
          </Button>
        </div>
      )}
    </section>
  );
}
