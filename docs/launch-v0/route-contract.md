# Contratto route v0

Questo contratto definisce le route minime da controllare prima della pubblicazione v0. È un controllo di readiness, non una fonte civica e non introduce nuovi dati.

Fonte machine-readable: `docs/launch-v0/v0-routes.json`.

Documenti collegati:

- Tassonomia civica sezioni v0: `docs/launch-v0/section-taxonomy-v0.md`.
- Guida copy civico prudente v0: `docs/launch-v0/civic-copy-style-guide.md`.
- Collegamento applicativo minimo: `artifacts/lamezia-trasparente/src/data/publicRoutes.ts`, campo `civicSectionId`.

## Stati ammessi

- `pubblicabile`: route pubblica candidabile alla v0, con limiti e fonti espliciti.
- `sperimentale`: route visibile solo se marcata come demo/fixture/non definitiva.
- `in-preparazione`: route non pronta per annuncio pubblico.
- `riservata`: route protetta o indisponibile in preview pubblica.
- `static-marker`: file statico di controllo tecnico, non contenuto civico.

## Politiche verificate dal detector

- L'error boundary è una safety net, non un risultato accettabile per route v0 critiche.
- Una route `v0Critical` con `mustNotErrorBoundary` che finisce nel fallback generico è `P0` e porta a `NO_GO`.
- Dati mancanti devono produrre empty state prudente, non crash o claim definitivi.
- Route data-driven devono distinguere dato reale, fixture, manuale, misto o mancante.
- Fonti, limiti, stato di verifica e copy non accusatorio restano requisiti di revisione umana quando `humanCheckRequired` è `true`.
- `_redirects` e `healthz.json` sono controlli statici: non provano API, worker, provider live, DNS, segreti o completezza dati.

## Route minime

| Route | Stato | Dati attesi | Critica v0 | Sezione civica | Note |
| --- | --- | --- | --- | --- | --- |
| `/` | pubblicabile | mixed | sì | `home` | Homepage con rimandi a fonti, metodo e limiti. |
| `/convocazioni` | pubblicabile | mixed | sì | `council-sessions` | Empty state prudente per dati mancanti. |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | fixture | no | `council-sessions` | Demo da marcare come sperimentale/non definitiva. |
| `/contratti` | pubblicabile | mixed | sì | `contracts` | Indicatori come segnali, non conclusioni. |
| `/organi` | pubblicabile | mixed | sì | `institutional-bodies` | Indice data-driven di organi istituzionali, composizioni correnti e storico fonte-limitato. |
| `/amministratori` | pubblicabile | mixed | sì | `institutional-bodies` | Profili pubblici collegati agli incarichi negli organi e allo storico dei ruoli disponibili. |
| `/pnrr` | pubblicabile | mixed | sì | `pnrr-projects` | Fonti, limiti e stato di verifica. |
| `/redazione` | riservata | none | sì | `editorial-area` | Non deve esporre contenuto ordinario in preview non autenticata. |
| `/healthz.json` | static-marker | none | sì | `static-health` | Marker statico, non controllo live data. |
| `/fonti-dati` | pubblicabile | manual | sì | `data-sources` | Indice fonti e limiti. |
| `/metodologia` | pubblicabile | manual | sì | `method` | Criteri e cautele. |
| `/note-legali` | pubblicabile | manual | sì | `legal-notes` | Note legali e limiti d'uso. |
