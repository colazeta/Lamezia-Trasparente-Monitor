import type { EvidenceIntervention } from "./evidenceInterventions";

/** 2026-11-05: official HNP project and original peer-reviewed AJPH abstract verified. */
export const EVIDENCE_INTERVENTIONS_2026_11_05_NEW_ORLEANS_HNP: readonly EvidenceIntervention[] = [
    {
      "id": "new-orleans-healthy-neighborhoods-vacant-property-family-violence-cluster-rct",
      "title": "New Orleans: riqualificazione e manutenzione di lotti ed edifici abbandonati per prevenire la violenza familiare",
      "authority": "City of New Orleans (partner locale), Tulane University Violence Prevention Institute, Columbia University e organizzazioni territoriali nel progetto Healthy Neighborhoods Project (HNP)",
      "territory": "New Orleans, Louisiana (23 quartieri inclusi nel trial)",
      "country": "Stati Uniti",
      "implementationYear": "2020–2022 (interventi e manutenzione, secondo il metodo dello studio HNP 2025); 2017–2022 finestra analitica del successivo studio AJPH 2026; progetto HNP descritto da Tulane come attivo 2018–2024",
      "problem": "Lotti e immobili vacanti degradati, scarsa manutenzione, rischio di reati segnalati e condizioni di quartiere correlate a vulnerabilità, insicurezza e violenza familiare.",
      "measure": "Pulizia e rinverdimento dei lotti vacanti e, in un braccio, pulizia/verniciatura/riparazioni di strutture abbandonate, con manutenzione regolare. Dalle metodologie dello studio HNP open access (2025): 296 proprietà inizialmente trattate (243 lotti e 53 strutture), ma soltanto 135 mantenute per l'intera durata 2020–2022.",
      "mechanism": "Rimuovere segnali fisici e opportunità di degrado, rendere più utilizzabili e curati spazi comuni e fronti edilizi, sostenere uso legittimo dello spazio e legami di vicinato. Il trial stima gli effetti del pacchetto, NON identifica singolarmente quale meccanismo sociale o materiale abbia determinato il risultato.",
      "population": "Residenti di 23 quartieri selezionati per tassi elevati di violenza; trial basato su 194 cluster geografici randomizzati (101 trattamento, 93 controllo nello studio HNP 2025). La valutazione 2026 stima gli incidenti associati alle proprietà/cluster; il numero di residenti rappresentati dagli outcome amministrativi non è verificato dall'abstract.",
      "primaryArea": "urbanistica_rigenerazione",
      "secondaryAreas": [
        "sicurezza_urbana_prevenzione",
        "salute_pubblica_locale",
        "rifiuti_pulizia_urbana",
        "welfare_inclusione_servizi_sociali"
      ],
      "interventionTypes": [
        "infrastruttura_fisica",
        "servizio_diretto",
        "partnership_pubblico_privato_terzo_settore",
        "partecipazione_codesign",
        "modifica_organizzativa_processo"
      ],
      "tools": [
        "mappatura e selezione lotti/edifici vacanti",
        "randomizzazione per cluster territoriali",
        "pulizia e rinverdimento dei lotti",
        "interventi leggeri su edifici abbandonati",
        "manutenzione continuativa",
        "rilevazione di eventi di violenza familiare e maltrattamento",
        "coinvolgimento dei residenti"
      ],
      "territorialScale": "Quartieri e cluster di proprietà vacanti, con 23 quartieri oggetto del trial; intervento place-based di prossimità.",
      "interventionStatus": "Healthy Neighborhoods Project completato secondo la scheda di Tulane (2018–2024); valutazione degli outcome di violenza familiare pubblicata il 20 agosto 2026. Non si afferma che il programma sia ancora attivo nel 2026.",
      "evaluationMethod": "Cluster randomized controlled trial: 194 cluster geografici formati all'interno di 23 quartieri selezionati a New Orleans; 101 cluster trattati e 93 controlli per l'analisi di coorte HNP (studio metodo 2025), randomizzati a blocchi fra soli lotti e lotti+strutture. La valutazione AJPH 2026 analizza outcome registrati dal 2017 al 2022. L'abstract AJPH non espone il modello econometrico completo o il controllo dei test multipli: verificare il full text per un audit statistico esaustivo.",
      "comparator": "Cluster territoriali di controllo assegnati casualmente all'assenza del trattamento nel periodo di osservazione; i 129 lotti nei cluster di controllo furono trattati dal 2023 secondo la pubblicazione HNP del 2025. I quartieri erano selezionati per rischio elevato e NON randomizzati come 23 unità.",
      "outcomes": [
        "reati domestici registrati nelle aree dei cluster (domestic crimes)",
        "eventi registrati di maltrattamento minorile (child maltreatment)",
        "coesione e percezione di sicurezza come outcome secondari esplorati in altre pubblicazioni HNP"
      ],
      "results": "Nello studio Theall et al. (2026), il braccio lotti+strutture presenta una riduzione stimata del 40% dei reati domestici e del 16% degli eventi di maltrattamento minorile; il braccio dei soli lotti presenta riduzioni rispettivamente dell'11% e del 17%. Queste sono stime relative degli eventi osservati attorno alle proprietà nel trial, NON riduzioni dell'intera violenza domestica cittadina. Il meccanismo specifico e la persistenza oltre il periodo valutato non sono isolati.",
      "effectSize": "Lotti+strutture: domestic crimes −40% (IC95% della variazione: −63,85% a −16,54%; p=0,001), child maltreatment −16% (IC95% −28,21% a −2,66%; p=0,02). Soli lotti: domestic crimes −11% (IC95% −16,76% a −4,92%; p=0,01), child maltreatment −17% (IC95% −33,10% a −2,16%; p=0,03). Percentuali relative, NON punti percentuali.",
      "evidenceStrength": "forte",
      "costsRequirements": "Tulane segnala che il progetto non comportava costi per residenti o Comune perché sostenuto da finanziamenti esterni (NIH/RWJF); ciò NON significa costo economico zero. Mancano costi unitari completi verificati per il campione di analisi AJPH 2026. Servono: censimento, titolarità/accesso legittimo, verifica ambientale, operatori qualificati, budget per manutenzione ricorrente e controllo della manutenzione effettivamente effettuata (solo 135/296 proprietà risultano mantenute continuativamente nel metodo HNP 2025).",
      "limitations": [
        "Solo 23 quartieri randomizzati: dimensione del campione a livello di cluster limitata e risultati specifici a New Orleans.",
        "La fonte scientifica originale verificata in questa ricognizione è abstract peer-reviewed via PubMed, non il full text dell'articolo AJPH (accesso limitato); non sono state verificate le specifiche statistiche dettagliate, l'eventuale molteplicità dei test o i costi analitici.",
        "Le misure riguardano eventi registrati (domestic crimes e child maltreatment), non tutti gli episodi di violenza reale né la causalità dei singoli casi.",
        "I valori di 296 immobili (243 lotti, 53 strutture) riguardano l'insieme trattato nello studio 2026; la scheda divulgativa di Tulane riporta conteggi più ampi per l'intero HNP e non va confusa con il campione analitico.",
        "Intervento multicomponente: effetti della pulizia, riqualificazione delle strutture, manutenzione e interazione sociale non sono separabili con i soli dati dell'abstract.",
        "La trasferibilità dei risultati su criminalità familiare da New Orleans all'Italia è incerta per differenze nei contesti urbani, sistemi di segnalazione e livelli di violenza.",
        "Le condizioni di salute di base, i bisogni delle famiglie e le caratteristiche del quartiere possono moderare gli effetti; possibili variazioni tra aree socioeconomiche.",
        "Studio HNP open access 2025: dei 296 immobili trattati inizialmente, soltanto 135 risultano mantenuti ininterrottamente per l'intera finestra 2020–2022, introducendo eterogeneità dell'intensità del trattamento.",
        "I 23 quartieri furono selezionati per livelli elevati di violenza, mentre la randomizzazione fu condotta su 194 cluster più piccoli (101 trattamento e 93 controllo nell'analisi HNP 2025). Il numero di quartieri NON è il numero di unità randomizzate."
      ],
      "unintendedEffects": "Lo studio consultato non quantifica effetti negativi causali. Da monitorare possibili pressioni immobiliari e displacement, conflitti proprietari, effetti su occupanti o persone in precarietà abitativa, interventi in aree con contaminazioni e rischi di stigmatizzazione dei quartieri. Nessun beneficio in termini di sicurezza va presunto a Lamezia prima di una valutazione.",
      "primarySource": {
        "label": "Tulane University — Healthy Neighborhoods Project (descrizione e partner locali)",
        "url": "https://violenceprevention.tulane.edu/research/research-projects/healthy-neighborhoods-project/"
      },
      "evaluationStudies": [
        {
          "label": "American Journal of Public Health / PubMed — trial sulla violenza familiare (abstract originale)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/42623581/",
          "citation": "Theall, K. P., Fleckman, J. M., Wallace, M., et al. (2026). Impact on Family Violence of a Cluster Randomized Trial Remediating Vacant and Abandoned Property: New Orleans, LA, 2017–2022. American Journal of Public Health, online 20 agosto 2026.",
          "doi": "10.2105/AJPH.2026.308626"
        },
        {
          "label": "Journal of Urban Health — pubblicazione HNP sui health mindsets",
          "url": "https://link.springer.com/article/10.1007/s11524-025-00961-4",
          "citation": "Theall et al. (2025). Building a Culture of Health Through the Built Environment: Impact of a Cluster Randomized Trial Remediating Vacant and Abandoned Property on Health Mindsets.",
          "doi": "10.1007/s11524-025-00961-4"
        }
      ],
      "lastVerifiedAt": "2026-11-05",
      "transferabilityItaly": "Buona per processi di mappatura, priorità manutentive e interventi leggeri su immobili/terreni pubblici o legittimamente accessibili; meno trasferibile la dimensione dell'effetto sulla violenza familiare. Per proprietà private il Comune deve rispettare normativa italiana, procedimento e poteri effettivi: nessun accesso o modifica senza titolo.",
      "lameziaAdaptation": "Partire dall'Ordinanza comunale n. 36 del 7 luglio 2026 sulle aree private: costruire un registro territoriale di situazioni segnalate e verificabili; distinguere proprietà comunali e private e graduare priorità per salute, fruibilità, prossimità a scuole e servizi, non per etichette sociali. Sperimentare su un gruppo di micro-aree pubbliche comparabili pulizia, piccolo verde e manutenzione programmata, coinvolgendo residenti e Lamezia Multiservizi secondo competenze e appalti. Confrontare tempestività delle manutenzioni, nuove segnalazioni, uso degli spazi e sicurezza percepita, senza promettere riduzioni di violenza domestica; per eventuali dati su violenza usare soltanto aggregazioni legalmente accessibili e cooperazione con autorità competenti.",
      "implementability": "medio_termine",
      "capacityDataNeeds": [
        "mappa georeferenziata delle aree e informazioni sulla proprietà",
        "verifica dei titoli di accesso e dell'Ordinanza n. 36/2026",
        "screening di sicurezza ambientale e presenza di persone vulnerabili",
        "cronologia segnalazioni, ordinanze, lavori e manutenzioni",
        "budget per manutenzione ricorrente e partner operativi",
        "protocollo di valutazione con aree comparabili e misure non stigmatizzanti",
        "garanzie GDPR e competenze delle autorità per eventuali indicatori di violenza"
      ],
      "tags": [
        "New Orleans",
        "Healthy Neighborhoods Project",
        "USA",
        "cluster RCT",
        "rigenerazione urbana",
        "lotti vacanti",
        "edifici abbandonati",
        "verde urbano",
        "manutenzione",
        "sicurezza urbana",
        "violenza familiare",
        "maltrattamento minori",
        "place-based",
        "valutazione causale"
      ],
      "revisionHistory": [
        {
          "date": "2026-11-05",
          "note": "Prima acquisizione verificata su abstract peer-reviewed AJPH 2026/PubMed e scheda originale Tulane HNP, con confronto a fonti municipali New Orleans e Ordinanza n. 36/2026 di Lamezia; precisate natura relativa degli effetti, differenza dal trial di Philadelphia e limiti di accesso al testo integrale."
        },
        {
          "date": "2026-11-05",
          "note": "Rafforzata la verifica usando la metodologia completa open access di Theall et al. 2025: assegnazione randomizzata di 194 cluster in 23 quartieri, 101 trattati/93 controlli, interventi dal gennaio 2020 al dicembre 2022 e manutenzione continua soltanto per 135/296 immobili. Queste informazioni qualificano l'abstract AJPH 2026 senza inventarne i dettagli non accessibili."
        }
      ]
    }
  ];
