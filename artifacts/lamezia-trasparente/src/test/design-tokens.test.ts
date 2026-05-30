import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Files / directories that are allowed to use raw color literals.
 *
 * - `components/ui/**` are vendor (shadcn) primitives whose overlay scrims use
 *   `bg-black/80` by convention; not our brand surfaces.
 * - `index.css` is where the design tokens themselves are defined.
 * - `Home.tsx` and `not-found.tsx` render an intentionally dark, fixed brand
 *   hero (deep navy background) where white text/borders are the correct,
 *   theme-independent choice.
 */
const ALLOWED = [
  "components/ui/",
  "index.css",
  "pages/Home.tsx",
  "pages/not-found.tsx",
  "test/",
];

const FORBIDDEN_CLASSES = [
  "text-white",
  "text-black",
  "bg-white",
  "bg-black",
  "border-white",
  "border-black",
];

// Matches raw hex colors like #fff, #ffffff, #ffffff00 inside source.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(tsx?|css)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file: string): string {
  return path.relative(srcDir, file).split(path.sep).join("/");
}

function isAllowed(file: string): boolean {
  const r = rel(file);
  if (r.includes(".test.")) return true;
  return ALLOWED.some((a) => r.startsWith(a) || r === a || r.includes("/" + a));
}

describe("design tokens stay token-driven", () => {
  const files = listSourceFiles(srcDir).filter((f) => !isAllowed(f));

  it("has source files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("does not use hardcoded light/dark color utility classes", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        for (const cls of FORBIDDEN_CLASSES) {
          // Match the utility class possibly with an opacity modifier
          // (e.g. text-white/70) and word boundaries to avoid partial hits.
          const re = new RegExp(`(?<![\\w-])${cls}(/[0-9]+)?(?![\\w-])`);
          if (re.test(line)) {
            offenders.push(`${rel(file)}:${i + 1}  ${cls}`);
          }
        }
      });
    }
    expect(
      offenders,
      `Use semantic tokens (e.g. text-foreground, bg-background, bg-card) instead of hardcoded colors. ` +
        `If a surface is intentionally a fixed dark brand surface, add it to the ALLOWED list in this test.\n` +
        offenders.join("\n"),
    ).toEqual([]);
  });

  it("does not use raw hex color literals", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (HEX_RE.test(line)) {
          offenders.push(`${rel(file)}:${i + 1}  ${line.trim().slice(0, 80)}`);
        }
      });
    }
    expect(
      offenders,
      `Use HSL design tokens from index.css instead of raw hex colors.\n` +
        offenders.join("\n"),
    ).toEqual([]);
  });
});
