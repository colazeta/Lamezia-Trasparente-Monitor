import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetContractStoryline,
  getGetContractStorylineQueryKey,
  useListPnrrProjects,
  getListPnrrProjectsQueryKey,
  useCreateMonitoringReport,
  useRequestMonitoringReportUploadUrl,
  type MonitoringReportInputOverallAssessment,
  type MonitoringReportAttachment,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Telescope,
  FileText,
  Landmark,
  Search,
  Gauge,
  Sparkles,
  Loader2,
  Send,
  FileUp,
  Paperclip,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { apiUrl } from "@/lib/apiBaseUrl";

const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];
const MAX_ATTACHMENT_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const MIN_PHASE_LENGTH = 20;

const PHASES = [
  {
    key: "deskAnalysis" as const,
    icon: Search,
    title: "Analisi desk",
    description:
      "Cosa prevedeva il progetto e cosa risulta dai documenti ufficiali.",
    hints: [
      "Quali erano gli obiettivi dichiarati del progetto?",
      "Quante risorse erano previste e da quale fonte?",
      "Quali documenti hai consultato (delibere, determine, schede ufficiali)?",
    ],
    placeholder:
      "Descrivi cosa prevedeva il progetto sulla carta e cosa emerge dai documenti…",
  },
  {
    key: "effectivenessEvaluation" as const,
    icon: Gauge,
    title: "Valutazione di efficacia",
    description:
      "Il progetto sta rispondendo ai bisogni per cui era stato pensato?",
    hints: [
      "Il progetto risponde a un bisogno reale del territorio?",
      "I tempi e le modalità di attuazione sono stati rispettati?",
      "Ci sono stati ostacoli, ritardi o criticità?",
    ],
    placeholder:
      "Valuta se il progetto sta funzionando rispetto agli obiettivi…",
  },
  {
    key: "impactResults" as const,
    icon: Sparkles,
    title: "Impatto e risultati",
    description:
      "Quali effetti concreti si vedono sul territorio e sulle persone.",
    hints: [
      "Quali cambiamenti concreti hai osservato?",
      "Chi ne ha beneficiato e in che modo?",
      "Cosa potrebbe essere migliorato?",
    ],
    placeholder:
      "Racconta gli effetti reali del progetto su persone e territorio…",
  },
];

const ASSESSMENT_OPTIONS: {
  value: MonitoringReportInputOverallAssessment;
  label: string;
  icon: typeof ThumbsUp;
  className: string;
}[] = [
  {
    value: "positivo",
    label: "Positivo",
    icon: ThumbsUp,
    className:
      "data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800 dark:data-[active=true]:bg-emerald-500/15 dark:data-[active=true]:text-emerald-300",
  },
  {
    value: "neutro",
    label: "Neutro",
    icon: Minus,
    className:
      "data-[active=true]:border-slate-400 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-800 dark:data-[active=true]:bg-slate-500/15 dark:data-[active=true]:text-slate-200",
  },
  {
    value: "critico",
    label: "Critico",
    icon: ThumbsDown,
    className:
      "data-[active=true]:border-rose-500 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-800 dark:data-[active=true]:bg-rose-500/15 dark:data-[active=true]:text-rose-300",
  },
];

type PhaseKey = (typeof PHASES)[number]["key"];

