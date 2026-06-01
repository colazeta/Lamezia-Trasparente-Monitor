// Fonte unica di verità per l'avviso sulla data di inizio monitoraggio.
// Aggiornare qui per propagare il cambiamento a footer, pagina Metodologia
// e avvisi contestuali delle sezioni documentali.

// Data di inizio del monitoraggio (ISO). Modificare solo questo valore per
// cambiare la data in tutto il sito.
export const MONITORING_START_DATE = "2026-06-01";

// Etichetta leggibile della data di inizio monitoraggio.
export const MONITORING_START_LABEL = "1 giugno 2026";

// Riga sintetica mostrata nel footer su tutte le pagine.
export const MONITORING_FOOTER_NOTICE = `Monitoraggio attivo dal ${MONITORING_START_LABEL}. Gli atti antecedenti potrebbero non essere presenti.`;

// Avviso contestuale breve per le sezioni documentali (Albo, Appalti, ecc.).
export const MONITORING_DOCS_NOTICE = `Il monitoraggio è attivo dal ${MONITORING_START_LABEL}: i documenti antecedenti a questa data potrebbero non essere presenti, perché non più disponibili sulla pagina pubblica del Comune.`;

// Testo esteso per la pagina informativa "Metodologia".
export const MONITORING_METHODOLOGY_PARAGRAPHS: string[] = [
  `Il monitoraggio sistematico degli atti e dei documenti pubblici del Comune di Lamezia Terme è attivo a partire dal ${MONITORING_START_LABEL}. Da quella data raccogliamo e archiviamo in modo continuativo le pubblicazioni rese disponibili dalle fonti ufficiali, così da costruire un archivio civico permanente e navigabile.`,
  `I documenti antecedenti al ${MONITORING_START_LABEL} potrebbero non essere presenti su questo sito. La ragione è semplice: l'albo pretorio ufficiale e diverse pagine istituzionali rimuovono gli atti dopo un periodo limitato (spesso 15 giorni), rendendoli non più disponibili al pubblico. Quando un atto non è più accessibile sulla pagina pubblica del Comune, non possiamo recuperarlo né includerlo nel nostro archivio.`,
  `L'eventuale assenza di un documento precedente a questa data non indica quindi una lacuna del progetto né una mancanza dell'amministrazione: riflette semplicemente i limiti di disponibilità delle fonti pubbliche al momento dell'avvio del monitoraggio.`,
  `Per gli atti pubblicati dal ${MONITORING_START_LABEL} in poi, il nostro obiettivo è garantire un archivio stabile e consultabile nel tempo, anche dopo la loro rimozione dalle pagine ufficiali. Continuiamo ad aggiornare i dati in modo automatico e periodico per offrire ai cittadini uno strumento di trasparenza affidabile.`,
];
