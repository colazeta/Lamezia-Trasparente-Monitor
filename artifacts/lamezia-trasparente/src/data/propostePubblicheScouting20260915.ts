import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting del 15 settembre 2026.
 *
 * Parallel Search è stato usato obbligatoriamente per discovery ed espansione.
 * Il record materializzato è stato poi verificato direttamente sulla pagina che
 * pubblica il comunicato attribuito alla promotrice e contro fonti ufficiali del
 * Comune per ruolo istituzionale e inquadramento territoriale. Le due testate che
 * ripubblicano la stessa nota non sono trattate come evidenze indipendenti.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260915 = [
  {
    id: "serra-annunziata-rifiuti-sicurezza-serratore-2026",
    title:
      "Rifiuti e sicurezza in località Serra e Annunziata, Serratore presenta mozione",
    summary:
      "Mozione della consigliera comunale Bernadette Serratore per un intervento di pulizia e bonifica nelle località Serra e Annunziata e per un piano continuativo di monitoraggio, controlli, prevenzione dell'abbandono illecito dei rifiuti, verifica del sistema di raccolta e coordinamento tra i soggetti coinvolti.",
    promoterId: "bernadette-serratore",
    promoter: "Bernadette Serratore",
    promoterType: "consigliere",
    periodLabel: "14 settembre 2026",
    year: "2026",
    theme: "Ambiente e sicurezza urbana",
    threadId: "serra-annunziata-rifiuti-sicurezza-prevenzione",
    threadLabel:
      "Serra e Annunziata: rifiuti, prevenzione e sicurezza",
    territorialArea:
      "Località Serra e Annunziata, area collinare sovrastante il quartiere Bella",
    institutionalRecipient: "Comune di Lamezia Terme — Consiglio comunale",
    channel: "mozione",
    sourceLabel:
      "Corriere di Lamezia, 14 settembre 2026 — mozione di Bernadette Serratore",
    sourceUrl:
      "https://www.corrieredilamezia.it/attualita/2026_09_14/lamezia-rifiuti-e-sicurezza-in-localita-serra-e-annunziata-serratore-presenta-mozione-serve-continuita-negli-interventi_66509/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "Corriere di Lamezia pubblica il 14 settembre una nota attribuita alla consigliera comunale e capogruppo di Per Vivere Bene Bernadette Serratore, che dichiara di avere presentato una mozione in Consiglio comunale sulle località Serra e Annunziata. City One pubblica nello stesso giorno la medesima nota: le due ripubblicazioni non sono trattate come evidenze indipendenti. La pagina ufficiale del Comune conferma Serratore tra i consiglieri comunali. Non è stato reperito nel run il testo istituzionale della mozione, un numero di protocollo o un atto di calendarizzazione: la formalizzazione è quindi attestata dalla fonte stampa senza inventare estremi amministrativi o passaggi successivi. Le misure materializzate sono quelle operative esplicitamente formulate nella nota: pulizia e bonifica; piano continuativo con monitoraggio e interventi regolari; maggiori controlli contro l'abbandono illecito; valutazione di videosorveglianza o fototrappole e verifica dei sistemi eventualmente già presenti; verifica dell'adeguatezza del sistema di raccolta con possibili correttivi o punti organizzati e controllati; maggiore coordinamento tra Amministrazione comunale, Polizia Locale, gestore del servizio e autorità competenti. La presenza di cinghiali resta una criticità segnalata dai residenti e richiamata dalla promotrice, ma non viene trasformata in una misura autonoma non formulata. Il destinatario è documentato dalla natura della mozione e non viene copiato come ente competente: il pacchetto coinvolge rifiuti, controlli, videosorveglianza e sicurezza e resta `not_assessed` finché non viene ricostruita una base amministrativa misura per misura. Lo Stradario ufficiale del Comune colloca via/contrada Annunziata e contrade Serra nell'edificio elettorale Bella; la geografia è quindi un'area `nicastro` senza coordinate, per evitare falsa precisione.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-14",
    lastUpdated: "2026-09-14",
    events: [
      {
        id: "serratore-mozione-serra-annunziata-14-settembre",
        date: "2026-09-14",
        type: "deposito",
        title:
          "Serratore presenta una mozione su rifiuti e sicurezza a Serra e Annunziata",
        summary:
          "La mozione chiede una pulizia e bonifica nel breve periodo e un piano continuativo con monitoraggio, regolarità degli interventi, controlli contro l'abbandono illecito, valutazione di videosorveglianza o fototrappole, verifica del sistema di raccolta e maggiore coordinamento tra i soggetti coinvolti. Non è stato reperito un protocollo o il testo istituzionale della mozione.",
        sourceLabel:
          "Corriere di Lamezia — mozione attribuita a Bernadette Serratore",
        sourceUrl:
          "https://www.corrieredilamezia.it/attualita/2026_09_14/lamezia-rifiuti-e-sicurezza-in-localita-serra-e-annunziata-serratore-presenta-mozione-serve-continuita-negli-interventi_66509/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
