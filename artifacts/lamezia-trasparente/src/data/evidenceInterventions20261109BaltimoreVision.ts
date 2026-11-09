import type { EvidenceIntervention } from "./evidenceInterventions";

/** Baltimore Vision for Baltimore: peer-reviewed school-cluster RCT (2016–2019), verified 2026-11-09. */
export const EVIDENCE_INTERVENTIONS_2026_11_09_BALTIMORE_VISION: readonly EvidenceIntervention[] = [
  {
    "id": "baltimore-vision-for-baltimore-school-eyeglasses-cluster-rct-2016",
    "title": "Baltimora: screening visivo a scuola, visite oculistiche e occhiali gratuiti per migliorare l'apprendimento",
    "authority": "Baltimore City Health Department e Baltimore City Public Schools, in partnership con Johns Hopkins University, Vision To Learn e Warby Parker",
    "territory": "Baltimora, Maryland (scuole pubbliche cittadine)",
    "country": "Stati Uniti",
    "implementationYear": "Programma avviato nel 2016; assegnazione per coorti scolastiche 2016–2017, 2017–2018 e 2018–2019",
    "problem": "Difetti refrattivi non corretti fra alunni che incontrano barriere economiche, informative e logistiche all'accesso a visite oculistiche e occhiali; possibile svantaggio nell'apprendimento della lettura.",
    "measure": "Programma cittadino Vision for Baltimore: screening visivo a scuola svolto dal Dipartimento di salute cittadino, visita di optometrista presso clinica mobile in istituto per gli alunni con screening non superato e consenso necessario, prescrizione e consegna gratuita di occhiali con possibilità di sostituzione; supporto e monitoraggio con istituzioni educative, sanitarie e partner.",
    "mechanism": "Portare la diagnosi e la correzione ottica nel contesto scolastico riduce barriere di accesso, migliora la possibilità di vedere testi e lavagna e può facilitare l'apprendimento. La valutazione riguarda il pacchetto di accesso a cure visive e occhiali, non una singola componente.",
    "population": "Nel trial: 2.304 alunni delle classi 3–7 (120 scuole; coorte 1: 964 alunni/41 scuole, coorte 2: 775/41, coorte 3: 565/38). Il programma cittadino più ampio comprende anche altre classi; non confondere i due denominatori.",
    "primaryArea": "istruzione_giovani",
    "secondaryAreas": [
      "salute_pubblica_locale",
      "welfare_inclusione_servizi_sociali",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "servizio_diretto",
      "partnership_pubblico_privato_terzo_settore",
      "modifica_organizzativa_processo",
      "targeting_data_analytics"
    ],
    "tools": [
      "screening visivo in sede scolastica",
      "clinica oculistica/optometrica mobile",
      "occhiali gratuiti e sostituzioni",
      "consenso dei genitori o esercenti la responsabilità",
      "assegnazione progressiva randomizzata delle scuole",
      "test standardizzati i-Ready e PARCC per esiti scolastici"
    ],
    "territorialScale": "Scuole pubbliche: attuazione progressiva per istituto, con coordinamento cittadino tra scuola, autorità sanitaria e fornitori.",
    "interventionStatus": "Intervento reale avviato nel 2016 e ancora descritto come attivo dai partner; i risultati causali riportati riguardano le coorti scolastiche 2016–2019, non dimostrano esiti della versione odierna né benefici a vita.",
    "evaluationMethod": "Cluster randomized controlled trial, scuole assegnate casualmente 1:1:1 a ricevere il programma in uno dei tre anni scolastici (2016–2017, 2017–2018, 2018–2019); analisi intention-to-treat a livello alunno con modelli gerarchici; outcome a 1 anno e 2 anni; confronto fra coorti già trattate e coorti non ancora trattate.",
    "comparator": "Scuole randomizzate a ricevere il programma negli anni successivi, usate come controllo contemporaneo (coorte 1 versus 2 e 3 al primo anno, coorte 2 versus 3 al secondo). Non confronto puramente prima/dopo.",
    "outcomes": [
      "punteggi standardizzati di lettura i-Ready e PARCC",
      "punteggi di matematica i-Ready e PARCC",
      "eterogeneità esplorativa per bisogni educativi e rendimento iniziale",
      "persistenza del risultato educativo a due anni"
    ],
    "results": "Nel primo anno scolastico, l'accesso anticipato al pacchetto visivo migliora modestamente il punteggio i-Ready di lettura (+0,09 deviazioni standard; p=0,02). Nel secondo anno il risultato di lettura (+0,12 SD) non è statisticamente significativo (p=0,09); nessun effetto generale robusto su matematica o test PARCC. Il confronto di follow-up a due anni non rileva un beneficio duraturo statisticamente significativo. Alcuni sottogruppi (alunni in educazione speciale, risultati iniziali più bassi) mostrano effetti più grandi nella lettura, da interpretare con prudenza per analisi multiple.",
    "effectSize": "Neitzel et al. (2021), Tabella 2: i-Ready reading anno scolastico 2016–2017 ES +0,09 SD, IC95% [0,01; 0,17], p=0,02; lettura 2017–2018 ES +0,12 SD, IC95% [−0,02; 0,26], p=0,09 (non significativo); matematica complessiva nel 2016–2017 ES 0,00; lettura PARCC ES +0,04, p=0,31. Follow-up i-Ready reading a 2 anni ES +0,08 SD, IC95% [−0,05; 0,22], p=0,23 (non significativo). Sono SD standardizzate, NON variazioni percentuali e NON miglioramenti clinici misurati.",
    "evidenceStrength": "forte",
    "costsRequirements": "Il paper non fornisce un costo pieno per studente né una valutazione costo-efficacia trasferibile. Servono accordi operativi con servizio sanitario e scuole, professionisti abilitati, clinica mobile o ambulatori, materiali, montature/lenti, raccolta consensi, logistica consegna e sostituzione, fondi o donazioni tracciabili e gestione corretta dei dati sanitari dei minori. Il partner Johns Hopkins riferisce che circa un quarto degli occhiali consegnati nei primi tre anni era costituito da sostituzioni: la manutenzione non è trascurabile.",
    "limitations": [
      "La randomizzazione rafforza la stima dell'accesso anticipato alle cure visive, ma l'intervento include screening, visite e consegna degli occhiali: non identifica separatamente l'efficacia dei singoli componenti.",
      "L'effetto significativo è circoscritto alla lettura misurata con i-Ready nel primo anno; gli outcome PARCC e la matematica nel campione complessivo non mostrano un effetto robusto.",
      "Nessuna persistenza statisticamente significativa rilevata nel confronto a due anni (non significa prova di effetto nullo); possibili perdite/rotture degli occhiali, mobilità degli alunni e dinamiche scolastiche che limitano benefici duraturi.",
      "I sottogruppi presentano effetti potenzialmente più elevati, ma le numerose analisi aumentano il rischio di risultati casuali e non giustificano target selettivi senza verifica.",
      "Gli alunni analizzati sono quelli identificati come bisognosi di occhiali e inclusi nel trial; non si può estendere l'effetto a tutti gli alunni o alle scuole italiane senza adattamento.",
      "Lo studio non misura l'eventuale riduzione di disuguaglianze nel lungo termine, né risparmi per il sistema sanitario o per le famiglie quantificabili causalmente.",
      "La copertura è condizionata a screening, consenso informato, visite, continuità d'uso e capacità di sostituire occhiali danneggiati; i dati accademici sono su minori e richiedono tutela rigorosa."
    ],
    "unintendedEffects": "Lo studio non identifica con certezza danni significativi. Rischi operativi da prevenire e monitorare in un pilota: stigmatizzazione, mancato consenso di famiglie difficili da contattare, liste d'attesa, perdita o mancato utilizzo degli occhiali, diseguaglianze nel follow-up; non sono effetti causali dimostrati dello studio.",
    "primarySource": {
      "label": "Vision for Baltimore — programma attuato dalla Baltimore City Health Department con scuole e partner, descrizione ufficiale",
      "url": "https://schoolhealth.jhu.edu/initiatives-research/projects/vision-for-baltimore/"
    },
    "evaluationStudies": [
      {
        "label": "JAMA Ophthalmology — trial randomizzato originale, testo e tabelle",
        "url": "https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2783867",
        "citation": "Neitzel, A. J., Wolf, B., Guo, X., et al. (2021). Effect of a Randomized Interventional School-Based Vision Program on Academic Performance of Students in Grades 3 to 7: A Cluster Randomized Clinical Trial. JAMA Ophthalmology, 139(10), 1104–1114.",
        "doi": "10.1001/jamaophthalmol.2021.3544"
      },
      {
        "label": "Johns Hopkins Medicine — verifica storica dell'attuazione e partnership 2016–2022",
        "url": "https://www.hopkinsmedicine.org/news/articles/2022/11/vision-for-baltimore-celebrates-providing-10000-pairs-of-eyeglasses-for-city-students",
        "citation": "Johns Hopkins Medicine (21 novembre 2022), resoconto della consegna di 10.000 paia di occhiali e partnership; fonte descrittiva, NON una seconda valutazione indipendente."
      }
    ],
    "lastVerifiedAt": "2026-11-09",
    "transferabilityItaly": "Alta per il meccanismo di prossimità e il coordinamento tra scuola, assistenza sanitaria e terzo settore; non automaticamente trasferibili gli effetti sui test americani. In Italia screening, visite, diagnosi e prescrizione richiedono competenze e responsabilità del SSN/ASP e professionisti abilitati; il Comune può facilitare accordi, spazi, comunicazione e inclusione sociale nel rispetto della competenza scolastica e sanitaria e della normativa privacy.",
    "lameziaAdaptation": "Proporre all'Ufficio Politiche educative di Lamezia Terme, ai dirigenti scolastici e all'ASP Catanzaro una ricognizione anonima dell'accesso agli screening visivi pediatrici e delle eventuali barriere alla consegna e sostituzione di occhiali. Se emerge un bisogno e con un protocollo clinico dell'ASP, pilotare in alcuni istituti un percorso di screening in sede, invio a visita specialistica, facilitazione della fornitura di occhiali ai minori eleggibili e sostituzione, senza sostituire competenze sanitarie né introdurre criteri arbitrari di accesso. Monitorare adesione, visite completate, consegna, uso e sostituzioni; eventuali esiti di lettura solo aggregati, consensuali e valutati con comparatori adeguati.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "accordo scritto fra Comune, ASP Catanzaro, istituzioni scolastiche e fornitori/ETS",
      "ricognizione di screening visivi pediatrici già disponibili e prestazioni LEA o eventuali agevolazioni",
      "personale sanitario/optometrico abilitato, strumentazione e percorso di invio clinico",
      "procedure di consenso/informativa e base giuridica per dati sanitari e scolastici dei minori, con ruoli titolare/responsabile definiti",
      "budget verificato di screening, esami, occhiali e sostituzioni; governance di donazioni o affidamenti",
      "indicatori aggregati con denominator e follow-up per accesso e continuità d'uso",
      "disegno di valutazione definito ex ante, eventualmente rollout progressivo solo dove giuridicamente e clinicamente appropriato"
    ],
    "tags": [
      "Vision for Baltimore",
      "Baltimore",
      "USA",
      "salute visiva",
      "occhiali",
      "screening scolastico",
      "diritto allo studio",
      "cluster-RCT",
      "JAMA Ophthalmology",
      "i-Ready",
      "educazione",
      "prevenzione sanitaria",
      "partnership",
      "Lamezia Terme"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-09",
        "note": "Primo censimento, discovery tramite Parallel Search; verificati direttamente articolo peer-reviewed JAMA Ophthalmology (RCT, Tabella 2, ES/IC e outcome nulli), sito operativo Vision for Baltimore, materiali Johns Hopkins, competenze dell'Ufficio Politiche educative di Lamezia. Deduplicazione su 55 moduli archivio e ricerca PR. Documentata l'assenza di significatività dei follow-up a 2 anni e delle misure PARCC, escluso ogni claim di risparmio economico verificato."
      }
    ]
  }
];
