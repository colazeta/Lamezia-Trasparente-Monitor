import type { EvidenceIntervention } from "./evidenceInterventions";

/** Original study and municipal implementation checked on 2026-11-06; observational public-space quality, NOT health effects. */
export const EVIDENCE_INTERVENTIONS_2026_11_06_BARCELONA_GREEN_CORRIDORS: readonly EvidenceIntervention[] = [
  {
    "id": "barcelona-eixample-green-corridors-public-space-quality-did-2022",
    "title": "Barcellona: corridoi verdi Eixos Verds nell'Eixample e qualità misurata dello spazio pubblico",
    "authority": "Ajuntament de Barcelona (Comune di Barcellona); valutazione Agència de Salut Pública de Barcelona",
    "territory": "Quartiere Eixample, Barcellona (Consell de Cent, Rocafort, Comte Borrell, Girona)",
    "country": "Spagna",
    "implementationYear": "2022–2023 (prima fase: lavori avviati nel 2022; osservazione pre 2022, post 2024)",
    "problem": "Nell'Eixample il traffico motorizzato, le superfici pedonali limitate e la scarsità di verde riducevano accessibilità, comfort, possibilità di sosta e qualità dell'ambiente urbano.",
    "measure": "Riconfigurazione fisica di una prima rete di quattro assi stradali e quattro piazze: priorità pedonale, regolazione degli accessi veicolari e delle velocità, piattaforme stradali più accessibili, alberature, aiuole, panchine, fontane e spazi di incontro; il piano complessivo di 21 assi è distinto dalla sola prima fase effettivamente realizzata e valutata.",
    "mechanism": "La riduzione del predominio delle auto e l'ampliamento di verde e superfici pedonali possono migliorare le condizioni fisiche e la fruibilità degli spazi; manutenzione e arredo favoriscono comfort e uso. L'articolo valuta qualità dello spazio come determinante indiretta di salute, NON esiti clinici.",
    "population": "Residenti, pedoni, ciclisti, visitatori e attività del quartiere; analisi su sette sezioni stradali e quattro piazze trattate rispetto a due sezioni di via València come comparatore, non su campione individuale di popolazione.",
    "primaryArea": "urbanistica_rigenerazione",
    "secondaryAreas": [
      "mobilita_spazio_pubblico",
      "ambiente_clima_energia",
      "salute_pubblica_locale",
      "capacita_amministrativa_personale"
    ],
    "interventionTypes": [
      "infrastruttura_fisica",
      "regolazione",
      "modifica_organizzativa_processo",
      "targeting_data_analytics"
    ],
    "tools": [
      "riqualificazione di assi stradali e incroci con interventi di verde e arredo",
      "modifica degli schemi di accesso e moderazione velocità",
      "osservazione pre/post (2022/2024) con griglia a otto dimensioni su scala 1–10",
      "difference-in-differences con due sezioni di via València",
      "mappe e registri comunali per riscontro delle trasformazioni fisiche"
    ],
    "territorialScale": "Corridoi e piazze nel quartiere Eixample; prima fase locale, non l'intero programma Superblocks cittadino.",
    "interventionStatus": "Prima fase dei quattro Eixos Verds realizzata; valutazione 2022–2024 conclusa e pubblicata nel 2026. Le successive fasi previste nel piano generale non sono assunte come realizzate; stato attuale dei lavori successivi non verificato.",
    "evaluationMethod": "Studio quasi-sperimentale con confronto pre (2022) / post (2024), rilevazione osservazionale sulla qualità degli spazi e stime difference-in-differences a livello di sezioni stradali/piazze. Solo una strada di controllo con due sezioni; strumento ad hoc non precedentemente validato, alcuni item soggettivi; nessuna assegnazione casuale né lunga serie temporale per verificare parallel trends.",
    "comparator": "Due sezioni della via València, vicina e con caratteristiche dichiarate simili, confrontate con sette sezioni di quattro strade trasformate e quattro piazze; osservazioni ante e post nello stesso intervallo temporale (2022 vs 2024).",
    "outcomes": [
      "punteggio osservazionale 1–10 per verde/aree naturali",
      "qualità architettonica e accessibilità osservata",
      "manutenzione e pulizia",
      "sicurezza percepita/osservata della strada (NON incidenti misurati)",
      "caratteristiche ambientali osservate, inclusi rumore/inquinamento percepiti (NON µg/m³ o dB misurati)",
      "dimensioni non significativamente migliorate: dotazioni, comfort e aspetti sociali nel confronto DiD"
    ],
    "results": "Rispetto alla strada di confronto aumentano significativamente i punteggi osservazionali delle aree naturali, della manutenzione/pulizia, delle caratteristiche architettoniche, della sicurezza e delle caratteristiche ambientali. Il confronto DiD non identifica miglioramenti significativi per dotazioni, attrattività/comfort e aspetti sociali. Il disegno non rileva effetti sanitari effettivi, tassi di sinistri o riduzioni misurate dell'inquinamento; la scala usata è di valutazione dello spazio e non una misura fisica.",
    "effectSize": "DiD su scala osservazionale 1–10: aree naturali +4,94 punti (IC95% 3,66–6,23); manutenzione/pulizia +2,55 (0,25–4,86); caratteristiche architettoniche +2,28 (0,08–4,48); sicurezza +1,61 (0,30–2,93); condizioni ambientali +1,00 (0,25–1,75). Non significativi: dotazioni +1,63 (−0,36–3,62), comfort/attrattività +1,61 (−0,44–3,65), aspetti sociali +1,20 (−1,32–3,72). Dati dal Table 3, Novoa et al. 2026. Il paper descrive inoltre +85% di spazio pedonale e +68% di alberi nella trasformazione, valori progettuali/di realizzazione, NON effetti DiD.",
    "evidenceStrength": "moderata",
    "costsRequirements": "Opere civili, accessibilità e pavimentazione, alberi e manutenzione, segnaletica e riorganizzazione traffico; coordinamento urbanistica/viabilità/verde, consultazione con residenti e commercianti, monitoraggio GIS e ripartizione dei costi di manutenzione. Lo studio non offre costo consuntivo verificato per metro quadro né analisi costi-benefici; è un intervento infrastrutturale, non un quick win finanziario.",
    "limitations": [
      "Solo sette sezioni di strade trattate, quattro piazze e due sezioni in un'unica strada di confronto: comparatore esiguo, generalizzabilità e precisione limitate.",
      "Due sole osservazioni nel tempo (2022 e 2024): non è possibile testare appropriatamente trend paralleli o tenere sotto controllo ogni intervento concomitante.",
      "La griglia degli osservatori è costruita ad hoc e non validata; molti indicatori sono soggettivi. Gli incrementi nei punteggi NON equivalgono a misure di NO₂, dB, incidenti o riduzione clinica del rischio.",
      "Le dimensioni sociali, attrattività/comfort e dotazioni non hanno effetti DiD statisticamente significativi; nessuna prova diretta di maggiore attività fisica o migliore salute.",
      "Alcuni assi avevano subito modifiche già nel periodo COVID precedente ai lavori, riducendo l'isolabilità della prima fase.",
      "Nessuna valutazione empirica di costi, danni su strade circostanti, impatti commerciali, canoni abitativi o effetti distributivi; molteplici outcome, nessun claim sanitario causale."
    ],
    "unintendedEffects": "Nell'indagine qualitativa correlata, alcuni residenti riferiscono rumore serale legato a locali e disagio per condivisione dello spazio tra pedoni, bici e veicoli. Rischi da monitorare (non causalmente quantificati nello studio): deviazione dei flussi verso vie adiacenti, problemi di carico/scarico e accessibilità, gentrificazione e aumento dei costi abitativi. Non presentare l'assenza di peggioramento nella sola via València come prova di assenza di spillover altrove.",
    "primarySource": {
      "label": "Ajuntament/Consorci de l'Habitatge de Barcelona — avvio della seconda fase dei lavori ai quattro assi verdi dell'Eixample, 19 gennaio 2023",
      "url": "https://www.consorcihabitatge.barcelona/ca/noticies/comenca-a-transformar-se-la-banda-de-muntanya-de-consell-de-cent-1245710"
    },
    "evaluationStudies": [
      {
        "label": "European Journal of Public Health — versione integrale originale open access su PubMed Central (tabelle 1–3 e limiti)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC13472673/",
        "citation": "Novoa, A. M., González-Calleja, M., Sánchez-Ledesma, E., Continente, X., López, M. J., & Pérez, K. (2026). Evaluation of the Barcelona Superblocks 'Green Corridor' project on the quality of public space from a health determinants perspective. European Journal of Public Health, 36(5), ckag126.",
        "doi": "10.1093/eurpub/ckag126"
      }
    ],
    "lastVerifiedAt": "2026-11-06",
    "transferabilityItaly": "Un Comune italiano può adottare interventi di moderazione del traffico, riqualificazione di attraversamenti, ampliamento del verde e dell'accessibilità nell'ambito delle proprie competenze urbanistiche e viabilistiche, con verifica del Codice della strada, della progettazione accessibile e dei vincoli patrimoniali. Si trasferisce soprattutto la combinazione fra piccoli progetti pilota e misura pre/post comparata, NON il piano integrale di Barcellona, né una pretesa dimostrata riduzione di mortalità.",
    "lameziaAdaptation": "Nell'aggiornamento del Piano Generale del Traffico Urbano di Lamezia, partire dal Geoportale e da sopralluoghi per selezionare un breve corridoio pilota a Nicastro, Sambiase o Sant'Eufemia vicino a scuole/servizi, con problemi verificati di attraversamento, ombra, continuità dei marciapiedi e sosta. Progettare insieme a tecnici e utenti un intervento reversibile di moderazione velocità, arredi e alberature compatibili con sottoservizi. Prevedere prima dell'avvio due o più vie comparabili non trattate, griglia di osservazione validata, conteggi di pedoni/ciclisti/auto, misure fisiche di rumore e calore dove possibili; valutare accesso disabili, carico/scarico, effetti su vie limitrofe e segnalazioni, poi decidere su opere permanenti.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "geografia degli assi e dati stradali da PGTU/Geoportale",
      "valutazione tecnica di accessibilità, sicurezza e sottoservizi",
      "registro interventi fisici, costi e tempi di manutenzione",
      "misure baseline e follow-up con osservatori formati, comparatori multipli",
      "conteggi traffico, flussi pedonali/ciclabili e possibili effetti di spostamento",
      "indicatori su comfort termico, rumore e sicurezza distinti da percezioni",
      "coinvolgimento residenti, negozi, servizi di emergenza e DPO per i dati"
    ],
    "tags": [
      "Barcellona",
      "Eixos Verds",
      "Eixample",
      "Consell de Cent",
      "corridoi verdi",
      "spazio pubblico",
      "rigenerazione urbana",
      "moderazione traffico",
      "difference-in-differences",
      "qualità osservazionale",
      "salute indiretta",
      "PGTU Lamezia",
      "Novoa 2026"
    ],
    "revisionHistory": [
      {
        "date": "2026-11-06",
        "note": "Prima scheda dopo discovery Parallel Search e confronto con archive GitHub; verificati testo originale completo (Table 3, campione e limiti), atto informativo comunale sui lavori e fonte primaria PGTU Lamezia. Distinti indicatori osservazionali da esiti sanitari/ambientali fisici e riportati gli outcome DiD non significativi."
      }
    ]
  }
];
