import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";

const STORAGE_KEY = "rlt-theme";

function ThemeProbe() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>
        toggle
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        set dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        set light
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light when no preference is stored", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("reads the persisted theme from localStorage on mount", () => {
    window.localStorage.setItem(STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles between light and dark and persists the choice", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    act(() => {
      screen.getByTestId("toggle").click();
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");

    act(() => {
      screen.getByTestId("toggle").click();
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("setTheme writes the explicit value to localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByTestId("set-dark").click();
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");

    act(() => {
      screen.getByTestId("set-light").click();
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light");
  });
});
