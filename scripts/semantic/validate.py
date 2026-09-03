#!/usr/bin/env python3
"""Validate LameziaTrasparente's public semantic contract without network access.

The validator intentionally checks more than RDF syntax:
- Turtle and JSON-LD assets parse with the repository-local context;
- semantic profile, ontology, SHACL graph and SKOS scheme stay version-aligned;
- conservative alignment guardrails prohibit accidental OWL identity/equivalence;
- the published semantic assets plus a synthetic positive fixture conform to SHACL;
- a deliberate provenance defect must fail SHACL, proving that the shapes are active.
"""

from __future__ import annotations

import json
from pathlib import Path

from pyshacl import validate
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import DCTERMS, OWL, RDF, SKOS

ROOT = Path(__file__).resolve().parents[2]
SEMANTIC_DIR = ROOT / "artifacts/lamezia-trasparente/public/semantic"
FIXTURE = ROOT / "scripts/semantic/fixtures/conformance.ttl"
SEMANTIC_PROFILE_SOURCE = ROOT / "artifacts/api-server/src/lib/semanticProfile.ts"

EXPECTED_VERSION = "1.2.0"
BASE = "https://lamezia-trasparente.pages.dev"
ONTOLOGY_IRI = URIRef(f"{BASE}/ontology")
PROFILE_IRI = URIRef(f"{BASE}/semantic/profile.jsonld")
SHAPES_IRI = URIRef(f"{BASE}/semantic/shapes.ttl")
CONCEPT_SCHEME_IRI = URIRef(f"{BASE}/semantic/civic-concepts")

LT = Namespace(f"{BASE}/ontology#")
PROV = Namespace("http://www.w3.org/ns/prov#")
SH = Namespace("http://www.w3.org/ns/shacl#")

EXPECTED_TOP_CONCEPTS = {
    URIRef(f"{BASE}/concept/acts"),
    URIRef(f"{BASE}/concept/governance"),
    URIRef(f"{BASE}/concept/spending"),
    URIRef(f"{BASE}/concept/territory"),
    URIRef(f"{BASE}/concept/integrity"),
    URIRef(f"{BASE}/concept/open-data"),
    URIRef(f"{BASE}/concept/participation"),
}

EXPECTED_NODE_SHAPES = {
    LT.SemanticProfileShape,
    LT.ValidationShapeGraphShape,
    LT.CivicConceptSchemeShape,
    LT.GovernedCivicConceptShape,
    LT.AdministrativeActShape,
    LT.AdministrativeActTextRepresentationShape,
    LT.PublicProcurementRecordShape,
    LT.CivicThemeShape,
    LT.PerformanceIndicatorShape,
    LT.PnrrProjectShape,
}


class SemanticValidationError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SemanticValidationError(message)


def parse_turtle(path: Path) -> Graph:
    graph = Graph()
    graph.parse(path, format="turtle")
    return graph


def load_context() -> dict[str, object]:
    raw = json.loads((SEMANTIC_DIR / "context.jsonld").read_text(encoding="utf-8"))
    context = raw.get("@context")
    require(isinstance(context, dict), "context.jsonld must contain an object @context")
    required_prefixes = {"lt", "dct", "prov", "skos", "adms", "sh", "owl", "xsd"}
    missing = required_prefixes.difference(context)
    require(not missing, f"context.jsonld is missing required prefixes: {sorted(missing)}")
    return context


def parse_jsonld_offline(path: Path, context: dict[str, object]) -> Graph:
    document = json.loads(path.read_text(encoding="utf-8"))
    # Replace the canonical remote context reference with the repository copy so CI
    # is deterministic and does not depend on the deployed site or network access.
    document["@context"] = context
    graph = Graph()
    graph.parse(data=json.dumps(document), format="json-ld")
    return graph


def merge_graphs(*graphs: Graph) -> Graph:
    merged = Graph()
    for graph in graphs:
        for triple in graph:
            merged.add(triple)
    return merged


def literal_value(graph: Graph, subject: URIRef, predicate: URIRef) -> str | None:
    value = graph.value(subject, predicate)
    return str(value) if value is not None else None


def check_version_alignment(
    ontology: Graph,
    shapes: Graph,
    profile: Graph,
    concepts: Graph,
) -> None:
    versioned_resources = {
        "ontology": (ontology, ONTOLOGY_IRI),
        "shape graph": (shapes, SHAPES_IRI),
        "semantic profile": (profile, PROFILE_IRI),
        "civic concept scheme": (concepts, CONCEPT_SCHEME_IRI),
    }
    for label, (graph, subject) in versioned_resources.items():
        actual = literal_value(graph, subject, OWL.versionInfo)
        require(
            actual == EXPECTED_VERSION,
            f"{label} version mismatch: expected {EXPECTED_VERSION}, got {actual!r}",
        )

    source = SEMANTIC_PROFILE_SOURCE.read_text(encoding="utf-8")
    require(
        f'SEMANTIC_PROFILE_VERSION = "{EXPECTED_VERSION}"' in source,
        "semanticProfile.ts version is not synchronized with the published profile",
    )
    for expected_url in (
        f"{BASE}/semantic/profile.jsonld",
        f"{BASE}/semantic/context.jsonld",
        f"{BASE}/semantic/ontology.ttl",
        f"{BASE}/semantic/shapes.ttl",
        f"{BASE}/semantic/civic-concepts.jsonld",
    ):
        require(
            expected_url in source,
            f"semanticProfile.ts does not advertise the canonical asset {expected_url}",
        )


