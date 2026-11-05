import type { EvidenceIntervention } from "./evidenceInterventions";

/** Fonte verificata il 2026-11-05: esito nominale positivo, NON robusto a correzione multipla (p=0,054). */
export const EVIDENCE_INTERVENTIONS_2026_11_05_MECHELEN: readonly EvidenceIntervention[] = [
  {
    "id": "mechelen-belgium-parking-fine-combined-notice-nudges-cluster-rct-2020",
    "title": "Mechelen: avvisi di sanzione per la sosta con linguaggio semplificato, conseguenze e norme sociali",
    "authority": "Stad Mechelen e Gemeentelijke Administratieve Sancties Arrondissement Mechelen (GASAM), con Behavioral Insights Team del Governo fiammingo",
    "territory": "Mechelen, Fiandre",
    "country": "Belgio",
    "implementationYear": "2020–2021 (sperimentazione: giugno 2020 – febbraio 2021)",
    "problem": "Circa quattro sanzioni amministrative per la sosta su dieci, nel periodo 2015–2019, erano pagate in ritardo o non pagate; oneri di sollecito e recupero per l'ente e per i destinatari.",
    "measure": "Esperimento su quattro versioni della comunicazione originale allegata a sanzioni per sosta o accesso in zone a traffico limitato: avviso vigente (controllo); testo semplificato; testo semplificato e avvertenza esplicita sulle conseguenze del ritardo; testo semplificato con avvertenza e messaggio su quanti pagano nei termini. Non modifica importi, sanzioni, diritti di ricorso né regole di pagamento.",
    "mechanism": "Semplificazione e maggiore salienza degli adempimenti, deterrenza informativa sui costi realmente previsti e norma descrittiva di pagamento; le componenti dell'ultima versione non sono identificabili separatamente.",
    "population": "2.664 destinatari di sanzioni amministrative per infrazioni di categoria 1 (n=2.152) o 2 (n=512), organizzati in 34 batch/cluster di comunicazioni; 939 pagamenti scaduti entro il periodo osservato.",
    "primaryArea": "capacita_amministrativa_personale",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "digitalizzazione_servizi_online",
      "trasparenza_integrita_anticorruzione"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "quattro modelli di comunicazione amministrativa",
      "randomizzazione per 34 lotti di spedizione",
      "registri di notifica e pagamento GASAM",
      "analisi multilevel con correzione per confronti multipli",
      "materiali e dati di replicazione OSF"
    ],
    "territorialScale": "Comune e organizzazione intercomunale GASAM; comunicazioni individuali, assegnazione per cluster di spedizione.",
    "interventionStatus": "Studio e sperimentazione conclusi nel febbraio 2021; non verificata una successiva adozione permanente della specifica versione sperimentale. L'ente continua a gestire sanzioni amministrative locali.",
    "evaluationMethod": "Cluster-randomized field experiment, assegnazione a 34 batch di notifiche, 4 bracci; modelli logistici multilevel e average marginal effects, con analisi aggiustata per età, genere e categoria della violazione. Confronti multipli con correzione Benjamini–Yekutieli; studio peer-reviewed NON preregistrato.",
    "comparator": "629 destinatari in 9 cluster hanno ricevuto la comunicazione originale. Gli altri bracci: semplificazione n=680/9 cluster; semplificazione+avvertimento n=645/8; triplo intervento n=710/8.",
    "outcomes": [
      "pagamento integrale entro 33 giorni dalla data di spedizione dell'avviso (30 giorni più 3 di tolleranza tecnica)",
      "differenza dei pagamenti tempestivi per braccio",
      "incertezza statistica e significatività corretta per test multipli"
    ],
    "results": "Solo il pacchetto completo semplificazione+conseguenze+norma sociale presenta un aumento della puntualità nel confronto convenzionale non corretto (+7,9 punti percentuali; +8,4 con covariate). Dopo correzione per i tre confronti multipli, il p-value del trattamento completo sale a 0,054: il risultato NON supera la soglia del 5%, dunque va interpretato come segnale positivo incerto e non come efficacia causale confermata. La sola semplificazione e la semplificazione con deterrenza non producono benefici statisticamente solidi.",
    "effectSize": "Tabella 2, AME rispetto al controllo: solo semplificazione −1,1 pp (IC95% −8,4/+6,3; non significativo); semplificazione+avvertenza +5,1 pp (IC95% −0,9/+13,0; non significativo); tutte e tre le componenti +7,9 pp (IC95% +1,2/+14,7; significatività nominale p<0,05); con covariate +8,4 pp (IC95% +1,6/+15,1). Appendice C: dopo correzione Benjamini–Yekutieli p=0,054 per triplo intervento; potenza stimata 0,632. NON presentare +7,9 pp come risultato robusto al 5%.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Le sanzioni interessate totalizzavano 184.208 EUR, ma questa è esposizione nominale, non costo del progetto e non maggior gettito. Nessun consuntivo verificato del costo di redazione, spedizione o riscossione incrementale; riuso di canali esistenti potenzialmente poco oneroso, da verificare localmente. Servono workflow documentale, controllo legale e linguistico, registro date notifiche/pagamenti, analisi statistica per cluster e privacy.",
    "limitations": [
      "Solo 34 cluster e potenza ~63% per l'effetto più favorevole: stime incerte.",
      "La correzione Benjamini–Yekutieli per confronti multipli porta p=0,054; il singolo risultato positivo non è significativo al 5% corretto.",
      "Lo studio non era preregistrato; non risulta verificata una replica indipendente nel medesimo assetto.",
      "I tre elementi del trattamento migliore sono combinati e NON permettono di isolare l'effetto aggiuntivo della norma sociale o della deterrenza.",
      "Un solo comune e fattispecie specifiche (GAS per parcheggio e zone autoluwe), non comparabili automaticamente alle sanzioni CdS italiane.",
      "Non sono state misurate riduzioni di violazioni stradali, incidentalità, congestione o un saldo di costo-beneficio verificato.",
      "Outcome binario a breve termine, non studia impatto distributivo per reddito o esiti amministrativi pluriennali."
    ],
    "unintendedEffects": "Non documentati effetti indesiderati quantificati nel trial. Rischi da valutare: messaggi sociali non aggiornati o falsamente rappresentativi, pressione sui destinatari in difficoltà economica, oscuramento dei diritti di ricorso, aumento della complessità delle notifiche. Vietato prospettare sanzioni non previste.",
    "primarySource": {
      "label": "Città di Mechelen — disciplina amministrativa comunale delle sanzioni e criteri di enforcement (documenta la competenza, non da sola gli effetti sperimentali)",
      "url": "https://www.mechelen.be/stad-en-bestuur/beleid/mechelen-zet-op-zo-weinig-mogelijk-sancties"
    },
    "evaluationStudies": [
      {
        "label": "Articolo originale peer-reviewed (version of record, Erasmus University Rotterdam)",
        "url": "https://pure.eur.nl/ws/portalfiles/portal/102653833/Nudging_people_to_pay_their_parking_fines_on_time._Evidence_from_a_cluster-randomized_field_experiment.pdf",
        "citation": "Migchelbrink, K. & Raymaekers, P. (2023). Nudging people to pay their parking fines on time: Evidence from a cluster-randomized field experiment. Journal of Behavioral and Experimental Economics, 105, 102033.",
        "doi": "10.1016/j.socec.2023.102033"
      },
      {
        "label": "Repository per replicazione, dichiarato nello studio (accesso indipendente non verificato)",
        "url": "https://osf.io/7qab2",
        "citation": "Migchelbrink & Raymaekers (2023), materiali e dati supplementari OSF."
      }
    ],
    "lastVerifiedAt": "2026-11-05",
    "transferabilityItaly": "La semplificazione informativa di notifiche e istruzioni di pagamento è adattabile a Comuni italiani, MA il regime belga GAS e i termini di 30 giorni non sono trasferibili. L'avviso italiano deve preservare il contenuto legale obbligatorio, la riduzione eventualmente applicabile ai sensi di legge, termini reali e modalità di ricorso. La sperimentazione mostra un segnale incerto, non autorizza previsioni automatiche di recupero.",
    "lameziaAdaptation": "Partire dall'esistente portale sanzioni e pagoPA del Comune di Lamezia Terme. Con Polizia Locale, ufficio entrate e responsabili privacy, analizzare la qualità degli avvisi CdS e i tassi aggregati di pagamento nei termini; progettare un foglio informativo integrativo in linguaggio chiaro, con scadenze esatte, eventuali riduzioni ove applicabili, riferimento al pagamento pagoPA e diritti di opposizione, senza alterare il verbale obbligatorio. Valutare un pilota randomizzato legittimo su un unico trattamento semplificato vs controllo, preregistrando esiti e analisi per evitare problemi di confronti multipli. Non usare norme sociali non documentate.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "accesso legittimo ai dati anonimizzati dei verbali e dei pagamenti via pagoPA",
      "verifica dei requisiti giuridici delle notifiche, termini e mezzi di ricorso",
      "collaborazione Polizia Locale e servizio IT/fornitore della modulistica",
      "piano preregistrato di valutazione, numerosità sufficiente e correzione per test multipli",
      "monitoraggio di costi vivi, contenzioso e accessibilità multicanale"
    ],
    "tags": [
      "Mechelen",
      "Belgio",
      "GASAM",
      "sanzioni sosta",
      "comunicazioni amministrative",
      "cluster RCT",
      "behavioral insights",
      "nudging",
      "pagamento tempestivo",
      "p-value corretto",
      "evidenza moderata",
      "Polizia Locale",
      "pagoPA"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-05",
        "note": "Prima scheda basata su testo integrale editoriale e pagina ufficiale Mechelen: misure effettivamente sperimentate, 34 cluster, effetti AME e correzione Benjamini–Yekutieli p=0,054 riportati senza sovrastimare l'evidenza; distinta dai trial di Říčany e ACT già oggetto di PR."
      }
    ]
  }
];
