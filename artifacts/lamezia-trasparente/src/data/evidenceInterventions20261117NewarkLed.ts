import type { EvidenceIntervention } from "./evidenceInterventions";

/** Newark 2019–2021 staggered DiD, original peer-reviewed article and municipal collaboration verified 2026-11-17. */
export const EVIDENCE_INTERVENTIONS_2026_11_17_NEWARK_LED: readonly EvidenceIntervention[] = [
  {
    "id": "newark-new-jersey-targeted-led-streetlighting-did-2019",
    "title": "Newark: sostituzione mirata dell'illuminazione stradale HPS con LED e prevenzione situazionale dei reati notturni",
    "authority": "Newark Public Safety Collaborative (Rutgers University–Newark), PSE&G e partner di sicurezza pubblica della città di Newark",
    "territory": "Newark, New Jersey; quartieri South, West e Central wards, segmenti stradali selezionati",
    "country": "Stati Uniti",
    "implementationYear": "2019–2021 (1.419 apparecchi sostituiti); dati valutativi su reati 2018–2023; studio pubblicato il 24 settembre 2026",
    "problem": "Concentrazione localizzata di episodi di violenza e reati registrati durante le ore notturne in strade poco illuminate; necessità di definire priorità infrastrutturali e comprenderne l'effetto reale, nel breve e nel lungo periodo.",
    "measure": "Partnership territoriale per sostituire 1.419 vecchi apparecchi a sodio ad alta pressione (HPS) con apparecchi LED fra 2019 e 2021. Priorità ai segmenti con precedenti reati violenti notturni tramite analisi geospaziale; estensione delle sostituzioni ai lampioni contigui dello stesso segmento per continuità operativa. Programma effettivamente realizzato, non RCT e non illuminazione temporanea portatile.",
    "mechanism": "Una migliore visibilità dello spazio pubblico può aumentare la possibilità di osservare comportamenti, favorire la presenza di persone e modificare opportunità situazionali di reato. La selezione degli interventi combina dati su rischi territoriali pregressi e competenze del gestore, senza dimostrare quale meccanismo specifico abbia causato i risultati.",
    "population": "Residenti, commercianti, pedoni e altri utilizzatori delle strade trattate; analisi sui reati denunciati alla Newark Police Division, non su individui randomizzati, attorno a 1.419 punti luce trattati.",
    "primaryArea": "sicurezza_urbana_prevenzione",
    "secondaryAreas": [
      "ambiente_clima_energia",
      "mobilita_spazio_pubblico",
      "capacita_amministrativa_personale",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "targeting_data_analytics",
      "partnership_pubblico_privato_terzo_settore",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "geolocalizzazione di lampioni e date di installazione da PSE&G",
      "ranking territoriale delle priorità sulla base di precedenti reati notturni registrati",
      "sostituzione degli apparecchi HPS con LED lungo segmenti stradali",
      "dati CompStat della Newark Police Division con georeferenziazione e data/ora dei reati",
      "confronto per punti luce sostituiti, non sostituiti e aree prossime di possibile spillover",
      "collaborazione tra utility, università, partner municipali e organizzazioni comunitarie"
    ],
    "territorialScale": "Intervento multiquartiere; unità analitica attorno a singoli lampioni (buffer di 200 piedi, circa 61 m), confronti di spostamento fra 200–750 piedi e controlli fra 750–2.000 piedi.",
    "interventionStatus": "Sostituzioni del programma analizzato eseguite nel 2019–2021. La ricerca 2026 ne valuta gli effetti sino a due anni dopo ciascun intervento; non è stata verificata la manutenzione o la prosecuzione esatta dello stesso programma oltre il periodo di studio.",
    "evaluationMethod": "Quasi-esperimento staggered difference-in-differences (Gardner two-stage estimator) con date di trattamento scaglionate, effetti fissi per lampione e giorno, event-study trimestrali e ATT medi su 2, 4 e 8 trimestri. Dati su incidenti 2018–2023 e installazioni 2019–2021; analisi di reati all'aperto di notte, confronti falsificazione su reati indoor e daytime, test per displacement. Non randomizzato; parallel trends richiesti.",
    "comparator": "Lampioni HPS non sostituiti e sufficientemente lontani dalle installazioni trattate (circa 750–2.000 piedi) nello stesso contesto urbano e nel periodo analitico; aree non trattate più vicine analizzate separatamente per individuare possibile displacement. Aree e momenti non assegnati casualmente.",
    "outcomes": [
      "numero di episodi registrati di reati violenti notturni all'aperto nei pressi dei lampioni",
      "reati contro il patrimonio notturni all'aperto",
      "aggressioni aggravate, rapine e omicidi come categorie disaggregate",
      "reati durante il giorno e in ambienti interni come falsification / confronto",
      "possibile spostamento spaziale verso i lampioni non sostituiti vicini",
      "durata dell'effetto e rebound a 12–24 mesi"
    ],
    "results": "La stima DiD identifica una riduzione relativa del 46% nei reati violenti notturni all'aperto nei primi sei mesi successivi alla sostituzione, nel buffer dei lampioni trattati, rispetto al controfattuale stimato. Nei primi quattro trimestri ATT medio −35%, ma la riduzione è concentrata soprattutto nei primi sei mesi. Dopo otto trimestri non emerge una diminuzione statisticamente significativa della violenza o dei reati patrimoniali complessivi. L'analisi per evento segnala una risalita della violenza intorno al settimo trimestre; i risultati per singole fattispecie presentano differenze e non supportano riduzioni generali di tutti i reati. Non sono rilevati forti segnali di displacement verso lampioni vicini o alle ore diurne, ma i test non ne dimostrano l'assenza assoluta. Non è un effetto cittadino del −46%, né una riduzione duratura dimostrata.",
    "effectSize": "ATT reati violenti outdoor notturni nei 200 piedi dai lampioni: −46% sul periodo dei primi 2 trimestri, −35% su 4 trimestri; effetto su 8 trimestri non statisticamente significativo. Event-study: −50% primo trimestre, −54% secondo trimestre, +54% settimo trimestre, stimati rispetto al livello di riferimento del gruppo trattato. Gli autori stimano circa 34 episodi in meno complessivamente attorno ai lampioni trattati nei primi sei mesi. Reati patrimoniali complessivi outdoor notturni: nessuna riduzione significativa. Sono effetti modellizzati, non decrementi percentuali sull'intera città.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Il costo integrale per l'upgrade dei 1.419 punti luce non è riportato nello studio; i vantaggi di consumo e di vita utile del LED sono discussi qualitativamente ma non quantificati come risparmio consuntivo di questo programma. Necessari inventario e proprietà dei lampioni, stato/guasti, disponibilità di budget e contratto col gestore, standard fotometrici e di sicurezza stradale, analisi privacy e aggregazione di dati di sicurezza, manutenzione e monitoraggio 24 mesi o più.",
    "limitations": [
      "Installazioni prioritizzate nelle zone di maggiore violenza pregressa: confronto non randomizzato e possibile selezione, regressione verso la media o politiche concomitanti, non eliminabili completamente con i controlli DiD.",
      "Il periodo 2019–2021 coincide con le restrizioni COVID-19, che hanno alterato attività e denunce; effetti fissi e falsificazioni attenuano ma non eliminano rischi di confondimento differenziale.",
      "Outcome costituiti da reati registrati dalla polizia entro piccoli buffer spaziali, non misure esaustive di vittimizzazione: possono variare propensione alla denuncia e pattugliamento.",
      "La diminuzione stimata riguarda solo i reati violenti notturni all'aperto nei primi sei mesi; ATT a otto trimestri non significativo e assenza di effetti generali sui reati patrimoniali.",
      "Alcuni confronti di tipologie disaggregate, come la persistenza degli effetti sulle rapine nel secondo semestre, presentano problematiche nei trend precedenti al trattamento e richiedono cautela.",
      "Alcuni esiti rari, quali omicidi, hanno basi numeriche limitate; nessuna prova che effetti simili si manifesterebbero a Lamezia con profili di rischio differenti.",
      "Lo studio non isola il meccanismo di deterrenza e non valuta in modo causale percezioni soggettive, consumo elettrico misurato o benefici netti.",
      "Non estrapolare l'effetto da 200 piedi attorno al lampione a un intero quartiere né interpretare l'assenza di significatività come dimostrazione di effetto esattamente nullo."
    ],
    "unintendedEffects": "L'effetto favorevole si esaurisce nel tempo; l'event-study mostra una risalita statisticamente significativa dei reati violenti nel settimo trimestre, che non dimostra necessariamente che i LED abbiano causato più reati a lungo termine. Non emerge displacement rilevabile nei controlli prossimali o diurni, con limiti di potenza. Rischi attuativi da monitorare in Italia: abbagliamento, inquinamento luminoso, costi e mancata manutenzione; non quantificati causalmente nel trial.",
    "primarySource": {
      "label": "Newark Public Safety Collaborative (Rutgers–Newark) — programma di sostituzione LED basato su dati territoriali",
      "url": "https://newarkcollaborative.org/"
    },
    "evaluationStudies": [
      {
        "label": "Giménez-Santana et al. (2026), Journal of Quantitative Criminology — articolo originale open access",
        "url": "https://link.springer.com/article/10.1007/s10940-026-09690-6",
        "doi": "10.1007/s10940-026-09690-6",
        "citation": "Giménez-Santana, A., Tissandier, G., Zlaoui, K., Santos, A., Caplan, J. M. e Kennedy, L. W. (2026). Evaluating the Effect of Enhanced LED Street Lighting on Nighttime Crime in Newark, New Jersey. Journal of Quantitative Criminology. Pubblicato online 24 settembre 2026."
      },
      {
        "label": "Rutgers University–Newark — comunicazione istituzionale dei risultati (28 settembre 2026)",
        "url": "https://www.newark.rutgers.edu/news/rutgers-newark-study-finds-brighter-street-lighting-reduced-violent-crime-nearly-46-percent",
        "citation": "Rutgers University–Newark (28 settembre 2026), Rutgers-Newark Study Finds Brighter Street Lighting Reduced Violent Crime Nearly 46 Percent."
      },
      {
        "label": "Comune di Lamezia Terme — canali ufficiali segnalazione guasti illuminazione (2022)",
        "url": "https://www.comune.lamezia-terme.cz.it/it/news/illuminazione-pubblica-segnalazioni",
        "citation": "Città di Lamezia Terme, Illuminazione pubblica — segnalazioni, 8 agosto 2022."
      },
      {
        "label": "MacDonald et al. (2026), Philadelphia LED citywide — caso diverso già censito",
        "url": "https://doi.org/10.1111/1745-9133.70006",
        "citation": "MacDonald et al., Can enhanced street lighting improve public safety at scale?, Criminology & Public Policy (2025 online/2026 volume). Distinta giurisdizione, implementazione e valutazione."
      }
    ],
    "lastVerifiedAt": "2026-11-17",
    "transferabilityItaly": "Potenzialmente trasferibile il metodo di audit fisico/energetico degli impianti e priorità di manutenzione basate su indicatori aggregati di sicurezza e fruibilità, in collaborazione con gestore e autorità competenti. Non attribuire al Comune competenze di polizia giudiziaria, non diffondere mappe di singoli episodi o creare profili individuali. Verificare quadro contrattuale, standard di illuminotecnica e sostenibilità dell'intervento prima di ipotizzare upgrade.",
    "lameziaAdaptation": "Dal 1 settembre 2022 Lamezia dispone di un servizio di segnalazioni guasti pubblica illuminazione tramite numero verde, e-mail e CityGreenApp (fonte ufficiale Comune); non è verificato un censimento pubblico aggiornato dello stato dei punti luce. Prima ricostruire, con gestore e Comune, un inventario aggregato di impianti, data installazione, potenza, guasti, tempi di riparazione, reclami e dati di illuminamento, preservando la privacy. Valutare insieme ai competenti organismi pubblici e alle rappresentanze locali priorità su percorsi pedonali, fermate, scuole e punti di frequente segnalazione, senza presumere correlazioni con reati. Se esistono zone con necessità verificata di upgrade, usare lotti progressivi e controlli analoghi; seguire reati aggregati, percezione di sicurezza, guasti, consumi e costi a 6/12/24 mesi, con procedure per non interpretare erroneamente oscillazioni dei reati.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario GIS e titolarità dei punti luce, tecnologia, fotometria, potenza e data upgrade",
      "segnalazioni guasto con esito e tempi, storicizzazione del ticketing",
      "accordi con gestore, competenze e costi di manutenzione / sostituzione e misure kWh",
      "dati territoriali aggregati e appropriati delle criticità di sicurezza, senza geolocalizzare individui o inferire misconduct",
      "baseline pre-intervento, procedure di selezione aree e comparatori non trattati",
      "indicatori a 6/12/24 mesi su guasti, qualità illuminazione, sicurezza percepita, utilizzo e costi",
      "verifica standard ANAC per affidamenti quando pertinenti e GDPR per trattamento e pubblicazione"
    ],
    "tags": [
      "Newark",
      "New Jersey",
      "2019–2021",
      "LED",
      "illuminazione pubblica",
      "sicurezza urbana",
      "prevenzione situazionale",
      "CPTED",
      "staggered DiD",
      "Gardner estimator",
      "2026 peer-reviewed",
      "effetto breve",
      "effetto non persistente",
      "PSE&G",
      "Rutgers",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-17",
        "note": "Discovery con Parallel Search, verifica diretta dell'articolo open access Springer 24-09-2026, documentazione del programma NPSC e comunicazione Rutgers; controllati dati originali, 1.419 LED, ATT −46% primi 2 trimestri e assenza di efficacia a 8 trimestri. Deduplicazione rispetto al caso Philadelphia LED del 2023 e ricerche GitHub su Newark e DOI. Sottolineati intervento non randomizzato, possibile selezione/COVID e rischio di sovrainterpretare tassi di reati di breve periodo. Verificato il canale comunale ufficiale Lamezia per segnalazione guasti, non lo stato operativo attuale dei singoli punti luce."
      }
    ]
  }
];
