import { useState } from "react";
import { Folder, Database } from "lucide-react";
import type { DatabaseInspectionTable as DbTable } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  conceptualCatalog as model,
  tableMeanings,
  tableGroups,
  kindLabels,
  semanticLabels,
  storageLabels,
} from "@/lib/conceptualCatalog";

const relationshipLabels: Record<string, string> = {
  implemented: "Struttura presente",
  partial: "Parziale",
  target: "Da realizzare",
};

export function DatabaseTree({
  tables,
  search,
  selection,
  onTable,
}: {
  tables: DbTable[];
  search: string;
  selection: string | null;
  onTable: (name: string) => void;
}) {
  const groups = tableGroups(tables, search);
  return (
    <>
      {groups.length === 0 && (
        <p className="db-note" role="status">
          Nessuna tabella corrisponde alla ricerca.
        </p>
      )}
      {groups.map((group) => (
        <details className="db-domain-tree" key={group.id} open>
          <summary>
            <Folder size={15} aria-hidden="true" />
            {group.label}
            <span>{group.tables.length}</span>
          </summary>
          {[
            ...new Set(
              group.tables.map(
                (t) => tableMeanings[t.name]?.concept ?? "unclassified",
              ),
            ),
          ].map((conceptId) => (
            <section key={conceptId}>
              <h3>
                {model.concepts.find((c) => c.id === conceptId)?.label ??
                  "Tipo da definire"}
              </h3>
              {group.tables
                .filter(
                  (t) =>
                    (tableMeanings[t.name]?.concept ?? "unclassified") ===
                    conceptId,
                )
                .map((table) => (
                  <button
                    key={table.name}
                    className={selection === table.name ? "db-selected" : ""}
                    onClick={() => onTable(table.name)}
                    aria-current={selection === table.name ? "true" : undefined}
                  >
                    <Database size={14} aria-hidden="true" />
                    <span>
                      {tableMeanings[table.name]?.label ?? table.name}
                      {tableMeanings[table.name] && <small>{table.name}</small>}
                    </span>
                  </button>
                ))}
            </section>
          ))}
        </details>
      ))}
    </>
  );
}

export function TableMeaning({ table }: { table: DbTable }) {
  const meaning = tableMeanings[table.name];
  if (!meaning)
    return (
      <p className="db-note">
        Tabella da classificare nel modello concettuale.
      </p>
    );
  const domain = model.domains.find((d) => d.id === meaning.domain);
  const concept = model.concepts.find((c) => c.id === meaning.concept);
  const decisions = model.overlaps.filter((o) => o.tables.includes(table.name));
  return (
    <div className="db-table-meaning">
      <p className="db-breadcrumb">
        {domain?.label} / {concept?.label} / {kindLabels[meaning.kind]}
      </p>
      <p>
        <strong>{meaning.label}.</strong> Una riga rappresenta:{" "}
        {meaning.grain.toLocaleLowerCase("it")}.
      </p>
      {decisions.map((d) => (
        <details key={d.id}>
          <summary>{d.finding}</summary>
          <p>{d.decision}</p>
        </details>
      ))}
    </div>
  );
}

