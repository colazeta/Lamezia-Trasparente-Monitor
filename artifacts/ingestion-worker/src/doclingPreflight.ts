import { spawn } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_DOCLING_VERSION = "2.124.0";
const EXPECTED_PYPDF_VERSION = "6.16.2";
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const BUNDLED_PROCESSOR = resolve(MODULE_DIR, "docling/processor_contract.py");
const BUNDLED_REQUIREMENTS = resolve(MODULE_DIR, "docling/requirements.txt");
const DEFAULT_PYTHON_BIN = "python3";
const PREFLIGHT_TIMEOUT_MS = 10_000;
const MAX_RUNTIME_OUTPUT_CHARS = 512;

type PythonRuntimeState = {
  docling: string;
  pypdf: string;
  torchCuda: string | null;
  forbiddenGpuPackages: number;
};

async function pythonRuntimeState(pythonBin: string): Promise<PythonRuntimeState> {
  return new Promise<PythonRuntimeState>((resolvePromise, rejectPromise) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREFLIGHT_TIMEOUT_MS);
    let stdout = "";

    const code = [
      "import json",
      "import torch",
      "from importlib.metadata import distributions, version",
      "forbidden = [d.metadata.get('Name','') for d in distributions() if d.metadata.get('Name','').lower().startswith(('nvidia-','cuda-'))]",
      "print(json.dumps({'docling': version('docling'), 'pypdf': version('pypdf'), 'torchCuda': torch.version.cuda, 'forbiddenGpuPackages': len(forbidden)}))",
    ].join("; ");

    const child = spawn(pythonBin, ["-c", code], {
      stdio: ["ignore", "pipe", "ignore"],
      signal: controller.signal,
    });

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      if (stdout.length <= MAX_RUNTIME_OUTPUT_CHARS) stdout += chunk;
    });
    child.once("error", rejectPromise);
    child.once("close", (exitCode) => {
      clearTimeout(timer);
      if (exitCode !== 0) {
        rejectPromise(new Error("Python/Docling preflight command failed"));
        return;
      }
      if (!stdout.trim() || stdout.length > MAX_RUNTIME_OUTPUT_CHARS) {
        rejectPromise(new Error("Python/Docling preflight returned invalid output"));
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as PythonRuntimeState;
        resolvePromise(parsed);
      } catch {
        rejectPromise(new Error("Python/Docling preflight returned non-JSON output"));
      }
    });
  });
}

async function assertModelArtifactsReady(): Promise<void> {
  const configured = process.env.DOCLING_ARTIFACTS_PATH?.trim();
  if (!configured) {
    throw new Error("DOCLING_ARTIFACTS_PATH is required for offline activation");
  }
  const modelPath = resolve(configured);
  const info = await stat(modelPath);
  if (!info.isDirectory()) {
    throw new Error("Docling model artifact path is not a directory");
  }
  const entries = await readdir(modelPath);
  if (entries.length === 0) {
    throw new Error("Docling model artifact directory is empty");
  }
}

export async function assertDoclingWorkerReady(): Promise<{
  status: "ok";
  doclingVersion: string;
  pypdfVersion: string;
  modelArtifacts: "ready";
}> {
  await Promise.all([access(BUNDLED_PROCESSOR), access(BUNDLED_REQUIREMENTS)]);

  const requirements = await readFile(BUNDLED_REQUIREMENTS, "utf8");
  const pinnedLines = new Set(
    requirements
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean),
  );
  if (!pinnedLines.has(`docling==${EXPECTED_DOCLING_VERSION}`)) {
    throw new Error("Bundled Docling requirement does not match worker expectation");
  }
  if (!pinnedLines.has(`pypdf==${EXPECTED_PYPDF_VERSION}`)) {
    throw new Error("Bundled pypdf requirement does not match worker expectation");
  }

  await assertModelArtifactsReady();

  const pythonBin = process.env.DOCLING_PYTHON_BIN?.trim() || DEFAULT_PYTHON_BIN;
  const runtime = await pythonRuntimeState(pythonBin);
  if (runtime.docling !== EXPECTED_DOCLING_VERSION) {
    throw new Error("Installed Docling version does not match worker expectation");
  }
  if (runtime.pypdf !== EXPECTED_PYPDF_VERSION) {
    throw new Error("Installed pypdf version does not match worker expectation");
  }
  if (runtime.torchCuda !== null || runtime.forbiddenGpuPackages !== 0) {
    throw new Error("Docling worker environment is not CPU-only");
  }

  return {
    status: "ok",
    doclingVersion: runtime.docling,
    pypdfVersion: runtime.pypdf,
    modelArtifacts: "ready",
  };
}

assertDoclingWorkerReady()
  .then((result) => {
    process.stdout.write(
      JSON.stringify({
        status: result.status,
        processor: "docling",
        version: result.doclingVersion,
        embeddedExtractor: "pypdf",
        embeddedExtractorVersion: result.pypdfVersion,
        modelArtifacts: result.modelArtifacts,
        networkInstallAttempted: false,
      }) + "\n",
    );
  })
  .catch(() => {
    process.stderr.write(
      "Docling worker preflight failed: pinned CPU-only dependencies, bundled assets or prefetched model artifacts are unavailable.\n",
    );
    process.exitCode = 1;
  });
