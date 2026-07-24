import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";

import {
  CivicHelperProvider,
  useCivicHelper,
  type GuideContents,
} from "@/components/helper/CivicHelperContext";

function HelperProbe() {
  const helper = useCivicHelper();

  return (
    <div>
      <button onClick={helper.openAssistant}>Apri assistente</button>
      <button onClick={helper.openIntro}>Apri introduzione</button>
      <button onClick={helper.dismissWelcome}>Chiudi introduzione</button>
      <output data-testid="assistant-open">
        {String(helper.assistantOpen)}
      </output>
      <output data-testid="welcome-open">{String(helper.welcomeOpen)}</output>
      <output data-testid="guide-loading">{String(helper.guideLoading)}</output>
      <output data-testid="guide-version">
        {helper.guideContents?.version ?? "nessuna"}
      </output>
    </div>
  );
}

function renderHelper() {
  return render(
    <WouterRouter>
      <CivicHelperProvider>
        <HelperProbe />
      </CivicHelperProvider>
    </WouterRouter>,
  );
}

function guideResponse(version: string): GuideContents {
  return {
    version,
    sections: [],
    storyChapters: [],
    welcomeHighlights: [],
  };
}

describe("CivicHelperProvider on-demand data", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not request guide data until the introduction is opened", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(guideResponse("2026-07")),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderHelper();

    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apri assistente" }));
    expect(screen.getByTestId("assistant-open")).toHaveTextContent("true");
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apri introduzione" }));
    expect(screen.getByTestId("welcome-open")).toHaveTextContent("true");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/helper/guide");

    await waitFor(() => {
      expect(screen.getByTestId("guide-version")).toHaveTextContent("2026-07");
    });

    fireEvent.click(screen.getByRole("button", { name: "Apri introduzione" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("allows a later introduction open to retry a failed guide request", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporarily unavailable"))
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(guideResponse("retry-ok")),
      });
    vi.stubGlobal("fetch", fetchMock);

    renderHelper();
    fireEvent.click(screen.getByRole("button", { name: "Apri introduzione" }));

    await waitFor(() => {
      expect(screen.getByTestId("guide-loading")).toHaveTextContent("false");
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Chiudi introduzione" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Apri introduzione" }));

    await waitFor(() => {
      expect(screen.getByTestId("guide-version")).toHaveTextContent("retry-ok");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
