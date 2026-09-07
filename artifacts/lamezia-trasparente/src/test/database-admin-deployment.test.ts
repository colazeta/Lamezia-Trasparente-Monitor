import { expect, it } from "vitest";
import { getDatabaseAdminDeployment } from "../lib/databaseAdminDeployment";

it("limits the owner login configuration to the exact canonical HTTPS origin", () => {
  const configuration = getDatabaseAdminDeployment(
    "https://lamezia-trasparente.pages.dev",
  );
  expect(configuration?.publishableKey).toMatch(/^pk_test_/);
  expect(configuration?.apiBaseUrl).toBe(
    "https://lamezia-trasparente-api.onrender.com",
  );
  for (const origin of [
    "",
    "http://localhost:8081",
    "http://lamezia-trasparente.pages.dev",
    "https://preview.lamezia-trasparente.pages.dev",
    "https://lamezia-trasparente.pages.dev.attacker.example",
  ])
    expect(getDatabaseAdminDeployment(origin)).toBeNull();
});
