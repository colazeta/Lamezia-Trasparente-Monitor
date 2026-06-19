# Known Limits

## Tornate coperte

- 2025: fonti comunali e Maggioli collegate dal Comune censite; XML 2025 scaricabili e parsabili per risultati comunali, sezioni, liste e preferenze.
- 2021: pagina comunale della rinnovazione parziale censita con allegati principali. Da trattare come evento collegato alla tornata 2019.
- 2019 e precedenti: non ancora coperti da documenti comunali di risultato nei link-seme consultati.

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

## Documenti non parsabili o da QA manuale

I PDF vengono sottoposti a estrazione testo controllabile. Se non contengono testo, non viene eseguito OCR automatico senza un file QA dedicato.

## Differenze Comune / Eligendo

Non ancora confrontate. Eligendo e' censito come fonte istituzionale di validazione, ma i dati comunali non vengono sovrascritti automaticamente.

## Comparabilita' storica delle sezioni

Le sezioni non sono considerate territorialmente identiche solo perche' hanno lo stesso numero in anni diversi. Ogni collegamento geografico richiedera' campi di validita' temporale e fonte della geometria.

## Accesso civico

I dati mancanti, soprattutto per 1993-2019 e per eventuali file nativi XLS/CSV, devono essere richiesti con la bozza in `docs/accesso_civico_missing_data.md`.
