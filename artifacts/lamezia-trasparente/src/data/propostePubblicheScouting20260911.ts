import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting dell'11 settembre 2026: proposte pubblicate il 10 settembre.
 *
 * La discovery è stata ampliata con Parallel Search e ogni record è stato
 * verificato sulla fonte originaria. Gli atti amministrativi collegati sono
 * usati come evidenza di contesto/competenza e non trasformano automaticamente
 * le richieste civiche in recepimento o attuazione.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260911 = [
  {
    id: "urologia-ripristino-operativita-pd-2026",
    title:
      "Ospedale di Lamezia, Gruppo consiliare Pd: ‘Urologia ferma da luglio, situazione insostenibile’",
    summary:
      "Richiesta del gruppo consiliare PD di accelerare il reclutamento degli specialisti urologi, utilizzare con urgenza mobilità e scorrimento delle graduatorie e immettere in servizio il personale necessario per ripristinare posti letto, ricoveri ordinari e attività chirurgica del reparto di Urologia del Giovanni Paolo II.",
    promoterId: "gruppo-consiliare-pd-lamezia-terme",
    promoter: "Gruppo consiliare PD Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Fabrizio Muraca", "Lidia Vescio", "Gennarino Masi"],
    periodLabel: "10 settembre 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-urologia-operativita-reclutamento",
    threadLabel:
      "Ospedale Giovanni Paolo II: operatività del reparto di Urologia e reclutamento",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient:
      "Regione Calabria — Presidente e Commissario ad acta per la sanità",
    channel: "comunicato",
    sourceLabel:
      "il Lametino, 10 settembre 2026 — nota del gruppo consiliare PD sull'Urologia",
    sourceUrl:
      "https://www.lametino.it/ultime/ospedale-di-lamezia-gruppo-consiliare-pd-urologia-ferma-da-luglio-situazione-insostenibile.html",
    status: "proposta_emersa",
    linkedActs: [
      "https://www.inpa.gov.it/bandi-e-avvisi/dettaglio-bando-avviso/?concorso_id=8743d45835464cac955f196ef29b19e9",
    ],
    verificationNote:
      "La fonte originaria attribuisce la nota a Fabrizio Muraca, Lidia Vescio e Gennarino Masi per il gruppo consiliare PD e formula richieste operative determinate: accelerare la conclusione delle procedure di reclutamento, procedere rapidamente con mobilità e scorrimento delle graduatorie, immettere in servizio nuovi urologi e ripristinare posti letto, ricoveri ordinari e attività chirurgica. L'avviso ufficiale inPA di Azienda Zero conferma una mobilità regionale/interregionale per 19 dirigenti medici di Urologia, aperta il 31 luglio e chiusa il 29 agosto 2026; non viene invece materializzata come fatto autonomamente verificato la ripartizione di otto posti all'ASP di Catanzaro riportata dalla fonte stampa, perché non è stata verificata nel documento ufficiale acquisito in questo run. Il destinatario politico resta separato dalla competenza amministrativa: l'assessment è fondato su fonti ufficiali relative alla gestione accentrata delle procedure selettive da parte di Azienda Zero e al ruolo dell'ASP, non sul destinatario della nota. Nessuna sospensione o successivo ripristino del servizio è trattato come attuazione della proposta in assenza di evidenza dedicata.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-10",
    lastUpdated: "2026-09-10",
    events: [
      {
        id: "urologia-pd-richiesta-reclutamento-10-settembre",
        date: "2026-09-10",
        type: "emersione",
        title: "Il gruppo consiliare PD chiede di ripristinare l'operatività di Urologia",
        summary:
          "La nota chiede di accelerare le procedure di reclutamento e utilizzare mobilità e scorrimento delle graduatorie per immettere in servizio specialisti e ripristinare posti letto, ricoveri ordinari e attività chirurgica del reparto.",
        sourceLabel: "il Lametino — nota del gruppo consiliare PD",
        sourceUrl:
          "https://www.lametino.it/ultime/ospedale-di-lamezia-gruppo-consiliare-pd-urologia-ferma-da-luglio-situazione-insostenibile.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "polizia-locale-mobilita-quattro-agenti-dicapp-2026",
    title:
      "Lamezia, mobilità volontaria per quattro agenti resta senza esito: Sindacato Polizia locale Dicapp sollecita il Comune",
    summary:
      "Richiesta del DICAPP Funzione Pubblica di concludere formalmente la procedura di mobilità per quattro Istruttori Agenti di Vigilanza, chiarirne l'esito e le determinazioni successive e, se la procedura non producesse assunzioni, valutare ulteriori strumenti per coprire i posti, incluso lo scorrimento di graduatorie vigenti.",
    promoterId: "dicapp-funzione-pubblica-lamezia-terme",
    promoter: "DICAPP Funzione Pubblica — Polizia Locale Lamezia Terme",
    promoterType: "categoria",
    periodLabel: "10 settembre 2026",
    year: "2026",
    theme: "Polizia locale e sicurezza urbana",
    threadId: "polizia-locale-organico-mobilita-reclutamento",
    threadLabel:
      "Polizia Locale: conclusione della mobilità e copertura dei posti",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient:
      "Comune di Lamezia Terme — Sindaco, Segreteria comunale e uffici interessati",
    channel: "altro",
    sourceLabel:
      "il Lametino, 10 settembre 2026 — nota sindacale DICAPP sulla mobilità per quattro agenti",
    sourceUrl:
      "https://www.lametino.it/ultimora/lamezia-mobilita-volontaria-per-quattro-agenti-resta-senza-esito-sindacato-polizia-locale-dicapp-sollecita-il-comune.html",
    status: "presentata_formalmente",
    linkedActs: [
      "https://www.comune.lamezia-terme.cz.it/it/news/mobilita-volontaria-esterna-istruttore-di-vigilanza",
    ],
    verificationNote:
      "La fonte originaria descrive una lettera già inviata dal DICAPP al Sindaco, alla Segretaria comunale, all'assessore al ramo, alla dirigente di settore e al vicecomandante della Polizia Locale. La nota chiede un riscontro sullo stato e sull'esito della procedura, sulle prossime determinazioni per i quattro posti e, in caso di esito negativo, la valutazione di ulteriori modalità di copertura, incluso un nuovo scorrimento di graduatoria. Non è stato reperito il testo originale della lettera né un numero di protocollo; la data del 10 settembre è pertanto la data certa di pubblicazione e di attestazione pubblica dell'avvenuto invio, non un protocollo inventato. La pagina ufficiale del Comune dell'11 marzo 2026 conferma la procedura ex art. 30 d.lgs. 165/2001 per quattro posti a tempo pieno e indeterminato di Istruttore Agente di Vigilanza e identifica il Settore Economico-Finanziario come struttura curatrice. La competenza viene valutata solo sulla base di questa fonte amministrativa e resta parziale per le ulteriori ipotesi di reclutamento e finanziamento richiamate dal sindacato. La nota formale non equivale a recepimento e non esiste evidenza di assunzione o copertura dei posti.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-10",
    lastUpdated: "2026-09-10",
    events: [
      {
        id: "dicapp-nota-mobilita-quattro-agenti-10-settembre",
        date: "2026-09-10",
        type: "deposito",
        title:
          "DICAPP trasmette una nota sulla conclusione della mobilità per quattro agenti",
        summary:
          "La fonte del 10 settembre attesta l'invio di una nota al Comune che chiede chiarimenti e conclusione della procedura e indica possibili strumenti alternativi di copertura dei posti in caso di esito negativo. La data esatta di protocollo della lettera non è stata reperita.",
        sourceLabel: "il Lametino — nota sindacale DICAPP",
        sourceUrl:
          "https://www.lametino.it/ultimora/lamezia-mobilita-volontaria-per-quattro-agenti-resta-senza-esito-sindacato-polizia-locale-dicapp-sollecita-il-comune.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
