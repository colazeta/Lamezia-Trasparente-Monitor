import registry from "../../../../architecture/data-domain-registry.v1.json";

export const conceptualCatalog = registry.conceptualCatalog;
export type TableMeaning = {
  label: string;
  domain: string;
  concept: string;
  kind: string;
  grain: string;
};
export const tableMeanings: Record<string, TableMeaning> =
  conceptualCatalog.tables;
export const kindLabels: Record<string, string> = {
  entity: "Entità o osservazione",
  source: "Record o struttura di fonte",
  relation: "Relazione",
  projection: "Proiezione",
  legacy: "Modello da armonizzare",
  editorial: "Redazione",
  operation: "Operazioni",
  application: "Stato applicativo",
};
export const semanticLabels: Record<string, string> = {
  local: "Classe locale dichiarata",
  partial: "Copertura parziale",
  reference: "Riferimento o classificazione",
  gap: "Mapping da definire",
  outside: "Fuori dai fatti civici",
};
export const storageLabels: Record<string, string> = {
  files: "File; nessuna tabella dedicata",
  api: "Percorso API",
  api_and_files: "API e file",
  files_with_snapshot_ledger: "File e registro fonte",
  files_with_domain_projection: "File e proiezione per fonte",
  editorial: "Contenuto editoriale",
  redirect: "Reindirizzamento",
};

export function tableGroups<T extends { name: string }>(
  tables: T[],
  search = "",
) {
  const query = search.toLocaleLowerCase("it").trim();
  return [
    ...conceptualCatalog.domains,
    {
      id: "unclassified",
      label: "Da classificare",
      description: "Tabelle nuove o non censite nel modello.",
    },
  ]
    .map((domain) => ({
      ...domain,
      tables: tables.filter((table) => {
        const meaning = tableMeanings[table.name];
        const concept = conceptualCatalog.concepts.find(
          (c) => c.id === meaning?.concept,
        );
        return (
          (meaning?.domain ?? "unclassified") === domain.id &&
          [
            table.name,
            meaning?.label,
            meaning?.grain,
            concept?.label,
            domain.label,
          ]
            .join(" ")
            .toLocaleLowerCase("it")
            .includes(query)
        );
      }),
    }))
    .filter((group) => group.tables.length > 0);
}