export function ConceptualPane({
  tables,
  onTable,
}: {
  tables: DbTable[];
  onTable: (name: string) => void;
}) {
  const [selected, setSelected] = useState("project");
  const concept = model.concepts.find((c) => c.id === selected)!;
  const physical = Object.entries(tableMeanings).filter(
    ([, value]) => value.concept === selected,
  );
  const links = model.relationships.filter(
    (r) => r.source === selected || r.target === selected,
  );
  return (
    <section aria-label="Modello concettuale">
      <h2>Modello concettuale</h2>
      <p className="db-note">
        Entità, record di fonte e tabelle sono livelli diversi. Questa mappa
        definisce i concetti e mostra dove sono rappresentati oggi.
      </p>
      <label htmlFor="db-concept">Concetto da esplorare</label>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger id="db-concept">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {model.concepts.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="db-concept-definition">
        <h3>{concept.label}</h3>
        <p>{concept.definition}</p>
        <p>
          <strong>Identità:</strong> {concept.identityRule}
        </p>
        <p>
          <strong>Profilo semantico:</strong>{" "}
          {semanticLabels[concept.semanticCoverage]}
          {concept.terms.length > 0 ? ` · ${concept.terms.join(", ")}` : ""}.
        </p>
        <p className="db-note">
          Una classe o un riferimento dichiarato non prova l'esportazione di
          tutti i record. Il profilo RDF pubblico copre un sottoinsieme del
          modello.
        </p>
      </div>
      <h3>Rappresentazione nelle tabelle</h3>
      {physical.length === 0 ? (
        <p className="db-note">
          Nessuna tabella dedicata: concetto da modellare o conservato nei
          contenuti esterni. Consulta «Sito e copertura».
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivio</TableHead>
              <TableHead>Una riga rappresenta</TableHead>
              <TableHead>Ruolo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {physical.map(([name, entry]) => (
              <TableRow key={name}>
                <TableCell>
                  <button
                    className="db-link"
                    disabled={!tables.some((t) => t.name === name)}
                    onClick={() => onTable(name)}
                  >
                    {entry.label}
                  </button>
                  <code className="db-technical">{name}</code>
                  {!tables.some((t) => t.name === name) && (
                    <span>Assente nel catalogo corrente</span>
                  )}
                </TableCell>
                <TableCell>{entry.grain}</TableCell>
                <TableCell>{kindLabels[entry.kind]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <h3>Relazioni concettuali</h3>
      <p className="db-note">
        Le cardinalità descrivono il modello. «Parziale» e «Da realizzare»
        indicano collegamenti non ancora interamente materializzati; le chiavi
        esterne effettive sono nella scheda della tabella.
      </p>
      {links.length === 0 ? (
        <p>Nessuna relazione trasversale censita per questo concetto.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origine</TableHead>
              <TableHead>Relazione</TableHead>
              <TableHead>Destinazione</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <button
                    className="db-link"
                    onClick={() => setSelected(r.source)}
                  >
                    {model.concepts.find((c) => c.id === r.source)?.label}
                  </button>
                </TableCell>
                <TableCell>
                  {r.label}
                  <small className="db-technical">{r.cardinality}</small>
                </TableCell>
                <TableCell>
                  <button
                    className="db-link"
                    onClick={() => setSelected(r.target)}
                  >
                    {model.concepts.find((c) => c.id === r.target)?.label}
                  </button>
                </TableCell>
                <TableCell>{relationshipLabels[r.status]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

export function SiteCoveragePane({
  tables,
  onTable,
}: {
  tables: DbTable[];
  onTable: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [onlyFiles, setOnlyFiles] = useState(false);
  const sections = model.siteSections.filter(
    (s) =>
      (!onlyFiles || s.storage === "files") &&
      [
        s.label,
        ...s.routes,
        ...s.staticPaths,
        ...s.concepts.map(
          (id) => model.concepts.find((c) => c.id === id)?.label,
        ),
      ]
        .join(" ")
        .toLocaleLowerCase("it")
        .includes(search.toLocaleLowerCase("it")),
  );
  return (
    <section aria-label="Sito e copertura">
      <h2>Sito e copertura</h2>
      <p className="db-note">
        Mappa verificata sul codice del {model.reviewedAt}. Indica i percorsi di
        lettura e le lacune: non misura in tempo reale il popolamento o la
        completezza delle fonti.
      </p>
      <div className="db-coverage-controls">
        <Input
          aria-label="Cerca una sezione del sito"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sezione, concetto o percorso"
        />
        <Button
          aria-pressed={onlyFiles}
          onClick={() => setOnlyFiles(!onlyFiles)}
        >
          Solo file senza tabella dedicata
        </Button>
      </div>
      <p className="db-note" role="status">
        {sections.length} sezioni
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sezione e concetti</TableHead>
            <TableHead>Dove risiedono i contenuti</TableHead>
            <TableHead>Copertura semantica</TableHead>
            <TableHead>Limite e percorso di armonizzazione</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <strong>{s.label}</strong>
                <p>
                  {s.concepts
                    .map((id) => model.concepts.find((c) => c.id === id)?.label)
                    .join(" · ")}
                </p>
                <details>
                  <summary>Percorsi del sito</summary>
                  {[...s.routes, ...s.staticPaths].map((route) => (
                    <code className="db-technical" key={route}>
                      {route}
                    </code>
                  ))}
                </details>
              </TableCell>
              <TableCell>
                {storageLabels[s.storage]}
                {s.tables.map((name) => (
                  <button
                    className="db-link db-technical"
                    key={name}
                    disabled={!tables.some((t) => t.name === name)}
                    onClick={() => onTable(name)}
                  >
                    {tableMeanings[name]?.label ?? name}
                    {!tables.some((t) => t.name === name) &&
                      " (assente nel catalogo corrente)"}
                  </button>
                ))}
              </TableCell>
              <TableCell>{semanticLabels[s.semanticCoverage]}</TableCell>
              <TableCell>
                {s.note}
                <details>
                  <summary>Evidenze nel codice</summary>
                  {s.evidence.map((file) => (
                    <code className="db-technical" key={file}>
                      {file}
                    </code>
                  ))}
                </details>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sections.length === 0 && (
        <p role="status">Nessuna sezione corrisponde al filtro.</p>
      )}
    </section>
  );
}
