import type { PublicProposal } from "./propostePubblicheCore";

/** Recupero di un appello civico storico e di uno sviluppo segnalato: nessuna attuazione inferita. */
export const SCOUTED_PUBLIC_PROPOSALS_20261123_CURCIO = [
  {
    "id": "via-domenico-curcio-manutenzione-drenaggio-residenti-2026",
    "title": "Residenti di via Domenico Curcio chiedono interventi stradali e verifiche sullo scolo delle acque dopo la bitumazione riferita",
    "summary": "Il 16 luglio 2026 i residenti di via Domenico Curcio, a Magolà, chiedono all'Amministrazione comunale un intervento di manutenzione straordinaria e messa in sicurezza della strada. Il 3 novembre riferiscono che, dopo una bitumazione, lo scolo delle acque meteoriche sarebbe stato ricoperto e la carreggiata risulterebbe allagata in caso di pioggia; richiedono una verifica tecnica, il ripristino del deflusso e chiarimenti sui lavori. L'esecuzione e le modalità dei lavori sono descritte dalla stampa sulla base della testimonianza degli abitanti, non verificate con un atto comunale; non è accertato alcun recepimento, nesso causale o intervento correttivo.",
    "promoterId": "residenti-via-domenico-curcio-magola",
    "promoter": "Residenti di via Domenico Curcio (Magolà)",
    "promoterType": "cittadino_comitato",
    "periodLabel": "16 luglio – 3 novembre 2026",
    "year": "2026",
    "theme": "Manutenzione e drenaggio stradale a Magolà",
    "threadId": "via-domenico-curcio-sicurezza-drenaggio-magola-2026",
    "threadLabel": "Via Domenico Curcio: manutenzione e deflusso delle acque",
    "territorialArea": "Via Domenico Curcio, frazione Magolà, Lamezia Terme",
    "institutionalRecipient": "Comune di Lamezia Terme — Sindaco e Amministrazione comunale",
    "channel": "altro",
    "sourceLabel": "La Novità Online — appello dei residenti, 16 luglio 2026",
    "sourceUrl": "https://lanovitaonline.it/https-lanovitaonline-it-lamezia-terme-via-domenico-curcio-nel-degrado-i-residenti-servono-interventi-immediati-video",
    "status": "proposta_emersa",
    "linkedActs": [],
    "verificationNote": "Le fonti originali consultate sono l'appello dei residenti del 16/07/2026 e il successivo articolo del 03/11/2026, entrambi pubblicati da La Novità Online. Nella prima fonte sono riferite precedenti istanze e una nuova comunicazione al Comune; nella seconda sono menzionate email e PEC, ma non sono disponibili copie, ricevute, protocolli, progetti stradali, affidamenti o verbali tecnici. Si documentano le richieste e un aggiornamento riferito, non un deposito formalmente provato. L'esecuzione della bitumazione e la presunta copertura dello scolo sono affermazioni dei residenti riportate dal giornale; l'intervento non è verificato su un atto amministrativo, non è attribuito causalmente alla proposta di luglio e non è evidenza di attuazione della richiesta complessiva. Non è disponibile un riscontro tecnico sul drenaggio. Destinatario esplicitamente documentato nell'appello di luglio; competenza istituzionale non valutata (not_assessed), non inferita dal destinatario. Localizzazione area Magolà, associata alla macrozona di Nicastro sulla base di fonti di contesto territoriale; coordinate WGS84 non attribuite.",
    "evidenceLevel": "ricostruzione_multi_fonte",
    "firstSeen": "2026-07-16",
    "lastUpdated": "2026-11-03",
    "events": [
      {
        "id": "via-curcio-richiesta-manutenzione-2026-07-16",
        "date": "2026-07-16",
        "type": "emersione",
        "title": "I residenti chiedono manutenzione straordinaria e messa in sicurezza della via",
        "summary": "Appello pubblico al Comune per affrontare buche, dissesti e sicurezza della circolazione. Sono menzionate istanze precedenti e una comunicazione al Comune, ma nessuna ricevuta o protocollo è acquisito.",
        "sourceLabel": "La Novità Online, 16 luglio 2026",
        "sourceUrl": "https://lanovitaonline.it/https-lanovitaonline-it-lamezia-terme-via-domenico-curcio-nel-degrado-i-residenti-servono-interventi-immediati-video",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "via-curcio-segnalazione-drenaggio-2026-11-03",
        "date": "2026-11-03",
        "type": "aggiornamento",
        "title": "Segnalati allagamenti e possibili criticità dello scolo dopo lavori riferiti dai residenti",
        "summary": "I residenti riferiscono lavori di bitumazione e sostengono che uno scolo delle acque piovane sia rimasto ostruito o coperto, chiedendo intervento e chiarimenti sulle opere. Mancano prova amministrativa dell'esecuzione e verifica tecnica del difetto; non si registra recepimento o attuazione della proposta.",
        "sourceLabel": "La Novità Online, 3 novembre 2026",
        "sourceUrl": "https://lanovitaonline.it/lamezia-terme-asfaltano-la-strada-ma-cancellano-lo-scolo-alla-prima-pioggia-via-domenico-curcio-diventa-un-fiume-video/",
        "evidenceLevel": "fonte_stampa"
      }
    ]
  }
] as const satisfies readonly PublicProposal[];
