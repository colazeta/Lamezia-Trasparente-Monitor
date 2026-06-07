# Issue #47 — audit accessibilità e metadata rotte pubbliche

Data audit: 2026-06-07.

## Perimetro e metodo

L'audit ha usato `artifacts/lamezia-trasparente/src/Router.tsx` come inventario delle rotte effettivamente registrate e ha limitato le correzioni a interventi a basso rischio su metadata, duplicazioni di routing, link placeholder e icone decorative. Le aree `/redazione` e i redirect legacy `/admin` sono stati esclusi perché non sono rotte pubbliche principali con `MainLayout`.

Controlli eseguiti sulle rotte pubbliche:

- presenza di metadata specifici tramite `PublicRouteWithMeta` o `PageMeta` nel componente pagina;
- presenza di un heading principale visibile per lo stato normale della pagina;
- assenza di link placeholder pubblici `href="#"`;
- icone decorative residue marcate con `aria-hidden="true"` quando non aggiungono informazione autonoma;
- nessuna modifica a copy legale, metodologico o a flussi protetti/admin.

## Inventario rotte pubbliche verificate

| Rotta                    | Componente              | Metadata                | Note audit                                                                                   |
| ------------------------ | ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| `/`                      | `Home`                  | `PageMeta` nella pagina | Layout statico e blocchi pubblicati mantengono heading principale nello stato mostrato.      |
| `/domande`               | `Domande`               | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/guida`                 | `Guida`                 | `PageMeta` nella pagina | Copertura metadata presente.                                                                 |
| `/temi`                  | `Themes`                | `PublicRouteWithMeta`   | Corretti controlli dell'empty state con icone decorative nascoste.                           |
| `/temi/:id`              | `ThemeDetail`           | dinamica/esistente      | Rotta dettaglio esclusa da rewrite contenutistici; stati alternativi hanno heading dedicato. |
| `/contratti`             | `Contracts`             | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/contratti/:id`         | `ContractStoryline`     | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/incarichimetro`        | `Incarichimetro`        | `PageMeta` nella pagina | Copertura metadata presente.                                                                 |
| `/albo`                  | `Albo`                  | `PageMeta` nella pagina | Copertura metadata presente.                                                                 |
| `/albo/:id`              | `AlboDetail`            | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/atti-fondamentali`     | `AttiFondamentali`      | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/bandi`                 | `Bandi`                 | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/bandi/:slug`           | `BandoDetail`           | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/beni-confiscati`       | `BeniConfiscati`        | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/beni-confiscati/:slug` | `BeneConfiscatoDetail`  | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/accesso-civico`        | `AccessoCivico`         | `PageMeta` nella pagina | Copertura metadata presente; flusso non riscritto.                                           |
| `/monitoraggio`          | `Monitoraggio`          | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/monitoraggio/nuovo`    | `MonitoraggioNuovo`     | `PublicRouteWithMeta`   | Metadata presenti; flusso sensibile non riscritto.                                           |
| `/monitoraggio/:id`      | `MonitoraggioDetail`    | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/legalita`              | `Legalita`              | `PublicRouteWithMeta`   | Copertura metadata presente, copy prudente preservato.                                       |
| `/delibere`              | `Delibere`              | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/convocazioni`          | `Convocazioni`          | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/convocazioni/:id`      | `SedutaDetail`          | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/organi`                | `Organi`                | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/organi/:slug`          | `OrganoDetail`          | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/amministratori`        | `Amministratori`        | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/amministratori/:id`    | `AmministratoreDetail`  | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/pnrr`                  | `Pnrr`                  | `PageMeta` nella pagina | Copertura metadata presente.                                                                 |
| `/opendata`              | `Opendata`              | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/opendata/:id`          | `OpendataDetail`        | dinamica/esistente      | Rotta dettaglio, nessuna modifica sicura richiesta.                                          |
| `/feeds`                 | `Feeds`                 | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/sviluppatori`          | `Sviluppatori`          | `PublicRouteWithMeta`   | Corretti controlli tecnici e card API con icone decorative nascoste.                         |
| `/performance`           | `Performance`           | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/performance/confronta` | `PerformanceCompare`    | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/performance/:id`       | `PerformanceDetail`     | dinamica/esistente      | Rotta dettaglio con stati alternativi; nessuna modifica sicura richiesta.                    |
| `/pareri`                | `PareriVigilanza`       | `PublicRouteWithMeta`   | Copertura metadata presente.                                                                 |
| `/pareri/:id`            | `PareriVigilanzaDetail` | dinamica/esistente      | Rotta dettaglio con stati alternativi; nessuna modifica sicura richiesta.                    |
| `/segnalazioni`          | `Reports`               | `PublicRouteWithMeta`   | Metadata presenti; flusso privacy-sensitive non riscritto.                                   |
| `/statistiche`           | `Statistics`            | `PublicRouteWithMeta`   | Corretti eyebrow e card KPI con icone decorative nascoste.                                   |
| `/fonti-dati`            | `FontiDati`             | `PageMeta` nella pagina | Copertura metadata presente.                                                                 |
| `/metodologia`           | `Metodologia`           | `PageMeta` nella pagina | Copertura metadata presente; copy metodologico preservato.                                   |
| `/note-legali`           | `NoteLegali`            | `PageMeta` nella pagina | Copertura metadata presente; copy legale preservato.                                         |
| `/chi-siamo`             | `ChiSiamo`              | `PageMeta` nella pagina | Rimossa duplicazione di route che poteva rendere incoerente la copertura router/pagina.      |
| `/contatti`              | `Contatti`              | `PageMeta` nella pagina | Rimossa duplicazione di route che poteva rendere incoerente la copertura router/pagina.      |
| `/iscrizioni`            | `Subscriptions`         | `PublicRouteWithMeta`   | Corretti header, conferma, input adornment e submit con icone decorative nascoste.           |
| fallback 404             | `not-found`             | `PageMeta` nella pagina | Aggiunti metadata fallback e icone decorative nascoste.                                      |

## Fix applicati

- Corretta la duplicazione di `/chi-siamo` e `/contatti` nel router, lasciando una sola route per pagina e i rispettivi `PageMeta` page-owned.
- Aggiunto `PageMeta` alla pagina 404 di fallback.
- Marcate come decorative le icone residue negli stati e controlli di `/temi`, `/statistiche`, `/iscrizioni`, `/sviluppatori` e fallback 404.
- Verificata l'assenza di placeholder link `href="#"` nelle pagine e componenti pubblici TSX.

## Limiti residui

- Le rotte dettaglio dinamiche mantengono metadata o stati già esistenti; non sono state riscritte per evitare decisioni editoriali, legali o metodologiche non richieste.
- Non sono state modificate sitemap, navigazione, footer, flussi admin/redazione o copy civico-legale sensibile; sulla command palette è stato solo ripristinato un import mancante necessario alla validazione TypeScript.
- Nessuna nuova fonte dati esterna è stata introdotta.
