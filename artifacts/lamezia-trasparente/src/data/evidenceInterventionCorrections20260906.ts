import type { EvidenceIntervention } from "./evidenceInterventions";

type EvidenceInterventionCorrection = {
  id: string;
  patch: Partial<EvidenceIntervention>;
  revision: { date: string; note: string };
};

export const EVIDENCE_INTERVENTION_CORRECTIONS_2026_09_06 = [
  {
    id: "los-angeles-restaurant-hygiene-grade-cards",
    patch: {
      evaluationMethod:
        "Il paper QJE del 2003 sfrutta l'introduzione del grading nel 1998 e differenze territoriali nell'obbligo di esposizione per stimare effetti su punteggi ispettivi, domanda e ricoveri. Una successiva rivalutazione peer-reviewed (AEJ: Economic Policy, 2019) amplia fortemente la finestra dei ricoveri e usa placebo geografici: conclude che il calo delle ospedalizzazioni attribuito originariamente al grading non regge a dati e specificazioni migliori, anche perché un grande outbreak di salmonella colpì la California meridionale prima della policy. La replica/reply degli autori originari conferma un calo relativo rispetto alla California centrale e settentrionale ma non rispetto al resto della California meridionale, lasciando l'attribuzione sanitaria controversa.",
      comparator:
        "Per qualità e domanda, ristoranti/territori con diverso regime di disclosure e periodi pre/post. Per l'outcome sanitario, il confronto originario Los Angeles versus resto della California è integrato dalla rivalutazione 2019 con serie 1983–2009 e placebo su contee della California meridionale non trattate.",
      outcomes: [
        "punteggi delle ispezioni",
        "risposta della domanda dei consumatori",
        "ospedalizzazioni per malattie trasmesse da alimenti (evidenza causale contestata)",
        "incentivi e possibili manipolazioni attorno alle soglie di voto",
      ],
      results:
        "L'evidenza resta compatibile con un miglioramento dei punteggi ispettivi e con una maggiore sensibilità della domanda dei consumatori alla qualità igienica resa visibile. Non viene invece più presentata come stabilita una riduzione causale delle ospedalizzazioni: la rivalutazione del 2019 mostra che il risultato sanitario originario non è robusto a una finestra temporale più lunga e a placebo geografici. Il record va quindi letto come evidenza moderata a favore della disclosure come incentivo alla qualità osservata, non come prova forte di un effetto sanitario finale.",
      effectSize:
        "Studio QJE 2003: punteggi delle ispezioni circa +5% dopo l'introduzione del grading e domanda più reattiva ai voti pubblicati. Le precedenti stime di riduzione dei ricoveri (circa −13%/−20%, a seconda dello studio e della specificazione) non sono mantenute come effect size causale, perché la rivalutazione AEJ 2019 non le conferma con dati estesi e placebo geografici.",
      evidenceStrength: "moderata",
      limitations: [
        "L'effetto sanitario originariamente attribuito al grading non è robusto nella rivalutazione peer-reviewed del 2019: il forte calo post-1998 compare anche in contee della California meridionale senza grading, dopo un grande outbreak di salmonella nel periodo pre-policy.",
        "La replica/reply degli autori originari trova ancora un calo rispetto alla California centrale e settentrionale ma non rispetto al resto della California meridionale; spillover sono una possibile spiegazione, non una dimostrazione.",
        "I punteggi ispettivi sono un outcome intermedio e possono essere influenzati da discrezionalità o bunching attorno alle soglie A/B/C; non equivalgono direttamente a minori infezioni.",
        "Il disegno non è randomizzato e combina cambiamenti di disclosure, incentivi dei ristoratori, comportamento dei consumatori e pratica ispettiva, rendendo difficile separare i singoli meccanismi.",
        "La trasferibilità richiede ispezioni standardizzate e credibili, procedure di riesame e pubblicazione semplice al punto di scelta; una lettera senza qualità del sistema ispettivo sottostante può produrre falsa precisione.",
      ],
      unintendedEffects:
        "Soglie discrete possono generare pressione per ottenere il voto superiore, inclusi possibili comportamenti di gaming o manipolazione del punteggio vicino ai cut-off. Una replica dovrebbe pubblicare anche il punteggio numerico e le violazioni principali, monitorare bunching e riesami e non usare il solo voto come proxy di sicurezza sanitaria.",
      evaluationStudies: [
        {
          label: "Quarterly Journal of Economics — studio originario",
          url: "https://doi.org/10.1162/003355303321675428",
          citation:
            "Jin GZ, Leslie P (2003), The Effect of Information on Product Quality: Evidence from Restaurant Hygiene Grade Cards",
          doi: "10.1162/003355303321675428",
        },
        {
          label: "American Economic Journal: Economic Policy — rivalutazione",
          url: "https://doi.org/10.1257/pol.20180230",
          citation:
            "Ho DE, Ashwood ZC, Handan-Nader C (2019), New Evidence on Information Disclosure through Restaurant Hygiene Grading",
          doi: "10.1257/pol.20180230",
        },
        {
          label: "American Economic Journal: Economic Policy — reply",
          url: "https://doi.org/10.1257/pol.20180543",
          citation:
            "Jin GZ, Leslie P (2019), New Evidence on Information Disclosure through Restaurant Hygiene Grading: Reply",
          doi: "10.1257/pol.20180543",
        },
        {
          label: "Journal of Environmental Health — ospedalizzazioni",
          url: "https://pubmed.ncbi.nlm.nih.gov/15794461/",
          citation:
            "Simon PA et al. (2005), Impact of restaurant hygiene grade cards on foodborne-disease hospitalizations in Los Angeles County",
        },
      ],
      lastVerifiedAt: "2026-09-06",
      transferabilityItaly:
        "Media-alta per il principio di disclosure standardizzata degli esiti ispettivi, ma l'evidenza più difendibile riguarda incentivi e qualità osservata, non una riduzione dimostrata delle ospedalizzazioni. In Italia andrebbero prima chiarite competenza sanitaria, standard ispettivi, base giuridica della pubblicazione e garanzie di riesame.",
      lameziaAdaptation:
        "Non introdurre un semplice voto comunale parallelo. Valutare con ASP e soggetti competenti una disclosure più leggibile degli esiti già pubblicabili: punteggio/indicatori standard, data dell'ultima ispezione, violazioni rilevanti e stato del riesame. Prima di estenderla, misurare distribuzione dei punteggi, bunching alle soglie, tempi di correzione, reclami e comportamento degli utenti; gli outcome sanitari vanno trattati separatamente e richiedono dati epidemiologici adeguati.",
      implementability: "medio_termine",
      capacityDataNeeds: [
        "protocollo con autorità sanitaria competente",
        "standard ispettivi e dati granulari",
        "registro di riesami e correzioni",
        "audit del bunching alle soglie",
        "indicatori di comportamento degli utenti e, separatamente, dati sanitari aggregati",
      ],
      tags: [
        "food safety",
        "disclosure",
        "ispezioni",
        "grade cards",
        "trasparenza",
        "Los Angeles",
        "evidenza contestata",
      ],
    },
    revision: {
      date: "2026-09-06",
      note: "Revisione metodologica: aggiunta la rivalutazione AEJ 2019 e la relativa reply; rimosso l'effetto sulle ospedalizzazioni dai risultati causali consolidati e riclassificata la forza dell'evidenza da forte a moderata.",
    },
  },
] as const satisfies readonly EvidenceInterventionCorrection[];
