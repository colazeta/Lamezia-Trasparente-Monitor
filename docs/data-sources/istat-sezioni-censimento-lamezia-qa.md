# QA ISTAT sezioni censuarie - Lamezia Terme

Data controllo: 2026-06-20.
Aggiornamento audit pubblico: 2026-06-26.
Aggiornamento indicatori: 2026-06-29.
Aggiornamento rapporti e densita': 2026-07-04.

## File controllati

- GeoJSON processato: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`.
- Metadati: `data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json`.
- Dizionario indicatori: `data/processed/territorio/istat_indicator_dictionary.json`.

## Sintesi

- Sezioni censuarie ISTAT di Lamezia Terme nel GeoJSON pubblico: 317.
- Sezioni con valore `P1` / popolazione residente disponibile: 246, pari al 77,60%.
- Sezioni con valore indicatore `null`: 71, pari al 22,40%.
- Sezioni con `P1` uguale a zero reale: 22. Questi valori restano `0` e non vanno confusi con `null`.
- Popolazione totale sommata sulle sole sezioni con `P1` disponibile: 67.240 residenti.
- Tutte le feature mantengono `istat_municipal_code` uguale a `079160`.
- Tutte le geometrie sono `Polygon`; il controllo tecnico non rileva anelli aperti, coordinate non finite o geometrie mancanti.
- Il dizionario indicatori abilita 15 indicatori pubblici ricavati da campi verificati nel tracciato ufficiale ISTAT 2023 o dalla geometria ISTAT per la sola densita' cartografica. Percentuali e rapporti restano `null` quando il denominatore e' zero, nullo o mancante.

## Null, missing e zero

Nel file processato la differenza e' intenzionale:

- `null`: la sezione ha geometria ufficiale ISTAT, ma non ha un valore 2023 agganciato per l'indicatore pubblicato. Nel frontend deve apparire come "dato non disponibile".
- missing: il campo atteso non esiste nel contratto dati. Questa condizione deve essere trattata come errore di struttura o indicatore non attivabile.
- `0`: il valore e' presente e pari a zero. Nel frontend deve apparire come `0`, non come dato assente.

Per l'indicatore pubblico `popolazione-residente`, i campi controllati sono `indicators_istat_2023.p1` e `indicators_istat_2023.popolazione_totale`. Per gli indicatori percentuali e di rapporto, `null` puo' derivare anche da denominatore pari a zero: in quel caso il numeratore puo' essere presente, ma la quota o il rapporto non vengono calcolati.

## Audit 2021/2023 delle 71 sezioni null

Il controllo pubblico confronta due passaggi distinti della materializzazione:

- base geometrica ISTAT 2021 filtrata sul Comune di Lamezia Terme (`istat_municipal_code: 079160`): 317 sezioni censuarie ufficiali;
- join con le variabili ISTAT 2023 per sezione: 246 sezioni con `matched_istat_2023_variables: true` e valore `P1` disponibile, 71 sezioni con `matched_istat_2023_variables: false` e valore `P1` mantenuto a `null`.

Le 71 sezioni null non sono rimosse dal layer perche' la loro geometria censuaria 2021 resta ufficiale e utile alla lettura territoriale. La mancanza riguarda il valore 2023 agganciato all'indicatore, non la presenza della geometria. Nel GeoJSON pubblico queste sezioni mantengono:

- identificativo di sezione censuaria ISTAT;
- codice comunale ISTAT `079160`;
- geometria `Polygon` valida per il rendering web;
- campi indicatore `p1` / `popolazione_totale` pari a `null`.

Questo audit non attribuisce una causa ai null. Dal solo output pubblico non si puo' stabilire se la mancata corrispondenza derivi da differenze di tracciato, aggiornamenti territoriali, modalita' di pubblicazione delle variabili 2023 o altre scelte statistiche ufficiali. Ogni causa dovra' essere verificata sui file raw ISTAT e, se necessario, con documentazione metodologica ISTAT.

Le 22 sezioni con `P1 = 0` sono un caso diverso: hanno un valore numerico presente e pari a zero. Nel frontend devono apparire come `0`, mentre le 71 sezioni null devono apparire come "dato non disponibile". Null non significa zero.

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

Le sezioni fittizie con codici del tipo `888888x` e `999999x` non sono presenti nel GeoJSON pubblico. I metadati registrano una geometria fittizia esclusa e una riga fittizia intercettata tra le variabili 2023, entrambe non portate nell'output predefinito.

## Separazione da layer non censuari

Il GeoJSON ISTAT controllato non contiene proprieta' o riferimenti a Zornade, catasto, OMI, CAP, IRPEF o altre basi non censuarie. La base pubblica dell'Atlante resta la sezione di censimento ISTAT. Eventuali layer accessori/non censuari devono restare separati e non possono essere usati per indicatori censuari ISTAT.

## Stato indicatori

Indicatori abilitati nel dizionario pubblico:

- `popolazione-residente`: campo ISTAT `P1`, campo pubblico `popolazione_totale`, unita' `persone`, 246 valori disponibili e 71 `null`.
- `residenti-per-kmq`: formula `P1 / superficie_kmq`, campo pubblico `residenti_per_kmq`, unita' `residenti/kmq`, 246 valori disponibili e 71 `null`. La superficie e' calcolata dalla geometria ISTAT per lettura cartografica web, non da fonti catastali.
- `quota-0-14`: formula `(P14 + P15 + P16) / P1 * 100`, campo pubblico `quota_0_14`, unita' `percentuale`, 224 valori disponibili e 93 `null`.
- `quota-anziani`: formula `(P27 + P28 + P29) / P1 * 100`, campo pubblico `quota_65_piu`, unita' `percentuale`, 224 valori disponibili e 93 `null`.
- `quota-stranieri`: formula `ST1 / P1 * 100`, campo pubblico `quota_stranieri`, unita' `percentuale`, 224 valori disponibili e 93 `null`.
- `famiglie`: campo ISTAT `PF1`, campo pubblico `famiglie_totale`, unita' `famiglie`, 246 valori disponibili e 71 `null`.
- `residenti-per-famiglia`: formula `P1 / PF1`, campo pubblico `residenti_per_famiglia`, unita' `residenti/famiglia`, 221 valori disponibili e 96 `null`.
- `famiglie-per-100-residenti`: formula `PF1 / P1 * 100`, campo pubblico `famiglie_per_100_residenti`, unita' `per 100 residenti`, 224 valori disponibili e 93 `null`.
- `abitazioni`: campo ISTAT `A8`, campo pubblico `abitazioni_totali`, unita' `abitazioni`, 246 valori disponibili e 71 `null`.
- `abitazioni-per-100-famiglie`: formula `A8 / PF1 * 100`, campo pubblico `abitazioni_per_100_famiglie`, unita' `per 100 famiglie`, 221 valori disponibili e 96 `null`.
- `automobili`: campo ISTAT `NA1`, campo pubblico `automobili_totale`, unita' `automobili`, 246 valori disponibili e 71 `null`.
- `auto-per-100-residenti`: formula `NA1 / P1 * 100`, campo pubblico `auto_per_100_residenti`, unita' `per 100 residenti`, 224 valori disponibili e 93 `null`.
- `quota-titoli-terziari`: formula `P90 / P83 * 100`, campo pubblico `quota_titoli_terziari`, unita' `percentuale`, 224 valori disponibili e 93 `null`.
- `occupati-15-64`: campo ISTAT `P101`, campo pubblico `occupati_15_64`, unita' `persone`, 246 valori disponibili e 71 `null`.
- `occupati-15-64-per-100-residenti`: formula `P101 / P1 * 100`, campo pubblico `occupati_15_64_per_100_residenti`, unita' `per 100 residenti`, 224 valori disponibili e 93 `null`. Non e' un tasso di occupazione perche' il denominatore e' la popolazione totale, non la popolazione 15-64.

Il candidato `quota-minori` resta disabilitato: il tracciato ISTAT 2023 usato espone classi quinquennali e non isola la fascia 15-17 anni, quindi una quota minori `<18` non e' materializzata. La quota pubblicata come sicura e' `quota-0-14`.

## Esito per rendering web

Il file e' leggero per l'uso frontend e contiene 317 feature, tutte con geometria presente. Il controllo di base per rendering SVG ha verificato coordinate finite e anelli chiusi su 366 anelli complessivi. Questo non sostituisce una validazione GIS topologica completa, ma e' sufficiente come gate tecnico per la mappa pubblica gia' generalizzata.
