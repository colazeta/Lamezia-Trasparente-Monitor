# QA ISTAT sezioni censuarie - Lamezia Terme

Data controllo: 2026-06-20.

## File controllati

- GeoJSON processato: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`.
- Metadati: `data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json`.
- Dizionario indicatori: `data/processed/territorio/istat_indicator_dictionary.json`.

## Sintesi

- Sezioni censuarie ISTAT di Lamezia Terme nel GeoJSON pubblico: 317.
- Sezioni con valore `P1` / popolazione residente disponibile: 246, pari al 77,60%.
- Sezioni con valore indicatore `null`: 71, pari al 22,40%.
- Sezioni con `P1` uguale a zero reale: 22. Questi valori restano `0` e non vanno confusi con `null`.
- Tutte le feature mantengono `istat_municipal_code` uguale a `079160`.
- Tutte le geometrie sono `Polygon`; il controllo tecnico non rileva anelli aperti, coordinate non finite o geometrie mancanti.

## Null, missing e zero

Nel file processato la differenza e' intenzionale:

- `null`: la sezione ha geometria ufficiale ISTAT, ma non ha un valore 2023 agganciato per l'indicatore pubblicato. Nel frontend deve apparire come "dato non disponibile".
- missing: il campo atteso non esiste nel contratto dati. Questa condizione deve essere trattata come errore di struttura o indicatore non attivabile.
- `0`: il valore e' presente e pari a zero. Nel frontend deve apparire come `0`, non come dato assente.

Per l'indicatore pubblico iniziale `popolazione-residente`, i campi controllati sono `indicators_istat_2023.p1` e `indicators_istat_2023.popolazione_totale`.

## Distribuzione delle sezioni senza valore 2023

Le 71 sezioni senza valore `P1` hanno tutte:

- `matched_istat_2023_variables: false`;
- `indicators_istat_2023.p1: null`;
- `indicators_istat_2023.popolazione_totale: null`;
- geometria `Polygon`, come il resto del layer.

Non risultano concentrate in un tipo geometrico specifico, perche' tutte le geometrie del layer sono `Polygon`. Sugli id, invece, molte sezioni senza valore sono in suffissi alti della numerazione censuaria. I principali intervalli consecutivi osservati sono:

- `0791600000393`-`0791600000397` (5 sezioni);
- `0791600000403`-`0791600000406` (4 sezioni);
- `0791600000425`-`0791600000430` (6 sezioni);
- `0791600000434`-`0791600000444` (11 sezioni);
- `0791600000479`-`0791600000482` (4 sezioni);
- `0791600000484`-`0791600000489` (6 sezioni).

Questa concentrazione per id non basta, da sola, a spiegare la causa territoriale o statistica dei null. Prima di abilitare altri indicatori serve confrontare il tracciato ISTAT 2023 e, se necessario, il file raw delle variabili.

## Sezioni fittizie

Le sezioni fittizie con codici del tipo `888888x` e `999999x` non sono presenti nel GeoJSON pubblico. I metadati registrano una riga fittizia intercettata tra le variabili 2023 e non portata nell'output predefinito.

## Separazione da layer non censuari

Il GeoJSON ISTAT controllato non contiene proprieta' o riferimenti a Zornade, catasto, OMI, CAP, IRPEF o altre basi non censuarie. La base pubblica dell'Atlante resta la sezione di censimento ISTAT. Eventuali layer accessori/non censuari devono restare separati e non possono essere usati per indicatori censuari ISTAT.

## Stato indicatori

Il solo indicatore abilitato e':

- `popolazione-residente`, campo ISTAT `P1`, campo pubblico `popolazione_totale`, unita' `persone`.

I candidati `quota-minori`, `quota-anziani`, `quota-stranieri`, `famiglie`, `abitazioni`, `auto`, `istruzione` e `lavoro-occupazione` restano in preparazione nel dizionario indicatori. Non vanno abilitati finche' campo sorgente, numeratore, denominatore e caveat non sono verificati contro il tracciato ISTAT.

## Esito per rendering web

Il file e' leggero per l'uso frontend e contiene 317 feature, tutte con geometria presente. Il controllo di base per rendering SVG ha verificato coordinate finite e anelli chiusi su 366 anelli complessivi. Questo non sostituisce una validazione GIS topologica completa, ma e' sufficiente come gate tecnico per la mappa pubblica gia' generalizzata.
