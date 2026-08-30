# Bilancio demografico ricostruito 2001–2018 (ISTAT RBD)

## Scopo

Estendere il pannello **Perché cambia Lamezia** oltre il perimetro 2019+ senza concatenare in modo opaco prodotti statistici metodologicamente diversi.

La fonte storica candidata è la tavola ISTAT Demo **RBD — Ricostruzione del bilancio demografico 2001–2018**. La ricostruzione comprende misure di stock e flussi demografici comunali (nascite, decessi, immigrazioni/emigrazioni interne, immigrazioni/emigrazioni con l'estero e acquisizioni della cittadinanza italiana).

Fonte pubblica: `https://demo.istat.it/app/?i=RBD&l=it`.

## Regola semantica fondamentale

Le osservazioni RBD devono essere persistite con:

- `source = ISTAT`;
- `sourceDataset = RBD`;
- `sourceStatus = reconstructed`;
- `qualityFlags` contenente `source_reconstructed`;
- frequenza `annual`;
- geografia comunale Lamezia Terme (`079160`), tenendo conto che la ricostruzione usa la classificazione territoriale ISTAT vigente nel 2019.

Non devono essere trasformate in `final` e non devono sostituire osservazioni P02 2019+.

## Cesura temporale

La ricostruzione copre tecnicamente il periodo dal 21 ottobre 2001 al 31 dicembre 2018. Per l'analisi annuale ordinaria:

- **2002–2018** può essere trattato come insieme di annualità complete ricostruite;
- **2001** va mantenuto separato o esplicitamente marcato come periodo parziale, perché parte dal 21 ottobre;
- **2019+** continua a provenire da P02/D7B e dalla contabilità demografica corrente collegata al Censimento permanente/ANPR.

La UI deve visualizzare un separatore metodologico tra 2018 e 2019 e non tracciare una singola serie senza indicazione della fonte/status.

## Invarianti di ingestione

1. Il backfill RBD è append-only e versionato nello stesso layer `demographic_series` / `demographic_releases` / `demographic_observations`.
2. Il payload sorgente o il file ufficiale utilizzato deve essere hashato e conservato nella release quando tecnicamente sostenibile.
3. Una nuova acquisizione identica non crea una nuova release.
4. I campi vengono riconosciuti semanticamente; se mancano le sei poste core (nati, morti, entrate/uscite interne, entrate/uscite estere), l'ingestione fallisce senza pubblicare una decomposizione parziale come completa.
5. Nessun valore RBD deve sovrascrivere P02 per lo stesso periodo.
6. Il frontend deve poter distinguere chiaramente `reconstructed`, `final` e `provisional`.

## Riconciliazione

Per RBD la quadratura deve essere verificata sulle poste effettivamente diffuse dalla tavola. Non va riutilizzata automaticamente la regola P02 post-2019 sull'aggiustamento statistico se il prodotto RBD non diffonde la stessa posta con lo stesso significato.

Il risultato della quadratura resta uno fra:

- `exact`;
- `partial`;
- `mismatch`.

Un residuo non deve essere assorbito artificialmente.

## Uso pubblico

Una volta validato il backfill, il pannello annuale può offrire:

- 5 anni;
- 10 anni;
- tutto il periodo disponibile;

ma la modalità “tutto” deve rendere visibile la cesura 2018/2019 e la natura ricostruita del tratto storico.

La narrativa automatica resta descrittiva: identifica la componente cumulata di maggiore ampiezza nella finestra scelta, senza produrre score o giudizi causali sulla città.

## Validazione richiesta prima dell'attivazione

- verifica manuale del contratto HTML/download corrente della tavola RBD;
- fixture reale anonimizzata/minimizzata per Lamezia Terme o per una riga comunale equivalente;
- test del mapping delle colonne;
- test del periodo parziale 2001;
- test della separazione RBD/P02;
- test della cesura metodologica esposta nell'API/UI;
- CI completa verde prima del merge.
