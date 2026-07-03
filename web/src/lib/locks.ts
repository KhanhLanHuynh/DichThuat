import fs from "fs/promises";
import path from "path";
import { resolveRepoPath } from "./repo-root";

export interface LockInfo {
  user: string;
  since: string;
  projectId: string;
}

const LOCK_TTL_MS = 30 * 60 * 1000; // 30 minutes

function lockPath(projectId: string): string {
  return resolveRepoPath(".locks", `${projectId}.lock`);
}

export async function acquireLock(
  projectId: string,
  user: string
): Promise<{ ok: true } | { ok: false; holder: LockInfo }> {
  const existing = await getLock(projectId);
  if (existing && existing.user !== user && !isExpired(existing)) {
    return { ok: false, holder: existing };
  }
  const info: LockInfo = {
    user,
    since: new Date().toISOString(),
    projectId,
  };
  const file = lockPath(projectId);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(info, null, 2), "utf-8");
  return { ok: true };
}

export async function releaseLock(
  projectId: string,
  user: string
): Promise<void> {
  const existing = await getLock(projectId);
  if (existing?.user === user) {
    try {
      await fs.unlink(lockPath(projectId));
    } catch {
      /* ignore */
    }
  }
}

export async function getLock(projectId: string): Promise<LockInfo | null> {
  try {
    const raw = await fs.readFile(lockPath(projectId), "utf-8");
    const info = JSON.parse(raw) as LockInfo;
    if (isExpired(info)) {
      await fs.unlink(lockPath(projectId)).catch(() => {});
      return null;
    }
    return info;
  } catch {
    return null;
  }
}

function isExpired(lock: LockInfo): boolean {
  return Date.now() - new Date(lock.since).getTime() > LOCK_TTL_MS;
}
