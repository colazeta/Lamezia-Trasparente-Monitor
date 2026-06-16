# Contratto route v0

Questo contratto descrive le route minime da verificare prima della pubblicazione v0. Il detector non usa scraping, servizi live, backend, worker, provider, DNS o segreti: legge solo file versionati e l'artefatto statico locale quando presente.

## Stati ammessi

- `pubblicabile`: route pubblica che può essere esposta se renderizza, dichiara limiti/fonte quando richiesto e non cade nel fallback generico.
- `sperimentale`: route dimostrativa o con fixture; deve essere marcata come sperimentale e non deve sembrare definitiva.
- `in-preparazione`: route prevista ma non ancora pronta per comunicazione pubblica.
- `riservata`: route non ordinaria per il pubblico, ad esempio redazione o amministrazione.
- `static-marker`: file statico di supporto, non pagina civica.

## Policy v0

- L'error boundary resta una safety net, non un esito accettabile per route critiche.
- Una route `v0Critical` con `mustNotErrorBoundary` che finisce nel fallback generico produce `NO_GO`.
- Una route sperimentale servita solo dal fallback produce almeno una limitazione da dichiarare se è visibile nella navigazione principale.
- Dati mancanti devono essere trattati con empty state prudente: dato non disponibile, non ancora verificato o fonte non rilevata.
- Indicatori, pattern e segnali non devono essere formulati come accuse o prove di responsabilità.
- API, worker e live data possono non essere attivi nella v0 statica, purché il limite sia dichiarato.

La versione machine-readable del contratto è `docs/launch-v0/v0-routes.json`.
