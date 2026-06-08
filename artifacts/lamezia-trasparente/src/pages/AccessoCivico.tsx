import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ClipboardList,
  Copy,
  FileQuestion,
  FileSearch,
  FileText,
  Info,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PageMeta } from "@/components/seo/PageMeta";
import { CivicMonitorReturn } from "@/components/CivicMonitorReturn";

const DEFAULT_ENTE = "Comune di Lamezia Terme";
const DEFAULT_OFFICE = "Responsabile della trasparenza / Ufficio competente";
const TODAY = new Date().toISOString().slice(0, 10);

type RequestKind = "semplice" | "generalizzato" | "integrazione";
type ProblemCategoryId =
  | "atto"
  | "contratto"
  | "cig-cup"
  | "liquidazione"
  | "pnrr"
  | "verbale"
  | "incompleto";
type RegisterStatus =
  | "bozza"
  | "inviata"
  | "in attesa"
  | "risposta ricevuta"
  | "diniego"
  | "silenzio"
  | "riesame"
  | "chiusa";

type GeneratorState = {
  requestKind: RequestKind;
  category: ProblemCategoryId;
  requesterName: string;
  documentTarget: string;
  dateReference: string;
  recipientOffice: string;
  contact: string;
  details: string;
};

type Template = {
  id: RequestKind;
  title: string;
  description: string;
};

type ProblemCategory = {
  id: ProblemCategoryId;
  label: string;
  hint: string;
  suggestedKind: RequestKind;
  subjectPrefix: string;
  bodyPrompt: string;
};

type RegisterEntry = {
  id: string;
  creationDate: string;
  sendingDate?: string;
  subject: string;
  category: string;
  recipientOffice: string;
  status: RegisterStatus;
  estimatedDeadline: string;
  outcome: string;
  linkedItem?: string;
  notes: string;
};

const templates: Template[] = [
  {
    id: "semplice",
    title: "Accesso civico semplice",
    description:
      "Per chiedere la pubblicazione di documenti, dati o informazioni soggetti a obbligo di pubblicazione.",
  },
  {
    id: "generalizzato",
    title: "Accesso civico generalizzato",
    description:
      "Per chiedere dati o documenti detenuti dall'amministrazione, ulteriori rispetto a quelli pubblicati.",
  },
  {
    id: "integrazione",
    title: "Integrazione o chiarimento",
    description:
      "Per segnalare in modo prudente un documento pubblicato in modo incompleto o non accessibile.",
  },
];

const problemCategories: ProblemCategory[] = [
  {
    id: "atto",
    label: "Non trovo un atto",
    hint: "Delibera, determina, ordinanza o altro atto amministrativo non rintracciato nella sezione consultata.",
    suggestedKind: "generalizzato",
    subjectPrefix: "documento o atto non rintracciato",
    bodyPrompt:
      "il documento/atto indicato, o le informazioni essenziali per rintracciarlo, non risultano disponibili nella sezione consultata",
  },
  {
    id: "contratto",
    label: "Non trovo un contratto/convenzione",
    hint: "Contratti, convenzioni, accordi, allegati o informazioni di contesto.",
    suggestedKind: "generalizzato",
    subjectPrefix: "contratto o convenzione non rintracciati",
    bodyPrompt:
      "il contratto, la convenzione o gli allegati indicati non risultano rintracciati nella sezione consultata",
  },
  {
    id: "cig-cup",
    label: "Non trovo un CIG/CUP",
    hint: "Codici identificativi di gara o progetto da verificare su atti, affidamenti o interventi.",
    suggestedKind: "generalizzato",
    subjectPrefix: "CIG/CUP o riferimenti di progetto non rintracciati",
    bodyPrompt:
      "il CIG, il CUP o gli ulteriori riferimenti necessari a identificare la procedura/progetto non risultano disponibili nella sezione consultata",
  },
  {
    id: "liquidazione",
    label: "Non trovo una liquidazione",
    hint: "Mandato, determina di liquidazione, beneficiario, importo o causale.",
    suggestedKind: "generalizzato",
    subjectPrefix: "liquidazione non rintracciata",
    bodyPrompt:
      "la liquidazione o i relativi dati essenziali non risultano rintracciati nella sezione consultata",
  },
  {
    id: "pnrr",
    label: "Non trovo lo stato di un progetto PNRR",
    hint: "Avanzamento, milestone, importi, cronoprogramma o documentazione collegata a un progetto PNRR.",
    suggestedKind: "generalizzato",
    subjectPrefix: "stato di avanzamento progetto PNRR",
    bodyPrompt:
      "lo stato di avanzamento o la documentazione essenziale del progetto PNRR indicato non risultano disponibili nella sezione consultata",
  },
  {
    id: "verbale",
    label: "Non trovo un verbale/resoconto di seduta",
    hint: "Verbali, resoconti, registrazioni o allegati relativi a sedute di organi collegiali.",
    suggestedKind: "generalizzato",
    subjectPrefix: "verbale o resoconto di seduta non rintracciato",
    bodyPrompt:
      "il verbale, il resoconto o gli allegati della seduta indicata non risultano rintracciati nella sezione consultata",
  },
  {
    id: "incompleto",
    label: "Documento pubblicato in modo incompleto o non accessibile",
    hint: "Documento con allegati mancanti, file non leggibile, scansione incompleta o link non funzionante.",
    suggestedKind: "integrazione",
    subjectPrefix: "richiesta di integrazione/chiarimento su documento incompleto o non accessibile",
    bodyPrompt:
      "il documento indicato risulta non pienamente consultabile o presenta informazioni/allegati che sembrano incompleti nella sezione consultata",
  },
];

