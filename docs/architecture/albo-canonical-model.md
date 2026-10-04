# Albo: identità, versioni, atti, documenti e riferimenti agli appalti

Revisione 4 ottobre 2026 — #1651. Segue il contratto architetturale esistente e
le fasi 6–8; non introduce un secondo registro di identità o una tabella EAV.

## Granularità e responsabilità

| Oggetto | Modello | Identità / evidenza |
| --- | --- | --- |
| Pubblicazione | `document_publications` | Registro qualificato e numero di pubblicazione; evento nel registro canonico |
| Versione acquisita | `document_publication_versions` | Un record di fonte, collegato a release, artefatto e byte originali; valori immutabili |
| Atto | `document_acts` | Emittente, ufficio, tipo, numero e data tutti disponibili; il titolo non è una chiave |
| Documento | `document_documents` | Risorsa documentale all'URL ufficiale, distinta dall'atto e dai byte scaricati |
| Collegamento | `document_publication_acts` / `document_publication_documents` | Evidenza appartenente allo stesso record di fonte |
| Classificazione | `taxonomy_schemes`, `taxonomy_concepts`, `taxonomy_classifications` | Schema/versione/faccetta/metodo; evidenza ed esiti di mancata classificazione espliciti |
| Riferimento procurement | `procurement_mentions` | Candidato di fonte con o senza CIG; non prova di procedura, lotto o contratto |
| Procedura / lotto / contratto / evento finanziario | Tabelle `procurement_*` tipizzate | Identità e relazioni distinte, evidenza obbligatoria; popolamento strutturato differito |

Le FK qualificate impediscono di usare, per esempio, l'identità di una persona
come pubblicazione. Il numero di pubblicazione non diventa numero di atto. La
URL del documento non prova che i byte siano stati acquisiti o autorizzati alla
ridistribuzione. Il registro `source_artifacts` conserva i byte JSON degli
snapshot; l'adattatore universale degli allegati binari resta da completare.

## Perimetro operativo

Il processo di importazione esistente riconcilia i due snapshot registrati:
`lamezia.albo.current` e `lamezia.albo.delibere`. Per ogni fonte legge la release
importata con successo più recente. Una versione precedente rimane persistita
quando cambia la fonte; la pubblicazione conserva lo stesso UUIDv7.

Ogni record riceve una versione e gli esiti per pubblicazione, atto, documento
e procurement. La mancanza di un identificatore non elimina il record. Un
atto privo della chiave qualificata rimane `insufficient_evidence`; un
riferimento procurement resta `review_required`, anche quando contiene un
CIG. L'assenza di un candidato o l'impossibilità di utilizzare contenuti
trattenuti per privacy è `not_applicable`, con ragione distinta.

La tassonomia già usata dalla proiezione web è ora condivisa nel package
`publication-standardisation`, senza cambiare le sue regole. Le classificazioni
registrano documento, rilevanza e fase; non affermano che il pagamento o la
stipula menzionati nel titolo siano avvenuti. Il risultato completo, incluse
azioni e segnali, resta nell'asserzione con provenienza. La classificazione
non ha una revisione umana implicita.

## Privacy e integrità

Il piano canonico legge soltanto il layer pubblico esistente. Oggetto, identità
di atto, documento e classificazione ricca richiedono record ufficiale a basso
rischio con attestation corrente e policy riconosciuta. Gli altri record
mantengono metadati minimi e una motivazione; i contenuti trattenuti non entrano
nel piano, nei link o nel checkpoint pubblico. Nessuna URL locale di archivio
è autorizzata dalla presenza di una URL ufficiale.

Scritture e prove avvengono nella stessa transazione, sotto lock. Gli insert
sono idempotenti; un conflitto con valori persistiti non spiegati causa
rollback, senza correggerli silenziosamente. Le classificazioni non possono
citare un concetto di un'altra faccetta o un'asserzione di un altro record.

Il checkpoint pubblico espone soltanto conteggi e versione del risolutore.
`verified` significa riconciliazione del perimetro importato: non attesta la
freschezza, completezza storica, validazione ANAC o revisione editoriale.

## Verifica riproducibile

`canonicalAlbo.integration.test.ts` esegue tutte le migrazioni su PostgreSQL
tramite PGlite, un motore isolato usato solo nei test. Importa gli snapshot reali,
esegue due riconciliazioni, modifica una versione di fonte e prova conflitto,
rollback, vincoli tipizzati, faccette e privacy. Non usa il database produttivo.

Sulla baseline di questa revisione: 219 record, 200 pubblicazioni, 95 atti,
132 documenti e 657 classificazioni. I 41 riferimenti procurement non producono
contratti canonici. I conteggi sono relativi ai file del candidato, non a un
censimento completo del Comune.

## Condizioni ancora aperte

Le fasi 6, 7 e 8 rimangono `in_progress`: schemi e crosswalk degli altri domini,
allegati binari, atti/pareri del modello legacy, riconciliazione ANAC/parti,
equivalenza delle API e cessazione degli scrittori legacy richiedono ulteriori
prove. Le letture pubbliche esistenti restano operative; questa migrazione non
certifica un'esportazione RDF universale o un cutover già compiuto.
