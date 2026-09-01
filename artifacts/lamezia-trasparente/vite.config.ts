import { existsSync, readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

import {
  ALBO_DOCUMENT_PREFIX,
  alboDocumentServingFiles,
  pruneUnallowlistedAlboDocumentFiles,
  readVerifiedAlboDocument,
} from "./albo-document-serving";
import {
  buildStaticContractsDataset,
  STATIC_CONTRACTS_DATA_PATH,
  type AlboPublicSnapshot,
} from "./src/lib/staticContractsDataset";
import { validateAnacBdncpSyncSnapshot } from "./src/lib/anacBdncpSync";

const rawPort = process.env.PORT ?? "8081";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const alboPublicSnapshotPath = "data/public/albo/latest.json";
const anacBdncpSnapshotPath = "data/public/contracts/anac-bdncp/latest.json";
const atlantePublicDataFiles = [
  "data/processed/territorio/lamezia_confine_comunale.geojson",
  "data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
  "data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json",
  "data/processed/territorio/istat_indicator_dictionary.json",
  "data/processed/territorio/beni_confiscati_lamezia.geojson",
  "data/processed/territorio/spatial_layer_manifest.json",
  "data/curated/territorio/beni_confiscati_lamezia_pilot.json",
];
function repoPublicDataPlugin(): Plugin {
  return {
    name: "repo-public-data",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestPath = decodeURIComponent(
          request.url?.split("?")[0] ?? "",
        );
        const relativePath =
          atlantePublicDataFiles.find(
            (candidate) => requestPath === `/${candidate}`,
          ) ??
          (requestPath.startsWith(`/${ALBO_DOCUMENT_PREFIX}`) &&
          /\.pdf$/i.test(requestPath)
            ? requestPath.slice(1)
            : null);

        if (requestPath === `/${STATIC_CONTRACTS_DATA_PATH}`) {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(`${JSON.stringify(readStaticContractsDataset())}\n`);
          return;
        }

        if (!relativePath || relativePath.includes("..")) {
          next();
          return;
        }

        const source = relativePath.startsWith(ALBO_DOCUMENT_PREFIX)
          ? readVerifiedAlboDocument(repoRoot, relativePath)
          : readRepoFile(relativePath);
        if (!source) {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", contentTypeFor(relativePath));
        response.end(source);
      });
    },
    generateBundle() {
      for (const relativePath of [
        ...atlantePublicDataFiles,
        ...alboDocumentServingFiles(repoRoot),
      ]) {
        const source = relativePath.startsWith(ALBO_DOCUMENT_PREFIX)
          ? readVerifiedAlboDocument(repoRoot, relativePath)
          : readRepoFile(relativePath);
        if (!source) {
          if (relativePath.startsWith(ALBO_DOCUMENT_PREFIX)) {
            throw new Error(
              `Allow-listed Albo PDF is missing or has an invalid digest: ${relativePath}`,
            );
          }
          continue;
        }

        this.emitFile({
          type: "asset",
          fileName: relativePath,
          source,
        });
      }

      this.emitFile({
        type: "asset",
        fileName: STATIC_CONTRACTS_DATA_PATH,
        source: `${JSON.stringify(readStaticContractsDataset())}\n`,
      });
    },
    writeBundle(outputOptions) {
      const outputDir = outputOptions.dir
        ? path.resolve(outputOptions.dir)
        : path.resolve(import.meta.dirname, "dist/public");
      pruneUnallowlistedAlboDocumentFiles(repoRoot, outputDir);
    },
  };
}

function readRepoFile(relativePath: string): Buffer | null {
  const sourcePath = path.join(repoRoot, relativePath);
  return existsSync(sourcePath) ? readFileSync(sourcePath) : null;
}

function readStaticContractsDataset() {
  const source = readRepoFile(alboPublicSnapshotPath);
  if (!source) {
    throw new Error(
      `Public Albo snapshot is required to build contracts: ${alboPublicSnapshotPath}`,
    );
  }

  let snapshot: AlboPublicSnapshot;
  try {
    snapshot = JSON.parse(source.toString("utf8")) as AlboPublicSnapshot;
  } catch (error) {
    throw new Error(
      `Public Albo snapshot is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  const anacSource = readRepoFile(anacBdncpSnapshotPath);
  if (!anacSource) {
    throw new Error(
      `ANAC/BDNCP snapshot is required to build contracts: ${anacBdncpSnapshotPath}`,
    );
  }

  let anacSnapshot;
  try {
    anacSnapshot = validateAnacBdncpSyncSnapshot(
      JSON.parse(anacSource.toString("utf8")),
    );
  } catch (error) {
    throw new Error(
      `ANAC/BDNCP snapshot is not valid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return buildStaticContractsDataset(snapshot, anacSnapshot);
}

function contentTypeFor(filePath: string) {
  if (filePath.endsWith(".pdf")) return "application/pdf";
  return filePath.endsWith(".geojson")
    ? "application/geo+json; charset=utf-8"
    : "application/json; charset=utf-8";
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    repoPublicDataPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