def check_conservative_alignment(*graphs: Graph) -> None:
    forbidden_predicates = {OWL.sameAs, OWL.equivalentClass}
    for graph in graphs:
        for predicate in forbidden_predicates:
            offending = next(graph.triples((None, predicate, None)), None)
            require(
                offending is None,
                f"forbidden identity/equivalence assertion found: {offending}",
            )


def check_profile(profile: Graph) -> None:
    require(
        (PROFILE_IRI, RDF.type, LT.SemanticProfile) in profile,
        "profile.jsonld must type the profile as lt:SemanticProfile",
    )
    require(
        (PROFILE_IRI, LT.validationShapes, SHAPES_IRI) in profile,
        "profile.jsonld must advertise the canonical SHACL graph",
    )
    require(
        (PROFILE_IRI, LT.civicConceptScheme, CONCEPT_SCHEME_IRI) in profile,
        "profile.jsonld must advertise the canonical civic SKOS scheme",
    )
    require(
        not any(profile.triples((PROFILE_IRI, DCTERMS.conformsTo, None))),
        "profile.jsonld must not use broad dct:conformsTo claims for reused standards; use explicit references/alignment metadata instead",
    )


def check_concept_scheme(concepts: Graph) -> None:
    require(
        (CONCEPT_SCHEME_IRI, RDF.type, SKOS.ConceptScheme) in concepts,
        "civic concept scheme must be typed skos:ConceptScheme",
    )
    top_concepts = set(concepts.objects(CONCEPT_SCHEME_IRI, SKOS.hasTopConcept))
    require(
        top_concepts == EXPECTED_TOP_CONCEPTS,
        "civic top-concept set differs from the governed semantic profile",
    )

    notations: set[str] = set()
    for concept in sorted(EXPECTED_TOP_CONCEPTS, key=str):
        require(
            (concept, RDF.type, SKOS.Concept) in concepts,
            f"{concept} must be typed skos:Concept",
        )
        require(
            (concept, SKOS.inScheme, CONCEPT_SCHEME_IRI) in concepts,
            f"{concept} must belong to the civic concept scheme",
        )
        notation_values = list(concepts.objects(concept, SKOS.notation))
        require(
            len(notation_values) == 1,
            f"{concept} must have exactly one stable skos:notation",
        )
        notation = str(notation_values[0])
        require(notation not in notations, f"duplicate skos:notation: {notation}")
        notations.add(notation)

        label_languages = {
            label.language for label in concepts.objects(concept, SKOS.prefLabel)
        }
        require(
            {"it", "en"}.issubset(label_languages),
            f"{concept} must have Italian and English skos:prefLabel values",
        )


def check_shape_inventory(shapes: Graph) -> None:
    node_shapes = set(shapes.subjects(RDF.type, SH.NodeShape))
    missing = EXPECTED_NODE_SHAPES.difference(node_shapes)
    require(not missing, f"SHACL graph is missing expected node shapes: {sorted(map(str, missing))}")
    require(
        (SHAPES_IRI, RDF.type, LT.ValidationShapeGraph) in shapes,
        "shapes.ttl must describe itself as an lt:ValidationShapeGraph asset",
    )


def run_shacl(
    data_graph: Graph,
    shapes: Graph,
    ontology: Graph,
) -> tuple[bool, Graph, str]:
    conforms, report_graph, report_text = validate(
        data_graph=data_graph,
        shacl_graph=shapes,
        ont_graph=ontology,
        inference="rdfs",
        advanced=True,
        allow_infos=False,
        allow_warnings=False,
    )
    return bool(conforms), report_graph, str(report_text)


def main() -> None:
    context = load_context()
    ontology = parse_turtle(SEMANTIC_DIR / "ontology.ttl")
    shapes = parse_turtle(SEMANTIC_DIR / "shapes.ttl")
    profile = parse_jsonld_offline(SEMANTIC_DIR / "profile.jsonld", context)
    concepts = parse_jsonld_offline(SEMANTIC_DIR / "civic-concepts.jsonld", context)
    fixture = parse_turtle(FIXTURE)

    check_version_alignment(ontology, shapes, profile, concepts)
    check_conservative_alignment(ontology, shapes, profile, concepts)
    check_profile(profile)
    check_concept_scheme(concepts)
    check_shape_inventory(shapes)

    positive_data = merge_graphs(ontology, shapes, profile, concepts, fixture)
    conforms, _, report_text = run_shacl(positive_data, shapes, ontology)
    require(conforms, f"positive semantic fixture failed SHACL:\n{report_text}")

    # Mutation test: provenance is a deliberate fail-closed invariant for source-derived
    # administrative entities. Removing it must produce a SHACL violation.
    negative_data = merge_graphs(ontology, shapes, profile, concepts, fixture)
    test_act = URIRef("https://example.invalid/lt-test/act-1")
    for triple in list(negative_data.triples((test_act, PROV.wasDerivedFrom, None))):
        negative_data.remove(triple)

    negative_conforms, negative_report, negative_text = run_shacl(
        negative_data, shapes, ontology
    )
    require(
        not negative_conforms,
        "negative mutation unexpectedly conformed; SHACL provenance gate is not active",
    )
    result_paths = set(negative_report.objects(None, SH.resultPath))
    require(
        PROV.wasDerivedFrom in result_paths,
        "negative mutation failed, but not on the expected prov:wasDerivedFrom invariant:\n"
        + negative_text,
    )

    print(
        "Semantic validation passed: "
        f"profile={EXPECTED_VERSION}, "
        f"triples={len(positive_data)}, "
        f"node_shapes={len(set(shapes.subjects(RDF.type, SH.NodeShape)))}, "
        f"top_concepts={len(EXPECTED_TOP_CONCEPTS)}, "
        "negative_provenance_mutation=detected"
    )


if __name__ == "__main__":
    main()
