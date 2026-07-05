import { describe, it, expect, afterEach } from "vitest";
import axe, { type Result, type RunOptions } from "axe-core";
import { PAGES, renderPage, applyTheme } from "./pages-harness";

/**
 * Automated accessibility audit. Each page is rendered (in light and dark mode)
 * and run through axe-core to catch the structural a11y regressions the other
 * suites do not: form inputs without labels, images without alt text, buttons /
 * links without accessible names, ARIA misuse, and similar. We assert there are
 * no `serious` or `critical` violations.
 *
 * Color contrast is covered exhaustively by `contrast.test.ts` against the
 * design tokens, and axe's `color-contrast` rule cannot run reliably in jsdom
 * (no real layout / canvas), so it is disabled here to avoid false negatives.
 */

const IMPACT_THRESHOLD: Array<Result["impact"]> = ["serious", "critical"];
const ACCESSIBILITY_TEST_TIMEOUT_MS = 60_000;

/**
 * Documented allowlist of axe rule IDs to skip. Keep this empty unless there is
 * an intentional, justified exception — add the rule id with a comment saying
 * why. Anything left here is a known, accepted trade-off, not a silent pass.
 */
const ALLOWED_RULES: string[] = [
  // (none currently)
];

const RUN_OPTIONS: RunOptions = {
  // Restrict to the impact levels we gate on; keeps results focused.
  resultTypes: ["violations"],
  rules: {
    // Covered by contrast.test.ts; unreliable in jsdom.
    "color-contrast": { enabled: false },
    // Disable any explicitly allowlisted rules.
    ...Object.fromEntries(
      ALLOWED_RULES.map((id) => [id, { enabled: false }]),
    ),
  },
};

function formatViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => `      - ${n.html}\n        ${n.failureSummary ?? ""}`)
        .join("\n");
      return `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
    })
    .join("\n\n");
}

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe.sequential("pages have no serious/critical accessibility violations", () => {
  for (const theme of ["light", "dark"] as const) {
    describe.sequential(`${theme} mode`, () => {
      for (const [name, Page] of PAGES) {
        it.sequential(`${name} is accessible`, async () => {
          applyTheme(theme);
          const { container } = renderPage(Page);

          const results = await axe.run(container, RUN_OPTIONS);
          const blocking = results.violations.filter((v) =>
            IMPACT_THRESHOLD.includes(v.impact),
          );

          expect(
            blocking,
            `${name} (${theme} mode) has accessibility violations:\n\n${formatViolations(
              blocking,
            )}`,
          ).toEqual([]);
        }, ACCESSIBILITY_TEST_TIMEOUT_MS);
      }
    });
  }
});