export function MonitoraggioNuovo() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const contractIdRaw = params.get("contractId");
  const pnrrProjectIdRaw = params.get("pnrrProjectId");

  const contractId = contractIdRaw ? Number(contractIdRaw) : NaN;
  const pnrrProjectId = pnrrProjectIdRaw ? Number(pnrrProjectIdRaw) : NaN;

  const hasContract = !Number.isNaN(contractId);
  const hasPnrr = !Number.isNaN(pnrrProjectId);

  const contractQuery = useGetContractStoryline(contractId, {
    query: {
      enabled: hasContract,
      queryKey: getGetContractStorylineQueryKey(contractId),
    },
  });

  const pnrrQuery = useListPnrrProjects({
    query: {
      enabled: hasPnrr,
      queryKey: getListPnrrProjectsQueryKey(),
    },
  });

  const pnrrProject = useMemo(() => {
    if (!hasPnrr) return null;
    return (
      pnrrQuery.data?.projects.find((p) => p.id === pnrrProjectId) ?? null
    );
  }, [hasPnrr, pnrrQuery.data, pnrrProjectId]);

  if (!hasContract && !hasPnrr) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <BackLink />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Telescope className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Scegli prima un progetto da monitorare</EmptyTitle>
            <EmptyDescription>
              Avvia un report dalla scheda di un appalto o dalla pagina dei
              progetti PNRR.
            </EmptyDescription>
          </EmptyHeader>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/contratti">
                <FileText className="h-4 w-4" />
                Vai agli appalti
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/pnrr">
                <Landmark className="h-4 w-4" />
                Vai ai progetti PNRR
              </Link>
            </Button>
          </div>
        </Empty>
      </div>
    );
  }

  const loading =
    (hasContract && contractQuery.isLoading) ||
    (hasPnrr && pnrrQuery.isLoading);

  const subjectTitle = hasContract
    ? contractQuery.data?.contract.title
    : pnrrProject?.title;
  const subjectCig = hasContract ? contractQuery.data?.contract.cig : null;
  const subjectCup = hasContract
    ? contractQuery.data?.contract.cup
    : pnrrProject?.cup;
  const subjectMissing =
    (hasContract && contractQuery.isError) ||
    (hasPnrr && !pnrrQuery.isLoading && !pnrrProject);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <BackLink />
      {subjectMissing ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Telescope className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Progetto non trovato</EmptyTitle>
            <EmptyDescription>
              Il progetto da monitorare non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MonitoraggioForm
          subjectType={hasContract ? "contract" : "pnrr"}
          contractId={hasContract ? contractId : undefined}
          pnrrProjectId={hasPnrr ? pnrrProjectId : undefined}
          subjectTitle={subjectTitle}
          subjectCig={subjectCig}
          subjectCup={subjectCup}
          loading={loading}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/monitoraggio"
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Torna ai report
    </Link>
  );
}

type PhaseTexts = Record<PhaseKey, string>;

