import { useMemo } from "react";
import { Link } from "wouter";
import {
  useListMonitoringReports,
  getListMonitoringReportsQueryKey,
  type MonitoringReport,
} from "@workspace/api-client-react";
import {
  Telescope,
  Plus,
  FileText,
  Landmark,
  ArrowRight,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Paperclip,
  MessageSquareWarning,
  ListChecks,
  Gavel,
  ClipboardList,
  ShieldCheck,
  FileQuestion,
  Scale,
  Database,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { asApiList } from "@/lib/apiList";

const ASSESSMENT_META: Record<
  MonitoringReport["overallAssessment"],
  { label: string; icon: typeof ThumbsUp; className: string }
> = {
  positivo: {
    label: "Positivo",
    icon: ThumbsUp,
    className:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  neutro: {
    label: "Neutro",
    icon: Minus,
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  },
  critico: {
    label: "Critico",
    icon: ThumbsDown,
    className:
      "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  },
};

const HUB_MODULES = [
  {
    id: "criticita-pubbliche",
    title: "Cosa è stato segnalato",
    label: "Criticità pubbliche",
    links: [{ href: "/criticita-pubbliche", label: "Apri registro" }],
    status: "Manuale + redazionale",
    description:
      "Segnali civici e bisogni di verifica raccolti come punti di attenzione, non come conclusioni autonome.",
    icon: MessageSquareWarning,
  },
  {
    id: "programma-sotto-verifica",
    title: "Cosa era stato promesso",
    label: "Programma sotto verifica",
    links: [{ href: "/promessometro", label: "Apri modulo" }],
    status: "modulo in predisposizione",
    description:
      "Spazio previsto per collegare impegni programmatici, stato documentale e atti disponibili senza duplicare la roadmap.",
    icon: ListChecks,
  },
  {
    id: "atti-prodotti",
    title: "Quali atti sono stati prodotti",
    label: "Delibere e Albo",
    links: [
      { href: "/delibere", label: "Delibere" },
      { href: "/albo", label: "Albo Pretorio" },
    ],
    status: "automatico da fonti pubbliche",
    description:
      "Delibere, pubblicazioni e documenti amministrativi da usare come fonte primaria per ogni verifica civica.",
    icon: Gavel,
  },
  {
    id: "risorse-affidamenti",
    title: "Quali risorse e affidamenti sono collegati",
    label: "Contratti, incarichi e PNRR",
    links: [
      { href: "/contratti", label: "Contratti" },
      { href: "/incarichimetro", label: "Incarichimetro" },
      { href: "/pnrr", label: "PNRR" },
    ],
    status: "misto automatico + indicatori",
    description:
      "Affidamenti, incarichi e progetti PNRR letti come contesto documentale e segnali da verificare sulle fonti.",
    icon: ClipboardList,
  },
  {
    id: "memoria-civica",
    title: "Quale memoria civica e istituzionale va conservata",
    label: "Legalità e beni confiscati",
    links: [
      { href: "/legalita", label: "Legalità" },
      { href: "/beni-confiscati", label: "Beni confiscati" },
    ],
    status: "Redazionale + fonti",
    description:
      "Percorsi su legalità, requisiti di trasparenza, riuso civico e memoria istituzionale con cautele esplicite.",
    icon: ShieldCheck,
  },
  {
    id: "cosa-manca",
    title: "Cosa manca e può essere richiesto",
    label: "Accesso civico",
    links: [{ href: "/accesso-civico", label: "Apri modulo" }],
    status: "strumento assistito",
    description:
      "Generatore e registro operativo per trasformare data gap e documenti non rintracciati in richieste verificabili.",
    icon: FileQuestion,
  },
];

const RELATION_HINTS = [
  "criticità pubblica ↔ promessa programmatica",
  "promessa ↔ delibera, pubblicazione, contratto o progetto PNRR",
  "criticità ↔ richiesta di accesso civico",
  "evento di memoria civica ↔ bene confiscato, delibera o requisito di legalità",
  "incarico o affidamento ↔ promessa, criticità o fonte metodologica",
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMMM yyyy", { locale: it });
}

export function Monitoraggio() {
  const { data, isLoading } = useListMonitoringReports(undefined, {
    query: { queryKey: getListMonitoringReportsQueryKey() },
  });

  const reports = useMemo(() => asApiList<MonitoringReport>(data), [data]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div
        data-tour="monitoring-intro"
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand">
            <Telescope className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Monitor civico hub
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Monitor civico
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            La rotta <code>/monitoraggio</code> resta il punto di ingresso
            generale: collega fonti pubbliche, segnalazioni, programma sotto
            verifica, atti, risorse e memoria civica senza formulare accuse
            autonome o sostituire le fonti ufficiali.
          </p>
        </div>
        <Button
          data-tour="monitoring-new"
          asChild
          variant="brand"
          className="gap-2"
        >
          <Link href="/monitoraggio/nuovo">
            <Plus className="h-4 w-4" />
            Crea un report
          </Link>
        </Button>
      </div>

      <section aria-labelledby="monitor-civico-moduli" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="monitor-civico-moduli"
              className="font-display text-2xl font-bold tracking-tight"
            >
              Moduli collegati
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Ogni scheda indica lo stato del modulo e il tipo di collegamento
              previsto. Le relazioni sono documentali: evidenziano indicatori,
              data gap e bisogni di verifica, non responsabilità individuali.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/metodologia">Fonti e cautele</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {HUB_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                id={module.id}
                className="flex h-full flex-col gap-4 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-brand/10 p-3 text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    {module.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {module.title}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold">
                    {module.label}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {module.links.map((link, index) => (
                    <Button
                      key={link.href}
                      asChild
                      size="sm"
                      variant={index === 0 ? "outline" : "ghost"}
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="monitor-civico-relazioni"
        className="mt-8 grid gap-4 rounded-2xl border border-border bg-muted/30 p-5 md:grid-cols-[1.2fr_0.8fr]"
      >
        <div>
          <div className="flex items-center gap-2 text-brand">
            <Database className="h-4 w-4" aria-hidden="true" />
            <h2
              id="monitor-civico-relazioni"
              className="font-display text-xl font-bold"
            >
              Relazioni previste per le prossime versioni
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            La versione pubblica usa collegamenti manuali e percorsi di navigazione. Le
            relazioni dati restano predisposte come tracce di lavoro per
            collegare criticità, promesse, atti, incarichi, PNRR, accesso civico
            e memoria istituzionale.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {RELATION_HINTS.map((hint) => (
            <li key={hint} className="flex gap-2">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="monitor-civico-report"
        className="mt-10"
        data-tour="monitoring-phases"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="monitor-civico-report"
              className="font-display text-2xl font-bold tracking-tight"
            >
              Report civici già disponibili
            </h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              I report in stile Monithon restano in questa pagina come
              sottosezione operativa: analisi desk, valutazione di efficacia e
              impatto sui risultati, sempre con verifica sulle fonti.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Telescope className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Ancora nessun report pubblicato</EmptyTitle>
              <EmptyDescription>
                Sii il primo a monitorare un progetto: scegli un appalto o un
                progetto PNRR e racconta com'è andato.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReportCard({ report }: { report: MonitoringReport }) {
  const assessment = ASSESSMENT_META[report.overallAssessment];
  const AssessmentIcon = assessment.icon;
  const SubjectIcon = report.subjectType === "pnrr" ? Landmark : FileText;

  return (
    <Link
      href={`/monitoraggio/${report.id}`}
      className="group"
      data-testid={`card-monitoraggio-${report.id}`}
    >
      <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className={`gap-1 text-xs shadow-none ${assessment.className}`}
          >
            <AssessmentIcon className="h-3 w-3" />
            {assessment.label}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs shadow-none">
            <SubjectIcon className="h-3 w-3" />
            {report.subjectType === "pnrr" ? "PNRR" : "Appalto"}
          </Badge>
          {report.cig ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CIG {report.cig}
            </Badge>
          ) : report.cup ? (
            <Badge variant="outline" className="font-mono text-xs shadow-none">
              CUP {report.cup}
            </Badge>
          ) : null}
        </div>

        <h2 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight">
          {report.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {report.subjectTitle}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
          <span>
            {report.authorName ? `${report.authorName} · ` : ""}
            {formatDate(report.publishedAt ?? report.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            {report.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {report.attachments.length}
              </span>
            )}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </span>
        </div>
      </article>
    </Link>
  );
}
