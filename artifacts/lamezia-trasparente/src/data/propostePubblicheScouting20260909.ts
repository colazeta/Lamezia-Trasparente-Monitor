import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 9 settembre 2026: nuova proposta pubblicata l'8 settembre.
 *
 * L'interrogazione di Annita Vitale è descritta al passato come già presentata
 * sia dal Corriere di Lamezia sia dal Lametino. Non è stato reperito un numero
 * di protocollo o il documento nel registro istituzionale: la formalizzazione è
 * quindi attestata dalla fonte stampa, senza inventare un protocollo o ulteriori
 * passaggi istituzionali.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260909 = [
  {
    id: "sant-eufemia-cimitero-accesso-custodia-vitale-2026",
    title: "Interrogazione su accesso e custodia del cimitero di Sant’Eufemia",
    summary:
      "Richiesta della consigliera comunale Annita Vitale di verificare e migliorare sicurezza e accessibilità del percorso pedonale verso il cimitero di Sant’Eufemia, introdurre controlli periodici sulle occupazioni improprie del suolo pubblico, riesaminare il servizio di custodia con maggiore presenza nelle ore mattutine e rendere noti interventi programmati e relativi tempi.",
    promoterId: "annita-vitale",
    promoter: "Annita Vitale",
    promoterType: "consigliere",
    periodLabel: "8 settembre 2026",
    year: "2026",
    theme: "Sicurezza e decoro urbano",
    threadId: "sant-eufemia-cimitero-accessibilita-custodia",
    threadLabel:
      "Cimitero di Sant’Eufemia: accessibilità pedonale, decoro e custodia",
    territorialArea:
      "Area di accesso e percorso pedonale verso il cimitero di Sant’Eufemia Lamezia",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco",
    channel: "interrogazione",
    sourceLabel:
      "Corriere di Lamezia, 8 settembre 2026 — interrogazione di Annita Vitale",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_09_08/santeufemia-vitale-azione-marciapiedi-sicurezza-e-custodia-cimiteriale-la-porta-della-citta-merita-piu-attenzione_66298/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "Corriere di Lamezia e il Lametino riportano entrambi che Annita Vitale, consigliera comunale e capogruppo di Azione, ha presentato un'interrogazione al Sindaco. Le pubblicazioni riprendono il medesimo comunicato e non sono trattate come due prove indipendenti. Il testo attribuito all'interrogazione contiene richieste operative determinate: controlli mirati e periodici della Polizia Locale sulle eventuali occupazioni improprie e sull'accessibilità pedonale; verifica dell'organizzazione della custodia e possibile rafforzamento della presenza nelle ore mattutine; indicazione degli interventi già programmati e del relativo cronoprogramma. Non è stato reperito il documento dell'interrogazione in una fonte istituzionale né un numero di protocollo: il record non inventa tali estremi e non crea ulteriori eventi oltre alla presentazione attestata dalla fonte. Il Comune è documentato come destinatario ma non viene copiato come ente competente; per il pacchetto eterogeneo di sicurezza pedonale, controllo del suolo e custodia cimiteriale la competenza resta not_assessed in assenza di una base amministrativa verificata misura per misura. La materia primaria riusa il mapping official-first già esistente 'Sicurezza e decoro urbano' → materia ufficiale 8 — Giustizia e sicurezza pubblica, con materia 5 — Catasto e urbanistica come secondaria.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-08",
    lastUpdated: "2026-09-08",
    events: [
      {
        id: "sant-eufemia-vitale-interrogazione-cimitero-8-settembre",
        date: "2026-09-08",
        type: "deposito",
        title:
          "Vitale presenta un'interrogazione su accessibilità e custodia del cimitero",
        summary:
          "L'interrogazione chiede controlli periodici sulla fruibilità del percorso pedonale e sulle eventuali occupazioni improprie, chiarimenti e possibile rafforzamento della custodia nelle ore mattutine e un quadro degli interventi programmati con tempi di realizzazione.",
        sourceLabel:
          "Corriere di Lamezia — interrogazione attribuita ad Annita Vitale",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_09_08/santeufemia-vitale-azione-marciapiedi-sicurezza-e-custodia-cimiteriale-la-porta-della-citta-merita-piu-attenzione_66298/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
