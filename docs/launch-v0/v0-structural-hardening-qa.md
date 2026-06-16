# #515 — QA strutturale v0

Issue di riferimento: #515.

Questa nota materializza il contratto strutturale minimo della v0 e la verifica manuale delle route principali. Non introduce nuove fonti, scraping, backend, worker, provider, DNS o pubblicazione automatica. L'obiettivo è distinguere le pagine pubblicabili, sperimentali, riservate e statiche, evitando che l'error boundary pubblico diventi un flusso normale.

## Contratto route v0

La lista centrale vive in `artifacts/lamezia-trasparente/src/data/publicRoutes.ts` come `V0_PUBLIC_ROUTE_CONTRACT`. Ogni voce dichiara:

- `path`;
- `status`: `pubblicabile`, `sperimentale`, `in-preparazione`, `riservata`, `static-marker`;
- `v0Critical`;
- `expectedDataMode`: `real`, `fixture`, `manual`, `none`, `mixed`;
- `mustNotErrorBoundary`;
- `requiresSourceAndLimits`;
- `humanCheckRequired`;
- `qaResult`;
- `notes`.

## Policy error boundary

L'error boundary pubblico resta un paracadute eccezionale. Per una route con `v0Critical: true` e `mustNotErrorBoundary: true`, la comparsa del fallback “Anteprima pubblica — Questa sezione non è disponibile al momento” durante navigazione normale è un blocker P0. Le sezioni sperimentali devono dichiarare il proprio stato e non devono sembrare contenuto completo.

## Policy dati mancanti

Le route pubblicabili data-driven devono normalizzare liste e campi API prima di usare `.map`, `.filter`, `.slice` o `.length`. Quando i dati mancano o sono inattesi, la UI deve mostrare uno stato informativo prudente: dato non disponibile, fonte non ancora rilevata o verifica richiesta. La mancanza di dati reali è accettabile solo se la pagina esplicita fonte, limiti e stato di verifica.

## Tabella route → stato → risultato QA

| Route | Stato v0 | Modalità dati attesa | Risultato QA | Verifica |
| --- | --- | --- | --- | --- |
| `/` | pubblicabile | mixed | manual-check | Home raggiungibile; rimanda al percorso convocazioni e a fonti/limiti. |
| `/convocazioni` | pubblicabile | mixed | manual-check | Percorso principale v0; liste API normalizzate e fallback demo dichiarato. |
| `/convocazioni/demo-consiglio-comunale-v0` | sperimentale | fixture | manual-check | Scheda demo dichiarata come fixture, con fonti/limiti e cautele. |
| `/contratti` | pubblicabile | mixed | manual-check | Pagina data-driven con normalizzazione liste e rimandi a fonti/limiti. |
| `/pnrr` | pubblicabile | mixed | manual-check | Pagina data-driven con normalizzazione liste e copy prudente su censimenti e collegamenti. |
| `/redazione` | riservata | none | manual-check | In assenza di Clerk mostra fallback riservato dedicato; con Clerk richiede autenticazione/editore. |
| `/healthz.json` | static-marker | none | static-only | Marker statico verificato dallo smoke check v0. |
| `/fonti-dati` | pubblicabile | manual | manual-check | Presidio pubblico su fonti, aggiornamenti e limiti. |
| `/metodologia` | pubblicabile | manual | manual-check | Presidio metodologico e cautele interpretative. |
| `/note-legali` | pubblicabile | manual | manual-check | Presidio legale e limiti di riuso/interpretazione. |

## Route QA da rieseguire

Per la QA manuale post-build aprire almeno:

1. `/`
2. `/convocazioni`
3. `/convocazioni/demo-consiglio-comunale-v0`
4. `/contratti`
5. `/pnrr`
6. `/redazione`
7. `/healthz.json`
8. `/fonti-dati`
9. `/metodologia`
10. `/note-legali`

Nessuna di queste route deve mostrare l'error boundary pubblico durante navigazione normale. Eventuali route ancora non pubblicabili devono restare marcate come sperimentali, in preparazione o riservate.
