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
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS

ROOT = Path(__file__).resolve().parents[2]
SEMANTIC_DIR = ROOT / "artifacts/lamezia-trasparente/public/semantic"
FIXTURE = ROOT / "scripts/semantic/fixtures/conformance.ttl"
SEMANTIC_PROFILE_SOURCE = ROOT / "artifacts/api-server/src/lib/semanticProfile.ts"

MODEL = json.loads((ROOT / "architecture/data-domain-registry.v1.json").read_text())["conceptualCatalog"]
EXPECTED_VERSION = MODEL["semanticProfile"]["version"]
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
EXPECTED_NODE_SHAPES.update(
    LT[f"{concept['rdfClass'].split(':')[1]}ModelShape"]
    for concept in MODEL["concepts"] if concept.get("rdfClass")
)


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


def check_model_correspondence(ontology: Graph) -> None:
    """Check definitions and distinct identity against the normative model, not counts."""
    classes: set[URIRef] = set()
    for concept in MODEL["concepts"]:
        if not concept.get("rdfClass"):
            require(concept["semanticCoverage"] == "outside", f"unmapped civic concept: {concept['id']}")
            continue
        term = LT[concept["rdfClass"].split(":")[1]]
        require(term not in classes, f"collapsed primary identity: {concept['id']}")
        classes.add(term)
        require((term, RDF.type, OWL.Class) in ontology, f"undeclared model class: {term}")
        require(literal_value(ontology, term, LT.conceptKey) == concept["id"], f"class ownership drift: {term}")
        require(literal_value(ontology, term, RDFS.comment) == concept["definition"], f"definition drift: {term}")
        require(literal_value(ontology, term, LT.identityRule) == concept["identityRule"], f"identity rule drift: {term}")
        expected_parents = {LT[p.split(":")[1]] for p in concept.get("rdfParents", [])}
        require(set(ontology.objects(term, RDFS.subClassOf)) == expected_parents, f"parent drift: {term}")
    for relation in MODEL["relationships"]:
        predicate = LT[relation["rdfProperty"].split(":")[1]]
        source = next(c for c in MODEL["concepts"] if c["id"] == relation["source"])
        target = next(c for c in MODEL["concepts"] if c["id"] == relation["target"])
        require((predicate, RDF.type, OWL.ObjectProperty) in ontology, f"missing model relation: {predicate}")
        require(ontology.value(predicate, RDFS.domain) == LT[source["rdfClass"].split(":")[1]], f"relation domain drift: {predicate}")
        require(ontology.value(predicate, RDFS.range) == LT[target["rdfClass"].split(":")[1]], f"relation range drift: {predicate}")
        require(literal_value(ontology, predicate, LT.implementationStatus) == relation["status"], f"implementation claim drift: {predicate}")


def model_fixture() -> tuple[Graph, dict[str, URIRef]]:
    """One synthetic instance per primary class; none are exported civic records."""
    graph = Graph()
    nodes = {}
    for index, concept in enumerate(MODEL["concepts"]):
        if not concept.get("rdfClass"):
            continue
        node = URIRef(f"https://example.invalid/lt-model/{concept['id']}")
        nodes[concept["id"]] = node
        graph.add((node, RDF.type, LT[concept["rdfClass"].split(":")[1]]))
        graph.add((node, DCTERMS.identifier, Literal(f"019a1234-5678-7abc-8def-{index:012x}")))
        policy = concept["rdfValidation"]
        if policy["provenanceRequired"]:
            graph.add((node, PROV.wasDerivedFrom, URIRef(f"https://example.invalid/evidence/{concept['id']}")))
        if concept["id"] == "identity" or policy.get("subjectKind"):
            graph.add((node, LT.subjectKind, Literal(policy.get("subjectKind", "entity"))))
            graph.add((node, LT.domainType, Literal(policy.get("domainType", "test.identity"))))
        if concept["id"] == "publication_version":
            graph.add((node, LT.publicationVisibility, Literal("metadata_only")))
        if concept["id"] == "resolution":
            graph.add((node, LT.resolutionStatus, Literal("not_applicable")))
        if concept["id"] == "classification":
            graph.add((node, LT.classificationStatus, Literal("not_applicable")))
            graph.add((node, LT.classificationMethod, Literal("synthetic-validator.v1")))
            graph.add((node, LT.classificationFacet, Literal("doc_type")))
        if concept["id"] == "public_projection":
            graph.add((node, LT.publicationPolicyVersion, Literal("synthetic-policy.v1")))
    return graph, nodes


