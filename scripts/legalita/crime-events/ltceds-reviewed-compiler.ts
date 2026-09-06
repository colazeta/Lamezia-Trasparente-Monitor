import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { LtcedsPublicAnchor } from "@workspace/publication-standardisation/ltceds-location";

import {
  compileReviewedBundle,
  markReviewedPublicSchemaPassed,
  reviewedPlanReadyForWrite,
  type CompiledReviewedPlan,
  type ReviewedEventBundle,
} from "./ltceds-reviewed-compiler-core";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
const REVIEWED_SCHEMA_CHECK = path.join(
  REPO_ROOT,
  "scripts/legalita/crime-events/ltceds-reviewed-bundle-check.py",
);
const PUBLIC_SCHEMA_CHECK = path.join(
  REPO_ROOT,
  "scripts/legalita/crime-events/ltceds-schema-check.py",
);
const DEFAULT_ANCHORS_PATH = path.join(
  REPO_ROOT,
  "data/processed/legalita/ltceds_public_anchors.json",
);

interface CliArgs {
  bundlePath: string;
  anchorsPath: string | null;
  write: boolean;
}

function parseArgs(argv: readonly string[]): CliArgs {
  let bundlePath: string | null = null;
  let anchorsPath: string | null = null;
  let write = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--anchors") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--anchors requires a JSON snapshot path");
      }
      anchorsPath = path.resolve(value);
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) throw new Error(`unknown argument: ${arg}`);
    if (bundlePath) throw new Error("exactly one reviewed bundle path is allowed");
    bundlePath = path.resolve(arg);
  }

  if (!bundlePath) {
    throw new Error(
      "usage: compile:ltceds-reviewed <bundle.json> [--anchors snapshot.json] [--write]",
    );
  }
  return { bundlePath, anchorsPath, write };
}

function runPythonValidator(script: string, args: readonly string[]): void {
  const executable = process.platform === "win32" ? "python.exe" : "python";
  const result = spawnSync(executable, [script, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw new Error(
      `${path.basename(script)} failed with exit status ${result.status ?? "unknown"}${
        detail ? `: ${detail}` : ""
      }`,
    );
  }
}

function finitePoint(anchor: LtcedsPublicAnchor): boolean {
  return Boolean(
    anchor.geometry &&
      anchor.geometry.type === "Point" &&
      Array.isArray(anchor.geometry.coordinates) &&
      anchor.geometry.coordinates.length === 2 &&
      Number.isFinite(anchor.geometry.coordinates[0]) &&
      Number.isFinite(anchor.geometry.coordinates[1]) &&
      anchor.geometry.coordinates[0] >= -180 &&
      anchor.geometry.coordinates[0] <= 180 &&
      anchor.geometry.coordinates[1] >= -90 &&
      anchor.geometry.coordinates[1] <= 90,
  );
}

function assertAnchor(value: unknown, index: number): asserts value is LtcedsPublicAnchor {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`anchor[${index}] must be an object`);
  }
  const anchor = value as Partial<LtcedsPublicAnchor>;
  if (!anchor.anchor_id?.trim() || !anchor.scope_key?.trim()) {
    throw new Error(`anchor[${index}] requires anchor_id and scope_key`);
  }
  if (!(["street_anchor", "neighbourhood_anchor", "locality_anchor"] as const).includes(anchor.kind as never)) {
    throw new Error(`anchor[${index}] has unsupported kind`);
  }
  if (!(["street_segment", "neighbourhood", "locality"] as const).includes(anchor.precision as never)) {
    throw new Error(`anchor[${index}] has unsupported precision`);
  }
  if (!finitePoint(anchor as LtcedsPublicAnchor)) {
    throw new Error(`anchor[${index}] must contain a finite WGS84 Point`);
  }
}

async function loadAnchors(explicitPath: string | null): Promise<{
  anchors: LtcedsPublicAnchor[];
  path: string | null;
  status: "loaded" | "not_available";
}> {
  const candidatePath = explicitPath ?? DEFAULT_ANCHORS_PATH;
  try {
    await access(candidatePath);
  } catch {
    if (explicitPath) throw new Error(`explicit public-anchor snapshot not found: ${candidatePath}`);
    return { anchors: [], path: null, status: "not_available" };
  }

  const parsed = JSON.parse(await readFile(candidatePath, "utf8")) as unknown;
  const rawAnchors = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { anchors?: unknown }).anchors)
      ? (parsed as { anchors: unknown[] }).anchors
      : null;
  if (!rawAnchors) throw new Error("public-anchor snapshot must be an array or an object with anchors[]");
  rawAnchors.forEach(assertAnchor);
  return {
    anchors: rawAnchors,
    path: candidatePath,
    status: "loaded",
  };
}

