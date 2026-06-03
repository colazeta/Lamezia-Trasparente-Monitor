/**
 * Pre-flight CLI: scans the generated migration SQL for destructive statements
 * and fails (exit code 1) if any are found without an explicit
 * `-- allow-destructive: <reason>` annotation.
 *
 * Runs automatically after `generate` (see package.json) so a newly generated
 * migration is checked the moment it is produced, and can be run on its own in
 * CI:
 *
 *   pnpm --filter @workspace/db run check-migrations
 *
 * See {@link ./migrationSafety} for the scanning rules and how to opt in to an
 * intentional destructive change.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatOffenses, scanMigrationsFolder } from "./migrationSafety";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../migrations");

const offenses = scanMigrationsFolder(migrationsFolder);

if (offenses.length > 0) {
  console.error(`\n✗ Migration safety check failed.\n\n${formatOffenses(offenses)}\n`);
  process.exit(1);
}

console.log("✓ Migration safety check passed: no destructive statements found.");
