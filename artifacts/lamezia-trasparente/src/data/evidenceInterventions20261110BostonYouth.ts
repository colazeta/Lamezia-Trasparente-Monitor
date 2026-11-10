import type { EvidenceIntervention } from "./evidenceInterventions";

/** Boston SYEP: two peer-reviewed evaluations of a single 2015 applicant lottery; evidence checked 2026-11-10. */
export const EVIDENCE_INTERVENTIONS_2026_11_10_BOSTON_YOUTH: readonly EvidenceIntervention[] = [
{
  "id": "boston-syep-summer-youth-jobs-lottery-2015",
  "title": "Boston: lavori estivi retribuiti e formazione per giovani (Summer Youth Employment Program)",
  "authority": "City of Boston, Mayor’s Office of Workforce Development (2015), Action for Boston Community Development (ABCD); oggi Office of Youth Employment and Opportunity",
  "territory": "Boston, Massachusetts",
  "country": "Stati Uniti",
  "implementationYear": "Programma municipale avviato nei primi anni Ottanta; coorte valutata nel 2015, follow-up giudiziario di 17 mesi e scolastico fino a 4 anni; programma tuttora attivo nel 2026",
  "problem": "Giovani con opportunità limitate di lavoro retribuito ed esperienza professionale, difficoltà di completamento scolastico e coinvolgimento nel sistema penale; necessità di verificarne gli esiti reali oltre il numero di posti finanziati.",
  "measure": "Il Comune sostiene e coordina tirocini/lavori estivi retribuiti presso organizzazioni civiche, enti pubblici, associazioni e imprese. Nel modello valutato: sei settimane, fino a 25 ore di lavoro settimanali retribuite al salario minimo statale, più 20 ore complessive di formazione su competenze per l'occupazione e abilità relazionali. Le candidature 2015 gestite da ABCD furono selezionate per sorteggio in condizioni di eccesso di domanda.",
  "mechanism": "Offrire esperienza lavorativa reale, reddito, tutoraggio, contatti con datori di lavoro e formazione alla risoluzione dei conflitti; potenziali effetti su presenza a scuola e decisioni comportamentali. Il contributo autonomo di salario, tutoraggio e formazione non è identificato separatamente.",
  "population": "4.235 giovani candidati ad ABCD nel 2015, 14–24 anni; 1.186 selezionati casualmente per l'offerta di un posto e 3.049 non selezionati; circa l'83,6% dei selezionati ha accettato. Il campione è di candidati volontari al programma, non della totalità dei giovani di Boston.",
  "primaryArea": "istruzione_giovani",
  "secondaryAreas": [
    "sviluppo_economico_commercio_lavoro",
    "sicurezza_urbana_prevenzione",
    "welfare_inclusione_servizi_sociali",
    "capacita_amministrativa_personale"
  ],
  "interventionTypes": [
    "servizio_diretto",
    "incentivo_economico",
    "formazione_capacity_building",
    "partnership_pubblico_privato_terzo_settore",
    "modifica_organizzativa_processo"
  ],
  "tools": [
    "posti lavorativi estivi retribuiti e accordi con enti ospitanti",
    "intermediari di quartiere incaricati delle candidature e dei collocamenti",
    "sorteggio trasparente in presenza di posti insufficienti",
    "20 ore complessive di formazione su CV, comunicazione e gestione dei conflitti",
    "registri amministrativi di procedimenti giudiziari e scuole per la valutazione",
    "tutoraggio e supervisione dei datori di lavoro"
  ],
  "territorialScale": "Città, tramite intermediari di quartiere e singoli datori di lavoro; valutazione del solo intermediario ABCD, non dell'intero programma municipale",
  "interventionStatus": "Programma attivo e ampliato nel 2026 (Boston comunica 10.500 opportunità retribuite nell'estate 2026); risultati causali qui riportati riferiti esclusivamente alla coorte randomizzata 2015 presso ABCD.",
  "evaluationMethod": "Randomized admission lottery (2015) usata come esperimento naturale incorporato nell'amministrazione del programma. 4.235 candidati ABCD assegnati casualmente a offerta di lavoro o controllo; 1.186 offerte, 3.049 controlli. Valutazioni peer-reviewed di tipo intention-to-treat (ITT), con registri giudiziari seguiti per 17 mesi e dati scolastici per più anni; analisi TOT e survey su meccanismi solo ulteriori. Non si tratta di una randomizzazione delle singole componenti del programma.",
  "comparator": "3.049 candidati idonei non estratti nella lotteria ABCD 2015, confrontati nello stesso contesto e periodo con i 1.186 cui fu offerto un posto. Alcuni controlli potrebbero avere trovato lavoro altrove; il trattamento è l'offerta di un posto SYEP, non un divieto di lavorare.",
  "outcomes": [
    "numero di capi d'imputazione/udienze di prima comparizione (arraignments) per reati violenti in 17 mesi",
    "numero di arraignments per reati contro il patrimonio",
    "probabilità di almeno un arraignment (non migliorata significativamente)",
    "diploma di scuola superiore conseguito nei tempi previsti",
    "abbandono scolastico, presenze, assenze non giustificate",
    "competenze comunicative e di gestione dei conflitti (autodichiarate)"
  ],
  "results": "Nel trial del 2015 l'offerta del posto ha ridotto la FREQUENZA di arraignments per reati violenti (circa −35%) e per reati contro il patrimonio (circa −29%) nei 17 mesi successivi, senza ridurre significativamente la PROBABILITÀ di avere almeno un arraignment né il numero complessivo di arraignments per qualsiasi reato. Una distinta analisi peer-reviewed dello stesso sorteggio ha documentato +4,4 punti percentuali nella probabilità di conseguire il diploma in tempo e −2,5 punti di abbandono scolastico; anche presenze e assenze croniche risultano migliorate. Gli esiti riguardano il pacchetto occupazione+formazione fra i candidati, non la sola occupazione temporanea.",
  "effectSize": "Giustizia: −0,031 arraignments/giovane per reati violenti (−35% circa), −0,022 per reati contro il patrimonio (−29% circa), follow-up 17 mesi; nessuna differenza statisticamente significativa nell'indicatore di almeno un arraignment o nel totale per tutti i reati. Scuola: diploma nei tempi previsti +4,4 punti percentuali; abbandono −2,5 pp; presenze +2,4 pp; assenteismo cronico −5,9 pp. Le percentuali relative ai reati NON sono riduzioni dei reati commessi nell'intera città.",
  "evidenceStrength": "forte",
  "costsRequirements": "Secondo Modestino (2019) il costo a carico del Comune nel modello studiato era circa 2.000 USD per partecipante, di cui poco più di 1.400 USD di salari e circa 600 USD di costi amministrativi; la stima esclude alcuni costi-opportunità e non è trasferibile monetariamente all'Italia. Servono copertura retributiva regolare, enti ospitanti, tutor, assicurazioni, sicurezza sul lavoro, contratti conformi, formazione e monitoraggio. Benefici sociali da minori reati stimati circa 1.928 USD/partecipante: simulazione, NON risparmio di cassa comunale osservato.",
  "limitations": [
    "Validità esterna: i candidati volontari dell'intermediario ABCD non rappresentano tutti i giovani della città; l'offerta è stata accettata dall'83,6%, e parte dei non selezionati può aver lavorato altrove.",
    "Il numero di arraignments non è misura diretta dei reati effettivamente commessi né degli esiti definitivi dei procedimenti; il trattamento non ha ridotto significativamente la probabilità di almeno una comparizione.",
    "Il meccanismo via miglioramento della gestione dei conflitti deriva da analisi correlate a survey, quindi è indicativo, non causalmente isolato.",
    "Gli articoli del 2019 e del 2023 utilizzano la stessa lotteria 2015: costituiscono valutazioni di outcome diversi, non repliche indipendenti del trattamento.",
    "Il rapporto benefici/costi è preliminare e modellizzato, dipende da prezzi sociali del crimine e omette costi di opportunità; non è una prova di risparmio netto fiscale.",
    "Il programma 2026 ha organizzazione e scala diverse dalla coorte valutata; risultati causalmente verificati non possono essere estesi automaticamente ai nuovi partecipanti o all'ordinamento italiano."
  ],
  "unintendedEffects": "Non emerge un danno sistematico dimostrato dagli studi richiamati. Nessun effetto robusto sulla probabilità di almeno un arraignment e sui reati complessivi; alcuni miglioramenti scolastici di breve periodo (GPA) si attenuano negli anni successivi. Possibili rischi di selezione, sostituzione di lavoro ordinario o qualità diseguale delle esperienze vanno monitorati in un adattamento italiano: non sono effetti avversi causalmente dimostrati dalla sperimentazione.",
  "primarySource": {
    "label": "City of Boston — SuccessLink youth jobs and partner programme (2026)",
    "url": "https://content.boston.gov/departments/youth-employment-and-opportunity/employment-partners"
  },
  "evaluationStudies": [
    {
      "label": "Journal of Policy Analysis and Management — originale full text",
      "url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pam.22138",
      "citation": "Modestino, A. S. (2019), How Do Summer Youth Employment Programs Improve Criminal Justice Outcomes, and for Whom?, Journal of Policy Analysis and Management 38(3):600–628.",
      "doi": "10.1002/pam.22138"
    },
    {
      "label": "Education Finance and Policy — studio sulle presenze e sui diplomi",
      "url": "https://doi.org/10.1162/edfp_a_00371",
      "citation": "Modestino, A. S. & Paulsen, R. (2023), School's Out: How Summer Youth Employment Programs Impact Academic Outcomes, Education Finance and Policy 18(1):97–126.",
      "doi": "10.1162/edfp_a_00371"
    },
    {
      "label": "J-PAL — sintesi accademica del trial su esiti scolastici",
      "url": "https://www.povertyactionlab.org/evaluation/impact-summer-youth-employment-programs-academic-outcomes-boston",
      "citation": "J-PAL, Impact of Summer Youth Employment Programs on Academic Outcomes in Boston, sintesi del disegno di lotteria e risultati su registri scolastici."
    }
  ],
  "lastVerifiedAt": "2026-11-10",
  "transferabilityItaly": "Principio trasferibile di esperienze estive retribuite e tutorate con formazione trasversale, attraverso partenariati pubblico/privato/terzo settore e valutazione di esiti scolastici. NON trasferire meccanicamente età 14–24, salario, durata, sorteggio né ricadute criminologiche: in Italia verificare lavoro minorile, obbligo d'istruzione/formazione, tirocini, tutele sul lavoro, criteri di accesso e privacy.",
  "lameziaAdaptation": "Proporre una verifica di fattibilità di 'Estate Lavoro Lamezia', distinta dal progetto comunale ricreativo 'La mia estate' (avviso 16 luglio 2026). Con Comune, scuole, Centro per l'impiego di Lamezia, imprese e terzo settore: eventuale pilota di 30–50 opportunità brevi retribuite e tutorate per giovani almeno sedicenni ove consentito, orientamento e circa 20 ore complessive di competenze trasversali. Collegare i partecipanti idonei, in base ai requisiti, ai programmi regionali Lavoro Giovani Calabria e CalALMA evitando sovrapposizioni. Definire regole trasparenti e legittime per assegnare i posti e, solo se ammissibile, un sorteggio fra eleggibili in eccesso di domanda; outcome: completamento, frequenza scolastica, competenze e inserimenti successivi, più costi.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "convenzioni con istituti scolastici e soggetti ospitanti e verifica di regimi contrattuali consentiti",
    "fondi per compensi e coperture previdenziali/assicurative e salute e sicurezza",
    "criteri pubblici di selezione e prevenzione conflitti di interesse",
    "accordi per uso lecito di dati scolastici amministrativi in forma aggregata/pseudonimizzata e consenso dove applicabile",
    "baseline e monitoraggio a 6–24 mesi: presenze, completamento, successiva formazione/occupazione, soddisfazione",
    "report dei costi per posto e per partecipante completante"
  ],
  "tags": [
    "giovani",
    "occupazione estiva",
    "formazione",
    "inclusione",
    "scuola",
    "prevenzione",
    "lotteria",
    "RCT",
    "Boston",
    "partenariato",
    "esiti amministrativi"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-10",
      "note": "Primo inserimento: verifica sulla fonte municipale Boston.gov (programma e continuità 2026), sullo studio peer-reviewed Modestino 2019, sulla valutazione accademica Modestino–Paulsen 2023 e su J-PAL; distinto dai programmi Chicago/NYC già in archivio."
    }
  ]
}
];
