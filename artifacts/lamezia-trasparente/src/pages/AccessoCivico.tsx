import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useListAccessoCivico,
  useCreateAccessoCivico,
  getListAccessoCivicoQueryKey,
  type AccessoCivicoRequest,
  type AccessoCivicoStato,
  type AccessoCivicoTipo,
  type ListAccessoCivicoParams,
} from "@workspace/api-client-react";
import {
  FileSearch,
  Info,
  Scale,
  ShieldCheck,
  Sparkles,
  Copy,
  Download,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarDays,
  FileText,
  ExternalLink,
  Landmark,
  User,
  FileX,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card as UICard,
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

const DEFAULT_ENTE = "Comune di Lamezia Terme";

const TIPO_LABELS: Record<AccessoCivicoTipo, string> = {
  generalizzato: "Accesso civico generalizzato (FOIA)",
  semplice: "Accesso civico semplice",
  documentale: "Accesso documentale (l. 241/1990)",
};

const TIPO_SHORT: Record<AccessoCivicoTipo, string> = {
  generalizzato: "Generalizzato",
  semplice: "Semplice",
  documentale: "Documentale",
};

// Riferimenti normativi per ciascun tipo di accesso, usati sia nell'info
// page sia nel testo precompilato della richiesta.
const TIPO_NORME: Record<AccessoCivicoTipo, string> = {
  generalizzato:
    "art. 5, comma 2, del d.lgs. 14 marzo 2013, n. 33 (accesso civico generalizzato)",
  semplice:
    "art. 5, comma 1, del d.lgs. 14 marzo 2013, n. 33 (accesso civico semplice)",
  documentale:
    "artt. 22 e seguenti della legge 7 agosto 1990, n. 241 (accesso documentale)",
};

const STATO_META: Record<
  AccessoCivicoStato,
  { label: string; className: string; icon: typeof Clock }
> = {
  "in-attesa": {
    label: "In attesa",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Clock,
  },
  accolta: {
    label: "Accolta",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rifiutata: {
    label: "Rifiutata",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMM yyyy", { locale: it });
}

function StatoBadge({ stato }: { stato: AccessoCivicoStato }) {
  const meta = STATO_META[stato];
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] ${meta.className}`}
      data-testid={`badge-stato-${stato}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

// Costruisce il testo della richiesta a partire dai campi del generatore.
function buildRequestText(input: {
  tipo: AccessoCivicoTipo;
  ente: string;
  oggetto: string;
  descrizione: string;
  requesterName: string;
}): string {
  const ente = input.ente.trim() || DEFAULT_ENTE;
  const norma = TIPO_NORME[input.tipo];
  const dati =
    input.descrizione.trim() ||
    "[indicare i dati, le informazioni o i documenti richiesti]";
  const oggetto = input.oggetto.trim() || "[oggetto della richiesta]";
  const firma = input.requesterName.trim() || "[Nome e cognome del richiedente]";

  const intro =
    input.tipo === "documentale"
      ? `Il/la sottoscritto/a, in qualità di soggetto interessato e titolare di un interesse diretto, concreto e attuale, ai sensi degli ${norma}, chiede di poter accedere ai seguenti documenti amministrativi:`
      : `Il/la sottoscritto/a, ai sensi dell'${norma}, non essendo necessaria alcuna motivazione, chiede di poter accedere ai seguenti dati/documenti:`;

  return [
    `Spett.le ${ente}`,
    `Responsabile della trasparenza / Ufficio competente`,
    "",
    `OGGETTO: Richiesta di accesso civico — ${oggetto}`,
    "",
    intro,
    "",
    dati,
    "",
    `Si chiede che la presente istanza sia riscontrata nei termini di legge (di norma 30 giorni). Si indica come modalità preferita per la trasmissione dei dati/documenti la posta elettronica.`,
    "",
    `In caso di diniego, totale o parziale, o di mancata risposta, ci si riserva di presentare richiesta di riesame al titolare del potere sostitutivo e, ove previsto, al Responsabile della prevenzione della corruzione e della trasparenza (RPCT).`,
    "",
    `Distinti saluti.`,
    "",
    firma,
    `Data: ${format(new Date(), "dd/MM/yyyy")}`,
  ].join("\n");
}

function InfoSection() {
  const cards: {
    tipo: AccessoCivicoTipo;
    desc: string;
  }[] = [
    {
      tipo: "generalizzato",
      desc: "Chiunque può chiedere dati e documenti detenuti dalla pubblica amministrazione, ulteriori rispetto a quelli già pubblicati, senza dover motivare la richiesta.",
    },
    {
      tipo: "semplice",
      desc: "Permette di chiedere la pubblicazione di documenti, informazioni o dati che l'ente avrebbe dovuto pubblicare per obbligo di legge e non ha pubblicato.",
    },
    {
      tipo: "documentale",
      desc: "Riservato a chi ha un interesse diretto, concreto e attuale: consente di accedere a specifici documenti amministrativi che riguardano la propria situazione.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.tipo} className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2 text-brand">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-semibold">{TIPO_LABELS[c.tipo]}</span>
          </div>
          <p className="text-sm text-muted-foreground">{c.desc}</p>
          <p className="mt-auto pt-2 text-[11px] font-medium text-muted-foreground">
            Rif. {TIPO_NORME[c.tipo]}
          </p>
        </Card>
      ))}
    </div>
  );
}

type GeneratorState = {
  tipo: AccessoCivicoTipo;
  ente: string;
  oggetto: string;
  descrizione: string;
  requesterName: string;
  stato: AccessoCivicoStato;
  esitoNote: string;
  responseDate: string;
};

const EMPTY_GENERATOR: GeneratorState = {
  tipo: "generalizzato",
  ente: DEFAULT_ENTE,
  oggetto: "",
  descrizione: "",
  requesterName: "",
  stato: "in-attesa",
  esitoNote: "",
  responseDate: "",
};

function GeneratorSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<GeneratorState>(EMPTY_GENERATOR);
  const [registerPublicly, setRegisterPublicly] = useState(false);

  const createRequest = useCreateAccessoCivico();

  const text = useMemo(() => buildRequestText(form), [form]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Testo copiato negli appunti.");
    } catch {
      toast.error("Impossibile copiare il testo.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safe = (form.oggetto.trim() || "richiesta-accesso-civico")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    a.download = `${safe || "richiesta-accesso-civico"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.oggetto.trim()) {
      toast.error("Indica l'oggetto della richiesta.");
      return;
    }
    try {
      await createRequest.mutateAsync({
        data: {
          oggetto: form.oggetto.trim(),
          tipo: form.tipo,
          ente: form.ente.trim() || DEFAULT_ENTE,
          descrizione: form.descrizione.trim(),
          requestText: text,
          requesterName: form.requesterName.trim() || null,
          requestDate: new Date().toISOString(),
          stato: form.stato,
          esitoNote: form.esitoNote.trim(),
          responseDate:
            form.stato !== "in-attesa" && form.responseDate
              ? new Date(form.responseDate).toISOString()
              : null,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getListAccessoCivicoQueryKey(),
      });
      toast.success("Richiesta registrata.", {
        description:
          "Sarà visibile nel registro pubblico dopo la verifica della redazione.",
      });
      setRegisterPublicly(false);
    } catch {
      toast.error("Registrazione non riuscita. Riprova.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <UICard className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-5 w-5 text-brand" /> Genera la tua richiesta
          </CardTitle>
          <CardDescription>
            Compila i campi: il testo della richiesta, con i riferimenti
            normativi corretti, viene generato automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo di accesso</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, tipo: v as AccessoCivicoTipo }))
                }
              >
                <SelectTrigger data-testid="generator-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_LABELS) as AccessoCivicoTipo[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gen-ente">Ente destinatario</Label>
              <Input
                id="gen-ente"
                value={form.ente}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ente: e.target.value }))
                }
                placeholder={DEFAULT_ENTE}
                data-testid="generator-ente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gen-oggetto">Oggetto della richiesta</Label>
              <Input
                id="gen-oggetto"
                value={form.oggetto}
                onChange={(e) =>
                  setForm((p) => ({ ...p, oggetto: e.target.value }))
                }
                placeholder="es. Spese per la manutenzione del verde pubblico 2025"
                data-testid="generator-oggetto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gen-descrizione">
                Dati / documenti richiesti
              </Label>
              <Textarea
                id="gen-descrizione"
                value={form.descrizione}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descrizione: e.target.value }))
                }
                placeholder="Descrivi con precisione i dati o i documenti che vuoi ottenere."
                className="min-h-[90px]"
                data-testid="generator-descrizione"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gen-nome">Nome e cognome (facoltativo)</Label>
              <Input
                id="gen-nome"
                value={form.requesterName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, requesterName: e.target.value }))
                }
                placeholder="Come firmare la richiesta"
                data-testid="generator-nome"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="brand"
                className="gap-2"
                onClick={handleCopy}
                data-testid="button-copy"
              >
                <Copy className="h-4 w-4" /> Copia testo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleDownload}
                data-testid="button-download"
              >
                <Download className="h-4 w-4" /> Scarica .txt
              </Button>
            </div>

            <div className="rounded-lg border border-dashed border-brand/30 bg-brand/5 p-4">
              {registerPublicly ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Hai già inviato questa richiesta all'ente? Registrala nel
                    registro pubblico per dare conto dell'esito. Sarà visibile
                    dopo la verifica della redazione.
                  </p>
                  <div className="space-y-2">
                    <Label>Esito della richiesta</Label>
                    <Select
                      value={form.stato}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          stato: v as AccessoCivicoStato,
                        }))
                      }
                    >
                      <SelectTrigger data-testid="register-stato">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-attesa">In attesa</SelectItem>
                        <SelectItem value="accolta">Accolta</SelectItem>
                        <SelectItem value="rifiutata">Rifiutata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.stato !== "in-attesa" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="register-esitonote">
                          Note sull'esito (facoltativo)
                        </Label>
                        <Textarea
                          id="register-esitonote"
                          value={form.esitoNote}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              esitoNote: e.target.value,
                            }))
                          }
                          placeholder="Com'è andata? Cosa ha risposto l'ente?"
                          className="min-h-[60px]"
                          data-testid="register-esitonote"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-responsedate">
                          Data della risposta (facoltativo)
                        </Label>
                        <Input
                          id="register-responsedate"
                          type="date"
                          value={form.responseDate}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              responseDate: e.target.value,
                            }))
                          }
                          data-testid="register-responsedate"
                        />
                      </div>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Hai ricevuto un documento di risposta dall'ente? Indicalo
                    nelle note: la redazione potrà allegarlo al registro.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      variant="brand"
                      className="gap-2"
                      disabled={createRequest.isPending}
                      data-testid="button-register-confirm"
                    >
                      <Send className="h-4 w-4" />
                      {createRequest.isPending
                        ? "Invio…"
                        : "Registra nel registro"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setRegisterPublicly(false)}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium text-brand"
                  onClick={() => setRegisterPublicly(true)}
                  data-testid="button-register-open"
                >
                  <Send className="h-4 w-4" />
                  Hai già inviato questa richiesta? Registrala nel registro
                  pubblico
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </UICard>

      <UICard className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <FileText className="h-5 w-5 text-brand" /> Anteprima
          </CardTitle>
          <CardDescription>
            Testo pronto da copiare o scaricare e inviare all'ente (via PEC o
            email).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre
            className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed"
            data-testid="generator-preview"
          >
            {text}
          </pre>
        </CardContent>
      </UICard>
    </div>
  );
}

