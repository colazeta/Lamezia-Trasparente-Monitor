import { spawn } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import type {
  DoclingExecutorArtifacts,
  DoclingProcessorExecutor,
  DoclingExecutorOutcome,
} from "../../api-server/src/lib/doclingProcessorAdapter";

const DEFAULT_PROCESSOR_SCRIPT = "tools/docling/processor_contract.py";
const DEFAULT_PYTHON_BIN = "python3";

export type WorkerDoclingExecutorConfig = {
  pythonBin?: string;
  processorScript?: string;
  tempRoot?: string;
};

function resolveProcessorScript(config: WorkerDoclingExecutorConfig): string {
  const configured =
    config.processorScript ?? process.env.DOCLING_PROCESSOR_SCRIPT?.trim();
  const value = configured || DEFAULT_PROCESSOR_SCRIPT;
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
}

function resolvePythonBin(config: WorkerDoclingExecutorConfig): string {
  return (
    config.pythonBin ?? process.env.DOCLING_PYTHON_BIN?.trim() ?? DEFAULT_PYTHON_BIN
  );
}

async function runProcessorProcess(input: {
  pythonBin: string;
  processorScript: string;
  requestPath: string;
  sourcePath: string;
  outputDir: string;
  signal: AbortSignal;
}): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(
      input.pythonBin,
      [
        input.processorScript,
        "--request",
        input.requestPath,
        "--source",
        input.sourcePath,
        "--output-dir",
        input.outputDir,
      ],
      {
        stdio: ["ignore", "ignore", "ignore"],
        signal: input.signal,
      },
    );

    child.once("error", rejectPromise);
    child.once("close", () => resolvePromise());
  });
}

function resultStatus(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const status = (value as Record<string, unknown>).status;
  return typeof status === "string" ? status : null;
}

async function readRequestedArtifacts(
  outputDir: string,
  requestedOutputs: readonly ("structured-json" | "markdown")[],
): Promise<DoclingExecutorArtifacts> {
  const artifacts: DoclingExecutorArtifacts = {};
  for (const kind of requestedOutputs) {
    const fileName = kind === "structured-json" ? "structured.json" : "document.md";
    artifacts[kind] = new Uint8Array(await readFile(join(outputDir, fileName)));
  }
  return artifacts;
}

/**
 * Worker-only local transport for the standalone Docling processor.
 *
 * The executor accepts only the already-validated request and source bytes from
 * the trusted adapter. It materialises them into a private temporary directory,
 * invokes the configured processor command, reads the declared output bytes
 * back into memory and removes the entire temporary tree in `finally`.
 *
 * No civic URL, object-storage locator or document content is placed on argv or
 * emitted to logs. The public API process never imports this module.
 */
export function createWorkerDoclingExecutor(
  config: WorkerDoclingExecutorConfig = {},
): DoclingProcessorExecutor {
  return async ({ request, sourceBytes, signal }): Promise<DoclingExecutorOutcome> => {
    const processorScript = resolveProcessorScript(config);
    const pythonBin = resolvePythonBin(config);
    await access(processorScript);

    const tempRoot = config.tempRoot ?? tmpdir();
    await mkdir(tempRoot, { recursive: true, mode: 0o700 });
    const workDir = await mkdtemp(join(tempRoot, "lt-docling-"));
    const requestPath = join(workDir, "request.json");
    const sourcePath = join(workDir, "source.pdf");
    const outputDir = join(workDir, "output");

    try {
      await mkdir(outputDir, { mode: 0o700 });
      await Promise.all([
        writeFile(requestPath, JSON.stringify(request), { mode: 0o600 }),
        writeFile(sourcePath, sourceBytes, { mode: 0o600 }),
      ]);

      await runProcessorProcess({
        pythonBin,
        processorScript,
        requestPath,
        sourcePath,
        outputDir,
        signal,
      });

      const resultText = await readFile(join(outputDir, "result.json"), "utf8");
      const result = JSON.parse(resultText) as unknown;
      const artifacts =
        resultStatus(result) === "ok"
          ? await readRequestedArtifacts(outputDir, request.requestedOutputs)
          : {};

      return { result, artifacts };
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  };
}
