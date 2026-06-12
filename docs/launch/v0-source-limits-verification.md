# v0 — fonti, limiti del dato e stato di verifica

Issue di riferimento: #361. Contesto di lancio: #341. Collegamenti operativi: MVP scheda seduta/convocazione del Consiglio comunale #359; navigazione v0 #360.

Questo documento definisce il blocco informativo minimo “Fonte e limiti” per una v0 prudente di Lamezia Trasparente Monitor. È un presidio documentale e manuale: non introduce automazioni di scraping, non sceglie nuove fonti definitive, non pubblica dati live e non sostituisce verifiche amministrative, legali o redazionali.

La v0 deve essere pubblicabile perché esplicita fonti, limiti e stati di verifica, non perché completa. Nessuna pagina deve dichiarare copertura esaustiva, aggiornamento garantito, disponibilità continuativa o SLA.

## Perimetro v0 del blocco “Fonte e limiti”

Ogni contenuto civico visibile nella v0 deve mostrare, o rimandare in modo chiaro a, un blocco “Fonte e limiti” con almeno questi campi:

| Campo | Descrizione prudente | Note operative |
| --- | --- | --- |
| Fonte consultata | Nome o percorso della fonte pubblica, del documento interno dichiarato o della fixture dimostrativa. | Non introdurre una fonte reale definitiva se non è già documentata nel perimetro del progetto. |
| Ultimo controllo | Data, e quando disponibile ora, dell'ultimo controllo manuale o della revisione del contenuto. | Se il controllo non è stato completato, usare lo stato `da verificare`. |
| Stato di verifica | Uno degli stati ammessi in questo documento. | Non usare stati liberi che possano suggerire completezza o certificazione. |
| Natura del dato | Dato reale, dato manualmente inserito o fixture dimostrativa dichiarata. | La distinzione deve essere comprensibile per un utente non esperto. |
| Limiti del dato | Che cosa non è garantito o non è stato rilevato nella fonte consultata. | Il limite va descritto come vincolo informativo, non come accusa o prova di condotta. |
| Condizione di stop | Caso in cui la pubblicazione o l'aggiornamento deve essere bloccato. | Obbligatoria per fonti essenziali o dati potenzialmente ambigui. |

## Stati ammessi

Usare solo gli stati seguenti per i contenuti v0.

| Stato | Quando usarlo | Copy consigliato |
| --- | --- | --- |
| `fonte pubblica verificata` | Il contenuto è stato confrontato manualmente con una fonte pubblica già prevista o documentata nel perimetro del progetto. | “Informazione verificata sulla fonte pubblica indicata al momento dell'ultimo controllo.” |
| `parziale` | La fonte consultata contiene solo una parte delle informazioni attese, oppure il contenuto v0 mostra solo un sottoinsieme dichiarato. | “Informazione parziale: la fonte consultata non consente di confermare tutti i dettagli.” |
| `assente nella fonte consultata` | Il dato cercato non è stato rilevato nella fonte consultata durante il controllo. | “Non rilevato nella fonte consultata al momento dell'ultimo controllo.” |
| `da verificare` | Il controllo non è stato completato, la fonte non è stata riesaminata o il collegamento tra contenuto e fonte non è ancora sufficiente. | “Dato non ancora verificato.” |
| `fixture dimostrativa dichiarata` | Il contenuto serve a mostrare il funzionamento della v0 e non deve essere interpretato come dato reale o aggiornato. | “Fixture dimostrativa: contenuto usato solo per mostrare il funzionamento della scheda.” |

Questi stati non certificano correttezza amministrativa, completezza documentale o aggiornamento continuativo. Descrivono soltanto il rapporto tra il contenuto mostrato, la fonte consultata e il controllo effettuato.

## Distinzione tra dati reali, dati manualmente inseriti e fixture

La v0 deve distinguere in modo visibile tre categorie:

- **Dati reali**: informazioni ricavate da una fonte pubblica o da un documento già previsto dal perimetro del progetto e accompagnate da fonte, ultimo controllo e limiti. Anche quando verificati, non devono essere descritti come completi o sempre aggiornati.
- **Dati manualmente inseriti**: informazioni riportate manualmente a partire da una fonte o da una revisione documentale. Devono indicare chiave di tracciabilità, ultimo controllo e motivo della scelta manuale, senza suggerire che esista una pipeline automatica.
- **Fixture dimostrative**: contenuti di esempio usati per validare layout, navigazione o comprensione. Devono essere etichettati come dimostrativi nella scheda e nel blocco “Fonte e limiti”.

Se la distinzione non è comprensibile nella UI o nel testo di accompagnamento, il contenuto non deve essere presentato come pubblicabile.

## Copy neutro per dati mancanti o non confermati

Per dati mancanti, parziali o non confermati, usare formulazioni descrittive. Evitare frasi che trasformano l'assenza del dato in una valutazione politica, amministrativa o personale.

