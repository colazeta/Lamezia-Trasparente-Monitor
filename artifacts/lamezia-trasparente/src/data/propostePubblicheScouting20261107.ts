import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Recuperi del 7 novembre 2026: una segnalazione del 6 novembre e due proposte
 * anteriori della medesima organizzazione su oggetti distinti.
 * Nessuna fonte acquisita prova un deposito o un'attuazione.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261107 = [
  {
    id: "cimitero-nicastro-loculi-verifiche-familiari-2026",
    title: "Verifiche e interventi urgenti sui loculi segnalati al cimitero di Nicastro",
    summary:
      "Il 6 novembre 2026 il Lametino riporta la richiesta dei familiari di persone sepolte presso il cimitero di Nicastro di intervenire urgentemente in un'ala del complesso. I familiari riferiscono infiltrazioni e cedimenti in prossimità di diversi loculi e chiedono di scongiurare ulteriori danni strutturali e igienico-sanitari. La fonte non identifica nominativamente i richiedenti o l'ala interessata; gli asseriti danni non sono accertamenti tecnici indipendenti.",
    promoterId: "familiari-defunti-cimitero-nicastro",
    promoter: "Familiari dei defunti del cimitero di Nicastro (non identificati nominativamente)",
    promoterType: "cittadino_comitato",
    periodLabel: "6 novembre 2026",
    year: "2026",
    theme: "Manutenzione e sicurezza dei loculi cimiteriali",
    threadId: "cimitero-nicastro-verifiche-loculi-2026",
    threadLabel: "Cimitero di Nicastro: verifiche e manutenzione dei loculi",
    territorialArea: "Un'ala non identificata del cimitero di Nicastro, Lamezia Terme",
    institutionalRecipient: "Enti competenti, non nominati nella segnalazione",
    channel: "altro",
    sourceLabel: "il Lametino — richiesta riferita dai familiari, 6 novembre 2026",
    sourceUrl: "https://www.lametino.it/ultimora/lamezia-infiltrazioni-e-cedimenti-al-cimitero-lallarme-dei-familiari-dei-defunti.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La cronaca del 6 novembre attribuisce a familiari non identificati la richiesta di interventi urgenti ad 'enti competenti' non specificati. L'esistenza, la gravità e l'esatta posizione dei presunti danni richiedono accertamento tecnico; nessun sopralluogo, provvedimento, deposito, risposta o lavoro realizzato è documentato. Destinatario trascritto dalla richiesta, NON assimilato a competenza amministrativa: not_assessed. Proposta distinta dalle richieste riguardanti il cimitero di Sant'Eufemia e altri cimiteri per localizzazione, promotore e oggetto. L'ala non è georeferenziata e non si attribuiscono coordinate.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-06",
    lastUpdated: "2026-11-06",
    events: [
      {
        id: "nicastro-loculi-familiari-richiesta-2026-11-06",
        date: "2026-11-06",
        type: "emersione",
        title: "Familiari chiedono interventi urgenti per i loculi del cimitero di Nicastro",
        summary:
          "La stampa riporta una richiesta non nominativa di interventi urgenti per presunte infiltrazioni e cedimenti in un'ala del cimitero; non risultano un accertamento tecnico o misure eseguite.",
        sourceLabel: "il Lametino, 6 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultimora/lamezia-infiltrazioni-e-cedimenti-al-cimitero-lallarme-dei-familiari-dei-defunti.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "decentramento-tre-municipi-casa-di-vetro-2026",
    title: "Istituzione di tre municipi territoriali per il decentramento dei servizi",
    summary:
      "Il 14 giugno 2026 l'organizzazione politica La Casa di Vetro, attraverso il portavoce Vincenzo Ruberto, propone un confronto nelle commissioni e in Consiglio comunale sull'istituzione di tre municipi territoriali riferiti a Nicastro, Sambiase e Sant'Eufemia. La proposta immagina sportelli di prossimità, referenti per la manutenzione e la cura del territorio, luoghi di confronto con associazioni e comitati e rappresentanti municipali eletti. L'ammissibilità giuridica, le funzioni e le eventuali modalità elettive richiedono verifica normativa e statutaria specifica.",
    promoterId: "la-casa-di-vetro",
    promoter: "La Casa di Vetro",
    promoterType: "forza_politica",
    coPromoters: ["Vincenzo Ruberto (portavoce)"],
    periodLabel: "14 giugno 2026",
    year: "2026",
    theme: "Decentramento istituzionale e partecipazione territoriale",
    threadId: "governance-territoriale-municipi-lamezia-2026",
    threadLabel: "Decentramento istituzionale nei tre territori storici",
    territorialArea: "Nicastro, Sambiase e Sant'Eufemia — intero territorio comunale",
    institutionalRecipient: "Consiglio comunale e commissioni consiliari di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia — nota La Casa di Vetro, 14 giugno 2026",
    sourceUrl: "https://www.corrieredilamezia.it/attualita/2026_06_14/lamezia-la-casa-di-vetro-propone-di-istituire-tre-municipi-territoriali_63734/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La nota del portavoce propone esplicitamente l'avvio di un confronto in commissione e Consiglio, ma non prova presentazione di una proposta di deliberazione, deposito, calendarizzazione o discussione. La previsione di tre municipi e di rappresentanti eletti è una richiesta politica, non un assetto già istituito né una soluzione giuridicamente verificata. Il TUEL artt. 16–17 e lo Statuto comunale andrebbero esaminati rispetto alla fattispecie concreta, senza equiparare automaticamente municipi e circoscrizioni. L'eventuale competenza regolatoria non si inferisce dal destinatario: not_assessed. Ambito citywide, nessuna coordinata WGS84.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-06-14",
    lastUpdated: "2026-06-14",
    events: [
      {
        id: "casa-di-vetro-tre-municipi-proposta-2026-06-14",
        date: "2026-06-14",
        type: "emersione",
        title: "La Casa di Vetro propone tre municipi e chiede un confronto consiliare",
        summary:
          "La nota descrive tre municipi territoriali con sportelli di prossimità, monitoraggio dei servizi e forme di rappresentanza e partecipazione. Non risulta verificato l'avvio dell'iter istituzionale.",
        sourceLabel: "Corriere di Lamezia, 14 giugno 2026",
        sourceUrl: "https://www.corrieredilamezia.it/attualita/2026_06_14/lamezia-la-casa-di-vetro-propone-di-istituire-tre-municipi-territoriali_63734/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "regolamento-cerimoniale-casa-di-vetro-2026",
    title: "Adozione di un regolamento comunale per il cerimoniale istituzionale",
    summary:
      "Il 18 luglio 2026 La Casa di Vetro, tramite Vincenzo Ruberto, chiede al Consiglio comunale di avviare l'iter per adottare un Regolamento Cerimoniale con criteri pubblici e imparziali sulle commemorazioni istituzionali di cittadini benemeriti. La nota propone di disciplinare comunicati ufficiali di cordoglio, eventuale partecipazione del Sindaco o di delegati, bandiere a mezz'asta e lutto cittadino nei casi previsti e possibili sedute commemorative, oltre a criteri per la selezione degli omaggi. L'asserita assenza di un regolamento è dichiarazione del promotore, non accertamento autonomo.",
    promoterId: "la-casa-di-vetro",
    promoter: "La Casa di Vetro",
    promoterType: "forza_politica",
    coPromoters: ["Vincenzo Ruberto (portavoce)"],
    periodLabel: "18 luglio 2026",
    year: "2026",
    theme: "Cerimoniale pubblico e memoria istituzionale",
    threadId: "comune-cerimoniale-memoria-pubblica-2026",
    threadLabel: "Cerimoniale comunale e criteri di commemorazione pubblica",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Consiglio comunale di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino — nota La Casa di Vetro, 18 luglio 2026",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-ruberto-la-casa-di-vetro-la-citta-merita-un-regolamento-cerimoniale.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte del 18 luglio riproduce un appello al Consiglio comunale per un regolamento, con misure illustrative e criteri di imparzialità. Non sono stati autonomamente verificati lo stato dell'eventuale regolamentazione comunale vigente, un deposito o un procedimento consiliare avviato, l'adozione di atti o l'esercizio di specifici poteri di cerimoniale. L'analisi delle competenze per le singole misure non deriva dal destinatario: not_assessed. La proposta è separata da quella per i tre municipi: stesso promotore ma diverso oggetto e filone. Ambito citywide senza coordinate.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-07-18",
    lastUpdated: "2026-07-18",
    events: [
      {
        id: "casa-di-vetro-regolamento-cerimoniale-2026-07-18",
        date: "2026-07-18",
        type: "emersione",
        title: "La Casa di Vetro chiede l'avvio dell'iter per un Regolamento Cerimoniale",
        summary:
          "La richiesta prevede criteri pubblici per cordoglio, rappresentanza e commemorazioni istituzionali, senza prova di deposito consiliare o deliberazione.",
        sourceLabel: "il Lametino, 18 luglio 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-ruberto-la-casa-di-vetro-la-citta-merita-un-regolamento-cerimoniale.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
