export type CivicRecurrenceCategory =
  | "programmazione-finanziaria"
  | "servizi-scolastici"
  | "servizi-sociali"
  | "ambiente-manutenzioni"
  | "cultura-turismo-sport"
  | "consiglio-partecipazione";

export type CivicRecurrenceTemporalKind =
  | "monthly"
  | "quarterly"
  | "annual-window"
  | "seasonal-window"
  | "relative-window";

export interface CivicRecurrenceTemporalWindow {
  kind: CivicRecurrenceTemporalKind;
  label: string;
  months?: readonly string[];
  note: string;
}

export interface CivicRecurrenceSourceNote {
  label: string;
  note: string;
}

interface CivicRecurrenceBase {
  id: string;
  title: string;
  category: CivicRecurrenceCategory;
  temporalWindow: CivicRecurrenceTemporalWindow;
  monitoringRationale: string;
  caveat: string;
}

export type CivicRecurrenceCandidate = CivicRecurrenceBase &
  (
    | {
        source: CivicRecurrenceSourceNote;
        needsSource?: never;
      }
    | {
        source?: never;
        needsSource: "needs_source";
      }
  );

export interface CivicRecurrenceCalendarSummary {
  total: number;
  byCategory: Record<CivicRecurrenceCategory, number>;
  withSource: number;
  needsSource: number;
}

export const CIVIC_RECURRENCE_MUNICIPALITY = "Lamezia Terme";

export const CIVIC_RECURRENCE_CATEGORIES: readonly CivicRecurrenceCategory[] = [
  "programmazione-finanziaria",
  "servizi-scolastici",
  "servizi-sociali",
  "ambiente-manutenzioni",
  "cultura-turismo-sport",
  "consiglio-partecipazione",
];

const month = (
  label: string,
  months: readonly string[],
  note: string,
): CivicRecurrenceTemporalWindow => ({
  kind: "annual-window",
  label,
  months,
  note,
});

const seasonal = (
  label: string,
  months: readonly string[],
  note: string,
): CivicRecurrenceTemporalWindow => ({
  kind: "seasonal-window",
  label,
  months,
  note,
});

const relative = (
  label: string,
  note: string,
): CivicRecurrenceTemporalWindow => ({
  kind: "relative-window",
  label,
  note,
});

const statutorySource = (label: string): CivicRecurrenceSourceNote => ({
  label,
  note: "Fonte normativa o amministrativa generale da collegare all'atto locale prima dell'uso pubblico.",
});

