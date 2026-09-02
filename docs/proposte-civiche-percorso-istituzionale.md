# Proposte civiche — percorso istituzionale e vista cittadino

## Principio

Il percorso di una proposta civica deve essere modellato con granularità nel backend ma presentato in forma sintetica al cittadino.

La regola è:

- **backend**: eventi, stato tecnico, stadio di avanzamento, fonti e ruoli documentali;
- **frontend ordinario**: un solo stato sintetico e neutrale;
- **dossier**: ultimo sviluppo e cronologia documentata;
- **audit**: stato tecnico, mapping e metadati completi.

La UI non deve esporre la complessità del modello solo perché essa è disponibile nel dato.

## Stadi backend

Il modello supporta questa progressione:

1. `emersa`
2. `formalizzata`
3. `calendarizzata`
4. `discussa`
5. `risposta_ricevuta`
6. `recepita`
7. `attuazione_avviata`
8. `attuata`

Gli stadi sono derivati conservativamente dagli eventi documentati e dallo stato tecnico già presente nel record.

### Attuazione

`recepita` non significa `attuata`.

L'attuazione non viene mai inferita automaticamente da:

- una risposta istituzionale;
- una discussione;
- un recepimento;
- un atto amministrativo genericamente collegato;
- un progetto o finanziamento già esistente.

Per entrare in `attuazione_avviata` o `attuata` deve esistere una evidenza dedicata e revisionata nel registro `PROPOSAL_IMPLEMENTATION_EVIDENCE`, collegata a una fonte verificabile. Il registro resta vuoto finché questa soglia non è soddisfatta.

## Stati pubblici

La vista cittadino usa un vocabolario deliberatamente più piccolo:

- **Segnalata**: la proposta è documentata come emersa pubblicamente;
- **Presentata formalmente**: è documentato un deposito, una petizione o un'altra formalizzazione;
- **Ha avuto seguito**: è documentata almeno una calendarizzazione, discussione, risposta, recepimento o altro seguito istituzionale sostanziale;
- **In attuazione**: esiste evidenza attuativa esplicita secondo la soglia sopra descritta;
- **Nessun seguito noto**: lo stato tecnico lo documenta esplicitamente;
- **Da verificare**: le fonti non consentono una classificazione sufficientemente solida.

Il filtro pubblico mostra soltanto gli stati effettivamente presenti nei record correnti.

## Evidenze documentali

Il backend normalizza le fonti secondo ruoli distinti:

- `origine`
- `formalizzazione`
- `calendarizzazione`
- `discussione`
- `risposta_istituzionale`
- `recepimento`
- `aggiornamento`
- `atto_collegato`

Questa classificazione serve per audit e analisi. Non deve diventare una fila di badge nella card pubblica.

## Presentazione

### Card chiusa

Mostra soltanto:

- stato pubblico sintetico;
- materia primaria;
- geografia sintetica;
- titolo canonico;
- richiesta principale;
- promotore;
- data;
- ultimo sviluppo.

### Dossier aperto

Mostra:

- cosa chiede;
- metadati essenziali;
- territorio;
- una riga compatta sul percorso istituzionale;
- cronologia completa su richiesta;
- fonti e verifica su richiesta.

### Audit

Stato tecnico, stadio backend, classificazioni secondarie, URI e facet operative rimangono in superfici richiudibili e non sono necessarie per comprendere la proposta.

## Regole di pubblicazione

Ogni nuova proposta deve:

1. essere presente nel dataset pubblico;
2. avere presentazione canonica;
3. avere materia primaria ufficiale;
4. avere metadata geografici, anche quando `citywide` senza coordinate;
5. avere uno stato istituzionale derivabile;
6. mantenere eventi e fonti coerenti con i ruoli documentali;
7. non entrare in `in_attuazione` senza evidenza attuativa dedicata.

Il test `proposalArchiveAlignment.test.ts` verifica l'allineamento del medesimo insieme di record fra dataset, canonico, semantica, geografia e percorso istituzionale.
