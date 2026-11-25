import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_11_25_PHILADELPHIA_DIGITAL_RENEWAL: readonly EvidenceIntervention[] = [
  {
    "id": "philadelphia-rental-license-online-renewal-letter-rct-2017",
    "title": "Philadelphia: comunicazioni mirate per il rinnovo digitale delle licenze",
    "authority": "City of Philadelphia — Department of Licenses and Inspections (L&I), con Syon P. Bhanot, GovPHL e Philadelphia Behavioral Science Initiative",
    "territory": "Philadelphia, Pennsylvania",
    "country": "Stati Uniti",
    "implementationYear": "2017 (lettere inviate a febbraio, outcome osservati a ottobre)",
    "problem": "Basso utilizzo di un servizio online già disponibile, inerzia e costi informativi o pratici del passaggio dal rinnovo per posta o allo sportello.",
    "measure": "Invio di tre versioni di una lettera ai titolari di licenze di locazione senza account digitale: promemoria standard, stessa lettera con benefici personali, stessa lettera con benefici per la città. Nessuna lettera sperimentale al controllo; nessuno sconto tariffario differenziale.",
    "mechanism": "Rendere il canale digitale e i passaggi necessari più salienti, riducendo costi informativi percepiti; il meccanismo non è isolato sperimentalmente dalla ricezione del promemoria.",
    "population": "11.579 titolari di 21.460 licenze da rinnovare nel 2017, con precedenti rinnovi solo per posta o in presenza e nessun account online. Quattro gruppi: 2.895 controllo, 2.904 standard, 2.893 benefici personali, 2.887 benefici cittadini.",
    "primaryArea": "digitalizzazione_servizi_online",
    "secondaryAreas": [
      "capacita_amministrativa_personale",
      "housing_politiche_abitative"
    ],
    "interventionTypes": [
      "nudging_comunicazione",
      "informazione_trasparenza",
      "modifica_organizzativa_processo"
    ],
    "tools": [
      "lettere cartacee",
      "portale di registrazione e rinnovo",
      "registri amministrativi",
      "randomizzazione stratificata per localizzazione postale"
    ],
    "territorialScale": "Comunale; titolari anche residenti fuori Philadelphia",
    "interventionStatus": "Trial completato nel 2017. Il rinnovo online e in presenza è documentato dalla pagina ufficiale attuale; l'opzione postale è stata successivamente eliminata. Non verificata la prosecuzione delle stesse lettere sperimentali.",
    "evaluationMethod": "RCT individuale a quattro bracci, stratificato per localizzazione postale, con outcome amministrativi rilevati dopo la scadenza (ottobre 2017). Modelli lineari di probabilità con controlli per residenza e pluralità di licenze. Tabella 2, N=11.579. Analisi per residenza e reddito da interpretare con le rispettive qualificazioni.",
    "comparator": "Titolari eleggibili assegnati al gruppo senza lettera sperimentale, con accesso ordinario al servizio.",
    "outcomes": [
      "registrazione dell'account online",
      "rinnovo online di almeno una licenza per titolare",
      "rinnovo online di tutte le licenze per titolare"
    ],
    "results": "Quote grezze: registrazione 18,5% controllo contro 36,3% nei tre bracci aggregati; almeno un rinnovo online 12,3% contro 20,4% (p<0,0001 per entrambi). Tabella 2, effetti aggiustati rispetto al controllo: registrazione +19,9/+17,7/+15,9 punti percentuali (standard/personale/città); almeno un rinnovo +8,56/+9,14/+6,79 pp; tutti i rinnovi +8,27/+9,02/+6,57 pp. Tutti p<0,001. Il confronto personale vs standard per almeno un rinnovo non è significativo (p=0,51 nella descrizione delle quote); la differenza personale vs città è significativa nel modello (p=0,0254). Nessun effetto dimostrato sul risparmio di tempo, sui costi netti o sul totale dei rinnovi indipendentemente dal canale.",
    "effectSize": "Differenze assolute grezze +17,8 pp per registrazione e +8,1 pp per almeno un rinnovo online. Le stime della Tabella 2 sono punti percentuali di probabilità per titolare, non percentuali di riduzione dei costi o numero di licenze aggiuntive. La maggioranza dei trattati non ha effettuato alcun rinnovo online.",
    "evidenceStrength": "forte",
    "costsRequirements": "Richiede un servizio digitale funzionante, dati di contatto aggiornati, comunicazioni accessibili, registri di utilizzo e supporto. Nessun costo unitario completo o risparmio netto misurato nel trial; non presumere che posta, PEC o app abbiano effetti identici.",
    "limitations": [
      "Un solo comune e un ciclo di rinnovo; titolari di immobili senza account preesistente, non popolazione generale.",
      "La lettera annuncia anche la futura eliminazione del rinnovo per posta: il confronto non isola tutti i singoli contenuti.",
      "Outcome di adozione del canale digitale, non qualità del servizio, rinnovi totali o benessere.",
      "Proxy territoriali e numero di licenze non sono misure del reddito individuale; non dimostrata riduzione del divario digitale.",
      "La residenza fuori città è associata a effetti più grandi nelle analisi per sottogruppi, ma non è una misura diretta di distanza o costi effettivi."
    ],
    "unintendedEffects": "Nessun effetto indesiderato quantificato in modo conclusivo. Possibile esclusione digitale se si eliminano canali assistiti; effetti redistributivi e costi amministrativi non misurati. Preservare le modalità di accesso e assistenza previste.",
    "primarySource": {
      "label": "City of Philadelphia — Get a Rental License (rinnovi annuali, notifiche e canali)",
      "url": "https://www.phila.gov/services/permits-violations-licenses/rent-or-sell-property/get-a-rental-license/"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Behavioral Public Administration — Bhanot (2021), articolo originale integrale",
        "url": "https://journal-bpa.org/index.php/jbpa/article/download/207/99/1679",
        "doi": "10.30636/jbpa.41.207",
        "citation": "Bhanot, S. P. (2021). Good for you or good for us? A field experiment on motivating citizen behavior change. Journal of Behavioral Public Administration, 4(1), 1–14. Tabelle 1–2."
      }
    ],
    "lastVerifiedAt": "2026-11-25",
    "transferabilityItaly": "Alta per comunicazioni aggiuntive e assistenza a servizi digitali esistenti; non trasferire il regime statunitense delle licenze di locazione. Verificare base giuridica del trattamento dei dati, accessibilità e canali obbligatori; non sottrarre notifiche o assistenza dovute.",
    "lameziaAdaptation": "La refezione scolastica di Lamezia ha già iscrizioni online e istruzioni (avviso 4 agosto 2026: https://comune.lamezia-terme.cz.it/it/news/115171/iscrizioni-refezione-scolastica-a-s-2026-2027 ; avviso 2025: https://www.comune.lamezia-terme.cz.it/it/news/refezione-scolastica-2025-2026). Selezionare un servizio con passaggi digitali e problemi di accesso documentati, distinguendo nuovi utenti da rinnovi automatici. Testare comunicazioni aggiuntive semplici con istruzioni, assistenza e scadenze rispetto alle comunicazioni ordinarie, senza togliere accesso a nessuno. Misurare completamento, errori, tempi, richieste di assistenza e accesso effettivo, non solo account creati.",
    "implementability": "quick_win",
    "capacityDataNeeds": [
      "inventario dei servizi e canali obbligatori",
      "log aggregati di avvio, completamento, errori e tempi",
      "recapiti e base giuridica, minimizzazione, accessibilità",
      "protocollo di sperimentazione e indicatori predefiniti",
      "risorse per assistenza e monitoraggio dei costi"
    ],
    "tags": [
      "Philadelphia",
      "digitalizzazione",
      "servizi online",
      "comunicazioni",
      "RCT",
      "oneri amministrativi",
      "licenze"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-25",
        "note": "Discovery ed espansione Parallel Search, verifica dell'articolo originale JBPA (testo e immagine della Tabella 2), fonte istituzionale Philadelphia e avvisi Lamezia. Deduplicazione diretta su 77 moduli importati e ricerche PR/codice per autore, DOI e intervento. Distinto dai casi Philadelphia di sicurezza, housing e altri servizi; nessun equivalente individuato. Evidenza forte limitatamente all'adozione del canale digitale nel trial."
      }
    ]
  }
];
