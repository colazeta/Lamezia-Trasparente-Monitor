---
name: Codex-ready task
description: Prepare a narrow, reviewable task that can be delegated to Codex safely.
title: "[Codex-ready] "
labels: ["codex:candidate"]
assignees: []
---

## Categoria

<!-- technical / UI-accessibility / civic-methodological / copy-legal-tone / data-API / backlog-governance -->

## Contesto

<!-- Explain the current state and why this issue matters. Keep it factual and repository-grounded. -->

## Obiettivo

<!-- Define the precise outcome expected from this issue. -->

## /goal per Codex

<!-- Write the exact goal that should be pasted or used for Codex. Keep it narrow and materializable. -->

```text
/goal
Implement this issue as a small, reviewable PR targeting main.
Preserve civic safeguards, run the expected checks, and include a Materialization section with PR URL, PR number, branch, full commit SHA and issue linkage.
```

## Ambito incluso

- 

## Ambito escluso

- 

## Criteri di accettazione

- [ ] 
- [ ] 
- [ ] 

## File o moduli probabilmente coinvolti

- 

## Validazione attesa

- [ ] `pnpm run typecheck`
- [ ] `pnpm run build`
- [ ] Other package-specific check: 

## Cautele civiche/metodologiche/legal-copy

- [ ] The change does not imply wrongdoing, corruption, favouritism or individual responsibility.
- [ ] Indicators remain framed as signals for transparency and verification, not as evidence of misconduct.
- [ ] Source limitations and methodological caveats are preserved or improved.
- [ ] Public-facing copy remains cautious, factual and non-accusatory.

## Source/limitations metadata

<!-- Complete this when the issue touches civic content, source logic, data, methodology, dossiers or public-facing claims. -->

- [ ] Not applicable: no civic source/content/data/methodology touched.
- [ ] Applicable: source URL/type, retrieval or update logic, verification status, limitations and human-review need must be documented in the PR.

## Zero-cost automation guardrail

- [ ] No larger runners, GPU runners, self-hosted paid runners, Codespaces prebuilds or paid external services are required.
- [ ] Any GitHub Actions workflow introduced or changed must use `runs-on: ubuntu-latest`.
- [ ] No high-frequency schedule is required.

## Stop condition

<!-- When should Codex stop and ask for human review instead of implementing? -->

## Note per Codex

<!-- Optional: add constraints, preferred approach, or areas to avoid. -->
