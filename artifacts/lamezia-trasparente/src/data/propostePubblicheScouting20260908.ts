import type { PublicProposal } from "./propostePubblicheCore";

/**
 * Scouting dell'8 settembre 2026: proposta pubblicata il 7 settembre.
 *
 * La richiesta è acquisita come proposta emersa. Il promotore riferisce di avere
 * già inoltrato segnalazioni anche formali, ma in assenza di un atto/protocollo
 * verificabile questo record non le trasforma in deposito formale.
 */
export const SCOUTED_PUBLIC_PROPOSALS_20260908 = [
  {
    id: "parco-via-degli-itali-manutenzione-branca-2026",
    title: "Interventi di sicurezza e manutenzione nel parco di via degli Itali",
    summary:
      "Richiesta del consigliere comunale Oscar Branca di intervenire nel parco di via degli Itali per mettere in sicurezza i giochi per bambini, sostituire i cestini danneggiati, effettuare la manutenzione del verde e ripristinare il decoro dell'area.",
    promoterId: "oscar-branca",
    promoter: "Oscar Branca",
    promoterType: "consigliere",
    periodLabel: "7 settembre 2026",
    year: "2026",
    theme: "Decoro urbano e manutenzione",
    threadId: "parco-via-degli-itali-manutenzione",
    threadLabel: "Parco di via degli Itali: sicurezza, manutenzione e decoro",
    territorialArea: "Parco giochi di via degli Itali, quartiere Capizzaglie",
    institutionalRecipient: "Comune di Lamezia Terme — Amministrazione comunale",
    channel: "comunicato",
    sourceLabel: "City One, 7 settembre 2026 — comunicato attribuito a Oscar Branca",
    sourceUrl:
      "https://www.cityonelamezia.it/degrado-al-parco-di-via-degli-itali-branca-sicurezza-e-manutenzione-lamministrazione-continua-a-non-intervenire/",
    status: "proposta_emersa",
    linkedActs: [],
    verificationNote:
      "City One pubblica la nota indicando espressamente Oscar Branca, consigliere comunale, come fonte; il contenuto è riscontrato nello stesso giorno anche da Corriere di Lamezia e il Lametino. Le tre pubblicazioni riprendono il medesimo comunicato e non sono trattate come tre evidenze indipendenti. La richiesta contiene quattro misure operative: messa in sicurezza dei giochi, sostituzione dei cestini danneggiati, manutenzione del verde e ripristino del decoro. Branca dichiara di avere già inoltrato più segnalazioni, anche formalmente, all'Amministrazione e al dirigente del settore Patrimonio; lo scouting non ha reperito l'atto, un numero di protocollo o una registrazione amministrativa della specifica segnalazione, quindi non viene creato un evento di deposito e lo stato resta proposta_emersa. Il Comune è documentato come destinatario, ma non viene copiato automaticamente come ente competente: in assenza di una base amministrativa verificata per l'intero pacchetto di misure, la competenza resta not_assessed. La materia primaria riusa il mapping official-first già esistente per 'Decoro urbano e manutenzione' verso la materia ufficiale 5 — Catasto e urbanistica, senza estensioni LT.",
    evidenceLevel: "fonte_stampa",
    firstSeen: "2026-09-07",
    lastUpdated: "2026-09-07",
    events: [
      {
        id: "parco-via-degli-itali-branca-richiesta-interventi-7-settembre",
        date: "2026-09-07",
        type: "emersione",
        title: "Branca chiede interventi di sicurezza e manutenzione nel parco",
        summary:
          "Branca chiede al Comune di mettere in sicurezza i giochi, sostituire i cestini danneggiati, effettuare la manutenzione del verde e ripristinare il decoro del parco di via degli Itali.",
        sourceLabel: "City One — comunicato attribuito a Oscar Branca",
        sourceUrl:
          "https://www.cityonelamezia.it/degrado-al-parco-di-via-degli-itali-branca-sicurezza-e-manutenzione-lamministrazione-continua-a-non-intervenire/",
        evidenceLevel: "fonte_stampa",
      },
    ],
  },
] as const satisfies readonly PublicProposal[];
