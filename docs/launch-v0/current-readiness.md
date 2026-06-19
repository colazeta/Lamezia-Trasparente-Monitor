# V0 readiness corrente

Generato: 2026-06-17T04:19:48.930Z

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
| `/` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/convocazioni` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/contratti` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/pnrr` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/redazione` | riservata | LIMITED | routing/static presence: PASS<br>reserved preview fallback: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/healthz.json` | static-marker | PASS | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: PASS |
| `/fonti-dati` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/metodologia` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |
| `/note-legali` | pubblicabile | LIMITED | routing/static presence: PASS<br>error-boundary policy documented: PASS<br>source/limits human review: MANUAL<br>UX/copy QA: public label clarity: MANUAL<br>UX/copy QA: v0 state communication: MANUAL<br>UX/copy QA: source/limit note: MANUAL<br>UX/copy QA: non-misleading CTA: MANUAL<br>UX/copy QA: missing-data language: MANUAL<br>UX/copy QA: cautious-copy guardrails: MANUAL |

## Issue e azioni consigliate

| Severità | Route | Codice | Evidenza | Azione |
| --- | --- | --- | --- | --- |
| P1 | `/` | manual-ux-copy-qa | / richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/convocazioni` | manual-ux-copy-qa | /convocazioni richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/convocazioni/demo-consiglio-comunale-v0` | manual-ux-copy-qa | /convocazioni/demo-consiglio-comunale-v0 richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/contratti` | manual-ux-copy-qa | /contratti richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/pnrr` | manual-ux-copy-qa | /pnrr richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/redazione` | manual-ux-copy-qa | /redazione richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/fonti-dati` | manual-ux-copy-qa | /fonti-dati richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/metodologia` | manual-ux-copy-qa | /metodologia richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
| P1 | `/note-legali` | manual-ux-copy-qa | /note-legali richiede gate QA UX/copy: label pubblica, stato v0, fonte/limiti, CTA, dati mancanti e guardrail cauti. | Compilare docs/launch-v0/ux-copy-qa-gate.md per la route e correggere copy fuorviante o accusatorio prima della pubblicazione. |
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
- **Gate QA UX/copy:** compilare `docs/launch-v0/ux-copy-qa-gate.md` per label pubblica chiara, stato v0, nota fonti/limiti, CTA non fuorviante, linguaggio sui dati mancanti e guardrail cauti.
- **Deploy/static fallback:** _redirects e healthz.json sono controlli statici; API, worker, live data, DNS e segreti restano fuori scope v0.

## Output machine-readable

JSON: `artifacts/v0-readiness.json`

Checklist QA UX/copy: `docs/launch-v0/ux-copy-qa-gate.md`