const registerStatuses: RegisterStatus[] = [
  "bozza",
  "inviata",
  "in attesa",
  "risposta ricevuta",
  "diniego",
  "silenzio",
  "riesame",
  "chiusa",
];

const initialGenerator: GeneratorState = {
  requestKind: "generalizzato",
  category: "atto",
  requesterName: "",
  documentTarget: "",
  dateReference: "",
  recipientOffice: DEFAULT_OFFICE,
  contact: "",
  details: "",
};

const seedRegister: RegisterEntry[] = [
  {
    id: "FOIA-2026-001",
    creationDate: "2026-06-06",
    sendingDate: "2026-06-06",
    subject: "Richiesta stato di avanzamento progetto PNRR: [titolo progetto]",
    category: "Non trovo lo stato di un progetto PNRR",
    recipientOffice: DEFAULT_OFFICE,
    status: "in attesa",
    estimatedDeadline: "2026-07-06",
    outcome: "In attesa di riscontro.",
    linkedItem: "[CUP/progetto da verificare]",
    notes: "Voce locale dimostrativa: verificare destinatario e riferimenti prima dell'invio effettivo.",
  },
  {
    id: "FOIA-2026-002",
    creationDate: "2026-06-06",
    subject: "Bozza richiesta integrazione documento non accessibile: [atto]",
    category: "Documento pubblicato in modo incompleto o non accessibile",
    recipientOffice: DEFAULT_OFFICE,
    status: "bozza",
    estimatedDeadline: "Da calcolare dopo l'invio",
    outcome: "Bozza non inviata.",
    linkedItem: "[atto/documento]",
    notes: "Il registro v0 non invia email o PEC: conserva solo una traccia client-side.",
  },
];

function formatDisplayDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getCategory(id: ProblemCategoryId) {
  return problemCategories.find((category) => category.id === id) ?? problemCategories[0];
}

function buildSubject(form: GeneratorState) {
  const category = getCategory(form.category);
  const item = form.documentTarget.trim() || "[documento/atto/progetto da indicare]";

  if (form.requestKind === "semplice") {
    return `Richiesta di accesso civico semplice: ${category.subjectPrefix} — ${item}`;
  }

  if (form.requestKind === "integrazione") {
    return `Richiesta di integrazione/chiarimento: ${category.subjectPrefix} — ${item}`;
  }

  return `Richiesta di accesso civico generalizzato: ${category.subjectPrefix} — ${item}`;
}

