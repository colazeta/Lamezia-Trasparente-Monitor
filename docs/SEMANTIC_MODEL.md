# LameziaTrasparente semantic model

LameziaTrasparente uses a deliberately small **local civic ontology** to give
stable meaning to its public data while reusing established semantic standards.
The goal is interoperability without semantic overclaiming: the platform should
reuse external concepts where the meaning is genuinely compatible and keep a
local class where the public source is narrower, partial or operationally
different.

The semantic layer is independent of the WebMCP challenge. It is part of the
permanent public-data architecture and applies to REST, remote MCP, Open Data
metadata and future linked-data surfaces.

## Published semantic assets

The public frontend ships three versioned machine-readable assets:

```text
/semantic/context.jsonld
/semantic/profile.jsonld
/semantic/ontology.ttl
```

Canonical public URLs:

```text
https://lamezia-trasparente.pages.dev/semantic/context.jsonld
https://lamezia-trasparente.pages.dev/semantic/profile.jsonld
https://lamezia-trasparente.pages.dev/semantic/ontology.ttl
```

The local namespace is:

```text
https://lamezia-trasparente.pages.dev/ontology#
```

The initial semantic profile version is `1.0.0`.

## Standards baseline

| Layer | Standard / vocabulary | Version used | Role in LameziaTrasparente |
| --- | --- | --- | --- |
| Dataset catalogues | W3C DCAT | 3 | Base vocabulary for catalogues, datasets, distributions and data services. |
| EU data catalogues | DCAT-AP | 3.0.1 | Conformance **target** for catalogue metadata; conformance must be demonstrated with the applicable validation profile, not inferred from field names. |
| Provenance | W3C PROV-O | 2013-04-30 | Source, derivation and public-projection provenance. |
| Controlled concepts | W3C SKOS | 2009-08-18 | Themes, categories, statuses and other governed concept schemes. |
| Public procurement | EU eProcurement Ontology (ePO) | 5.2.0 | Domain semantics for contracts, buyers, economic operators and the procurement lifecycle. |
| Performance observations | W3C RDF Data Cube | 2014-01-16 | Representation pattern for time-specific indicator observations. |
| Organisations | W3C ORG + OntoPiA COV | current published terms | Preferred model once public organisations and suppliers are resolved as first-class entities. |
| Italian transparency | OntoPiA Transparency | 0.2 draft | **Reference only** for Italian transparency obligations and subjects; the ontology is explicitly still a draft awaiting ANAC review, so it is not used as a conformance claim. |

The national semantic catalogue at `schema.gov.it` is treated as the primary
Italian reference for reusable public-sector ontologies and controlled
vocabularies.

## Conformance is not alignment

LameziaTrasparente uses three distinct semantic relationships:

1. **Conformance target** — a profile we intend a concrete representation to
   validate against, for example DCAT-AP 3.0.1 for catalogue metadata.
2. **Ontology alignment** — an external ontology whose concepts structure the
   domain, but where the local record may not carry every required property.
3. **Reference** — a relevant semantic asset that informs modelling but is not
   asserted as equivalent or conformant.

These terms must not be collapsed. In particular:

- a public ANAC row is not automatically an `epo:Contract` individual;
- an Albo record is not automatically legislation;
- a monitoring theme is not an Italian statutory transparency obligation merely
  because both are transparency-related;
- a missing field is not equivalent to an RDF assertion that the fact is false.

## Core local classes

### `lt:AdministrativeAct`

A public-safe administrative record exposed by LameziaTrasparente.

It is modelled as a subclass of:

- `foaf:Document`;
- `prov:Entity`.

It is intentionally **not** declared to be legislation. A later ELI or Akoma
Ntoso alignment may be added only for records whose legal nature warrants it.

### `lt:AdministrativeActTextRepresentation`

A public-safe textual representation derived from an administrative act, such
as extracted Markdown. It is a `prov:Entity` and can be linked to the source act
through `lt:isTextRepresentationOf`.

### `lt:PublicProcurementRecord`

A public-safe record that describes a procurement contract or related
procurement object. It is a `prov:Entity`.

The relationship to the EU eProcurement Ontology is deliberately modelled as:

```text
lt:PublicProcurementRecord --lt:describesContract--> epo:Contract
```

rather than:

```text
lt:PublicProcurementRecord owl:equivalentClass epo:Contract
```

This distinction matters because the current ANAC projection may expose award
and identification data without representing the complete legal contract
lifecycle required by ePO.

### `lt:CivicTheme`

A governed monitoring concept. It is a subclass of `skos:Concept`.

Public thematic taxonomies should therefore evolve toward versioned
`skos:ConceptScheme` resources with:

- stable URI;
- `skos:prefLabel`;
- optional `skos:altLabel`;
- definition or scope note;
- `skos:broader` / `skos:narrower` where hierarchy is real;
- mappings to external concept schemes only where evidence supports them.

