import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { expect, test } from "vitest";

test("bundling the database barrel does not execute import CLIs or open connections", async () => {
  const artifactDir = fileURLToPath(new URL("../../", import.meta.url));
  const directory = await mkdtemp(path.join(tmpdir(), "lt-database-bundle-"));
  try {
    const guard = path.join(directory, "guard.mjs");
    await writeFile(
      guard,
      `
      import childProcess from 'node:child_process';
      import net from 'node:net';
      import { syncBuiltinESMExports } from 'node:module';
      for (const name of ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork']) {
        childProcess[name] = () => { throw new Error('UNEXPECTED_IMPORT_CLI'); };
      }
      net.Socket.prototype.connect = () => { throw new Error('UNEXPECTED_DATABASE_CONNECTION'); };
      syncBuiltinESMExports();
    `,
    );
    const outfile = path.join(directory, "index.mjs");
    await build({
      stdin: {
        contents: `import * as db from '@workspace/db'; console.log('DATABASE_LIBRARY_READY', Object.keys(db).length);`,
        resolveDir: artifactDir,
      },
      outfile,
      platform: "node",
      bundle: true,
      format: "esm",
      external: ["pg-native"],
      banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const __dirname = import.meta.dirname;",
      },
      logLevel: "silent",
    });
    // Run as an entrypoint, exactly where an import.meta.url/argv guard used
    // inside a bundled dependency accidentally considers itself the main CLI.
    const result = spawnSync(process.execPath, ["--import", guard, outfile], {
      encoding: "utf8",
      timeout: 10_000,
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://unused:unused@127.0.0.1:1/unused",
      },
    });
    expect(result.error).toBeUndefined();
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^DATABASE_LIBRARY_READY \d+\s*$/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
