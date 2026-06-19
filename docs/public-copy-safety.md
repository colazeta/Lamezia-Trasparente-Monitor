# Public copy safety gate

Refs #545.

This document is the minimum public-copy and prototype-boundary gate for Lamezia Trasparente Monitor v0. It is documentation-only: it does not approve public launch, does not certify any dataset and does not replace human editorial review.

## Purpose

The v0 can be ambitious in structure while still being honest about what is active, provisional, demonstrative or missing. A visitor must never need to know the GitHub backlog to understand whether a page is showing verified civic information, a partial source view, a demo shape or an unavailable dataset.

## Non-negotiable public fields

Every public section that presents civic information, a civic claim, a dataset, a dashboard, a dossier or a demo must expose these fields near the relevant output.

| Field | Required meaning | Allowed values or wording pattern |
|---|---|---|
| Status | What the visitor is seeing now. | `Prototype`, `In preparazione`, `Parziale`, `Verificato`, `Non disponibile`, `Da verificare` |
| Source | Where the information comes from. | Official source URL, document name, repository fixture, manual note, or `Fonte non ancora collegata` |
| Verification level | How far the information has been checked. | `Non verificato`, `Controllo tecnico`, `Controllo fonte`, `Revisione umana richiesta`, `Verificato su fonte indicata` |
| Last update | When the page, snapshot or source check was last updated. | Date, commit, source timestamp, or `Ultimo aggiornamento non disponibile` |
| Known limits | What the section does not prove or does not yet cover. | Short human-readable limitation, not a vague disclaimer |
| Data state | Whether the data is demo, partial or verified. | `Dato demo`, `Dato parziale`, `Dato verificato`, `Dato assente`, `Dato in attesa di fonte` |

An output that lacks one of these fields is not publishable as civic information. It can remain internal, draft, demo-only or behind a human gate.

## PrototypeNotice copy pattern

Use a compact block before or next to the relevant public output.

```txt
Stato: Prototipo / Parziale / Verificato / Da verificare
Fonte: [nome fonte o link] / Fonte non ancora collegata
Verifica: Non verificato / Controllo tecnico / Verificato su fonte indicata
Ultimo aggiornamento: [data o commit] / Non disponibile
Limiti noti: [cosa manca, cosa non si può dedurre]
Tipo di dato: Demo / Parziale / Verificato / Assente
```

The block may become a component named `PrototypeNotice`, `SectionStatusNotice` or equivalent. The name is less important than the invariant: all six fields must remain visible.

## Safe wording

Use evidence-bounded language.

Prefer:

- “Questa sezione ricostruisce, sulla base delle fonti disponibili…”
- “Il dato è parziale e va verificato rispetto alla fonte ufficiale aggiornata…”
- “Il prototipo mostra come l’informazione potrebbe essere resa navigabile…”
- “La fonte consultata non espone ancora tutti i campi necessari per una lettura completa…”
- “Questo indicatore segnala un tema da approfondire, non una responsabilità accertata…”

Avoid:

- “Questa sezione dimostra che…”
- “Il Comune non ha fatto…”
- “Le imprese sono opache…”
- “È evidente che…”
- “Sistema completo”, “archivio ufficiale”, “dato definitivo” or equivalent claims unless supported by explicit source and verification status.

## Demo and fixture data

Demo data is allowed only when it is visibly declared. The declaration must say that the data shows the shape of the page and is not civic evidence.

Minimum wording:

> Dato demo: questi contenuti servono a mostrare la struttura della sezione. Non sono informazioni civiche verificate e non devono essere usati per valutazioni pubbliche.

Fixture data must not use real names, real companies, real personal details or real allegations unless the source and verification status are already public, linked and human-reviewed.

## Missing data and incomplete sources

Missing data is not a finding by itself. It can be shown as a civic question, not as an accusation.

Safe pattern:

> Dato mancante: la fonte consultata non espone questo campo in forma riusabile o non è ancora stata collegata al prototipo. Questo non dimostra una criticità; indica una domanda pubblica o una possibile richiesta di accesso civico.

## Section release states

Use these states consistently.

| State | Meaning | Public use |
|---|---|---|
| Prototype | Interaction or layout is being tested. | Public only with demo/limits notice. |
| In preparazione | Section exists but data/source is not ready. | Public only if it explains what is missing. |
| Parziale | Some source-backed information exists, but coverage is incomplete. | Public with source, limits and timestamp. |
| Da verificare | Information exists but needs source or human review. | Public only as question or draft signal, not as finding. |
| Verificato | Information has been checked against the stated source. | Public with source and last update. |
| Non disponibile | Data is absent, inaccessible or disabled. | Public as status/fallback, not as evidence. |

## Human gate rules

Human review is required before merge or public release when a change:

- changes public copy on legal, reputational, procurement, antimafia, social-service or named-entity topics;
- introduces or edits a civic claim;
- uses real data about people, companies, associations or public officials;
- describes missing institutional information as a possible accountability issue;
- changes the apparent maturity of the product from prototype to live product;
- removes, hides or weakens the six mandatory public fields.

Codex/materialization may proceed autonomously only for low-risk structural work that preserves these safeguards and does not add civic claims.

## PR checklist

Every PR touching public civic copy must answer:

- [ ] Does each changed public section show status?
- [ ] Does each changed public section show source?
- [ ] Does each changed public section show verification level?
- [ ] Does each changed public section show last update?
- [ ] Does each changed public section show known limits?
- [ ] Does each changed public section identify demo, partial, verified, absent or pending data?
- [ ] Are all claims evidence-bounded and non-accusatory?
- [ ] Are demo or fixture records explicitly declared?
- [ ] Is a Giovanni decision point declared when editorial/legal judgement is needed?

## Acceptance for #545

This checklist is not enough by itself to close #545. #545 is satisfied only when the public UI or an equivalent shared section pattern applies the six mandatory fields to the main v0 surfaces, and the resulting PR receives human review.
