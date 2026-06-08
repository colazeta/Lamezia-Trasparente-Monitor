import { useMemo, useState, type ElementType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import {
  Archive,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  Link as LinkIcon,
  MapPin,
  Megaphone,
} from "lucide-react";

import {
  useCreateReport,
  useListReports,
  getListReportsQueryKey,
  type Report,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const formSchema = z.object({
  title: z.string().min(5, "Il titolo deve avere almeno 5 caratteri").max(100),
  description: z
    .string()
    .min(20, "La descrizione deve essere dettagliata (min. 20 caratteri)"),
  category: z.string().min(1, "Seleziona un ambito"),
  location: z
    .string()
    .min(3, "Specifica un luogo, quartiere o 'non localizzato'"),
  citizenName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CriticalReport = Report & {
  initialSourceType?: string | null;
  initialSourceUrl?: string | null;
  publicEmergenceDate?: string | null;
  involvedSector?: string | null;
  competentOffice?: string | null;
  formalAct?: string | null;
  institutionalResponse?: string | null;
  institutionalResponseDate?: string | null;
  availableData?: string | null;
  missingData?: string | null;
  foiaLink?: string | null;
  outcome?: string;
  verificationStatus?: string;
  interpretiveCaution?: string;
  updatedAt?: string;
};

const SOURCE_TYPES = [
  "articolo",
  "comunicato",
  "post pubblico",
  "interrogazione",
  "mozione",
  "accesso",
  "albo",
  "delibera",
  "altro",
];

const CATEGORY_OPTIONS = [
  { value: "organico", label: "Organico" },
  { value: "procedimento", label: "Procedimento" },
  { value: "trasparenza", label: "Trasparenza" },
  { value: "servizio", label: "Servizio" },
  { value: "appalto_incarico", label: "Appalto/incarico" },
  { value: "pnrr", label: "PNRR" },
  { value: "ambiente_rifiuti", label: "Ambiente/rifiuti" },
  { value: "viabilita", label: "Viabilità" },
  { value: "verde", label: "Verde" },
  { value: "scuole", label: "Scuole" },
  { value: "uffici", label: "Uffici" },
  { value: "altro", label: "Altro" },
];

const VERIFICATION_STATUS_MAP: Record<
  string,
  { label: string; icon: ElementType; variant: BadgeProps["variant"] }
> = {
  non_verificata: {
    label: "Non verificata",
    icon: Clock,
    variant: "secondary",
  },
  in_verifica: { label: "In verifica", icon: AlertCircle, variant: "warning" },
  documentata: { label: "Documentata", icon: FileSearch, variant: "brand" },
  risposta_ricevuta: {
    label: "Risposta ricevuta",
    icon: CheckCircle2,
    variant: "success",
  },
  chiusa: { label: "Chiusa", icon: CheckCircle2, variant: "outline" },
  archiviata: { label: "Archiviata", icon: Archive, variant: "outline" },
  da_aggiornare: {
    label: "Da aggiornare",
    icon: AlertCircle,
    variant: "warning",
  },
};

const OUTCOME_LABELS: Record<string, string> = {
  aperta: "Aperta",
  risolta: "Risolta",
  parzialmente_risolta: "Parzialmente risolta",
  non_risolta: "Non risolta",
  non_verificabile: "Non verificabile",
  archiviata: "Archiviata",
};

const DEFAULT_CAUTION =
  "Scheda da leggere come tracciamento civico: la presenza nel registro non indica responsabilità o irregolarità accertate.";

function getCategoryLabel(value: string) {
  return (
    CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function formatMaybeDate(value?: string | null) {
  if (!value) return "Non disponibile";
  return format(new Date(value), "dd MMMM yyyy", { locale: it });
}

function filterValue(value?: string | null) {
  return value?.trim() || "non indicato";
}

export function Reports() {
  const queryClient = useQueryClient();
  const createReport = useCreateReport();
  const { data: reports, isLoading } = useListReports();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      citizenName: "",
    },
  });

  const registryReports = useMemo<CriticalReport[]>(() => {
    return (reports ?? []).map((report) => ({
      ...report,
      outcome: report.outcome ?? "aperta",
      verificationStatus: report.verificationStatus ?? "non_verificata",
      interpretiveCaution: report.interpretiveCaution ?? DEFAULT_CAUTION,
      updatedAt: report.updatedAt ?? report.createdAt,
    }));
  }, [reports]);

  const locations = useMemo(
    () =>
      Array.from(
        new Set(registryReports.map((report) => filterValue(report.location))),
      ),
    [registryReports],
  );
  const offices = useMemo(
    () =>
      Array.from(
        new Set(
          registryReports.map((report) => filterValue(report.competentOffice)),
        ),
      ),
    [registryReports],
  );

  const filteredReports = registryReports.filter((report) => {
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;
    const matchesLocation =
      locationFilter === "all" ||
      filterValue(report.location) === locationFilter;
    const matchesOffice =
      officeFilter === "all" ||
      filterValue(report.competentOffice) === officeFilter;
    const matchesVerification =
      verificationFilter === "all" ||
      report.verificationStatus === verificationFilter;
    const matchesOutcome =
      outcomeFilter === "all" || report.outcome === outcomeFilter;
    return (
      matchesCategory &&
      matchesLocation &&
      matchesOffice &&
      matchesVerification &&
      matchesOutcome
    );
  });

  function onSubmit(data: FormValues) {
    createReport.mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Segnalazione inviata con successo", {
            description:
              "Resta un contributo da verificare: non viene pubblicata automaticamente nel registro.",
          });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        },
        onError: () => {
          toast.error("Errore nell'invio", {
            description: "Riprova più tardi.",
          });
        },
      },
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="mb-8 max-w-4xl">
        <span className="eyebrow text-primary">
          <Megaphone className="h-3.5 w-3.5" />
          Registro criticità pubbliche
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Segnalazioni e criticità pubbliche
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Invia un segnale civico circostanziato su servizi, lavori o
          informazioni pubbliche che richiedono verifica. La segnalazione non
          sostituisce una richiesta di accesso civico né eventuali atti formali
          rivolti alle autorità competenti.
        </p>
      </div>

      <Card className="mb-8 border-brand/20 bg-brand/5">
        <CardContent className="p-5 text-sm text-muted-foreground">
          <p>
            Ogni scheda va letta con cautela: indica un elemento da verificare e
            non dimostra responsabilità individuali, irregolarità o disfunzioni
            accertate. Quando mancano dati, il collegamento alla FOIA Machine
            aiuta a formulare una richiesta documentale senza presentare
            persistenza fittizia.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="registry" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xl mx-auto mb-8 h-12">
          <TabsTrigger value="registry" className="text-base h-full">
            Archivio criticità
          </TabsTrigger>
          <TabsTrigger value="new" className="text-base h-full">
            Invia segnalazione
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Filtri minimi</CardTitle>
              <CardDescription>
                Filtra per ambito, luogo, ente/ufficio competente, stato della
                verifica ed esito osservabile. L'archivio mostra solo schede
                pubblicate dopo revisione redazionale esplicita.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger aria-label="Filtra per ambito">
                  <SelectValue placeholder="Ambito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli ambiti</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger aria-label="Filtra per luogo">
                  <SelectValue placeholder="Luogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i luoghi</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={officeFilter} onValueChange={setOfficeFilter}>
                <SelectTrigger aria-label="Filtra per ente o ufficio">
                  <SelectValue placeholder="Ente/ufficio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli enti</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger aria-label="Filtra per stato verifica">
                  <SelectValue placeholder="Stato verifica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  {Object.entries(VERIFICATION_STATUS_MAP).map(
                    ([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger aria-label="Filtra per esito">
                  <SelectValue placeholder="Esito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli esiti</SelectItem>
                  {Object.entries(OUTCOME_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const verification =
                  VERIFICATION_STATUS_MAP[
                    report.verificationStatus ?? "non_verificata"
                  ] ?? VERIFICATION_STATUS_MAP.non_verificata;
                const StatusIcon = verification.icon;

                return (
                  <Card
                    key={report.id}
                    className="overflow-hidden border-border/80"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="font-display text-xl">
                              {report.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="mt-2">
                            {report.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={verification.variant}
                            className="gap-1.5"
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {verification.label}
                          </Badge>
                          <Badge variant="secondary">
                            Esito:{" "}
                            {OUTCOME_LABELS[report.outcome ?? "aperta"] ??
                              report.outcome}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {report.location}
                        </span>
                        <span className="rounded bg-muted px-2 py-0.5">
                          {getCategoryLabel(report.category)}
                        </span>
                        <span>
                          Ultimo aggiornamento:{" "}
                          {formatMaybeDate(
                            report.updatedAt ?? report.createdAt,
                          )}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock
                          title="Cosa è stato dichiarato o segnalato"
                          value={report.description}
                        />
                        <InfoBlock
                          title="Fonte iniziale"
                          value={`${report.initialSourceType ?? "Non indicata"}${
                            report.initialSourceUrl
                              ? ` · ${report.initialSourceUrl}`
                              : ""
                          }`}
                        />
                        <InfoBlock
                          title="Atto formale collegato"
                          value={
                            report.formalAct ??
                            "Nessun atto formale collegato nella scheda"
                          }
                        />
                        <InfoBlock
                          title="Ente/ufficio potenzialmente competente"
                          value={report.competentOffice ?? "Da verificare"}
                        />
                        <InfoBlock
                          title="Risposta istituzionale"
                          value={
                            report.institutionalResponse
                              ? `${report.institutionalResponse} (${formatMaybeDate(
                                  report.institutionalResponseDate,
                                )})`
                              : "Non disponibile"
                          }
                        />
                        <InfoBlock
                          title="Dati disponibili nel portale"
                          value={report.availableData ?? "Non ancora associati"}
                        />
                        <InfoBlock
                          title="Dati mancanti o da richiedere"
                          value={
                            report.missingData ?? "Da valutare in redazione"
                          }
                        />
                        <InfoBlock
                          title="Data emersione pubblica"
                          value={formatMaybeDate(report.publicEmergenceDate)}
                        />
                      </div>
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        <strong className="text-foreground">
                          Cautela interpretativa:
                        </strong>{" "}
                        {report.interpretiveCaution ?? DEFAULT_CAUTION}
                      </div>
                      {report.foiaLink && (
                        <a
                          href={report.foiaLink}
                          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Preparare una richiesta FOIA sui dati mancanti
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                    <Megaphone className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle className="font-display">
                    Nessuna scheda pubblicata disponibile
                  </EmptyTitle>
                  <EmptyDescription>
                    L'archivio è alimentato solo da schede pubblicate dopo
                    revisione. Puoi modificare i filtri o inviare una
                    segnalazione circostanziata che resterà distinta dalla
                    pubblicazione automatica.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card className="max-w-2xl mx-auto overflow-hidden shadow-md">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="font-display font-bold tracking-tight">
                Nuova segnalazione civica
              </CardTitle>
              <CardDescription>
                Fornisci dettagli verificabili. L'invio resta distinto dalla
                pubblicazione nel registro e non sostituisce un accesso civico o
                una comunicazione alle autorità competenti.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Titolo neutro della criticità
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Es. Tempi da verificare su una richiesta di manutenzione"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ambito</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="h-11"
                                aria-label="Ambito"
                              >
                                <SelectValue placeholder="Seleziona ambito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Luogo / Quartiere</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Es. non localizzato"
                                {...field}
                                className="pl-9 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Descrizione sintetica e verificabile
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrivi il fatto dichiarato o segnalato, indicando date, fonti pubbliche, atti o dati mancanti senza attribuire responsabilità non documentate."
                            className="min-h-[150px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Campi come fonte iniziale, stato verifica, ufficio
                    competente, risposta istituzionale, esito, dati mancanti e
                    collegamento FOIA sono predisposti nello schema e vengono
                    completati nella revisione redazionale, senza pubblicazione
                    automatica.
                    <div className="mt-2 text-xs">
                      Fonti iniziali supportate: {SOURCE_TYPES.join(", ")}.
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="citizenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Il tuo nome{" "}
                          <span className="text-muted-foreground font-normal">
                            (opzionale)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome e cognome, se vuoi indicarlo"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription>
                          Lascia vuoto per restare anonimo. Il nome, se
                          indicato, è trattato come dato interno e non viene
                          pubblicato nella scheda pubblica.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full text-base h-12 font-bold"
                    disabled={createReport.isPending}
                  >
                    {createReport.isPending
                      ? "Invio in corso..."
                      : "Invia segnalazione da verificare"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}
