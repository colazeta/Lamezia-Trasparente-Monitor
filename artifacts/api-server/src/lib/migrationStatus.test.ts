import { describe, expect, it } from "vitest";
import { MigrationError, type MigrationStatus } from "@workspace/db";
import { buildMigrationAlertEmail } from "./migrationStatus";

/**
 * The migration alert exists to actively notify the team when a deploy left the
 * database behind. These tests pin the contract the task cares about: the alert
 * names the detected state and the affected migration(s), reusing the existing
 * MigrationStatus / MigrationError payload.
 */
describe("buildMigrationAlertEmail", () => {
  it("names the pending migrations and the 'pending' state when the DB is behind", () => {
    const status: MigrationStatus = {
      trackingPresent: true,
      appliedCount: 2,
      journalCount: 4,
      lastAppliedTag: "0001_existing",
      pendingTags: ["0002_new_table", "0003_add_column"],
    };

    const email = buildMigrationAlertEmail({ kind: "pending", status });

    expect(email.subject).toContain("2 migrazione/i in sospeso");
    for (const text of [email.html, email.text]) {
      expect(text).toContain("pending");
      expect(text).toContain("0002_new_table");
      expect(text).toContain("0003_add_column");
      expect(text).toContain("0001_existing");
    }
    expect(email.logFields).toMatchObject({
      state: "pending",
      pendingMigrations: status.pendingTags,
      lastAppliedMigration: "0001_existing",
    });
  });

  it("names the detected state, failed phase and rolled-back migrations when the run aborts", () => {
    const error = new MigrationError(
      "migrate",
      "tracked",
      ["0002_new_table", "0003_broken"],
      {
        trackingPresent: true,
        appliedCount: 1,
        journalCount: 3,
        lastAppliedTag: "0001_existing",
        pendingTags: ["0002_new_table", "0003_broken"],
      },
      new Error('relation "does_not_exist" does not exist'),
    );

    const email = buildMigrationAlertEmail({ kind: "aborted", error });

    expect(email.subject).toContain("fase migrate");
    for (const text of [email.html, email.text]) {
      expect(text).toContain("tracked");
      expect(text).toContain("migrate");
      expect(text).toContain("0002_new_table");
      expect(text).toContain("0003_broken");
      expect(text).toContain("does_not_exist");
    }
    expect(email.logFields).toMatchObject({
      state: "aborted",
      phase: "migrate",
      detectedState: "tracked",
      pendingMigrations: ["0002_new_table", "0003_broken"],
    });
  });

  it("escapes untrusted error text in the HTML body", () => {
    const email = buildMigrationAlertEmail({
      kind: "failed",
      error: new Error("<script>boom</script>"),
    });

    expect(email.html).not.toContain("<script>boom</script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.text).toContain("<script>boom</script>");
    expect(email.logFields).toMatchObject({ state: "failed" });
  });
});
