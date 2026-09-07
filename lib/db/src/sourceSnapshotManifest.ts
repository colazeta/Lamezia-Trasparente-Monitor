export type SnapshotSource = {
  key: string;
  title: string;
  path: string;
  role: "public_projection" | "derived_dataset" | "source_snapshot";
  upstreamUrls: string[];
  collections: Record<string, string>;
};

/** Explicit scope: adding a file requires a reviewed source/collection mapping. */
export const sourceSnapshotManifest: SnapshotSource[] = [
  {
    key: "lamezia.albo.current",
    title: "Albo corrente — export pubblico del progetto",
    path: "data/public/albo/latest.json",
    role: "public_projection",
    upstreamUrls: ["https://albo.tinnvision.cloud/?ente=00301390795"],
    collections: { items: "id", excluded: "id" },
  },
  {
    key: "lamezia.albo.delibere",
    title: "Archivio delibere — export pubblico del progetto",
    path: "data/public/albo/delibere-archive.json",
    role: "public_projection",
    upstreamUrls: ["https://albo.tinnvision.cloud/?ente=00301390795"],
    collections: { items: "id" },
  },
  {
    key: "lamezia.pnrr.municipal",
    title: "PNRR — schede comunali, OpenCUP ed evidenze Albo",
    path: "artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json",
    role: "derived_dataset",
    upstreamUrls: [
      "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
      "https://www.opencup.gov.it/portale/web/opencup/home",
      "https://albo.tinnvision.cloud/?ente=00301390795",
    ],
    collections: { projects: "source_id", albo_evidence: "id" },
  },
  {
    key: "lamezia.anac.cig",
    title: "ANAC per CIG — snapshot e stato acquisizione",
    path: "data/public/contracts/anac-bdncp/latest.json",
    role: "source_snapshot",
    upstreamUrls: ["https://dati.anticorruzione.it/"],
    collections: { records: "cig" },
  },
  {
    key: "lamezia.anac.authority",
    title: "ANAC per amministrazione — snapshot e stato acquisizione",
    path: "data/public/contracts/anac-authority/latest.json",
    role: "source_snapshot",
    upstreamUrls: ["https://dati.anticorruzione.it/"],
    collections: { records: "cig" },
  },
];
