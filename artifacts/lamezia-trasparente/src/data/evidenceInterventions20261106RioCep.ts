import type { EvidenceIntervention } from "./evidenceInterventions";

/** Verified 2026-11-06: synthetic-DiD observational study of a municipal urban-safety package; component effects are not identified. */
export const EVIDENCE_INTERVENTIONS_2026_11_06_RIO_CEP: readonly EvidenceIntervention[] = [
{
  "id": "rio-de-janeiro-meier-cep-municipal-urban-safety-sdid-2021",
  "title": "Rio de Janeiro: programma CEP di prevenzione territoriale, riqualificazione e coordinamento della Guardia municipale",
  "authority": "Prefeitura da Cidade do Rio de Janeiro — Secretaria Municipal de Ordem Pública (SEOP), Guarda Municipal, uffici municipali; collaborazione scientifica Fundação Getulio Vargas (FGV CCAS)",
  "territory": "Jardim do Méier e dintorni, quartiere Méier, zona nord di Rio de Janeiro (progetto pilota di circa 0,16 km²)",
  "country": "Brasile",
  "implementationYear": "2021 (avvio operativo tra ottobre e novembre 2021; analisi dati di reato 2017–2023)",
  "problem": "Concentrazione spaziale di furti e rapine a danno dei passanti in microaree commerciali e di transito; frammentazione tra manutenzione dello spazio, vigilanza urbana, illuminazione e risposta alle criticità segnalate.",
  "measure": "Il programma Conjunto de Estratégias de Prevenção (CEP) è stato attuato dalla Prefeitura nel Méier combinando analisi territoriale di reati denunciati, presenza preventiva focalizzata della Guarda Municipal, ripristino dell'illuminazione e delle piazze, telecamere, gestione dell'uso del suolo pubblico, pulizia e attività culturali. La valutazione studia l'intero pacchetto, non le singole componenti.",
  "mechanism": "Diagnosi dei punti con concentrazione di eventi, prevenzione situazionale mediante spazi più illuminati e frequentati, presidio municipale e pronta attivazione delle strutture competenti; coordinamento regolare per ridurre le opportunità di reato e le lacune operative nella manutenzione.",
  "population": "Utenti e residenti di una microarea commerciale e di collegamento al trasporto pubblico nel quartiere Méier; la politica pilota copre circa 0,16 km², non l'intera città.",
  "primaryArea": "sicurezza_urbana_prevenzione",
  "secondaryAreas": [
    "urbanistica_rigenerazione",
    "mobilita_spazio_pubblico",
    "capacita_amministrativa_personale",
    "trasparenza_integrita_anticorruzione"
  ],
  "interventionTypes": [
    "targeting_data_analytics",
    "enforcement_controllo",
    "infrastruttura_fisica",
    "modifica_organizzativa_processo",
    "servizio_diretto",
    "formazione_capacity_building"
  ],
  "tools": [
    "analisi georeferenziata e diagnosi dei punti di maggiore concentrazione di reati",
    "93 agenti della Guarda Municipal impiegati nel progetto originario e formati per l'attività preventiva",
    "35 telecamere installate in punti strategici (secondo lo studio)",
    "149 punti/pali di illuminazione riparati o installati (secondo lo studio)",
    "interventi di cura delle piazze, regolazione delle attività commerciali su strada, eventi negli spazi pubblici",
    "riunioni operative settimanali e riunioni di coordinamento mensili",
    "registri ufficiali dei reati ottenuti tramite accesso civico brasiliano per 2017–2023"
  ],
  "territorialScale": "Microarea urbana di circa 0,16 km², all'interno del quartiere Méier; unità di valutazione del risultato: quartiere, non singolo punto luce o singola strada.",
  "interventionStatus": "Pilota comunale avviato a fine 2021 e studiato nel periodo successivo; la permanenza delle singole componenti nel 2026 non è stata verificata, né è attestata una replicazione del medesimo effetto altrove.",
  "evaluationMethod": "Quasi-esperimento con synthetic difference-in-differences (SDID), costruzione di un quartiere controfattuale ponderato per andamento pre-intervento, su dati ufficiali di furti e rapine 2017–2023; controlli di robustezza con synthetic control classico. Un solo quartiere trattato, non RCT, nessuna allocazione randomizzata.",
  "comparator": "Sintesi ponderata di quartieri di Rio de Janeiro non esposti direttamente alla misura e periodi pre-intervento del Méier; diversa dalla comparazione descrittiva con l'intera città pubblicata dalla Prefeitura nel marzo 2022.",
  "outcomes": [
    "numero di reati di strada registrati (furti e rapine)",
    "furti registrati",
    "rapine registrate",
    "problematiche urbane identificate e interventi comunali evasi (dato amministrativo descrittivo, non outcome causale)"
  ],
  "results": "La valutazione peer-reviewed rileva che i reati di strada registrati nel quartiere trattato sono diminuiti di circa il 32% rispetto al controfattuale sintetico nel periodo successivo, soprattutto grazie alla diminuzione dei furti; la riduzione delle rapine è più incerta. La sintesi scientifica FGV stima i furti in calo di quasi il 60%. La Prefeitura ha pubblicato anche un -40% descrittivo tra novembre 2021-gennaio 2022 e lo stesso trimestre 2019-2020, contro -26,1% nell'intera città: questa variazione NON è la stima causale dello studio. Non esiste una dimostrazione di quale componente del pacchetto sia decisiva.",
  "effectSize": "SDID peer-reviewed Guerra, Monteiro e Pecanha (2025): reati di strada registrati circa −32% rispetto al quartiere controfattuale sintetico; furti circa −60% secondo sintesi FGV dell'articolo; rapine: risultato meno preciso. Comune (25/03/2022): −40% variazione descrittiva locale (novembre 2021–gennaio 2022 vs novembre 2019–gennaio 2020), contro −26,1% cittadino: NON una seconda stima causalmente identificata e NON punti percentuali.",
  "evidenceStrength": "moderata",
  "costsRequirements": "Il pilota brasiliano ha mobilitato 93 agenti municipali, interventi su 149 punti/pali luce, 35 telecamere, manutenzione e coordinamento tra uffici; costo complessivo, costo per reato evitato e sostenibilità finanziaria NON verificati. Per una replica servono poteri amministrativi appropriati, cooperazione con le competenti autorità di pubblica sicurezza, analisi aggregata non stigmatizzante, budget manutentivo e sistema di monitoraggio.",
  "limitations": [
    "Un solo territorio trattato e selezione non casuale: il metodo SDID riduce ma non annulla confondimento da trend locali, specificità del quartiere, condizioni economiche e shock contemporanei.",
    "L'esito è misurato sui reati registrati da polizia; non esclude variazioni delle denunce o differenze di rilevazione. Non sono verificati effetti sulle vittimizzazioni non denunciate.",
    "Il trattamento combina presenza degli agenti, telecamere, illuminazione, ordine urbano ed eventi; impossibile identificare la quota causale di ogni singola componente.",
    "Lo studio scientifico utilizza reati aggregati a livello di quartiere, mentre l'intervento occupa 0,16 km²; la scala del trattamento non coincide esattamente con l'unità di outcome.",
    "La stima −32% SDID non va confusa con −40% prima-dopo della comunicazione comunale. La riduzione delle rapine non è altrettanto robusta rispetto a quella dei furti.",
    "Il testo completo con tabelle, intervalli di confidenza puntuali, costi e analisi complete di displacement non è liberamente accessibile dalla pagina editore verificata; l'abstract e le sezioni originali consentono di verificare la stima aggregata ma non ogni statistica.",
    "Non risultano evidenze indipendenti di persistenza a lungo termine o di efficacia in altri quartieri o comuni; un effetto locale non implica un miglioramento netto cittadino.",
    "L'implementazione italiana deve distinguere attività di Polizia Locale, competenze statali di pubblica sicurezza, norme sulla videosorveglianza e tutela dei diritti; non è lecito importare integralmente le funzioni della Guarda brasiliana."
  ],
  "unintendedEffects": "Da monitorare: possibile spostamento dei reati nelle aree limitrofe; controllo sproporzionato su gruppi vulnerabili o attività legittime; indebita identificazione di singoli esercizi come fonte di pericolo; costi di gestione e manutenzione, privacy della videosorveglianza, impatti su accessibilità e uso inclusivo dello spazio. Lo studio accessibile non consente di quantificare tali effetti.",
  "primarySource": {
    "label": "Prefeitura do Rio de Janeiro — SEOP, comunicazione ufficiale di attuazione e primi esiti descrittivi (25 marzo 2022)",
    "url": "https://prefeitura.rio/ordem-publica/regiao-do-meier-com-implantacao-de-programa-de-seguranca-tem-reducao-de-40-de-crimes-de-rua/"
  },
  "evaluationStudies": [
    {
      "label": "Economics Letters — studio originale peer-reviewed, abstract e sezioni dell'autore (2025)",
      "url": "https://www.sciencedirect.com/science/article/abs/pii/S016517652500285X",
      "citation": "Guerra, J., Monteiro, J. & Pecanha, V. (2025). Crime prevention through urban requalification and municipal police presence. Economics Letters, 254, 112448.",
      "doi": "10.1016/j.econlet.2025.112448"
    },
    {
      "label": "FGV EAESP — approfondimento dei ricercatori sull'effetto differenziale sui furti",
      "url": "https://www.impacto.blog.br/administracao-publica/como-a-requalificacao-urbana-e-a-presenca-da-guarda-municipal-reduziram-crimes-de-rua-em-bairro-do-rio",
      "citation": "FGV EAESP Pesquisa (20 agosto 2025). Como a requalificação urbana e a presença da guarda municipal reduziram crimes de rua em bairro do Rio."
    }
  ],
  "lastVerifiedAt": "2026-11-06",
  "transferabilityItaly": "Trasferibile soprattutto il modello di coordinamento territoriale e di manutenzione preventiva di spazi pubblici, con priorità fondate su dati aggregati e criticità di servizio, non il modello di comando e dotazione della Guarda brasiliana. In Italia la prevenzione amministrativa locale opera entro competenze di Polizia Locale e degli uffici; i reati e le attività investigative richiedono il coordinamento istituzionale con Questura/Prefettura e le forze competenti. L'effetto osservato a Rio non è una previsione per un Comune italiano.",
  "lameziaAdaptation": "Proporre, in accordo con Polizia Locale, servizi tecnici comunali e autorità statali competenti, una microarea pilota di spazio pubblico selezionata mediante dati territoriali aggregati e criticità verificabili di manutenzione (illuminazione, arredo, percorsi pedonali, pulizia, tempi di risposta). Mappare gli interventi e i costi, utilizzare solo aree e strumenti nella legittima disponibilità del Comune, coinvolgere residenti e commercianti senza stigmatizzarli, pubblicare tempi e chiusure dei problemi; definire aree comparabili e indicatori aggregati di reati e sicurezza prima/dopo, oltre a possibili spostamenti nei dintorni. Videosorveglianza soltanto con necessità, proporzionalità, base giuridica, DPIA e garanzie privacy; eventuali attività di prevenzione dei reati da concertare con chi è competente.",
  "implementability": "medio_termine",
  "capacityDataNeeds": [
    "registro georeferenziato dei guasti, illuminazione e manutenzioni su area pubblica",
    "coordinamento formale dei servizi tecnici con Polizia Locale e, per i dati di reato, con le competenti autorità statali",
    "serie temporali affidabili, aggregati e minimizzati di eventi, con definizioni stabili e comparatore territoriale",
    "dati di budget, turni disponibili, tempi di presa in carico e risultati degli interventi",
    "progettazione inclusiva e partecipazione di residenti e attività economiche",
    "verifica giuridica di qualsiasi dispositivo di controllo, trattamento dei dati personali e analisi dell'impatto privacy ove richiesta",
    "monitoraggio dell'eventuale spostamento dei problemi verso strade limitrofe"
  ],
  "tags": [
    "Rio de Janeiro",
    "Méier",
    "Brasile",
    "CEP",
    "sicurezza urbana",
    "prevenzione situazionale",
    "hotspot",
    "synthetic difference-in-differences",
    "riqualificazione urbana",
    "illuminazione pubblica",
    "coordinamento intersettoriale",
    "polizia locale",
    "reati di strada",
    "costi non verificati"
  ],
  "revisionHistory": [
    {
      "date": "2026-11-06",
      "note": "Primo censimento: verificati direttamente articolo originale Economics Letters 2025 (DOI e abstract/sezioni), fonte primaria SEOP 2022 e sintesi FGV 2025; distinta stima SDID −32% da dato comunale descrittivo −40%; classificata evidenza moderata per singola unità trattata, incompleta accessibilità delle tabelle e trattamento composito. Verifica deduplicazione dei moduli e PR pertinenti dell'archivio GitHub."
    }
  ]
}
];
