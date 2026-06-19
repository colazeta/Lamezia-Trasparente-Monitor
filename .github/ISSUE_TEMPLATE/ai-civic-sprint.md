---
name: AI civic sprint
description: Break down a civic idea into a source-bound, reviewable LTM task.
title: "AI civic sprint — "
labels: ["quality-enabler"]
body:
  - type: textarea
    id: civic-problem
    attributes:
      label: Civic problem
      description: What public-interest problem does this task help clarify?
    validations:
      required: true
  - type: textarea
    id: target-user
    attributes:
      label: Target user
      description: Citizen, journalist, association, administrator, editor or maintainer.
    validations:
      required: true
  - type: textarea
    id: source-evidence-map
    attributes:
      label: Source/evidence map
      description: List official sources, public sources, demo data, missing data and verification level.
    validations:
      required: true
  - type: textarea
    id: missing-data
    attributes:
      label: Missing data
      description: What cannot currently be verified or reused?
    validations:
      required: true
  - type: dropdown
    id: editorial-risk
    attributes:
      label: Editorial risk
      options:
        - none
        - low
        - medium
        - high
    validations:
      required: true
  - type: textarea
    id: minimum-output
    attributes:
      label: Minimum output
      description: Smallest reviewable document, component, route, dataset, checklist or PR.
    validations:
      required: true
  - type: textarea
    id: human-gate
    attributes:
      label: Human gate
      description: State `Giovanni decision point` or `no human decision needed`, with reason.
    validations:
      required: true
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance criteria
      description: Observable checks, including status/source/verification/limits when public-facing.
    validations:
      required: true
---
