import path from "path";

/** DichThuat repo root (parent of web/). */
export function getRepoRoot(): string {
  return process.env.REPO_ROOT ?? path.resolve(process.cwd(), "..");
}

export function resolveRepoPath(...segments: string[]): string {
  return path.join(getRepoRoot(), ...segments);
}
