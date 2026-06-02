import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useListMonitoringReportsAdmin,
  useModerateMonitoringReport,
  useDeleteMonitoringReport,
  getListMonitoringReportsAdminQueryKey,
  type MonitoringReport,
  type MonitoringReportStatus,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Loader2,
  Telescope,
  FileText,
  Landmark,
  CheckCircle2,
  XCircle,
  Undo2,
  Trash2,
  Paperclip,
  ExternalLink,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const STATUS_META: Record<
  MonitoringReportStatus,
  { label: string; className: string }
> = {
  in_revisione: {
    label: "In revisione",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  pubblicato: {
    label: "Pubblicato",
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  rifiutato: {
    label: "Rifiutato",
    className:
      "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  },
};

const ASSESSMENT_LABEL: Record<MonitoringReport["overallAssessment"], string> = {
  positivo: "Positivo",
  neutro: "Neutro",
  critico: "Critico",
};

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminMonitoraggio() {
  const [token, setToken] = useState<string>(() => readStoredToken());

  if (!token) {
    return (
      <TokenGate
        onAuthenticated={(value) => {
          try {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, value);
          } catch {
            /* sessionStorage unavailable — keep in-memory only */
          }
          setToken(value);
        }}
      />
    );
  }

  return (
    <AdminEditor
      token={token}
      onSignOut={() => {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setToken("");
      }}
    />
  );
}

function TokenGate({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Inserisci il token di accesso.");
      return;
    }
    onAuthenticated(trimmed);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <Card className="border-brand/30 shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl">
              Area Redazione
            </CardTitle>
            <CardDescription>
              Inserisci il token di accesso per moderare i report di
              monitoraggio civico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingest-token">Token di accesso</Label>
                <Input
                  id="ingest-token"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••••••"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-label="Token di accesso redazione"
                />
              </div>
              <Button type="submit" variant="brand" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMM yyyy, HH:mm", { locale: it });
}

function AdminEditor({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const queryClient = useQueryClient();
  const authRequest = {
    request: { headers: { Authorization: `Bearer ${token}` } },
  };

  const [notes, setNotes] = useState<Record<number, string>>({});

  const {
    data: reports,
    isLoading,
    error: listError,
  } = useListMonitoringReportsAdmin({
    ...authRequest,
    query: { queryKey: getListMonitoringReportsAdminQueryKey() },
  });

  const moderate = useModerateMonitoringReport(authRequest);
  const removeReport = useDeleteMonitoringReport(authRequest);

  const isAuthError = (error: unknown): boolean => {
    const status = (error as { status?: number } | null)?.status;
    return status === 401 || status === 403;
  };

  const handleAuthError = () => {
    toast.error("Sessione scaduta o token non valido", {
      description: "Effettua di nuovo l'accesso.",
    });
    onSignOut();
  };

  if (listError && isAuthError(listError)) {
    handleAuthError();
  }

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getListMonitoringReportsAdminQueryKey(),
    });
    queryClient.invalidateQueries({ queryKey: ["/monitoring-reports"] });
  };

  const handleModerate = async (
    report: MonitoringReport,
    status: MonitoringReportStatus,
  ) => {
    try {
      await moderate.mutateAsync({
        id: report.id,
        data: {
          status,
          moderationNote: notes[report.id]?.trim()
            ? notes[report.id].trim()
            : null,
        },
      });
      toast.success(
        status === "pubblicato"
          ? "Report pubblicato."
          : status === "rifiutato"
            ? "Report rifiutato."
            : "Report rimesso in revisione.",
      );
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Operazione non riuscita.");
    }
  };

  const handleDelete = async (report: MonitoringReport) => {
    if (
      !window.confirm(
        `Eliminare definitivamente il report "${report.title}"?`,
      )
    ) {
      return;
    }
    try {
      await removeReport.mutateAsync({ id: report.id });
      toast.success("Report eliminato.");
      invalidate();
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError();
        return;
      }
      toast.error("Eliminazione non riuscita.");
    }
  };

  const busy = moderate.isPending || removeReport.isPending;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Area Redazione
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Moderazione Monitoraggio Civico
          </h1>
          <p className="text-muted-foreground">
            Verifica i report inviati dai cittadini, pubblicali o rifiutali con
            una nota.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Telescope className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nessun report da moderare</p>
            <p className="text-sm text-muted-foreground">
              I report inviati dai cittadini compariranno qui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const statusMeta = STATUS_META[report.status];
            const SubjectIcon =
              report.subjectType === "pnrr" ? Landmark : FileText;
            return (
              <Card key={report.id} data-testid={`row-report-${report.id}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      className={`text-xs shadow-none ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs shadow-none">
                      <SubjectIcon className="h-3 w-3" />
                      {report.subjectType === "pnrr" ? "PNRR" : "Appalto"}
                    </Badge>
                    <Badge variant="outline" className="text-xs shadow-none">
                      {ASSESSMENT_LABEL[report.overallAssessment]}
                    </Badge>
                    {report.cig ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs shadow-none"
                      >
                        CIG {report.cig}
                      </Badge>
                    ) : report.cup ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs shadow-none"
                      >
                        CUP {report.cup}
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="font-display text-xl">
                    {report.title}
                  </CardTitle>
                  <CardDescription>
                    {report.subjectTitle} ·{" "}
                    {report.authorName ?? "Autore anonimo"} ·{" "}
                    {formatDate(report.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PhaseBlock title="1. Analisi desk" body={report.deskAnalysis} />
                  <PhaseBlock
                    title="2. Valutazione di efficacia"
                    body={report.effectivenessEvaluation}
                  />
                  <PhaseBlock
                    title="3. Impatto e risultati"
                    body={report.impactResults}
                  />

                  {report.attachments.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Allegati
                      </p>
                      <ul className="space-y-1">
                        {report.attachments.map((att, i) => (
                          <li key={`${att.url}-${i}`}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              {att.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.moderationNote && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                      <span className="font-semibold">Nota redazione: </span>
                      {report.moderationNote}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`note-${report.id}`}>
                      Nota di moderazione (facoltativa)
                    </Label>
                    <Textarea
                      id={`note-${report.id}`}
                      value={notes[report.id] ?? report.moderationNote ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [report.id]: e.target.value,
                        }))
                      }
                      placeholder="Motivo del rifiuto o osservazioni per il cittadino…"
                      className="min-h-[70px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {report.status !== "pubblicato" && (
                      <Button
                        size="sm"
                        variant="brand"
                        className="gap-1.5"
                        disabled={busy}
                        onClick={() => handleModerate(report, "pubblicato")}
                        data-testid={`button-publish-${report.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Pubblica
                      </Button>
                    )}
                    {report.status !== "rifiutato" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={busy}
                        onClick={() => handleModerate(report, "rifiutato")}
                        data-testid={`button-reject-${report.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                        Rifiuta
                      </Button>
                    )}
                    {report.status !== "in_revisione" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        disabled={busy}
                        onClick={() => handleModerate(report, "in_revisione")}
                      >
                        <Undo2 className="h-4 w-4" />
                        Rimetti in revisione
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      disabled={busy}
                      onClick={() => handleDelete(report)}
                      data-testid={`button-delete-${report.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Elimina
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </div>
  );
}
