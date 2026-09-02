import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_DOCLING_VERSION = "2.124.0";
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const BUNDLED_PROCESSOR = resolve(MODULE_DIR, "docling/processor_contract.py");
const BUNDLED_REQUIREMENTS = resolve(MODULE_DIR, "docling/requirements.txt");
const DEFAULT_PYTHON_BIN = "python3";
const PREFLIGHT_TIMEOUT_MS = 10_000;
const MAX_VERSION_OUTPUT_CHARS = 128;

async function installedDoclingVersion(pythonBin: string): Promise<string> {
  return new Promise<string>((resolvePromise, rejectPromise) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREFLIGHT_TIMEOUT_MS);
    let stdout = "";

    const child = spawn(
      pythonBin,
      [
        "-c",
        "from importlib.metadata import version; print(version('docling'))",
      ],
      {
        stdio: ["ignore", "pipe", "ignore"],
        signal: controller.signal,
      },
    );

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      if (stdout.length <= MAX_VERSION_OUTPUT_CHARS) stdout += chunk;
    });
    child.once("error", rejectPromise);
    child.once("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        rejectPromise(new Error("Python/Docling preflight command failed"));
        return;
      }
      const value = stdout.trim();
      if (!value || value.length > MAX_VERSION_OUTPUT_CHARS) {
        rejectPromise(new Error("Python/Docling preflight returned invalid version output"));
        return;
      }
      resolvePromise(value);
    });
  });
}

export async function assertDoclingWorkerReady(): Promise<{
  status: "ok";
  doclingVersion: string;
}> {
  await Promise.all([access(BUNDLED_PROCESSOR), access(BUNDLED_REQUIREMENTS)]);

  const requirements = await readFile(BUNDLED_REQUIREMENTS, "utf8");
  const pinned = requirements
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .some((line) => line === `docling==${EXPECTED_DOCLING_VERSION}`);
  if (!pinned) {
    throw new Error("Bundled Docling requirement does not match worker expectation");
  }

  const pythonBin = process.env.DOCLING_PYTHON_BIN?.trim() || DEFAULT_PYTHON_BIN;
  const installed = await installedDoclingVersion(pythonBin);
  if (installed !== EXPECTED_DOCLING_VERSION) {
    throw new Error("Installed Docling version does not match worker expectation");
  }

  return { status: "ok", doclingVersion: installed };
}

assertDoclingWorkerReady()
  .then((result) => {
    process.stdout.write(
      JSON.stringify({
        status: result.status,
        processor: "docling",
        version: result.doclingVersion,
        networkInstallAttempted: false,
      }) + "\n",
    );
  })
  .catch(() => {
    process.stderr.write(
      "Docling worker preflight failed: bundled assets or pinned Python dependency are unavailable.\n",
    );
    process.exitCode = 1;
  });
