import type { EvidenceIntervention } from "./evidenceInterventions";

export const EVIDENCE_INTERVENTIONS_2026_10_09 = [
  {
    "id": "santa-fe-sidewalk-lottery-property-tax",
    "title": "Premio Buen Contribuyente: marciapiedi riqualificati per contribuenti regolari",
    "authority": "Municipalidad de la Ciudad de Santa Fe",
    "territory": "Santa Fe, provincia di Santa Fe",
    "country": "Argentina",
    "implementationYear": "Sorteggio 27 febbraio 2009; lavori 2009–2010",
    "problem": "Rafforzare il pagamento tempestivo della Tasa General de Inmuebles e rendere visibile l'utilità dei tributi comunali.",
    "measure": "Lotteria pubblica fra 72.742 immobili con imposte 2008 in regola; 400 estratti premiati con nuova costruzione o riqualificazione del marciapiede frontistante, con elementi di verde e permeabilità.",
    "mechanism": "Riconoscimento pubblico temporaneo e successiva reciprocità fiscale associata a un bene fisico visibile e durevole, con possibili spillover sui vicini.",
    "population": "Proprietari di immobili residenziali, commerciali e lotti eleggibili; contribuenti vicini alle proprietà premiate.",
    "primaryArea": "fiscalita_entrate_riscossione",
    "secondaryAreas": [
      "urbanistica_rigenerazione",
      "mobilita_spazio_pubblico"
    ],
    "interventionTypes": [
      "incentivo_economico",
      "infrastruttura_fisica",
      "informazione_trasparenza"
    ],
    "tools": [
      "registro eleggibili",
      "lotteria verificabile",
      "progetto standard di marciapiede",
      "storico dei versamenti"
    ],
    "territorialScale": "Singolo immobile, spillover di vicinato; scala comunale",
    "interventionStatus": "Esperimento storico realizzato; non documentata continuazione della stessa lotteria al 2026.",
    "evaluationMethod": "Randomizzazione di 400 su 72.742 contribuenti eleggibili; ITT dei vincitori, DiD per riconoscimento e IV/2SLS con lotteria come strumento della costruzione per stimare LATE; confronto anche su prossimità territoriale.",
    "comparator": "Immobili eleggibili non estratti; per il LATE i vincitori effettivamente beneficiati sono confrontati usando l'assegnazione casuale come strumento.",
    "outcomes": [
      "pagamento puntuale",
      "pagamento entro 3 e 6 mesi",
      "durata dell'effetto",
      "versamenti dei vicini"
    ],
    "results": "L'annuncio della vittoria produce +5,4 punti percentuali di pagamento puntuale nel mese successivo, senza persistenza in assenza dell'opera. Nel triennio 2009–2011 il sorteggio produce +3,1 p.p. di pagamento puntuale in media (ITT). La costruzione del marciapiede è associata a +7,1 p.p. di pagamento puntuale (stima IV/LATE), +5,5 p.p. entro 3 mesi e +4,8 p.p. entro 6 mesi; benefici duraturi e spillover positivi sui vicini. La sola possibilità di vincere non stimola in modo sostanziale il recupero degli arretrati.",
    "effectSize": "+5,4 p.p. riconoscimento immediato (non persistente); +7,1 p.p. pagamento puntuale per marciapiede ricevuto (IV/LATE, non ITT); +3,1 p.p. pagamento puntuale medio nell’intero triennio (ITT); +5,5 p.p. entro 3 mesi; +4,8 p.p. entro 6 mesi.",
    "evidenceStrength": "forte",
    "costsRequirements": "Costo medio storico circa ARS 5.250 per marciapiede (circa USD 1.553 all'epoca), alto rispetto alla tassa annuale; servono regolamento, dati tributi, capacità lavori pubblici e verifica di legittimità/equità.",
    "limitations": [
      "La lotteria coinvolgeva contribuenti già in regola, non debitori inadempienti.",
      "La stima +7,1 p.p. è IV/LATE; la validità causale richiede che l'effetto del riconoscimento si esaurisca prima dei lavori.",
      "Molti vincitori non ricevettero l'opera, che non fu assegnata in maniera strettamente coincidente al premio.",
      "Follow-up fino al 2011; costi e istituti fiscali non equivalgono a quelli italiani.",
      "Una selezione meritocratica delle opere può confliggere con priorità di sicurezza e giustizia distributiva."
    ],
    "unintendedEffects": "Possibile concentrazione delle manutenzioni su contribuenti più solvibili a scapito di aree socialmente vulnerabili o infrastrutture più pericolose.",
    "primarySource": {
      "label": "BID SkillsBank — esperienza municipale Buen Contribuyente",
      "url": "https://skillsbank.iadb.org/index.php/es/our-experience/funcionan-los-premios"
    },
    "evaluationStudies": [
      {
        "label": "Journal of Public Economics (studio finale 2021)",
        "url": "https://doi.org/10.1016/j.jpubeco.2021.104422",
        "citation": "Carrillo, Castro, Scartascini (2021), Public good provision and property tax compliance: Evidence from a natural experiment",
        "doi": "10.1016/j.jpubeco.2021.104422"
      },
      {
        "label": "IDB-WP-794 (stime complete)",
        "url": "https://publications.iadb.org/en/do-rewards-work-evidence-randomization-public-works",
        "citation": "Carrillo, Castro, Scartascini (2017), Do Rewards Work? Evidence from the Randomization of Public Works",
        "doi": "10.18235/0011793"
      }
    ],
    "lastVerifiedAt": "2026-10-09",
    "transferabilityItaly": "Meccanismo di reciprocità potenzialmente trasferibile; bassa trasferibilità della lotteria di opere, soggetta a verifica legale, contabile e di equità.",
    "lameziaAdaptation": "Collegare per quartiere entrate TARI e servizi/manutenzioni verificabili, pubblicando opere, costi e tempi. Non subordinare la messa in sicurezza dei marciapiedi alla regolarità fiscale dei residenti. Valutare incentivi solo dopo istruttoria legale.",
    "implementability": "medio_termine",
    "capacityDataNeeds": [
      "anagrafe tributaria pseudonimizzata",
      "interventi manutentivi geocodificati",
      "costi e collaudi",
      "analisi di equità",
      "verifica giuridica"
    ],
    "tags": [
      "Santa Fe",
      "premio fiscale",
      "RCT",
      "lotteria",
      "reciprocità",
      "LATE",
      "marciapiedi"
    ],
    "revisionHistory": [
      {
        "date": "2026-10-09",
        "note": "Prima verifica IDB e studio finale: separate stime da riconoscimento, ITT e IV/LATE; registrati rischi distributivi."
      }
    ]
  }
] as const satisfies readonly EvidenceIntervention[];
