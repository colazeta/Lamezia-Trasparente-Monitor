import type { PublicProposal } from "./propostePubblicheCore";

const SCHOOL_REDUCED_HOURS_ID = "scuole-orario-ridotto-caldo-settembre-2026";
const ASILI_ID = "asili-nido-continuita-servizio-2026";

const SCHOOL_ORDINANCE_SOURCE_URL =
  "https://albo.tinnvision.cloud/export/print?a=2026-09-11&da=2026-03-11&ente=00301390795&wich=all";
const ASILI_START_SOURCE_URL =
  "https://www.comune.lamezia-terme.cz.it/it/news/avvio-del-servizio-di-asilo-nido-comunale";

function updateSchoolReducedHours(proposal: PublicProposal): PublicProposal {
  const eventId = "scuole-ordinanza-41-uscita-ore-12-10-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "31 agosto–10 settembre 2026",
    lastUpdated: "2026-09-10",
    linkedActs: Array.from(
      new Set([
        ...proposal.linkedActs,
        "Ordinanza Comune di Lamezia Terme n. 41 del 10/09/2026 — Albo Pretorio n. 2026/2924",
      ]),
    ),
    verificationNote:
      `${proposal.verificationNote} ` +
      "L'Albo Pretorio ufficiale documenta ora l'Ordinanza n. 41 del 10 settembre 2026, pubblicazione n. 2026/2924, che dispone nelle scuole pubbliche di ogni ordine e grado del territorio comunale la sospensione dell'attività didattica dalle ore 12:00 nei giorni dall'11 al 14 settembre per le elevate temperature. La misura è materialmente sovrapponibile solo in parte alla richiesta di Nucifero, che chiedeva un orario ridotto per l'intero mese di settembre. L'atto non richiama la proposta del 31 agosto e non viene quindi qualificato come recepimento o attuazione della proposta, né viene inferito un nesso causale. È registrato come sviluppo istituzionale verificato del medesimo filone.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-10",
        type: "aggiornamento",
        title: "Il Comune dispone l'uscita alle 12 nelle scuole dall'11 al 14 settembre",
        summary:
          "L'Ordinanza comunale n. 41 del 10 settembre dispone la sospensione dell'attività didattica dalle ore 12:00 dall'11 al 14 settembre nelle scuole pubbliche cittadine per le elevate temperature. La misura coincide solo parzialmente con la proposta di orario ridotto per tutto settembre e l'atto non cita la proposta: il dataset non inferisce recepimento, attuazione o causalità.",
        sourceLabel:
          "Albo Pretorio Comune di Lamezia Terme — Ordinanza n. 41/2026, pubbl. 2026/2924",
        sourceUrl: SCHOOL_ORDINANCE_SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

function updateAsili(proposal: PublicProposal): PublicProposal {
  const eventId = "asili-nido-avvio-servizio-calendarizzato-15-settembre";
  if (proposal.events.some((event) => event.id === eventId)) return proposal;

  return {
    ...proposal,
    periodLabel: "26 agosto–11 settembre 2026",
    lastUpdated: "2026-09-11",
    verificationNote:
      `${proposal.verificationNote} ` +
      "L'11 settembre il Comune ha comunicato ufficialmente che il servizio nei tre asili nido comunali di via Conforti, via Spartivento e via Giovanni XXIII sarà avviato il 15 settembre 2026; assessore e RTI affidataria incontreranno i genitori e il nuovo gestore comunicherà alle famiglie il calendario dell'accoglienza. Poiché alla data dello scouting il 15 settembre è ancora futuro, il passaggio viene registrato come calendarizzazione istituzionale dell'avvio, non come prova che il servizio sia già operativo. La comunicazione non richiama l'interrogazione di Masi: non viene inferito un nesso causale né un recepimento delle ulteriori richieste di trasparenza e continuità.",
    events: [
      ...proposal.events,
      {
        id: eventId,
        date: "2026-09-11",
        type: "calendarizzazione",
        title: "Il Comune fissa al 15 settembre l'avvio dei tre asili nido comunali",
        summary:
          "Il Comune comunica che dal 15 settembre sarà avviato il servizio negli asili di via Conforti, via Spartivento e via Giovanni XXIII e annuncia incontri organizzativi con le famiglie. Alla data dello scouting l'avvio è programmato ma non ancora avvenuto; non viene quindi registrata evidenza di attuazione né attribuito un rapporto causale con l'interrogazione.",
        sourceLabel: "Comune di Lamezia Terme — Settore Servizi alla Persona",
        sourceUrl: ASILI_START_SOURCE_URL,
        evidenceLevel: "fonte_ufficiale",
      },
    ],
  };
}

/**
 * Scouting del 12 settembre 2026.
 *
 * Aggiorna soltanto timeline già censite. Gli updater sono idempotenti e non
 * trasformano la convergenza tra un atto amministrativo e una richiesta civica
 * in recepimento o attuazione senza evidenza specifica.
 */
export function applyScoutingUpdates20260912(
  proposal: PublicProposal,
): PublicProposal {
  if (proposal.id === SCHOOL_REDUCED_HOURS_ID) return updateSchoolReducedHours(proposal);
  if (proposal.id === ASILI_ID) return updateAsili(proposal);
  return proposal;
}
