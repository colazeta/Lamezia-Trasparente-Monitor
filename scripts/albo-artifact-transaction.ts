import { constants } from "node:fs";
import {
  copyFile,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const TRANSACTION_DIRECTORY = ".albo-publication-transaction";
const JOURNAL_FILE = "journal.json";
const JOURNAL_SCHEMA_VERSION = "albo-artifact-transaction.v1";

export interface AlboArtifactWrite {
  target: string;
  contents: string | Uint8Array;
}

export type AlboPromotionEvent =
  | { type: "promoted"; target: string; index: number }
  | { type: "revoked"; target: string; index: number }
  | { type: "committed" }
  | { type: "rollback_write"; target: string; index: number }
  | { type: "rollback_revocation"; target: string; index: number }
  | { type: "cleanup" };

export interface AlboPromotionHooks {
  afterMutation?: (event: AlboPromotionEvent) => void | Promise<void>;
  beforeRollbackMutation?: (
    event: Extract<
      AlboPromotionEvent,
      { type: "rollback_write" | "rollback_revocation" }
    >,
  ) => void | Promise<void>;
  beforeCleanup?: () => void | Promise<void>;
}

export interface AlboPromotionOptions {
  outDir: string;
  hooks?: AlboPromotionHooks;
}

export interface AlboPromotionResult {
  committed: true;
  cleanup_pending: boolean;
}

interface TransactionWrite {
  target: string;
  staged: string;
  backup: string | null;
  had_target: boolean;
}

interface TransactionRevocation {
  target: string;
  quarantine: string;
}

interface TransactionJournal {
  schema_version: typeof JOURNAL_SCHEMA_VERSION;
  owner_pid: number;
  phase: "staging" | "prepared" | "committed" | "rollback_failed";
  writes: TransactionWrite[];
  revocations: TransactionRevocation[];
}

export async function promoteAlboArtifactBatch(
  writes: AlboArtifactWrite[],
  revocations: string[],
  options: AlboPromotionOptions,
): Promise<AlboPromotionResult> {
  const outDir = path.resolve(options.outDir);
  await ensureOutDirSafe(outDir);
  await recoverAlboArtifactTransaction(outDir);

  const targets = writes.map(({ target }) =>
    relativeTarget(outDir, target, "write"),
  );
  if (new Set(targets).size !== targets.length) {
    throw new Error("Duplicate target in Albo artifact promotion batch");
  }
  const revocationTargets = [
    ...new Set(
      revocations.map((target) => relativeTarget(outDir, target, "revocation")),
    ),
  ];
  if (revocationTargets.some((target) => targets.includes(target))) {
    throw new Error("Albo artifact cannot be written and revoked in one batch");
  }

  const transactionRoot = transactionDirectory(outDir);
  await mkdir(transactionRoot, { mode: 0o700 });
  let journalWritten = false;
  let journal: TransactionJournal | null = {
    schema_version: JOURNAL_SCHEMA_VERSION,
    owner_pid: process.pid,
    phase: "staging",
    writes: [],
    revocations: [],
  };
  let postCommitError: unknown = null;
  try {
    await writeJournal(transactionRoot, journal);
    journalWritten = true;
    await Promise.all([
      mkdir(path.join(transactionRoot, "stage")),
      mkdir(path.join(transactionRoot, "backup")),
      mkdir(path.join(transactionRoot, "revoked")),
      mkdir(path.join(transactionRoot, "restore")),
    ]);

    const preparedWrites: TransactionWrite[] = [];
    for (let index = 0; index < writes.length; index += 1) {
      const write = writes[index];
      const target = targets[index];
      if (!write || !target) continue;
      const targetPath = absoluteTarget(outDir, target);
      await ensureSafeTargetParent(outDir, targetPath);
      const existing = await optionalLstat(targetPath);
      if (existing && (existing.isSymbolicLink() || !existing.isFile())) {
        throw new Error(`Unsafe Albo artifact target leaf: ${targetPath}`);
      }
      if (existing) await assertRealPathWithin(outDir, targetPath);

      const staged = `stage/${index}`;
      const stagedPath = path.join(transactionRoot, staged);
      await writeFile(stagedPath, write.contents, { flag: "wx", mode: 0o600 });
      await syncFile(stagedPath);

      const backup = existing ? `backup/${index}` : null;
      if (backup) {
        await createBackup(targetPath, path.join(transactionRoot, backup));
      }
      preparedWrites.push({
        target,
        staged,
        backup,
        had_target: Boolean(existing),
      });
    }

    const preparedRevocations: TransactionRevocation[] = [];
    for (let index = 0; index < revocationTargets.length; index += 1) {
      const target = revocationTargets[index];
      if (!target) continue;
      const targetPath = absoluteTarget(outDir, target);
      await ensureSafeTargetParent(outDir, targetPath);
      const existing = await optionalLstat(targetPath);
      if (existing && (existing.isSymbolicLink() || !existing.isFile())) {
        throw new Error(`Unsafe Albo revocation target leaf: ${targetPath}`);
      }
      if (existing) await assertRealPathWithin(outDir, targetPath);
      preparedRevocations.push({
        target,
        quarantine: `revoked/${index}`,
      });
    }

    await Promise.all([
      syncDirectory(path.join(transactionRoot, "stage")),
      syncDirectory(path.join(transactionRoot, "backup")),
      syncDirectory(path.join(transactionRoot, "revoked")),
      syncDirectory(transactionRoot),
    ]);

    journal = {
      schema_version: JOURNAL_SCHEMA_VERSION,
      owner_pid: process.pid,
      phase: "prepared",
      writes: preparedWrites,
      revocations: preparedRevocations,
    };
    await writeJournal(transactionRoot, journal);

    for (let index = 0; index < journal.writes.length; index += 1) {
      const entry = journal.writes[index];
      if (!entry) continue;
      const targetPath = absoluteTarget(outDir, entry.target);
      await assertSafeTargetBeforeMutation(outDir, targetPath, true);
      await rename(path.join(transactionRoot, entry.staged), targetPath);
      await syncFile(targetPath);
      await syncDirectory(path.dirname(targetPath));
      await options.hooks?.afterMutation?.({
        type: "promoted",
        target: targetPath,
        index,
      });
    }

    for (let index = 0; index < journal.revocations.length; index += 1) {
      const entry = journal.revocations[index];
      if (!entry) continue;
      const targetPath = absoluteTarget(outDir, entry.target);
      const existing = await optionalLstat(targetPath);
      if (!existing) continue;
      await assertSafeTargetBeforeMutation(outDir, targetPath, false);
      await rename(targetPath, path.join(transactionRoot, entry.quarantine));
      await Promise.all([
        syncDirectory(path.dirname(targetPath)),
        syncDirectory(path.join(transactionRoot, "revoked")),
      ]);
      await options.hooks?.afterMutation?.({
        type: "revoked",
        target: targetPath,
        index,
      });
    }

    journal.phase = "committed";
    await writeJournal(transactionRoot, journal);
    await options.hooks?.afterMutation?.({ type: "committed" });
  } catch (error) {
    if (journal?.phase === "committed") {
      postCommitError = error;
    } else {
      if (!journalWritten || !journal) {
        const cleanupErrors = await bestEffortCleanup(transactionRoot);
        if (cleanupErrors.length > 0) {
          throw new AggregateError(
            [error, ...cleanupErrors],
            "Albo artifact staging and cleanup failed",
          );
        }
        throw error;
      }

      const rollbackErrors = await rollbackPreparedTransaction(
        outDir,
        transactionRoot,
        journal,
        options.hooks,
      );
      if (rollbackErrors.length > 0) {
        journal.phase = "rollback_failed";
        try {
          await writeJournal(transactionRoot, journal);
        } catch (journalError) {
          rollbackErrors.push(journalError);
        }
        throw new AggregateError(
          [error, ...rollbackErrors],
          "Albo artifact promotion and rollback failed",
        );
      }
      const cleanupErrors = await bestEffortCleanup(transactionRoot);
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          "Albo artifact promotion rolled back but cleanup failed",
        );
      }
      throw error;
    }
  }

  let cleanupPending = false;
  if (postCommitError) {
    console.warn(
      `Albo artifact publication committed despite a post-commit hook error: ${errorMessage(postCommitError)}`,
    );
  }
  try {
    await options.hooks?.beforeCleanup?.();
    const cleanupErrors = await bestEffortCleanup(transactionRoot);
    if (cleanupErrors.length > 0) throw cleanupErrors[0];
    await options.hooks?.afterMutation?.({ type: "cleanup" });
  } catch (error) {
    cleanupPending = true;
    console.warn(
      `Albo artifact publication committed; transaction cleanup will be retried: ${errorMessage(error)}`,
    );
  }
  return { committed: true, cleanup_pending: cleanupPending };
}

