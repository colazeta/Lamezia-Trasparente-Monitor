import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cssPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "index.css",
);
const css = fs.readFileSync(cssPath, "utf8");

type Hsl = [number, number, number];

function parseTokens(blockRe: RegExp): Record<string, Hsl> {
  const match = css.match(blockRe);
  const tokens: Record<string, Hsl> = {};
  if (!match) return tokens;
  for (const line of match[1].split("\n")) {
    const m = line.match(
      /--([a-z0-9-]+):\s*([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%\s*;/i,
    );
    if (m) {
      tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
    }
  }
  return tokens;
}

function hslToRgb([h, s, l]: Hsl): [number, number, number] {
  const sN = s / 100;
  const lN = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) =>
    lN - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

function relativeLuminance(hsl: Hsl): number {
  const [r, g, b] = hslToRgb(hsl).map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: Hsl, bg: Hsl): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const light = parseTokens(/:root\s*\{([\s\S]*?)\n\}/);
const dark = parseTokens(/\.dark\s*\{([\s\S]*?)\n\}/);

// WCAG AA: 4.5:1 for normal body text.
const NORMAL_TEXT_PAIRS: Array<[string, string]> = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["primary-foreground", "primary"],
  ["warning-foreground", "warning"],
  ["sidebar-foreground", "sidebar"],
];

// WCAG AA: 3:1 for large/bold text & UI components. These tokens back
// badges, pills, primary CTAs and chart fills that always use large bold
// type, so the large-text threshold is the applicable criterion.
const LARGE_TEXT_PAIRS: Array<[string, string]> = [
  ["brand-foreground", "brand"],
  ["success-foreground", "success"],
  ["destructive-foreground", "destructive"],
  ["sidebar-primary-foreground", "sidebar-primary"],
];

describe("WCAG AA contrast", () => {
  it("parses tokens for both themes", () => {
    expect(Object.keys(light).length).toBeGreaterThan(10);
    expect(Object.keys(dark).length).toBeGreaterThan(10);
  });

  for (const [themeName, tokens] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    describe(`${themeName} theme`, () => {
      for (const [fg, bg] of NORMAL_TEXT_PAIRS) {
        it(`${fg} on ${bg} meets AA (>= 4.5:1)`, () => {
          expect(tokens[fg], `missing token --${fg}`).toBeDefined();
          expect(tokens[bg], `missing token --${bg}`).toBeDefined();
          const ratio = contrast(tokens[fg], tokens[bg]);
          expect(
            ratio,
            `${fg}/${bg} in ${themeName} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(4.5);
        });
      }

      for (const [fg, bg] of LARGE_TEXT_PAIRS) {
        it(`${fg} on ${bg} meets AA large text (>= 3:1)`, () => {
          expect(tokens[fg], `missing token --${fg}`).toBeDefined();
          expect(tokens[bg], `missing token --${bg}`).toBeDefined();
          const ratio = contrast(tokens[fg], tokens[bg]);
          expect(
            ratio,
            `${fg}/${bg} in ${themeName} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(3);
        });
      }
    });
  }
});