### `lt:PerformanceIndicator`

A defined municipal performance concept. Indicator definitions are treated as
concepts; time-specific values can be represented with the RDF Data Cube
`qb:Observation` pattern through `lt:hasObservation`.

### `lt:PnrrProject`

A project financed or tracked within the Italian PNRR. It is modelled as a
`schema:Project` and `prov:Entity`.

Procurement semantics must be attached only when there is a source-backed
relation to a procurement record. A CUP does not by itself imply a one-to-one
contract.

## Identifier policy

Semantic identifiers must prefer official or already-stable public identifiers
over database row IDs.

| Entity | Preferred identity |
| --- | --- |
| Administrative act | stable `publicId`; source `progressivo` retained as provenance/identifier |
| Procurement record | CIG when present; CUP remains a project identifier and must not replace CIG |
| PNRR project | CUP |
| Civic theme | stable slug / concept URI |
| Performance indicator | stable slug / indicator URI |
| Public organisation | official code or authoritative registry identifier before name-based resolution |

Numeric database IDs remain implementation identifiers. They must not be treated
as cross-system identity when an authoritative identifier exists.

## Controlled-vocabulary policy

Free-text taxonomies should be treated as technical debt. The intended migration
path is:

```text
string label
→ governed internal code
→ stable concept URI
→ SKOS Concept
→ optional mapping to an external controlled vocabulary
```

No mapping is promoted solely because two labels look similar. Exact, close,
broad and narrow mappings require semantic review.

The first candidates for SKOS governance are:

- civic themes and macrothemes;
- administrative-act categories and types;
- procurement procedure families where the source code is known;
- monitoring statuses;
- PNRR missions/components/measures;
- performance categories and indicator families.

## Public organisations and suppliers

Names alone are not identity. Until an organisation has a source-backed
identifier, LameziaTrasparente should not mint an authoritative organisation
identity from a supplier string.

Once entity resolution is available, the preferred model is:

- W3C `org:Organization` for generic organisational structure;
- OntoPiA COV for Italian public-sector organisational semantics;
- ePO roles (`epo:Buyer`, `epo:Contractor`, `epo:Winner`, etc.) for roles played
  inside a procurement context.

Role and organisation must remain separate: the same organisation can play
different roles in different procedures.

## MCP semantic envelope

Successful remote MCP results include a compact semantic descriptor next to the
public-safe data and verification block:

```json
{
  "resource": "contract",
  "data": {},
  "semantic": {
    "profile": "https://lamezia-trasparente.pages.dev/semantic/profile.jsonld",
    "context": "https://lamezia-trasparente.pages.dev/semantic/context.jsonld",
    "ontology": "https://lamezia-trasparente.pages.dev/semantic/ontology.ttl",
    "profileVersion": "1.0.0",
    "entityType": "https://lamezia-trasparente.pages.dev/ontology#PublicProcurementRecord",
    "mappings": [
      {
        "relation": "describes",
        "term": "http://data.europa.eu/a4g/ontology#Contract",
        "vocabulary": "eProcurement Ontology",
        "version": "5.2.0"
      }
    ]
  },
  "verification": {
    "publicOnly": true,
    "sourceCheckRequired": true,
    "portal": "https://lamezia-trasparente.pages.dev"
  }
}
```

`semantic.mappings` is descriptive metadata for clients. A `describes`,
`reference` or `observationPattern` relationship must never be interpreted as
`owl:equivalentClass`.

## Validation policy

Semantic quality is a testable contract, not a styling claim.

New semantic work should add progressively stronger gates:

1. JSON-LD parses successfully and uses stable HTTPS/HTTP ontology IRIs;
2. Turtle parses successfully;
3. all MCP resources resolve to a registered semantic descriptor;
4. SKOS concept schemes have unique stable identifiers and labels;
5. DCAT catalogue exports are validated against the chosen DCAT-AP release;
6. RDF/JSON-LD projections are validated with SHACL where an authoritative shape
   is available;
7. ontology upgrades are explicit versioned changes, not silent namespace
   substitutions.

A failing semantic validation should block publication of the semantic artifact,
not silently downgrade its meaning.

## Versioning and governance

Semantic profile changes follow semantic versioning:

- patch: labels, documentation or non-semantic metadata corrections;
- minor: additive classes, mappings or optional terms;
- major: changed identity rules, removed terms, changed mapping semantics or
  incompatible URI policy.

Existing URIs must not be repurposed with a different meaning. Deprecated terms
should remain dereferenceable and point to their replacement where possible.

The ontology is intentionally small. LameziaTrasparente should prefer reuse of
well-governed external vocabularies over recreating public-administration,
procurement, geographic or statistical concepts locally.
