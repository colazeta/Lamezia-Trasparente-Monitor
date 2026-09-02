# Proposte civiche — destinatario e competenza istituzionale

## Principio

Il destinatario di una proposta non coincide automaticamente con l'ente che possiede la competenza necessaria ad attuarla.

Lamezia Trasparente mantiene quindi due dimensioni distinte:

- **destinatario documentato**: chi è indicato nella fonte o nel record di acquisizione;
- **competenza sostanziale**: ente o enti la cui competenza per la misura concreta è stata verificata separatamente.

## Vista cittadino

Nel dossier viene mostrata soltanto la voce **A chi è rivolta**. Il valore deriva da `institutionalRecipient` con una normalizzazione puramente di presentazione. Il testo sorgente integrale resta conservato per audit.

Non vengono aggiunti filtri o badge di competenza nella vista ordinaria.

## Backend

`proposalInstitutionalCompetence.ts` mantiene destinatario sorgente, destinatario pubblico canonico, stato della verifica, eventuale autorità primaria, eventuali enti coinvolti, fonti e nota metodologica.

Gli stati sono:

- `not_assessed`: nessuna attribuzione viene inferita;
- `partially_verified`: la proposta attraversa più leve o l'attribuzione è verificata solo per alcune componenti;
- `verified`: la misura censita ha un'autorità sostanziale sufficientemente chiara e documentata.

`not_assessed` è uno stato legittimo e non deve essere eliminato per semplice completezza del dataset.

## Regola anti-inferenza

`institutionalRecipient` non può essere copiato automaticamente in `primaryAuthority`. Materia, tema, localizzazione, promotore, canale o tipo di atto non sono da soli prova della competenza.

Un assessment può essere aggiunto soltanto quando una fonte ufficiale, un atto amministrativo, una norma o altra evidenza istituzionale affidabile sostiene l'attribuzione per la misura concreta.

## Prima popolazione selettiva

Il registry contiene assessment solo per casi ad alto valore interpretativo e con fonti istituzionali adeguate:

- emodinamica H24;
- organici e continuità chirurgica del Giovanni Paolo II;
- posticipo generale dell'apertura scolastica;
- orario scolastico ridotto per il caldo;
- aeroporto e intermodalità;
- Piazza Italia e sicurezza urbana;
- asili nido comunali;
- Progetti di Vita.

Le fonti comprendono Regione Calabria, ASP Catanzaro, Comune di Lamezia Terme, Prefettura di Catanzaro e SACAL. Ogni autorità conserva nel dato il proprio riferimento verificabile.

Le altre proposte restano `not_assessed` finché non emerge una ragione concreta e documentata per ricostruirne la competenza.

## Scouting

Per ogni nuova proposta:

1. acquisire il destinatario dichiarato;
2. normalizzarlo soltanto per la presentazione pubblica;
3. non inferire la competenza;
4. cercare una base ufficiale quando la competenza è rilevante;
5. registrare l'assessment solo quando sostenuto;
6. distinguere autorità primaria da enti coinvolti;
7. conservare fonte e nota di verifica;
8. mantenere `not_assessed` quando la ricostruzione non è sufficientemente solida.

## Catena dati

`fonte → record di acquisizione → standard canonico → materia PA → destinatario → competenza verificata (se disponibile) → geografia → percorso istituzionale → vista cittadino`.

La complessità del backend non deve essere manifestata nella UI ordinaria se non produce informazione utile al cittadino.
