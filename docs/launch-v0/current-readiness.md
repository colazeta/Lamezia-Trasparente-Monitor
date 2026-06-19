# V0 readiness corrente

Generato: 2026-06-17T04:20:23.896Z

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
| `/` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/convocazioni` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/contratti` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/pnrr` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/redazione` | riservata | LIMITED | routing/static presence: PASS<br>reserved preview fallback: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/healthz.json` | static-marker | PASS | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: PASS<br>UX/copy QA gate: PASS |
| `/fonti-dati` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/metodologia` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |
| `/note-legali` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA gate: MANUAL |

## Issue e azioni consigliate

| Severità | Route | Codice | Evidenza | Azione |
| --- | --- | --- | --- | --- |
| P1 | `/` | ux-copy-human-review | / richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/convocazioni` | ux-copy-human-review | /convocazioni richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/convocazioni/demo-consiglio-comunale-v0` | ux-copy-human-review | /convocazioni/demo-consiglio-comunale-v0 richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/contratti` | ux-copy-human-review | /contratti richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/pnrr` | ux-copy-human-review | /pnrr richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/redazione` | ux-copy-human-review | /redazione richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/fonti-dati` | ux-copy-human-review | /fonti-dati richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/metodologia` | ux-copy-human-review | /metodologia richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
| P1 | `/note-legali` | ux-copy-human-review | /note-legali richiede QA UX/copy: label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti. | Eseguire docs/launch-v0/ux-copy-qa-gate.md e registrare eventuali follow-up puntuali. |
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
- **QA UX/copy:** per ogni route con revisione umana eseguire docs/launch-v0/ux-copy-qa-gate.md su label pubblica, stato v0, fonti/limiti, CTA, dati mancanti e guardrail cauti.
- **Deploy/static fallback:** _redirects e healthz.json sono controlli statici; API, worker, live data, DNS e segreti restano fuori scope v0.

## Output machine-readable

JSON: `artifacts/v0-readiness.json`
