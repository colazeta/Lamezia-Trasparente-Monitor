import { existsSync, readFileSync } from "node:fs";
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

function atlantePublicDataPlugin(): Plugin {
  return {
    name: "atlante-public-data",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestPath = decodeURIComponent(
          request.url?.split("?")[0] ?? "",
        );
        const relativePath = atlantePublicDataFiles.find(
          (candidate) => requestPath === `/${candidate}`,
        );

        if (!relativePath) {
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
      for (const relativePath of atlantePublicDataFiles) {
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

function contentTypeFor(filePath: string) {
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
    atlantePublicDataPlugin(),
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
