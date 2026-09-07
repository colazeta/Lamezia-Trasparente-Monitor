# Collegamento del login del proprietario

Specifica per l'issue #1106, prima dell'implementazione.

Il proprietario ha fornito la chiave pubblicabile dell'istanza Clerk `square-mouse-354.clerk.accounts.dev` e dichiarato di aver inserito la chiave segreta direttamente su Render. La chiave pubblicabile è configurazione pubblica; la chiave segreta resta esclusivamente sul server.

Il sito canonico `https://lamezia-trasparente.pages.dev` deve poter mostrare il login già implementato anche quando il build nativo Pages non riceve le variabili GitHub. Una configurazione pubblica versionata associa esclusivamente questa origine alla chiave Clerk e all'origine API Render verificata. Le variabili esplicite del build mantengono la precedenza. Preview, localhost e altri domini non ereditano la configurazione. Il percorso della console usa l'API Render; la configurazione globale delle API pubbliche non cambia.

Non si modifica l'autorizzazione: l'ID immutabile del proprietario e l'origine verificata restano controlli server obbligatori. Il primo login serve a creare l'utente Clerk; finché il relativo ID non è associato a DATABASE_ADMIN_USER_ID, il catalogo resta indisponibile. Nessun primo utente è promosso automaticamente ad amministratore.

Questa istanza è Development: l'esito costituisce collaudo del login, non completamento della configurazione Clerk di produzione. Il passaggio a produzione richiede chiavi della relativa istanza, configurazione del dominio e nuova verifica dell'identità del proprietario.

Validazione prevista: isolamento della configurazione per origine, precedenza delle variabili esistenti, test dell'area admin e dell'autorizzazione, typecheck/build e CI ordinaria. Dopo il deploy si verifica la presenza della chiave pubblicabile nel bundle e il rifiuto delle richieste anonime all'API. La sessione personale deve essere verificata dal proprietario.