function buildRequestText(form: GeneratorState) {
  const category = getCategory(form.category);
  const requester = form.requesterName.trim() || "[nome e cognome del/della richiedente]";
  const recipient = form.recipientOffice.trim() || DEFAULT_OFFICE;
  const item = form.documentTarget.trim() || "[documento/atto/progetto da indicare]";
  const dateReference = form.dateReference.trim() || "[data, periodo o estremi noti]";
  const contact = form.contact.trim() || "[recapito email/PEC o altro contatto]";
  const details =
    form.details.trim() ||
    "[aggiungere eventuali riferimenti utili: sezione consultata, URL, numero atto, CIG/CUP, ufficio, importo, seduta o progetto]";
  const subject = buildSubject(form);

  const legalReference =
    form.requestKind === "semplice"
      ? "ai sensi dell'art. 5, comma 1, del d.lgs. 33/2013"
      : form.requestKind === "generalizzato"
        ? "ai sensi dell'art. 5, comma 2, del d.lgs. 33/2013"
        : "come richiesta di chiarimento/integrazione della pubblicazione consultata, da valutare anche ai sensi dell'art. 5 del d.lgs. 33/2013 ove applicabile";

  const requestAction =
    form.requestKind === "semplice"
      ? "chiede la pubblicazione o l'indicazione del collegamento aggiornato al documento, dato o informazione soggetto a obbligo di pubblicazione"
      : form.requestKind === "generalizzato"
        ? "chiede di ricevere copia o indicazione puntuale dei dati/documenti detenuti dall'amministrazione"
        : "chiede un chiarimento e, ove possibile, l'integrazione della pubblicazione o l'indicazione del documento completo/accessibile";

  return [
    `Destinatario: ${DEFAULT_ENTE}`,
    `Ufficio/recapito da verificare: ${recipient}`,
    `Oggetto: ${subject}`,
    "",
    `Il/La sottoscritto/a ${requester}, contattabile a ${contact}, ${legalReference}, espone quanto segue.`,
    "",
    `Nella sezione consultata, ${category.bodyPrompt}. La presente segnalazione è formulata in termini neutrali e sulla base delle informazioni disponibili al richiedente.`,
    "",
    `Documento/atto/progetto di riferimento: ${item}`,
    `Data o periodo di riferimento: ${dateReference}`,
    `Categoria del problema: ${category.label}`,
    `Ulteriori dettagli: ${details}`,
    "",
    `Per quanto sopra, ${requestAction}. Si chiede cortesemente di indicare, se diverso, l'ufficio competente o il canale corretto a cui indirizzare la richiesta.`,
    "",
    "Si chiede un riscontro nei termini previsti dalla normativa applicabile, di norma entro 30 giorni per l'accesso civico. La richiesta non contiene, per quanto noto al richiedente, dati personali non necessari; prima dell'invio il testo deve essere verificato e adattato al caso concreto.",
    "",
    "Promemoria prima dell'invio: verificare destinatario, riferimenti normativi, riferimenti dell'atto/progetto, recapiti e dati personali. Questo testo è una bozza informativa e non costituisce consulenza legale personalizzata.",
    "",
    "Distinti saluti,",
    requester,
    `Data: [data di invio]`,
  ].join("\n");
}

async function copyText(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Copia non riuscita. Seleziona il testo e copialo manualmente.");
  }
}

function InfoSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-brand">
          <Scale className="h-4 w-4" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold">Accesso civico semplice</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Serve quando si cerca un documento, dato o informazione che dovrebbe essere pubblicato per obbligo di trasparenza. La bozza chiede la pubblicazione o il collegamento corretto, senza accusare l'ente di omissioni.
        </p>
      </Card>
      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-brand">
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold">Accesso civico generalizzato</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Serve per chiedere dati o documenti detenuti dall'amministrazione, anche se non soggetti a pubblicazione obbligatoria. La richiesta resta generale e non richiede motivazione, ma va resa precisa e verificabile.
        </p>
      </Card>
    </div>
  );
}

