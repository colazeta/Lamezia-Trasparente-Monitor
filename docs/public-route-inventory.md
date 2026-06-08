# Inventario route pubbliche indicizzabili

Issue di riferimento: #93.

Questo documento accompagna la sorgente tipizzata `PUBLIC_INDEXABLE_ROUTES` in `artifacts/lamezia-trasparente/src/data/publicRoutes.ts` e la sitemap statica `artifacts/lamezia-trasparente/public/sitemap.xml`.

## Criteri di inclusione

Una route può essere inclusa nella sitemap quando:

- è una route statica esplicitamente registrata in `artifacts/lamezia-trasparente/src/Router.tsx`;
- è una pagina pubblica del sito civico, servita nel layout principale e adatta all'indicizzazione;
- l'URL non dipende da dati runtime, parametri dinamici, input utente, autenticazione o redirect legacy.

## Criteri di esclusione

Restano escluse:

- le route dinamiche di dettaglio, per esempio `/contratti/:id`, `/bandi/:slug`, `/monitoraggio/:id`, `/performance/:id` e pattern analoghi;
- le superfici redazionali o di amministrazione, incluse `/redazione`, `/redazione/*`, `/admin` e `/admin/*`;
- route di fallback, pagine 404 e pattern non enumerabili;
- qualunque route che richieda un lavoro di generazione dinamica della sitemap, fuori dallo scope di #93.

## Route incluse nella sitemap statica

Le route incluse sono mantenute in `PUBLIC_INDEXABLE_ROUTES` e verificate dal test `public-routes-sitemap.test.ts`:

- `/`
- `/domande`
- `/temi`
- `/contratti`
- `/incarichimetro`
- `/albo`
- `/atti-fondamentali`
- `/bandi`
- `/beni-confiscati`
- `/accesso-civico`
- `/monitoraggio`
- `/monitoraggio/nuovo`
- `/promessometro`
- `/legalita/timeline`
- `/legalita`
- `/delibere`
- `/convocazioni`
- `/organi`
- `/amministratori`
- `/pnrr`
- `/opendata`
- `/feeds`
- `/sviluppatori`
- `/performance`
- `/performance/confronta`
- `/pareri`
- `/criticita-pubbliche`
- `/segnalazioni`
- `/statistiche`
- `/fonti-dati`
- `/metodologia`
- `/roadmap`
- `/note-legali`
- `/chi-siamo`
- `/contatti`
- `/iscrizioni`
- `/guida`

## Controllo minimo

Il controllo minimo confronta l'ordine e il contenuto degli URL in `public/sitemap.xml` con `PUBLIC_INDEXABLE_ROUTES`, escludendo pattern dinamici, route protette/redazionali e redirect legacy. Il controllo non genera la sitemap e non enumera detail page dinamiche.
