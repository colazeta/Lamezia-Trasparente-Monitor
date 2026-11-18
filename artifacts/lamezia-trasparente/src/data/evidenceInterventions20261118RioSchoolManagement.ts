import type { EvidenceIntervention } from "./evidenceInterventions";

/** Rio de Janeiro municipal school management: preregistered 80-school cluster RCT, original working paper reviewed 2026-11-18. */
export const EVIDENCE_INTERVENTIONS_2026_11_18_RIO_SCHOOL_MANAGEMENT: readonly EvidenceIntervention[] = [
  {
    "id": "rio-de-janeiro-school-management-coaching-smeprct-2022",
    "title": "Rio de Janeiro: coaching gestionale per i dirigenti delle scuole pubbliche municipali e apprendimenti",
    "authority": "Secretaria Municipal de Educação do Rio de Janeiro (SMERJ) e Tribunal de Contas do Município do Rio de Janeiro (TCMRio), con ricercatori dell'Università di Cambridge",
    "territory": "Rio de Janeiro, Brasile; 80 scuole pubbliche municipali con alunni del ciclo 1º–9º anno",
    "country": "Brasile",
    "implementationYear": "2022–2023 (baseline amministrativa e gestionale 2021; studio Cambridge 2025)",
    "problem": "Risultati di apprendimento disomogenei e pratiche di gestione scolastica non sempre standardizzate; necessità di verificare se un supporto professionale rivolto esclusivamente alle direzioni scolastiche possa migliorare risultati educativi senza aumentare ore di lezione o organici.",
    "measure": "Science and Management for Education Programme (SMEP/PCGE): sei dipendenti pubblici incaricati, con la segreteria municipale dell'istruzione e il tribunale dei conti municipale, hanno fornito coaching individuale e formazione sul campo ai gruppi dirigenti di 40 scuole assegnate casualmente al trattamento, per circa due anni. L'assistenza si concentrava su 23 pratiche di gestione adattate dal World Management Survey. Altre 40 scuole costituiscono il controllo.",
    "mechanism": "Migliore programmazione degli obiettivi, monitoraggio degli indicatori, gestione delle persone, pratiche di responsabilizzazione e follow-up dell'attività didattica tramite capacità organizzative dei responsabili scolastici; non è stata fornita formazione diretta a docenti o studenti né modificata la durata dell'insegnamento.",
    "population": "31.760 alunni complessivi nelle 80 scuole del campione; 40 scuole assegnate al trattamento e 40 al controllo, con dirigenti, coordinatori pedagogici e staff gestionale come destinatari diretti.",
    "primaryArea": "istruzione_giovani",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "welfare_inclusione_servizi_sociali"
    ],
    "interventionTypes": [
      "formazione_capacity_building",
      "modifica_organizzativa_processo",
      "targeting_data_analytics",
      "partnership_pubblico_privato_terzo_settore"
    ],
    "tools": [
      "coaching individuale dei dirigenti e coordinatori scolastici",
      "formazione sul lavoro da parte di funzionari pubblici",
      "23 pratiche del World Management Survey adattate alla scuola",
      "due survey gestionali indipendenti e in doppio cieco, prima e dopo l'intervento",
      "prove standardizzate di lettura e matematica e registri amministrativi",
      "registro AEA RCT AEARCTR-0007669"
    ],
    "territorialScale": "80 scuole municipali distribuite nel territorio della città; assegnazione randomizzata per scuola, 40 trattate e 40 controllo, con abbinamento preliminare in coppie.",
    "interventionStatus": "Sperimentazione attuata nel 2022–2023; l'Università di Cambridge riferisce a maggio 2026 un'estensione a 120 scuole. L'espansione prospettata alla totalità delle scuole non è verificata come realizzata.",
    "evaluationMethod": "Randomised controlled trial a cluster, preregistrato nel maggio 2021 (AEA RCT Registry AEARCTR-0007669): 80 scuole selezionate e assegnate in coppie bilanciate al trattamento oppure al controllo (40/40). Analisi dei punteggi di apprendimento standardizzati e dell'indice gestionale dopo due anni; due survey in doppio cieco sul management. Le deviazioni standard (SD) sono unità statistiche, non punti percentuali. Working paper Cambridge 2025, non articolo peer-reviewed accertato.",
    "comparator": "40 scuole pubbliche municipali non assegnate al coaching nel medesimo periodo, con funzionamento ordinario; assegnazione per coppie rispetto a caratteristiche iniziali.",
    "outcomes": [
      "punteggi di apprendimento standardizzati di lettura",
      "punteggi di apprendimento standardizzati di matematica",
      "qualità della gestione scolastica misurata con World Management Survey",
      "assenteismo degli studenti",
      "costo amministrativo per alunno e anno"
    ],
    "results": "Dopo due anni il trattamento ha migliorato in modo statisticamente significativo l'indice di gestione e gli esiti delle prove standardizzate. L'effetto medio randomizzato è di 0,226 SD in lettura e 0,237 SD in matematica. L'articolo indica una diminuzione relativa dell'assenteismo del 19%. Il programma è stato somministrato ai dirigenti, senza ore aggiuntive di lezione né incentivi economici ai docenti. Il beneficio in termini di anni scolastici equivalenti dipende dal riferimento utilizzato e non è riportato come outcome osservato diretto.",
    "effectSize": "Effetto medio di trattamento a 2 anni: management +0,928 deviazioni standard (SE 0,260); lettura +0,226 SD (SE 0,059); matematica +0,237 SD (SE 0,059). Assenteismo degli studenti circa −19% in termini relativi, secondo il working paper. Stime IV relative a un incremento di un punto del management NON rappresentano l'effetto medio del trattamento randomizzato.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costo storico dichiarato di 15,22 USD a parità di potere d'acquisto (PPP) per alunno per anno nel contesto sperimentale; non è una quotazione spendibile in Italia. Richiede un piccolo gruppo di tutor esperti, tempo dei dirigenti, raccolta dati e valutazione indipendente, autorizzazioni istituzionali e monitoraggio degli effetti. Fonte istituzionale brasiliana riferisce R$ 42 per alunno/anno, valore locale distinto dalla cifra PPP.",
    "limitations": [
      "Unità di randomizzazione = 80 scuole, non 31.760 studenti indipendenti; intervalli di incertezza devono rispettare il clustering.",
      "La versione primaria verificata è un working paper del 27 marzo 2025, non un articolo scientifico peer-reviewed accertato. La registrazione AEA e le verifiche dei ricercatori rafforzano la tracciabilità ma non sostituiscono peer review o replica indipendente.",
      "Risultati misurati nell'arco di circa due anni; non dimostrano persistenza pluriennale dopo la fine dell'assistenza.",
      "La rete scolastica, le competenze gestionali dei municipi brasiliani, la formazione del personale e i livelli di partenza differiscono dall'Italia.",
      "Non attribuire al Comune italiano il potere di imporre la gestione pedagogica delle istituzioni scolastiche statali: autonomia scolastica, competenze USR e autorità competenti devono essere rispettate.",
      "Una differenza di 0,226 o 0,237 SD non equivale a +22,6% o +23,7% di voti o alunni promossi; gli equivalenti in anni di apprendimento sono trasformazioni modellistiche.",
      "Il costo riferito è specifico dell'intervento e del periodo; non comprende automaticamente tutte le risorse necessarie per un adattamento italiano.",
      "La scala e la capacità di mantenere i benefici dopo l'estensione del programma non sono valutate dallo stesso trial."
    ],
    "unintendedEffects": "Non sono stati dimostrati né quantificati effetti indesiderati specifici nel trial; restano possibili oneri amministrativi e tempo sottratto ad altre attività dei dirigenti, pressione sugli indicatori di performance o differenze di adesione. Devono essere monitorati, non presentati come effetti verificati.",
    "primarySource": {
      "label": "AEA RCT Registry — sperimentazione preregistrata con SMERJ e TCMRio, AEARCTR-0007669",
      "url": "https://www.socialscienceregistry.org/trials/7669"
    },
    "evaluationStudies": [
      {
        "label": "University of Cambridge, Faculty of Economics — original working paper CWPE 2515",
        "url": "https://www.econ.cam.ac.uk/publications/cwpe/2515",
        "doi": "10.17863/CAM.118367",
        "citation": "Puccioni, F. G. e Cavalcanti, T. (2025), The Impact of Cost-Effective Management Practices on Student Learning: Evidence from a Large-Scale Randomised Field Experiment, Cambridge Working Papers in Economics 2515, 27 marzo 2025."
      },
      {
        "label": "University of Cambridge — descrizione istituzionale dell'implementazione e dell'espansione, 27 maggio 2026",
        "url": "https://www.econ.cam.ac.uk/impact/impact-student-learning-brazil",
        "citation": "Faculty of Economics, University of Cambridge (2026), Impact: Student learning in Brazil, 27 maggio 2026."
      },
      {
        "label": "Instituto Rui Barbosa — conferma della collaborazione fra TCMRio e SMERJ",
        "url": "https://irbcontas.org.br/pesquisa-conduzida-por-diretor-do-irb-e-publicada-em-working-paper-da-universidade-de-cambridge",
        "citation": "Instituto Rui Barbosa (7 aprile 2025), Pesquisa conduzida por Diretor do IRB é publicada em working paper da Universidade de Cambridge."
      },
      {
        "label": "Comune di Lamezia Terme — assistenza specialistica scolastica 2026–27, competenza locale distinta",
        "url": "https://comune.lamezia-terme.cz.it/it/news/115163/piu-qualita-e-continuita-per-lassistenza-specialistica",
        "citation": "Comune di Lamezia Terme, comunicazione 28 luglio 2026 sull'assistenza specialistica scolastica."
      }
    ],
    "lastVerifiedAt": "2026-11-18",
    "transferabilityItaly": "Trasferibile, con adattamento istituzionale, il principio di coaching organizzativo, autovalutazione dei processi e misurazione causale. Le scuole statali italiane hanno autonomia didattica e gestionale: il Comune potrebbe promuovere una collaborazione volontaria con dirigenti, Ufficio scolastico regionale, servizi comunali per il diritto allo studio e università, ma non imporre un programma di gestione pedagogica.",
    "lameziaAdaptation": "Partire da un confronto volontario tra Comune di Lamezia Terme, USR Calabria, istituti comprensivi e servizi sociali sul miglioramento delle interfacce amministrative scuola–Comune (mensa, trasporto, assistenza specialistica, accessibilità). Ricostruire i processi di coordinamento, i tempi di risposta e gli indicatori aggregati; proporre formazione operativa con tutor e strumenti condivisi di autovalutazione. Qualsiasi pilota che intervenga nella gestione didattica scolastica richiede piena adesione delle istituzioni scolastiche competenti, protezione dei dati e disegno valutativo predefinito; non applicare le stime di Rio ai risultati locali.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "accordo formale con istituti scolastici e USR Calabria nel rispetto delle competenze",
      "mappatura dei processi locali scuola–Comune, baseline e risultati amministrativi aggregati",
      "formazione di un piccolo team di tutor organizzativi",
      "indicatori scelti con i dirigenti, senza incentivi distorsivi o classifiche stigmatizzanti",
      "protocollo GDPR e gestione autorizzata dei dati di studenti/minori",
      "piano di valutazione con scuole/servizi comparabili, periodi predefiniti e misure di costo",
      "eventuale supporto di università o ente di ricerca indipendente"
    ],
    "tags": [
      "Rio de Janeiro",
      "Brasile",
      "SMEP",
      "PCGE",
      "scuole municipali",
      "dirigenti scolastici",
      "World Management Survey",
      "coaching gestionale",
      "RCT a cluster",
      "40 scuole trattate",
      "apprendimenti",
      "lettura",
      "matematica",
      "capacità amministrativa",
      "costi PPP",
      "AEARCTR-0007669",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-18",
        "note": "Nuovo caso identificato con Parallel Search; verificati working paper Cambridge 2025, scheda di implementazione Cambridge 27 maggio 2026, registro AEA RCT originariamente preregistrato nel 2021, e fonte istituzionale brasiliana IRB. Verificati 80 cluster 40/40, 31.760 studenti, effetti 0,226 e 0,237 SD e costo 15,22 USD PPP/alunno/anno. Esclusa falsa attribuzione di competenze pedagogiche dirette al Comune italiano, distinta la stima IV dall'effetto medio RCT e non attribuito peer review al working paper. Ricerca di deduplicazione sui moduli dell'archivio in main e sulle PR con titoli/autorità/autori/studio."
      }
    ]
  }
];