export async function recoverAlboArtifactTransaction(
  outDirInput: string,
): Promise<void> {
  const outDir = path.resolve(outDirInput);
  await ensureOutDirSafe(outDir);
  const transactionRoot = transactionDirectory(outDir);
  const rootEntry = await optionalLstat(transactionRoot);
  if (!rootEntry) return;
  if (rootEntry.isSymbolicLink() || !rootEntry.isDirectory()) {
    throw new Error(`Unsafe Albo transaction directory: ${transactionRoot}`);
  }
  await assertRealPathWithin(outDir, transactionRoot);

  let journalRaw: string;
  try {
    journalRaw = await readFile(
      path.join(transactionRoot, JOURNAL_FILE),
      "utf8",
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        "Albo artifact transaction exists without a recovery journal",
        { cause: error },
      );
    }
    throw new Error(`Cannot read Albo artifact transaction journal`, {
      cause: error,
    });
  }

  const journal = parseJournal(journalRaw, outDir, transactionRoot);
  if (journal.phase !== "committed" && isProcessAlive(journal.owner_pid)) {
    throw new Error(
      `Another Albo artifact transaction is active (pid ${journal.owner_pid})`,
    );
  }

  if (journal.phase === "staging") {
    const cleanupErrors = await bestEffortCleanup(transactionRoot);
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        cleanupErrors,
        "Cannot clean interrupted Albo artifact staging",
      );
    }
    return;
  }

  if (journal.phase === "committed") {
    const cleanupErrors = await bestEffortCleanup(transactionRoot);
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        cleanupErrors,
        "Cannot finish committed Albo artifact transaction cleanup",
      );
    }
    return;
  }

  const rollbackErrors = await rollbackPreparedTransaction(
    outDir,
    transactionRoot,
    journal,
  );
  if (rollbackErrors.length > 0) {
    throw new AggregateError(
      rollbackErrors,
      "Cannot recover interrupted Albo artifact transaction",
    );
  }
  const cleanupErrors = await bestEffortCleanup(transactionRoot);
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "Recovered Albo artifact transaction but cleanup failed",
    );
  }
}

