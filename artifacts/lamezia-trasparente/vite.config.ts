import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "8081";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const atlantePublicDataFiles = [
  "data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
  "data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json",
  "data/processed/territorio/istat_indicator_dictionary.json",
];
const alboDocumentPrefix = "data/public/albo/documents/";

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
          (requestPath.startsWith(`/${alboDocumentPrefix}`) && /\.pdf$/i.test(requestPath)
            ? requestPath.slice(1)
            : null);

        if (!relativePath || relativePath.includes("..")) {
          next();
          return;
        }

        const sourcePath = path.join(repoRoot, relativePath);
        if (!existsSync(sourcePath)) {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", contentTypeFor(relativePath));
        response.end(readFileSync(sourcePath));
      });
    },
    generateBundle() {
      for (const relativePath of [...atlantePublicDataFiles, ...alboDocumentFiles()]) {
        const sourcePath = path.join(repoRoot, relativePath);
        if (!existsSync(sourcePath)) {
          continue;
        }

        this.emitFile({
          type: "asset",
          fileName: relativePath,
          source: readFileSync(sourcePath),
        });
      }
    },
  };
}

function alboDocumentFiles(): string[] {
  const root = path.join(repoRoot, alboDocumentPrefix);
  if (!existsSync(root)) return [];

  const files: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (stat.isFile() && /\.pdf$/i.test(entry)) {
        files.push(path.relative(repoRoot, fullPath).replace(/\\/g, "/"));
      }
    }
  };
  visit(root);
  return files;
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