function TemplateCards({ form }: { form: GeneratorState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {templates.map((template) => {
        const templateText = buildRequestText({ ...form, requestKind: template.id });
        return (
          <Card key={template.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-start gap-2">
              <FileText className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <h3 className="font-display text-base font-semibold">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-auto gap-2"
              aria-label={`Copia template: ${template.title}`}
              onClick={() => copyText(templateText, `Template copiato: ${template.title}.`)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copia template
            </Button>
          </Card>
        );
      })}
    </div>
  );
}

function GeneratorSection({
  onAddDraft,
}: {
  onAddDraft: (entry: RegisterEntry) => void;
}) {
  const [form, setForm] = useState<GeneratorState>(initialGenerator);
  const selectedCategory = getCategory(form.category);
  const requestText = useMemo(() => buildRequestText(form), [form]);
  const subject = useMemo(() => buildSubject(form), [form]);

  const updateCategory = (value: ProblemCategoryId) => {
    const category = getCategory(value);
    setForm((current) => ({
      ...current,
      category: value,
      requestKind:
        current.requestKind === getCategory(current.category).suggestedKind
          ? category.suggestedKind
          : current.requestKind,
    }));
  };

  const addDraftToRegister = () => {
    const entry: RegisterEntry = {
      id: `FOIA-LOCAL-${Date.now().toString().slice(-6)}`,
      creationDate: TODAY,
      subject,
      category: selectedCategory.label,
      recipientOffice: form.recipientOffice.trim() || DEFAULT_OFFICE,
      status: "bozza",
      estimatedDeadline: "Da calcolare dopo l'invio",
      outcome: "Bozza generata, non inviata automaticamente.",
      linkedItem: form.documentTarget.trim() || undefined,
      notes:
        "Voce creata nel registro locale v0. Verificare destinatario, riferimenti e dati personali prima dell'invio.",
    };
    onAddDraft(entry);
    toast.success("Bozza aggiunta al registro locale.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <UICard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <FileQuestion className="h-5 w-5 text-brand" aria-hidden="true" />
            Generatore guidato FOIA Machine v0
          </CardTitle>
          <CardDescription>
            Scegli il problema, completa i campi personalizzabili e copia la bozza. Nessuna email o PEC viene inviata automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Categoria del problema</Label>
            <Select value={form.category} onValueChange={(value) => updateCategory(value as ProblemCategoryId)}>
              <SelectTrigger data-testid="foia-category-select" aria-label="Categoria del problema">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {problemCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{selectedCategory.hint}</p>
          </div>

          <div className="space-y-2">
            <Label>Template da generare</Label>
            <Select
              value={form.requestKind}
              onValueChange={(value) => setForm((current) => ({ ...current, requestKind: value as RequestKind }))}
            >
              <SelectTrigger data-testid="foia-template-select" aria-label="Template da generare">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requester-name">Nome richiedente</Label>
              <Input
                id="requester-name"
                value={form.requesterName}
                onChange={(event) => setForm((current) => ({ ...current, requesterName: event.target.value }))}
                aria-describedby="requester-name-help"
              />
              <p id="requester-name-help" className="text-xs text-muted-foreground">Campo da verificare prima dell'invio.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contatto</Label>
              <Input
                id="contact"
                value={form.contact}
                onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-target">Documento, atto o progetto</Label>
              <Input
                id="document-target"
                value={form.documentTarget}
                onChange={(event) => setForm((current) => ({ ...current, documentTarget: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-reference">Data, periodo o estremi noti</Label>
              <Input
                id="date-reference"
                value={form.dateReference}
                onChange={(event) => setForm((current) => ({ ...current, dateReference: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-office">Ufficio destinatario da verificare</Label>
              <Input
                id="recipient-office"
                value={form.recipientOffice}
                onChange={(event) => setForm((current) => ({ ...current, recipientOffice: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="details">Dettagli utili e fonti consultate</Label>
              <Textarea
                id="details"
                value={form.details}
                onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
                className="min-h-28"
              />
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Promemoria prima dell'invio
            </div>
            Verifica destinatario, riferimenti normativi, riferimenti dell'atto/progetto, recapiti e dati personali. La bozza è informativa, non è consulenza legale personalizzata e non viene inviata automaticamente.
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="brand"
              className="gap-2"
              aria-label="Copia il testo generato della richiesta"
              onClick={() => copyText(requestText, "Richiesta copiata negli appunti.")}
              data-testid="foia-copy-generated"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copia richiesta
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={addDraftToRegister}>
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Salva bozza nel registro v0
            </Button>
          </div>
        </CardContent>
      </UICard>

      <UICard>
        <CardHeader>
          <CardTitle className="font-display text-xl">Anteprima copiabile</CardTitle>
          <CardDescription>Oggetto e testo generati in base alla categoria selezionata.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Oggetto</h3>
            <p className="rounded-lg bg-muted/50 p-3 text-sm" data-testid="foia-generated-subject">{subject}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Testo richiesta</h3>
            <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed" data-testid="foia-generated-body">
              {requestText}
            </pre>
          </div>
        </CardContent>
      </UICard>
    </div>
  );
}

function RegisterSection({ entries }: { entries: RegisterEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Stati disponibili nel registro">
        {registerStatuses.map((status) => (
          <Badge key={status} variant="outline" className="capitalize">
            {status}
          </Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-[980px] w-full text-left text-sm">
          <caption className="sr-only">Registro locale delle richieste di accesso civico</caption>
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">ID interno</th>
              <th scope="col" className="px-4 py-3">Creazione</th>
              <th scope="col" className="px-4 py-3">Invio</th>
              <th scope="col" className="px-4 py-3">Oggetto</th>
              <th scope="col" className="px-4 py-3">Tema</th>
              <th scope="col" className="px-4 py-3">Destinatario</th>
              <th scope="col" className="px-4 py-3">Stato</th>
              <th scope="col" className="px-4 py-3">Scadenza stimata</th>
              <th scope="col" className="px-4 py-3">Esito</th>
              <th scope="col" className="px-4 py-3">Atto/progetto</th>
              <th scope="col" className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t align-top">
                <td className="px-4 py-3 font-mono text-xs">{entry.id}</td>
                <td className="px-4 py-3">{formatDisplayDate(entry.creationDate)}</td>
                <td className="px-4 py-3">{formatDisplayDate(entry.sendingDate)}</td>
                <td className="px-4 py-3 font-medium">{entry.subject}</td>
                <td className="px-4 py-3">{entry.category}</td>
                <td className="px-4 py-3">{entry.recipientOffice}</td>
                <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{entry.status}</Badge></td>
                <td className="px-4 py-3">{formatDisplayDate(entry.estimatedDeadline)}</td>
                <td className="px-4 py-3">{entry.outcome}</td>
                <td className="px-4 py-3">{entry.linkedItem ?? "—"}</td>
                <td className="px-4 py-3">{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AccessoCivico() {
  const [registerEntries, setRegisterEntries] = useState<RegisterEntry[]>(seedRegister);

  const addDraft = (entry: RegisterEntry) => {
    setRegisterEntries((current) => [entry, ...current]);
  };

  return (
    <>
      <PageMeta
        title="FOIA Machine v0 — accesso civico e registro richieste"
        description="Generatore guidato di bozze per accesso civico semplice, accesso civico generalizzato e richieste di integrazione, con registro locale delle richieste."
        path="/accesso-civico"
      />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-brand">
            <FileSearch className="h-5 w-5" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider">Diritto di accesso</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            FOIA Machine v0: generatore di accessi civici
          </h1>
          <p className="text-muted-foreground">
            Uno strumento civico per preparare bozze copiabili di richieste di accesso civico e tenere un registro semplice delle richieste. Non invia automaticamente email o PEC e non sostituisce una verifica legale o amministrativa sul caso concreto.
          </p>
          <CivicMonitorReturn context="Le richieste FOIA aiutano a trasformare data gap e documenti non rintracciati in verifiche tracciabili dentro il Monitor civico." />
        </header>

        <section data-tour="accesso-civico-intro" className="mb-10" aria-labelledby="come-funziona-title">
          <h2 id="come-funziona-title" className="mb-4 font-display text-xl font-semibold">Come scegliere lo strumento</h2>
          <InfoSection />
          <Card className="mt-4 flex items-start gap-3 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Usa formulazioni neutrali come “documento non rintracciato”, “informazione non disponibile nella sezione consultata” o “richiesta di chiarimento”. Prima dell'invio verifica sempre destinatario, riferimenti normativi, dati personali e allegati.
            </p>
          </Card>
        </section>

        <section className="mb-10" aria-labelledby="templates-title">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 id="templates-title" className="font-display text-xl font-semibold">Template copiabili disponibili</h2>
          </div>
          <TemplateCards form={initialGenerator} />
        </section>

        <section data-tour="accesso-civico-new" className="mb-12" aria-labelledby="generator-title">
          <div className="mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 id="generator-title" className="font-display text-xl font-semibold">Generatore guidato della richiesta</h2>
          </div>
          <GeneratorSection onAddDraft={addDraft} />
        </section>

        <section aria-labelledby="registro-title">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 id="registro-title" className="font-display text-xl font-semibold">Registro richieste v0</h2>
          </div>
          <p className="mb-6 max-w-4xl text-sm text-muted-foreground">
            Registro locale con dati seed e bozze aggiunte in questa sessione. Include ID interno, date, oggetto, categoria, destinatario, stato, scadenza stimata, esito, collegamento ad atto/progetto e note. La scadenza indicativa di una richiesta inviata può essere stimata a 30 giorni dalla data di invio (esempio: {formatDisplayDate(addDays(TODAY, 30))}).
          </p>
          <RegisterSection entries={registerEntries} />
        </section>
      </div>
    </>
  );
}
