import { getRepoRoot } from "@/lib/repo-root";

export const CURSOR_MODEL = process.env.CURSOR_MODEL ?? "composer-2.5";

export function getCursorApiKey(): string {
  const key = process.env.CURSOR_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "CURSOR_API_KEY is not set. Create a key at https://cursor.com/dashboard (API Keys) and add it to web/.env.local"
    );
  }
  return key;
}

/** Repo root for local Cursor agent (reads .cursor/ skills and web/data/). */
export function getRepoCwd(): string {
  return getRepoRoot();
}
