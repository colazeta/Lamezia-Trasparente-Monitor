# #437 — handoff materializzazione manuale

Scopo: rendere il percorso demo v0 sempre raggiungibile da `/convocazioni` e associare metadata cauti al ramo demo di `SedutaDetail`, senza introdurre dati reali, claim civici nuovi, API, workflow o deploy.

Base verificata: `main` a `ed101919b110d1db958bc61e47d9ae6e2aec183c` contiene già il pannello v0 prudente di #434 e il fallback demo condizionato in `Convocazioni.tsx`.

Stato operativo:

- Codex ha risposto con usage limit sugli ultimi tentativi #437, quindi questa è recovery/manual materialization.
- Branch operativo preparato: `materialize-437-demo-link-meta`.
- Il ramo UI da modificare è limitato a:
  - `artifacts/lamezia-trasparente/src/pages/Convocazioni.tsx`
  - `artifacts/lamezia-trasparente/src/pages/SedutaDetail.tsx`

Diff minimo atteso:

1. In `Convocazioni.tsx`, importare `councilSessionV0DemoFixture` da `@/data/councilSessionV0` e aggiungere nel box “Percorso pubblico minimo v0” un link sempre visibile a `/convocazioni/${councilSessionV0DemoFixture.id}` con copy prudente tipo “Apri scheda demo v0”. Non rendere permanente il fallback card: serve solo un percorso raggiungibile.

2. In `SedutaDetail.tsx`, importare `PageMeta` da `@/components/seo/PageMeta` e, nel ramo `isDemoRoute`, renderizzare metadata dedicati e cauti prima di `CouncilSessionV0DemoDetail`:

```tsx
<>
  <PageMeta
    title="Scheda demo v0 convocazione"
    description="Fixture dimostrativa per verificare il formato minimo di una scheda seduta: fonti, limiti del dato e stato di verifica. Non rappresenta una convocazione reale."
    path={`/convocazioni/${councilSessionV0DemoFixture.id}`}
    type="article"
  />
  <CouncilSessionV0DemoDetail />
</>
```

Criteri di accettazione:

- PR draft, non ready-for-review.
- Nessun merge automatico.
- Nessun cambio a API, DB, generated client, workflow, deploy, dati reali o copy legale oltre il testo cauto sopra.
- CI verde prima di classificare `ready-for-human-merge`.