def check_model_mutations(positive: Graph, shapes: Graph, ontology: Graph, nodes: dict[str, URIRef]) -> int:
    count = 0

    def rejects(label: str, remove=(), add=()) -> None:
        nonlocal count
        changed = merge_graphs(positive)
        for triple in remove:
            changed.remove(triple)
        for triple in add:
            changed.add(triple)
        focus = list({triple[0] for triple in [*remove, *add]})
        conforms, _, _ = run_shacl(changed, shapes, ontology, focus_nodes=focus)
        require(not conforms, f"semantic mutation passed: {label}")
        count += 1

    for concept in MODEL["concepts"]:
        if not concept.get("rdfClass"):
            continue
        node = nodes[concept["id"]]
        rejects(f"missing identity/{concept['id']}", remove=list(positive.triples((node, DCTERMS.identifier, None))))
        if concept["rdfValidation"]["provenanceRequired"]:
            rejects(f"missing provenance/{concept['id']}", remove=list(positive.triples((node, PROV.wasDerivedFrom, None))))
        kind = concept["rdfValidation"].get("subjectKind")
        if kind:
            rejects(f"wrong identity kind/{concept['id']}",
                    remove=list(positive.triples((node, LT.subjectKind, None))),
                    add=[(node, LT.subjectKind, Literal("entity" if kind == "event" else "event"))])
    rejects("publication collapsed with document", add=[(nodes["publication"], RDF.type, LT.DocumentResource)])
    rejects("procurement mention collapsed with contract", add=[(nodes["procurement_mention"], RDF.type, LT.ProcurementContract)])
    rejects("procurement mention certifies a contract", add=[(nodes["procurement_mention"], LT.describesContract, URIRef("https://example.invalid/contract"))])
    rejects("withheld publication title", add=[(nodes["publication_version"], DCTERMS.title, Literal("private marker"))])
    rejects("publishable version lacks policy", remove=[(nodes["publication_version"], LT.publicationVisibility, Literal("metadata_only"))], add=[(nodes["publication_version"], LT.publicationVisibility, Literal("publishable"))])
    rejects("resolved outcome lacks target", remove=[(nodes["resolution"], LT.resolutionStatus, Literal("not_applicable"))], add=[(nodes["resolution"], LT.resolutionStatus, Literal("resolved"))])
    rejects("non-resolution creates synthetic target", add=[(nodes["resolution"], LT.resolvedSubject, nodes["identity"])])
    rejects("classification lacks concept", remove=[(nodes["classification"], LT.classificationStatus, Literal("not_applicable"))], add=[(nodes["classification"], LT.classificationStatus, Literal("classified"))])
    rejects("non-classification invents concept", add=[(nodes["classification"], LT.assignedConcept, nodes["taxonomy"])])
    rejects("public projection lacks policy", remove=list(positive.triples((nodes["public_projection"], LT.publicationPolicyVersion, None))))
    return count


def run_shacl(
    data_graph: Graph,
    shapes: Graph,
    ontology: Graph,
    focus_nodes: list[URIRef] | None = None,
) -> tuple[bool, Graph, str]:
    conforms, report_graph, report_text = validate(
        data_graph=data_graph,
        shacl_graph=shapes,
        ont_graph=ontology,
        inference="rdfs",
        advanced=True,
        allow_infos=False,
        allow_warnings=False,
        focus_nodes=focus_nodes,
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
    check_model_correspondence(ontology)
    primary_fixture, primary_nodes = model_fixture()

    positive_data = merge_graphs(ontology, shapes, profile, concepts, fixture, primary_fixture)
    conforms, _, report_text = run_shacl(positive_data, shapes, ontology)
    require(conforms, f"positive semantic fixture failed SHACL:\n{report_text}")
    mutations = check_model_mutations(positive_data, shapes, ontology, primary_nodes)

    # Mutation test: provenance is a deliberate fail-closed invariant for source-derived
    # administrative entities. Removing it must produce a SHACL violation.
    negative_data = merge_graphs(ontology, shapes, profile, concepts, fixture, primary_fixture)
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
        f"model_classes={len(primary_nodes)}, "
        f"model_mutations={mutations}, "
        "negative_provenance_mutation=detected"
    )


if __name__ == "__main__":
    main()
