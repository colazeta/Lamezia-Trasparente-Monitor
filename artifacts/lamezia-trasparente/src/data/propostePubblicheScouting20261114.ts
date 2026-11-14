import type { PublicProposal } from "./propostePubblicheCore";

/** Scouting 14 novembre: recupero della richiesta pubblicata il 9 novembre. L'atto regionale anteriore resta soltanto contesto documentale. */
export const SCOUTED_PUBLIC_PROPOSALS_20261114 = [
  {
    "id": "area-urbana-catanzaro-lamezia-governance-giovani-2026",
    "title": "Pianificazione sovracomunale e governance condivisa per Catanzaro–Lamezia",
    "summary": "Il 9 novembre 2026 il Movimento Giovanile per il Rilancio della Prospettiva dell'Area Urbana Catanzaro–Lamezia Terme, guidato da Domenico Costa, chiede di trasformare il percorso regionale sulla Città-Territorio dei Due Mari in strumenti operativi di pianificazione sovracomunale e governance multilivello. Il Movimento prospetta il coordinamento di funzioni logistiche e produttive lametine con università, sanità e servizi del comprensorio catanzarese. La precedente DGR Calabria n. 112 del 25 marzo 2026 è un atto istituzionale autonomo, anteriore alla richiesta del Movimento: non ne prova il recepimento o l'attuazione.",
    "promoterId": "movimento-giovanile-rilancio-area-urbana-catanzaro-lamezia",
    "promoter": "Movimento Giovanile per il Rilancio della Prospettiva dell'Area Urbana Catanzaro–Lamezia Terme",
    "promoterType": "cittadino_comitato",
    "coPromoters": [
      "Domenico Costa (guida del Movimento)"
    ],
    "periodLabel": "9 novembre 2026",
    "year": "2026",
    "theme": "Governance e pianificazione sovracomunale Catanzaro–Lamezia",
    "threadId": "citta-territorio-due-mari-area-urbana-catanzaro-lamezia",
    "threadLabel": "Città-Territorio dei Due Mari: governance e pianificazione condivisa",
    "territorialArea": "Area sovracomunale Catanzaro–Lamezia Terme, comprensori della Calabria centrale",
    "institutionalRecipient": "Regione Calabria — istituzioni regionali impegnate nel documento programmatico d'area",
    "channel": "comunicato",
    "sourceLabel": "il Lametino — nota del Movimento Giovanile, 9 novembre 2026",
    "sourceUrl": "https://www.lametino.it/ultimora/area-urbana-catanzaro-lamezia-terme-costituito-il-movimento-giovanile.html",
    "status": "proposta_emersa",
    "linkedActs": [
      "DGR Calabria n. 112 del 25 marzo 2026: atto d'indirizzo per il documento programmatico pilota Città-Territorio dei Due Mari e costituzione del Tavolo di coordinamento; fonte Regione Calabria: https://www.regione.calabria.it/disturbo-dello-spettro-autistico-ok-giunta-ad-avvio-di-14-centri-polivalenti/"
    ],
    "verificationNote": "Fonte originaria: nota del Movimento pubblicata il 9 novembre, ripresa indipendentemente da LameziaInforma. Il contenuto nuovo è la richiesta del Movimento di rendere operativo il percorso di pianificazione e governance sovracomunale; non la nascita del Tavolo regionale, già prevista prima della sua costituzione. La Regione conferma ufficialmente l'atto d'indirizzo e il Tavolo il 25 marzo 2026; la cronologia esclude di attribuirne la costituzione al Movimento. La metropolitana Catanzaro–Lamezia citata dalla stampa è proposta preesistente richiamata da un partecipante, non qui acquisita come nuova misura autonoma del Movimento. Non verificati deposito formale, risposta diretta al Movimento, atto conseguente, documento programmatico finale o attuazione. L'assessment di competenza parziale riguarda soltanto l'atto regionale di indirizzo e coordinamento verificato da fonte originale; il destinatario della sollecitazione non trasferisce competenza su piani comunali, servizi o investimenti. La geografia è di area vasta, non citywide; nessun punto WGS84 verificato.",
    "evidenceLevel": "ricostruzione_multi_fonte",
    "firstSeen": "2026-11-09",
    "lastUpdated": "2026-11-09",
    "events": [
      {
        "id": "giovani-area-urbana-domanda-governance-2026-11-09",
        "date": "2026-11-09",
        "type": "emersione",
        "title": "Il Movimento Giovanile chiede pianificazione d'area e coordinamento multilivello",
        "summary": "Il Movimento sollecita il passaggio dal precedente atto di indirizzo regionale a pianificazione sovracomunale e governance multilivello del sistema Catanzaro–Lamezia. Nessun deposito o seguito istituzionale attribuibile a tale richiesta è verificato.",
        "sourceLabel": "il Lametino — comunicato del Movimento Giovanile, 9 novembre 2026",
        "sourceUrl": "https://www.lametino.it/ultimora/area-urbana-catanzaro-lamezia-terme-costituito-il-movimento-giovanile.html",
        "evidenceLevel": "fonte_stampa"
      }
    ]
  }
] as const satisfies readonly PublicProposal[];
