# Verifica del modello esistente — 4 ottobre 2026

Mandato utente: completare e verificare il modello backend (#1651, #1653).
Esito: copertura concettuale e strutturale completa del perimetro censito;
riconciliazione PNRR e Albo implementata. La migrazione universale dei dati e
la maturità per la pubblicazione rimangono **non certificate**.

## Un modello, rappresentazioni distinte

`architecture/data-domain-registry.v1.json` definisce 57 concetti civici,
ciascuno con definizione, identità e classe RDF primaria distinta. Due concetti
redazionali/applicativi restano esplicitamente fuori dai fatti civici. Le 89
tabelle di 50 moduli hanno proprietario, significato della riga e ruolo;
tutti i percorsi espliciti del sito sono censiti. Il profilo 1.3.0 aggiunge 57
shape minime alle 10 shape di compatibilità e conserva i termini preesistenti.

Gli oggetti separati includono fonte/endpoint/dataset/distribuzione/artefatto,
tentativo/stato/cambiamento, pubblicazione/versione/atto/documento,
procedura/lotto/contratto/menzione/evento finanziario, persona/ruolo/mandato/
appartenenza/voto/intervento, luogo/geometria/attestazione e identità/esito/
scelta di valore. Nessuna presenza di CIG, CUP, nome o coordinata dimostra da
sola l’identità dell’oggetto.

Ontologia, shape e `public/semantic/model-mapping.json` sono generati dal
registro. I template sotto `scripts/semantic/templates` mantengono il
vocabolario API precedente, senza reinterpretarlo. I mapping delle tabelle
indicano responsabilità concettuale; non dichiarano che ciascuna riga legacy
sia già un’istanza RDF valida della nuova classe. Le cardinalità documentano
relazioni massime; `implemented`, `partial` e `target` rimangono distinti.

## Evidenza operativa

La PR #1652 è integrata in `main` al commit
`9a7917d89a692f81c937c13b69585a5a8090585a`, con tutti i controlli GitHub
superati. Il deploy Render `dep-db10rcojo6nc73a311u0` risulta `live`.

Una query in sola lettura del database Neon di produzione dopo l’avvio ha
confermato 25 migrazioni applicate, comprese `0023` e `0024`:

| Oggetto | Record verificati |
| --- | ---: |
| Pubblicazioni canoniche | 200 |
| Versioni acquisite | 219 |
| Atti con identità qualificata | 95 |
| Risorse documentali | 132 |
| Classificazioni | 657 |
| Menzioni procurement da rivedere | 41 |
| Titoli presenti su versioni non pubblicabili | 0 |

Questi conteggi riguardano gli snapshot registrati, non l’universo degli atti
comunali. Le versioni di fonte, le alternative e gli esiti non risolti sono
conservati. Il clone di verifica ha eseguito due riconciliazioni idempotenti;
il test PostgreSQL/PGlite applica la catena completa e prova rollback reale,
FK qualificate, prove appartenenti al medesimo record e privacy.

## Verifica riproducibile

```sh
node scripts/semantic/generate-model.mjs --write
node scripts/architecture/renderConceptualCatalog.mjs --write
pnpm run architecture:audit
python scripts/semantic/validate.py
pnpm run typecheck
pnpm run build
```

Il validatore Python usa le dipendenze versionate in
`scripts/semantic/requirements.txt` e non richiede rete. Una fixture sintetica
per ogni classe primaria supera SHACL; 125 mutazioni deliberate vengono
rifiutate, oltre al difetto di provenienza sulla fixture API precedente.
La validazione riguarda gli invarianti minimi RDF, non sostituisce tutti i
vincoli SQL o la revisione editoriale. La CI verifica anche la corrispondenza
del modello generato e il test DB confronta tipi di soggetto e domini con lo
schema runtime.

## Lavoro ancora aperto

| Questione | Stato e condizione di chiusura |
| --- | --- |
| Albo e PNRR aggiornati | Acquisizioni da verificare e rinnovare sulle fonti; importare uno snapshot non lo rende attuale |
| ANAC e procurement strutturato | La fonte ha restituito HTTP 403 nell’audit; nessuna menzione sostituisce la riconciliazione ufficiale di lotti, parti e contratti |
| Demografia e altri dataset | Serie/release/osservazioni hanno modello, ma il backfill comunale/ISTAT non è integrato in `main`; le proposte esistenti richiedono riconciliazione sull’attuale schema |
| Istituzioni, beni, geografia e altri contenuti | Mapping e classi definiti; identità condivise, importazione e relazioni tipizzate dei domini legacy restano da migrare |
| Allegati binari | L’URL è una risorsa; servono hash dei byte acquisiti, proprietario e limite di ridistribuzione per ciascun allegato |
| LTCEDS pubblico | Struttura e policy esistono; nessun dato diventa pubblicabile senza le evidenze e la revisione richieste dal dominio |
| Letture canoniche e export | Provare equivalenza con API/fallback, esportare dalla proiezione governata e cessare gli scrittori legacy prima del cutover |

Le fasi aperte in `architecture/migration-plan.v1.json` restano aperte.
Definizioni e tabelle complete non sono prova di backfill, copertura delle
fonti o approvazione umana. Il mandato di maturazione del sito non può essere
considerato concluso sulla sola formalizzazione del modello.