function MonitoraggioForm({
  subjectType,
  contractId,
  pnrrProjectId,
  subjectTitle,
  subjectCig,
  subjectCup,
  loading,
}: {
  subjectType: "contract" | "pnrr";
  contractId?: number;
  pnrrProjectId?: number;
  subjectTitle?: string | null;
  subjectCig?: string | null;
  subjectCup?: string | null;
  loading: boolean;
}) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [phases, setPhases] = useState<PhaseTexts>({
    deskAnalysis: "",
    effectivenessEvaluation: "",
    impactResults: "",
  });
  const [assessment, setAssessment] =
    useState<MonitoringReportInputOverallAssessment | null>(null);
  const [attachments, setAttachments] = useState<MonitoringReportAttachment[]>(
    [],
  );
  const [uploading, setUploading] = useState(false);

  const createReport = useCreateMonitoringReport();
  const requestUploadUrl = useRequestMonitoringReportUploadUrl();

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error("Hai raggiunto il numero massimo di allegati (10).");
      return;
    }
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      toast.error("Tipo di file non supportato", {
        description: "Usa immagini (JPG, PNG…) o documenti PDF/Office.",
      });
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error("File troppo grande", {
        description: "La dimensione massima è 15 MB.",
      });
      return;
    }

    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed with status ${putRes.status}`);
      }
      const storagePath = apiUrl(`/api/storage${objectPath}`);
      setAttachments((prev) => [
        ...prev,
        { title: file.name, url: storagePath, contentType: file.type },
      ]);
      toast.success("File allegato.");
    } catch {
      toast.error("Caricamento non riuscito", {
        description: "Non è stato possibile caricare il file. Riprova.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5) {
      toast.error("Il titolo deve avere almeno 5 caratteri.");
      return;
    }
    for (const phase of PHASES) {
      if (phases[phase.key].trim().length < MIN_PHASE_LENGTH) {
        toast.error(`La fase "${phase.title}" è troppo breve`, {
          description: `Scrivi almeno ${MIN_PHASE_LENGTH} caratteri.`,
        });
        return;
      }
    }
    if (!assessment) {
      toast.error("Seleziona un giudizio complessivo.");
      return;
    }

    try {
      const created = await createReport.mutateAsync({
        data: {
          subjectType,
          contractId,
          pnrrProjectId,
          title: trimmedTitle,
          authorName: authorName.trim() ? authorName.trim() : undefined,
          deskAnalysis: phases.deskAnalysis.trim(),
          effectivenessEvaluation: phases.effectivenessEvaluation.trim(),
          impactResults: phases.impactResults.trim(),
          overallAssessment: assessment,
          attachments,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/monitoring-reports"] });
      toast.success("Report inviato!", {
        description:
          "Sarà pubblicato dopo la verifica della redazione. Grazie per il tuo contributo.",
      });
      navigate(
        subjectType === "contract" && contractId != null
          ? `/contratti/${contractId}`
          : "/monitoraggio",
      );
      void created;
    } catch {
      toast.error("Invio non riuscito", {
        description: "Controlla i dati e riprova.",
      });
    }
  };

  const submitting = createReport.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-brand">
          <Telescope className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Nuovo report di monitoraggio
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Monitora un progetto
        </h1>
        <p className="text-muted-foreground">
          Rispondi alle domande guida in tre fasi. Il report sarà pubblicato
          dopo la verifica della redazione.
        </p>
      </header>

      {/* Progetto monitorato */}
      <div className="rounded-2xl border border-border bg-muted/40 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {subjectType === "pnrr" ? (
            <Landmark className="h-3.5 w-3.5" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          Progetto monitorato
        </div>
        {loading ? (
          <p className="mt-2 text-sm text-muted-foreground">Caricamento…</p>
        ) : (
          <>
            <p className="mt-1.5 font-medium">{subjectTitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs shadow-none">
                {subjectType === "pnrr" ? "Progetto PNRR" : "Appalto"}
              </Badge>
              {subjectCig ? (
                <Badge
                  variant="outline"
                  className="font-mono text-xs shadow-none"
                >
                  CIG {subjectCig}
                </Badge>
              ) : null}
              {subjectCup ? (
                <Badge
                  variant="outline"
                  className="font-mono text-xs shadow-none"
                >
                  CUP {subjectCup}
                </Badge>
              ) : null}
            </div>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Informazioni generali
          </CardTitle>
          <CardDescription>
            Dai un titolo al report e indica, se vuoi, il tuo nome.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mr-title">Titolo del report *</Label>
            <Input
              id="mr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              placeholder="es. Il nuovo parco è davvero accessibile?"
              data-testid="input-mr-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-author">Il tuo nome (facoltativo)</Label>
            <Input
              id="mr-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={120}
              placeholder="es. Mario Rossi o nome dell'associazione"
              data-testid="input-mr-author"
            />
          </div>
        </CardContent>
      </Card>

      {PHASES.map((phase, i) => {
        const Icon = phase.icon;
        return (
          <Card key={phase.key}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Fase {i + 1}
                  </div>
                  <CardTitle className="font-display text-xl">
                    {phase.title}
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                {phase.hints.map((hint) => (
                  <li key={hint} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {hint}
                  </li>
                ))}
              </ul>
              <Textarea
                value={phases[phase.key]}
                onChange={(e) =>
                  setPhases((prev) => ({
                    ...prev,
                    [phase.key]: e.target.value,
                  }))
                }
                placeholder={phase.placeholder}
                className="min-h-[140px]"
                data-testid={`textarea-${phase.key}`}
              />
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Giudizio complessivo *
          </CardTitle>
          <CardDescription>
            In sintesi, com'è andato il progetto secondo il tuo monitoraggio?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {ASSESSMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = assessment === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-active={active}
                  onClick={() => setAssessment(opt.value)}
                  data-testid={`button-assessment-${opt.value}`}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 text-sm font-semibold text-muted-foreground transition-colors hover-elevate ${opt.className}`}
                >
                  <Icon className="h-6 w-6" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Allegati</CardTitle>
          <CardDescription>
            Foto o documenti a supporto del tuo monitoraggio (facoltativo, max 15
            MB ciascuno).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
              className="hidden"
              onChange={handleFileSelected}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              {uploading ? "Caricamento…" : "Allega file"}
            </Button>
          </div>
          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((att, i) => (
                <li
                  key={`${att.url}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{att.title}</span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-destructive hover:underline"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    rimuovi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="brand"
          className="gap-2"
          disabled={submitting}
          data-testid="button-submit-report"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Invia il report
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/monitoraggio">Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
