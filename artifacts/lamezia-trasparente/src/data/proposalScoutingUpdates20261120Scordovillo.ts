import type { PublicProposal } from "./propostePubblicheCore";

export const SCORDOVILLO_DISCUSSION_IDS = [
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026",
  "scordovillo-consiglio-aperto-pd-azione-per-vivere-bene-2026",
] as const;

export const SCORDOVILLO_20261119_SOURCE =
  "https://www.lametino.it/ultime/lamezia-al-via-i-lavori-del-consiglio-comunale-aperto-sullo-sgombero-del-campo-rom.html";

const EVENT_ID = "scordovillo-consiglio-aperto-seduta-effettiva-2026-11-19";

/**
 * Update two distinct promoters' proposals in the same subject thread.
 * Attendance is corroborated by on-site reportage, not original municipal
 * minutes. The occurrence of the sitting is not evidence of any housing
 * policy being approved or implemented, nor of an attributed causal sponsor.
 */
export function applyScoutingUpdates20261120Scordovillo<T extends PublicProposal>(proposal: T): T {
  if (!SCORDOVILLO_DISCUSSION_IDS.some(id => id === proposal.id) ||
      proposal.events.some(event => event.id === EVENT_ID)) return proposal;
  const isCentrosinistra = proposal.id === SCORDOVILLO_DISCUSSION_IDS[1];
  const sessionNote =
    "Il 19 novembre 2026 si è svolto nella Sala Luisi il Consiglio comunale aperto dedicato al superamento del campo di Scordovillo e ai relativi percorsi abitativi e sociali. Il Lametino ne documenta l'avvio, l'ordine del giorno e la presenza di rappresentanti istituzionali; LameziaInforma conferma il dibattito. La documentazione resta giornalistica: non sono stati acquisiti verbale, convocazione o ordine del giorno originali del Comune. L'effettivo svolgimento del confronto è uno sviluppo del filone condiviso e non prova che la convocazione sia stata causata esclusivamente da questo promotore. Il Lametino riferisce anche il rigetto di una distinta mozione di Gennarino Masi per ridurre i tempi degli interventi: tale rigetto NON riguarda la richiesta di Consiglio aperto e non dimostra l'esito degli interventi abitativi o della bonifica. Non sono attestati recepimento di misure sostanziali, attuazione della proposta abitativa, né deposito documentale della specifica richiesta originaria.";

  return {
    ...proposal,
    summary: proposal.summary + " Il 19 novembre si è effettivamente tenuto il Consiglio comunale aperto, documentato da cronache della seduta; non è provato alcun recepimento o intervento attuato.",
    status: "discussa" as const,
    periodLabel: isCentrosinistra ? "10–19 novembre 2026" : "12 settembre–19 novembre 2026",
    lastUpdated: "2026-11-19",
    verificationNote: proposal.verificationNote + " AGGIORNAMENTO DOCUMENTALE 19/11/2026: " + sessionNote,
    events: [
      ...proposal.events,
      {
        id: EVENT_ID,
        date: "2026-11-19",
        type: "discussione" as const,
        title: "Si svolge il Consiglio comunale aperto su Scordovillo",
        summary:
          "Seduta tenuta nella Sala Luisi e dibattito sul superamento del campo, con interventi di consiglieri e rappresentanti istituzionali secondo le cronache in presenza. Il rigetto riferito di una mozione di Masi sulla tempistica è un atto distinto; nessun recepimento o attuazione è deducibile dalla discussione. Restano da acquisire verbale e ordine del giorno comunali originali.",
        sourceLabel: "il Lametino — cronaca della seduta del Consiglio comunale aperto, 19 novembre 2026; riscontro indipendente LameziaInforma, 19 novembre 2026",
        sourceUrl: SCORDOVILLO_20261119_SOURCE,
        evidenceLevel: "ricostruzione_multi_fonte" as const,
      },
    ],
  } as T;
}
