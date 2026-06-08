export const SECONDARY_SOURCES_POLICY = {
  title: "Fonti secondarie e segnali giornalistici",
  summary:
    "Le fonti secondarie o giornalistiche possono essere usate solo come segnali pubblici per orientare verifiche documentali, non come base autonoma per indicatori, conteggi o conclusioni su persone e uffici.",
  steps: [
    {
      title: "Verifica prima dell'uso",
      text: "Registrare testata, data, link e fatto minimo documentabile; cercare conferma su atti primari, PIAO, delibere, determine, albo pretorio, Amministrazione Trasparente o risposte ad accesso civico prima di consolidare il dato.",
    },
    {
      title: "Riesame periodico",
      text: "Riesaminare il segnale quando emergono nuovi atti ufficiali, rettifiche, aggiornamenti della fonte o chiarimenti istituzionali, mantenendo traccia dello stato di verifica e dei limiti residui.",
    },
    {
      title: "Ritiro o declassamento",
      text: "Rimuovere, sospendere o declassare il segnale se la fonte non è più raggiungibile, viene rettificata, risulta non pertinente o non può essere riscontrata in modo proporzionato con documenti primari.",
    },
  ],
  civicUse:
    "Nel portale il segnale resta separato dai dataset ufficiali: può suggerire domande, richieste documentali o bisogni di monitoraggio, ma non prova irregolarità, responsabilità, negligenza, favoritismi o intenzioni.",
} as const;

export const MACCHINA_COMUNALE_SECONDARY_SOURCE_APPLICATION = [
  "La fonte giornalistica è mostrata in un riquadro separato dai conteggi sull'organico.",
  "Gli elementi riportati sono etichettati come da verificare con fonte primaria e orientano solo richieste documentali proporzionate.",
  "Il segnale va riesaminato o ritirato se un PIAO, una dotazione organica, un atto di incarico o una rettifica pubblica fornisce informazioni incompatibili o più aggiornate.",
] as const;
