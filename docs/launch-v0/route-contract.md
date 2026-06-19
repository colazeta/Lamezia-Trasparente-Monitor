# Contratto route v0

Questo contratto definisce le route minime da controllare prima della pubblicazione v0. È un controllo di readiness, non una fonte civica e non introduce nuovi dati.

Fonte machine-readable: `docs/launch-v0/v0-routes.json`.

Guardrail copy: `docs/launch-v0/civic-copy-style-guide.md` definisce formule prudenti, parole consigliate e parole da evitare per route, detector/readiness e QA manuale v0.

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

| Route | Stato | Dati attesi | Critica v0 | Note |
| --- | --- | --- | --- | --- |
| `/` | pubblicabile | mixed | sì | Homepage con rimandi a fonti, metodo e limiti. |
| `/convocazioni` | pubblicabile | mixed | sì | Empty state prudente per dati mancanti. |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | fixture | no | Demo da marcare come sperimentale/non definitiva. |
| `/contratti` | pubblicabile | mixed | sì | Indicatori come segnali, non conclusioni. |
| `/pnrr` | pubblicabile | mixed | sì | Fonti, limiti e stato di verifica. |
| `/redazione` | riservata | none | sì | Non deve esporre contenuto ordinario in preview non autenticata. |
| `/healthz.json` | static-marker | none | sì | Marker statico, non controllo live data. |
| `/fonti-dati` | pubblicabile | manual | sì | Indice fonti e limiti. |
| `/metodologia` | pubblicabile | manual | sì | Criteri e cautele. |
| `/note-legali` | pubblicabile | manual | sì | Note legali e limiti d'uso. |
