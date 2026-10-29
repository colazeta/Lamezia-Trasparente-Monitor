import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting acquisito il 29 ottobre 2026. Due oggetti e promotori distinti;
 * la richiesta oncologica del 28 ottobre aggiorna la stessa proposta del 13.
 * Dichiarazioni di promotori riportate dalla stampa, senza deposito verificato.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261029 = [
  {
    id: "cafaldo-rifacimento-strade-cristiano-villella-2026",
    title: "Rifacimento del manto stradale nelle vie del rione Cafaldo",
    summary:
      "Massimo Cristiano e Carmine Villella, del gruppo consiliare Futuro Nazionale, chiedono un intervento organico sulle pavimentazioni di via Boccaccio, via Cirillo, via Reggio Calabria, via Mazzini, via Padre Elia Iannazzo e via Maggiore Toselli nel rione Cafaldo a Sambiase. Sollecitano la verifica della possibile estensione degli interventi PINQuA, nei limiti tecnici, amministrativi e finanziari, oppure il reperimento di risorse alternative. Le condizioni della pavimentazione sono descritte dai consiglieri sulla base di segnalazioni dei residenti, non di perizie autonome. La presentazione di un'interrogazione è annunciata, non documentata da protocollo.",
    promoterId: "futuro-nazionale-lamezia",
    promoter: "Gruppo consiliare Futuro Nazionale — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Massimo Cristiano", "Carmine Villella"],
    periodLabel: "28 ottobre 2026",
    year: "2026",
    theme: "Manutenzione stradale del rione Cafaldo",
    threadId: "rione-cafaldo-rifacimento-manto-stradale-2026",
    threadLabel: "Rione Cafaldo: pavimentazioni e programmazione degli interventi",
    territorialArea: "Rione Cafaldo, Sambiase: via Boccaccio, via Cirillo, via Reggio Calabria, via Mazzini, via Padre Elia Iannazzo e via Maggiore Toselli",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco e assessore al ramo",
    channel: "comunicato",
    sourceLabel: "il Lametino, 28 ottobre 2026 — dichiarazioni attribuite a Cristiano e Villella",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-strade-dissestate-nel-rione-cafaldo-cristiano-e-villella-chiedono-rifacimento-del-manto-stradale.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il quotidiano riporta una richiesta di rifacimento delle sei vie elencate e la valutazione condizionale di risorse PINQuA o alternative. Non è verificata la disponibilità o l'ammissibilità di fondi PINQuA per l'intervento, né un accertamento tecnico dei danni. L'interrogazione è soltanto annunciata: nessun protocollo o deposito acquisito; nessuna risposta istituzionale, recepimento o attuazione documentati. Il promotore è normalizzato come nelle altre iniziative di Cristiano e Villella, ma l'oggetto territoriale specifico è distinto da via della Vittoria e dalle frazioni collinari. Il destinatario esplicito non costituisce prova della competenza, che resta not_assessed.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-10-28",
    lastUpdated: "2026-10-28",
    events: [
      {
        id: "cafaldo-richiesta-rifacimento-strade",
        date: "2026-10-28",
        type: "emersione",
        title: "Chiesto il rifacimento organico di sei vie del rione Cafaldo",
        summary:
          "Cristiano e Villella chiedono la programmazione del rifacimento e una verifica preliminare su fondi PINQuA o fonti alternative; annunciano una futura interrogazione, non documentata come depositata.",
        sourceLabel: "il Lametino, 28 ottobre 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-strade-dissestate-nel-rione-cafaldo-cristiano-e-villella-chiedono-rifacimento-del-manto-stradale.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "polo-oncologico-regionale-lamezia-natrella-2026",
    title: "Polo oncologico regionale presso l'ospedale Giovanni Paolo II",
    summary:
      "Pasquale Maria Natrella, componente del direttivo di Forza Italia Lamezia Terme, propone dal 13 ottobre di individuare il presidio Giovanni Paolo II quale sede di un Polo Oncologico Regionale. Il 28 ottobre ribadisce la richiesta di elevare il presidio a tale funzione, prospettando un rafforzamento dei posti letto oncologici e del personale sanitario. Le informazioni su cantieri, UFA e benefici attesi sono dichiarazioni dell'autore, non prova di istituzione del Polo o dell'efficacia delle misure. Nessun atto di programmazione o recepimento riferibile alla proposta è stato verificato.",
    promoterId: "pasquale-maria-natrella-forza-italia",
    promoter: "Pasquale Maria Natrella — Forza Italia Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "13–28 ottobre 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "polo-oncologico-regionale-ospedale-lamezia-2026",
    threadLabel: "Giovanni Paolo II: proposta di Polo Oncologico Regionale",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria e istituzioni competenti",
    channel: "comunicato",
    sourceLabel: "Corriere della Calabria, 13 ottobre 2026 — comunicazione attribuita a Pasquale Maria Natrella",
    sourceUrl: "https://www.corrieredellacalabria.it/2026/10/13/sanita-polo-oncologico-regionale-lamezia-e-la-sede-naturale-situata-nellarea-centrale-della-calabria/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Corriere della Calabria pubblica il 13 ottobre una proposta attribuita espressamente a Natrella, il quale auspica che Regione Calabria e istituzioni competenti considerino il Giovanni Paolo II come sede del Polo Oncologico Regionale. Il Lametino del 28 ottobre ripropone la stessa misura e aggiunge un riferimento all'ampliamento dei posti letto e al reclutamento sanitario: un solo proposal ID e due eventi distinti. Le cifre epidemiologiche, la programmazione e i lavori asseritamente in corso non sono qui corroborati con atti ufficiali; nessuna istituzione del Polo è dimostrata. Non risultano deposito, risposta, recepimento né attuazione della richiesta. Il destinatario è citato dalla fonte del 13 ottobre, ma non determina l'ente competente: assessment not_assessed.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-10-13",
    lastUpdated: "2026-10-28",
    events: [
      {
        id: "natrella-proposta-polo-oncologico-ottobre",
        date: "2026-10-13",
        type: "emersione",
        title: "Natrella propone l'ospedale di Lamezia come sede del Polo Oncologico Regionale",
        summary:
          "Il rappresentante di Forza Italia Lamezia chiede che Regione Calabria e istituzioni interessate considerino il Giovanni Paolo II per un centro oncologico di rilievo regionale; benefici e cifre indicati sono posizioni del promotore.",
        sourceLabel: "Corriere della Calabria, 13 ottobre 2026",
        sourceUrl: "https://www.corrieredellacalabria.it/2026/10/13/sanita-polo-oncologico-regionale-lamezia-e-la-sede-naturale-situata-nellarea-centrale-della-calabria/",
        evidenceLevel: "fonte_stampa",
      },
      {
        id: "natrella-polo-oncologico-rilancio-ottobre",
        date: "2026-10-28",
        type: "aggiornamento",
        title: "Ribadita la richiesta di Polo Oncologico Regionale",
        summary:
          "Natrella torna a sostenere la qualificazione regionale dell'ospedale Giovanni Paolo II, prospettando più posti letto oncologici e il reclutamento di personale sanitario. La dichiarazione non documenta una decisione regionale né lavori attuativi riconducibili alla proposta.",
        sourceLabel: "il Lametino, 28 ottobre 2026",
        sourceUrl: "https://www.lametino.it/calabria/lamezia-natrella-cantieri-in-corso-e-nuovi-servizi-lospedale-diventi-anche-polo-oncologico-regionale.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
