import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetBriefsStatus,
  useGenerateBriefs,
  getGetBriefsStatusQueryKey,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminBriefs() {
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
              Inserisci il token di accesso per generare le sintesi “In breve”
              mancanti.
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

  const {
    data: status,
    isLoading,
    isFetching,
    refetch,
  } = useGetBriefsStatus({
    ...authRequest,
    query: {
      queryKey: getGetBriefsStatusQueryKey(),
      // Mantieni aggiornato l'avanzamento mentre il batch gira in background.
      refetchInterval: (query) =>
        query.state.data?.running ? 4000 : false,
    },
  });

  const generate = useGenerateBriefs(authRequest);

  const isAuthError = (error: unknown): boolean => {
    const s = (error as { status?: number } | null)?.status;
    return s === 401 || s === 403;
  };

  const handleAuthError = () => {
    toast.error("Sessione scaduta o token non valido", {
      description: "Effettua di nuovo l'accesso.",
    });
    onSignOut();
  };

  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: getGetBriefsStatusQueryKey() });
  };

  const handleGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: (result) => {
        if (result.status === "noop") {
          toast.success("Nessun atto da elaborare", {
            description:
              result.message ?? "Tutte le sintesi sono già presenti.",
          });
        } else {
          toast.success("Generazione avviata", {
            description:
              result.message ??
              `Generazione avviata per ${result.candidates} atti. L'avanzamento si aggiorna qui automaticamente.`,
          });
        }
        refreshStatus();
      },
      onError: (error) => {
        if (isAuthError(error)) {
          handleAuthError();
          return;
        }
        const s = (error as { status?: number } | null)?.status;
        if (s === 409) {
          toast.error("Generazione già in corso", {
            description: "Attendi il completamento del batch in corso.",
          });
          refreshStatus();
          return;
        }
        if (s === 503) {
          toast.error("Generazione AI non configurata", {
            description:
              "Le chiavi del servizio AI non sono impostate sul server.",
          });
          return;
        }
        toast.error("Impossibile avviare la generazione delle sintesi");
      },
    });
  };

  const running = status?.running ?? false;
  const pending = status?.pending ?? 0;
  const withBrief = status?.withBrief ?? 0;
  const total = status?.total ?? 0;
  const coveragePct =
    total > 0 ? Math.round((withBrief / total) * 100) : 0;
  const allDone = !isLoading && pending === 0;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Area Redazione
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Sintesi “In breve”
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Genera con un clic tutte le sintesi “In breve” mancanti per gli atti
            dell'Albo Pretorio che hanno il testo completo. Le sintesi curate a
            mano non vengono mai sovrascritte.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <Card className="mb-4 border-card-border">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-display font-bold text-foreground">
                <FileText className="h-4 w-4 text-brand" />
                Copertura sintesi
              </div>
              <p
                className="mt-0.5 text-sm text-muted-foreground"
                data-testid="text-briefs-coverage"
              >
                {isLoading
                  ? "Caricamento stato…"
                  : `${withBrief} di ${total} atti con sintesi` +
                    (pending > 0
                      ? ` · ${pending} ancora da generare`
                      : " · nessuna sintesi mancante")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-status"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Aggiorna
            </Button>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={coveragePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Atti con sintesi In breve"
          >
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Genera le sintesi mancanti
          </CardTitle>
          <CardDescription>
            Avvia la generazione automatica per tutti gli atti senza sintesi. Il
            processo gira in background sul server: puoi lasciare questa pagina,
            l'avanzamento riprende quando torni.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {running ? (
            <div
              className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm text-foreground"
              data-testid="status-running"
            >
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />
              <span>
                Generazione in corso… {pending}{" "}
                {pending === 1 ? "atto" : "atti"} ancora da elaborare. Questa
                pagina si aggiorna da sola.
              </span>
            </div>
          ) : allDone ? (
            <div
              className="flex items-center gap-3 rounded-lg border border-emerald-300/60 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              data-testid="status-complete"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Tutte le sintesi sono presenti: non c'è nulla da generare.
              </span>
            </div>
          ) : null}

          <Button
            variant="brand"
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={handleGenerate}
            disabled={generate.isPending || running || isLoading || allDone}
            data-testid="button-generate-briefs"
          >
            {generate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {running
              ? "Generazione in corso…"
              : pending > 0
                ? `Genera ${pending} ${pending === 1 ? "sintesi" : "sintesi"} mancanti`
                : "Genera sintesi mancanti"}
          </Button>

          <p className="text-xs text-muted-foreground">
            La generazione usa un servizio AI con un breve ritardo tra un atto e
            l'altro per rispettare i limiti d'uso, quindi i grandi backfill
            richiedono qualche minuto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