Formulazioni ammesse:

- “Dato non rilevato nella fonte consultata al momento dell'ultimo controllo.”
- “Informazione parziale: la fonte consultata non consente di confermare tutti i dettagli.”
- “Campo in attesa di verifica manuale.”
- “Fixture dimostrativa: non rappresenta un dato ufficiale o aggiornato.”

Formulazioni da evitare:

- “Il Comune non ha pubblicato il dato.”, salvo che una verifica editoriale e legale abbia confermato esattamente questo claim e ne abbia approvato il contesto.
- “Dato mancante per inadempienza.”
- “Trasparenza assente.”
- Qualsiasi formula che attribuisca responsabilità, colpa, intenzione o qualità della gestione pubblica.

## Applicazione al default MVP #359

Il default MVP fino alla v0 è la scheda seduta/convocazione del Consiglio comunale. Per questa scheda il blocco “Fonte e limiti” deve essere presente anche quando il contenuto è demo o incompleto.

Campi minimi consigliati per la scheda #359:

| Campo scheda | Fonte/limite richiesto | Stop condition |
| --- | --- | --- |
| Titolo della seduta o convocazione | Fonte o fixture dichiarata. | Bloccare la pubblicazione se il titolo appare reale ma non ha fonte o stato `fixture dimostrativa dichiarata`. |
| Data e ora | Fonte consultata, oppure indicazione esplicita che il dato è dimostrativo o da verificare. | Bloccare se la data può essere interpretata come reale e non verificata. |
| Stato della seduta | Stato descrittivo, non giudicante. | Bloccare se lo stato suggerisce conclusioni non documentate. |
| Ordine del giorno | Fonte consultata o limite esplicito del contenuto mostrato. | Bloccare se l'elenco appare completo ma non è verificato. |
| Verbale, resoconto, streaming o registrazione | Link o indicazione prudente di assenza/non verifica. | Bloccare se un link è rotto, non pertinente o privo di contesto. |
| Ultimo controllo | Data del controllo manuale o stato `da verificare`. | Bloccare se il contenuto dichiara verifica senza data o fonte. |

Se la scheda usa fixture, il titolo, lo stato e il blocco “Fonte e limiti” devono rendere evidente che il contenuto non è un'informazione ufficiale, completa o aggiornata.

## Collegamento con la navigazione #360

La navigazione minima v0 deve portare l'utente verso il blocco “Fonte e limiti” senza nasconderlo dietro percorsi secondari. Per #360 valgono questi requisiti:

- il primo output civico deve indicare se è pubblicabile, sperimentale, in preparazione o non pronto;
- ogni CTA verso la scheda #359 deve usare testo prudente, ad esempio “Apri scheda dimostrativa” o “Consulta fonti e limiti”, non “Verifica ufficiale”; 
- le parti non pronte non devono sembrare sezioni complete;
- una pagina o sezione senza fonte, stato di verifica o limite esplicito non deve essere considerata pronta per la v0;
- la gestione 404 o fallback statico deve evitare promesse di completezza o disponibilità continuativa.

## Stop condition pre-lancio

La pubblicazione del contenuto interessato deve essere bloccata, o il contenuto deve restare marcato come non pronto, quando si verifica almeno una condizione tra queste:

1. una fonte essenziale non è identificata, non è raggiungibile o non è verificabile;
2. una fixture può essere confusa con dato reale;
3. una data, un link o uno stato operativo appare come informazione ufficiale senza fonte e ultimo controllo;
4. il testo attribuisce responsabilità, intenzioni o giudizi non documentati;
5. un link a fonte, verbale, streaming o registrazione è rotto o non pertinente;
6. il contenuto promette completezza, copertura, aggiornamento continuativo o SLA;
7. il revisore umano non riesce a distinguere dati reali, manuali e dimostrativi.

## Checklist minima prima della pubblicazione

Prima di considerare pubblicabile un contenuto v0, verificare manualmente:

- il blocco “Fonte e limiti” è presente o raggiungibile in modo evidente;
- ogni stato di verifica appartiene alla lista ammessa;
- eventuali fixture sono dichiarate come tali;
- l'ultimo controllo è indicato o lo stato è `da verificare`;
- i limiti del dato sono scritti come limiti informativi, non come accuse;
- i link principali sono pertinenti e non rotti;
- il contenuto non dichiara copertura completa, aggiornamento garantito o certificazione ufficiale;
- #359, #360 e #361 restano coerenti nel release train v0.

## Note di salvaguardia

Questo documento rafforza le cautele civic-copy/legal della v0. Non modifica UI, API, database, dati reali, privacy registry, worker, sitemap, robots o pipeline di deploy. Ogni ampliamento successivo deve restare documentato, verificabile e non accusatorio.
