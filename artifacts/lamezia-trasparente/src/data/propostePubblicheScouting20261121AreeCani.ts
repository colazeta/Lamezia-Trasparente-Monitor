import type { PublicProposal } from "./propostePubblicheCore";

/** Proposta storica del 2023 e avanzamenti tematici del 2026 non attribuiti causalmente. */
export const SCOUTED_PUBLIC_PROPOSALS_20261121_AREE_CANI = [
  {
    "id": "aree-sgambamento-cani-gianturco-2023",
    "title": "Proposta di Mimmo Gianturco per aree comunali recintate destinate ai cani, con successivo atto d'indirizzo su Parco Argada",
    "summary": "Il 17 febbraio 2023 il consigliere Mimmo Gianturco, per il gruppo Lamezia Prima Di Tutto, chiede almeno tre aree di sgambamento recintate per cani nelle macrozone cittadine, anche nei parchi, con ombra, acqua, panchine e cestini. Il 18 novembre 2026 la Giunta comunale annuncia un atto d'indirizzo per un'area al Parco Adelchi Argada mediante sponsorizzazioni, ripreso da una ricostruzione giornalistica del testo della delibera il 19 novembre. Non è documentata alcuna relazione causale con la proposta del 2023, né un intervento realizzato.",
    "promoterId": "mimmo-gianturco",
    "promoter": "Mimmo Gianturco (Lamezia Prima Di Tutto)",
    "promoterType": "consigliere",
    "coPromoters": [
      "Gruppo consiliare Lamezia Prima Di Tutto"
    ],
    "periodLabel": "17 febbraio 2023 – 19 novembre 2026",
    "year": "2023",
    "theme": "Aree comunali recintate per lo sgambamento dei cani",
    "threadId": "aree-sgambamento-cani-lamezia-2023-2026",
    "threadLabel": "Aree cani comunali: proposta e successivo indirizzo Argada",
    "territorialArea": "Intero Comune di Lamezia Terme (tre macrozone); Parco Adelchi Argada menzionato nella proposta 2023 e nell'indirizzo 2026",
    "institutionalRecipient": "Sindaco e amministrazione comunale di Lamezia Terme",
    "channel": "comunicato",
    "sourceLabel": "il Lametino — comunicato di Mimmo Gianturco, 17 febbraio 2023",
    "sourceUrl": "https://www.lametino.it/ultimora/lamezia-gianturco-comune-realizzi-area-sgambamento-cani.html",
    "status": "proposta_emersa",
    "linkedActs": [],
    "verificationNote": "Il 17 febbraio 2023 Gianturco dichiarava che il gruppo Lamezia Prima Di Tutto aveva depositato ufficialmente una proposta, ma non è disponibile copia protocollata: l'acquisizione non registra deposito formalmente verificato. La richiesta prevede almeno tre aree in diverse macrozone; Parco Argada era esplicitamente citato fra i possibili siti. Il 18 novembre 2026 un comunicato dell'amministrazione, riprodotto dalla stampa, annuncia un atto d'indirizzo per un'area al Parco Argada; il 19 novembre LameziaInforma riferisce di aver consultato una delibera che prevede individuazione tecnica degli spazi e ricerca di sponsorizzazioni. Non sono state acquisite delibera originale, numero identificativo, accordi privati, affidamenti o prova di realizzazione. L'atto del 2026 non è attribuito causalmente alla proposta del 2023, né la coincidenza di sito dimostra recepimento; è solo uno sviluppo tematico documentato editorialmente. Destinatario espresso in fonte 2023 distinto da assessment competenza not_assessed. Citywide senza WGS84, il sito Argada è riferimento descrittivo e non georeferenziazione della proposta.",
    "evidenceLevel": "ricostruzione_multi_fonte",
    "firstSeen": "2023-02-17",
    "lastUpdated": "2026-11-19",
    "events": [
      {
        "id": "gianturco-aree-cani-proposta-2023-02-17",
        "date": "2023-02-17",
        "type": "emersione",
        "title": "Gianturco propone tre aree di sgambamento per cani",
        "summary": "Il gruppo Lamezia Prima Di Tutto chiede aree recintate nelle tre macrozone con ombra, acqua e attrezzature. Il deposito è dichiarato ma non provato da copia protocollata.",
        "sourceLabel": "il Lametino, 17 febbraio 2023",
        "sourceUrl": "https://www.lametino.it/ultimora/lamezia-gianturco-comune-realizzi-area-sgambamento-cani.html",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "aree-cani-argada-giunta-comunicato-2026-11-18",
        "date": "2026-11-18",
        "type": "aggiornamento",
        "title": "La Giunta annuncia un atto d'indirizzo per un'area cani al Parco Argada",
        "summary": "Comunicazione dell'amministrazione, ripresa dalla stampa: area separata dagli spazi sportivi e ricerca di sponsorizzazioni. Non dimostra attuazione né legame causale con la proposta del 2023.",
        "sourceLabel": "PianaInforma — comunicato della Giunta, 18 novembre 2026",
        "sourceUrl": "https://www.pianainforma.it/news-calabria/festivita-natalizie-sport-inclusivo-benessere-animale-e-programmazione-la-giunta-di-lamezia-terme-vara-il-nuovo-pacchetto-di-provvedimenti",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "aree-cani-argada-dettagli-delibera-stampa-2026-11-19",
        "date": "2026-11-19",
        "type": "aggiornamento",
        "title": "La stampa riporta le condizioni di fattibilità e sponsorizzazione per l'area Argada",
        "summary": "LameziaInforma riporta la delibera: scelta tecnica del sito, separazione funzionale e sponsor da individuare per opere e gestione; atto originale non acquisito.",
        "sourceLabel": "LameziaInforma, 19 novembre 2026",
        "sourceUrl": "https://www.lameziainforma.it/istituzione/2026/11/19/area-cani-nel-parco-argada-interamente-a-spese-dei-privati-che-vorranno-sponsorizzarla/70354/",
        "evidenceLevel": "fonte_stampa"
      }
    ]
  }
] as const satisfies readonly PublicProposal[];