async function validatePublicProjection(plan: CompiledReviewedPlan): Promise<CompiledReviewedPlan> {
  if (!plan.public_projection) return plan;
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "ltceds-public-"));
  const payloadPath = path.join(temporaryDirectory, "public-event.json");
  try {
    await writeFile(
      payloadPath,
      `${JSON.stringify(plan.public_projection.payload, null, 2)}\n`,
      "utf8",
    );
    runPythonValidator(PUBLIC_SCHEMA_CHECK, [payloadPath]);
    return markReviewedPublicSchemaPassed(plan);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function auditReport(
  plan: CompiledReviewedPlan,
  options: {
    mode: "dry-run" | "write";
    bundlePath: string;
    anchorsPath: string | null;
    anchorCount: number;
    anchorStatus: "loaded" | "not_available";
  },
): Record<string, unknown> {
  return {
    ok: true,
    mode: options.mode,
    bundle: {
      path: path.relative(REPO_ROOT, options.bundlePath) || options.bundlePath,
      sha256: plan.bundle_sha256,
      event_id: plan.event_id,
      publication_intent: plan.publication_intent,
      reviewed_at: plan.reviewed_at,
    },
    anchors: {
      status: options.anchorStatus,
      path: options.anchorsPath
        ? path.relative(REPO_ROOT, options.anchorsPath) || options.anchorsPath
        : null,
      available: options.anchorCount,
      selected_anchor_ids: plan.selected_anchor_ids,
    },
    gates: plan.gates,
    canonical: {
      event_count: 1,
      source_count: plan.canonical.sources.length,
      offence_count: plan.canonical.offences.length,
      location_count: plan.canonical.locations.length,
      cluster_membership_count: plan.canonical.cluster_memberships.length,
    },
    public_projection: plan.public_projection
      ? {
          payload_sha256: plan.public_projection.payloadSha256,
          record_status: plan.public_projection.payload.record_status,
          privacy_tier: plan.public_projection.payload.privacy_tier,
          default_map_points: plan.geoprivacy.filter((item) => item.map_default).length,
        }
      : null,
    geoprivacy: plan.geoprivacy,
    database_action:
      options.mode === "write"
        ? "delegated_to_transactional_db_writer"
        : "not_executed_dry_run",
  };
}

async function writePlan(plan: CompiledReviewedPlan): Promise<void> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "ltceds-plan-"));
  const planPath = path.join(temporaryDirectory, "attested-plan.json");
  try {
    await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
    const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const result = spawnSync(
      executable,
      [
        "--filter",
        "@workspace/db",
        "run",
        "apply:ltceds-reviewed-plan",
        "--",
        planPath,
      ],
      { cwd: REPO_ROOT, stdio: "inherit", env: process.env },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `transactional reviewed-plan writer failed with exit status ${result.status ?? "unknown"}`,
      );
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  runPythonValidator(REVIEWED_SCHEMA_CHECK, [args.bundlePath]);

  const bundle = JSON.parse(await readFile(args.bundlePath, "utf8")) as ReviewedEventBundle;
  const anchorSnapshot = await loadAnchors(args.anchorsPath);
  let plan = compileReviewedBundle(bundle, anchorSnapshot.anchors);
  plan = await validatePublicProjection(plan);
  if (!reviewedPlanReadyForWrite(plan)) {
    throw new Error("reviewed plan is not ready for persistence after compilation gates");
  }

  if (args.write) await writePlan(plan);
  process.stdout.write(
    `${JSON.stringify(
      auditReport(plan, {
        mode: args.write ? "write" : "dry-run",
        bundlePath: args.bundlePath,
        anchorsPath: anchorSnapshot.path,
        anchorCount: anchorSnapshot.anchors.length,
        anchorStatus: anchorSnapshot.status,
      }),
      null,
      2,
    )}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })}\n`,
  );
  process.exitCode = 1;
});
