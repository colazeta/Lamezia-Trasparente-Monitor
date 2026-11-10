import type { EvidenceIntervention } from "./evidenceInterventions";

/** Experimental property-tax communication, verified on original source 2026-11-10. */
export const EVIDENCE_INTERVENTIONS_2026_11_10_FREETOWN: readonly EvidenceIntervention[] = [
  {
    "id": "freetown-sierra-leone-geolocated-public-service-tax-messaging-rct-2022",
    "title": "Freetown: comunicazioni verificabili sui servizi pubblici locali per migliorare i pagamenti della tassa immobiliare",
    "authority": "Freetown City Council (FCC); sperimentazione realizzata con Laura Montenbruck e partner accademici/International Growth Centre",
    "territory": "Freetown, Western Area",
    "country": "Sierra Leone",
    "implementationYear": "2022 (telefonate e SMS nella stagione tributaria; outcome alla scadenza di settembre 2022)",
    "problem": "Bassa quota di pagamento della property tax (circa il 22% delle proprietà registrate nel 2021) nonostante una riforma di censimento e valutazione degli immobili; distanza percepita tra tributi richiesti e servizi effettivamente erogati.",
    "measure": "Esperimento su 5.494 residenti di proprietà registrate: ai gruppi trattati telefonata individuale e SMS riepilogativo con informazioni reali e geolocalizzate su opere e servizi municipali già realizzati. Messaggio su un servizio preferito oppure meno preferito; gruppo di controllo senza messaggio aggiuntivo.",
    "mechanism": "Rendere saliente e controllabile l'offerta di servizi finanziati pubblicamente, con indicazione del servizio, sua ubicazione e tempo indicativo di accesso, rafforzando il legame percepito tra imposte e azione municipale; non è una variazione di aliquota o una promessa di servizio condizionata al versamento.",
    "population": "5.494 proprietari e inquilini residenti di immobili iscritti al registro fiscale con numero di telefono, selezionati entro 46.844 proprietà eleggibili (soprattutto un solo proprietario); 3.660 soggetti nei due gruppi trattati.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "trasparenza_integrita_anticorruzione",
      "digitalizzazione_servizi_online",
      "capacita_amministrativa_personale",
      "partecipazione_democrazia_locale"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "targeting_data_analytics",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "censimento di 277 servizi pubblici già erogati e loro georeferenziazione",
      "abbinamento di informazioni sui servizi e indirizzo immobiliare",
      "intervista iniziale sulle preferenze di servizio",
      "telefonata informativa dell'operatore e SMS successivo",
      "registro comunale delle somme effettivamente versate",
      "randomizzazione individuale in tre bracci e pre-registrazione AEA RCT Registry AEARCTR-0009207"
    ],
    "territorialScale": "Città; randomizzazione a livello di residente/proprietà e analisi degli outcome fiscali individuali.",
    "interventionStatus": "Intervento sperimentale concluso nel 2022; nessuna evidenza verificata di adozione permanente nel 2026 o di replica della stessa dimensione d'effetto.",
    "evaluationMethod": "Randomized controlled trial (RCT) pre-registrato: 5.494 destinatari divisi casualmente fra controllo, servizio preferito (match) e servizio meno preferito (mismatch); analisi con fixed effects per ward/strata e outcome osservati nei pagamenti amministrativi alla scadenza di settembre 2022. Working paper 2023 con ripubblicazione nella serie CRC TR 224 nel 2025; pubblicazione peer-reviewed non verificata.",
    "comparator": "Terzo del campione senza contatto aggiuntivo; media dei pagamenti nel controllo 118,829 SLE per proprietà alla scadenza (20,1% con almeno un versamento). Confronto tra due bracci informativi e controllo; NON confronto con una comunicazione telefonica neutra.",
    "outcomes": [
      "importo medio della property tax pagata entro la scadenza",
      "quota con almeno un pagamento",
      "importo condizionato a un pagamento",
      "soddisfazione verso i servizi / fiducia nell'amministrazione su sottocampione d'indagine"
    ],
    "results": "Il trattamento informativo accresce significativamente l'IMPORTO MEDIO versato entro la scadenza: +23,784 SLE rispetto ai 118,829 SLE del controllo, circa +20% relativo. L'effetto sulla quota che effettua almeno un pagamento è +1,2 punti percentuali, ma NON statisticamente significativo nel campione completo; nemmeno l'effetto sull'importo pagato condizionatamente al versamento lo è singolarmente. Effetti eterogenei esplorativi: persone in immobili di minor valore reagiscono soprattutto ai servizi preferiti e accessibili. Nessuna dimostrazione di incremento del 20% della probabilità individuale di pagare o di durata pluriennale dell'effetto.",
    "effectSize": "RCT, tabella 3 del paper: totale pagamenti +23,784 SLE per proprietà trattata (SE 11,322; p<0,05), media controllo 118,829 SLE: +20,0% relativo sul PAGATO, non +20 punti nella quota adempiente. Pagamento almeno una volta +0,012 (SE 0,008; non significativo), controllo 0,201. Stima dei ricavi aggiuntivi per 3.660 trattati ~87.000 SLE e rapporto ricavi aggiuntivi/costo ~1,7 stimato dagli autori, non audit contabile comunale.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costo sperimentale stimato dagli autori 14,2 SLE per soggetto informato, inclusa mappatura dei servizi, operatori, chiamate e SMS; ricavo aggiuntivo medio stimato pari a circa 1,7 volte il costo. Per replicare: censimento pubblico verificabile delle opere, basi tributarie affidabili, numeri di contatto trattati lecitamente, personale e valutazione.",
    "limitations": [
      "Versione verificata disponibile come working paper 2023/CRC TR 224 2025, non come articolo peer-reviewed accertato; nuove stime di lungo periodo non verificate.",
      "La popolazione eleggibile comprende immobili con un recapito e proprietario singolo riconoscibile: non rappresenta automaticamente tutti i contribuenti.",
      "Il controllo non ha ricevuto una telefonata neutra: parte del beneficio potrebbe riflettere la maggiore attenzione o un promemoria, non esclusivamente il contenuto sui servizi.",
      "La probabilità di effettuare almeno un pagamento aumenta di 1,2 punti ma non in modo statisticamente significativo; evitare di confondere pagamenti monetari e compliance binaria.",
      "Esiti di fiducia/opinione misurati in un sottocampione con attrition selettiva; non sono il risultato causale principale più robusto.",
      "Costi e beneficio/costo sono stime contestuali, non risparmi certificati o proiezioni utilizzabili per i tributi italiani.",
      "Differenze legali, base fiscale, struttura amministrativa e livello iniziale di compliance tra Freetown e Italia limitano l'estrapolazione."
    ],
    "unintendedEffects": "Non risultano effetti negativi causali quantificati sulla riscossione nello studio; in un adattamento occorre monitorare messaggi percepiti come pressione, esclusione degli utenti senza telefono, errata attribuzione di opere ai tributi e trattamenti impropri di dati tributari/geolocalizzati.",
    "primarySource": {
      "label": "International Growth Centre — progetto attuato a Freetown con esperimento di fiscal exchange",
      "url": "https://www.theigc.org/collections/public-good-provision-and-taxation-evidence-field-experiment-freetown-sierra-leone"
    },
    "evaluationStudies": [
      {
        "label": "Montenbruck, studio integrale CRC TR 224, Discussion Paper 620 (gennaio 2025)",
        "url": "https://www.crctr224.de/research/discussion-papers/archive/dp620/@@download/file/CRCTR224_2025_620.pdf",
        "citation": "Montenbruck, L. (2025), Fiscal Exchange and Tax Compliance: Strengthening the Social Contract Under Low State Capacity, CRC TR 224 Discussion Paper 620."
      },
      {
        "label": "AEA RCT Registry — registrazione preventiva della ricerca",
        "url": "https://www.socialscienceregistry.org/trials/9207",
        "citation": "Montenbruck, L. (2022), Public Goods, Taxation, and Political Participation: Evidence from a Field Experiment in Freetown, Sierra Leone, AEARCTR-0009207.",
        "doi": "10.1257/rct.9207-1.0"
      },
      {
        "label": "ICTD — spiegazione dell'autrice su progetto e risultati",
        "url": "https://ictd.ac/general/does-information-about-public-services-boost-tax-compliance-i-conducted-an-experiment-in-freetown-to-find-out/",
        "citation": "Montenbruck, L. (2024), Does Information about Public Services Boost Tax Compliance? ICTD."
      }
    ],
    "lastVerifiedAt": "2026-11-10",
    "transferabilityItaly": "Trasferibile la trasparenza concreta, puntuale e verificabile dei servizi comunali collegata alla comunicazione tributaria, non il sistema fiscale della Sierra Leone. In Italia ogni messaggio deve rispettare veridicità del nesso finanziario, competenze tributarie, normativa privacy, accessibilità e parità di trattamento.",
    "lameziaAdaptation": "Per la TARI 2026 Lamezia usa PagoPA, App IO, e-mail/PEC e posta: valutare, senza modificare gli obblighi di pagamento, un allegato pubblico con 3–5 risultati verificati del servizio rifiuti (luogo, periodo, fonte e indicatori), facilmente accessibile via codice QR/link e canale cartaceo; laddove giuridicamente e tecnicamente consentito, assegnare casualmente per gruppi un'informazione aggiuntiva specifica e un testo neutro a parità di contatto, confrontando pagamenti e accessibilità. Non usare dati individuali per affermare risultati politici o attribuire ad una specifica TARI opere non finanziate da quella entrata.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "inventario di servizi/opere con atti, stato e data di conclusione verificabili",
      "dataset tributi anonimizzato o pseudonimizzato e denominatore di avvisi validi",
      "coordinamento Ufficio Tributi–gestore rifiuti–URP e responsabile protezione dati",
      "protocollo sperimentale legale, campionamento e gruppo di controllo con parità di comunicazioni obbligatorie",
      "indicatori di pagamento e soddisfazione su canali digitali e non digitali"
    ],
    "tags": [
      "Freetown",
      "Sierra Leone",
      "TARI",
      "property tax",
      "fiscal exchange",
      "messaggi sui servizi",
      "riscossione",
      "RCT",
      "randomizzazione",
      "pagamenti verificati",
      "trasparenza tributaria",
      "working paper",
      "privacy"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-10",
        "note": "Nuovo censimento dopo Parallel Search e verifica dell'originale CRC TR 224 (2025), tavola 3, progetto IGC e AEA RCT Registry; deduplicazione su 56 moduli archivio main e PR; distinto aumento relativo delle somme pagate (+20%) dall'effetto non significativo sulla probabilità di pagamento; peer review non accertata."
      }
    ]
  }
];
