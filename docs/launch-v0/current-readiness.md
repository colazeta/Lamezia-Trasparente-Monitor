# V0 readiness corrente

Generato: 2026-06-16T10:57:55.328Z

## Esito

**V0 readiness: GO_WITH_LIMITS**

- P0 blockers: 0
- P1 issues: 9
- P2 notes: 4
- INFO: 3

Il detector è un controllo locale e versionato. Non introduce nuovi dati civici, non effettua scraping, non contatta backend/worker/provider e non pubblica automaticamente.

## Tabella route → stato → risultato

| Route | Stato | Risultato | Controlli |
| --- | --- | --- | --- |
| `/` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/convocazioni` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/contratti` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/pnrr` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/redazione` | riservata | LIMITED | routing/static presence: PASS<br>reserved preview fallback: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/healthz.json` | static-marker | PASS | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: PASS |
| `/fonti-dati` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/metodologia` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |
| `/note-legali` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL |

## Issue e azioni consigliate

| Severità | Route | Codice | Evidenza | Azione |
| --- | --- | --- | --- | --- |
| P1 | `/` | manual-source-limit-review | / richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/convocazioni` | manual-source-limit-review | /convocazioni richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/convocazioni/demo-consiglio-comunale-v0` | manual-source-limit-review | /convocazioni/demo-consiglio-comunale-v0 richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/contratti` | manual-source-limit-review | /contratti richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/pnrr` | manual-source-limit-review | /pnrr richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/redazione` | manual-source-limit-review | /redazione richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/fonti-dati` | manual-source-limit-review | /fonti-dati richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/metodologia` | manual-source-limit-review | /metodologia richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| P1 | `/note-legali` | manual-source-limit-review | /note-legali richiede revisione umana di fonti, limiti, stato verifica e copy prudente. | Confermare in review che la pagina non usa claim definitivi o accusatori. |
| INFO | — | spa-redirects-present | Fallback SPA _redirects presente. | Nessuna azione. |
| INFO | — | healthz-static-marker | healthz.json presente come marker statico con limiti espliciti. | Nessuna azione. |
| P2 | — | data-operations-reviewed | Convocazioni.tsx usa 19 operazioni su liste: verificare che input non normalizzati non producano error boundary. | Mantenere fallback/normalizzazione e test di render. |
| P2 | — | data-operations-reviewed | Contracts.tsx usa 30 operazioni su liste: verificare che input non normalizzati non producano error boundary. | Mantenere fallback/normalizzazione e test di render. |
| P2 | — | data-operations-reviewed | Pnrr.tsx usa 30 operazioni su liste: verificare che input non normalizzati non producano error boundary. | Mantenere fallback/normalizzazione e test di render. |
| P2 | — | data-operations-reviewed | Home.tsx usa 38 operazioni su liste: verificare che input non normalizzati non producano error boundary. | Mantenere fallback/normalizzazione e test di render. |
| INFO | — | no-live-dependencies | Il detector legge solo file versionati locali e non richiede backend, segreti, provider o servizi esterni. | Eseguibile in CI senza costi. |

## Politiche v0 registrate

- **Error boundary:** ammesso come safety net; una route critica che finisce nel fallback generico è un blocco P0.
- **Dati mancanti:** una pagina pubblica deve mostrare stato vuoto prudente o messaggio di dato non disponibile/non ancora verificato/fonte non rilevata.
- **Fonti, limiti e copy:** le route con revisione umana richiesta devono preservare fonti, limiti, stato di verifica e linguaggio non accusatorio.
- **Deploy/static fallback:** _redirects e healthz.json sono controlli statici; API, worker, live data, DNS e segreti restano fuori scope v0.

## Output machine-readable

JSON: `artifacts/v0-readiness.json`
