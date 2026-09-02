# Proposte civiche — destinatario e competenza istituzionale

## Principio

Il soggetto a cui una proposta è rivolta non coincide automaticamente con l'ente che possiede la competenza giuridica o amministrativa necessaria ad attuarla.

Lamezia Trasparente mantiene quindi due dimensioni distinte:

- **destinatario documentato**: chi viene indicato nella fonte o nel record di acquisizione come destinatario della proposta;
- **competenza sostanziale**: ente o enti la cui competenza per la misura concreta è stata verificata separatamente.

La prima dimensione è pubblicabile nella vista cittadino. La seconda resta nel backend/audit finché non è sostenuta da una base verificabile.

## Vista cittadino

Nel dossier viene mostrata una sola informazione semplice:

**A chi è rivolta**

Il valore deriva da `institutionalRecipient`, con una normalizzazione puramente di presentazione che può rimuovere il dettaglio di uffici o ruoli interni dopo un trattino lungo. Il testo sorgente integrale resta conservato per audit.

Non vengono aggiunti badge, filtri o classificazioni di competenza nella vista ordinaria.

## Backend

`proposalInstitutionalCompetence.ts` mantiene:

- destinatario sorgente;
- destinatario pubblico canonico;
- stato della verifica di competenza;
- eventuale ente competente primario;
- eventuali enti coinvolti;
- fonte e nota della valutazione.

Gli stati della valutazione sono:

- `not_assessed`;
- `partially_verified`;
- `verified`.

## Regola anti-inferenza

`institutionalRecipient` non può essere copiato automaticamente in `primaryAuthority`.

Allo stesso modo, materia PA, tema, localizzazione, promotore, tipo di atto e risposta istituzionale non sono da soli sufficienti a dimostrare la competenza.

Un assessment può essere introdotto soltanto quando una fonte ufficiale, un atto amministrativo, una norma o altra evidenza istituzionale affidabile consente di sostenere l'attribuzione per la misura concreta.

## Stato iniziale

Il registry `PROPOSAL_COMPETENCE_ASSESSMENTS` è intenzionalmente vuoto al momento dell'introduzione del layer.

Questo non significa che le proposte siano prive di destinatario: tutte continuano ad avere la rappresentazione pubblica del destinatario documentato. Significa soltanto che il dataset non trasforma ancora tali destinatari in affermazioni sulla competenza sostanziale senza una verifica dedicata.

## Scouting futuro

Per ogni nuova proposta o revisione di una proposta esistente:

1. acquisire il destinatario dichiarato dalla fonte;
2. normalizzarlo soltanto per la presentazione pubblica;
3. non inferire la competenza;
4. cercare una base ufficiale quando la competenza è rilevante per interpretare il seguito della proposta;
5. registrare l'assessment solo quando verificabile;
6. distinguere ente competente da enti coinvolti;
7. conservare la fonte e la nota di verifica.

## Relazione con gli altri layer

La catena resta:

`fonte → record di acquisizione → standard canonico → materia PA → destinatario → competenza verificata (se disponibile) → geografia → percorso istituzionale → vista cittadino`.

La complessità dei layer di competenza, semantica e percorso non deve essere manifestata nella UI ordinaria se non produce informazione utile al cittadino.
