# Issue #47 — public route accessibility and metadata audit

This checklist records the low-risk audit performed for issue #47. The audit intentionally avoids router, navigation, sitemap, footer and command-palette changes while PR #65 is open.

## Audit criteria

For each public route, the review checked:

- one visible page-level `h1` in the routed page;
- coherent heading order for visible sections;
- route-specific metadata through `PageMeta` in the page or the existing route wrapper;
- descriptive link or button text, including icon-only actions;
- absence of visible placeholder links using `href="#"`;
- decorative icon treatment with `aria-hidden="true"` where targeted fixes were safe and isolated.

## Public route inventory

| Route                    | Metadata coverage                                 | Notes                                                                                          |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                      | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/domande`               | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/guida`                 | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/temi`                  | Existing route wrapper                            | Added decorative icon hiding in the empty-state actions.                                       |
| `/temi/:id`              | Detail route without a dedicated metadata wrapper | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/contratti`             | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/contratti/:id`         | Detail route without a dedicated metadata wrapper | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/incarichimetro`        | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/albo`                  | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/albo/:id`              | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/atti-fondamentali`     | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/bandi`                 | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/bandi/:slug`           | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/beni-confiscati`       | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/beni-confiscati/:slug` | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/accesso-civico`        | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/monitoraggio`          | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/monitoraggio/nuovo`    | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/monitoraggio/:id`      | Detail route without a dedicated metadata wrapper | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/legalita`              | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/delibere`              | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/convocazioni`          | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/convocazioni/:id`      | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/organi`                | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/organi/:slug`          | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/amministratori`        | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/amministratori/:id`    | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/pnrr`                  | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/opendata`              | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/opendata/:id`          | Detail route without a dedicated metadata wrapper | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/feeds`                 | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/sviluppatori`          | Existing route wrapper                            | Added decorative icon hiding for copy/open/API cards and inline status icons.                  |
| `/performance`           | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/performance/confronta` | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/performance/:id`       | Detail route without a dedicated metadata wrapper | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/pareri`                | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/pareri/:id`            | Dynamic detail route                              | Checked as a public detail route; no metadata change applied to avoid broad detail-page churn. |
| `/segnalazioni`          | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/statistiche`           | Existing route wrapper                            | Added decorative icon hiding to metric/card labels.                                            |
| `/fonti-dati`            | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/metodologia`           | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/note-legali`           | Page-level `PageMeta`                             | Checked headings, links and decorative icons.                                                  |
| `/chi-siamo`             | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/contatti`              | Existing route wrapper                            | Checked headings, links and decorative icons.                                                  |
| `/iscrizioni`            | Existing route wrapper                            | Added decorative icon hiding around the form and confirmation state.                           |
| fallback 404             | Fallback route                                    | Added decorative icon hiding to 404 actions.                                                   |

## Residual limits

- The audit did not edit router, navigation, sitemap, footer or command-palette files because of the active PR #65 collision guard.
- Dynamic detail routes that do not already own metadata were noted but left unchanged unless a safe local fix was obvious; adding broad dynamic metadata is better handled in a separate detail-route task.
- No civic, legal or methodology copy was changed.
