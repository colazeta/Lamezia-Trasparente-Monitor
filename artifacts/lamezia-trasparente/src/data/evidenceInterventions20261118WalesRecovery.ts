import type { EvidenceIntervention } from "./evidenceInterventions";

/** 2013 Welsh local-education recovery boards, evaluated in Andrews (2026), sources verified 2026-11-18. */
export const EVIDENCE_INTERVENTIONS_2026_11_18_WALES_RECOVERY: readonly EvidenceIntervention[] = [
  {
    "id": "wales-local-education-recovery-boards-2013-sdid",
    "title": "Galles: consigli indipendenti di recupero gestionale dei servizi educativi di quattro autorità locali",
    "authority": "Welsh Government (Minister for Education and Skills), in coordinamento con i County Councils di Merthyr Tydfil, Monmouthshire, Pembrokeshire e Torfaen",
    "territory": "Merthyr Tydfil, Monmouthshire, Pembrokeshire e Torfaen, Galles",
    "country": "Regno Unito",
    "implementationYear": "2013 (nomina dei recovery boards); operatività conclusa negli anni successivi; valutazione su dati scolastici 2007/08–2017/18",
    "problem": "Risultati educativi e capacità di governance locale giudicati insoddisfacenti dalle ispezioni Estyn: carenze nel monitoraggio della performance, responsabilizzazione, autovalutazione e supporto alle scuole. Serviva un recupero delle capacità amministrative senza sostituire integralmente gli organi elettivi.",
    "measure": "Il governo gallese ha istituito nel 2013 quattro independent recovery boards con esperti esterni per sorvegliare, assistere e contestare in modo strutturato le scelte gestionali delle autorità locali responsabili dell'istruzione. Per Monmouthshire e Pembrokeshire sono documentate direttive ministeriali di cooperazione e poteri di indirizzo riservati al board; la responsabilità di adempiere alle funzioni educative restava in capo all'ente. Trattamento effettivamente attuato in quattro autorità, non mera raccomandazione.",
    "mechanism": "Combinare competenza manageriale esterna, supervisione periodica, accesso ai dati, rendicontazione verso il livello regionale e pressione al miglioramento può correggere processi organizzativi deboli. La valutazione osserva il pacchetto di intervento, non identifica l'effetto separato di supervisione, risorse, nomine o riorganizzazione.",
    "population": "Alunni delle scuole secondarie e servizi educativi amministrati dalle quattro autorità locali; outcome principali basati sulle percentuali di esami GCSE e sulle assenze scolastiche, non su un campione di persone randomizzate.",
    "primaryArea": "capacita_amministrativa_personale",
    "secondaryAreas": [
      "istruzione_giovani",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "modifica_organizzativa_processo",
      "targeting_data_analytics",
      "formazione_capacity_building"
    ],
    "tools": [
      "ispezioni Estyn e diagnosi delle criticità organizzative",
      "recovery boards composti da dirigenti e specialisti esterni",
      "direttive ministeriali e rapporti periodici di avanzamento",
      "piani di miglioramento, controllo della qualità dei dati e performance management",
      "dati StatsWales su GCSE, assenze, spesa per alunno, dimensione classi e qualificazione degli insegnanti"
    ],
    "territorialScale": "Quattro autorità locali gallesi: due prevalentemente urbane (Merthyr Tydfil, Torfaen) e due rurali (Monmouthshire, Pembrokeshire); servizio educazione locale.",
    "interventionStatus": "Intervento di recupero gestionale storico avviato nel 2013; i boards sono stati successivamente dismessi (in date differenti). Lo studio valuta serie fino al 2017/18. Non si afferma che il meccanismo dei quattro boards sia ancora operativo nel 2026.",
    "evaluationMethod": "Studio quasi-sperimentale synthetic difference-in-differences (SDID), Andrews (2026), con serie annuali StatsWales 2007/08–2017/18 e un controfattuale sintetico costruito separatamente per ciascuno dei quattro enti. Stime degli effetti post-trattamento per singolo ente e indicatori (esami GCSE, assenze); esclusione dei soggetti già destinatari di interventi analoghi dal donor pool. Nessuna randomizzazione; dimensione campionaria di quattro autorità trattate.",
    "comparator": "Per ogni autorità interessata, combinazione ponderata di altre autorità gallesi non soggette alla medesima misura nel 2013, calibrata sulle serie prima del trattamento. La formazione del gruppo sintetico non azzera differenze istituzionali o shock contemporanei.",
    "outcomes": [
      "quota di alunni che conseguono GCSE con qualunque voto A*–G (standard di base)",
      "quota che consegue almeno cinque GCSE A*–C (risultati scolastici buoni)",
      "tasso di assenza scolastica in mezze giornate",
      "spesa per alunno, dimensione media delle classi d'esame, quota di insegnanti qualificati",
      "persistenza dei miglioramenti dopo lo scioglimento dei recovery boards"
    ],
    "results": "Il quadro è eterogeneo: miglioramento statisticamente significativo dei risultati GCSE a Merthyr Tydfil e Monmouthshire, soprattutto nei primi anni; l'effetto su Merthyr svanisce verso 2015/16 con la conclusione del board, mentre a Monmouthshire il miglioramento per cinque GCSE A*–C si mantiene per quattro anni, ma quello sullo standard di base si attenua. Per Pembrokeshire e Torfaen non emergono miglioramenti statisticamente robusti nell'attainment. In Merthyr il tasso di assenza peggiora; altrove non si osservano miglioramenti significativi e coerenti nelle assenze. Non dimostrata un'efficacia generalizzata dei boards o un aumento di equità.",
    "effectSize": "Andrews (2026): Merthyr Tydfil standard di base circa +2% dopo la costituzione del board, effetti iniziali sui risultati significativi per due anni; assenze circa +1% secondo le stime SDID (peggioramento). Monmouthshire standard di base oltre +3% e quota di cinque GCSE A*–C oltre +10%, nelle formulazioni dell'autore; risultati significativi rispettivamente per 2 e 4 anni. Sono variazioni descritte dallo studio, non percentuali automaticamente convertibili in punti percentuali; non vanno applicate all'intero Galles o all'Italia. Pembrokeshire e Torfaen: nessun miglioramento significativo dell'outcome educativo principale.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Richiede disponibilità di specialisti indipendenti, accordi di governo tra enti, basi giuridiche, accesso a indicatori confrontabili, reporting e capacità interna di assorbire le raccomandazioni. Lo studio non presenta una stima completa dei costi economici dei boards né una valutazione costo-beneficio. A Monmouthshire e Torfaen si osservano incrementi di spesa per studente intorno a £200 in alcune fasi, che non equivalgono al costo del board e non sono sempre statisticamente significativi.",
    "limitations": [
      "Solo quattro autorità trattate nel 2013 e donor pool gallese limitato: validità esterna ridotta, incertezza delle stime e possibile dipendenza dal pre-treatment fit dei controlli sintetici.",
      "Nomina non casuale, avvenuta dopo ispezioni negative; shock concomitanti o riforme educative gallesi generali possono influenzare il controfattuale.",
      "Boards con poteri, composizione e durata differenti; impossibile attribuire il risultato a un singolo componente del pacchetto.",
      "Le serie terminano nel 2017/18 per cambiamenti successivi nelle metriche GCSE; permanenza degli effetti nel 2026 sconosciuta.",
      "Gli outcome riguardano principalmente gli esami e le assenze: non consentono di giudicare tutti gli esiti formativi, inclusione, safeguarding o qualità della gestione.",
      "I miglioramenti GCSE non furono universali e in almeno un'autorità svanirono dopo la cessazione della supervisione esterna.",
      "Non trasferire il potere ministeriale di imporre recovery boards a un comune italiano: diverse competenze e garanzie di autonomia amministrativa."
    ],
    "unintendedEffects": "A Merthyr Tydfil il tasso di assenza è cresciuto di circa 1% secondo il paper; non vi è evidenza di un miglioramento generalizzato dell'equità. Possibile rischio di concentrarsi sugli indicatori di esame a discapito di altri obiettivi, ma lo studio non dimostra causalmente tale spostamento di attenzione. Le soluzioni di supervisione esterna possono avere costi, tensioni di accountability democratica e problemi di continuità dopo la dismissione; non quantificati come esiti causali.",
    "primarySource": {
      "label": "Welsh Government — Written Statement, Ministerial Intervention in Monmouthshire and Merthyr Tydfil (19 giugno 2013)",
      "url": "https://www.gov.wales/written-statement-ministerial-intervention-monmouthshire-and-merthyr-tydfil"
    },
    "evaluationStudies": [
      {
        "label": "Rhys Andrews (2026), Public Administration — articolo peer-reviewed ad accesso aperto",
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/padm.70050",
        "citation": "Andrews, R. (2026), Do Government Interventions Improve Local Public Service Performance? Evidence From a Synthetic Control Approach, Public Administration, pubblicato online 2 marzo 2026.",
        "doi": "10.1111/padm.70050"
      },
      {
        "label": "Cardiff University ORCA — testo integrale originale del medesimo articolo",
        "url": "https://orca.cardiff.ac.uk/id/eprint/185591/1/padm.70050.pdf",
        "citation": "Andrews (2026), versione open-access integrale: disegno, risultati e appendici relativi a quattro Welsh local authorities."
      },
      {
        "label": "Welsh Government — nomina del recovery board Pembrokeshire (20 agosto 2013)",
        "url": "https://www.gov.wales/written-statement-actions-following-reports-estyn-and-wales-audit-office-inspections-pembrokeshire",
        "citation": "Huw Lewis, Written Statement — Actions Following Reports by Estyn and the Wales Audit Office on Inspections in Pembrokeshire (20 August 2013)."
      }
    ],
    "lastVerifiedAt": "2026-11-18",
    "transferabilityItaly": "Trasferibile soprattutto il meccanismo organizzativo di diagnosi condivisa, affiancamento tecnico esterno, indicatori verificabili, responsabilità interne e follow-up dopo la conclusione del supporto. Non trasferibile automaticamente l'intervento coercitivo del governo gallese su enti locali né la responsabilità delle autorità gallesi sull'istruzione, differente dalle competenze comunali italiane. Nessun nesso dimostrato con anticorruzione.",
    "lameziaAdaptation": "Senza presupporre inefficienze e senza evocare commissariamenti, selezionare volontariamente un singolo servizio comunale con criticità documentate (per esempio tempi di manutenzione scolastica di competenza dell'ente, mensa/trasporto scolastico oppure gestione delle segnalazioni), definire con dirigenti e stakeholder baseline, qualità dei dati e obiettivi di miglioramento. Affiancare per un periodo definito un piccolo gruppo tecnico indipendente, con verbali e raccomandazioni pubbliche, responsabilità degli uffici conservate e follow-up a 6, 12 e 24 mesi dopo la fine del supporto. Se si coinvolgono scuole, rispettare autonomia didattica e ruoli di Ufficio scolastico e dirigenze.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "ricognizione delle competenze comunali e dei servizi in cui un supporto esterno è giuridicamente legittimo",
      "indicatori storici su output, qualità, inclusione e costi per servizio",
      "accordo con uffici e partner indipendenti e regole su imparzialità/conflitti di interesse",
      "tracciamento dei piani di miglioramento, scadenze, responsabili e verifiche",
      "comparatore e calendario di raccolta dati definiti prima dell'intervento",
      "sistema di valutazione della persistenza dei risultati oltre il termine dell'affiancamento"
    ],
    "tags": [
      "Galles",
      "Regno Unito",
      "Merthyr Tydfil",
      "Monmouthshire",
      "Pembrokeshire",
      "Torfaen",
      "recovery boards",
      "performance management",
      "istruzione",
      "capacità amministrativa",
      "synthetic difference-in-differences",
      "quasi-esperimento",
      "2013",
      "2026 peer-reviewed",
      "effetti non persistenti"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-18",
        "note": "Prima catalogazione; discovery obbligatoria via Parallel Search e verifica diretta degli atti Welsh Government 19/06/2013 e 20/08/2013; studio originale Andrews (2026), Public Administration, DOI 10.1111/padm.70050 e testo integrale Cardiff. Distingue due enti con miglioramenti GCSE dagli altri due senza effetti significativi, assenze peggiorate a Merthyr e mancata persistenza di alcuni risultati. Deduplicazione con archivio GitHub e PR; nessuna attribuzione impropria di competenze ministeriali a Lamezia."
      }
    ]
  }
];
