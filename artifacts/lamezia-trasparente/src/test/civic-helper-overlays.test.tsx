import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const helperState = vi.hoisted(() => ({
  assistantOpen: false,
  welcomeOpen: false,
}));

vi.mock("@/components/helper/CivicHelperContext", () => ({
  useCivicHelper: () => helperState,
}));

vi.mock("@/components/helper/CivicAssistant", () => ({
  CivicAssistant: () => <div data-testid="lazy-assistant" />,
}));

vi.mock("@/components/helper/CivicWelcome", () => ({
  CivicWelcome: () => <div data-testid="lazy-welcome" />,
}));

import { CivicHelperOverlays } from "@/components/helper/CivicHelperOverlays";

describe("CivicHelperOverlays", () => {
  beforeEach(() => {
    helperState.assistantOpen = false;
    helperState.welcomeOpen = false;
  });

  it("renders no lazy overlay while the helper is closed", () => {
    render(<CivicHelperOverlays />);

    expect(screen.queryByTestId("lazy-assistant")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lazy-welcome")).not.toBeInTheDocument();
  });

  it("loads only the requested assistant overlay", async () => {
    helperState.assistantOpen = true;
    render(<CivicHelperOverlays />);

    expect(await screen.findByTestId("lazy-assistant")).toBeInTheDocument();
    expect(screen.queryByTestId("lazy-welcome")).not.toBeInTheDocument();
  });

  it("loads only the requested introduction overlay", async () => {
    helperState.welcomeOpen = true;
    render(<CivicHelperOverlays />);

    expect(await screen.findByTestId("lazy-welcome")).toBeInTheDocument();
    expect(screen.queryByTestId("lazy-assistant")).not.toBeInTheDocument();
  });
});
