import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_change_drivers_test";

async function helpers() {
  return import("./demographicChangeDrivers");
}

const base = {
  period: "2025",
  births: 100,
  deaths: 120,
  internalIn: 50,
  internalOut: 70,
  foreignIn: 40,
  foreignOut: 10,
  otherIn: 8,
  otherOut: 3,
  statisticalAdjustment: null,
  coverageAdjustment: null,
  populationStart: 1000,
};

describe("status-aware demographic reconciliation", () => {
  it("ignores other-reason flows in a provisional annual population", async () => {
    const { reconcileChangeDriverPoint } = await helpers();
    const point = reconcileChangeDriverPoint({
      ...base,
      populationEnd: 990,
      sourceStatus: "provisional",
    });
    // Natural -20, internal -20, foreign +30 => -10. Other reasons +5 are
    // published but do not enter the provisional population calculation.
    expect(point.otherBalance).toBe(5);
    expect(point.accountedChange).toBe(-10);
    expect(point.observedChange).toBe(-10);
    expect(point.reconciliation).toBe("exact");
  });

  it("adds statistical adjustment only for a final annual release", async () => {
    const { reconcileChangeDriverPoint } = await helpers();
    const point = reconcileChangeDriverPoint({
      ...base,
      statisticalAdjustment: -5,
      populationEnd: 985,
      sourceStatus: "final",
    });
    expect(point.accountedChange).toBe(-15);
    expect(point.observedChange).toBe(-15);
    expect(point.reconciliation).toBe("exact");
  });

  it("exposes a mismatch instead of hiding an unexplained residual", async () => {
    const { reconcileChangeDriverPoint } = await helpers();
    const point = reconcileChangeDriverPoint({
      ...base,
      populationEnd: 970,
      sourceStatus: "provisional",
    });
    expect(point.accountedChange).toBe(-10);
    expect(point.observedChange).toBe(-30);
    expect(point.residual).toBe(-20);
    expect(point.reconciliation).toBe("mismatch");
  });
});
