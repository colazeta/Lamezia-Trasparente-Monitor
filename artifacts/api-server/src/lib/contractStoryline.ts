// Ricostruzione della "storyline" di una singola spesa pubblica.
//
// A partire da un contratto (identificato da CIG e/o CUP) e dalle pubblicazioni
// dell'Albo Pretorio, questa libreria:
//  1. collega ogni evidenza al contratto (match forte sul CIG, più debole sul CUP);
//  2. classifica ogni evidenza in una fase del ciclo di vita della spesa;
//  3. calcola indicatori sintetici (tempi alla liquidazione, scostamenti di costo,
//     stato di avanzamento).
//
// Le funzioni qui esposte sono pure (nessun accesso al DB) per essere facilmente
// testabili: il caricamento dei dati avviene nella route.

import { parseImporto } from "./anacContracts";

// Fasi del ciclo di vita di una spesa pubblica.
export type LifecyclePhase =
  | "affidamento" // determina a contrarre / aggiudicazione / affidamento
  | "contratto" // stipula / sottoscrizione del contratto
  | "variante" // variante / perizia suppletiva / aumento di importo
  | "liquidazione" // liquidazione / mandato di pagamento / SAL
  | "collaudo" // collaudo / certificato di regolare esecuzione / chiusura
  | "altro"; // evidenza collegata ma non classificabile

// Forza del collegamento tra evidenza e contratto.
export type StorylineMatch = "cig" | "cup";

// Stato di avanzamento sintetico della spesa.
export type StorylineStatus =
  | "liquidato" // esiste almeno una liquidazione/pagamento
  | "in_corso" // lavori avviati (contratto/variante/collaudo) ma nessuna liquidazione
  | "nessuna_liquidazione"; // nessuna liquidazione registrata

// Sottoinsieme minimo dei campi di un contratto necessario alla storyline.
export interface StorylineContractInput {
  cig: string | null;
  cup: string | null;
  amount: number;
  awardDate: Date;
}

// Sottoinsieme minimo dei campi di una pubblicazione necessario alla storyline.
export interface StorylinePublicationInput {
  id: number;
  progressivo: string;
  tipologia: string;
  oggetto: string;
  cups: string[];
  dataAtto: Date | null;
  pubStart: Date | null;
}

export interface StorylineEvent {
  publicationId: number;
  progressivo: string;
  phase: LifecyclePhase;
  matchedBy: StorylineMatch;
  tipologia: string;
  oggetto: string;
  // Data dell'atto (o, in mancanza, data di pubblicazione) usata per l'ordinamento.
  date: Date | null;
  // Importo eventualmente dedotto in modo euristico dal testo dell'atto (stima).
  estimatedAmount: number | null;
}

export interface StorylineIndicators {
  evidenceCount: number;
  phaseCounts: Record<LifecyclePhase, number>;
  firstEvidenceDate: Date | null;
  lastEvidenceDate: Date | null;
  // Giorni intercorsi dall'aggiudicazione alla prima/ultima liquidazione.
  daysToFirstLiquidazione: number | null;
  daysToLastLiquidazione: number | null;
  awardedAmount: number;
  // Aumenti di costo dedotti dalle varianti (somma degli importi citati).
  extraAmount: number | null;
  extraAmountIsEstimate: boolean;
  // Scostamento percentuale rispetto all'importo aggiudicato.
  costOverrunPct: number | null;
  // Importo complessivo liquidato dedotto dagli atti di liquidazione.
  liquidatedAmount: number | null;
  liquidatedAmountIsEstimate: boolean;
  status: StorylineStatus;
}

const ALL_PHASES: LifecyclePhase[] = [
  "affidamento",
  "contratto",
  "variante",
  "liquidazione",
  "collaudo",
  "altro",
];

function normalize(s: string): string {
  return s.toLowerCase();
}

// Determina la forza del collegamento tra una pubblicazione e un contratto.
// - "cig": il CIG del contratto compare nel testo/oggetto dell'atto (match forte);
// - "cup": il CUP del contratto compare nei CUP strutturati o nel testo (più debole);
// - null: nessuna corrispondenza.
export function matchStrength(
  contract: StorylineContractInput,
  publication: StorylinePublicationInput,
): StorylineMatch | null {
  const haystack = `${publication.oggetto} ${publication.tipologia}`.toUpperCase();

  if (contract.cig) {
    const cig = contract.cig.toUpperCase();
    if (cig && haystack.includes(cig)) return "cig";
  }

  if (contract.cup) {
    const cup = contract.cup.toUpperCase();
    const inStructured = publication.cups.some(
      (c) => c.toUpperCase() === cup,
    );
    if (inStructured || haystack.includes(cup)) return "cup";
  }

  return null;
}

