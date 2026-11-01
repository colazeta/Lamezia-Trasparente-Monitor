import type { EvidenceIntervention } from "./evidenceInterventions";

/** Palma EMAYA voluntary pledge: quasi-random assignment, PNAS 2025, sources checked 2026-11-01. */
export const EVIDENCE_INTERVENTIONS_2026_11_01_PALMA: readonly EvidenceIntervention[] = [
  {
    "id": "palma-emaya-biowaste-pledge-2019-quasi-random-longitudinal",
    "title": "Palma: impegno volontario alla raccolta dell'organico durante una campagna comunale, con effetti dopo quattro anni",
    "authority": "EMAYA (Empresa Municipal d'Aigües i Clavegueram), società pubblica del Comune di Palma, con Universitat de les Illes Balears e Universidad Pública de Navarra",
    "territory": "Palma, Isole Baleari; quartieri serviti dai contenitori per organico introdotti nel 2018–2019",
    "country": "Spagna",
    "implementationYear": "Introduzione del sistema comunale dell'organico nel 2018; intervento sperimentale di impegno volontario dal 28 gennaio al 18 novembre 2019; osservazione fino a 210 settimane dopo il contatto",
    "problem": "Una campagna informativa e la disponibilità dei contenitori non garantiscono che i nuclei inizino e continuino a separare la frazione organica. Occorre identificare strumenti comportamentali economici e misurare la persistenza degli effetti.",
    "measure": "In una campagna informativa EMAYA, gli educatori ambientali spiegavano a tutti i partecipanti le regole, consegnavano un kit con piccolo contenitore e sacchi e illustravano la frequenza attesa di uso. A un gruppo quasi-casualmente assegnato veniva inoltre offerta la possibilità di sottoscrivere davanti all'educatore un impegno personale, volontario e non vincolante a separare l'organico. Il gruppo di confronto riceveva le stesse informazioni e lo stesso kit, ma non l'offerta dell'impegno.",
    "mechanism": "L'esplicitazione di una promessa volontaria, resa in presenza di un educatore, aumenta salienza, intenzione e coerenza percepita dell'azione; facilita soprattutto il passaggio dal non utilizzare all'utilizzare i contenitori. Non è prevista sanzione e non viene modificata la tariffa; l'effetto causale riguarda l'OFFERTA di firmare, non una firma imposta.",
    "population": "1.519 nuclei familiari analizzati che avevano aderito alla ricerca nei quartieri coperti da contenitori elettronici (709 controllo e 810 offerta di impegno; 782/810 accettarono di firmare). Dei 1.878 nuclei originariamente reclutati, l'80,88% è stato collegato ai dati amministrativi; il campione non rappresenta necessariamente tutta Palma.",
    "primaryArea": "rifiuti_pulizia_urbana",
    "secondaryAreas": [
      "partecipazione_democrazia_locale",
      "ambiente_clima_energia",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "formazione_capacity_building",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "campagna in presenza con educatori ambientali EMAYA",
      "kit di separazione domestica distribuito a entrambi i gruppi",
      "modulo volontario di impegno non vincolante, offerto soltanto al trattamento",
      "registrazioni digitali delle aperture dei contenitori con tessera urbana (solo per misurazione sperimentale)",
      "confronto longitudinale dell'utilizzo settimanale dei contenitori",
      "lettera di feedback sperimentata separatamente nel 2020, senza beneficio addizionale robusto nel lungo periodo"
    ],
    "territorialScale": "Quartieri selezionati nella città; trattamento individuale a livello di nucleo familiare, con servizi municipali e contenitori condivisi già attivi.",
    "interventionStatus": "Campagna/intervento sperimentale effettivamente realizzato nel 2019; esiti osservati per circa quattro anni e pubblicati nel maggio 2025. EMAYA documenta il servizio di organico, ma non è verificato che l'offerta sistematica di pledge rimanga una politica operativa nel 2026.",
    "evaluationMethod": "Esperimento sul campo a assegnazione quasi-randomizzata (NON RCT con randomizzazione formale): alternanza in ordine di arrivo dei partecipanti ai punti informativi (zipper strategy). Stima intention-to-treat dell'offerta di impegno, con verifiche di equilibrio pre-trattamento, dati individuali di apertura dei contenitori e regressioni longitudinali; controllo successivo di un feedback randomizzato con disegno 2×2 nel 2020. Studio peer-reviewed in PNAS (2025).",
    "comparator": "709 nuclei reclutati nella stessa campagna, informati dagli stessi educatori e dotati dello stesso kit, ma non invitati a sottoscrivere un impegno; 810 nuclei ricevettero l'offerta. Il confronto non è con cittadini privi di servizio e non identifica l'effetto della campagna o dei contenitori in sé.",
    "outcomes": [
      "quota di settimane in cui il nucleo ha aperto almeno una volta un contenitore per l'organico (outcome principale)",
      "andamento della partecipazione nelle prime 15 settimane e tra la settimana 151 e 210",
      "margine estensivo (avvio dell'utilizzo) versus margine intensivo (frequenza tra utilizzatori)",
      "effetto addizionale della lettera di feedback del 2020",
      "kg di organico effettivamente separato, impurità, recupero finale e bilancio ambientale NON misurati direttamente"
    ],
    "results": "Nel campione analitico, l'offerta dell'impegno aumenta la quota di settimane con almeno un conferimento rispetto alla sola campagna; il miglioramento permane a circa quattro anni ed è dovuto soprattutto all'ingresso di nuove famiglie nella pratica, non a più conferimenti delle famiglie già attive. L'ulteriore feedback scritto nel 2020 non produce un incremento duraturo statisticamente robusto. Risultato sulla PARTECIPAZIONE misurata tramite aperture, non sui kg effettivamente riciclati.",
    "effectSize": "Effetto medio intention-to-treat +4,55–5,10 punti percentuali nella quota di settimane con almeno un'apertura nei 210 settimane dopo l'intervento (specificazioni dello studio; circa +30% rispetto al controllo per la stima +5,10 pp). Prime 15 settimane: circa +9–10 pp. Tra 151 e 210 settimane: +3,11–4,49 pp, statisticamente significativo. Non sono percentuali di aumento dei kg riciclati o riduzioni della TARI; la stima ITT NON è l'effetto causale condizionato alla firma.",
    "evidenceStrength": "forte",
    "costsRequirements": "Il costo marginale di presentare e firmare un impegno all'interno di una campagna educativa già finanziata è limitato; tuttavia educatori, kit, gestione delle adesioni e infrastruttura di monitoraggio non sono gratuiti. Non emerge un'analisi completa di costo per kg effettivamente riciclato o di benefici ambientali netti. La versione replicabile a Lamezia dovrebbe evitare tecnologie o trattamenti di dati personali non necessari.",
    "limitations": [
      "L'assegnazione era alternata per ordine di arrivo, non formalmente randomizzata; l'equilibrio ex ante sostiene ma non garantisce completamente l'assenza di bias di selezione.",
      "Solo nuclei che avevano aderito volontariamente alla ricerca e possedevano una tessera collegabile ai dati dei contenitori; generalizzabilità al complesso dei cittadini limitata.",
      "Collegamento riuscito per 80,88% dei 1.878 reclutati; all'inizio del reclutamento l'identificativo fiscale era raccolto più spesso nel trattamento, causando squilibrio 810 versus 709 e differenze nella finestra pre-trattamento, affrontate dagli autori con controlli di robustezza.",
      "Outcome misurato tramite apertura del contenitore: non si osservano quantità, purezza del materiale, compost effettivo o riduzione del rifiuto residuo.",
      "Il pledge è offerto durante un'interazione personale con educatori, dopo informazioni e kit: l'effetto di un modulo inviato massivamente o online senza mediazione non è verificato.",
      "Lo studio non misura una riduzione di costi di servizio o emissioni, né l'effetto netto sulla produzione di rifiuti o l'equità di accesso.",
      "L'uso di identificativi personali e tessere urbane per tracciare conferimenti richiede un rigoroso esame di necessità, proporzionalità, base giuridica e protezione dei dati nel contesto italiano."
    ],
    "unintendedEffects": "Non emergono effetti indesiderati causalmente dimostrati sull'uso dei contenitori. Possibili rischi non misurati: pressione sociale nella sottoscrizione, esclusione di cittadini senza tessera o meno raggiunti dalla campagna, scorretto conferimento, possibili effetti di sostituzione fra frazioni e impatti sulla privacy del tracciamento. Il feedback aggiuntivo non ha mostrato un beneficio duraturo, quindi non va assunto efficace.",
    "primarySource": {
      "label": "EMAYA (azienda municipale di Palma) — sistema ufficiale di raccolta dell'organico e attività degli educatori ambientali",
      "url": "https://www.emaya.es/residuos-y-limpieza/residuos/recollida-de-mat%C3%A8ria-org%C3%A0nica"
    },
    "evaluationStudies": [
      {
        "label": "PNAS — articolo peer-reviewed originale e tabelle sulle stime a 210 settimane",
        "url": "https://doi.org/10.1073/pnas.2414578122",
        "citation": "Alonso-Paulí, E., Balart, P., Ezquerra, L. e Hernandez-Arenaz, I. (2025), Using pledges to improve the effectiveness of environmental information campaigns: The case of biowaste recycling, Proceedings of the National Academy of Sciences, 122(18), e2414578122.",
        "doi": "10.1073/pnas.2414578122"
      },
      {
        "label": "AEA RCT Registry — scheda metodologica della sperimentazione originaria",
        "url": "https://www.socialscienceregistry.org/trials/7758",
        "citation": "AEA RCT Registry, Unraveling Soft-Commitment: Evidence from a Field Experiment on Recycling, registrazione del 21 luglio 2021; intervento a Palma gennaio–novembre 2019."
      }
    ],
    "lastVerifiedAt": "2026-11-01",
    "transferabilityItaly": "Alta per l'offerta volontaria di impegno come componente aggiuntiva di campagne di sensibilizzazione sulla raccolta separata: non altera obblighi TARI, calendari o contratti del servizio e può essere testata con metodi a basso costo. La componente tecnologica originaria di tessera urbana e tracciamento identificabile non deve essere replicata automaticamente: applicare GDPR e principi di minimizzazione, protezione dati e alternativa non digitale; evitare coercizione e promesse di riduzione dei kg o dei costi non verificata.",
    "lameziaAdaptation": "Con Lamezia Multiservizi, selezionare 2–4 zone porta a porta comparabili per dati disponibili e criticità nell'organico. Agli utenti di entrambe le condizioni offrire istruzioni visive e kit già disponibili; durante incontri pubblici e punti mobili proporre casualmente ad alcuni nuclei un impegno volontario semplice, da firmare o sottoscrivere senza alcuna sanzione. Registrare soltanto adesioni e misure aggregate o campionarie di qualità dei conferimenti, con informazione privacy e base giuridica adeguata; evitare collegamento a tessere personali. Valutare la quota di nuclei attivi con una misura lecita, impurità dell'organico, kg raccolti e rifiuto residuo rispetto a zone/gruppi di confronto a 1, 3, 6 e 12 mesi; stimare il costo marginale, controllando spillover e adesione volontaria. Non confondere il programma con il compostaggio domestico e la riduzione TARI dal 2027.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "accordo operativo con Lamezia Multiservizi e mappa delle zone servite con i relativi calendari",
      "baseline della qualità dell'organico e del residuo, verificata con audit campionari dei conferimenti",
      "campione e procedura di assegnazione casuale realmente non prevedibile, con protocollo di valutazione preregistrato",
      "educatori ambientali, materiale informativo accessibile, modulo volontario e canali non digitali",
      "base giuridica, informativa privacy, misure di minimizzazione, archiviazione separata dei consensi",
      "pesi e composizione delle frazioni, indicatori di contaminazione e abbandoni e analisi stagionale",
      "costi del personale e di campagna per partecipazione aggiuntiva e kg effettivamente recuperato",
      "monitoraggio degli effetti a 1, 3, 6 e 12 mesi e controlli contro spillover tra nuclei"
    ],
    "tags": [
      "Palma",
      "Isole Baleari",
      "Spagna",
      "EMAYA",
      "rifiuti organici",
      "raccolta differenziata",
      "impegno volontario",
      "soft commitment",
      "pledge",
      "quasi-randomizzazione",
      "PNAS 2025",
      "dati amministrativi",
      "persistenza quattro anni",
      "nudging",
      "privacy"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-01",
        "note": "Nuovo caso verificato direttamente su PNAS 2025 (testo e tabelle), registrazione AEA e documentazione primaria EMAYA. Evidenziati assegnazione alternata NON randomizzazione formale, squilibrio di linkage, risultato sulle aperture anziché kg, follow-up quadriennale, assenza di costo-beneficio e vincoli di privacy italiani."
      }
    ]
  }
];
