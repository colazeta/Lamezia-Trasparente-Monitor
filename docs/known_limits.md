# Known Limits

## Perimetro analitico corrente

Il dataset processed completo riguarda, per scelta metodologica, solo le
comunali 2025 di Lamezia Terme (`comunali_lamezia_2025`).

Le altre tornate restano fuori dall'analisi comparativa finche' non saranno
disponibili fonti ufficiali complete e verificabili con granularita' coerente.
In questa fase non vengono avviate nuove ricerche su Eligendo, accesso civico o
fonti storiche aggiuntive.

La rinnovazione 2021 e' documentata come evento parziale collegato alla tornata
2019, ma non e' integrata come dataset comparativo processed.

## Tornate coperte

- 2025: fonti comunali e Maggioli collegate dal Comune censite; XML 2025 scaricati, parsati e trasformati in processed CSV completi per risultati comunali, sezioni, liste e preferenze.
- 2021: pagina comunale della rinnovazione parziale censita con allegati principali. Resta solo documentata come evento collegato alla tornata 2019.
- 2019 e precedenti: fuori dal perimetro analitico corrente; saranno trattati solo con fonti complete e verificabili.

## Dati sezionali disponibili

Per il 2025 sono stati individuati endpoint XML Maggioli ufficialmente collegati dalla pagina comunale:

- voti ai candidati sindaco per sezione;
- voti di lista per sezione;
- preferenze ai candidati consiglieri per lista e sezione;
- affluenza e schede per sezione, nei campi esposti dall'XML.

## Dati non ancora disponibili online nel repository

- Modelli comunali 2019 300/I-AR, 300/I-bis-AR, 301-AR, 302-305-AR o equivalenti.
- Storico completo dal 1993 al 2025 con granularita' sezionale.
- Endpoint Eligendo specifici per il confronto di ogni tornata.

Questi elementi non bloccano il dataset 2025, ma impediscono di dichiarare
completo lo storico elettorale.

## Documenti non parsabili o da QA manuale

I PDF vengono sottoposti a estrazione testo controllabile. Se non contengono testo, non viene eseguito OCR automatico senza un file QA dedicato.

## Differenze Comune / Eligendo

Non ancora confrontate per lo storico. Eligendo e' censito come fonte
istituzionale di validazione, ma in questa fase non viene esteso oltre quanto
gia' presente: il dataset analitico completo resta quello comunale/Maggioli 2025.

## Comparabilita' storica delle sezioni

Le sezioni non sono considerate territorialmente identiche solo perche' hanno lo stesso numero in anni diversi. Ogni collegamento geografico richiedera' campi di validita' temporale e fonte della geometria.

## Accesso civico

I dati mancanti, soprattutto per 1993-2019 e per eventuali file nativi XLS/CSV, devono essere richiesti con la bozza in `docs/accesso_civico_missing_data.md`.