export function alboArtifactTransactionJournalPath(outDir: string): string {
  return path.join(transactionDirectory(path.resolve(outDir)), JOURNAL_FILE);
}

async function rollbackPreparedTransaction(
  outDir: string,
  transactionRoot: string,
  journal: TransactionJournal,
  hooks?: AlboPromotionHooks,
): Promise<unknown[]> {
  const errors: unknown[] = [];
  try {
    await assertTransactionDirectory(transactionRoot, "backup", true);
    await assertTransactionDirectory(transactionRoot, "revoked", true);
    await assertTransactionDirectory(transactionRoot, "restore", false);
  } catch (error) {
    errors.push(error);
  }
  for (let index = journal.revocations.length - 1; index >= 0; index -= 1) {
    const entry = journal.revocations[index];
    if (!entry) continue;
    const quarantine = path.join(transactionRoot, entry.quarantine);
    try {
      const quarantined = await optionalLstat(quarantine);
      if (!quarantined) continue;
      if (quarantined.isSymbolicLink() || !quarantined.isFile()) {
        throw new Error(`Unsafe quarantined Albo artifact: ${quarantine}`);
      }
      await assertRealPathWithin(transactionRoot, quarantine);
      const target = absoluteTarget(outDir, entry.target);
      await ensureSafeTargetParent(outDir, target);
      await hooks?.beforeRollbackMutation?.({
        type: "rollback_revocation",
        target,
        index,
      });
      await rename(quarantine, target);
      await syncDirectory(path.dirname(target));
    } catch (error) {
      errors.push(error);
    }
  }

  for (let index = journal.writes.length - 1; index >= 0; index -= 1) {
    const entry = journal.writes[index];
    if (!entry) continue;
    const target = absoluteTarget(outDir, entry.target);
    try {
      await ensureSafeTargetParent(outDir, target);
      await hooks?.beforeRollbackMutation?.({
        type: "rollback_write",
        target,
        index,
      });
      if (entry.had_target) {
        if (!entry.backup) {
          throw new Error(`Missing backup descriptor for ${target}`);
        }
        const backup = path.join(transactionRoot, entry.backup);
        const backupEntry = await optionalLstat(backup);
        if (
          !backupEntry ||
          backupEntry.isSymbolicLink() ||
          !backupEntry.isFile()
        ) {
          throw new Error(`Missing or unsafe Albo artifact backup: ${backup}`);
        }
        await assertRealPathWithin(transactionRoot, backup);
        await assertTransactionDirectory(transactionRoot, "restore", true);
        const restore = path.join(transactionRoot, "restore", String(index));
        await unlinkIfPresent(restore);
        await copyFile(backup, restore, constants.COPYFILE_EXCL);
        await syncFile(restore);
        await rename(restore, target);
        await syncDirectory(path.dirname(target));
      } else {
        await unlinkIfPresent(target);
        await syncDirectory(path.dirname(target));
      }
    } catch (error) {
      errors.push(error);
    }
  }
  return errors;
}

