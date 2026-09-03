import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 3 settembre 2026.
 *
 * I record di acquisizione restano separati dalla presentazione canonica LT.
 * Le due iniziative sul quartiere Bella condividono oggetto e filone, ma non
 * vengono deduplicate tra loro perché hanno promotori distinti.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260903 = [
  {
    id: "quartiere-bella-manutenzione-masi-2026",
    title: "Diffida per manutenzione e messa in sicurezza del quartiere Bella",
    summary:
      "Diffida del consigliere Gennarino Masi per chiedere entro il 5 settembre un sopralluogo tecnico sulle strade del quartiere Bella, il ripristino del manto stradale e delle buche con priorità a via Lazio e al percorso processionale, la messa in sicurezza temporanea dei tratti non ripristinabili, lo sfalcio dell'erba e il ripristino del decoro; viene inoltre richiesto un riscontro scritto entro 48 ore con interventi, risorse, responsabile, soggetti esecutori, cronoprogramma, misure di sicurezza ed esiti del sopralluogo.",
    promoterId: "gennarino-masi-pd",
    promoter: "Gennarino Masi (PD)",
    promoterType: "consigliere",
    periodLabel: "2 settembre 2026",
    year: "2026",
    theme: "Decoro urbano e manutenzione",
    threadId: "quartiere-bella-manutenzione-decoro",
    threadLabel: "Quartiere Bella: manutenzione, sicurezza e decoro",
    territorialArea:
      "Quartiere Bella, con priorità a via Lazio e alle strade interessate dal percorso processionale",
    institutionalRecipient:
      "Comune di Lamezia Terme — Sindaco; Settore Lavori Pubblici e Manutenzione; Settore Verde Pubblico e Decoro Urbano",
    channel: "altro",
    sourceLabel: "City One, 2 settembre 2026",
    sourceUrl:
      "https://www.cityonelamezia.it/festa-patronale-si-avvicina-ma-bella-e-nel-degrado-masi-presenta-diffida-formale-ad-intevenire-entro-48-ore/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "City One pubblica il testo integrale della diffida, che identifica espressamente il sindaco e i dirigenti dei settori Lavori Pubblici e Manutenzione e Verde Pubblico e Decoro Urbano come destinatari; il Lametino riferisce nello stesso giorno che Masi ha presentato una formale diffida. Non è stato reperito nello scouting un numero di protocollo o un registro comunale che consenta di verificare autonomamente la registrazione dell'atto, né una risposta dell'Amministrazione. Il record usa quindi la formalizzazione attestata dalle fonti senza inferire recepimento o attuazione. Il destinatario documentato non viene trasformato in assessment di competenza: in assenza di una base amministrativa ufficiale sufficientemente puntuale per tutte le misure, la competenza resta not_assessed.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-02",
    lastUpdated: "2026-09-02",
    events: [
      {
        id: "bella-masi-diffida-inviata-2-settembre",
        date: "2026-09-02",
        type: "deposito",
        title: "Diffida formale per interventi urgenti nel quartiere Bella",
        summary:
          "La diffida chiede sopralluogo tecnico, ripristino delle buche e del manto stradale, segnaletica temporanea nei tratti non ripristinabili, sfalcio e decoro entro il 5 settembre, oltre a un riscontro scritto entro 48 ore con risorse, responsabilità e cronoprogramma.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/festa-patronale-si-avvicina-ma-bella-e-nel-degrado-masi-presenta-diffida-formale-ad-intevenire-entro-48-ore/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "quartiere-bella-pulizia-mtl-2026",
    title: "Pulizia, sfalcio e decoro del quartiere Bella prima dei festeggiamenti",
    summary:
      "Richiesta di MTL Lamezia Terme al sindaco di disporre interventi immediati nel quartiere Bella per la pulizia delle strade, lo sfalcio della vegetazione e il ripristino di condizioni dignitose di decoro prima dei festeggiamenti patronali del 6-8 settembre.",
    promoterId: "mtl-lamezia-terme",
    promoter: "Movimento Territorio e Lavoro (MTL) — Lamezia Terme",
    promoterType: "forza_politica",
    periodLabel: "2 settembre 2026",
    year: "2026",
    theme: "Decoro urbano e manutenzione",
    threadId: "quartiere-bella-manutenzione-decoro",
    threadLabel: "Quartiere Bella: manutenzione, sicurezza e decoro",
    territorialArea: "Quartiere Bella, Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme — Sindaco",
    channel: "comunicato",
    sourceLabel: "il Lametino, 2 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-allarme-di-pd-e-mtl-quartiere-bella-nel-degrado-alla-vigilia-dei-festeggiamenti-in-onore-della-madonna.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "Il comunicato di MTL formula tre misure operative e identifica direttamente il sindaco come destinatario: pulizia delle strade, sfalcio della vegetazione e ripristino del decoro prima dei festeggiamenti. Non risultano verificati un deposito formale, una risposta istituzionale o evidenze di attuazione. Il record resta distinto dalla diffida di Gennarino Masi perché il promotore è diverso, pur condividendo lo stesso filone territoriale. Il destinatario non viene copiato come ente competente: l'assessment resta not_assessed in assenza di una base amministrativa ufficiale verificata per il pacchetto concreto di misure.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-02",
    lastUpdated: "2026-09-02",
    events: [
      {
        id: "bella-mtl-richiesta-pulizia-sfalcio-2-settembre",
        date: "2026-09-02",
        type: "emersione",
        title: "MTL chiede pulizia, sfalcio e ripristino del decoro a Bella",
        summary:
          "MTL chiede al sindaco di disporre prima dei festeggiamenti la pulizia delle strade, lo sfalcio della vegetazione e il ripristino di condizioni dignitose di decoro nel quartiere Bella.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-allarme-di-pd-e-mtl-quartiere-bella-nel-degrado-alla-vigilia-dei-festeggiamenti-in-onore-della-madonna.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
