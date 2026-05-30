import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { PAGES, renderPage, applyTheme } from "./pages-harness";

describe("pages render without errors in both themes", () => {
  let consoleError: Mock;
  let originalError: typeof console.error;

  beforeEach(() => {
    originalError = console.error;
    consoleError = vi.fn();
    console.error = consoleError as unknown as typeof console.error;
  });

  afterEach(() => {
    console.error = originalError;
    window.localStorage.clear();
  });

  for (const theme of ["light", "dark"] as const) {
    describe(`${theme} mode`, () => {
      beforeEach(() => {
        applyTheme(theme);
      });

      for (const [name, Page] of PAGES) {
        it(`${name} renders`, () => {
          const { queryByTestId } = renderPage(Page);
          expect(
            queryByTestId("render-error"),
            `${name} threw while rendering in ${theme} mode`,
          ).toBeNull();
          // The theme class must be applied to the document root.
          expect(document.documentElement.classList.contains("dark")).toBe(
            theme === "dark",
          );
        });
      }
    });
  }
});
