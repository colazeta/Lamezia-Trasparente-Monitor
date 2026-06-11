export type SmokeCategory =
  | "frontend-static"
  | "api-health"
  | "public-api"
  | "worker-status"
  | "storage-links"
  | "key-data-pages";

export type SmokeCheckMode = "manual" | "dry-run" | "read-only";

export interface SmokeCheck {
  readonly id: string;
  readonly category: SmokeCategory;
  readonly title: string;
  readonly target: string;
  readonly mode: SmokeCheckMode;
  readonly requiredEnv: readonly string[];
  readonly optionalEnv: readonly string[];
  readonly safeCommand?: string;
  readonly expectedSignal: string;
  readonly passCriteria: string;
  readonly failureReason: string;
  readonly notes: string;
}

export interface SmokePlanValidation {
  readonly ok: boolean;
  readonly failures: readonly string[];
  readonly warnings: readonly string[];
  readonly configuredEnvironment: Record<string, "set" | "missing">;
}

export interface RenderSmokePlanOptions {
  readonly env?: NodeJS.ProcessEnv;
}

export const REQUIRED_SMOKE_CATEGORIES = [
  "frontend-static",
  "api-health",
  "public-api",
  "worker-status",
  "storage-links",
  "key-data-pages",
] as const satisfies readonly SmokeCategory[];

const SECRET_NAME_PATTERN = /(?:SECRET|TOKEN|PASSWORD|KEY|CREDENTIAL|PRIVATE)/i;

export const productionSmokeChecks: readonly SmokeCheck[] = [
  {
    id: "01-frontend-static-build",
    category: "frontend-static",
    title: "Frontend static build artifact present",
    target: "artifacts/lamezia-trasparente dist output from the reviewed build",
    mode: "dry-run",
    requiredEnv: [],
    optionalEnv: ["PUBLIC_BASE_URL"],
    safeCommand: "pnpm --filter ./artifacts/lamezia-trasparente run build",
    expectedSignal:
      "The build command completes locally and the reviewer records the immutable artifact or deployment identifier.",
    passCriteria:
      "Build exits with code 0; no production URL is fetched during this dry-run check.",
    failureReason:
      "Static frontend build cannot be produced from the reviewed revision; stop promotion and inspect build logs.",
    notes:
      "Use this as a pre-cutover artifact check only. Do not probe the public site from this helper.",
  },
  {
    id: "02-public-pages-shell",
    category: "frontend-static",
    title: "Public page shells included in the reviewed frontend",
    target:
      "/, /albo, /contratti, /bandi, /beni-confiscati, /fonti-dati, /stato-monitoraggio",
    mode: "manual",
    requiredEnv: [],
    optionalEnv: ["PUBLIC_BASE_URL"],
    expectedSignal:
      "Reviewer confirms the listed routes are in the reviewed routing inventory before any live verification window.",
    passCriteria:
      "Key civic routes are included in the built frontend and remain readable on mobile-sized viewports in local/staging review.",
    failureReason:
      "A key route is missing from the build or cannot be reviewed safely before production validation.",
    notes:
      "Manual checklist item; it describes intended production validation without opening live URLs.",
  },
  {
    id: "03-api-health-contract",
    category: "api-health",
    title: "API health endpoint contract known",
    target: "GET /api/healthz",
    mode: "read-only",
    requiredEnv: ["API_BASE_URL"],
    optionalEnv: [],
    expectedSignal:
      "During the approved validation window, GET /api/healthz returns a JSON health status over the configured base URL.",
    passCriteria:
      "HTTP 200 and a JSON object with a status field; no credentials are required or printed.",
    failureReason:
      "Health endpoint is unreachable, returns non-JSON, or reports an unexpected status.",
    notes:
      "This plan validates configuration only; it does not call the endpoint.",
  },
  {
    id: "04-public-api-read-only",
    category: "public-api",
    title: "Essential public API read-only endpoints identified",
    target:
      "GET /api/publications, /api/contracts, /api/bandi, /api/beni-confiscati, /api/stats/overview",
    mode: "read-only",
    requiredEnv: ["API_BASE_URL"],
    optionalEnv: [],
    expectedSignal:
      "Approved smoke execution can retrieve bounded read-only JSON responses for essential public datasets.",
    passCriteria:
      "Each selected endpoint returns HTTP 200 JSON or a documented empty-state response without mutation.",
    failureReason:
      "One or more essential public API reads fail, time out, or return a shape not compatible with the reviewed client contract.",
    notes:
      "Keep requests bounded and read-only; this dry-run helper never performs the reads.",
  },
  {
    id: "05-worker-status-one-shot",
    category: "worker-status",
    title: "Worker status can be verified without starting scheduled work",
    target:
      "existing feed-status/status views and one-shot logs from the reviewed release",
    mode: "manual",
    requiredEnv: [],
    optionalEnv: ["WORKER_STATUS_REFERENCE"],
    expectedSignal:
      "Operator can point to the latest reviewed one-shot execution result or feed-status record without enabling a scheduler.",
    passCriteria:
      "Status evidence is recent for the release window or a clear data gap is documented for follow-up.",
    failureReason:
      "No safe one-shot/status evidence is available, or validation would require enabling a production scheduler.",
    notes:
      "Do not run ingestion, schedulers, or source-health probes as part of this helper.",
  },
  {
    id: "06-storage-public-link-sanity",
    category: "storage-links",
    title: "Storage/public file link sanity is checkable without writes",
    target: "known public document/download links already rendered by the app",
    mode: "manual",
    requiredEnv: [],
    optionalEnv: ["PUBLIC_STORAGE_BASE_URL"],
    expectedSignal:
      "Approved validation can open a small sample of existing public links without upload, deletion, or credential use.",
    passCriteria:
      "Sampled public links resolve or fail with documented source limitations; no storage mutation is attempted.",
    failureReason:
      "Public links are broken, require unexpected credentials, or cannot be sampled without write-capable access.",
    notes:
      "Storage checks are link-sanity only. Never upload, overwrite, delete, or list private buckets.",
  },
  {
    id: "07-key-data-pages",
    category: "key-data-pages",
    title: "Key data pages have a bounded production smoke list",
    target:
      "/albo, /contratti, /bandi, /beni-confiscati, /accesso-civico, /performance, /legalita, /fonti-dati",
    mode: "manual",
    requiredEnv: [],
    optionalEnv: ["PUBLIC_BASE_URL"],
    expectedSignal:
      "Reviewer uses the checklist to verify that key data pages render explanatory, non-accusatory empty/loading/error states.",
    passCriteria:
      "Pages render with accessible headings, cautious copy, and source/limitation context where applicable.",
    failureReason:
      "A key data page fails to render or presents data/status wording without the expected caveats.",
    notes: "This is a smoke-readiness list, not a live crawler or UI rewrite.",
  },
];

