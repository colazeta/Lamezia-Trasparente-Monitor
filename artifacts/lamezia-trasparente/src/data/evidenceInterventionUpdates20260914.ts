import type { EvidenceIntervention } from "./evidenceInterventions";

export function applyEvidenceInterventionUpdates20260914(
  item: EvidenceIntervention,
): EvidenceIntervention {
  if (item.id === "london-mini-hollands-active-travel") {
    return {
      ...item,
      results:
        `${item.results} Il follow-up pubblicato nel 2024, basato su sei anni di dati longitudinali, conferma un forte e coerente gradiente dose-risposta tra intensità dell'infrastruttura e uptake della mobilità attiva e rileva qualche evidenza di minore possesso e/o uso dell'auto nelle aree con più interventi.`,
      effectSize:
        `${item.effectSize} Il follow-up a cinque anni aggiorna la valutazione economica modellata a oltre £1 miliardo di benefici sanitari per un programma del costo di circa £100 milioni; anche questa cifra è una proiezione modellata, non un risparmio di bilancio osservato.`,
      evaluationStudies: [
        ...item.evaluationStudies,
        {
          label: "Journal of Transport & Health — five-year follow-up",
          url: "https://www.sciencedirect.com/science/article/pii/S2214140524000173",
          citation:
            "Aldred R, Woodcock J, Goodman A (2024), Impacts of active travel interventions on travel behaviour and health: Results from a five-year longitudinal travel survey in Outer London",
          doi: "10.1016/j.jth.2024.101771",
        },
      ],
      revisionHistory: [
        ...item.revisionHistory,
        {
          date: "2026-09-14",
          note:
            "Aggiunto il follow-up 2024 su sei anni di dati, che conferma il gradiente dose-risposta e aggiorna la valutazione sanitaria economica modellata; mantenuta distinta dai benefici osservati di mobilità attiva.",
        },
      ],
    };
  }

  if (item.id !== "philadelphia-vacant-lot-greening") return item;

  return {
    ...item,
    outcomes: [
      ...item.outcomes,
      "autovalutazione della depressione",
      "autovalutazione del senso di inutilità",
      "salute mentale auto-riferita",
    ],
    results:
      `${item.results} Una seconda analisi dello stesso cluster RCT, focalizzata sugli outcome di salute mentale dei residenti, trova inoltre una riduzione significativa della quota che riferisce di sentirsi depressa o inutile vicino ai lotti sottoposti a greening. La riduzione dell'indicatore composito di cattiva salute mentale è ampia ma appena oltre la soglia convenzionale di significatività; la sola pulizia senza greening non mostra effetti significativi sugli outcome mentali.`,
    effectSize:
      `${item.effectSize} Salute mentale: feeling depressed −41,5% (IC95% −63,6% a −5,9%; p=0,03); feeling worthless −50,9% (IC95% −74,7% a −4,7%; p=0,04); poor mental health −62,8% (IC95% −86,2% a 0,4%; p=0,051, non statisticamente significativo). Nei quartieri sotto la soglia di povertà, feeling depressed −68,7% (IC95% −86,5% a −27,5%; p=0,007).`,
    limitations: [
      ...item.limitations,
      "Gli outcome di salute mentale sono auto-riferiti e il follow-up analitico comprende 342 dei 442 residenti inizialmente reclutati (77,4%).",
      "La riduzione del 62,8% dell'indicatore composito di cattiva salute mentale ha p=0,051 e non deve essere presentata come statisticamente significativa; risultano significativi depressione e senso di inutilità.",
    ],
    evaluationStudies: [
      ...item.evaluationStudies,
      {
        label: "JAMA Network Open",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2688343",
        citation:
          "South EC, Hohl BC, Kondo MC, MacDonald JM, Branas CC (2018), Effect of Greening Vacant Land on Mental Health of Community-Dwelling Adults: A Cluster Randomized Trial",
        doi: "10.1001/jamanetworkopen.2018.0298",
      },
    ],
    lastVerifiedAt: "2026-09-14",
    lameziaAdaptation:
      `${item.lameziaAdaptation} L'aggiornamento sugli outcome mentali rafforza la ragione per misurare anche benessere percepito e uso dello spazio, ma senza raccogliere dati sanitari individuali nel sito civico: per un pilot locale sarebbero sufficienti survey anonime/aggregate pre-post e indicatori di uso/manutenzione.`,
    tags: [...item.tags, "salute mentale"],
    revisionHistory: [
      ...item.revisionHistory,
      {
        date: "2026-09-14",
        note:
          "Aggiunta la valutazione JAMA Network Open sugli outcome di salute mentale dello stesso cluster RCT: riduzioni significative di depressione e senso di inutilità; mantenuta esplicita la non-significatività dell'indicatore composito poor mental health (p=0,051).",
      },
    ],
  };
}
