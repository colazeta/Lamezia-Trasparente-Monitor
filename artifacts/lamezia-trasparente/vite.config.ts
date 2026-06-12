import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import {
  generatePublicSeoAssets,
  normalizePublicSiteUrl,
} from "./scripts/generate-public-seo-assets.mjs";

const rawPort = process.env.PORT ?? "8081";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const publicDir = path.resolve(import.meta.dirname, "public");
const publicOutputDir = path.resolve(import.meta.dirname, "dist", "public");

export function resolvePublicSeoAssetsBuildOptions(
  mode: string,
  envDir = import.meta.dirname,
) {
  const env = loadEnv(mode, envDir, ["BASE_PATH", "VITE_"]);
  const basePath = env.BASE_PATH ?? "/";
  const siteUrl = normalizePublicSiteUrl(env.VITE_PUBLIC_SITE_URL, {
    basePath,
  });

  return { basePath, siteUrl };
}

export default defineConfig(async ({ mode }) => {
  const { basePath, siteUrl } = resolvePublicSeoAssetsBuildOptions(mode);

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      {
        name: "lamezia-public-seo-assets",
        apply: "build",
        writeBundle() {
          generatePublicSeoAssets({
            publicDir,
            outputDir: publicOutputDir,
            basePath,
            siteUrl,
          });
        },
      },
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
      outDir: publicOutputDir,
      emptyOutDir: true,
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
  };
});