export function validateSmokePlan(
  checks: readonly SmokeCheck[] = productionSmokeChecks,
  env: NodeJS.ProcessEnv = process.env,
): SmokePlanValidation {
  const failures: string[] = [];
  const warnings: string[] = [];
  const configuredEnvironment: Record<string, "set" | "missing"> = {};
  const ids = new Set<string>();

  const categories = new Set(checks.map((check) => check.category));
  for (const category of REQUIRED_SMOKE_CATEGORIES) {
    if (!categories.has(category)) {
      failures.push(`Missing required smoke category: ${category}.`);
    }
  }

  const orderedIds = checks.map((check) => check.id);
  const sortedIds = [...orderedIds].sort((left, right) =>
    left.localeCompare(right),
  );
  if (orderedIds.join("\n") !== sortedIds.join("\n")) {
    failures.push("Smoke checks must be ordered deterministically by id.");
  }

  for (const check of checks) {
    if (ids.has(check.id)) {
      failures.push(`Duplicate smoke check id: ${check.id}.`);
    }
    ids.add(check.id);

    if (!check.failureReason.trim()) {
      failures.push(
        `Smoke check ${check.id} must include a readable failure reason.`,
      );
    }

    if (hasLiveHardcodedUrl(check)) {
      failures.push(
        `Smoke check ${check.id} must not require a hardcoded live URL.`,
      );
    }

    for (const envName of [...check.requiredEnv, ...check.optionalEnv]) {
      configuredEnvironment[envName] = env[envName]?.trim() ? "set" : "missing";
      if (SECRET_NAME_PATTERN.test(envName)) {
        failures.push(
          `Smoke check ${check.id} must not request secret-like environment variable ${envName}.`,
        );
      }
    }

    for (const envName of check.requiredEnv) {
      if (!env[envName]?.trim()) {
        warnings.push(
          `Environment variable ${envName} is not set for ${check.id}; dry-run only.`,
        );
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    configuredEnvironment,
  };
}

export function renderSmokePlan(options: RenderSmokePlanOptions = {}): string {
  const validation = validateSmokePlan(
    productionSmokeChecks,
    options.env ?? process.env,
  );
  const lines = [
    "Production smoke validation plan (dry-run)",
    "==========================================",
    "",
    "This helper prints the planned checks and validates minimum non-secret configuration only.",
    "It does not call production endpoints, run schedulers, upload files, or delete files.",
    "",
    `Plan validation: ${validation.ok ? "ok" : "failed"}`,
  ];

  if (validation.warnings.length > 0) {
    lines.push("", "Configuration warnings:");
    for (const warning of validation.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  if (validation.failures.length > 0) {
    lines.push("", "Plan failures:");
    for (const failure of validation.failures) {
      lines.push(`- ${failure}`);
    }
  }

  lines.push("", "Environment presence:");
  const envEntries = Object.entries(validation.configuredEnvironment).sort(
    ([left], [right]) => left.localeCompare(right),
  );
  if (envEntries.length === 0) {
    lines.push("- No environment variables required for dry-run rendering.");
  } else {
    for (const [name, state] of envEntries) {
      lines.push(`- ${name}: ${state}`);
    }
  }

  lines.push("", "Checks:");
  for (const check of productionSmokeChecks) {
    lines.push(
      `- ${check.id} [${check.category}] ${check.title}`,
      `  Target: ${check.target}`,
      `  Mode: ${check.mode}`,
      `  Pass: ${check.passCriteria}`,
      `  If failing: ${check.failureReason}`,
    );
    if (check.safeCommand) {
      lines.push(`  Safe command: ${check.safeCommand}`);
    }
  }

  return lines.join("\n");
}

function hasLiveHardcodedUrl(check: SmokeCheck): boolean {
  const fields = [
    check.target,
    check.expectedSignal,
    check.passCriteria,
    check.failureReason,
    check.notes,
    check.safeCommand ?? "",
  ];

  return fields.some((field) => /https?:\/\//i.test(field));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const output = renderSmokePlan();
  console.log(output);
  const validation = validateSmokePlan();
  if (!validation.ok) {
    process.exitCode = 1;
  }
}