async function createBackup(
  source: string,
  destination: string,
): Promise<void> {
  try {
    await link(source, destination);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (
      !code ||
      !["EXDEV", "EPERM", "EACCES", "ENOSYS", "ENOTSUP", "EOPNOTSUPP"].includes(
        code,
      )
    ) {
      throw error;
    }
    await copyFile(source, destination, constants.COPYFILE_EXCL);
  }
  await syncFile(destination);
  await syncDirectory(path.dirname(destination));
}

async function writeJournal(
  transactionRoot: string,
  journal: TransactionJournal,
): Promise<void> {
  const journalPath = path.join(transactionRoot, JOURNAL_FILE);
  const temporary = path.join(transactionRoot, `${JOURNAL_FILE}.tmp`);
  await writeFile(temporary, `${JSON.stringify(journal, null, 2)}\n`, {
    mode: 0o600,
  });
  await syncFile(temporary);
  await rename(temporary, journalPath);
  await syncFile(journalPath);
  await syncDirectory(transactionRoot);
}

function parseJournal(
  raw: string,
  outDir: string,
  transactionRoot: string,
): TransactionJournal {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error("Invalid JSON in Albo artifact transaction journal", {
      cause: error,
    });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid Albo artifact transaction journal schema");
  }
  const journal = parsed as Record<string, unknown>;
  if (
    journal.schema_version !== JOURNAL_SCHEMA_VERSION ||
    !Number.isSafeInteger(journal.owner_pid) ||
    !["staging", "prepared", "committed", "rollback_failed"].includes(
      String(journal.phase),
    ) ||
    !Array.isArray(journal.writes) ||
    !Array.isArray(journal.revocations)
  ) {
    throw new Error("Invalid Albo artifact transaction journal schema");
  }
  const writes = journal.writes.map((value) => {
    const entry = journalObject(value);
    const target = journalRelativePath(entry.target, outDir);
    const staged = transactionRelativePath(
      entry.staged,
      transactionRoot,
      "stage",
    );
    const backup =
      entry.backup === null
        ? null
        : transactionRelativePath(entry.backup, transactionRoot, "backup");
    if (
      typeof entry.had_target !== "boolean" ||
      entry.had_target !== Boolean(backup)
    ) {
      throw new Error("Invalid Albo artifact transaction write descriptor");
    }
    return { target, staged, backup, had_target: entry.had_target };
  });
  const revocations = journal.revocations.map((value) => {
    const entry = journalObject(value);
    return {
      target: journalRelativePath(entry.target, outDir),
      quarantine: transactionRelativePath(
        entry.quarantine,
        transactionRoot,
        "revoked",
      ),
    };
  });
  if (new Set(writes.map((entry) => entry.target)).size !== writes.length) {
    throw new Error("Duplicate target in Albo artifact transaction journal");
  }
  if (
    new Set(revocations.map((entry) => entry.target)).size !==
      revocations.length ||
    revocations.some((entry) =>
      writes.some((write) => write.target === entry.target),
    )
  ) {
    throw new Error(
      "Invalid revocation targets in Albo artifact transaction journal",
    );
  }
  return {
    schema_version: JOURNAL_SCHEMA_VERSION,
    owner_pid: journal.owner_pid as number,
    phase: journal.phase as TransactionJournal["phase"],
    writes,
    revocations,
  };
}

function journalObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid Albo artifact transaction journal entry");
  }
  return value as Record<string, unknown>;
}

function journalRelativePath(value: unknown, outDir: string): string {
  if (typeof value !== "string" || path.isAbsolute(value)) {
    throw new Error("Invalid target path in Albo artifact transaction journal");
  }
  const absolute = path.resolve(outDir, value);
  const relative = relativeTarget(outDir, absolute, "journal");
  if (relative !== path.normalize(value)) {
    throw new Error(
      "Non-normalized target path in Albo artifact transaction journal",
    );
  }
  return relative;
}

