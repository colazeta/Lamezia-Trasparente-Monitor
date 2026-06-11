import assert from "node:assert/strict";
import { test } from "node:test";
import {
  productionSmokeChecks,
  REQUIRED_SMOKE_CATEGORIES,
  renderSmokePlan,
  validateSmokePlan,
  type SmokeCheck,
} from "./production-smoke-plan";

test("includes all minimum production smoke categories", () => {
  const categories = new Set(
    productionSmokeChecks.map((check) => check.category),
  );

  for (const category of REQUIRED_SMOKE_CATEGORIES) {
    assert.ok(categories.has(category), `missing category ${category}`);
  }

  assert.equal(validateSmokePlan(productionSmokeChecks, {}).ok, true);
});

test("does not require hardcoded live URLs", () => {
  for (const check of productionSmokeChecks) {
    assert.doesNotMatch(JSON.stringify(check), /https?:\/\//i, check.id);
  }

  const invalidCheck: SmokeCheck = {
    ...productionSmokeChecks[0],
    id: "99-invalid-live-url",
    target: "https://production.example.test/albo",
  };

  const validation = validateSmokePlan(
    [...productionSmokeChecks, invalidCheck],
    {},
  );

  assert.equal(validation.ok, false);
  assert.match(validation.failures.join("\n"), /hardcoded live URL/);
});

test("does not request or print secret-like environment variables", () => {
  const invalidCheck: SmokeCheck = {
    ...productionSmokeChecks[0],
    id: "99-invalid-secret",
    requiredEnv: ["API_TOKEN"],
  };

  const validation = validateSmokePlan(
    [...productionSmokeChecks, invalidCheck],
    {
      API_TOKEN: "super-secret-value",
    },
  );
  const rendered = renderSmokePlan({
    env: {
      API_BASE_URL: "https://redacted-by-test.invalid",
      PUBLIC_BASE_URL: "https://redacted-by-test.invalid",
    },
  });

  assert.equal(validation.ok, false);
  assert.match(
    validation.failures.join("\n"),
    /secret-like environment variable API_TOKEN/,
  );
  assert.doesNotMatch(rendered, /super-secret-value|redacted-by-test\.invalid/);
  assert.match(rendered, /API_BASE_URL: set/);
});

test("keeps smoke checks ordered and deterministic", () => {
  const ids = productionSmokeChecks.map((check) => check.id);
  const sortedIds = [...ids].sort((left, right) => left.localeCompare(right));

  assert.deepEqual(ids, sortedIds);

  const validation = validateSmokePlan(
    [
      productionSmokeChecks[1],
      productionSmokeChecks[0],
      ...productionSmokeChecks.slice(2),
    ],
    {},
  );

  assert.equal(validation.ok, false);
  assert.match(validation.failures.join("\n"), /ordered deterministically/);
});

test("requires readable failure reasons", () => {
  const invalidCheck: SmokeCheck = {
    ...productionSmokeChecks[0],
    id: "99-invalid-failure-reason",
    failureReason: "   ",
  };

  const validation = validateSmokePlan(
    [...productionSmokeChecks, invalidCheck],
    {},
  );

  assert.equal(validation.ok, false);
  assert.match(validation.failures.join("\n"), /readable failure reason/);
});
