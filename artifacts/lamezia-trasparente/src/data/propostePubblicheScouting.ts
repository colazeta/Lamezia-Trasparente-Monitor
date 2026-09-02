import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Record aggiuntivi verificati durante lo scouting successivo al consolidamento
 * del dataset principale. Il modulo pubblico li unisce al core in modo trasparente.
 * Le proposte con oggetto coincidente ma promotore diverso restano record distinti,
 * condividendo lo stesso thread tematico.
 */
export const SCOUTED_PUBLIC_PROPOSALS = [
  {
    id: "emodinamica-h24-vescio-2026",
    title: "Emodinamica H24 e personale stabile al Giovanni Paolo II",
    summary:
      "Richiesta di attivare a Lamezia un servizio di emodinamica H24 capace di gestire anche le emergenze cardiologiche, superando il modello H6/H12 con équipe itineranti e rafforzando il presidio con personale stabile; viene chiesta inoltre trasparenza sui dati e sui criteri utilizzati nella programmazione regionale.",
    promoterId: "lidia-vescio",
    promoter: "Lidia Vescio (PD)",
    promoterType: "consigliere",
    periodLabel: "14 agosto 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria — Presidente e programmazione sanitaria regionale",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia, 14 agosto 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_08_14/emodinamica-vescio-presidente-occhiuto-e-centrodestra-qual-e-la-vostra-visione-per-lospedale-di-lamezia-terme_65701/",
    status: "proposta_emersa",
    linkedActs: ["DGR Calabria n. 400/2026"],
    verificationNote:
      "La nota della consigliera formula richieste operative sufficientemente determinate: emodinamica H24 anche per le emergenze, personale stabile e pubblicazione dei dati e criteri alla base della scelta H6/H12. Non è stato verificato, per questa specifica iniziativa del 14 agosto, un deposito consiliare o regionale; resta quindi distinta dalla successiva mozione regionale di Elisa Scutellà pur condividendone il filone.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-14",
    lastUpdated: "2026-08-14",
    events: [
      {
        id: "emodinamica-vescio-richiesta-h24",
        date: "2026-08-14",
        type: "emersione",
        title: "Vescio chiede emodinamica H24, personale stabile e trasparenza sui criteri",
        summary:
          "La consigliera sostiene la necessità di un servizio H24 al Giovanni Paolo II, contesta l'adeguatezza di un modello basato su équipe itineranti e chiede che la Regione renda pubblici dati e criteri utilizzati per definire la rete cardiologica.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_08_14/emodinamica-vescio-presidente-occhiuto-e-centrodestra-qual-e-la-vostra-visione-per-lospedale-di-lamezia-terme_65701/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "emodinamica-h24-nucifero-2026",
    title: "Emodinamica strutturale H24 e investimenti per il Giovanni Paolo II",
    summary:
      "Richiesta di istituire un servizio di emodinamica strutturale H24 al Giovanni Paolo II, escludendo una soluzione itinerante, e di accompagnarlo con maggiori investimenti in personale, infrastrutture, diagnostica e pronto soccorso.",
    promoterId: "fernando-nucifero-udc",
    promoter: "Fernando Nucifero (UDC)",
    promoterType: "forza_politica",
    periodLabel: "19 agosto 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-emodinamica-h24",
    threadLabel: "Ospedale Giovanni Paolo II: emodinamica H24 e rete cardiologica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient: "Regione Calabria",
    channel: "comunicato",
    sourceLabel: "Corriere di Lamezia, 19 agosto 2026",
    sourceUrl:
      "https://www.corrieredilamezia.it/politica/2026_08_19/nucifero-la-salute-non-ha-colori-politici-lamezia-merita-unemodinamica-h24-e-investimenti-reali-sullospedale-giovanni-paolo-ii_65831/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La nota del dirigente UDC contiene misure concrete — emodinamica strutturale H24, rifiuto del modello itinerante e investimenti su personale e dotazioni — ma non documenta un atto formalmente depositato. Il record resta distinto dalle iniziative di Lidia Vescio ed Elisa Scutellà perché il criterio di deduplicazione considera anche il promotore; i tre record condividono invece lo stesso filone tematico.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-19",
    lastUpdated: "2026-08-19",
    events: [
      {
        id: "emodinamica-nucifero-richiesta-h24",
        date: "2026-08-19",
        type: "emersione",
        title: "Nucifero chiede emodinamica strutturale H24 e maggiori investimenti",
        summary:
          "Nucifero chiede un servizio H24 non itinerante e un rafforzamento complessivo del presidio attraverso personale, infrastrutture, diagnostica e pronto soccorso.",
        sourceLabel: "Corriere di Lamezia",
        sourceUrl:
          "https://www.corrieredilamezia.it/politica/2026_08_19/nucifero-la-salute-non-ha-colori-politici-lamezia-merita-unemodinamica-h24-e-investimenti-reali-sullospedale-giovanni-paolo-ii_65831/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "scuole-orario-ridotto-caldo-settembre-2026",
    title: "Orario scolastico ridotto a settembre per il caldo",
    summary:
      "Richiesta di predisporre per l'intero mese di settembre un orario ridotto in tutte le scuole cittadine di ogni ordine e grado, come misura temporanea contro le elevate temperature negli edifici privi di adeguata climatizzazione o ventilazione.",
    promoterId: "fernando-nucifero-udc",
    promoter: "Fernando Nucifero (UDC)",
    promoterType: "forza_politica",
    periodLabel: "31 agosto 2026",
    year: "2026",
    theme: "Scuola, clima e sicurezza",
    threadId: "scuole-caldo-estremo",
    threadLabel: "Scuole: caldo estremo, orari e adeguamento degli edifici",
    territorialArea: "Istituti scolastici del territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme e dirigenti scolastici",
    channel: "comunicato",
    sourceLabel: "City One, 31 agosto 2026",
    sourceUrl:
      "https://www.cityonelamezia.it/emergenza-caldo-nucifero-udc-propone-orario-ridotto-per-tutte-le-scuole-cittadine-per-il-mese-di-settembre/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte attribuisce a Nucifero una misura circoscritta e operativa: riduzione dell'orario per tutte le scuole cittadine durante settembre. Non è stato verificato un atto formalmente depositato, un provvedimento comunale o una decisione dei dirigenti scolastici. Il record documenta la proposta e non assume che il Comune disponga da solo di tutte le competenze necessarie alla sua attuazione.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-31",
    lastUpdated: "2026-08-31",
    events: [
      {
        id: "scuole-nucifero-orario-ridotto-settembre",
        date: "2026-08-31",
        type: "emersione",
        title: "Nucifero propone un orario ridotto per le scuole durante settembre",
        summary:
          "La proposta chiede una rimodulazione temporanea del monte ore giornaliero per tutte le scuole cittadine, motivandola con le temperature elevate e con l'assenza, in diversi edifici, di sistemi adeguati di climatizzazione o ventilazione.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/emergenza-caldo-nucifero-udc-propone-orario-ridotto-per-tutte-le-scuole-cittadine-per-il-mese-di-settembre/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "tutela-animali-regolamento-garante-sportello-2026",
    title: "Aggiornamento del regolamento e strumenti comunali per la tutela degli animali",
    summary:
      "Pacchetto di richieste per aggiornare e condividere il regolamento comunale sui diritti degli animali alla normativa regionale, promuovere attività didattico-culturali, attivare uno sportello di ascolto, nominare un garante per i diritti degli animali e formalizzare una rete di contatti per le emergenze.",
    promoterId: "ninfa-marilena-vescio",
    promoter: "Ninfa Marilena Vescio",
    promoterType: "cittadino_comitato",
    periodLabel: "31 agosto 2026",
    year: "2026",
    theme: "Tutela animale e servizi civici",
    threadId: "tutela-animali-servizi-comunali",
    threadLabel: "Tutela degli animali: regole, servizi e partecipazione",
    territorialArea: "Intero territorio comunale di Lamezia Terme",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 31 agosto 2026",
    sourceUrl:
      "https://www.lametino.it/ultimora/lamezia-al-via-la-raccolta-di-cibo-per-le-colonie-feline-della-citta.html",
    status: "proposta_emersa",
    linkedActs: [
      "Regolamento comunale per la tutela e il benessere degli animali — Delibera n. 7 del 15/03/2016",
      "Legge regionale Calabria n. 45/2023",
    ],
    verificationNote:
      "La nota è pubblicata in occasione di una raccolta alimentare per le colonie feline, ma contiene anche richieste di policy comunale sufficientemente determinate. La promotrice è indicata dalla fonte come referente di colonia felina. Non risultano verificati un deposito formale, una risposta del Comune o l'avvio degli strumenti richiesti. Il luogo della raccolta alimentare non viene usato come geografia della proposta, che riguarda l'intero territorio comunale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-08-31",
    lastUpdated: "2026-08-31",
    events: [
      {
        id: "tutela-animali-vescio-regolamento-garante-sportello",
        date: "2026-08-31",
        type: "emersione",
        title: "Proposti aggiornamento del regolamento, garante, sportello e rete di emergenza",
        summary:
          "Vescio chiede di aggiornare il regolamento comunale alla normativa regionale, sviluppare iniziative educative, attivare uno sportello di ascolto, nominare un garante per i diritti degli animali e rendere ufficiale una rete di contatti utili per le emergenze.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultimora/lamezia-al-via-la-raccolta-di-cibo-per-le-colonie-feline-della-citta.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "scuole-posticipo-apertura-petizione-2026",
    title: "Posticipo di dieci giorni dell'apertura delle scuole",
    summary:
      "Petizione cittadina per chiedere alle istituzioni regionali competenti di rinviare di dieci giorni l'avvio delle lezioni, accompagnando la richiesta con l'apertura di un confronto sulle esigenze organizzative di famiglie e studenti.",
    promoterId: "antonio-vaccaro-petizione-scuola",
    promoter: "Antonio Vaccaro",
    promoterType: "cittadino_comitato",
    periodLabel: "1 settembre 2026",
    year: "2026",
    theme: "Scuola, clima e sicurezza",
    threadId: "scuole-caldo-estremo",
    threadLabel: "Scuole: caldo estremo, orari e adeguamento degli edifici",
    territorialArea: "Istituti scolastici del territorio comunale di Lamezia Terme",
    institutionalRecipient: "Regione Calabria e istituzioni regionali competenti",
    channel: "petizione",
    sourceLabel: "il Lametino, 1 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultimora/lamezia-parte-petizione-per-chiedere-posticipo-di-10-giorni-dellapertura-della-scuola.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte identifica Antonio Vaccaro come promotore e descrive una raccolta firme pubblica avviata il 1 settembre con successiva trasmissione prevista alle istituzioni regionali. Non è stato verificato, al momento dello scouting, l'avvenuto deposito della petizione né un conteggio definitivo delle firme. Il punto di raccolta firme su Corso Giovanni Nicotera non viene usato come geografia della proposta, che riguarda le scuole dell'intero territorio comunale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-01",
    lastUpdated: "2026-09-01",
    events: [
      {
        id: "scuole-vaccaro-avvio-raccolta-firme",
        date: "2026-09-01",
        type: "petizione",
        title: "Avviata la raccolta firme per posticipare l'apertura delle scuole",
        summary:
          "La raccolta firme viene avviata sull'isola pedonale di Corso Giovanni Nicotera con la richiesta di rinviare di dieci giorni l'inizio delle lezioni e di trasmettere successivamente la petizione alle istituzioni regionali competenti.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultimora/lamezia-parte-petizione-per-chiedere-posticipo-di-10-giorni-dellapertura-della-scuola.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "ospedale-organici-continuita-chirurgica-pd-2026",
    title: "Rafforzamento degli organici e continuità chirurgica al Giovanni Paolo II",
    summary:
      "Interrogazione per chiedere misure urgenti e strutturali sulla carenza di personale infermieristico e medico nel blocco operatorio e nei reparti di Urologia, Ortopedia e Oncologia: soluzioni temporanee di mobilità o assegnazione, ricognizione formale dei fabbisogni, rafforzamento stabile degli organici e dei posti letto e convocazione della Conferenza dei Sindaci.",
    promoterId: "gruppo-consiliare-pd-lamezia",
    promoter: "Gruppo consiliare Partito Democratico — Lamezia Terme",
    promoterType: "forza_politica",
    coPromoters: ["Fabrizio Muraca", "Lidia Vescio", "Gennarino Masi"],
    periodLabel: "1 settembre 2026",
    year: "2026",
    theme: "Sanità e rete ospedaliera",
    threadId: "ospedale-organici-continuita-chirurgica",
    threadLabel: "Ospedale Giovanni Paolo II: organici, posti letto e continuità chirurgica",
    territorialArea: "Presidio ospedaliero Giovanni Paolo II, Lamezia Terme",
    institutionalRecipient:
      "Comune di Lamezia Terme — Sindaco e assessore competente; interlocuzione richiesta con ASP Catanzaro e Regione Calabria",
    channel: "interrogazione",
    sourceLabel: "City One, 1 settembre 2026",
    sourceUrl:
      "https://www.cityonelamezia.it/lamezia-carenze-di-organico-allospedale-interrogazione-dei-consiglieri-comunali-del-pd/",
    status: "presentata_formalmente",
    linkedActs: [],
    verificationNote:
      "City One pubblica il testo dell'interrogazione e attribuisce l'iniziativa a Fabrizio Muraca, capogruppo PD, Lidia Vescio e Gennarino Masi; il Lametino ne dà riscontro nello stesso giorno. Non è stato reperito nello scouting un numero di protocollo o un registro consiliare ufficiale dell'atto. La classificazione come presentata formalmente deriva dalla natura esplicita di interrogazione consiliare attestata dalle fonti, non da una verifica del protocollo.",
    evidenceLevel: "ricostruzione_multi_fonte",
    firstSeen: "2026-09-01",
    lastUpdated: "2026-09-01",
    events: [
      {
        id: "ospedale-pd-interrogazione-organici",
        date: "2026-09-01",
        type: "deposito",
        title: "Interrogazione su organici, sedute chirurgiche e posti letto",
        summary:
          "Il gruppo PD chiede al Comune di attivare interlocuzioni con ASP e Regione, sollecitare misure temporanee per ripristinare le sedute chirurgiche, richiedere una ricognizione aggiornata dei fabbisogni e interventi strutturali su personale e posti letto, oltre alla convocazione della Conferenza dei Sindaci del comprensorio.",
        sourceLabel: "City One",
        sourceUrl:
          "https://www.cityonelamezia.it/lamezia-carenze-di-organico-allospedale-interrogazione-dei-consiglieri-comunali-del-pd/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "prevenzione-maltempo-manutenzione-de-sensi-2026",
    title: "Manutenzione preventiva per il maltempo autunnale",
    summary:
      "Richiesta di avviare prima della stagione piovosa un programma di manutenzione ordinaria comprendente pulizia e video-ispezione di caditoie e tombini nei punti critici, potature degli alberi interferenti, pulizia di canali e fossi, verifica di muretti, scarpate e segnaletica e un piano calendarizzato di spazzamento delle foglie.",
    promoterId: "gabriella-de-sensi",
    promoter: "Gabriella De Sensi",
    promoterType: "altro",
    periodLabel: "1 settembre 2026",
    year: "2026",
    theme: "Manutenzione urbana e prevenzione del rischio",
    threadId: "prevenzione-maltempo-manutenzione-territorio",
    threadLabel: "Prevenzione del maltempo e manutenzione ordinaria del territorio",
    territorialArea: "Intero territorio comunale di Lamezia Terme, con priorità ai punti critici storici",
    institutionalRecipient: "Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 1 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/ultime/lamezia-ex-assessore-ai-lavori-pubblici-de-sensi-amministrazione-non-si-faccia-trovare-impreparata-allautunno-e-maltempo.html",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "La fonte qualifica De Sensi come già assessore ai Lavori Pubblici e riporta un elenco operativo di interventi di prevenzione. Non risultano verificati un deposito formale, una calendarizzazione o una risposta dell'Amministrazione. Poiché non vengono identificati singoli punti critici, la proposta è georiferita come citywide e non vengono inventate coordinate locali.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-01",
    lastUpdated: "2026-09-01",
    events: [
      {
        id: "de-sensi-piano-manutenzione-preventiva",
        date: "2026-09-01",
        type: "emersione",
        title: "De Sensi chiede un piano immediato di manutenzione preventiva",
        summary:
          "La proposta elenca interventi su caditoie e tombini, alberature, canali di scolo e fossi, muretti e scarpate, segnaletica e spazzamento delle foglie da programmare già da settembre.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/ultime/lamezia-ex-assessore-ai-lavori-pubblici-de-sensi-amministrazione-non-si-faccia-trovare-impreparata-allautunno-e-maltempo.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
  {
    id: "aeroporto-intermodalita-rilancio-taverna-2026",
    title: "Rilancio dell'aeroporto di Lamezia e intermodalità ferro-aria",
    summary:
      "Proposta di ripensare la politica regionale dei trasporti concentrando il rilancio sullo scalo di Lamezia, rafforzando l'intermodalità ferro-aria e una connessione diretta con l'Alta Velocità, potenziando i servizi di terra, coinvolgendo pienamente Comuni e territori nelle scelte strategiche di SACAL e costruendo collegamenti verso borghi e destinazioni turistiche.",
    promoterId: "domenico-taverna-pd-lamezia",
    promoter: "Domenico Taverna (PD Lamezia)",
    promoterType: "forza_politica",
    periodLabel: "1 settembre 2026",
    year: "2026",
    theme: "Mobilità, aeroporto e sviluppo territoriale",
    threadId: "aeroporto-lamezia-intermodalita",
    threadLabel: "Aeroporto di Lamezia: ruolo strategico, intermodalità e accessibilità",
    territorialArea: "Aeroporto Internazionale di Lamezia Terme, Sant'Eufemia, e collegamenti regionali",
    institutionalRecipient: "Regione Calabria, SACAL e Comune di Lamezia Terme",
    channel: "comunicato",
    sourceLabel: "il Lametino, 1 settembre 2026",
    sourceUrl:
      "https://www.lametino.it/calabria/aeroporti-calabresi-taverna-pd-lamezia-tagliamo-nastri-delle-opere-ma-perdiamo-voli.html",
    status: "proposta_emersa",
    linkedActs: ["Proposta Piano Nazionale degli Aeroporti 2026–2035"],
    verificationNote:
      "La nota contiene, oltre alla critica politica, un nucleo di misure sufficientemente concreto: rilancio dello scalo lametino, intermodalità ferro-aria con connessione all'Alta Velocità, potenziamento dei servizi di terra, maggiore coinvolgimento dei Comuni nelle scelte SACAL e collegamenti dei visitatori con le destinazioni del territorio. Non sono verificati un atto depositato o una risposta istituzionale. La geografia è ancorata all'aeroporto; le misure di rete hanno però portata regionale e non vengono ridotte a un singolo punto infrastrutturale.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-01",
    lastUpdated: "2026-09-01",
    events: [
      {
        id: "taverna-rilancio-aeroporto-intermodalita",
        date: "2026-09-01",
        type: "emersione",
        title: "Taverna propone rilancio dello scalo e connessioni intermodali",
        summary:
          "La proposta indica come priorità il rafforzamento del ruolo dell'aeroporto di Lamezia, la connessione ferro-aria e con l'Alta Velocità, servizi di terra più forti, coinvolgimento dei territori nelle scelte SACAL e una rete di trasporto verso le destinazioni turistiche regionali.",
        sourceLabel: "il Lametino",
        sourceUrl:
          "https://www.lametino.it/calabria/aeroporti-calabresi-taverna-pd-lamezia-tagliamo-nastri-delle-opere-ma-perdiamo-voli.html",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];