// Classifica un'evidenza in una fase del ciclo di vita, a partire dalla
// tipologia e dall'oggetto dell'atto. L'ordine dei controlli privilegia le fasi
// terminali/più specifiche (collaudo, liquidazione, variante) per evitare che
// parole generiche ("contratto", "affidamento") presenti negli atti di
// liquidazione le facciano ricadere nella fase sbagliata.
export function classifyPhase(tipologia: string, oggetto: string): LifecyclePhase {
  const text = normalize(`${tipologia} ${oggetto}`);

  if (
    /collaud|certificato di regolare esecuzione|regolare esecuzione|\bcre\b|ultimazione (dei |delle )?(lavori|opere)|chiusura (dell['’ ]?intervento|dei lavori|del progetto)/.test(
      text,
    )
  ) {
    return "collaudo";
  }

  if (
    /liquidazion|liquidare|liquidat|mandato di pagamento|mandato n|pagament|saldo|acconto|fattur|\bsal\b|stato (di )?avanzamento/.test(
      text,
    )
  ) {
    return "liquidazione";
  }

  if (
    /variant|perizia|atto aggiuntiv|integrazione (contrattuale|dell['’ ]?importo|dell['’ ]?affidamento)|aumento|maggiori (lavori|oneri|spese|somme)|quinto d['’ ]?obbligo|suppletiv|proroga/.test(
      text,
    )
  ) {
    return "variante";
  }

  if (
    /aggiudicaz|aggiudica|affidament|affida|determina(?:zione)? a contrarre|indizione|avvio (della )?procedura|impegno di spesa|conferimento (dell['’ ]?incarico|incarico)|incarico professionale/.test(
      text,
    )
  ) {
    return "affidamento";
  }

  if (
    /stipul|sottoscrizione (del )?contratto|contratto (d['’ ]?appalto|di appalto|rep\.?|repertorio)|\bcontratto\b|\bconvenzione\b/.test(
      text,
    )
  ) {
    return "contratto";
  }

  // Una determina senza altri segnali è, di norma, un atto di affidamento/impegno.
  if (/determin/.test(text)) return "affidamento";

  return "altro";
}

function eventDate(p: StorylinePublicationInput): Date | null {
  return p.dataAtto ?? p.pubStart ?? null;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Costruisce la timeline cronologica delle evidenze collegate a un contratto.
// Restituisce solo le pubblicazioni che hanno una corrispondenza (CIG o CUP),
// classificate per fase e ordinate dalla più vecchia alla più recente.
export function buildTimeline(
  contract: StorylineContractInput,
  publications: StorylinePublicationInput[],
): StorylineEvent[] {
  const events: StorylineEvent[] = [];
  for (const p of publications) {
    const matchedBy = matchStrength(contract, p);
    if (!matchedBy) continue;
    const phase = classifyPhase(p.tipologia, p.oggetto);
    const importo = parseImporto(p.oggetto);
    events.push({
      publicationId: p.id,
      progressivo: p.progressivo,
      phase,
      matchedBy,
      tipologia: p.tipologia,
      oggetto: p.oggetto,
      date: eventDate(p),
      estimatedAmount: importo != null ? Number(importo) : null,
    });
  }

  events.sort((a, b) => {
    const da = a.date ? a.date.getTime() : Number.POSITIVE_INFINITY;
    const db = b.date ? b.date.getTime() : Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return a.publicationId - b.publicationId;
  });

  return events;
}

// Calcola gli indicatori sintetici della spesa a partire dalle evidenze già
// collegate e ordinate cronologicamente.
export function computeIndicators(
  contract: StorylineContractInput,
  timeline: StorylineEvent[],
): StorylineIndicators {
  const phaseCounts = Object.fromEntries(
    ALL_PHASES.map((p) => [p, 0]),
  ) as Record<LifecyclePhase, number>;

  const datedEvents = timeline.filter((e) => e.date != null);
  const firstEvidenceDate = datedEvents.length ? datedEvents[0].date : null;
  const lastEvidenceDate = datedEvents.length
    ? datedEvents[datedEvents.length - 1].date
    : null;

  const liquidazioneDates: Date[] = [];
  let extraAmount = 0;
  let extraSeen = false;
  let liquidatedAmount = 0;
  let liquidatedSeen = false;

  for (const e of timeline) {
    phaseCounts[e.phase] += 1;
    if (e.phase === "liquidazione") {
      if (e.date) liquidazioneDates.push(e.date);
      if (e.estimatedAmount != null) {
        liquidatedAmount += e.estimatedAmount;
        liquidatedSeen = true;
      }
    }
    if (e.phase === "variante" && e.estimatedAmount != null) {
      extraAmount += e.estimatedAmount;
      extraSeen = true;
    }
  }

  liquidazioneDates.sort((a, b) => a.getTime() - b.getTime());

  let daysToFirstLiquidazione: number | null = null;
  let daysToLastLiquidazione: number | null = null;
  if (liquidazioneDates.length) {
    const first = daysBetween(contract.awardDate, liquidazioneDates[0]);
    const last = daysBetween(
      contract.awardDate,
      liquidazioneDates[liquidazioneDates.length - 1],
    );
    daysToFirstLiquidazione = first >= 0 ? first : null;
    daysToLastLiquidazione = last >= 0 ? last : null;
  }

  const awardedAmount = contract.amount;
  const extra = extraSeen ? extraAmount : null;
  const costOverrunPct =
    extra != null && awardedAmount > 0
      ? (extra / awardedAmount) * 100
      : null;

  const hasLiquidazione = phaseCounts.liquidazione > 0;
  const hasWork =
    phaseCounts.contratto > 0 ||
    phaseCounts.variante > 0 ||
    phaseCounts.collaudo > 0;
  const status: StorylineStatus = hasLiquidazione
    ? "liquidato"
    : hasWork
      ? "in_corso"
      : "nessuna_liquidazione";

  return {
    evidenceCount: timeline.length,
    phaseCounts,
    firstEvidenceDate,
    lastEvidenceDate,
    daysToFirstLiquidazione,
    daysToLastLiquidazione,
    awardedAmount,
    extraAmount: extra,
    extraAmountIsEstimate: extraSeen,
    costOverrunPct,
    liquidatedAmount: liquidatedSeen ? liquidatedAmount : null,
    liquidatedAmountIsEstimate: liquidatedSeen,
    status,
  };
}

export interface ContractStoryline {
  timeline: StorylineEvent[];
  indicators: StorylineIndicators;
}

export function buildStoryline(
  contract: StorylineContractInput,
  publications: StorylinePublicationInput[],
): ContractStoryline {
  const timeline = buildTimeline(contract, publications);
  const indicators = computeIndicators(contract, timeline);
  return { timeline, indicators };
}
