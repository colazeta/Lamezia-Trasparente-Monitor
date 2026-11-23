import type { EvidenceIntervention } from "./evidenceInterventions";

/** Kortrijk MISSION randomized evaluation: original final report and municipal sources verified 2026-11-23. */
export const EVIDENCE_INTERVENTIONS_2026_11_23_KORTRIJK_MISSION: readonly EvidenceIntervention[] = [
  {
    "id": "kortrijk-mission-outreach-case-management-families-rct-2017",
    "title": "Kortrijk: case management domiciliare integrato per l'accesso agli aiuti delle famiglie vulnerabili (MISSION)",
    "authority": "Città di Kortrijk / OCMW Kortrijk, in collaborazione con Kind en Gezin, VDAB, KU Leuven, Università di Anversa, VIVES e Howest; cofinanziamento UE EaSI",
    "territory": "Kortrijk (Courtrai), Fiandre occidentali",
    "country": "Belgio",
    "implementationYear": "Progetto novembre 2016–novembre 2019; sperimentazione randomizzata attuata dal 2017 con misure a 6 e 12 mesi",
    "problem": "Famiglie con bambini piccoli in situazione di vulnerabilità non accedono a sostegni ai quali potrebbero avere diritto, a causa della frammentazione dei servizi (assistenza sociale, occupazione, salute, abitazione, cura dei figli) e delle difficoltà di attivazione individuale.",
    "measure": "Il Comune e il centro pubblico di assistenza sociale hanno impiegato cinque case manager proattivi per visitare famiglie vulnerabili, ricostruire con esse bisogni e diritti, facilitarne l'accesso ai contributi e coordinare l'interazione con uffici e organizzazioni. Nell'esperimento 56 famiglie hanno ricevuto questo servizio aggiuntivo, 56 hanno continuato a poter utilizzare i servizi ordinari. L'intero progetto ha coinvolto 133 famiglie seguite dai case manager, ma solo 112 appartengono al trial.",
    "mechanism": "Un referente unico raggiunge attivamente le famiglie, riduce oneri informativi e burocratici, verifica l'ammissibilità ai sostegni, attiva appuntamenti e servizi, coordina professionisti e segnala ostacoli di sistema. Gli effetti stimati riguardano il pacchetto complessivo di accompagnamento, non una singola tecnologia o visita.",
    "population": "112 famiglie con neonato o bambino piccolo valutate vulnerabili da Kind en Gezin e randomizzate (56 trattamento, 56 controllo); destinatari complessivi del progetto di outreach 133 famiglie; cinque case manager.",
    "primaryArea": "welfare_inclusione_servizi_sociali",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "istruzione_giovani",
      "sviluppo_economico_commercio_lavoro",
      "digitalizzazione_servizi_online"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "modifica_organizzativa_processo",
      "partnership_pubblico_privato_terzo_settore",
      "formazione_capacity_building",
      "informazione_trasparenza"
    ],
    "tools": [
      "visite domiciliari di cinque outreach case manager",
      "referente unico e piano di accompagnamento multidimensionale per nucleo",
      "orientamento a contributi economici e servizi OCMW, Kind en Gezin e VDAB",
      "coordinamento e advocacy tra enti e segnalazione di problemi sistemici",
      "dati amministrativi collegati OCMW e VDAB, questionario di baseline e a sei mesi",
      "portale informativo Sien Online quale supporto, senza effetto isolato identificato"
    ],
    "territorialScale": "Municipale, intervento a livello di famiglia; RCT individuale su 112 famiglie; successiva riorganizzazione cittadina in dodici équipe di quartiere (2023) è distinta e non valutata dallo stesso RCT.",
    "interventionStatus": "Il pilota MISSION (2016–2019) è concluso. Il 2 marzo 2023 Kortrijk ha annunciato la riorganizzazione dei servizi sociali di prossimità in 12 équipe di quartiere sulla scia dell'esperienza; non verificata nel 2026 la continuità delle specifiche procedure o gli effetti causali della nuova rete.",
    "evaluationMethod": "Randomized controlled trial individuale: 112 famiglie (56/56) assegnate a outreach case management aggiuntivo versus servizi usuali. Outcome principali su registri amministrativi OCMW/VDAB, baseline e follow-up a sei mesi; esplorazione a un anno su sottocampione con dati incompleti (non imputati). Rapporto scientifico originale Van Lancker et al. (gennaio 2020), cap. 4–5, Tabella 15 p. 97. Campione inferiore ai 235 stimati ex ante per adeguata potenza, non è un trial ampio. Distinguere inferenza randomizzata dei gruppi da correlazioni post-trattamento dei metodi del singolo case manager.",
    "comparator": "56 famiglie randomizzate nel gruppo di controllo, con pieno accesso ai servizi sociali ordinari già disponibili nel Comune, ma senza il case manager proattivo aggiuntivo.",
    "outcomes": [
      "ricezione di contributi finanziari aggiuntivi, escluso il sussidio generale leefloon, dopo 6 mesi",
      "partecipazione a percorsi di formazione o inserimento lavorativo dopo 6 e 12 mesi",
      "ricezione del sostegno generale leefloon",
      "ricezione di aiuti non monetari",
      "reddito disponibile, situazione abitativa, condizioni di vita e accesso ai servizi",
      "soddisfazione e capacità di orientamento ai servizi"
    ],
    "results": "Nella Tabella 15 del rapporto originale, dopo sei mesi le famiglie trattate che ricevono contributi finanziari aggiuntivi sono il 37,5% contro il 17,9% dei controlli: +19,6 punti percentuali, p=0,020 (differenza non aggiustata fra gruppi randomizzati; nel rapporto colonna 'Diff.' indica controllo meno trattamento, −0,196). Nessun effetto significativo sul generico accesso a OCMW (53,6% vs 51,8%; p=0,852), su leefloon (32,1% vs 39,3%; p=0,435), sull'aiuto non monetario (8,9% vs 12,5%; p=0,545) o sulla partecipazione a formazione/inserimento dopo sei mesi (30,4% vs 35,7%; p=0,551). Dopo 12 mesi formazione/inserimento: 42% vs 36% in sottocampione; il confronto fra gruppi non è dimostrato significativo e i dati sono incompleti. A 12 mesi la differenza nei contributi aggiuntivi è 12 pp, p=0,166: non significativa. Non dimostrati incrementi occupazionali effettivi, né miglioramenti strutturali di reddito o situazione abitativa a sei mesi. Il Comune ha successivamente adottato un modello decentrato in 12 équipe nel 2023, fatto amministrativo distinto dagli esiti del RCT.",
    "effectSize": "A sei mesi, aiuti finanziari supplementari: trattamento 0,375 (21/56), controllo 0,179 (10/56), differenza +0,196 = +19,6 punti percentuali; p=0,020 e differenza normalizzata circa 0,315 DS (Tabella 15, p. 97). A 12 mesi differenza residuale contributi +12 pp (p=0,166; non significativa); iscrizione a programmi formazione/occupazione 42% vs 36% (campione incompleto, non prova effetto statisticamente significativo).",
    "evidenceStrength": "moderata",
    "costsRequirements": "Il progetto MISSION ha avuto un budget totale dichiarato dal Comune pari a 1.888.219,37 EUR, di cui 1.510.367,28 EUR di contributo UE; comprende RCT, progettazione metodologica, cinque case manager, portale e cooperazione, quindi NON è il costo marginale del solo case management né il costo unitario per famiglia. Richiede professionisti sociali qualificati, tempo di presa in carico, consenso, accordi di collaborazione tra enti, tutela dei dati sociali/sanitari e capacità organizzativa stabile. Nel rapporto l'intensità media nei primi 6 mesi è circa 67,8 minuti di accompagnamento per famiglia/settimana (analisi descrittiva).",
    "limitations": [
      "RCT piccolo: 112 famiglie contro 235 ritenute necessarie nella pianificazione per gli effetti minimi attesi; rischio di errori di II tipo e instabilità delle stime.",
      "Misurazioni a un anno su un sottocampione per ingresso tardivo/incompletezza di registri; risultati su formazione/inserimento non dimostrano occupazione effettiva, né un effetto between-group statisticamente robusto.",
      "Risultato significativo a sei mesi circoscritto a trasferimenti economici aggiuntivi; nessuna evidenza causale di aumento del sostegno minimo generale, di miglioramento duraturo delle condizioni abitative, di reddito o occupazione.",
      "Eterogeneità territoriale e giuridica dei benefici e competenze: OCMW, VDAB e supporti belgi non sono equivalenti alle misure italiane; gli effetti numerici non sono trasferibili automaticamente.",
      "Rapporto scientifico commissionato nel progetto, senza identificazione di articolo peer-reviewed sulla medesima sperimentazione; esaminati campione e tavole originali.",
      "Analisi dei singoli meccanismi di efficacia dei case manager sono osservazionali post-trattamento: non provano effetti separati delle attività di advocacy, counselling o Sien Online.",
      "I 12 team territoriali attivati nel 2023 non sono l'assegnazione randomizzata del 2017 e non devono ereditare la stima +19,6 pp."
    ],
    "unintendedEffects": "Non è documentato un effetto avverso statisticamente robusto sui principali outcome a sei mesi. L'accompagnamento è intensivo e può creare sovraccarico per servizi che non dispongano di posti/risorse sufficienti; possibili criticità di privacy e dipendenza dall'operatore vanno presidiate, ma non sono effetti causalmente misurati dal trial.",
    "primarySource": {
      "label": "Città di Kortrijk — MISSION: programma comunale, RCT, organizzazione e finanziamento",
      "url": "https://www.kortrijk.be/mission"
    },
    "evaluationStudies": [
      {
        "label": "OCMW Kortrijk / KU Leuven / Università di Anversa, MISSION Final Report (gennaio 2020)",
        "url": "https://www.kortrijk.be/sites/kortrijk/files/2020-03/MISSION_FINAL%20REPORT.pdf",
        "citation": "Van Lancker, W., Cappelle, H., Cox, N., Decorte, A., Defossez, E., Denoo, H., Stevens, F. & Willems, A. (2020). MISSION: Mobile Integrated Social Services Increasing employment Outcomes for people in Need. Final Report, January 2020, sezioni 4–5, Tabella 15 (p. 97)."
      },
      {
        "label": "Comune di Kortrijk — riorganizzazione in dodici équipe territoriali, 2 marzo 2023",
        "url": "https://pers.kortrijk.be/223608-kortrijk-pioniert-met-nieuw-model-van-sociaal-werk/",
        "citation": "Stad Kortrijk (2023). Kortrijk pioniert met nieuw model van sociaal werk: van 1 OCMW naar 12 wijkteams. Fonte primaria sulla successiva evoluzione amministrativa, non secondo studio d'impatto."
      }
    ],
    "lastVerifiedAt": "2026-11-23",
    "transferabilityItaly": "Alta per metodo di outreach e riduzione del mancato accesso ai diritti, previa mappatura delle competenze e misure di welfare locali, nazionali e regionali. Richiede coordinamento con Ambito Territoriale Sociale, INPS/CAF, ASP, centri per l'impiego e terzo settore senza centralizzare indebitamente dati sensibili. Non è un nuovo sussidio, ma una diversa organizzazione per rendere fruibili le misure esistenti.",
    "lameziaAdaptation": "L'ATS di Lamezia Terme ha già un Ufficio di Piano e un Servizio sociale professionale, oltre ad avvisi per il sostegno alle famiglie (es. supporto con educatori familiari 14/04/2026). Non suggerire di crearli ex novo. Proporre, dopo una ricognizione delle prestazioni e dei dati, un pilota consensuale in 1–2 ambiti o zone con famiglie con bambini piccoli che utilizzano servizi diversi, con un referente sociale unico incaricato di identificare aiuti non richiesti, orientare/attivare le pratiche e coordinare servizi esistenti; comparatore appropriato con presa in carico usuale e monitoraggio a 6 e 12 mesi di accesso effettivo, tempi, oneri familiari, qualità, errori, costi, evitando ogni ostacolo all'accesso ordinario.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "mappa delle prestazioni nazionali, regionali e comunali e dei requisiti attuali",
      "stima della mancata fruizione su dati aggregati e con valutazione della base giuridica dei collegamenti informativi",
      "accordo ATS–Comune–ASP–centri impiego–enti terzo settore per rinvii e presa in carico",
      "personale sociale formato al case management e carichi di lavoro sostenibili",
      "protocollo di consenso, minimizzazione e accessi ai dati personali e sanitari",
      "indicatori preregistrati: aiuti ottenuti, tempi, rinunce, soddisfazione, richieste duplicate, costi e possibili effetti avversi",
      "campione pilota e gruppo comparabile di utenti in accesso ordinario, con valutazione indipendente"
    ],
    "tags": [
      "Kortrijk",
      "Belgio",
      "MISSION",
      "2017",
      "2019",
      "RCT",
      "non-take-up",
      "outreach",
      "case management",
      "benefici sociali",
      "famiglie con minori",
      "+19,6 punti percentuali",
      "Welfare",
      "ATS Lamezia",
      "servizio sociale professionale"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-23",
        "note": "Discovery ed espansione via Parallel Search; verifica indipendente direttamente su sito del Comune di Kortrijk e rapporto originale integrale (gennaio 2020), incluse Tabella 15 p. 97 e figure p. 99. Confronto antidupli su 73 moduli dell'archivio GitHub e ricerche PR (ente, intervento, area, autori); nessun equivalente. Distinti effetti significativi su aiuti supplementari a sei mesi, effetti non significativi sui restanti outcome, follow-up incompleto a 12 mesi e successiva riorganizzazione in 12 équipe. Per Lamezia verificati Ufficio di Piano ATS, Servizio Sociale Professionale e avviso educatori familiari con fonti ufficiali."
      }
    ]
  }
];
