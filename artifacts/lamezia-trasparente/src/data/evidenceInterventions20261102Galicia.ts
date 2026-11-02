import type { EvidenceIntervention } from "./evidenceInterventions";

/** Galicia seven-city RCT (2022–23); original Ministry evaluation and Hospido & Varela (2026) verified 2026-11-02. */
export const EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA: readonly EvidenceIntervention[] = [
  {
    "id": "galicia-seven-cities-integrated-child-inclusion-support-rct-2022",
    "title": "Galizia: accompagnamento integrato e personalizzato delle famiglie con minori contro la deprivazione e l'esclusione sociale",
    "authority": "Xunta de Galicia — Consellería de Política Social e Xuventude, con Ministerio de Inclusión e organizzazioni del Terzo settore",
    "territory": "Sette città: A Coruña, Ferrol, Lugo, Ourense, Pontevedra, Santiago de Compostela e Vigo; il programma più ampio includeva aree rurali valutate con un disegno distinto",
    "country": "Spagna",
    "implementationYear": "Reclutamento e assegnazione 2022; presa in carico intensiva per tre mesi nel 2023; endline settembre–novembre 2023; valutazione peer-reviewed 2026",
    "problem": "Famiglie con minori in vulnerabilità presentavano carenze materiali e barriere interconnesse: precarietà abitativa, spese scolastiche, accesso ai servizi, isolamento sociale e difficoltà occupazionali. Il sostegno monetario ordinario non elimina necessariamente gli ostacoli pratici all'inclusione.",
    "measure": "Progetto integral de acompañamiento para la reducción de la pobreza infantil: dopo diagnosi multidimensionale di ogni nucleo, attivazione di un piano intensivo personalizzato di circa tre mesi, selezionando tra 22 interventi nei pacchetti inclusione sociale (abitazione, utenze, salute, competenze digitali e genitorialità), sostegno educativo e attivazione lavorativa. Realizzazione regionale con servizi e Terzo settore; il controllo ha continuato a ricevere prestazioni economiche e servizi sociali ordinari.",
    "mechanism": "Aggiungere alla rete di protezione esistente un case management capace di coordinare aiuti immediati e servizi specifici per ogni membro della famiglia riduce costi di accesso, complessità amministrativa e deprivazioni concrete, migliorando condizioni materiali, responsabilità genitoriali, scuola e integrazione comunitaria.",
    "population": "Nuclei con figli minori vulnerabili, in maggioranza beneficiari IMV nazionale o RISGA regionale, residenti nelle sette principali città della Galizia. 2.359 famiglie randomizzate (1.060 trattamento, 1.299 controllo); 2.038 incluse nel campione analitico dopo esclusioni pre-baseline (910 e 1.128); 1.862 intervistate a endline. Le famiglie rurali del progetto non fanno parte del medesimo RCT urbano.",
    "primaryArea": "welfare_inclusione_servizi_sociali",
    "secondaryAreas": [
      "istruzione_giovani",
      "housing_politiche_abitative",
      "sviluppo_economico_commercio_lavoro",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore",
      "targeting_data_analytics",
      "formazione_capacity_building"
    ],
    "tools": [
      "valutazione multidimensionale del nucleo e piano individualizzato",
      "case manager e coordinamento tra servizi territoriali e organizzazioni sociali",
      "catalogo di 22 interventi organizzati in tre pacchetti",
      "dati di survey baseline/endline e registri amministrativi del lavoro",
      "assegnazione casuale stratificata per comune e struttura familiare",
      "indicatori standardizzati di deprivazione infantile e inclusione sociale"
    ],
    "territorialScale": "Programma regionale attuato in sette grandi municipalità, con assegnazione delle famiglie al trattamento entro 14 strati città × famiglia monoparentale/non monoparentale. Le tre aree rurali del programma generale erano valutate separatamente.",
    "interventionStatus": "Progetto pilota di durata definita avviato nel 2022 e valutato nel 2023; pubblicazione scientifica definitiva nel 2026. Non è stata verificata la trasformazione in prestazione permanente o la sua applicazione immutata nel 2026.",
    "evaluationMethod": "Randomized controlled trial con randomizzazione stratificata su 14 strati, stime intention-to-treat (ITT) degli effetti dell'offerta del pacchetto personalizzato contro business-as-usual; outcome prevalentemente da questionari pre/post e in parte dati amministrativi occupazionali; correzione Romano–Wolf per molteplici ipotesi. Le stime pubblicate nell'articolo riguardano le sette città e non il sottoprogramma rurale.",
    "comparator": "Nuclei vulnerabili residenti nelle medesime sette città, assegnati casualmente al controllo; hanno continuato ad accedere all'IMV/RISGA, ai servizi sociali comunali/regionali ordinari e alle risorse del Terzo settore, senza il pacchetto intensivo aggiuntivo.",
    "outcomes": [
      "indice standardizzato di deprivazione materiale infantile (valore più alto = minore deprivazione)",
      "indice composito standardizzato di inclusione sociale",
      "condizioni abitative, responsabilità genitoriali, partecipazione comunitaria, educazione",
      "indicatore sintetico di povertà AROPE semplificato e reddito familiare",
      "occupabilità, ricerca di lavoro, occupazione e reddito da lavoro",
      "salute e competenze digitali"
    ],
    "results": "L'offerta del sostegno integrato personalizzato migliora significativamente deprivazione infantile e inclusione sociale complessiva rispetto al controllo che riceve il sostegno ordinario. I miglioramenti più robusti comprendono alloggio, genitorialità, integrazione comunitaria ed educazione, anche correggendo per test multipli. Non sono identificati effetti medi robusti nel breve periodo sull'AROPE semplificato, su reddito/occupazione o sugli indici complessivi di salute e competenze digitali. Aumentano alcune attività di ricerca del lavoro, ma non l'occupazione osservata in survey/registri.",
    "effectSize": "Child material deprivation index: +0,13–0,17 deviazioni standard in base alla specificazione (significativo con controlli e correzione Romano–Wolf; indice positivo = minore deprivazione). Inclusione sociale complessiva: +0,19–0,25 deviazioni standard, significativa e robusta alla correzione multipla. Alcuni domini: housing circa +0,17 SD, responsabilità genitoriale +0,15 SD, integrazione comunitaria +0,30 SD, educazione +0,18 SD. Queste sono deviazioni standard, NON punti percentuali né riduzioni percentuali della povertà.",
    "evidenceStrength": "forte",
    "costsRequirements": "Secondo Hospido e Varela (2026), costo incrementale medio del pacchetto personalizzato circa €1.132 per nucleo trattato rispetto alla rete ordinaria; NON è una valutazione completa di costo-efficacia né un preventivo italiano. Necessari équipe multidisciplinari, presa in carico, accordi con ETS, servizi scolastici e abitativi, finanziamento di piccoli aiuti, software e valutazione con minimizzazione dati.",
    "limitations": [
      "321 su 2.359 famiglie randomizzate non hanno completato baseline o avviato l'intervento, lasciando 2.038 nel campione analitico; 1.862 completano endline, con risposta 91% trattamento e 92% controllo sulla baseline. Possibile selezione iniziale e almeno un'etereogeneità locale nella perdita di rispondenti.",
      "Outcome principali spesso autoriferiti e osservati dopo un periodo breve; eventuali bias di reporting, effetti sul lungo termine e benefici dei figli in età adulta non dimostrati.",
      "Il trattamento è un pacchetto personalizzato di servizi e piccoli sostegni: lo studio non identifica l'effetto causale di una singola componente, di un trasferimento economico isolato o del solo case management.",
      "L'RCT peer-reviewed riguarda le sette maggiori città: i risultati non si estendono automaticamente alle tre aree rurali, analizzate dall'amministrazione con altra metodologia.",
      "Non sono emersi effetti medi affidabili su indicatori sintetici di povertà, occupazione o reddito nel breve periodo; l'aumento dell'attivazione lavorativa non implica inserimento occupazionale.",
      "Popolazione di famiglie già connesse ai sistemi spagnoli IMV/RISGA e a una rete amministrativa e associativa specifica; per trasferimento italiano servono adattamento istituzionale e verifica legale."
    ],
    "unintendedEffects": "Nessun effetto negativo medio conclusivo evidenziato negli outcome principali, ma possibili rischi di disparità di accesso, carico amministrativo delle équipe, esclusione dei non intercettati dai servizi, duplicazioni tra prestazioni e raccolta eccessiva di dati sensibili. Necessario monitorare variazioni fra città e l'eventuale sostituzione di servizi ordinari.",
    "primarySource": {
      "label": "Ministerio de Inclusión — Proyecto Integral de Acompañamiento para la reducción de la Pobreza Infantil, Xunta de Galicia",
      "url": "https://inclusion.gob.es/web/policy-lab/w/galicia-proyecto-integral-de-acompanamiento-para-la-reduccion-de-la-pobreza-infantil"
    },
    "evaluationStudies": [
      {
        "label": "SERIEs, articolo open access sottoposto a peer review (2026)",
        "url": "https://doi.org/10.1007/s13209-026-00340-5",
        "citation": "Hospido, L. e Varela, B. (2026). Supporting families with children: a randomized controlled trial on social inclusion. SERIEs.",
        "doi": "10.1007/s13209-026-00340-5"
      },
      {
        "label": "Ministerio de Inclusión — Rapporto di valutazione completo, luglio 2026",
        "url": "https://inclusion.gob.es/documents/4913549/0/121-26-018-X_XUNTA_GALICIA.pdf/248f8c7e-558d-0e04-a23a-b9631458799d",
        "citation": "Secretaría General de Inclusión (2026). Laboratorio de Políticas de Inclusión: Resultados de Evaluación — Xunta de Galicia, Proyecto integral de acompañamiento para la reducción de la pobreza infantil."
      }
    ],
    "lastVerifiedAt": "2026-11-02",
    "transferabilityItaly": "Alta come modello organizzativo integrato per Ambiti Territoriali Sociali e Comuni in partenariato con servizi scolastici, Regione, ASP ed ETS; non è replica di una nuova prestazione universale di reddito. Va coordinato con Assegno di inclusione e gli strumenti già spettanti, senza condizionare o randomizzare diritti legali; richiesti accordi interistituzionali e verifica del GDPR.",
    "lameziaAdaptation": "Nell'Ambito Territoriale Sociale di Lamezia, partire da una ricognizione delle famiglie con minori già seguite e dei servizi 2026, inclusi buoni-servizio contro la povertà, sostegno abitativo e co-progettazione ETS; verificare eventuali lacune in scuola, alloggio, utenze e inserimento lavorativo. Costruire un pilota volontario di 3 mesi con assistente sociale/case manager, piano personalizzato e catalogo di servizi aggiuntivi integrati con interventi ordinari; misurare con baseline/endline deprivazione infantile, inclusione, permanenza scolastica e accesso ai servizi. Se risorse limitate, valutare uno scaglionamento equo solo dei servizi aggiuntivi discrezionali e mai delle prestazioni dovute.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "mappa ATS/Comune degli interventi e dei beneficiari con minori, con presupposti legali per l'uso dei dati",
      "accordi di co-progettazione con ETS, scuole, ASP e servizi regionali",
      "protocolli multidisciplinari e personale case manager",
      "finanziamento specifico per accompagnamento e piccoli aiuti con tracciabilità",
      "indicatori standardizzati baseline/endline, comparatori e consenso ove necessario",
      "DPIA/verifica base giuridica, minimizzazione, controlli su accesso ai dati e governance"
    ],
    "tags": [
      "Galizia",
      "Spagna",
      "pobreza infantil",
      "inclusione sociale",
      "sostegno famiglie con minori",
      "case management",
      "servizi sociali",
      "RCT",
      "IMV",
      "RISGA",
      "educazione",
      "housing",
      "terzo settore",
      "Romano-Wolf",
      "costo incrementale"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-02",
        "note": "Inserimento da fonti originali ministeriali e articolo peer-reviewed del 2026; distinta la randomizzazione urbana dall'estensione rurale, ITT degli indici standardizzati da percentuali e benefici verificati dai risultati nulli su reddito e occupazione; costo incrementale qualificato."
      }
    ]
  }
];
