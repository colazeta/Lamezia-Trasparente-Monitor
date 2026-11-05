import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Ricognizione 5 novembre: acquisizione di una proposta emersa il 4 novembre.
 * La fonte è una dichiarazione attribuita da il Lametino al promotore;
 * le idee accessorie su rete idrica e riscossione non duplicano proposte altrui.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20261105 = [
  {
    id: "patto-civico-monitoraggio-progetti-de-biase-2026",
    title: "Patto civico per priorità condivise e rendicontazione dei progetti comunali",
    summary:
      "Salvatore De Biase, già presidente del Consiglio comunale, propone alle forze politiche di maggioranza e opposizione un Patto civico per il futuro di Lamezia Terme articolato in cinque misure: stabilire un'agenda di priorità trasversali ai cambi di amministrazione, rendere pubblico per ciascun progetto stato di avanzamento, atti, finanziamenti, responsabili e scadenze, aggiornare i cittadini ogni sei mesi sui risultati, elaborare un piano di rafforzamento della macchina comunale (personale, uffici, riscossione e progettazione) e coinvolgere giovani, scuole, università, associazioni e imprese nella definizione delle prospettive cittadine. Altre idee nel comunicato, fra cui mappatura delle perdite idriche, banca dati tributaria e turismo, non sono qui trasformate in proposte autonome o fatti tecnici verificati.",
    promoterId: "salvatore-de-biase",
    promoter: "Salvatore De Biase",
    promoterType: "cittadino_comitato",
    periodLabel: "4 novembre 2026",
    year: "2026",
    theme: "Trasparenza e partecipazione democratica",
    threadId: "governance-comunale-priorita-progetti-trasparenza-2026",
    threadLabel: "Programmazione condivisa e rendicontazione dei progetti",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Forze politiche di maggioranza e opposizione; Consiglio e Amministrazione comunale di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 4 novembre 2026 — dichiarazioni attribuite a Salvatore De Biase",
    sourceUrl: "https://www.lametino.it/ultime/lamezia-la-proposta-di-de-biase-un-patto-civico-per-il-futuro-della-citta.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La pubblicazione originale di il Lametino del 4 novembre riporta una dichiarazione attribuita a Salvatore De Biase, qualificato come già presidente del Consiglio comunale, con cinque richieste determinate, distinguibili dai passaggi programmatici e politici. Non è stato acquisito un documento depositato o sottoscritto dalle forze politiche, né una deliberazione, una risposta istituzionale, una calendarizzazione o una prova di attuazione. Le considerazioni su progetti, finanze e infrastrutture sono posizioni del promotore e non vengono recepite come diagnosi LT. Le richieste su ricognizione delle dispersioni idriche sono tematicamente connesse ma distinte dalla proposta preesistente del gruppo PD sulla rete idrica: non si duplica quest'ultima e non se ne trasferisce la paternità. Per l'oggetto prevalente, partecipazione e rendicontazione pubblica, si riusa il concetto ufficiale interoperabile EU Data Theme GOVE già documentato nel backend, in assenza di un concetto specifico fra le 15 materie nazionali; nessuna estensione LT. Gli interlocutori indicati sono destinatari politici e istituzionali della richiesta, non competenze assegnate: assessment not_assessed.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-11-04",
    lastUpdated: "2026-11-04",
    events: [
      {
        id: "de-biase-patto-civico-cinque-impegni-2026-11-04",
        date: "2026-11-04",
        type: "emersione",
        title: "De Biase rende pubblica una proposta di Patto civico in cinque impegni",
        summary:
          "De Biase propone un'agenda trasversale delle priorità, un dossier pubblico dei progetti, una verifica semestrale dei risultati, un piano di rafforzamento comunale e il coinvolgimento delle nuove generazioni. La dichiarazione pubblica non costituisce deposito, adesione istituzionale o attuazione.",
        sourceLabel: "il Lametino — dichiarazioni attribuite a Salvatore De Biase, 4 novembre 2026",
        sourceUrl: "https://www.lametino.it/ultime/lamezia-la-proposta-di-de-biase-un-patto-civico-per-il-futuro-della-citta.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