export const civicRecurrenceCalendarCandidates = [
  {
    id: "bilancio-previsione",
    title: "Bilancio di previsione e allegati",
    category: "programmazione-finanziaria",
    temporalWindow: month(
      "Finestra annuale di programmazione",
      ["dicembre", "gennaio", "febbraio", "marzo"],
      "La finestra resta indicativa e dipende dalle scadenze nazionali e dagli atti locali.",
    ),
    source: statutorySource("Ordinamento contabile degli enti locali"),
    monitoringRationale:
      "Aiuta a verificare quando sono disponibili documenti di programmazione, allegati e note esplicative.",
    caveat:
      "La presenza o l'assenza nella finestra non indica in sé una criticità; richiede controllo sugli atti pubblicati.",
  },
  {
    id: "rendiconto-gestione",
    title: "Rendiconto della gestione",
    category: "programmazione-finanziaria",
    temporalWindow: month(
      "Finestra annuale di rendicontazione",
      ["marzo", "aprile", "maggio"],
      "Da confrontare con delibere, pareri e allegati disponibili.",
    ),
    source: statutorySource("Ordinamento contabile degli enti locali"),
    monitoringRationale:
      "Consente di seguire la pubblicazione del consuntivo e dei principali allegati conoscitivi.",
    caveat:
      "È un promemoria documentale, non una valutazione sulla gestione finanziaria.",
  },
  {
    id: "dup-aggiornamento",
    title: "Documento unico di programmazione e aggiornamento",
    category: "programmazione-finanziaria",
    temporalWindow: month(
      "Finestra di aggiornamento programmatico",
      ["luglio", "settembre", "novembre"],
      "Le date operative vanno verificate anno per anno sugli atti dell'ente.",
    ),
    source: statutorySource("Principi di programmazione degli enti locali"),
    monitoringRationale:
      "Segnala il bisogno di collegare obiettivi, risorse e documenti successivi.",
    caveat: "La ricorrenza non sostituisce la lettura del documento approvato.",
  },
  {
    id: "piao-pubblicazione",
    title: "PIAO e aggiornamenti organizzativi",
    category: "programmazione-finanziaria",
    temporalWindow: month(
      "Finestra annuale PIAO",
      ["gennaio", "febbraio", "marzo", "aprile"],
      "La scadenza può variare in base al quadro normativo e agli atti presupposti.",
    ),
    source: statutorySource("Disciplina nazionale PIAO"),
    monitoringRationale:
      "Permette di tenere insieme programmazione, organizzazione, performance e prevenzione amministrativa.",
    caveat:
      "Usare come traccia di monitoraggio e non come giudizio sulla qualità del piano.",
  },
  {
    id: "variazioni-bilancio",
    title: "Variazioni di bilancio e assestamento",
    category: "programmazione-finanziaria",
    temporalWindow: seasonal(
      "Monitoraggio infrannuale",
      ["giugno", "luglio", "novembre"],
      "Le variazioni possono comparire anche fuori finestra; il calendario serve solo a non perderle.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a evidenziare momenti in cui confrontare modifiche di stanziamento e documenti collegati.",
    caveat:
      "Ogni voce deve essere verificata con delibere e allegati prima di qualsiasi sintesi.",
  },
  {
    id: "piano-opere-pubbliche",
    title: "Programma triennale opere pubbliche ed elenco annuale",
    category: "programmazione-finanziaria",
    temporalWindow: relative(
      "Con bilancio e aggiornamenti di programmazione",
      "Da collegare alle fasi di approvazione del bilancio e agli eventuali aggiornamenti.",
    ),
    source: statutorySource("Programmazione dei lavori pubblici"),
    monitoringRationale:
      "Aiuta a seguire priorità, aggiornamenti e coerenza tra programmazione e atti successivi.",
    caveat:
      "Non certifica lo stato dei cantieri né il completamento degli interventi.",
  },
  {
    id: "iscrizioni-mensa-scolastica",
    title: "Iscrizioni o conferme per mensa scolastica",
    category: "servizi-scolastici",
    temporalWindow: month(
      "Preparazione anno scolastico",
      ["maggio", "giugno", "luglio", "settembre"],
      "Finestra da verificare con avvisi comunali e calendario scolastico regionale.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Riduce il rischio di perdere avvisi utili per famiglie e scuole.",
    caveat:
      "Non contiene dati di utenti o graduatorie e non sostituisce gli avvisi ufficiali.",
  },
  {
    id: "trasporto-scolastico-domande",
    title: "Domande per trasporto scolastico",
    category: "servizi-scolastici",
    temporalWindow: month(
      "Preparazione trasporto scolastico",
      ["maggio", "giugno", "luglio", "agosto"],
      "Da validare con modulistica e comunicazioni comunali dell'anno di riferimento.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Segnala una ricorrenza di servizio che richiede avvisi chiari e tempestivi.",
    caveat:
      "La scheda non assume disponibilità del servizio né criteri di accesso.",
  },
  {
    id: "cedole-librarie",
    title: "Cedole librarie e contributi per libri di testo",
    category: "servizi-scolastici",
    temporalWindow: month(
      "Avvio anno scolastico",
      ["agosto", "settembre", "ottobre"],
      "Il periodo va confermato su bandi regionali o comunali pertinenti.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a controllare pubblicazione, requisiti e scadenze documentali dei contributi.",
    caveat:
      "Non anticipa importi, beneficiari o requisiti non ancora pubblicati.",
  },
  {
    id: "calendario-refezione",
    title: "Avvio e sospensioni della refezione scolastica",
    category: "servizi-scolastici",
    temporalWindow: relative(
      "In prossimità dell'avvio e delle sospensioni scolastiche",
      "Da leggere con calendari scolastici, ordinanze e comunicazioni del servizio.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Rende visibili passaggi organizzativi che interessano continuità e comunicazione del servizio.",
    caveat: "La ricorrenza non valuta la qualità del servizio erogato.",
  },
  {
    id: "centri-estivi-avvisi",
    title: "Avvisi per centri estivi e attività educative",
    category: "servizi-scolastici",
    temporalWindow: seasonal(
      "Finestra estiva",
      ["maggio", "giugno", "luglio"],
      "Da verificare con avvisi comunali o ambiti territoriali competenti.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Consente di monitorare opportunità educative stagionali e relative scadenze.",
    caveat: "Non presuppone che l'iniziativa sia attivata ogni anno.",
  },
  {
    id: "edilizia-scolastica-manutenzioni",
    title: "Manutenzioni e verifiche sugli edifici scolastici",
    category: "servizi-scolastici",
    temporalWindow: seasonal(
      "Prima dell'avvio delle lezioni",
      ["giugno", "luglio", "agosto", "settembre"],
      "Finestra indicativa per atti, affidamenti o comunicazioni manutentive.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a collegare interventi programmati, avvisi e documentazione tecnica pubblicabile.",
    caveat:
      "Non attesta condizioni degli edifici né sostituisce verifiche tecniche ufficiali.",
  },
  {
    id: "bonus-sociali-comunali",
    title: "Contributi sociali comunali ricorrenti",
    category: "servizi-sociali",
    temporalWindow: relative(
      "Secondo avvisi e disponibilità di bilancio",
      "Finestra da documentare con atti annuali, avvisi o determine.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Tiene traccia di avvisi sociali che richiedono scadenze, criteri e modulistica accessibili.",
    caveat:
      "Non include dati personali, domande, graduatorie o valutazioni sui beneficiari.",
  },
  {
    id: "sostegno-affitti",
    title: "Contributi per canoni di locazione o emergenza abitativa",
    category: "servizi-sociali",
    temporalWindow: seasonal(
      "Finestra variabile su fondi disponibili",
      ["marzo", "aprile", "ottobre", "novembre"],
      "Da confermare con bandi regionali, comunali o di ambito.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Evidenzia la necessità di avvisi chiari su requisiti, scadenze e documenti richiesti.",
    caveat: "Non presenta stime di beneficiari né importi come dati certi.",
  },
  {
    id: "assistenza-domiciliare-programmazione",
    title: "Programmazione servizi di assistenza domiciliare",
    category: "servizi-sociali",
    temporalWindow: relative(
      "Con piani sociali, affidamenti o rinnovi servizio",
      "La ricorrenza dipende dagli atti di programmazione e dai contratti in corso.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a seguire continuità, avvisi e documentazione di servizio senza dati sensibili.",
    caveat:
      "Non consente inferenze su utenti, condizioni sanitarie o bisogni individuali.",
  },
  {
    id: "piano-sociale-zona",
    title: "Piano sociale di zona e aggiornamenti di ambito",
    category: "servizi-sociali",
    temporalWindow: relative(
      "Secondo ciclo di programmazione di ambito",
      "Da collegare a documenti di ambito e atti comunali pertinenti.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Supporta la lettura di priorità, risorse e servizi programmati in forma documentale.",
    caveat: "Non valuta l'efficacia sociale degli interventi.",
  },
  {
    id: "avvisi-disabilita-non-autosufficienza",
    title: "Avvisi su disabilità e non autosufficienza",
    category: "servizi-sociali",
    temporalWindow: relative(
      "Secondo fondi e avvisi annuali",
      "Da verificare con fonti istituzionali prima di usare la ricorrenza.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Promemoria per controllare tempestività e accessibilità delle informazioni pubbliche.",
    caveat: "Non raccoglie né espone dati sanitari o personali.",
  },
  {
    id: "rendicontazione-servizi-sociali",
    title: "Rendicontazioni o report sintetici sui servizi sociali",
    category: "servizi-sociali",
    temporalWindow: month(
      "Finestra di rendicontazione annuale",
      ["gennaio", "febbraio", "marzo", "aprile"],
      "Da validare con documenti effettivamente pubblicati dall'ente o dall'ambito.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a distinguere dati pubblici aggregati da informazioni non pubblicabili o sensibili.",
    caveat:
      "Ogni dato deve restare aggregato e accompagnato da fonte e limitazioni.",
  },
  {
    id: "verde-pubblico-primavera",
    title: "Manutenzione primaverile del verde pubblico",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Finestra primaverile",
      ["marzo", "aprile", "maggio", "giugno"],
      "Da confermare con affidamenti, programmi di intervento o comunicazioni dell'ente.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Segnala una possibile ricorrenza stagionale da documentare con atti e comunicazioni.",
    caveat:
      "Non certifica copertura territoriale, priorità o qualità degli interventi.",
  },
  {
    id: "pulizia-caditoie-pre-piogge",
    title: "Pulizia caditoie e preparazione alla stagione piovosa",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Prima delle piogge autunnali",
      ["agosto", "settembre", "ottobre"],
      "Finestra prudente da verificare con atti di manutenzione o ordinanze.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a collegare manutenzioni preventive, comunicazioni e documenti di spesa.",
    caveat:
      "Non implica responsabilità per eventi meteo o criticità infrastrutturali.",
  },
  {
    id: "disinfestazione-derattizzazione",
    title: "Disinfestazione, derattizzazione e comunicazioni stagionali",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Finestra primavera-estate",
      ["aprile", "maggio", "giugno", "luglio", "agosto"],
      "Da verificare con calendari ufficiali, avvisi e affidamenti.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Tiene traccia di interventi stagionali che richiedono comunicazione preventiva alla cittadinanza.",
    caveat:
      "Non descrive risultati sanitari o condizioni ambientali senza fonte.",
  },
  {
    id: "pulizia-spiagge-aree-costiere",
    title: "Pulizia aree costiere e fruizione estiva",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Prima e durante la stagione estiva",
      ["maggio", "giugno", "luglio", "agosto"],
      "Da documentare con atti del servizio e comunicazioni pubbliche.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a seguire atti e avvisi collegati alla fruizione stagionale delle aree pubbliche.",
    caveat:
      "Non attesta condizioni puntuali dei luoghi né completezza degli interventi.",
  },
  {
    id: "rifiuti-calendario-festivita",
    title: "Calendari raccolta rifiuti in periodi festivi",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Festività e variazioni di servizio",
      ["aprile", "agosto", "dicembre", "gennaio"],
      "Da verificare con gestore e comunicazioni comunali pubbliche.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Promemoria per avvisi su variazioni, sospensioni o recuperi di raccolta.",
    caveat: "Non sostituisce il calendario operativo ufficiale del gestore.",
  },
  {
    id: "manutenzione-strade-invernale",
    title: "Manutenzioni stradali e segnaletica post-invernale",
    category: "ambiente-manutenzioni",
    temporalWindow: seasonal(
      "Finestra post-invernale",
      ["febbraio", "marzo", "aprile"],
      "Finestra indicativa da collegare a programmi lavori, affidamenti o segnalazioni pubbliche.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Supporta il controllo documentale su interventi manutentivi ricorrenti.",
    caveat:
      "Non misura sicurezza stradale né responsabilità su singole criticità.",
  },
  {
    id: "eventi-estivi-culturali",
    title: "Programmazione eventi culturali estivi",
    category: "cultura-turismo-sport",
    temporalWindow: seasonal(
      "Programmazione primavera-estate",
      ["aprile", "maggio", "giugno", "luglio", "agosto"],
      "Da verificare con delibere, avvisi, patrocini o calendari pubblicati.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a distinguere calendari ufficiali, avvisi di partecipazione e atti di spesa collegati.",
    caveat: "Non presenta eventi non pubblicati come confermati.",
  },
  {
    id: "natale-eventi-commercio",
    title: "Programmazione natalizia, commercio e animazione urbana",
    category: "cultura-turismo-sport",
    temporalWindow: seasonal(
      "Finestra autunno-inverno",
      ["ottobre", "novembre", "dicembre", "gennaio"],
      "Da collegare ad atti, avvisi e calendari ufficiali dell'anno.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Permette di seguire avvisi, concessioni, contributi e comunicazioni pubbliche stagionali.",
    caveat:
      "Non assume copertura economica o programma definitivo senza atto pubblicato.",
  },
  {
    id: "concessioni-impianti-sportivi",
    title: "Avvisi o rinnovi per impianti sportivi comunali",
    category: "cultura-turismo-sport",
    temporalWindow: relative(
      "Secondo scadenze di convenzioni e stagioni sportive",
      "Da verificare con atti di concessione, avvisi e determine.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a monitorare scadenze documentali e trasparenza degli affidamenti d'uso.",
    caveat: "Non valuta soggetti gestori, associazioni o risultati sportivi.",
  },
  {
    id: "biblioteca-attivita-annuali",
    title: "Attività annuali di biblioteca e promozione lettura",
    category: "cultura-turismo-sport",
    temporalWindow: seasonal(
      "Finestra scolastica e culturale",
      ["marzo", "aprile", "maggio", "ottobre", "novembre"],
      "Da documentare con calendari e atti pubblicati.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Segnala iniziative ricorrenti che possono richiedere calendario, adesioni o rendicontazione.",
    caveat:
      "Non conferma iniziative fino alla pubblicazione della fonte pertinente.",
  },
  {
    id: "turismo-informazione-stagionale",
    title: "Informazione turistica e materiali stagionali",
    category: "cultura-turismo-sport",
    temporalWindow: seasonal(
      "Prima delle stagioni di maggiore afflusso",
      ["aprile", "maggio", "giugno", "novembre", "dicembre"],
      "Finestra da validare con atti e comunicazioni turistiche ufficiali.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a individuare aggiornamenti di pagine, materiali informativi e avvisi al pubblico.",
    caveat: "Non stima flussi turistici o impatti economici.",
  },
  {
    id: "patrocini-contributi-eventi",
    title: "Patrocini e contributi per iniziative pubbliche",
    category: "cultura-turismo-sport",
    temporalWindow: {
      kind: "quarterly",
      label: "Verifica trimestrale",
      note: "Frequenza prudente per controllare eventuali avvisi o atti pubblicati nel periodo.",
    },
    needsSource: "needs_source",
    monitoringRationale:
      "Promemoria per controllare avvisi, criteri e atti di concessione in forma documentale.",
    caveat: "Non attribuisce preferenze o valutazioni sui richiedenti.",
  },
  {
    id: "convocazioni-consiglio-comunale",
    title: "Convocazioni del Consiglio comunale",
    category: "consiglio-partecipazione",
    temporalWindow: {
      kind: "monthly",
      label: "Monitoraggio mensile",
      note: "La frequenza effettiva dipende dall'attività istituzionale e dagli atti di convocazione.",
    },
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a controllare pubblicazione di ordine del giorno, data, allegati e successive verbalizzazioni.",
    caveat:
      "Non valuta il merito delle decisioni né la partecipazione dei consiglieri.",
  },
  {
    id: "commissioni-consiliari",
    title: "Convocazioni e materiali delle commissioni consiliari",
    category: "consiglio-partecipazione",
    temporalWindow: {
      kind: "monthly",
      label: "Monitoraggio mensile",
      note: "Da verificare in base alle commissioni effettivamente convocate e agli atti pubblicati.",
    },
    needsSource: "needs_source",
    monitoringRationale:
      "Promemoria per collegare convocazioni, temi trattati e documenti disponibili.",
    caveat:
      "Non presume completezza se la fonte ufficiale non pubblica materiali ulteriori.",
  },
  {
    id: "question-time-interrogazioni",
    title: "Interrogazioni, question time e risposte pubblicate",
    category: "consiglio-partecipazione",
    temporalWindow: relative(
      "Secondo regolamento e sedute",
      "Da collegare a regolamento, ordini del giorno e documentazione consiliare.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a seguire tracciabilità delle domande e disponibilità di risposte o esiti.",
    caveat: "Non valuta contenuti politici o responsabilità individuali.",
  },
  {
    id: "consultazioni-pubbliche",
    title: "Consultazioni, avvisi di partecipazione e osservazioni",
    category: "consiglio-partecipazione",
    temporalWindow: relative(
      "Secondo procedimenti aperti",
      "Da verificare con avvisi, regolamenti e pagine istituzionali.",
    ),
    needsSource: "needs_source",
    monitoringRationale:
      "Segnala opportunità civiche che richiedono termini, documenti e modalità di invio chiare.",
    caveat:
      "Non presuppone che ogni procedimento preveda consultazione pubblica.",
  },
  {
    id: "albo-pretorio-controlli-mensili",
    title: "Controllo mensile di pubblicazioni rilevanti all'albo pretorio",
    category: "consiglio-partecipazione",
    temporalWindow: {
      kind: "monthly",
      label: "Monitoraggio mensile",
      note: "Campione operativo da definire senza duplicare o alterare l'albo ufficiale.",
    },
    needsSource: "needs_source",
    monitoringRationale:
      "Aiuta a non perdere atti ricorrenti collegati a partecipazione, trasparenza e scadenze civiche.",
    caveat:
      "Non sostituisce l'albo pretorio ufficiale e non garantisce completezza storica.",
  },
  {
    id: "relazione-fine-inizio-mandato",
    title: "Relazioni di inizio o fine mandato quando previste",
    category: "consiglio-partecipazione",
    temporalWindow: relative(
      "In prossimità dei passaggi di mandato",
      "Ricorrenza non annuale da collegare solo agli eventi istituzionali pertinenti.",
    ),
    source: statutorySource("Obblighi informativi sugli enti locali"),
    monitoringRationale:
      "Permette di trattare il documento come fonte di contesto e non come aggiornamento ordinario.",
    caveat:
      "La presenza della scheda non implica imminenza di elezioni o passaggi istituzionali.",
  },
] as const satisfies readonly CivicRecurrenceCandidate[];

function createZeroCounts<T extends string>(
  keys: readonly T[],
): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

export function hasUniqueCivicRecurrenceIds(
  entries: readonly CivicRecurrenceCandidate[] = civicRecurrenceCalendarCandidates,
): boolean {
  const ids = entries.map((entry) => entry.id);
  return new Set(ids).size === ids.length;
}

export function candidateHasSourceOrNeedsSource(
  entry: CivicRecurrenceCandidate,
): boolean {
  return "source" in entry || entry.needsSource === "needs_source";
}

export function filterCivicRecurrencesByCategory(
  category: CivicRecurrenceCategory,
  entries: readonly CivicRecurrenceCandidate[] = civicRecurrenceCalendarCandidates,
): CivicRecurrenceCandidate[] {
  return entries.filter((entry) => entry.category === category);
}

export function summarizeCivicRecurrenceCalendar(
  entries: readonly CivicRecurrenceCandidate[] = civicRecurrenceCalendarCandidates,
): CivicRecurrenceCalendarSummary {
  const summary: CivicRecurrenceCalendarSummary = {
    total: entries.length,
    byCategory: createZeroCounts(CIVIC_RECURRENCE_CATEGORIES),
    withSource: 0,
    needsSource: 0,
  };

  for (const entry of entries) {
    summary.byCategory[entry.category] += 1;

    if ("source" in entry) {
      summary.withSource += 1;
    } else {
      summary.needsSource += 1;
    }
  }

  return summary;
}
