import { Router, type IRouter } from "express";
import {
  db,
  opendataDatasetsTable,
  opendataResourcesTable,
} from "@workspace/db";
import {
  DCAT_AP_IT_PROFILE,
  validateDcatApItDataset,
} from "../lib/dcat";

const router: IRouter = Router();

router.get("/opendata/dcat-ap-it/validation", async (_req, res) => {
  const datasets = await db.select().from(opendataDatasetsTable);
  const resources = await db.select().from(opendataResourcesTable);

  const resourcesByDataset = new Map<
    number,
    (typeof opendataResourcesTable.$inferSelect)[]
  >();
  for (const resource of resources) {
    const current = resourcesByDataset.get(resource.datasetId) ?? [];
    current.push(resource);
    resourcesByDataset.set(resource.datasetId, current);
  }

  const results = datasets
    .map((dataset) => ({
      id: dataset.id,
      sourceId: dataset.sourceId,
      slug: dataset.slug,
      title: dataset.title,
      ...validateDcatApItDataset(
        dataset,
        resourcesByDataset.get(dataset.id) ?? [],
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "it"));

  const conforming = results.filter((result) => result.conforms).length;

  res.json({
    profile: DCAT_AP_IT_PROFILE,
    profileDocumentation:
      "https://docs.italia.it/italia/daf/linee-guida-cataloghi-dati-dcat-ap-it/it/stabile/",
    validationScope:
      "Mandatory source-backed DCAT-AP_IT fields enforceable by the local projection; this diagnostic does not replace an external RDF/SHACL validator.",
    conforms: results.length > 0 && conforming === results.length,
    summary: {
      datasets: results.length,
      conforming,
      nonConforming: results.length - conforming,
    },
    results,
  });
});

export default router;
