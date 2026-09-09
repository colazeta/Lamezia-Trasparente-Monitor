import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_09_08 = [
  {
    id: "denver-star-alternative-crisis-response",
    title: "STAR: risposta sanitaria alternativa alla polizia per crisi non violente",
    authority: "City and County of Denver / Denver Department of Public Health & Environment",
    territory: "Denver, Colorado",
    country: "Stati Uniti",
    implementationYear: "Dal 1 giugno 2020; pilot di sei mesi, poi espansione cittadina",
    problem:
      "Chiamate al 911 relative a crisi di salute mentale, uso di sostanze, homelessness o povertà che non richiedono una risposta di polizia, ma che nel modello tradizionale possono produrre criminalizzazione, arresti o uso inefficiente delle risorse di emergenza.",
    measure:
      "Support Team Assisted Response (STAR) invia, per chiamate selezionate a basso rischio e senza armi, minacce o violenza, una squadra civile composta da un professionista sanitario d'emergenza e un clinico di salute comportamentale. Il team effettua valutazione, de-escalation, supporto sul posto, trasporto di cortesia e collegamento ai servizi, senza presenza ordinaria della polizia.",
    mechanism:
      "Sostituire la risposta coercitiva con una risposta sanitaria nelle crisi appropriate riduce la probabilità che comportamenti associati a disagio, sostanze o homelessness vengano registrati come reati minori e può interrompere crisi persistenti collegando le persone a cure e servizi. Il triage del 911 seleziona i casi non violenti compatibili con STAR.",
    population:
      "Persone che generano chiamate di emergenza/non emergenza per crisi comportamentali o sociali non violente. Nel pilot 2020 STAR operava in otto dei 36 precinct di polizia e rispose a 748 incidenti in sei mesi.",
    primaryArea: "sicurezza_urbana_prevenzione",
    secondaryAreas: ["salute_pubblica_locale", "welfare_inclusione_servizi_sociali"],
    interventionTypes: ["servizio_diretto", "modifica_organizzativa_processo", "partnership_pubblico_privato_terzo_settore"],
    tools: ["triage 911", "clinico di salute comportamentale", "EMT/paramedico", "unità mobile", "de-escalation", "referral e rete di servizi"],
    territorialScale: "Precinct nel pilot; successiva copertura cittadina",
    interventionStatus:
      "Programma istituzionalizzato e ampliato dopo il pilot. La documentazione municipale di espansione prevede copertura cittadina almeno sette giorni su sette per 16 ore al giorno e una rete di servizi di follow-up.",
    evaluationMethod:
      "Studio quasi-sperimentale preregistrato con difference-in-differences e difference-in-difference-in-differences. Usa 432 osservazioni precinct-mese nei sei mesi prima e dopo l'avvio, confrontando gli otto precinct STAR con precinct non trattati o non ancora trattati; include effetti fissi di precinct e mese, event study, placebo su anni precedenti, modelli alternativi e un confronto interno tra reati STAR-related e reati non direttamente eleggibili.",
    comparator:
      "Precinct di Denver non coperti da STAR nello stesso periodo e, nelle specificazioni triple-difference, andamento dei reati non STAR-related all'interno degli stessi precinct trattati.",
    outcomes: ["reati minori STAR-related registrati", "reati più gravi/non STAR-related", "spillover temporali e spaziali", "costo diretto per reato registrato evitato"],
    results:
      "Nei precinct coperti, i reati minori direttamente collegabili alle tipologie di chiamata STAR diminuiscono nettamente rispetto al controfattuale, mentre non emerge un aumento rilevabile dei reati più gravi/non target. Una parte dell'effetto riflette direttamente il fatto che una risposta sanitaria non registra la persona come autore di un reato minore; la presenza di riduzioni anche nelle ore in cui STAR non era operativo è coerente con ulteriori benefici temporali, ma non consente di attribuire tutto il 34% a una riduzione della condotta criminale sottostante.",
    effectSize:
      "Reati STAR-related registrati: circa −34% nei sei mesi del pilot, equivalente nella stima degli autori a circa 1.376 reati registrati in meno negli otto precinct. Nessun effetto discernibile sui reati più gravi/non STAR-related. Costo del pilot circa 208.141 USD, pari a circa 151 USD per reato registrato evitato secondo il calcolo dello studio, rispetto a un benchmark di circa 646 USD di costo diretto per un reato minore gestito dal sistema di giustizia penale.",
    evidenceStrength: "forte",
    costsRequirements:
      "Richiede dispatch/triage affidabile, protocolli rigorosi di eleggibilità ed escalation, équipe clinico-sanitarie mobili, copertura assicurativa e clinica, accesso a servizi downstream e governance interistituzionale. Il costo del pilot non è direttamente trasferibile a un sistema italiano e non include tutti i costi dei servizi successivi al contatto.",
    limitations: [
      "Gli otto precinct del pilot furono scelti intenzionalmente, non randomizzati; l'identificazione poggia quindi sulle assunzioni del difference-in-differences, pur supportate da event study e numerose robustness checks.",
      "Il pilot coincide in parte con il 2020 e con la pandemia COVID-19; gli autori effettuano controlli e placebo, ma il contesto resta eccezionale.",
      "L'outcome principale è il numero di reati registrati dalla polizia, non una misura diretta di ogni comportamento dannoso: una quota dell'effetto è una riduzione della criminalizzazione/documentazione di condotte associate alla crisi.",
      "La selezione delle chiamate è parte essenziale del trattamento: il modello non riguarda incidenti con armi, minacce, violenza o bisogni medici gravi.",
      "Le competenze italiane su emergenza sanitaria e ordine pubblico non sono concentrate nel Comune e richiederebbero accordi con ASP/118, Prefettura e forze di polizia."
    ],
    unintendedEffects:
      "Un triage troppo ampio potrebbe inviare personale civile in situazioni non sicure; uno troppo restrittivo riduce copertura e impatto. Sono inoltre possibili vuoti di presa in carico se il team mobile non dispone di servizi di salute mentale, dipendenze, housing e welfare cui effettuare referral effettivi.",
    primarySource: {
      label: "City and County of Denver — STAR Program Expansion Overview",
      url: "https://www.denvergov.org/files/assets/public/public-health-and-environment/documents/cbh/star_communityadvisorycommittee_announcement.pdf"
    },
    evaluationStudies: [
      {
        label: "Science Advances / PubMed",
        url: "https://pubmed.ncbi.nlm.nih.gov/35675395/",
        citation: "Dee TS, Pyne J (2022), A community response approach to mental health and substance abuse crises reduced crime",
        doi: "10.1126/sciadv.abm2106"
      },
      {
        label: "Urban Institute — evaluation of Denver STAR",
        url: "https://www.urban.org/research/publication/evaluating-alternative-crisis-response-denvers-support-team-assisted-response",
        citation: "Urban Institute (2024), Evaluating Alternative Crisis Response in Denver's Support Team Assisted Response Program"
      }
    ],
    lastVerifiedAt: "2026-09-08",
    transferabilityItaly:
      "Media. Il principio di inviare il professionista appropriato al bisogno è altamente trasferibile, ma un Comune italiano non può sostituire unilateralmente 118 o forze di polizia. L'elemento replicabile è un protocollo interistituzionale di triage e risposta civile/sanitaria per una popolazione rigorosamente definita, con escalation immediata quando emergono rischi.",
    lameziaAdaptation:
      "Mappare per 6–12 mesi le chiamate ripetute e gli interventi relativi a crisi comportamentali, homelessness, dipendenze e welfare senza violenza; con ASP, 118, Prefettura e terzo settore definire una tassonomia di casi a basso rischio e valutare un piccolo pilot di unità mobile o co-response non coercitiva in fasce orarie circoscritte. Predefinire sicurezza, referral completati, ricontatti, uso di PS/forze di polizia e costi come outcome, senza usare la sola riduzione delle registrazioni penali come proxy di successo.",
    implementability: "strutturale",
    capacityDataNeeds: ["microdati aggregabili sulle chiamate e tipologie di intervento", "protocollo di triage ed escalation", "personale sanitario e psicosociale", "accordo Comune-ASP/118-Prefettura", "rete servizi e referral outcome", "monitoraggio sicurezza e ricontatti"],
    tags: ["crisis response", "salute mentale", "911", "alternative response", "STAR", "difference-in-differences", "Denver"],
    revisionHistory: [{ date: "2026-09-08", note: "Prima verifica; distinta esplicitamente la riduzione dei reati registrati dalla riduzione della condotta criminale sottostante e verificati DD/DDD, spillover e costi del pilot." }]
  },
  {
    id: "calgary-311-service-request-resolution-rct",
    title: "Sistema 311 per trasformare segnalazioni civiche in richieste di servizio tracciabili",
    authority: "City of Calgary — 311 Citizen Services",
    territory: "Calgary, Alberta",
    country: "Canada",
    implementationYear: "Servizio 311 dal 2005; app mobile dal 2013; field experiment nel 2025",
    problem:
      "Problemi locali come graffiti, ghiaccio, lampioni guasti, segnaletica, buche o detriti possono restare invisibili all'amministrazione se i residenti non dispongono di un canale unico che instradi correttamente la richiesta verso il servizio competente.",
    measure:
      "Canale unico 311, disponibile per telefono, web e app, che genera una service request, la instrada al dipartimento competente e consente di seguirne lo stato. L'app permette geolocalizzazione, foto e aggiornamenti quasi in tempo reale; il sistema copre numerosi servizi comunali non emergenziali.",
    mechanism:
      "Centralizzare la segnalazione riduce il costo informativo per il cittadino e rende visibile il problema all'unità amministrativa competente. Ticket, classificazione e routing trasformano un problema osservato nello spazio pubblico in un'attività tracciabile, mentre i dati aggregati consentono monitoraggio operativo e accountability.",
    population:
      "Residenti e utilizzatori dei servizi comunali. Nel field experiment di febbraio 2025 sono stati osservati 250 problemi locali accoppiati per tipologia e quartiere, in 42 comunità di Calgary.",
    primaryArea: "digitalizzazione_servizi_online",
    secondaryAreas: ["capacita_amministrativa_personale"],
    interventionTypes: ["infrastruttura_digitale", "modifica_organizzativa_processo", "informazione_trasparenza"],
    tools: ["numero unico 311", "portale web", "app mobile", "ticket/service request", "foto e geolocalizzazione", "routing per dipartimento", "dashboard pubblica"],
    territorialScale: "Intera città / singolo problema geolocalizzato",
    interventionStatus:
      "Operativo. Calgary mantiene nel 2026 un servizio 311 disponibile 24/7, con telefono, portale e app; il sito comunale indica oltre 90 tipologie di richiesta disponibili sull'app e pubblica dashboard aggiornate delle service request.",
    evaluationMethod:
      "Field experiment randomizzato. I ricercatori identificavano coppie di problemi dello stesso tipo nello stesso quartiere e, tramite coin flip, inviavano uno dei due al 311 lasciando l'altro non segnalato sperimentalmente. Dopo 3–10 giorni (media 4,7) tornavano sul posto e verificavano fisicamente se il problema fosse stato risolto. Le stime OLS includono giorni trascorsi e fixed effects per tipologia; una logit produce risultati quasi identici.",
    comparator:
      "Problema gemello dello stesso tipo e nello stesso quartiere identificato nello stesso momento ma non inviato al 311 dal gruppo di ricerca.",
    outcomes: ["risoluzione fisica del problema entro 3–10 giorni", "eterogeneità per tipologia di problema", "eterogeneità per indice di equità del quartiere"],
    results:
      "La segnalazione al 311 aumenta nettamente la probabilità che il problema non sia più presente al follow-up. L'effetto è stabile nelle specificazioni e non emerge una differenza sistematica dell'efficacia del trattamento lungo l'indice socioeconomico/equity dei quartieri, condizionatamente alle tipologie osservate.",
    effectSize:
      "Probabilità di risoluzione entro 3–10 giorni: +26 punti percentuali nel modello base e +27 p.p. con giorni e fixed effects per tipo (SE circa 0,06; p<0,01; N=250). La logit restituisce un marginal effect di +27 p.p. L'interazione tra trattamento e Calgary Equity Index è circa −0,001 (SE 0,005), compatibile con assenza di eterogeneità rilevabile.",
    evidenceStrength: "forte",
    costsRequirements:
      "Lo studio non stima il costo del sistema. Servono un front door unico, classificazione standard delle richieste, CRM/ticketing, ownership chiara per categoria, SLA o priorità operative, integrazione con squadre sul territorio e dashboard di stato. Il valore del canale dipende dalla capacità downstream di chiudere realmente le richieste.",
    limitations: [
      "Il field experiment riguarda 250 problemi e un follow-up molto breve, raccolti in febbraio 2025; non misura tempi lunghi, soddisfazione, costi o qualità della riparazione.",
      "Il paper è un working paper del 2025 e non risulta peer-reviewed nella fonte verificata; la randomizzazione è forte ma la base empirica resta relativamente piccola.",
      "Le categorie sono soprattutto problemi fisici facilmente osservabili: neve/ghiaccio, graffiti, lampioni, segnaletica, buche e detriti. Non è dimostrata la stessa efficacia per procedimenti complessi o richieste sociali.",
      "L'esperimento misura l'effetto di segnalare un problema attraverso un sistema 311 già maturo, non l'effetto causale di introdurre ex novo l'intera infrastruttura 311.",
      "La probabilità di utilizzare il 311 può differire tra gruppi sociali: l'assenza di eterogeneità nella risposta condizionata alla segnalazione non elimina disuguaglianze nell'accesso o nella propensione a segnalare."
    ],
    unintendedEffects:
      "Un sistema molto accessibile può generare sovrasegnalazione, duplicati o concentrare risorse nei quartieri con maggiore propensione al reporting. Servono deduplica geografica, priorità basate su severità e una quota di monitoraggio proattivo dell'ente per non dipendere esclusivamente dalla voce dei cittadini più attivi.",
    primarySource: {
      label: "City of Calgary — 311 Calgary",
      url: "https://www.calgary.ca/311.html"
    },
    evaluationStudies: [
      {
        label: "University of Calgary — field experiment working paper",
        url: "https://lucasjacklucas.github.io/calgary311.pdf",
        citation: "Ahmad L, Eng J, Garofalo N, Jappert C, Nangal V, Nenshi Nathoo A, Salem A, Vukovic S, Wright S, Lucas J (2025), Do 311 Service Request Systems Increase Responsiveness? Results of a Field Experiment"
      }
    ],
    lastVerifiedAt: "2026-09-08",
    transferabilityItaly:
      "Alta per funzioni comunali non emergenziali: il meccanismo non richiede nuovi poteri sostanziali, ma standardizza accesso, routing e accountability. La trasferibilità dipende più dalla reingegnerizzazione del back office che dalla tecnologia dell'app.",
    lameziaAdaptation:
      "Unificare progressivamente segnalazioni oggi disperse tra telefono, email, social e uffici in un ticket civico con categoria, geolocalizzazione/foto opzionale, numero pratica, responsabile di coda e stato. Partire da 5–8 domini fisici ad alto volume (buche, illuminazione, rifiuti, verde, segnaletica, manutenzioni) e pubblicare tempi e backlog aggregati. Per valutare senza lasciare intenzionalmente problemi senza segnalazione, usare un rollout scaglionato tra categorie o confrontare il nuovo routing con il workflow precedente.",
    implementability: "medio_termine",
    capacityDataNeeds: ["tassonomia unica delle segnalazioni", "CRM/ticketing", "responsabili di coda per servizio", "SLA/priorità", "geolocalizzazione e deduplica", "dashboard backlog e tempi", "canali alternativi per digital divide"],
    tags: ["311", "segnalazioni", "service request", "CRM", "manutenzione", "RCT", "Calgary", "digital government"],
    revisionHistory: [{ date: "2026-09-08", note: "Prima verifica; controllati direttamente disegno randomizzato, N=250, follow-up 3–10 giorni, effect size 26–27 p.p. e assenza di eterogeneità rilevabile per Calgary Equity Index." }]
  },
  {
    id: "trentino-family-friendly-municipality-certification",
    title: "Family in Trentino: certificazione e piano annuale comunale per politiche family-friendly",
    authority: "Provincia autonoma di Trento / Comuni certificati Family in Trentino",
    territory: "Provincia autonoma di Trento",
    country: "Italia",
    implementationYear: "Marchio istituito nel 2006; percorso comunale dal 2007, adozione scaglionata negli anni successivi",
    problem:
      "Comuni montani e rurali esposti a spopolamento e necessità di rendere più coerente, visibile e continuativa l'offerta locale di servizi, tariffe, spazi e iniziative orientate al benessere delle famiglie.",
    measure:
      "Certificazione volontaria provinciale per i Comuni che adottano standard family-friendly. Il percorso richiede programmazione e verifica, un piano comunale annuale per le politiche familiari e interventi che possono includere servizi per prima infanzia e ragazzi, attività extrascolastiche, orari degli uffici più compatibili con la vita familiare, agevolazioni tariffarie, servizi e spazi pubblici family-friendly, comunicazione e iniziative di comunità.",
    mechanism:
      "Vincolare la certificazione a un piano annuale e a requisiti verificabili incentiva continuità amministrativa e coordinamento di un portafoglio di misure. Tariffe, servizi e qualità della vita possono aumentare l'attrattività residenziale del territorio e ridurre l'uscita di famiglie, anche se il pacchetto è troppo eterogeneo per attribuire l'effetto a una singola componente.",
    population:
      "Famiglie e residenti dei Comuni certificati. La valutazione SDiD utilizza un panel comunale e considera 76 municipalità trattate e 60 mai trattate nel donor pool.",
    primaryArea: "welfare_inclusione_servizi_sociali",
    secondaryAreas: ["istruzione_giovani", "capacita_amministrativa_personale"],
    interventionTypes: ["modifica_organizzativa_processo", "servizio_diretto", "incentivo_economico", "informazione_trasparenza"],
    tools: ["certificazione volontaria", "disciplinare provinciale", "Piano famiglia annuale", "agevolazioni tariffarie", "servizi per infanzia e giovani", "monitoraggio periodico"],
    territorialScale: "Comune / rete provinciale",
    interventionStatus:
      "Attivo. La Provincia autonoma di Trento mantiene il servizio di certificazione per i Comuni; la domanda è gratuita e può essere presentata in qualsiasi momento, sulla base del disciplinare vigente.",
    evaluationMethod:
      "Synthetic Difference-in-Differences con adozione scaglionata su dati amministrativi municipality-year. L'analisi apprende pesi specifici per coorti di adozione usando 60 Comuni mai trattati come donor pool e 76 Comuni certificati come trattati; include dimensione della popolazione e copertura dei nidi, bootstrap a blocchi di Comune con 1.999 repliche, jackknife, timing shifts ±3 anni e placebo-in-time.",
    comparator:
      "Controfattuale sintetico costruito, per ciascuna coorte di adozione, come combinazione pesata dei Comuni trentini mai certificati nel periodo di analisi.",
    outcomes: ["saldo migratorio netto per 1.000 residenti", "tasso di fertilità", "eterogeneità per intensità/contenuto del pacchetto di politiche"],
    results:
      "La stima centrale suggerisce un saldo migratorio più favorevole nei Comuni certificati rispetto al controfattuale sintetico, mentre non emerge alcun effetto rilevabile sulla fertilità. L'evidenza sulla migrazione è però solo marginalmente significativa e l'intervallo di confidenza al 95% include lo zero: il caso va quindi letto come segnale causale promettente, non come effetto consolidato.",
    effectSize:
      "Saldo migratorio netto: ATT +1,516 residenti per 1.000 (SE 0,817; p=0,064; IC95% −0,085 a 3,118). Fertilità: ATT +0,130 (SE 0,233; p=0,577), compatibile con nessun effetto. Le stime jackknife restano circa +1,58 per 1.000 (p=0,059); il placebo pre-trattamento è nullo.",
    evidenceStrength: "moderata",
    costsRequirements:
      "La certificazione provinciale è gratuita, ma l'implementazione sostanziale richiede capacità di programmazione annuale, monitoraggio, coordinamento tra servizi e risorse per le singole misure tariffarie, educative, ricreative o di spazio pubblico. Il costo varia quindi con il portafoglio comunale e non è stimato causalmente nello studio.",
    limitations: [
      "La valutazione disponibile è un preprint 2026 e non va trattata come evidenza peer-reviewed consolidata.",
      "L'effetto medio sulla migrazione è marginalmente significativo (p=0,064) e il relativo IC95% include zero; la formulazione pubblica deve mantenere esplicita questa incertezza.",
      "L'adozione della certificazione non è randomizzata: SDiD e placebo migliorano il controfattuale ma non eliminano ogni possibile selezione su fattori non osservati e variabili nel tempo.",
      "Family in Trentino è un bundle eterogeneo di politiche e governance; non è possibile attribuire il possibile effetto migratorio alla certificazione, alle tariffe, ai servizi o alla comunicazione presi singolarmente.",
      "Non emerge alcun effetto statisticamente rilevabile sulla fertilità e sarebbe scorretto presentare la certificazione come politica natalista efficace sulla base di questa valutazione.",
      "La valutazione riguarda i Comuni trentini certificati e non valuta la convenzione sottoscritta fra Provincia autonoma di Trento e Comune di Lamezia Terme nel marzo 2009; non è quindi possibile attribuire a quel precedente lametino gli effetti stimati in Trentino."
    ],
    unintendedEffects:
      "Un marchio può diventare adempimento formale se non collegato a outcome e verifica dei servizi. Inoltre, attrarre residenti da Comuni vicini può redistribuire popolazione senza generare un aumento demografico netto a scala più ampia; l'analisi comunale non misura questo eventuale effetto di spostamento territoriale.",
    primarySource: {
      label: "Provincia autonoma di Trento — certificazione Family in Trentino, categoria Comuni",
      url: "https://www.provincia.tn.it/Servizi/Richiesta-assegnazione-certificazione-Family-in-Trentino-Categoria-Comuni"
    },
    evaluationStudies: [
      {
        label: "Research Square / Fondazione Bruno Kessler",
        url: "https://doi.org/10.21203/rs.3.rs-8116068/v1",
        citation: "Gorodetskaya O, Marzani P, Podestà F (2026), Migration gains but not fertility change. An impact evaluation of a municipal family policy in Trentino via Synthetic Difference-in-Differences",
        doi: "10.21203/rs.3.rs-8116068/v1"
      },
      {
        label: "FBK institutional repository",
        url: "https://cris.fbk.eu/handle/11582/369907",
        citation: "Fondazione Bruno Kessler — institutional record for the impact evaluation"
      }
    ],
    lastVerifiedAt: "2026-09-08",
    transferabilityItaly:
      "Alta come modello di governance e programmazione comunale, ma solo moderata come evidenza di impatto demografico. Un Comune italiano può adottare un piano family-friendly, standard e monitoraggio senza replicare necessariamente il marchio trentino; l'effetto sulla migrazione deve essere trattato come ipotesi da verificare localmente.",
    lameziaAdaptation:
      "Non partire da zero: una pagina istituzionale di Trentino Famiglia conferma che nel marzo 2009 Provincia autonoma di Trento e Comune di Lamezia Terme sottoscrissero una convenzione per supportare l'avvio di un Piano Famiglia ispirato al modello trentino. La prima attività dovrebbe quindi essere una ricostruzione documentale di convenzione, atti attuativi, eventuale Piano Famiglia, standard o certificazioni effettivamente adottati, risultati e ragioni dell'eventuale interruzione; la ricerca pubblica svolta il 8 settembre 2026 non ha identificato una fonte affidabile che dimostri la continuità attuale di quel percorso. Solo dopo questo audit storico-operativo ha senso aggiornare o rilanciare un Piano famiglia Lamezia con inventario unico di nidi, mensa, attività estive, spazi gioco, tariffe e orari, 5–10 standard misurabili e dati su utilizzo, rinunce, liste d'attesa e copertura territoriale.",
    implementability: "medio_termine",
    capacityDataNeeds: ["convenzione 2009 e relativi atti/risultati", "inventario servizi e tariffe per famiglie", "dati di utilizzo e liste d'attesa", "Piano annuale con indicatori", "anagrafe aggregata per composizione familiare", "monitoraggio costi e copertura territoriale", "coordinamento scuole/ASP/terzo settore"],
    tags: ["famiglie", "spopolamento", "certificazione", "Trentino", "Synthetic DiD", "migrazione", "servizi locali", "Lamezia Terme", "convenzione 2009"],
    revisionHistory: [{ date: "2026-09-08", note: "Prima verifica; classificata evidenza moderata perché il risultato migratorio è marginalmente significativo e il paper è un preprint, con effetto nullo sulla fertilità mantenuto esplicitamente. Verificato inoltre il precedente locale: convenzione Trentino-Lamezia del marzo 2009 per l'avvio di un Piano Famiglia; non trovata evidenza pubblica affidabile della continuità attuale del percorso." }]
  }
] as const satisfies readonly EvidenceIntervention[];
