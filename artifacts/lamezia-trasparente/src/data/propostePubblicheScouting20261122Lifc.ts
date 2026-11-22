import type { PublicProposal } from "./propostePubblicheCore";

/** Scouting 22/11: richiesta e risposta documentate senza confondere diffida, deposito e attuazione. */
export const SCOUTED_PUBLIC_PROPOSALS_20261122_LIFC = [
  {
    "id": "centro-fibrosi-cistica-lamezia-tutela-spazi-lifc-2026",
    "title": "LIFC Calabria chiede la tutela degli spazi del Centro Fibrosi Cistica; la nota del 21 novembre riferisce rassicurazioni ASP",
    "summary": "Una nota congiunta pubblicata il 21 novembre 2026 riferisce che LIFC Calabria OdV aveva inviato una diffida in relazione alla possibile riorganizzazione degli spazi del Centro Regionale per la Fibrosi Cistica di Lamezia Terme. L'associazione chiede di salvaguardare gli ambienti assistenziali, compresi palestra e laboratorio spirometrico. Il 17 novembre è avvenuto un confronto con la Direzione generale dell'ASP di Catanzaro; secondo la nota, la direttrice generale ha confermato che i locali del Centro non subiranno rifunzionalizzazioni. La dichiarazione non documenta un atto amministrativo autonomo né una modifica materialmente attuata.",
    "promoterId": "lifc-calabria-odv",
    "promoter": "Lega Italiana Fibrosi Cistica Calabria OdV",
    "promoterType": "associazione",
    "periodLabel": "novembre 2026 (riunione 17 novembre; nota 21 novembre; diffida senza data acquisita)",
    "year": "2026",
    "theme": "Tutela dei locali e continuità assistenziale del Centro Fibrosi Cistica",
    "threadId": "fibrosi-cistica-lamezia-spazi-assistenziali-2026",
    "threadLabel": "Centro Fibrosi Cistica: tutela degli spazi assistenziali",
    "territorialArea": "Centro regionale di riferimento per la fibrosi cistica, Ospedale Giovanni Paolo II, Torre A, quarto piano, via Senatore Arturo Perugini, Lamezia Terme",
    "institutionalRecipient": "Direzione generale dell'Azienda Sanitaria Provinciale di Catanzaro",
    "channel": "altro",
    "sourceLabel": "il Lametino — nota congiunta ASP Catanzaro e LIFC Calabria, 21 novembre 2026",
    "sourceUrl": "https://www.lametino.it/ultimora/lamezia-nessun-ridimensionamento-per-centro-fibrosi-cistica-intesa-tra-asp-e-associazione.html",
    "status": "discussa",
    "linkedActs": [],
    "verificationNote": "La nota congiunta riportata integralmente da il Lametino il 21/11/2026 è la fonte originale consultata del resoconto pubblico; il testo originario della diffida e il suo protocollo non sono disponibili, e la data dell'invio non è stata inferita. Il confronto del 17/11 e le rassicurazioni attribuite alla direttrice generale ASP sono documentati dalla nota pubblicata e non da un verbale, provvedimento o riscontro ASP indipendente. La pagina istituzionale ASP conferma l'esistenza, la sede e la responsabile del Centro; la pagina ufficiale LIFC conferma identità e presidente Michele Rotella. La richiesta concreta è la conservazione degli spazi esistenti; le rassicurazioni e la dichiarazione di intesa non equivalgono né a recepimento formalizzato né ad attuazione. Destinatario dedotto soltanto dalla interlocuzione esplicita della nota, non utilizzato come prova della competenza: assessment not_assessed. Localizzazione come area ospedaliera, senza coordinate WGS84 inventate. Fonti di riscontro: https://www.asp.cz.it/centro-di-riferimento-regionale-per-la-fibrosi-cistica-crrfc-/ ; https://www.fibrosicistica.it/centric_associazioni/associazione-calabria/.",
    "evidenceLevel": "ricostruzione_multi_fonte",
    "firstSeen": "2026-11-21",
    "lastUpdated": "2026-11-21",
    "events": [
      {
        "id": "lifc-centro-fibrosi-confronto-2026-11-17",
        "date": "2026-11-17",
        "type": "discussione",
        "title": "Incontro della direzione ASP con LIFC Calabria nel Centro Fibrosi Cistica",
        "summary": "La nota diffusa il 21 novembre riferisce il sopralluogo e il confronto avvenuti il 17 novembre fra direzione ASP, associazione e responsabile della struttura; la data della precedente diffida rimane sconosciuta.",
        "sourceLabel": "il Lametino — nota congiunta, pubblicata 21 novembre 2026",
        "sourceUrl": "https://www.lametino.it/ultimora/lamezia-nessun-ridimensionamento-per-centro-fibrosi-cistica-intesa-tra-asp-e-associazione.html",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "lifc-centro-fibrosi-richiesta-documentata-2026-11-21",
        "date": "2026-11-21",
        "type": "emersione",
        "title": "La nota pubblica documenta la precedente richiesta dell'associazione",
        "summary": "La nota riferisce una diffida sulla tutela degli spazi, senza allegarla né indicarne data o protocollo. Non è registrato un evento di deposito formale.",
        "sourceLabel": "il Lametino, 21 novembre 2026",
        "sourceUrl": "https://www.lametino.it/ultimora/lamezia-nessun-ridimensionamento-per-centro-fibrosi-cistica-intesa-tra-asp-e-associazione.html",
        "evidenceLevel": "fonte_stampa"
      },
      {
        "id": "lifc-centro-fibrosi-rassicurazioni-asp-2026-11-21",
        "date": "2026-11-21",
        "type": "risposta_istituzionale",
        "title": "Pubblicate rassicurazioni della direzione ASP sulla conservazione degli ambienti",
        "summary": "La comunicazione congiunta attribuisce alla direttrice ASP la conferma che nessun ambiente del Centro sarà rifunzionalizzato; non sono acquisiti atti originali di assetto, verbali o prove di attuazione.",
        "sourceLabel": "il Lametino — nota congiunta ASP/LIFC, 21 novembre 2026",
        "sourceUrl": "https://www.lametino.it/ultimora/lamezia-nessun-ridimensionamento-per-centro-fibrosi-cistica-intesa-tra-asp-e-associazione.html",
        "evidenceLevel": "fonte_stampa"
      }
    ]
  }
] as const satisfies readonly PublicProposal[];
