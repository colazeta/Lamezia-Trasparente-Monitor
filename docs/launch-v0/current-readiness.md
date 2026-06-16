# Current v0 readiness

Generated: 2026-06-16T13:12:42.713Z

V0 readiness: **GO_WITH_LIMITS**

- P0 blockers: 0
- P1 issues: 8
- P2 notes: 4
- INFO: 1

## Route table

| Route | Stato | Controlli | Risultato |
| --- | --- | --- | --- |
| `/` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/convocazioni` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | routing/static presente<br>fallback SPA documentato | **LIMIT** |
| `/contratti` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/pnrr` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/redazione` | riservata | routing/static presente<br>riservata protetta in preview<br>fallback SPA documentato | **PASS** |
| `/healthz.json` | static-marker | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **PASS** |
| `/fonti-dati` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/metodologia` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |
| `/note-legali` | pubblicabile | routing/static presente<br>no error-boundary generico richiesto<br>fallback SPA documentato | **LIMIT** |

## Issues and recommended actions

- **P1** `/` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P2** `/` — empty-state: Pagina data-driven: controllare empty state prudente e normalizzazione dati API. Action: Verificare messaggi di dato non disponibile/non verificato/fonte non rilevata.
- **P1** `/convocazioni` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P2** `/convocazioni` — empty-state: Pagina data-driven: controllare empty state prudente e normalizzazione dati API. Action: Verificare messaggi di dato non disponibile/non verificato/fonte non rilevata.
- **P1** `/convocazioni/demo-consiglio-comunale-v0` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P1** `/contratti` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P2** `/contratti` — empty-state: Pagina data-driven: controllare empty state prudente e normalizzazione dati API. Action: Verificare messaggi di dato non disponibile/non verificato/fonte non rilevata.
- **P1** `/pnrr` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P2** `/pnrr` — empty-state: Pagina data-driven: controllare empty state prudente e normalizzazione dati API. Action: Verificare messaggi di dato non disponibile/non verificato/fonte non rilevata.
- **P1** `/fonti-dati` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P1** `/metodologia` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **P1** `/note-legali` — human-review: Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico. Action: Confermare in review presenza di fonti, limiti e stato di verifica.
- **INFO** `/healthz.json` — scope: API, worker e dati live non sono richiesti dal detector v0. Action: Eseguire smoke statico separato con `pnpm run smoke:v0-static-fallback`.

## Policy notes

- Questo report misura readiness strutturale, non completezza ufficiale dei dati.
- Nessun controllo richiede scraping, provider live, backend, worker, DNS, segreti o servizi a pagamento.
- I risultati P1/P2 sono limitazioni da dichiarare e verificare con linguaggio prudente e documentale.