function transactionRelativePath(
  value: unknown,
  transactionRoot: string,
  expectedDirectory: "stage" | "backup" | "revoked",
): string {
  if (typeof value !== "string") {
    throw new Error(
      "Invalid internal path in Albo artifact transaction journal",
    );
  }
  const normalized = value.replace(/\\/gu, "/");
  if (!new RegExp(`^${expectedDirectory}/[0-9]+$`, "u").test(normalized)) {
    throw new Error(
      "Unsafe internal path in Albo artifact transaction journal",
    );
  }
  const absolute = path.resolve(transactionRoot, normalized);
  const relative = path.relative(transactionRoot, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Internal transaction path escapes its root");
  }
  return normalized;
}

async function ensureOutDirSafe(outDir: string): Promise<void> {
  await mkdir(outDir, { recursive: true });
  const entry = await lstat(outDir);
  if (entry.isSymbolicLink() || !entry.isDirectory()) {
    throw new Error(`Unsafe Albo output directory: ${outDir}`);
  }
}

async function ensureSafeTargetParent(
  outDir: string,
  target: string,
): Promise<void> {
  const relative = relativeTarget(outDir, target, "target");
  const segments = relative.split(path.sep).slice(0, -1);
  let current = outDir;
  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      await mkdir(current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    const entry = await lstat(current);
    if (entry.isSymbolicLink() || !entry.isDirectory()) {
      throw new Error(
        `Unsafe symlink or non-directory in Albo target path: ${current}`,
      );
    }
  }
  await assertRealPathWithin(outDir, path.dirname(target));
}

async function assertSafeTargetBeforeMutation(
  outDir: string,
  target: string,
  allowMissingLeaf: boolean,
): Promise<void> {
  await ensureSafeTargetParent(outDir, target);
  const entry = await optionalLstat(target);
  if (!entry) {
    if (allowMissingLeaf) return;
    throw Object.assign(new Error(`Missing Albo artifact target: ${target}`), {
      code: "ENOENT",
    });
  }
  if (entry.isSymbolicLink() || !entry.isFile()) {
    throw new Error(`Unsafe symlink or non-file Albo target: ${target}`);
  }
  await assertRealPathWithin(outDir, target);
}

async function assertRealPathWithin(
  root: string,
  candidate: string,
): Promise<void> {
  const [resolvedRoot, resolvedCandidate] = await Promise.all([
    realpath(root),
    realpath(candidate),
  ]);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Albo transaction path escapes output root: ${candidate}`);
  }
}

async function assertTransactionDirectory(
  transactionRoot: string,
  name: "backup" | "revoked" | "restore",
  requireExisting: boolean,
): Promise<void> {
  const directory = path.join(transactionRoot, name);
  let entry = await optionalLstat(directory);
  if (!entry && !requireExisting) {
    await mkdir(directory);
    entry = await lstat(directory);
  }
  if (!entry || entry.isSymbolicLink() || !entry.isDirectory()) {
    throw new Error(
      `Missing or unsafe Albo transaction directory: ${directory}`,
    );
  }
  await assertRealPathWithin(transactionRoot, directory);
}

function relativeTarget(outDir: string, target: string, label: string): string {
  const absolute = path.resolve(target);
  const relative = path.relative(outDir, absolute);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(
      `Unsafe Albo ${label} path outside output directory: ${target}`,
    );
  }
  return relative;
}

function absoluteTarget(outDir: string, relative: string): string {
  return path.resolve(outDir, relative);
}

function transactionDirectory(outDir: string): string {
  return path.join(outDir, TRANSACTION_DIRECTORY);
}

async function optionalLstat(filePath: string) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function unlinkIfPresent(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

async function bestEffortCleanup(transactionRoot: string): Promise<unknown[]> {
  const errors: unknown[] = [];
  try {
    const entry = await optionalLstat(transactionRoot);
    if (!entry) return errors;
    if (entry.isSymbolicLink() || !entry.isDirectory()) {
      throw new Error(
        `Unsafe Albo transaction cleanup target: ${transactionRoot}`,
      );
    }
    await rm(transactionRoot, { recursive: true, force: false });
  } catch (error) {
    errors.push(error);
  }
  return errors;
}

async function syncFile(filePath: string): Promise<void> {
  const handle = await open(filePath, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directory: string): Promise<void> {
  const handle = await open(directory, "r");
  try {
    await handle.sync();
  } catch (error) {
    if (
      !["EINVAL", "ENOTSUP", "EISDIR"].includes(
        (error as NodeJS.ErrnoException).code ?? "",
      )
    ) {
      throw error;
    }
  } finally {
    await handle.close();
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