function RegistrySection() {
  const [stato, setStato] = useState<string>("all");
  const [tipo, setTipo] = useState<string>("all");

  const params = useMemo(() => {
    const p: ListAccessoCivicoParams = {};
    if (stato !== "all") p.stato = stato as AccessoCivicoStato;
    if (tipo !== "all") p.tipo = tipo as AccessoCivicoTipo;
    return p;
  }, [stato, tipo]);

  const { data: requests, isLoading } = useListAccessoCivico(params);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={stato} onValueChange={setStato}>
          <SelectTrigger className="w-[180px]" data-testid="filter-stato">
            <SelectValue placeholder="Esito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli esiti</SelectItem>
            <SelectItem value="in-attesa">In attesa</SelectItem>
            <SelectItem value="accolta">Accolte</SelectItem>
            <SelectItem value="rifiutata">Rifiutate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-[220px]" data-testid="filter-tipo">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            {(Object.keys(TIPO_SHORT) as AccessoCivicoTipo[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TIPO_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessuna richiesta nel registro</EmptyTitle>
            <EmptyDescription>
              Non ci sono richieste che corrispondono ai filtri selezionati.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: AccessoCivicoRequest }) {
  const docUrl = request.responseUrl
    ? request.responseUrl.startsWith("/objects/") ||
      request.responseUrl.startsWith("/api/storage")
      ? request.responseUrl.startsWith("/api/storage")
        ? request.responseUrl
        : `/api/storage${request.responseUrl}`
      : request.responseUrl
    : null;

  const isRegistroUfficiale = request.origine === "registro-ufficiale";
  // Esito concluso (accolta/rifiutata) ma senza documento allegato: tipico
  // delle voci importate dal registro ufficiale, dove la risposta non è online.
  const documentoNonDisponibile =
    !docUrl && request.stato !== "in-attesa";

  return (
    <Card
      className="flex h-full flex-col gap-3 p-5"
      data-testid={`card-request-${request.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatoBadge stato={request.stato} />
        <Badge variant="secondary" className="text-[10px]">
          {TIPO_SHORT[request.tipo]}
        </Badge>
        {isRegistroUfficiale ? (
          request.fonteUrl ? (
            <a
              href={request.fonteUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`badge-origine-${request.id}`}
            >
              <Badge
                variant="outline"
                className="gap-1 border-brand/40 bg-brand/10 text-[10px] text-brand hover:bg-brand/20"
              >
                <Landmark className="h-3 w-3" />
                Registro ufficiale del Comune
              </Badge>
            </a>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-brand/40 bg-brand/10 text-[10px] text-brand"
              data-testid={`badge-origine-${request.id}`}
            >
              <Landmark className="h-3 w-3" />
              Registro ufficiale del Comune
            </Badge>
          )
        ) : (
          <Badge
            variant="outline"
            className="gap-1 text-[10px] text-muted-foreground"
            data-testid={`badge-origine-${request.id}`}
          >
            <User className="h-3 w-3" />
            Richiesta da cittadino
          </Badge>
        )}
      </div>

      <h3 className="font-display text-base font-semibold leading-tight">
        {request.oggetto}
      </h3>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{request.ente}</span>
      </div>

      {request.descrizione?.trim() && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {request.descrizione}
        </p>
      )}

      {request.esitoNote?.trim() && (
        <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          {request.esitoNote}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Inviata
          </span>
          <span className="font-medium">{formatDate(request.requestDate)}</span>
        </div>
        {request.responseDate && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Risposta
            </span>
            <span className="font-medium">
              {formatDate(request.responseDate)}
            </span>
          </div>
        )}
        {request.requesterName?.trim() && (
          <div className="text-muted-foreground">
            Richiedente: {request.requesterName}
          </div>
        )}
        {docUrl ? (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 pt-1 font-medium text-brand"
            data-testid={`link-document-${request.id}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {request.responseLabel?.trim() || "Documento di risposta"}
          </a>
        ) : documentoNonDisponibile ? (
          <p
            className="flex items-center gap-1 pt-1 text-muted-foreground"
            data-testid={`doc-unavailable-${request.id}`}
          >
            <FileX className="h-3.5 w-3.5 shrink-0" />
            Documento di risposta non disponibile
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function AccessoCivico() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <FileSearch className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Diritto di accesso
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Sportello Accesso Civico
        </h1>
        <p className="text-muted-foreground">
          L'accesso civico generalizzato (FOIA) permette a chiunque di chiedere
          dati e documenti alla pubblica amministrazione, senza dover spiegare
          il perché. Qui trovi una guida, un assistente che prepara la richiesta
          al posto tuo e un registro pubblico delle richieste inviate e dei loro
          esiti.
        </p>
      </div>

      <section data-tour="accesso-civico-intro" className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold">
          Come funziona
        </h2>
        <InfoSection />
        <Card className="mt-4 flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-sm text-muted-foreground">
            L'ente deve rispondere di norma entro 30 giorni. In caso di diniego o
            silenzio puoi chiedere il riesame al Responsabile della prevenzione
            della corruzione e della trasparenza (RPCT). Questo sportello non
            invia la richiesta al posto tuo né fornisce consulenza legale: ti
            aiuta a preparare il testo e a tenerne traccia pubblica.
          </p>
        </Card>
      </section>

      <section data-tour="accesso-civico-new" className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold">
          Assistente alla richiesta
        </h2>
        <GeneratorSection />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <h2 className="font-display text-xl font-semibold">
            Registro pubblico delle richieste
          </h2>
        </div>
        <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
          Le richieste di accesso civico inviate al Comune, con il relativo
          esito ed eventuale documento di risposta. Il registro raccoglie sia le
          richieste tracciate dai cittadini sia lo storico importato dal Registro
          ufficiale degli accessi del Comune.
        </p>
        <RegistrySection />
      </section>
    </div>
  );
}
