import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const cell = (value) =>
  String(value ?? "—")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
const table = (headers, rows) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");

export function conceptualProjections(model) {
  const concept = (id) => model.concepts.find((c) => c.id === id)?.label ?? id;
  const domain = (id) => model.domains.find((d) => d.id === id)?.label ?? id;
  const sections = model.siteSections;
  const markdown =
    [
      "# Catalogo concettuale, logico e di copertura",
      "> Generato da `architecture/data-domain-registry.v1.json`. Modificare il registro e rieseguire `node scripts/architecture/renderConceptualCatalog.mjs --write`.",
      `Versione ${model.version}; revisione del ${model.reviewedAt}. La classificazione non certifica popolamento o completezza.`,
      "Leggere prima [il disegno concettuale e le regole di identità](conceptual-schema.md). Per i conteggi effettivi e i limiti: [assessment](conceptual-assessment-2026-09-07.md).",
      "## Concetti e identità",
      table(
        ["Concetto", "Definizione", "Identità", "Profilo semantico"],
        model.concepts.map((c) => [
          c.label,
          c.definition,
          c.identityRule,
          `${c.semanticCoverage}${c.terms.length ? ` · ${c.terms.join(", ")}` : ""}`,
        ]),
      ),
      "## Relazioni e cardinalità",
      "`implemented`: struttura presente per il dominio indicato; `partial`: solo una parte è rappresentata; `target`: collegamento da realizzare. Le cardinalità sono massime, non vincoli di obbligatorietà. Non attestano record popolati. Le FK effettive sono consultabili nell’archivio e nello schema Drizzle.",
      table(
        ["Origine", "Relazione", "Destinazione", "Cardinalità", "Stato"],
        model.relationships.map((r) => [
          concept(r.source),
          r.label,
          concept(r.target),
          r.cardinality,
          r.status,
        ]),
      ),
      "## Modello logico: tabelle per dominio",
      "I domini sono raggruppamenti concettuali; le tabelle restano nello schema PostgreSQL `public`. `entity`: entità/osservazione; `source`: struttura o record di fonte; `relation`: associazione; `projection`: proiezione; `legacy`: rappresentazione da armonizzare; `editorial`: contenuto redazionale; `operation`: esecuzione; `application`: stato del servizio.",
      ...model.domains.flatMap((d) => [
        `### ${d.label}`,
        d.description,
        table(
          [
            "Tabella",
            "Nome leggibile",
            "Concetto",
            "Ruolo",
            "Una riga rappresenta",
          ],
          Object.entries(model.tables)
            .filter(([, t]) => t.domain === d.id)
            .map(([name, t]) => [
              `\`${name}\``,
              t.label,
              concept(t.concept),
              t.kind,
              t.grain,
            ]),
        ),
      ]),
      "## Sovrapposizioni e decisioni",
      table(
        ["Dominio", "Tabelle", "Problema", "Decisione", "Fase"],
        model.overlaps.map((o) => [
          domain(o.domain),
          o.tables.map((t) => `\`${t}\``).join(", "),
          o.finding,
          o.decision,
          o.phase,
        ]),
      ),
      "## Contenuti del sito e copertura",
      "Copertura dei percorsi espliciti in `Router.tsx`, compresi alias e accessi riservati, più le pagine HTML autonome in `public`. Non è una riconciliazione di ogni campo di ogni file. `files` indica file senza tabella dedicata; `files_with_snapshot_ledger` conserva uno snapshot nel registro fonti senza materializzare tutte le entità; `files_with_domain_projection` indica una proiezione specifica della fonte; `api_and_files` combina API e fallback/file; `api` indica un percorso API, non la sua completezza; `editorial` indica testo redazionale; `redirect` indica un alias. Gli endpoint interni di autenticazione non rappresentano contenuti civici.",
      "Semantica: `local` = classe locale dichiarata; `partial` = copertura parziale; `reference` = riferimento o classificazione; `gap` = mapping da definire; `outside` = fuori dai fatti civici. Una classe dichiarata non dimostra che ogni record sia esportato in RDF.",
      table(
        [
          "Sezione",
          "Concetti",
          "Percorsi",
          "Persistenza",
          "Tabelle",
          "Semantica",
          "Limite",
        ],
        sections.map((s) => [
          s.label,
          s.concepts.map(concept).join(", "),
          [...s.routes, ...s.staticPaths].map((r) => `\`${r}\``).join(", "),
          s.storage,
          s.tables.join(", ") || "—",
          s.semanticCoverage,
          s.note,
        ]),
      ),
      "## Evidenze di implementazione",
      ...sections.map(
        (s) =>
          `- **${s.label}**: ${s.evidence.map((e) => `[${e}](../../${e})`).join(", ")}`,
      ),
    ].join("\n\n") + "\n";
  const navigation = Object.fromEntries(
    sections.flatMap((s) =>
      [...s.routes, ...s.staticPaths].map((route) => [
        route,
        s.navigationGroup,
      ]),
    ),
  );
  return new Map([
    ["docs/architecture/conceptual-catalog.md", markdown],
    [
      "artifacts/lamezia-trasparente/src/components/layout/generatedConceptualNavigation.json",
      JSON.stringify(navigation, null, 2) + "\n",
    ],
  ]);
}

export async function checkConceptualProjections(repoRoot, model) {
  for (const [relative, expected] of conceptualProjections(model)) {
    let actual;
    try {
      actual = await readFile(path.join(repoRoot, relative), "utf8");
    } catch {
      actual = null;
    }
    if (actual !== expected)
      throw new Error(
        `Stale conceptual projection: ${relative}. Run node scripts/architecture/renderConceptualCatalog.mjs --write`,
      );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const registry = JSON.parse(
    await readFile(
      path.join(root, "architecture/data-domain-registry.v1.json"),
      "utf8",
    ),
  );
  if (process.argv.includes("--write")) {
    for (const [relative, content] of conceptualProjections(
      registry.conceptualCatalog,
    )) {
      const destination = path.join(root, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, content);
    }
    console.log("Conceptual documentation and public navigation generated.");
  } else {
    await checkConceptualProjections(root, registry.conceptualCatalog);
    console.log("Conceptual projections are current.");
  }
}
